---
name: AgonProject
description: The platform to explore different approaches to formal argumentation.
colors:
  # References only; values live in src/modules/common/theme/palette.ts (light + dark).
  primary: 'var(--color-primary)'
  primary-content: 'var(--color-primary-content)'
  secondary: 'var(--color-secondary)'
  secondary-content: 'var(--color-secondary-content)'
  base-100: 'var(--color-base-100)'
  base-200: 'var(--color-base-200)'
  base-300: 'var(--color-base-300)'
  base-content: 'var(--color-base-content)'
  neutral: 'var(--color-neutral)'
  neutral-content: 'var(--color-neutral-content)'
  success: 'var(--color-success)'
  warning: 'var(--color-warning)'
  error: 'var(--color-error)'
  info: 'var(--color-info)'
  selection: 'var(--color-selection)'
  inset: 'var(--color-inset)'
typography:
  display:
    fontFamily: 'Fraunces Variable, ui-serif, Georgia, serif'
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  body-reading:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.625
  meta:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 600
    letterSpacing: '0.025em'
  label-micro:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.65rem'
    fontWeight: 500
    letterSpacing: '0.025em'
  mono:
    fontFamily: 'JetBrains Mono Variable, ui-monospace, Consolas, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.5
  graph-label:
    fontFamily: 'Graph Symbols, JetBrains Mono Variable, ui-monospace, monospace'
    fontWeight: 700
rounded:
  chip: '0.25rem'
  field: '0.5rem'
  box: '0.75rem'
  sheet: '1rem'
  pill: '9999px'
spacing:
  '1': '4px'
  '1.5': '6px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '6': '24px'
  '8': '32px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-content}'
    rounded: '{rounded.field}'
    height: '2rem'
    padding: '0 12px'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.base-content}'
    rounded: '{rounded.field}'
    height: '2rem'
  button-ghost-hover:
    backgroundColor: '{colors.base-200}'
  button-icon-touch:
    backgroundColor: 'transparent'
    textColor: '{colors.base-content}'
    rounded: '{rounded.field}'
    size: '44px'
  input:
    backgroundColor: '{colors.base-100}'
    textColor: '{colors.base-content}'
    rounded: '{rounded.field}'
    height: '2rem'
  card:
    backgroundColor: '{colors.base-100}'
    textColor: '{colors.base-content}'
    rounded: '{rounded.box}'
    padding: '24px'
  inset-panel:
    backgroundColor: '{colors.inset}'
    rounded: '{rounded.field}'
    padding: '10px'
  header-bar:
    backgroundColor: '{colors.base-200}'
    textColor: '{colors.base-content}'
    typography: '{typography.headline}'
    height: '48px'
  segmented-floating:
    backgroundColor: '{colors.base-100}'
    rounded: '{rounded.pill}'
  segmented-floating-selected:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-content}'
  segmented-inline:
    backgroundColor: '{colors.base-300}'
    rounded: '{rounded.field}'
  segmented-inline-selected:
    backgroundColor: '{colors.base-100}'
    textColor: '{colors.base-content}'
  chip-code:
    backgroundColor: '{colors.base-200}'
    typography: '{typography.mono}'
    rounded: '{rounded.chip}'
    padding: '2px 6px'
---

<!-- markdownlint-configure-file { "MD025": { "front_matter_title": "" } } -->

# Design System: AgonProject

## Overview

**Creative North Star:** "The Lab Notebook"

AgonProject is a research tool, so it should look like one: a clean notebook on the desk of an
argumentation researcher. The page is pale, cool paper. The argument graph is the drawing on it.
The brand blue is the pen, used to mark what matters (the selected option, the primary action,
the menu entry you're about to pick) and almost nowhere else. Panels, toolbars and windows are
ruled margins that frame the work and never compete with it.

Density is moderate. The editor is a working surface that people stay in for a long session, so
chrome is compact (small buttons, 14px UI text, hairline borders) but never cramped. Secondary
pages (glossary, generator, attributions) feel like notebook pages: a ruled header bar, then
content. The serif display face appears only for the AgonProject wordmark, like a title written
on the notebook's cover.

Colors, fonts and radii are each defined in exactly one place and consumed through tokens.
Desktop and mobile are one system at two densities, not two designs.

**Key Characteristics:**

- Cool blue-gray paper neutrals, one brand blue accent, a warm yellow used sparingly.
- Inter for everything functional; Fraunces only for the wordmark; JetBrains Mono for formulas and
  code.
- Hairline `base-300` rules separate regions; shadows only lift things that float over the canvas.
- Two radii do almost all the work: field (8px) for controls, box (12px) for containers.
- Same tokens, same components on desktop and mobile; mobile only changes density and touch size.

## Colors

A cool, low-saturation paper palette with one confident institutional blue. All values, for both
light and dark mode, live only in [`palette.ts`](../../src/modules/common/theme/palette.ts), which emits
each token as a `--color-*` (app) or `--graph-*` (graph) custom property. This document names the
tokens and their roles; it never restates their values.

### Primary

- **AIG Blue** (`primary`): primary buttons, the selected segment of a segmented control, menu
  entry icons, links, the keyboard focus ring (`focus`), and informational alerts (`info` aliases
  `primary`, so there is never a second blue). Text on it uses `primary-content`.

### Secondary

- **AIG Yellow** (`secondary`): the beta ribbon and badge, and the Library and Outline graph
  presets; nothing structural in the app chrome. It is a warm highlight, not a second accent; text
  on it uses `secondary-content`.

### Neutral

- **Paper** (`base-100`): the canvas, cards, floating windows, sheets, menus.
- **Paper shade** (`base-200`): chrome bars (editor tab strip, page header bar), hover fills, and
  the home backdrop behind module cards.
- **Inset** (`inset`): recessed panels grouping controls inside a window.
- **Rule** (`base-300`): every hairline border and divider, scrollbar thumbs, the inline segmented
  track.
- **Ink** (`base-content`): all text and icons, stepped down through the three ink tiers below.
- **Slate chip** (`neutral`): filled dark surfaces such as tooltips and toast pills.
- **Overlay helpers** (`scrim`, `shadow`): backdrop dimming and shadow tint; opacity is applied in
  `style.css`.

### Status

- **Success / Warning / Error** (`success`, `warning`, `error`): alerts, validation, the active
  dot on a floating window. Each has a matching `*-content` on-color.
- **Selection** (`selection`): text selection only.

### Graph

Each graph style preset has a purpose and its own `--graph-<preset>-node / -stroke / -link /
-label` tokens, defined per mode. Presets in `graphStyle.ts` only reference tokens; the graph
editor resolves them per theme before handing them to the graph library.

- **Default** (`graph-default-*`): the everyday look, a brand-blue tint.
- **High contrast** (`graph-high-contrast-*`): heavy borders and links, labels at 7:1 or more.
- **Minimal** (`graph-minimal-*`): quiet ink mixes over the paper tones.
- **Library** (`graph-library-*`): the brand colors, yellow nodes and blue links, no border.
- **Outline** (`graph-outline-*`): the ABA scheme; identity in the amber border, fill left free
  for evaluation colors.
- **Evaluation highlights** (`graph-accepted`, `graph-derived`, `graph-rejected`): neon green
  and salmon, the same in both modes. Undecided nodes keep the preset's node color. Labels on
  highlights take whichever palette ink (`GRAPH_LABEL_INKS`) contrasts more.
- **Color-blind friendly highlights** (`COLOR_BLIND_HIGHLIGHTS`): blue accepted and red/orange
  rejected, per mode, switched by the setting via `data-graph-colors='color-blind'` on the root.

### Named Rules

**The Single Source Rule.** No raw hex, `rgb()` or Tailwind primitive colors (`gray-500`,
`text-black`) in app code. Every color comes from a palette token, graph colors included. Export
output and the standalone maintenance page are the documented exceptions.

**The Color-Blind Rule.** Evaluation results must stay apart for red-green and blue-yellow color
blindness, not just normal vision: accepted and rejected differ by at least ΔE 15 (OKLab ×100,
under simulated protan, deutan and tritan vision), and each preset's node color by at least 10
from both. Lightness, not hue alone, carries the difference. Derived nodes also get a dotted
border, since their pale green sits close to some presets' fills. The default highlights carry a
few listed trade-offs (Library, Outline light); the color-blind friendly scheme has none and clears
ΔE 15 against every preset. `palette.test.ts` enforces both.

**The Three Inks Rule.** Muted text and icons use exactly three ink strengths over `base-content`:
`/80` for secondary body text, `/65` for meta, captions, labels, placeholders, empty states and
muted icons, `/40` only for disabled controls and decorative glyphs that carry no information.
Full-strength ink is the default. No other steps, and no `opacity-*` to fake a tier.

**The Readable Floor Rule.** `/65` is the lightest ink for text anyone needs to read: it clears WCAG
AA (4.5:1) on paper and paper shade in both modes, `/60` does not in light mode. Never set readable
text at `/40`.

**The One Pen Rule.** Brand blue marks the one thing you're about to act on or have selected. If a
screen has more than a handful of blue elements at rest, something is shouting.

## Typography

- **Display font:** Fraunces Variable (ui-serif, Georgia fallback)
- **Body font:** Inter Variable (ui-sans-serif, system-ui fallback)
- **Mono font:** JetBrains Mono Variable, with the bundled "Graph Symbols" KaTeX faces for ∅, arrows
  and logic symbols in graph labels (`var(--font-graph)`)

**Character:** A sober, highly legible sans for work, a soft literary serif for the cover. All
fonts are self-hosted through Fontsource and referenced only through the font roles in
[`style.css`](../../src/style.css), never by name.

### Hierarchy

- **Display** (700, 1.5rem rising to 2.25rem from `sm`, tight tracking): the AgonProject wordmark
  on the home screen. Nowhere else.
- **Headline** (700, 1.125rem): page titles in the header bar and dialog titles.
- **Title** (600, 1rem): card titles, bottom sheet titles, the selected term in the glossary.
- **Body** (400, 0.875rem, 1.5): the default UI text: lists, menus, buttons, window content.
- **Body Reading** (400, 1rem, 1.625, max ~70ch): long-form pages such as privacy and attributions.
- **Heading** (600, 1rem, ink, normal case): section headings in reading content (glossary
  entries, result and overview tables) via the shared `.section-heading` class.
- **Meta** (400, 0.75rem): captions, hints, evaluation details, timestamps.
- **Label** (600, 0.75rem, uppercase, 0.025em tracking, ink `/65`): names a group of controls or
  list items in chrome (settings, sheets, menus, dropdown groups, panels) via the shared
  `.section-label` class.
- **Label Micro** (500, 0.65rem as `text-micro`, uppercase, 0.025em tracking, ink `/65`): field
  labels above a control via `.field-label`, and badges. The only step below 12px.
- **Mono** (400, 0.75rem): inline code, serialisations, TeX snippets.

### Named Rules

**The One Scale Rule.** Desktop and mobile share the scale above. No arbitrary sizes
(`text-[13px]`, `text-[0.8125rem]`); snap to the nearest step (11→12, 13→14, 15→16).

**The Cover Only Rule.** Fraunces is the notebook's cover. If it appears on anything that isn't the
wordmark, it's wrong.

**The Shared Label Rule.** Small caps headings always come from `.section-label` or `.field-label`,
always in ink, never in `primary` or `secondary`.

**The Chrome Caps Rule.** Caps label controls and lists, not content. A heading over text or a
table you read is a Heading. Group rows inside a table are part of the table: normal case, medium
weight, on a `base-200` fill.

## Layout

The app switches shells by viewport width alone: below 768px (`COMPACT_MAX_WIDTH` in
[`useLayoutMode.ts`](../../src/modules/common/layout/useLayoutMode.ts)) it renders the compact (mobile)
shell, otherwise the regular (desktop) one. Pointer type never changes the shell; it only adjusts
gestures and help text. Within a shell, Tailwind's `sm` (640px) and `lg` (1024px) breakpoints tune
grids, such as the home module cards going 1 → 2 → 3 columns.

Spacing follows a 4px base with a compact working range: 8px (`gap-2`) and 12px (`gap-3`) are the
default gaps, 4–6px for tight icon+label pairs, 16px between cards, 24–32px for page padding.

Every secondary page uses the same **header bar shell**:

```text
┌──────────────────────────────────┐
│ ‹ Back      Page title     [acts]│  base-200 bar, base-300 hairline below
├──────────────────────────────────┤
│                                  │
│  content: sidebar + pane, or a   │  base-100
│  single centered column          │
│                                  │
└──────────────────────────────────┘
```

The bar holds a ghost back button (chevron) on the left, the page title centered in Headline type,
and optional actions on the right. It is the same component on desktop and mobile; only padding and
touch size differ. Secondary pages are in-app routes and open in the same tab, so back always
returns to the editor; only external sites open in a new tab (marked with ↗).

### Named Rules

**The One Shell Rule.** Secondary pages never invent their own top-of-page structure. No floating
back links above a big title, no margin-only layouts.

**The Same Bones Rule.** A desktop view and its mobile twin use the same components (header bar,
search, tabs, labels). Mobile may stack, enlarge touch targets and reflow, but not restyle. The one
sanctioned difference: page tabs become pills on compact screens (see Tabs).

## Elevation & Depth

Mostly flat, with tonal layering doing most of the work: paper (`base-100`) on paper shade
(`base-200`), separated by `base-300` hairlines. Shadows are reserved for things that physically
float over the canvas or the page. Every shadow is tinted from the palette `shadow` token, never
pure black; the tint is applied by overriding Tailwind's shadow scale in `style.css`.

### Shadow Vocabulary

- **Rest** (`shadow-sm`, 10% tint): small floating buttons resting on the canvas, cascading menus.
- **Raised** (`shadow-md` / `shadow-lg`, 10% tint): dropdowns, the floating segmented control,
  toolbar pills.
- **Float** (`shadow-float` paired with a size, 30% tint): floating windows, bottom sheets and the
  ABA theory panel (`shadow-lg shadow-float`), the main menu and its submenus (`shadow-md` /
  `shadow-sm shadow-float`).
- **Popover** (`shadow-xl`, 10% tint): tooltips with rich content, glossary term popovers.
- **Footer** (`.shadow-footer`): upward shadow under sticky sheet footers.

### Named Rules

**The Tinted Shadow Rule.** Never use Tailwind's opacity modifier on shadows (`shadow-lg/30`). It
generates a different class that skips the palette tint. Use the named tiers.

**The Float Only Rule.** Cards and panels sitting in the page flow get a hairline border, not a
shadow.

## Shapes

Softly rounded, never pill-shaped by default. DaisyUI's radii are overridden once in `style.css`
so controls and containers share two corner sizes.

- **Field** (8px, `rounded-field`): buttons, inputs, selects, inset panels, the inline segmented
  track. Elements nested inside a field-radius track (the selected segment) step down to 6px.
- **Box** (12px, `rounded-box`): cards, floating windows, menus, dropdowns, popovers.
- **Pill** (`rounded-full`): only for things that are pills by nature: the floating segmented
  control, status dots, filter chips, toolbar pills, skeleton chips.
- **Sheet** (16px top corners): bottom sheets and the tutorial spotlight.
- **Chip** (4px): inline code and key chips.

Borders are 1px `base-300` hairlines. Brand-tinted borders (`primary/40` with a `primary/5` fill)
mark a single highlighted container, such as the pinned glossary term.

## Components

### Buttons

Quiet by default, blue when it matters.

- **Shape:** field radius (8px).
- **Primary:** brand blue fill, white text. One per view or dialog.
- **Ghost:** the default for toolbars, headers, menus and icon buttons. Hover fills paper shade.
- **Soft / Outline:** secondary actions next to a primary (cancel, alternative export).
- **Sizes:** `btn-sm` (32px) for desktop toolbars and dialogs, `btn-xs` (24px) inside dense
  windows. Compact-shell icon buttons are 44px square (`size-11`).
- **Focus:** the app-wide 2px brand focus ring, offset 2px.

### Header bar

The ruled top of every secondary page (see Layout), implemented once as
[`PageHeader.vue`](../../src/modules/common/layout/PageHeader.vue). Paper shade background, hairline
below, ghost chevron back button (with its label on desktop, a 44px icon button on compact), and the
page title centered in Headline type. Pages pass extra actions through its `actions` slot.

### Cards / Containers

- **Corner style:** box radius (12px).
- **Background:** paper (`base-100`), sitting on paper shade where there's a backdrop.
- **Border:** `base-300` hairline. No shadow in flow.
- **Internal padding:** 24px for home module cards, 12–16px for content cards, 10px (`p-2.5`) for
  inset panels.
- **Inset panel:** grouped controls inside a window use the `bg-inset` fill, field radius and a
  hairline border.

### Inputs / Fields

- **Style:** DaisyUI `.input` / `.select` with field radius and `base-300` border; `input-sm` on
  desktop, full-height (44px) on mobile. No other hand-rolled input wrappers.
- **Search:** always [`SearchInput.vue`](../../src/modules/common/forms/SearchInput.vue): a filled paper
  shade field with a hairline border, a leading magnifier in ink `/40`, 36px tall on desktop and
  44px on compact. On focus it lifts to paper with a focus-colored border, and only the field (not
  the inner input) draws the ring. A trailing × clears it once there is text.
- **Focus:** the shared brand focus ring.
- **Labels:** `.field-label` above the control.

### Segmented controls

Two roles, one shape logic: the selected segment is always the strongest element.

- **Floating** (`graph-editor/SegmentedControl.vue`): over the canvas. Pill track on translucent
  paper with backdrop blur and a Raised shadow; the selected segment slides as a brand blue pill.
- **Inline** (`settings/SegmentedControl.vue`): inside forms and settings. Flat `base-300` track
  with field radius; the selected segment is a paper chip with full ink.

### Tabs

- **Editor tabs:** DaisyUI lifted tabs on the paper shade strip, one per open document.
- **Page tabs:** underline tabs below the header bar on desktop. On compact screens they become a
  horizontally scrolling row of 32px pills: brand fill when selected, paper shade with ink `/80`
  otherwise.

### Navigation and menus

DaisyUI `.menu` lists on paper with box radius. Entry icons use `.menu-icon` (brand blue); every
other icon is ink or ink `/65`. Back is always a chevron-left; close is always an X (16px in small buttons, 20px in 44px buttons). Inline remove buttons on chips and
list rows use a smaller X (12–14px).

### Floating windows and sheets

The signature component. Desktop tools (evaluation, export, serialisation) open as draggable,
resizable floating windows: box radius, paper, hairline border, Float shadow, a compact header with
grip dots, title in Body/medium and a ghost close button. On the compact shell the same content
opens in a bottom sheet with sheet radius, a grab handle and a scrim backdrop.

### Badges

DaisyUI badges in `badge-sm` / `badge-xs`, soft variants preferred. Text uses Label Micro.

## Do's and Don'ts

### Do

- **Do** take every color from a palette token and every typeface from a font role.
- **Do** use ink, ink `/80`, ink `/65` and (for disabled or decorative only) ink `/40`.
- **Do** build every secondary page on the header bar shell.
- **Do** use `.section-label` and `.field-label` for all small caps text.
- **Do** separate in-flow regions with `base-300` hairlines and reserve shadows for floating
  surfaces.
- **Do** make compact-shell touch targets 44px.
- **Do** reuse the same component on desktop and mobile and change only density.

### Don't

- **Don't** use arbitrary font sizes (`text-[13px]`, `text-[0.6875rem]`); snap to the scale.
- **Don't** use `shadow-*/NN` opacity modifiers; they skip the palette tint.
- **Don't** use Fraunces anywhere but the wordmark.
- **Don't** color caps labels with `text-secondary` or `text-primary`.
- **Don't** mix back icons (`ArrowLeft`, `ArrowUturnLeft`) or invent new close-button sizes.
- **Don't** fade icons with `opacity-*` to make them muted; use the ink tiers. Opacity is for
  disabled states only.
- **Don't** add a third radius for controls (`rounded-lg`, `rounded-md`); use field or box.
