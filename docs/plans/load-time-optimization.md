# Load-time optimization — findings & plan

Status: **batch 1 implemented** on `feat/load-time-optimization` (2026-09-02). Original
findings captured 2026-08-24. See [Results](#results-batch-1) below.

## Problem

The production build emits a single monolithic JS chunk with no code-splitting:

```
dist/assets/index-*.js   5,053 kB  (gzip 1,483 kB)
dist/assets/index-*.css    232 kB  (gzip    55 kB)
```

The whole ~1.5 MB gzipped bundle — all 6 argumentation modules, all 5 routes, and every
heavy library — must download and parse before anything renders. This is the main cause of
slow (re)loads.

## Composition (measured via a temporary `manualChunks` split)

It is **not** the modules (≈330 kB total). The weight is a few feature-specific libraries
that load eagerly but are only needed for specific actions:

| Library | ~size (uncompressed) | Imported in | Needed only when |
|---|---|---|---|
| `@hpcc-js/wasm-graphviz` | 820 kB | `src/modules/common/graph-editor/layouting.ts` | user triggers auto-layout |
| codemirror stack (`@codemirror/*`, `codemirror-lang-latex`) | ~600 kB | `src/modules/common/export/WindowExport.vue` (+ `export/index.ts`, `argumentation/export.ts`) | export window is opened |
| `katex` | 264 kB | `src/modules/common/tooltip/KatexInlineElement.vue` | math is rendered |
| `opentype.js` | 243 kB | `src/modules/common/export/renderSvg.ts` | SVG export |
| `chevrotain` | 93 kB | `src/modules/common/evaluation/tweety-project/*` | certain evaluations run |
| `zod` | 275 kB | broad (validation/serialization) | — likely stays core |
| `@aig-hagen/graph-component` | 247 kB | graph editor core | editing (main feature) |

Modules for reference: common 137 kB, abstract 66, dialectical 36, probabilistic 27,
bipolar 23, incomplete 22, collective 20.

Remaining ~2 MB is core (Vue + app shell + graph editor + common) — a deeper decomposition
of the `index` entry chunk could find more, but the libraries above are the clear wins.

~2 MB (≈40%) of the bundle is feature-specific and deferrable; none of it is needed for
first paint.

## Plan (by impact / risk)

1. **Lazy-load graphviz** — dynamic `import()` inside the layout function. ~820 kB off
   initial load; low risk (already an async operation). *Biggest single win.*
2. **Async-load the export window** — make `WindowExport` a
   `defineAsyncComponent(() => import(...))` so codemirror + opentype (~850 kB) load only
   when a user opens export.
3. **Lazy-load routes** (`src/app/router.ts`) — `component: () => import(...)` splits
   Generate/Glossary/Share/ThirdParty off the initial chunk. Small but trivial and safe.
4. **Lazy-load katex** — dynamic import in the tooltip render path (confirm the
   glossary/tooltip is not shown on the initial view first).
5. **Lazy-load evaluation parsers (chevrotain)** — modest.
6. **Optional: curated `manualChunks` vendor split** — cache big libs across app deploys;
   helps repeat visits, not first load.

Recommended first batch: **1, 2, 3** (high value, low risk) — likely cuts the initial
download by roughly a third to a half. Measure the resulting initial-chunk size, then
decide on the rest.

## How to measure

```bash
npx vite build              # read the printed chunk sizes
```

For per-dependency/per-module byte sizes, temporarily add to `vite.config.ts`
`build.rollupOptions.output.manualChunks(id)` returning a name per `src/modules/<x>` and per
`node_modules/<pkg>`, rebuild, read the split chunk sizes, then revert.
(`source-map-explorer` chokes on the minified single-line sourcemap.)

## Results (batch 1)

Implemented items **1, 2, 3** plus the graphviz prefetch. Measured with `npx vite build`.

Initial JS download (the single entry chunk `index-*.js`, verified as the only
statically-loaded chunk — everything else is now behind `import()`):

| | uncompressed | gzip |
|---|---|---|
| Before | 5,207 kB | 1,556 kB |
| After  | 1,629 kB |   473 kB |
| **Delta** | **−69%** | **−70%** |

CSS is unchanged (248 kB / 57 kB gzip — codemirror injects its styles via JS, not a
stylesheet). Total initial transfer (JS+CSS gzip) ≈ 1,613 kB → ≈ 530 kB (**−67%**).

What moved off first paint (all lazy `import()` chunks now):

- graphviz WASM — 820 kB (gzip **636** — WASM compresses poorly, so this was the single
  biggest wire win, larger than its uncompressed share suggests).
- `ThirdPartyView` (the attributions page) — **1,938 kB**. It was silently riding in the
  initial bundle; route-splitting alone moved it. Unexpected big win.
- codemirror editor runtime (343 kB) + `codemirror-lang-latex` (128 kB) — load with the
  export window / when a LaTeX export is selected.
- `renderSvg` + opentype.js — 246 kB — loads only on SVG preview.
- other routes (Generate 26, Glossary 9, Share/Privacy ~3 each).

### Deviations from the original plan

- **Item 2 needed more than an async component.** codemirror-lang-latex and opentype.js
  reach first paint via `availableExports` (each `module/export.ts` →
  `common/argumentation/export.ts`), which every editor **and** `useGenerate.ts` import
  statically — not via `WindowExport.vue`. So in addition to making `WindowExport` a
  `defineAsyncComponent` (new `export/WindowExportAsync.ts`), the two heavy value edges in
  `common/argumentation/export.ts` were cut: the `svg()` callback dynamic-imports
  `renderSvg` (opentype), and `codemirrorOptions` now carries a `loadExtensions()` loader
  that dynamic-imports `codemirror-lang-latex` (type in `export/index.ts` updated to match).
- **Async ripple for item 1.** `getNodePositions` is now `async` (memoized lazy WASM load),
  so `abstract/layout.ts`, the four module `examples.ts` `applyLayout` callbacks, and
  `GraphEditor.doLayout` became async; the two `BlankDocumentCanvas*` `openExample` and
  `useGenerate.openInEditor` now `await` layout before emitting/persisting the positioned
  framework. `Example.applyLayout` returns `void | Promise<void>`.
- **Lazy-load gating.** The `#export` slot mounts `WindowExport` behind a `v-if` latch
  (`hasExportBeenOpened`, exposed as `hasBeenOpened`) so the chunk is fetched on first open,
  not on editor mount, while staying mounted afterward to keep the close animation. Same
  component serves mobile (`ExportSheet`), so no mobile-specific work.
- **Prefetch.** `prefetchGraphviz()` warms the WASM on editor mount via
  `requestIdleCallback`, so the first auto-layout usually doesn't wait on the download.

Items **4 (katex), 5 (chevrotain), 6 (vendor manualChunks)** are not done — left for a
later batch.

## Notes

- Work should go on a new branch (meaningful multi-file change).
- Deployment is a separate, unrelated concern already handled (Caddy cache headers +
  CI-built image).
