# Export redesign — implementation plan

Desktop export gets reorganised around **Direction A**: the trivial formats leave the
export window and become menu actions; the window becomes a dedicated **LaTeX studio**.
Mobile (`ExportSheet` / compact layout) is **unchanged**.

Design mockups & rationale: <https://claude.ai/code/artifact/85633ddd-a7c3-41c6-8498-04320f3dbe6c>

## Decisions (settled)

- **LaTeX studio** is its own MainMenu entry _and_ the bottom toolbar button (opens the window directly).
- **Export** submenu holds the fire-and-forget formats:
  - ICCMA — copy + download
  - TGF — copy + download
  - Export image — direct `.svg` download of the graph snapshot (no preview popover)
- **Studio window** (regular layout only): no format dropdown; LaTeX only.
  - **Style row** leads (auto-fit grid; Support only shows when the module has supports).
  - **Editable code + live preview** side by side.
  - Two independent layers:
    - **Appearance style** = argument/name/attack/support knobs. Live in both states and own
      the `\begin{af}[…]` options.
    - **Node distance** is structural because it changes generated coordinates. It is live only
      while SYNCED and disabled while DETACHED.
    - **Structure** = the body lines. This is what can detach from the graph.
  - **SYNCED / DETACHED** model for the body:
    - SYNCED: `body = f(graph)`; graph edits regenerate it.
    - DETACHED: `body = custom text`; graph edits no longer touch it (they diverge).
    - Any CodeMirror document change not marked with our internal transaction annotation is a
      user edit and switches to DETACHED. Do not enumerate `userEvent` types.
    - **Reset to graph** regenerates the body → back to SYNCED (light confirm only if edited).
    - Graph is **never locked** (it's the main app surface).
  - Options ride on `\begin{af}[…]`; preamble is a constant `\usepackage{argumentation}` hint with its own copy.
  - Preview renders from the **current buffer** via `renderSvg(text)`; debounced on typing,
    immediate on knob change. Rendering errors are shown inline and stale renders cannot replace
    newer results.
- **v1 simplifications:** plain "detached" badge (no graph-changed snapshot diff); closing the
  studio discards its buffer and reopening always starts with a fresh SYNCED export of the current
  graph.

## Current architecture (for reference)

- `src/modules/common/export/WindowExport.vue` — desktop window: format `<select>` over
  `exportConfigs` + `__wysiwyg_svg__` sentinel; read-only CodeMirror; LaTeX style `<details>`;
  separate `\usepackage[…]` line; SVG preview from model.
- `src/modules/common/export/ExportSheet.vue` — compact/mobile sheet (card picker → detail screens). **Leave as-is.**
- `src/modules/common/export/index.ts` — `ExportConfig`, `ExportResult`, `ExportStyleOptions`, `ExportFormatId`, `ExportFileData`.
- `src/modules/<type>/export.ts` — per-module `availableExports` (LaTeX always; ICCMA/TGF for all but dialectical).
- `src/modules/common/argumentation/export.ts` — `exportLatexArgumentationCommon` (splices `afOptions` into `\begin{af}` for SVG only), `latexExportCommonConfig`.
- `src/modules/common/graph-editor/GraphEditor.vue` — hosts `MainMenu` + toolbar export button (both toggle `isExportOpened`); `provide(GRAPH_SVG_RENDERER_KEY, …)` at :303.
- `src/modules/common/main-menu/MainMenu.vue` — dropdown; has an `export: []` emit and a nested submenu pattern (Layout).
- `src/modules/<type>/GraphEditor.vue` — renders `<WindowExport :input :export-configs @export>`; re-emits `export` upward.
- `src/app/home/useHomeController.ts` `exportAsFile()` (:361) — receives `ExportFileData`, derives filename, `saveToFile`.

## Phases

### Phase 0 — Prep: shared types & injection key

- [x] Add a `QUICK_EXPORT_KEY` injection key (alongside `GRAPH_SVG_RENDERER_KEY` in `graphEditor.ts`) carrying `{ configs: ExportConfig<unknown>[]; getInput: () => unknown }` (typed pragmatically; the configs are already generic).
- [x] Each module `GraphEditor.vue` `provide(QUICK_EXPORT_KEY, { configs: availableExports, getInput: () => state.current.content })`. (Module editor is the ancestor of common `GraphEditor` → MainMenu can inject.)

### Phase 1 — Quick-export menu (additive; window still works)

- [x] New `Export` submenu in `MainMenu.vue` (follow the Layout submenu markup):
  - inject `QUICK_EXPORT_KEY` + `GRAPH_SVG_RENDERER_KEY`.
  - list non-LaTeX configs (`id !== ExportFormatId.Latex`): each row = copy + download (icons per mockup).
  - "Export image" row = download only; content from `graphSvgRenderer()` (skip row if renderer/`null`).
  - **copy** → inline `copy-to-clipboard` of `config.export(getInput()).text` (lazy, on click).
  - **download** → emit `ExportFileData { content, ending: config.extension ?? 'txt' }`.
- [x] Add a top-level **LaTeX studio** entry in `MainMenu.vue` (LaTeX/code icon) → emits the studio-open event. Keep it visible only when a LaTeX config exists.
- [x] Route the menu's download event up: add `export-file: [ExportFileData]` emit on common `GraphEditor.vue`; each module editor forwards it to its existing `export` emit (→ `exportAsFile`).
- [x] Rewire the bottom toolbar button (`exportButton`, currently `PhotoIcon`) to open the studio directly; swap the icon to a LaTeX/code glyph. **Icon: `CodeBracketIcon` (confirmed).**
- [x] Rename the MainMenu `export` intent to "open LaTeX studio" (both toolbar + menu entry drive `isExportOpened`).

### Phase 2 — Slim `WindowExport.vue` to the LaTeX studio

- [ ] Remove the format `<select>`, the `__wysiwyg_svg__` sentinel + all its branches, and the ICCMA/TGF text/code panels.
- [ ] Resolve the single LaTeX config from `exportConfigs` (find `codemirrorOptions !== undefined` / `id === Latex`); render nothing if none.
- [ ] Keep the compact branch (`layoutMode === 'compact'` → `ExportSheet`) untouched.
- [ ] Style controls out of the collapsed `<details>` → always-visible auto-fit grid (`repeat(auto-fit, minmax(~132px, 1fr))`); Support select still gated on `isBipolarDocument`; node-distance slider on its own row.

### Phase 3 — Two-layer model: editable code, live preview, SYNCED/DETACHED

- [ ] Make the CodeMirror editor editable (drop `EditorState.readOnly` / `editable(false)`).
- [ ] Buffer state machine:
  - `mode: 'synced' | 'detached'`; start `synced`.
  - Define one custom CodeMirror annotation for internal changes. Any `docChanged` update without
    that annotation is a user edit (including typing, deletion, paste, drop, undo, and redo) and
    switches to `detached`; no `userEvent` classification is needed.
  - All internal replacements carry that annotation and `Transaction.addToHistory.of(false)` so
    graph/style regeneration does not pollute CodeMirror undo history.
  - SYNCED: regenerate body from `input` (watch the document) + re-splice options from appearance
    knobs.
  - DETACHED: graph changes are ignored. Appearance knobs still re-splice the `[…]` options in
    place while preserving the body; node distance is disabled because it would regenerate body
    coordinates.
  - Treat the first `\begin{af}` as the canonical options marker. If a detached edit removes it
    or creates an ambiguous structure, leave the buffer untouched, show an inline validation
    message, and require Reset to graph before appearance knobs can be applied again.
- [ ] **Reset to graph** button (shown in DETACHED): regenerate `f(graph)` + options → `synced`; confirm only if the buffer differs from generated.
- [ ] Status badge: "Synced with graph" / "Edited · detached".
- [ ] Close/reopen lifecycle: on close cancel queued preview work and discard the buffer/mode;
  on reopen regenerate from the then-current graph and start SYNCED. This must be explicit because
  `WindowExport` stays mounted after its first open.
- [ ] Preview: render `renderSvg(currentBuffer)`; debounce (~500 ms) on typing, immediate on knob
  change. Track a monotonically increasing render generation so older async results are ignored.
  Keep the loading state, add an inline error state, and clear both when a newer render begins.
- [ ] Harden `renderSvg`: reject on script/render/post-processing failure, clean up its temporary
  wrapper on success or failure, and use a bounded timeout so malformed editable LaTeX cannot
  leave the studio rendering forever.

### Phase 4 — Options on environment + preamble hint

- [ ] Studio splices appearance options into `\begin{af}[…]` for the **copyable/saveable** text
  (not just SVG). Export a shared, tested helper from `common/argumentation/export.ts`; do not
  duplicate the current inline `afOptions` construction. Omit `supportstyle` when the document
  has no supports.
- [ ] Replace the separate `\usepackage[…]` line with a constant **preamble hint** `\usepackage{argumentation}` + its own copy button.
- [ ] Copy/Save export the full buffer (options + body). Save extension stays `tex`.

### Phase 5 — i18n, cleanup, checks

- [ ] Add/rename i18n keys in `src/localization/locales/{en,de}/messages/export.ts` (studio title, badges, "Reset to graph", "Export image", preamble hint, menu labels). German terms → hold for user review per project convention.
- [ ] Update `src/modules/common/tutorial/editor-export.ts`: remove the obsolete format-dropdown,
  collapsed-style-panel, and remembered-format instructions; explain the Export submenu and
  LaTeX studio instead.
- [ ] Remove now-dead code: `__wysiwyg_svg__` handling, the old package-line-with-options path if unused, unused imports.
- [ ] `npm run license-headers` for any new files; `npm run lint`, `npm run format`, `npm run format:check`, type-check.
- [ ] Automated tests:
  - option helper: insert/replace options, conditional `supportstyle`, missing/ambiguous `af` marker;
  - state machine: graph regeneration while SYNCED, detachment on any non-internal document change,
    ignored graph changes while DETACHED, appearance-option edits preserving the detached body,
    disabled node distance, Reset, and close/reopen;
  - preview scheduling: debounce, latest-render-wins, timeout/error, and temporary-wrapper cleanup.
- [ ] Manual verification (user checks visually — do **not** run the app):
  - Each module: studio opens from toolbar + menu; style row reflows (3 vs 4 knobs); Support only where applicable.
  - SYNCED: move a node → body + preview update. Change a knob → options + preview update.
  - DETACHED: edit code → preview follows, graph edits don't; appearance knobs still edit options;
    node distance is disabled; malformed/missing `af` marker shows validation; Reset restores;
    close+reopen = fresh SYNCED.
  - Export submenu: ICCMA/TGF copy + download; Export image downloads `.svg`.
  - Dialectical (LaTeX-only): submenu shows just Export image; studio works.

## Open / watch out

- `QUICK_EXPORT_KEY` generic typing across modules — keep it loose (`unknown` document) and cast in the menu, matching how `WindowExport` is already generic.
- Confirm the toolbar icon choice with the user (LaTeX vs. generic code/export glyph).
