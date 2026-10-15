# Graph color scheme — implementation plan

Bring every graph color (style presets, evaluation highlights, link kinds) under the
single-source palette, with a real dark variant for every preset and a color-blind-safe
highlight set.

Working tool: the [Graph Color Lab](https://claude.ai/artifact/95rcn4dmo5MgbCEnti1WKE)
(private artifact) renders every preset × theme × highlight, with contrast and color-blind
checks. Values agreed there get pasted back as JSON and become the Phase 1 tokens.

## Problem

```
palette.ts        → app UI colors, light + dark, emitted as --color-*     ✔ single source
colors.ts         → hard-coded hex for nodes, links, highlights          ✘ light only
graphStyle.ts     → 5 presets, hex literals (outline uses tokens)        ✘ 3 of 5 lack dark
style.css         → hex fallbacks duplicating graphStyle.ts              ✘ drift
```

- **Dark mode broken for 3 of 5 presets.** High-contrast, minimal and library have no dark
  variant; black / `#444` / navy links almost vanish on the `#1c2833` canvas.
- **Highlights ignore the theme.** `#99ff99` / `#d6ffd6` / `#ff9999` are neon on dark and
  off-palette in both themes.
- **Red vs. green for accepted/rejected**: the classic color-blind trap (deuteranopia).
- **Derived ≈ accepted.** `#d6ffd6` barely separates from `#99ff99` or a white canvas.
- **Dead code.** 8 of 14 exports in [`colors.ts`](../../src/modules/common/colors.ts) are
  unused; `ARGUMENT_COLOR` / `ATTACK_COLOR` in `argumentation/model.ts` are unused too.
- **Duplicated values.** `#5a87a8` / `#99b7d5` / `#ddd` fallbacks in `style.css`; library
  preset re-types `AIG_BLUE` (`#004c97`) by hand.
- **Latent token traps** (bite as soon as we switch to tokens):
  - `getContrastingLabelColor` parses hex only → resolved tokens (`rgb(...)`) return `''`.
  - `LinkConfigs.color` and highlight group colors skip `resolveCssColor`; only
    `LinkKindStyles.color` and the preset node/link colors are resolved.

Not affected: save files and export formats store no colors, so nothing persisted breaks.

## Phase 0 — settle the scheme (in the lab)

Each preset has a purpose; judge candidates against it:

| Preset        | Purpose                        | Status                                                                                                                   |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Default       | everyday look, AIG blue tint   | dark: deeper fill `#3d6a89` (labels 3.9 → 5.0:1). Light fill is exactly AIG blue 40% over white → expressible as a token |
| High contrast | maximum contrast               | light: pale `#c9dcec` fill, navy `#0b2a44` rim 2.5, black links (labels 11:1). dark: navy `#173a55` fill, `#e7eef4` rim, white links (10:1) |
| Minimal       | quiet, minimalistic            | tokens, both themes: fill base-200 (light) / base-300 (dark), rim 55% ink, links 75% ink, widths 1 / 1.5                 |
| Library       | brand colors (AIG blue/yellow) | both themes: `secondary` nodes, `primary` links, no outline, labels in `secondary-content` (6.5 / 8.9:1). Accepted trade-off: yellow ≈ rejected salmon for deuteranopes (ΔE 2 light / 7 dark) |
| Outline       | ABA scheme, amber outline      | unchanged (already pure tokens: `secondary` 22% fill, `secondary` rim, `primary` links). Derived fixed via dotted border (below). Accepted trade-offs in light: accepted vs. undecided ΔE 7; rim 2.6:1 on white |

- [x] Highlights → **"Neon, offset soft"**, one set for both themes (2026-10-15):

  | Label    | Both themes |
  | -------- | ----------- |
  | accepted | `#66ff99`   |
  | derived  | `#d6f5dc`   |
  | rejected | `#ff7766`   |

  - Keeps today's neon look; rejected is pushed darker / toward salmon so lightness separates
    it from accepted too. Worst ΔE (accepted / rejected / undecided, all vision types):
    15 light, 13 dark — up from 8 / 13 today. A lighter dark-mode rejected scored no better.
  - Derived only matters in ABA, so it was down-weighted: it only has to avoid collisions.
  - Fills sit at ~1.3:1 on the white canvas; the node stroke carries the edge in light mode.
  - Labels need dark ink on all three. The current `getContrastingLabelColor` threshold
    (luminance 0.4) picks **white** on `#ff7766` (2.6:1, fails) — fixed by Phase 2's label work.
- [x] Derived cue: keep pale green, add a **dotted node border** on derived nodes
      (`NodeOutline.DOTTED`, already supported by the graph library). Fixes Outline light, where
      derived vs. undecided was ΔE 1. Derived only appears in ABA, so no clash with IAF's dashed
      outlines. Not visible on Library (no stroke), where derived vs. undecided is ΔE 23 anyway.
- [x] No extra non-color cue for accepted / rejected. Weakest spot: dark-mode accepted /
      rejected for deuteranopes (ΔE 13).
- [x] Presets per the table above; Outline kept as is.
- [x] Re-checked highlights against every picked preset's undecided fill: all ≥ 11 except the
      accepted trade-offs (Library, Outline light).
- [x] Contrary edge (`--color-error`) checked against every preset's links: ΔE 7–42; the weakest
      (Minimal) is still carried by the dashed line + bar head.
- [x] Format: named graph tokens in `palette.ts`. Each holds a hex value (Default, High contrast)
      or a token mix (Minimal, Library, Outline); presets in `graphStyle.ts` only reference them.
- [x] Per-preset label color is needed (Library's yellow nodes take dark ink in dark mode) →
      `nodeLabelColor` in `GraphStyle`, default `base-content` (Phase 3).

Working tool: the Graph Color Lab (link at the top) holds every pick under "Apply all preset
picks" and the chosen highlight / derived candidates.

## Phase 1 — graph tokens in the palette

- [x] Add `GraphColorToken` + `LIGHT_GRAPH_PALETTE` / `DARK_GRAPH_PALETTE` to
      [`palette.ts`](../../src/modules/common/theme/palette.ts), emitted by
      `buildPaletteCss()`. Names must not collide with the runtime vars the editor already sets
      (`--graph-node-color`, `--graph-node-stroke-color`, `--graph-node-stroke-width`):
  ```
  --graph-<preset>-node / -stroke / -link / -label     per preset (default, high-contrast, minimal, library, outline)
  --graph-accepted  --graph-derived  --graph-rejected   highlights (same value in both themes)
  ```
- [x] Derive from existing anchors where it fits instead of new hex (e.g. Default light fill =
      `primary` 40% over `base-100`, which is exactly today's `#99b7d5`).
- [x] Update the header comment ("graph colors are kept out of this file").
- [x] Unit test (`palette.test.ts`): both modes emit every graph token, and every `var()` in a
      value points at a token defined in the same mode. Same key set is enforced by the types.

## Phase 2 — color resolution plumbing

- [x] Run every color handed to the graph library through `resolveCssColor`: link-type colors
      (`linkTypeColor()` in `GraphEditor.vue`, all six call sites), link kinds, hyperlinks and
      highlight groups (`useHighlight`).
- [x] Theme-safe resolution: the probe carries its own `data-theme`, so results don't depend on
      when the document attribute flips; resolved values are cached per theme. Mixes that the
      browser serializes as `oklab()` / `color()` are normalized to hex/rgba via a canvas pixel.
- [x] Label color: `getContrastingLabelColor` reads hex and rgb(a) and picks whichever of
      near-black / white contrasts more (fixes white-on-`#ff7766`).
- [x] Moved `resolveCssColor` into `graphEditorUtils.ts`, with tests.

## Phase 3 — presets on tokens

- [x] [`graphStyle.ts`](../../src/modules/common/graph-editor/graphStyle.ts): one `GRAPH_STYLES`
      map; every preset references `--graph-<preset>-*` tokens, only stroke widths stay local.
- [x] Dropped `GRAPH_STYLE_DARK` and the `isDark` branch in `pickStyle()`; a stale stored setting
      falls back to default. `GraphStyleName` is now an alias of `GraphPresetId`.
- [x] Library references the brand tokens (`secondary` / `primary` / `secondary-content`).
- [x] `nodeLabelColor` on `GraphStyle`, applied via `--graph-node-label-color`; plain
      (label-only) nodes keep the theme text color via a `:has()` rule.
- [x] [`style.css`](../../src/style.css) has no hex/rgba left: fallbacks point at default-preset
      tokens; `--node-charge-glow` comes from the new `graph-charge-glow` token.
- [x] Legend dots and `StatementGlyph.vue` still read `--graph-node-color` /
      `--graph-node-stroke-color`, which the editor keeps setting.

## Phase 4 — highlights on tokens

- [x] [`labeling.ts`](../../src/modules/common/evaluation/labeling.ts) uses
      `var(--graph-accepted)` / `--graph-derived` / `--graph-rejected` (the only highlight producer).
- [x] Updated `labeling.test.ts` expectations.
- [x] Derived cue: highlight groups carry an optional `outline`; derived uses
      `NodeOutline.DOTTED`. `useHighlight` re-applies it to overridden nodes each run and restores
      the module's own outline (e.g. IAF's dashed) once a node leaves the group. `setNodeOutline`
      reheats the layout, so calls are limited to overridden nodes and batched per outline.

## Phase 5 — cleanup

- [x] Deleted `colors.ts` and the unused `ARGUMENT_COLOR` / `ATTACK_COLOR` in `argumentation/model.ts`.
- [ ] Optional: ranking score chips (`WindowRanking.vue` `hsl()` ramp) onto palette tokens.
- [x] Leftover literals in `src/` outside `palette.ts`, all deliberate:
  - `graphEditorUtils.ts`: label inks `#1a1a1a` / `#ffffff` and the rgba/hex normalizer output.
  - `WindowExport.vue`: white "paper" behind the export preview.

## Phase 5b — color-blind support

- [x] Label inks come from the palette (`GRAPH_LABEL_INKS`: `base-content` / `base-100`).
- [x] **Regression guard**: shared color math in `theme/colorMath.ts` (luminance, contrast,
      OKLab, color-blind simulation, ΔE). `palette.test.ts` resolves every graph token like the
      browser would and checks shapes ≥ 3:1, labels ≥ 4.5:1, accepted vs. rejected ≥ ΔE 15 and
      each preset vs. both highlights ≥ ΔE 10, across normal + protan/deutan/tritan vision.
      Trade-offs (Library, Outline light) are listed with their own floor. Verified it fails
      when the old `#ff9999` rejected is put back.
- [x] ~~Color-blind patterns setting~~ — built, then dropped (2026-10-15): the intended
      "color blind mode" is an alternative **color scheme**, not border patterns. Derived keeps
      its dotted border in every mode.
- [x] **Color-vision schemes** (see Phase 7).

## Phase 6 — docs and release notes

- [x] [`DESIGN.md`](../../DESIGN.md): "Graph" color section (preset purposes, highlight roles),
      a Color-Blind Rule, and graph colors dropped from the Single Source Rule's exceptions.
- [x] [`conventions.md`](../contributing/conventions.md): `--graph-*` tokens, keep
      `palette.test.ts` passing; graph rendering is no longer a palette exception.
- [x] `CHANGELOG.md`: presets, highlights, and the color-blind patterns setting.
- [x] Removed the two finished items from `docs/ideas/TODO.md`.

## Phase 7 — color-vision schemes

A setting that swaps the evaluation colors for a set tuned for color vision deficiencies, instead
of the default compromise.

- [x] Design round in the lab (2026-10-15): one scheme is enough. The blue vs. red/orange axis
      holds for red-green **and** blue-yellow vision; tritan-tuned green/red sets collapse for
      red-green viewers (ΔE 3–8). Picked **Blue / vermilion**:

  | Label    | Light     | Dark      |
  | -------- | --------- | --------- |
  | accepted | `#4b56da` | `#28a4e6` |
  | derived  | `#f5c270` | `#e8d3fa` |
  | rejected | `#841214` | `#ba5c13` |

  Worst ΔE vs. every preset, light / dark: red-green 28 / 16, blue-yellow 24 / 20, normal
  29 / 19 (default neon: 2 / 7 for red-green). No preset colors change. Dark rejected labels
  are 4.54:1 (white); a darker orange would cost red-green separation (16 → 14).
- [x] Tokens: `COLOR_BLIND_HIGHLIGHTS` in `palette.ts`, emitted for
      `[data-theme][data-graph-colors='color-blind']`. `resolveCssColor` takes the scheme and
      puts it on its probe (cache key includes it), so resolution stays timing-safe.
- [x] Setting `colorBlindColors` (Settings, under graph style) → `graphColorScheme`, which sets
      the root attribute and feeds the editor and `useHighlight`; en/de strings.
- [x] `palette.test.ts`: the scheme clears ΔE 15 against every preset with no exceptions, plus
      labels; verified it fails when the neon salmon is put back as rejected.
- [x] Docs: DESIGN.md (Graph section + Color-Blind Rule), CHANGELOG.

## Open questions

- ~~Should highlight colors vary per preset?~~ No: one set, the same in both modes.
- Image export: does it serialize the live (theme-dependent) colors? If so, should a dark-mode
  export come out dark, or always light?
