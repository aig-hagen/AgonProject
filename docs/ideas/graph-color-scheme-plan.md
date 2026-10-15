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

- [ ] Add `GraphColorToken` + `LIGHT_GRAPH_PALETTE` / `DARK_GRAPH_PALETTE` to
      [`palette.ts`](../../src/modules/common/theme/palette.ts), emitted by
      `buildPaletteCss()`. Names must not collide with the runtime vars the editor already sets
      (`--graph-node-color`, `--graph-node-stroke-color`, `--graph-node-stroke-width`):
  ```
  --graph-<preset>-node / -stroke / -link / -label     per preset (default, contrast, minimal, library, outline)
  --graph-accepted  --graph-derived  --graph-rejected   highlights (same value in both themes)
  ```
- [ ] Derive from existing anchors where it fits instead of new hex (e.g. Default light fill =
      `primary` 40% over `base-100`, which is exactly today's `#99b7d5`).
- [ ] Update the header comment ("graph colors are kept out of this file").
- [ ] Unit test: light and dark define the same token set.

## Phase 2 — color resolution plumbing

- [ ] Run every color handed to the graph library through `resolveCssColor`: link configs,
      hyperlinks, highlight groups (`useHighlight`), not just preset node/link colors.
- [ ] Re-resolve on theme toggle (`isDark`) for all of the above.
- [ ] Label color: use the `--graph-*-content` tokens, or make `getContrastingLabelColor`
      accept any resolved color (rgb / color()) instead of hex only.
- [ ] Move `resolveCssColor` out of `GraphEditor.vue` into `graphEditorUtils.ts` if it's
      now shared.

## Phase 3 — presets on tokens

- [ ] Rewrite [`graphStyle.ts`](../../src/modules/common/graph-editor/graphStyle.ts) presets
      as token references / `color-mix` recipes with Phase 0 values.
- [ ] Drop `GRAPH_STYLE_DARK` and the `isDark` branch in `pickStyle()` once default is
      token-based.
- [ ] Library preset references the brand token instead of `#004c97`.
- [ ] Replace hex fallbacks in [`style.css`](../../src/style.css) with tokens; move the dark
      `--node-charge-glow` into the palette.
- [ ] Check the legend dots and `StatementGlyph.vue` still pick up `--graph-node-*`.

## Phase 4 — highlights on tokens

- [ ] [`labeling.ts`](../../src/modules/common/evaluation/labeling.ts) uses
      `var(--graph-in)` / `--graph-derived` / `--graph-out`.
- [ ] Update `labeling.test.ts` expectations.
- [ ] Derived cue: let highlight groups carry an optional node outline (`Highlight.groups[].outline`)
      and have `useHighlight` apply `NodeOutline.DOTTED` to derived nodes (restore on clear).

## Phase 5 — cleanup

- [ ] Delete dead exports in `colors.ts` (likely the whole file) and unused
      `ARGUMENT_COLOR` / `ATTACK_COLOR`.
- [ ] Optional: ranking score chips (`WindowRanking.vue` `hsl()` ramp) onto palette tokens.
- [ ] Grep for leftover hex in `src/` outside `palette.ts`.

## Phase 6 — docs and release notes

- [ ] [`DESIGN.md`](../../DESIGN.md): graph color section (tokens, presets, highlight
      rules, color-blind targets).
- [ ] [`conventions.md`](../contributing/conventions.md): "graph colors come from
      `--graph-*`, never hex".
- [ ] `CHANGELOG.md` under `[Unreleased]`: dark variants for all presets; new highlight
      colors.
- [ ] Tick `docs/ideas/TODO.md` items "graph style colors need update" and "labeling
      highlight colors - color blind mode".

## Open questions

- Should highlight colors vary per preset, or stay one set per theme? (Plan assumes one set.)
- Image export: does it serialize the live (theme-dependent) colors? If so, should a dark-mode
  export come out dark, or always light?
