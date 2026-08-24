# Load-time optimization — findings & plan

Status: **investigated, not yet implemented.** Captured 2026-08-24.

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

## Notes

- Work should go on a new branch (meaningful multi-file change).
- Deployment is a separate, unrelated concern already handled (Caddy cache headers +
  CI-built image).
