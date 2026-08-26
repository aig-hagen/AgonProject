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
- Reuse the existing **domain and application logic** (document models, evaluation queries,
  export functions, tutorials, settings, persistence). Some of that logic is currently coupled
  to desktop components, so extracting shared controllers and capability contracts is part of
  the work; the mobile implementation is not presentation-only.
- The underlying graph component (`@aig-hagen/graph-component`) already supports touch for
  everything **except moving nodes**, which is acceptable — hence relayout and fit-to-view
  become first-class mobile controls.

## Architecture: two layouts, shared controllers

[`App.vue`](/src/app/App.vue) only renders `<RouterView />`, but the components below it are not
yet thin shells: [`HomeView.vue`](/src/app/home/HomeView.vue) owns document lifecycle, history,
file operations and sharing, while the shared
[`GraphEditor.vue`](/src/modules/common/graph-editor/GraphEditor.vue) owns both graph commands
and desktop chrome. The first implementation step is therefore to establish presentation-neutral
contracts around that logic.

**Approach (chosen): separate presentation shells over shared controllers.**

- Add a reactive `useLayoutMode()` composable based on viewport width. Keep input capability
  detection (`pointer: coarse`, `hover: none`) separate: viewport decides the shell, while input
  capability decides gesture help and interaction affordances. Do not combine them into one
  boolean because narrow mouse windows and wide touch devices are both valid cases.
- Each route renders either the desktop or the mobile shell:
  - either a thin wrapper per route (`<HomeView>` vs `<HomeViewMobile>`), or
  - a single `<component :is=...>` switch in each view file.
- Extract a shared home controller from `HomeView`: documents, active document, loaded-document
  lifecycle, create/rename/delete, history, load/save, sharing, and notifications. Desktop and
  mobile home shells consume the same controller instead of instantiating parallel document
  state.
- Give the shared graph editor a presentation-neutral command surface (typed emits/injection or
  an exposed controller) for at least: `fitToView`, `applyLayout`, undo/redo state, opening the
  available evaluation kinds, export, settings, tutorials, and module-specific tools.
- Extract the bodies/controllers of floating windows from their desktop `FloatingWindow`
  wrappers. Desktop renders those bodies in floating windows; mobile renders them in sheets.
- Add a typed module capability contract for evaluation kinds, export formats, creation modes,
  and module-specific editors. The current `ModuleConfig.editorComponent` alone does not expose
  enough information for generic mobile chrome.
- Both shells continue to use
  [`useDocuments`](/src/modules/common/documents/useDocuments.ts),
  [`useTheme`](/src/modules/common/theme/useTheme.ts),
  [`useSettings`](/src/modules/common/settings/useSettings.ts),
  [`useTutorial`](/src/modules/common/tutorial/useTutorial.ts), evaluation queries, export
  functions, and persisted per-document UI state.

Rejected alternatives: CSS-only responsive breakpoints (the desktop paradigm — floating
windows, tab bar, mouse/keyboard controls — does not reflow into mobile); fully separate
apps/entry points (needless duplication of routing/bootstrap).

The main new presentation work remains two redesigns:
1. The desktop **floating windows** (`Window*.vue`) become **bottom sheets**.
2. The **graph canvas chrome** (a left-edge button cluster, mouse/keyboard controls) becomes a
   bottom command bar + on-canvas selectors + touch gestures.

## Navigation model

There is **no tab bar** on mobile. Documents are one-at-a-time, and a **switcher chip** in the
editor top bar is the hub:

- Tapping the chip opens **Home** (*Home* artboard), which absorbs both desktop surfaces it
  replaces — the tab bar and the landing page ([`BlankDocumentCanvas.vue`](/src/app/home/BlankDocumentCanvas.vue)):
  - **Documents** tab: switch between saved frameworks (open one marked). Each document's
    overflow menu preserves rename, save, and delete-with-confirmation; the screen also provides
    a deliberate "delete all" action rather than silently dropping the desktop tab controls.
  - **New** tab (*NewDoc* artboard): the type picker — the six module cards, each expanding to
    its examples + *Create new* + *Generate*.
- The switcher chip is also the **way back home** from the editor (it doubles as a home
  button).

The route paths remain unchanged ([`router.ts`](/src/app/router.ts)): `/`, `/generate`,
`/glossary`, `/share/:id`, `/third-party`. Within `/`, the mobile shell has three explicit
surfaces: `documents`, `new`, and `editor`. The surface must be represented in browser history
(recommended: a query parameter such as `/?surface=documents`) so Back, forward, refresh, and
shared URLs behave predictably. Opening the switcher pushes `documents`; selecting/creating a
document navigates to `editor`; Back returns to the previous surface.

Keep the active editor mounted while the Documents/New surface is shown (for example with
`v-show` or a stable parent controller). This preserves viewport, active evaluation, tutorial,
and module-tool state instead of recreating the graph every time the switcher opens.

The current document metadata stores only `id` and `name`. The "edited 2h ago" text in the Home
mockup is excluded from the initial implementation unless we explicitly add `createdAt` /
`updatedAt` fields and an IndexedDB migration.

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
| Per-type | module editors | *BafLink*, *IafEditor*, *AdfNode*, *PafProbabilities*; SETAF mockup needed | see below |

Mockups must be reconciled with this plan before implementation: add SETAF and the tutorial
picker; update Home document actions/timestamps, Settings tutorial reset, module-specific node
tap actions, Help wording, and the Export/ExportSvg option-effect labels and LaTeX flow. The
mockups illustrate layout but do not override the behavioral requirements below.

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

**Baseline canvas gestures** (subject to the per-module interaction table below):

- **Double-tap** empty canvas → add an argument (already implemented via the
  `handleDoubleTap` synthetic-dblclick shim in `GraphEditor.vue`).
- **Tap** an argument → the module's primary node action; plain AF uses rename.
- **Hold** an argument → delete it.
- **Hold + drag** to another argument → create an attack.
- **Drag / pinch** → pan / zoom.

Node **moving is intentionally unsupported** on touch — arrangement is done via Relayout +
Fit-to-view.

Tap, hold and hold-drag compete for the same pointer sequence, so the implementation must define
and test movement/time thresholds, cancellation, and visible pressed/selected feedback. A hold
must not delete after the pointer has moved far enough to begin link creation. Destructive actions
must also be available from an explicit contextual menu; gesture-only deletion is not sufficient
for discoverability or accessibility.

**Settled** (Decision #3, source for Help and tutorial wording):

| Module | Node tap | Node hold | Node hold-drag | Edge tap |
|--------|----------|-----------|----------------|----------|
| AF | Rename | Delete menu/action | Create attack | Delete menu |
| BAF | Rename | Delete menu/action | Create selected link type | Change type / delete |
| iAF | Context menu: rename, certainty, delete | Delete menu/action | Create selected attack type | Change certainty / delete |
| ADF | Open acceptance-condition sheet; rename is an action in that sheet | Delete menu/action | Disabled | Not applicable (links derive from conditions) |
| PAF | Open/jump to probability row; rename is a contextual action | Delete menu/action | Create attack | Open attack probability / delete |
| SETAF | Toggle source selection; contextual action provides rename | Delete menu/action | From selected source(s), create attack | Delete menu |

For iAF, PAF, and SETAF, tap is claimed by the type-specific action and **rename lives behind a
contextual menu** rather than being the direct tap — this removes the conflict between a generic
rename and type-specific editing. Phase 3 only needs the AF/BAF rows (for Help); the rest are
fixed here so Help wording and Phase 5 do not churn.

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

`BottomSheet` is an accessible modal primitive, not only a visual container. It must provide a
labelled dialog, focus trap and restoration, Escape/backdrop dismissal, a non-drag close action,
scroll containment, and reduced-motion behavior. It must account for
`env(safe-area-inset-bottom)`, dynamic viewport units, and the virtual keyboard/`visualViewport`.
Define one full-height snap point plus a content-driven default; dragging below the dismissal
threshold closes the sheet.

### Evaluate (View 3, *Evaluate* / *EvaluateRanking*)

One sheet hosts **all evaluation kinds**, but it does not flatten them into one result model.
Each evaluation kind supplies its own parameter and result body through the module capability
contract while the sheet owns only navigation, adding/removing configurations, and active-config
state. Desktop keeps arrays of window instances
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
  - *Serialisation* — preserve both existing modes: sequence enumeration and the interactive
    workflow for choosing initial sets, checking termination, stepping, resetting, and
    highlighting the partial extension.

Kind availability and result shape are **module-specific**. For example, ADF interpretations
use three-valued in/out/undecided results, not merely an alternative display name for extension
sets. The sheet skeleton is shared; the parameter/result component is not assumed identical.

### Export (View 4, *Export* / *ExportSvg*)

Format-driven, matching [`WindowExport.vue`](/src/modules/common/export/WindowExport.vue) and
each module's `export.ts` (abstract: LaTeX, ICCMA, TGF).

- **Format picker** (*Export*): a one-tap share-link action up top, then formats grouped:
  - **Image** — SVG (and PNG later) → these open a **preview** screen.
  - **Code & data** — ICCMA and TGF download directly. LaTeX opens a compact code view with
    Copy/Download, the package line, and the structural options that affect generated code.
- Split `ExportStyleOptions` in the UI by effect:
  - **Appearance** — Argument/Name/Attack/Support style changes the package line and rendered
    SVG but not the TikZ body.
  - **Structure** — Node distance, grid scale/snap and name shortening change TikZ coordinates
    or labels as well as the rendered SVG, so they must not live in an image-only path.
  - ICCMA/TGF are unaffected by either group.
- **SVG preview** (*ExportSvg*): the rendered diagram + an **optional** "Style options"
  disclosure with an effect label ("image only" or "image + TikZ"), + Download / Copy. Style
  params come from the same `ExportStyleOptions` the desktop window uses.
- Format list is **per-module** (e.g. BAF adds a support-style option).
- Downloading LaTeX on a phone is low-value, so keep its path minimal while preserving Copy
  code, Copy package line, Download, and the structural options above.

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
- **Tutorial progress:** Reset completed/autostarted tutorials.

Physics and grid toggles live **only** here (desktop exposes them via the `p`/`g` keyboard
shortcuts, which mobile lacks) — no bottom-bar buttons for them.

*Implementation note:* the existing [`WindowSettings.vue`](/src/modules/common/settings/WindowSettings.vue)
`<dialog>` already reads well and fits a phone screen, so it is **kept as-is on mobile** rather
than being reworked onto the sheet seam. It is the one core surface that does not move to
`WindowShell`/`BottomSheet` in Phase 3.

### Relayout (*Relayout*)

The bottom-bar Relayout button opens a two-column sheet with all eight layouts from
[`layouting.ts`](/src/modules/common/main-menu/layouting.ts): **Directed** (Top→Bottom,
Bottom→Top, Left→Right, Right→Left) and **Other** (Force-directed, Neato, Circular, Radial).
Tap applies via the existing `doLayout` path.

### Help (*Help*)

A gesture sheet rewritten for touch (replacing the desktop
[`WindowHelp`](/src/modules/common/help/WindowHelp.vue) / `HelpControls` mouse+keyboard
overview): double-tap = add, tap = rename, hold = delete, hold+drag = attack, drag/pinch =
pan/zoom, fit-view = recenter, plus the module-specific tap actions, BAF/iAF selectors, and
SETAF multi-source selection. Generate the wording from the primary-action table rather than
claiming tap always means rename.

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

### SETAF — collective attacks (mockup required)

- Tapping arguments toggles them into a visible **selected sources** set; selection must remain
  distinct from evaluation highlights.
- Holding and dragging from any selected source to a target creates a collective attack from all
  selected sources. With exactly one selected source it creates an ordinary single-source attack.
- Provide explicit **Clear selection**, **Rename**, and **Delete** actions so source selection
  does not make normal node management inaccessible.
- Tapping an existing collective attack opens a sheet/popover listing its sources and target,
  with Delete.
- Source: [`collective-attacks-argumentation/GraphEditor.vue`](/src/modules/collective-attacks-argumentation/GraphEditor.vue).

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
- Tutorials **autostart** as today (per `defaultTutorialId`), but Menu → Tutorials still opens a
  mobile picker based on [`WindowTutorials.vue`](/src/modules/common/tutorial/WindowTutorials.vue).
  It lists module basics/evaluation plus common navigation/advanced/export tutorials, shows
  completion, and supports start/restart. Autostart alone does not make the non-default tutorials
  discoverable.
- Until the mobile tutorial overlay and all of its target refs are implemented, disable tutorial
  autostart in the mobile shell; do not render the desktop floating overlay over an incomplete
  mobile editor.

## Standalone views

- **Generate** (*Generate*, [`GenerateView.vue`](/src/app/generate/GenerateView.vue)):
  parameter form — algorithm select, sliders + numeric inputs (arguments, attack probability,
  …), optional fixed seed, sticky Generate button, then a result card (stats + preview + Open
  in editor). The dynamic-parameter rendering already exists; only layout changes.
- **Glossary** (*Glossary*, [`GlossaryView.vue`](/src/app/glossary/GlossaryView.vue)):
  searchable, grouped list; each entry = title + definition + reference-paper link (same data
  as the eval ⓘ card).
- **Share-open** (`/share/:id`) keeps its loading/error/import behavior and must route directly
  to the newly imported document's editor surface. **Third-party** replaces its fixed sidebar +
  content columns with a single-column disclosure/list on compact screens. Both still require
  mobile acceptance coverage even though they do not need dedicated mockups.

## Implementation phases

0. **Contracts and parity baseline.** Inventory desktop actions for all six modules. Extract the
   home controller, graph command surface, window bodies/controllers, and typed module
   capabilities. Add tests around the extracted behavior before changing presentation.
1. **Platform foundation and device spike.** `useLayoutMode()` + separate input capabilities;
   surface/history model; accessible `BottomSheet.vue`; safe-area/dynamic-viewport utilities.
   On real iOS and Android devices verify double-tap creation, rename keyboard behavior,
   pan/pinch, hold, hold-drag linking with node movement disabled, link tapping, and SETAF source
   selection. Agree the gesture thresholds before continuing.
2. **Home + plain-AF editor shell.** *Home* / *NewDoc* with full rename/save/delete parity; the
   mobile editor with switcher chip, top bar, bottom command bar, Fit-to-view, relayout, undo/redo,
   menu, and toast notifications. Plain AF must be fully editable and survive switching surfaces,
   rotation, and keyboard opening.
3. **Core sheets.** Menu, Settings, Relayout, Help; extension evaluation first; Export picker,
   SVG preview, and corrected LaTeX flow. Extracted bodies must continue to render in desktop
   floating windows without regression.
4. **Advanced evaluation.** Ranking, ADF interpretations, PAF ranking/probability results, and
   serialisation sequence + interactive modes in the shared evaluation host.
5. **Per-type interactions.** BAF, iAF, ADF, PAF, and SETAF selectors/context actions/sheets;
   add the SETAF mockup before implementing it.
6. **Tutorials and standalone views.** Mobile tutorial overlay + picker, Generate, Glossary,
   Share-open, and Third-party.
7. **Hardening and release.** Complete mobile browser/device coverage, accessibility pass,
   performance/memory checks with many documents and evaluation configs, desktop regression,
   and documentation/help alignment.

Do not ship a partially replaced mobile shell between phases. Keep it behind a feature flag (or
merge only after the routes needed for a coherent mobile release are complete); otherwise phases
2–5 would expose missing evaluation, tutorial, or module actions.

## Acceptance and test matrix

Each phase adds tests for its behavior rather than deferring testing to the end.

- Enable Playwright projects for Mobile Chrome and Mobile Safari. Cover compact-shell selection,
  Documents/New/Editor browser history, document persistence, sheets, keyboard-visible layouts,
  and at least one create/edit/evaluate/export flow per module.
- Keep the existing desktop Chromium, Firefox, and WebKit projects as regression gates.
- Run a real-device smoke matrix on current iOS Safari and Android Chrome in portrait and
  landscape. Browser emulation is not sufficient for long-press, pinch, keyboard, safe-area, and
  download behavior.
- Test every gesture with touch and every action through its explicit button/menu alternative.
- Verify focus entry/containment/restoration, accessible names and status announcements, Escape
  behavior with a hardware keyboard, reduced motion, 200% text zoom, and minimum 44×44 CSS-pixel
  touch targets.
- Verify no horizontal overflow and no control hidden by browser chrome, safe areas, or the
  virtual keyboard at the supported viewport bounds.
- Verify desktop/mobile resizing does not duplicate document watchers, lose pending edits, reset
  active tutorials/evaluations, or leave stale highlights.

## Decisions required

1. **Compact-layout range.** Which phones/tablets receive the mobile shell, especially landscape
   phones and small tablets? Recommended default: compact layout below `768px`; input capability
   never changes the shell by itself. Validate this against the 640px legacy breakpoint before
   settling it.
2. **Home/editor history.** Query-backed `/` surfaces or internal overlay state? Recommended:
   query-backed `surface=documents|new|editor`, with the editor kept mounted underneath.
3. **Primary node taps.** Confirm or amend the per-module table above, particularly iAF, PAF and
   SETAF. This determines whether rename is direct or lives in a contextual action.
4. **Long-press deletion.** Should a hold delete immediately with an Undo toast, or open a
   contextual confirmation? Recommended: open the contextual action; reserve immediate deletion
   for an explicit button followed by Undo where feasible.
5. **SETAF source selection.** Confirm tap-to-toggle sources + hold-drag from the selected set, or
   choose a dedicated "Collective attack" creation mode. Recommended: dedicated creation mode if
   tap-to-select proves too disruptive to rename and normal navigation in the device spike.
6. **Document timestamps.** Add `createdAt`/`updatedAt` with an IndexedDB migration, or remove the
   relative-time labels from the mockup? Recommended initial scope: remove the timestamps.
7. **Evaluation navigation.** *Settled:* one aggregate **host sheet** owns the chip-row switcher,
   add/remove, and active-config state, while each kind keeps its own parameter and result body
   (no flattened result model). The host iterates the module's existing
   `extensionInstances`/`rankingInstances`/… arrays, so desktop stays N floating windows and mobile
   becomes one sheet over the same saved-config state. This requires extending the module
   capability contract (today `moduleConfig` only declares *which* kinds exist) so the host can pick
   the right parameter/result body per kind — that extension is Phase 3 work, not Phase 4.

## Technical validation gates

- Confirm hold+drag link creation works when node dragging is disabled on touch (blocks Phase
  1).
- Confirm the graph component can distinguish hold-to-delete from hold-drag-to-link with the
  agreed thresholds, including pointer cancellation and scrolling prevention.
- Confirm SETAF source selection and collective-link creation work without keyboard modifiers.
- Confirm iOS file download/copy/share behavior for SVG, LaTeX, ICCMA, TGF, and native save files;
  use the Web Share API as a progressive enhancement where file sharing is supported.
- Confirm resizing across the compact breakpoint can preserve one controller/editor instance; if
  it cannot, persist and restore all transient state deliberately before enabling live switching.
