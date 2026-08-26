# Mobile Layout — Implementation Plan

The app is currently built for desktop browsers. This document plans a dedicated
**mobile layout**: a separate set of presentation shells for small/touch screens, reusing
all existing logic. It records the design decisions, the per-view designs, and a phased
implementation path.

> **Interactive mockups:** the full set of phone artboards lives in a design canvas —
> <https://claude.ai/code/artifact/c63813fd-b349-4b5f-83d8-1d8966e256f1>
> (three pages: *Core flow*, *Per-type editing*, *Menus, tutorials & views*). Screen names
> below (e.g. *Main*, *Evaluate*, *AdfNode*) refer to artboards there. The artboard sources
> (`*.dc.html` + `canvas.json`) are kept under [mobile-mockups/](./mobile-mockups/).

For repository layout and coding conventions this plan builds on, see
[structure.md](./structure.md) and [conventions.md](./conventions.md).

## Goals & scope

- A layout that is **easy to use and readable on a phone**, not a responsive squeeze of the
  desktop UI.
- The **editor stays the primary feature** on mobile.
- Reuse **all** logic (composables, module configs, evaluation/export machinery); only the
  presentation shells are new.
- The underlying graph component (`@aig-hagen/graph-component`) already supports touch for
  everything **except moving nodes**, which is acceptable — hence relayout and fit-to-view
  become first-class mobile controls.

## Architecture: two layouts, one logic

Two radically different layouts are feasible here because the views are thin shells and the
logic lives in composables and module configs. [`App.vue`](/src/app/App.vue) only renders
`<RouterView />`.

**Approach (chosen): separate view components switched at the route/shell level.**

- Add a `useIsMobile()` composable (a `matchMedia('(max-width: 640px)')` ref; `640px` matches
  the existing `window.innerWidth < 640` breakpoint already used in
  [`FloatingWindow.vue`](/src/modules/common/window/FloatingWindow.vue)). Prefer
  `(pointer: coarse)` **in addition to** width if we want touch-desktops handled — start with
  width only.
- Each route renders either the desktop or the mobile shell:
  - either a thin wrapper per route (`<HomeView>` vs `<HomeViewMobile>`), or
  - a single `<component :is=...>` switch in each view file.
- Both shells call the **same** composables:
  [`useDocuments`](/src/modules/common/documents/useDocuments.ts),
  [`useTheme`](/src/modules/common/theme/useTheme.ts),
  [`useSettings`](/src/modules/common/settings/useSettings.ts),
  [`useTutorial`](/src/modules/common/tutorial/useTutorial.ts), the `ModuleConfig` registry,
  and the evaluation/export logic.

Rejected alternatives: CSS-only responsive breakpoints (the desktop paradigm — floating
windows, tab bar, mouse/keyboard controls — does not reflow into mobile); fully separate
apps/entry points (needless duplication of routing/bootstrap).

**The genuinely new work** is not the switching but two redesigns:
1. The desktop **floating windows** (`Window*.vue`) become **bottom sheets**.
2. The **graph canvas chrome** (a left-edge button cluster, mouse/keyboard controls) becomes a
   bottom command bar + on-canvas selectors + touch gestures.

## Navigation model

There is **no tab bar** on mobile. Documents are one-at-a-time, and a **switcher chip** in the
editor top bar is the hub:

- Tapping the chip opens **Home** (*Home* artboard), which absorbs both desktop surfaces it
  replaces — the tab bar and the landing page ([`BlankDocumentCanvas.vue`](/src/app/home/BlankDocumentCanvas.vue)):
  - **Documents** tab: switch between saved frameworks (open one marked).
  - **New** tab (*NewDoc* artboard): the type picker — the six module cards, each expanding to
    its examples + *Create new* + *Generate*.
- The switcher chip is also the **way back home** from the editor (it doubles as a home
  button).

Route map is unchanged ([`router.ts`](/src/app/router.ts)): `/`, `/generate`, `/glossary`,
`/share/:id`, `/third-party`. Only the components rendered per route differ on mobile.

## View inventory

| View | Desktop source | Mobile artboard(s) | Notes |
|------|----------------|--------------------|-------|
| Home / switcher | tab bar + `BlankDocumentCanvas` | *Home*, *NewDoc* | full screen; replaces tabs + landing |
| Editor | `HomeView` + module `GraphEditor` | *Main* | Direction A bottom bar |
| Evaluate | `Window{Extensions,Ranking,Serialisation}` | *Evaluate*, *EvaluateRanking* | one sheet, all kinds |
| Export | `WindowExport` | *Export*, *ExportSvg* | format picker + SVG preview |
| Menu | `MainMenu` | *Menu* | bottom sheet |
| Settings | `WindowSettings` | *Settings* | full screen |
| Relayout | `MainMenu` submenu | *Relayout* | 8-layout sheet |
| Help | `WindowHelp` / `HelpControls` | *Help* | gesture sheet |
| Tutorials | `TutorialOverlay` | *Tutorial* | docked overlay |
| Generate | `GenerateView` | *Generate* | form + result |
| Glossary | `GlossaryView` | *Glossary* | searchable list |
| Per-type | module editors | *BafLink*, *IafEditor*, *AdfNode*, *PafProbabilities* | see below |

## The editor (View 2, *Main*)

Direction A — a fixed **bottom command bar** in the thumb zone, chosen over a floating
speed-dial because the app is editor-primary and visible actions beat hidden ones.

**Top bar:** switcher chip (left, with type badge + document name) · **Undo** · **Menu**
(hamburger, opens *Menu* sheet). Redo lives in the menu.

**Bottom command bar:** `Fit-to-view` · `Relayout` | **`Evaluate`** (primary) | `Export`.

- **Fit-to-view** is new and important: desktop centering is middle-click
  ([`GraphEditor.vue`](/src/modules/common/graph-editor/GraphEditor.vue), `handleMiddleClick` →
  `centerView`), which has no touch equivalent. Wire the button to the same `centerView` call.
- **Relayout** opens the *Relayout* sheet (below) rather than a hover submenu.
- **Evaluate** opens the *Evaluate* sheet.
- **Export** opens the *Export* sheet.

**Canvas gestures** (graph component already supports these on touch):

- **Double-tap** empty canvas → add an argument (already implemented via the
  `handleDoubleTap` synthetic-dblclick shim in `GraphEditor.vue`).
- **Tap** an argument → select its name + open the keyboard to rename.
- **Hold** an argument → delete it.
- **Hold + drag** to another argument → create an attack.
- **Drag / pinch** → pan / zoom.

Node **moving is intentionally unsupported** on touch — arrangement is done via Relayout +
Fit-to-view.

**Notifications** ([`NotificationsDisplay.vue`](/src/modules/common/notifications/NotificationsDisplay.vue))
render as a **top-center toast** that auto-dismisses (the bottom is occupied by the command
bar and sheets).

### On-canvas mode selectors (multi-type modules)

Desktop parks link-type and node-type controls on the canvas's left edge. On mobile they
become a small floating selector pinned **bottom-left** of the canvas (thumb-reachable, clear
of the graph). See per-type section.

## Sheets (replacing floating windows)

The desktop `FloatingWindow` already has a mobile branch, but it is not good enough — we
**start fresh** with proper bottom sheets: a drag handle, rounded top corners, a header
(title + close), a scrollable body, and where relevant a sticky footer. Reusable
`BottomSheet.vue` under [`src/modules/common/window/`](/src/modules/common/window/) is the
natural home; `FloatingWindow` consumers on mobile render `BottomSheet` instead.

### Evaluate (View 3, *Evaluate* / *EvaluateRanking*)

One sheet handles **all evaluation kinds**. Desktop keeps arrays of window instances
(`extensionInstances`, `rankingInstances`, `serialisationInstances` in each module's
`GraphEditor.vue`); each instance is a saved config (semantics + args + mode).

- A **scrollable chip row** at the top of the sheet **is** the saved-config switcher: each chip
  = one saved config, its icon marking the **kind** (extension / ranking / serialisation). Tap
  to switch; **`+`** adds a config — it picks the **kind only**; semantics defaults and is
  changed on the config's own tab.
- Only the **currently open** config highlights on the canvas (maps to desktop's `activeWindow`
  suppression logic).
- **Parameters** (collapsible): e.g. Semantics + Mode for extensions; Semantics for ranking.
- The **ⓘ** next to Semantics reveals a collapsible **glossary definition** — the entry title,
  its text, and the **reference-paper link** (book icon). This mirrors
  [`TermDefinitionBlock.vue`](/src/modules/common/tooltip/TermDefinitionBlock.vue): show the
  entry + its `reference` link, **not** a link to the full glossary.
- **Results** render per kind:
  - *Extension* — selectable set rows (`{a, c}`) that highlight their arguments on the canvas
    (green ring/fill), like `EvaluationResultGrid`.
  - *Ranking* — colored score chips **plus number badges on the nodes** (not a highlight);
    lattice semantics instead render an order `a ≻ c ≻ b`. Matches
    [`WindowRanking.vue`](/src/modules/abstract-argumentation/WindowRanking.vue).
  - *Serialisation* — sequence steps (straightforward once the above two exist).

Kind availability is **module-specific** (e.g. ADF exposes *interpretations* rather than
*extensions* — this is only a display name, the sheet skeleton is identical).

### Export (View 4, *Export* / *ExportSvg*)

Format-driven, matching [`WindowExport.vue`](/src/modules/common/export/WindowExport.vue) and
each module's `export.ts` (abstract: LaTeX, ICCMA, TGF).

- **Format picker** (*Export*): a one-tap share-link action up top, then formats grouped:
  - **Image** — SVG (and PNG later) → these open a **preview** screen.
  - **Code & data** — LaTeX (TikZ), ICCMA, TGF → **download directly**, no options.
- **Why the split:** the downloadable TikZ code is **identical regardless of style config** —
  the config only changes the `\usepackage[...]{argumentation}` line (copied separately) and
  the rendered **SVG**. ICCMA/TGF are unaffected too. So options belong only with the image.
- **SVG preview** (*ExportSvg*): the rendered diagram + an **optional** "Style options"
  disclosure (Argument/Name/Attack style, Node distance) marked "affects image", + Download /
  Copy. Style params come from the same `ExportStyleOptions` the desktop window uses.
- Format list is **per-module** (e.g. BAF adds a support-style option).
- Downloading LaTeX on a phone is low-value, so keep its path minimal (copy code + copy
  package line).

### Menu (*Menu*)

A bottom sheet holding everything not on the bottom bar, derived from
[`MainMenu.vue`](/src/modules/common/main-menu/MainMenu.vue):

- **Document:** New document, Open file…, Save to device, Generate random…
- **Edit:** Redo, Share link…
- **App:** Settings, Tutorials, Glossary, Help

### Settings (*Settings*)

Full screen, one control per setting from
[`useSettings.ts`](/src/modules/common/settings/useSettings.ts) /
[`WindowSettings.vue`](/src/modules/common/settings/WindowSettings.vue):

- **Appearance:** Dark mode (theme toggle), Graph style (default / high-contrast / minimal /
  library).
- **Graph defaults:** Physics mode (off / on), Show grid (off / on-drag / on), Grid type
  (square / rhombus), Grid cell size (slider), Snap to grid.
- **Tutorials:** Show hints.

Physics and grid toggles live **only** here (desktop exposes them via the `p`/`g` keyboard
shortcuts, which mobile lacks) — no bottom-bar buttons for them.

### Relayout (*Relayout*)

The bottom-bar Relayout button opens a two-column sheet with all eight layouts from
[`layouting.ts`](/src/modules/common/main-menu/layouting.ts): **Directed** (Top→Bottom,
Bottom→Top, Left→Right, Right→Left) and **Other** (Force-directed, Neato, Circular, Radial).
Tap applies via the existing `doLayout` path.

### Help (*Help*)

A gesture sheet rewritten for touch (replacing the desktop
[`WindowHelp`](/src/modules/common/help/WindowHelp.vue) / `HelpControls` mouse+keyboard
overview): double-tap = add, tap = rename, hold = delete, hold+drag = attack, drag/pinch =
pan/zoom, fit-view = recenter, plus the bottom-left selector note for BAF/iAF.

## Per-type interactions (Per-type editing page)

Each module adds interactions beyond plain AF. Two patterns: a **creation-mode selector**
(bottom-left of the canvas) and **tap-to-edit** (popover or sheet).

### BAF — attack vs support (*BafLink*)

- Bottom-left selector **[Attack | Support]** sets what a new edge will be (mirrors the
  desktop link-type switch; support drawn as a double line).
- Tapping an existing edge opens a small type popover to switch attack↔support or delete
  (replaces the desktop `ArrowSwitcher` / `LinkTypeSwitch`).
- Source: [`bipolar-argumentation/GraphEditor.vue`](/src/modules/bipolar-argumentation/GraphEditor.vue).

### iAF — uncertain arguments & attacks (*IafEditor*)

- Two stacked bottom-left selectors: **Argument [● | ◌]** and **Attack [→ | ⇢]** set the
  certainty of what you create next (dashed = uncertain, matching the app's `NodeOutline.DASHED`
  and double-link rendering).
- Tapping an uncertain node offers **Make definite / Delete**; an edge uses the same popover as
  BAF.
- Source: [`incomplete-argumentation/GraphEditor.vue`](/src/modules/incomplete-argumentation/GraphEditor.vue)
  (the desktop `#toolbar` definite/uncertain toggle becomes the selector).

### ADF — acceptance condition (*AdfNode*)

- Tapping a node opens a **condition sheet** with the formula input, a live preview, and —
  because mobile keyboards lack `¬ ∧ ∨ ⊤ ⊥`— an **operator keypad** plus **argument-atom
  chips** that insert into the formula.
- Replaces the desktop
  [`ConditionEditorBar.vue`](/src/modules/dialectical-argumentation/ConditionEditorBar.vue) /
  [`WindowConditionEditor.vue`](/src/modules/dialectical-argumentation/WindowConditionEditor.vue);
  reuse the `formula` / `formulaParser` logic and `FormulaEditor` internals.

### PAF — probabilities (*PafProbabilities*)

- The desktop
  [`ProbabilityEditor.vue`](/src/modules/probabilistic-argumentation/ProbabilityEditor.vue) is
  already a flat list, so it becomes a **sheet**: a slider + numeric value per argument and per
  attack.
- Entry point: in PAF the bottom bar carries an **extra Probabilities button** (right of
  Export). Tapping a node jumps to its row.

## Tutorials (*Tutorial*)

Tutorials are step-by-step and sometimes **wait for the user to interact** with the canvas or
evaluation, so they **cannot** be a separate full-screen view. Design from
[`TutorialOverlay.vue`](/src/modules/common/tutorial/TutorialOverlay.vue):

- A **docked card below the top bar**; the canvas and controls stay **live** underneath.
- Progress (step x/n + bar), title, body, **Back**, and **skip (✕)**.
- **Button-advance** steps show **Next**; **action-advance** steps show **"Waiting for you…"**
  and **spotlight the target** (e.g. a highlight ring on the Evaluate button with a pointer, or
  a spotlight on the canvas for "double-tap to add an argument"). The `advanceOn` /
  `advanceCondition` logic in `useTutorial` is unchanged.
- Anchored steps: instead of floating-ui placement beside small targets, dock the card and
  highlight the target in place.
- Tutorials **autostart** (per `defaultTutorialId`), so a separate tutorial picker
  ([`WindowTutorials.vue`](/src/modules/common/tutorial/WindowTutorials.vue)) is not required
  initially; the Menu → Tutorials entry can list them later.

## Standalone views

- **Generate** (*Generate*, [`GenerateView.vue`](/src/app/generate/GenerateView.vue)):
  parameter form — algorithm select, sliders + numeric inputs (arguments, attack probability,
  …), optional fixed seed, sticky Generate button, then a result card (stats + preview + Open
  in editor). The dynamic-parameter rendering already exists; only layout changes.
- **Glossary** (*Glossary*, [`GlossaryView.vue`](/src/app/glossary/GlossaryView.vue)):
  searchable, grouped list; each entry = title + definition + reference-paper link (same data
  as the eval ⓘ card).
- **Share-open** (`/share/:id`) and **Third-party** are read views — straightforward reflow, no
  dedicated mockups.

## Suggested implementation phases

1. **Foundation.** `useIsMobile()`; route/shell switch scaffolding; `BottomSheet.vue`; verify
   the graph component's touch gestures (especially hold+drag-to-link while node-move is
   disabled) on a device.
2. **Home + editor shell.** *Home* / *NewDoc*; the mobile `HomeView` shell with switcher chip,
   top bar, bottom command bar, Fit-to-view, toast notifications. Plain AF fully editable.
3. **Sheets.** Evaluate (extension first, then ranking + serialisation), Export (picker +
   SVG), Menu, Settings, Relayout, Help.
4. **Per-type interactions.** BAF, iAF, ADF, PAF selectors + tap-to-edit/sheets.
5. **Tutorials overlay** on mobile.
6. **Standalone views.** Generate, Glossary, Share, Third-party.

## Open questions

- Confirm hold+drag link creation works when node dragging is disabled on touch (blocks Phase
  1).
- Whether to also gate on `(pointer: coarse)` in `useIsMobile` for touch laptops/tablets.
- Landscape phones / small tablets: does the same mobile shell serve them, or do they fall back
  to desktop above 640px?
