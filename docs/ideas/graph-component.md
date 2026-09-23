# Graph component — wishlist

Changes we'd like in `@aig-hagen/graph-component` (vendored as
`third-party/aig-hagen/aig_graph_component/aig-hagen-graph-component-5.0.0-rc.22.tgz`). Each entry
says who needs it and what we do today instead. Line references point into
`src/modules/common/graph-editor/GraphEditor.vue` unless noted, and may drift.

Priority: **needed** (blocks a planned feature) · **nice** (removes a workaround or eases work).

## Needed for the ABA semantic views

See [`aba-graph-representation.md`](aba-graph-representation.md) → *Semantic views*.

- **Hyperlink arrow type.** `jsonHyperLink` / `createHyperLink` take no `arrowType`, and
  `setLinkArrowType` only targets links. BSAF needs *collective support* (double arrow) next to
  collective attack.
  - Today: colour only, via `linkConfigs[type].color`.
- **Dash style on hyperlinks.** See *Link dash as real appearance* below. Hyperlinks can't be
  dashed at all today.
- **Hyperlink colour reaches the source spokes.** `color` on a hyperlink doesn't colour its source
  paths, so we restyle them via DOM (`applyHyperLinkSourceColor`, ~L1238).
- **Verify: self-attacking hyperlinks and self-loops.** BSAF produces `{a,b} ⇒ a` (target among the
  sources) and plain `a → a`. Check that both render legibly before relying on them.
- **(nice) One-call read-only mode.** Possible today, but spread over `setDefaults`
  (`allowNodeCreationViaGUI`, `nodeGUIEditability`, `linkGUIEditability`),
  `toggleHyperLinkCreationViaGUI`, and optionally `setNodesFixedPosition`. A single
  `setReadOnly(bool)` (or `editable: false` in the config) would make the read-only `GraphView`
  trivial.

## Beyond ABA — structural

- **Link dash as real appearance** (needed; current consumer: iAF uncertain attacks).
  - Nodes already have a native dashed outline (`NodeOutline.DASHED` via `setNodeOutline`).
  - Links don't: `LinkAppearance` has only `arrowType`. iAF sets `dashArray: '8 4'` in its link
    config, and `applyLinkDash` (~L1252) writes an inline `stroke-dasharray` onto the SVG path via
    `.graph-controller__link[id$="-link-…"]`. It's reapplied by hand after `setGraph`, on link
    creation, and on link type switch.
  - That's fragile: the library doesn't know the link is dashed, so any internal re-render of
    the path drops it, and it's absent from the library's own graph JSON.
  - Wish: `dashArray` (or a `LinkOutline` enum mirroring `NodeOutline`) in `LinkAppearance`, for
    links **and** hyperlinks, with a setter like `setNodeOutline`.
- **Incremental updates instead of full redraws** (nice, but it's the root cause of several
  workarounds). `setGraph` destroys and recreates the SVG. That's why we capture and restore the
  zoom, reapply dashes and hyperlink colours afterwards, re-query stale element references, and
  why a theme toggle forces a full redraw (`watch(isDark)` → `setGraph`, ~L544).
  - Wish: a diff/patch API (`patchGraph({ add, remove, update })`), or a `setGraph` that
    reconciles in place.
- **Use the app's ids in the API and events** (nice). The library uses internal numeric ids, so
  the wrapper keeps an `IdMapping` and rebuilds it on every `setGraph`. `importedId` exists, but
  events and setters still speak internal ids.
  - Wish: address nodes and links by the caller's id throughout.
- **Theme-aware colours** (nice). The library can't parse `var(...)` / `color-mix(...)`, so
  `resolveCssColor` (~L402) mounts a probe `<span>` to resolve palette tokens, and we redraw on
  theme change.
  - Wish: accept CSS custom properties, or style via classes / `currentColor`, so theme switches
    are pure CSS.
- **(idea) Multi-group node highlight.** Extension highlighting colours a node with one colour
  from its group. A node in several highlighted groups (overlapping extensions, or ABA
  assumptions across views) could show a split ring or stacked outline.

## Nice — replacing workarounds in our wrapper

- **Viewport getter + change event.** There's `setViewport` but no `getViewport`. We read d3's
  private `__zoom` off the canvas (~L1283) and watch the transform with a `MutationObserver`
  (`setupZoomAndDragObservers`, ~L888).
  - Also check whether `setGraph(…, restoreZoom)` now makes the manual capture unnecessary.
- **Commit a label edit on blur.** The library commits only on Enter. We fake an Enter keyup
  before the click blurs the input (~L1157).
- **`editNodeLabel` with select-all.** We reach into `#node-label-input-field` to preselect the
  text (~L191).
- **Double-tap creates a node on touch.** The host's `touch-action: none` blocks synthetic
  dblclick, so we detect double-tap and dispatch a fake `MouseEvent` (~L1016).
- **Label styling API.** Colour and auto font size are set by finding the label div in the DOM
  (`setNodeLabelColor`, `adjustNodeLabelFontSize` in `graphEditorUtils.ts`).
  - Wish: `setNodeLabelStyle(id, { color, fontSize })`, or a built-in auto-fit.
- **SVG export.** We serialise `.graph-controller__graph-canvas` ourselves (~L303).
  - Wish: an `exportSVG(): string` that inlines the styles.
- **Live drag events.** `nodesMoved` fires on drop. We watch node containers with a
  `MutationObserver` for in-progress positions (~L930).
- **Stable host/canvas access.** Several places (incl. `usePhysics.ts`) query internal class names
  like `.graph-controller__graph-host`.
  - Wish: exposed element getters, so internal renames don't break us.

## Later — converging the ABA editor onto the shared editor

The ABA theory editor is a custom SVG for now. To move it onto the shared editor we'd need:

- **More node shapes.** Diamond (ABA atoms), maybe rounded rect. Links need to clip to the shape
  outline. Today: `NodeShape` is `CIRCLE | RECTANGLE`.
- **Typed link handles (ports).** Several drag handles per node, each creating its own link type.
  ABA uses a rule handle and a contrary handle, which must stay physically distinct.
- **Editing an existing hyperlink's sources.** Add a source to, or remove one from, a hyperlink
  that already exists, e.g. by dragging onto its hub. That's the ABA rule body.
- **Parallel links of different types.** A rule `b → a` plus a contrary `a → b` must be drawn
  curved apart, not stacked. Check what the current 2-cycle handling does with mixed types.
- **Link emphasis.** Highlight or dim individual links and hyperlinks for explanation traces
  ("why is `a` out?"). Check whether `setColor` on link ids covers it.
