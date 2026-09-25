# Graph component — wishlist

Changes we'd like in `@aig-hagen/graph-component` (vendored as
`third-party/aig-hagen/aig_graph_component/aig-hagen-graph-component-5.0.0-rc.24.tgz`). Each entry
says who needs it and what we do today instead. Line references point into
`src/modules/common/graph-editor/GraphEditor.vue` unless noted, and may drift.

Priority: **needed** (blocks a planned feature) · **nice** (removes a workaround or eases work).

Status (checked against the local `../aig_graph_component` worktree at `e743cb1`):
**✅ present** · **🟡 partial** · **⬜ not present**.

## Needed for the ABA semantic views

See [`aba-graph-representation.md`](aba-graph-representation.md) → _Semantic views_.

- **✅ Hyperlink arrow type.** `jsonHyperLink` and `createHyperLink` now accept `arrowType`, and
  `setLinkArrowType` targets both links and hyperlinks. Hyperlink arrow styles also survive JSON
  export/import.
- **✅ Dash style on hyperlinks.** `ArrowType.DASHED` applies to every source branch and the target
  branch, and survives JSON export/import. See _Link dash as real appearance_ below.
- **✅ Hyperlink colour reaches the source spokes.** Rendering now applies the hyperlink's colour
  to every source path as well as its target path.
- **✅ Self-attacking hyperlinks and self-loops.** Plain self-loops have a component screenshot
  test. Hyperlink path generation explicitly handles a source that is also the target, so
  `{a,b} ⇒ a` gets a distinct source branch rather than a zero-length path. Component screenshot
  tests cover self-attacking hyperlinks with circle, rectangle, and diamond targets.
- **✅ (nice) One-call read-only mode.** `setReadOnly(bool)` (or `readOnly` in `setDefaults`)
  blocks every GUI edit on top of the graph-level and per-element settings, which it leaves
  untouched, so switching back restores the previous state. Dragging nodes and annotations,
  selection, zoom and pan keep working.
  - To do on our side: the read-only `GraphView` can drop its `setDefaults` /
    `toggleHyperLinkCreationViaGUI` / `setNodesFixedPosition` combination for `setReadOnly(true)`.

## Beyond ABA — structural

- **✅ Link dash as real appearance** (needed; current consumer: iAF uncertain attacks).
  - Nodes already have a native dashed outline (`NodeOutline.DASHED` via `setNodeOutline`).
  - Links and hyperlinks now have the fixed `ArrowType.DASHED` appearance rather than an
    arbitrary `dashArray`. `setLinkArrowType` updates both, and the appearance is included in
    graph JSON.
- **✅ Incremental updates instead of full redraws** (nice, but it's the root cause of several
  workarounds). `updateGraph(json)` reconciles the displayed graph in place instead of rebuilding
  it. Nodes are matched by their imported `id`, links by source and target, hyperlinks by sources
  and target. Matched elements keep their internal ids and DOM; only properties that are present
  and differ are applied (omitted ones stay as they are). Missing elements are removed, new ones
  created, and events fire only for those changes. Zoom, pan, selection, annotations and badges
  survive. `setNodeImportedId(internalId, appId)` tells the component our id for a node created
  in the GUI.
  - To do on our side (in `GraphEditor.vue` unless noted):
    - [x] Bump the vendored `.tgz` to a build that includes `updateGraph` (rc.24).
    - [x] In `onNodeCreated` (~L705), after `idMapping.add(node.id, publicId)`, call
          `setNodeImportedId(node.id, publicId)`. Otherwise the next `updateGraph` can't match the node,
          and removes and recreates it.
    - [x] `state.redraw` calls `updateGraph` with the same JSON as `setGraph` (`buildGraphJson`).
          `setGraph` is only used for the initial render. Per-node extras (annotations, outlines,
          badges, label font size) are re-applied afterwards, and forgotten for re-created nodes.
    - [x] Positions: with physics on, the live positions are passed, so nodes don't snap back.
    - [x] The redraw path no longer saves/restores the zoom, clears `selection` (only when the
          selected element is gone) or `hyperLinkSources`, or re-runs `setupZoomAndDragObservers()`.
          `IdMapping` is still rebuilt from `getGraph`, but that's cheap now that ids are stable.
    - [x] Theme and style changes also go through `updateGraph`, which only calls `setColor` for
          the colours that changed.
- **⬜ Use the app's ids in the API and events** (nice). The library still uses internal numeric
  ids, so the wrapper keeps an `IdMapping` and rebuilds it on every `setGraph`. `importedId`
  exists, but events and setters still speak internal ids.
  - Wish: address nodes and links by the caller's id throughout.
  - Partly eased by `updateGraph`: internal ids now stay stable across updates, so `IdMapping`
    only needs new entries instead of a rebuild on every redraw.
- **⬜ Theme-aware colours** (nice). There is no public class/current-color theming API, and
  coloured arrow markers are still generated from concrete colour strings. The app therefore
  still needs to resolve `var(...)` / `color-mix(...)`, so
  `resolveCssColor` (~L402) mounts a probe `<span>` to resolve palette tokens, and we redraw on
  theme change.
  - Wish: accept CSS custom properties, or style via classes / `currentColor`, so theme switches
    are pure CSS.

## Adopted in rc.24

- [x] iAF uncertain attacks use `ArrowType.DASHED`; `applyLinkDash` and `LinkConfigs.dashArray` are gone.
- [x] Hyperlinks pass `arrowType` in JSON and on GUI creation; `applyHyperLinkSourceColor` is gone.
- [x] `getViewport()` replaces reading d3's private `__zoom` (`GraphEditor.vue`, `usePhysics.ts`).
- [x] Overlay/tutorial transform sync via `viewportChanged` instead of the zoom `MutationObserver`.
- [ ] `setReadOnly(true)` in the planned read-only `GraphView`.

## Nice — replacing workarounds in our wrapper

- **✅ Viewport getter + change event.** `getViewport()` returns `{ k, x, y }`, and
  `viewportChanged` reports user and programmatic changes. `setGraph(..., true)` preserves the
  current viewport.
- **⬜ Commit a label edit on blur.** The library still commits only after Enter; an ordinary blur
  removes the editor without applying the value. We fake an Enter keyup
  before the click blurs the input (~L1157).
- **🟡 `editNodeLabel` with select-all.** `editNodeLabel(id)` is public, but it focuses without
  selecting the existing value. We still reach into `#node-label-input-field` to preselect the
  text (~L191).
- **⬜ Double-tap creates a node on touch.** The gesture recognizer maps `canvas:doubletap` to
  node creation and has unit tests, but `GraphComponent.vue` doesn't mount it (only its types are
  imported). We still detect double-tap and dispatch a synthetic `dblclick` (~L1016).
- **⬜ Label styling API.** Colour and auto font size are still set by finding the label div in
  the DOM (`setNodeLabelColor`, `adjustNodeLabelFontSize` in `graphEditorUtils.ts`).
  - Wish: `setNodeLabelStyle(id, { color, fontSize })`, or a built-in auto-fit.
- **⬜ SVG export.** There is no `exportSVG`; we still serialise
  `.graph-controller__graph-canvas` ourselves (~L303).
  - Wish: an `exportSVG(): string` that inlines the styles.
- **⬜ Live drag events.** `nodesMoved` still fires on drop (and simulation completion), not on
  every drag frame. We watch node containers with a
  `MutationObserver` for in-progress positions (~L930).
- **⬜ Stable host/canvas access.** No host/canvas element getters are exposed. Several places
  (incl. `usePhysics.ts`) query internal class names
  like `.graph-controller__graph-host`.
  - Wish: exposed element getters, so internal renames don't break us.

## Later — converging the ABA editor onto the shared editor

The ABA theory editor is a custom SVG for now. To move it onto the shared editor we'd need:

- **✅ More node shapes.** `NodeShape.DIAMOND` is present (including rounded corners), and link
  geometry clips to its outline. Rounded rectangles are also supported through `cornerRadius`.
- **⬜ Typed link handles (ports).** Several drag handles per node, each creating its own link type.
  ABA uses a rule handle and a contrary handle, which must stay physically distinct.
- **✅ Editing an existing hyperlink's sources.** `addHyperLinkSource` and
  `removeHyperLinkSource` are public and emit source-change events. Removing from a two-source
  hyperlink converts the remaining branch into a regular link.
- **✅ Parallel links of different types.** Reciprocal regular links are detected independently
  of their appearance/type. They can use separated arcs or a split straight line, configured
  graph-wide or per link; links that would overlap a hyperlink are bent away from it.
- **✅ Link emphasis.** `setColor` addresses individual links and hyperlinks; for hyperlinks it
  now colours the target and every source branch.
