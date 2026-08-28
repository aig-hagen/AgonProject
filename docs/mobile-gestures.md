# Mobile Gestures — Implementation Plan

The touch interaction model for the graph editor, redesigned from scratch. Today's scheme
overloads a single finger-press on a node (split only by a 250 ms timer and a 2 px slop)
while leaving one-finger drag on the canvas dead. This plan replaces it with a
**select-first** model driven by a reusable gesture layer.

Companion documents:

- [mobile-action-inventory.md](mobile-action-inventory.md) — the full action set the
  gestures must reach (global + per-module).
- The canvas library lives in a sibling checkout: `@aig-hagen/graph-component`
  (`../aig_graph_component`). Most of the real work lands there, not in the app.

## Design principles

1. **One finger always means the obvious thing.** Drag on empty canvas pans; drag on a
   node moves it. No more two-finger-only panning.
2. **Tap selects, a contextual bar acts.** Every destructive or module-specific action
   (delete, edge-type switch, probability, ADF condition, iAF certainty) is a button on
   the selected element's floating action bar — not a hidden gesture. This is what makes
   the scheme scale across all six modules without inventing new gestures per module.
3. **Only one timing-based gesture.** Long-press (then drag) means exactly one thing:
   *connect*. Because delete moved to a button, the hold is free to carry it, and the hold
   is the only thing separating *connect* from *move*.
4. **Gesture → action is a config table, not hard-wired code.** See the architecture
   below — reassigning a gesture is a one-line edit, so we can iterate on "what feels
   intuitive" cheaply on real devices.

## Architecture: the gesture layer (Phase 0)

The core reason today's scheme is hard to change is that the `pointerdown` handler itself
decides what the gesture *means* (see `GraphComponent.vue` `onPointerDownNode`). Gesture
detection and action are fused. We split them:

```
  pointer events ──► GestureRecognizer ──► intent ──► BindingMap ──► action
                     (tap / doubletap /               (a plain table)
                      drag / longpress-drag /
                      pinch)
```

- **GestureRecognizer** — consumes raw pointer/touch events on the canvas and emits
  semantic **intents** tagged with the target (`node` / `edge` / `canvas`) and geometry.
  It owns all thresholds (long-press duration, move slop, double-tap window). It emits
  nothing else — no side effects.
- **Intents** (the primitive vocabulary — the only things the recognizer knows):

  | Intent | Fired when |
  | --- | --- |
  | `tap` | down + up, no move past slop, within tap time |
  | `doubletap` | two taps within the double-tap window on the same target |
  | `drag` | down + move past slop (with `start` / `move` / `end` phases) |
  | `longpress-drag` | held past the long-press threshold, then dragged |
  | `pinch` | two pointers (scale + translate) |

- **BindingMap** — plain data mapping `"<target>:<intent>"` → action name. Passed in per
  module so overrides are declarative:

  ```ts
  const gestureBindings = {
    'canvas:drag':          'pan',
    'canvas:pinch':         'zoom',
    'canvas:doubletap':     'createNode',
    'canvas:tap':           'deselect',
    'node:tap':             'select',
    'node:doubletap':       'rename',
    'node:drag':            'move',
    'node:longpress-drag':  'connect',
    'edge:tap':             'select',
  }
  ```

  Swapping an action is then one line (e.g. `node:longpress-drag` → `node:doubletap` for
  connect). SetAF overrides `node:tap` to `addToGroup`.

- **Actions** — thin functions that call existing `GraphComponent` / app APIs
  (`deleteElement`, `createLink`, `setViewport`, emit `select`, …).

**Scope: pointer, not just touch.** The recognizer sits on **pointer events**, so it unifies
mouse, touch, and pen — the binding map covers desktop too, not only mobile. "Tap/click
selects" becomes one rule instead of two implementations that can drift. Inputs with no
cross-over (mouse right-click, wheel, hover, keyboard chords) are just extra, more-specific
rows in the same map (`node:rightclick` → `contextMenu`, `canvas:wheel` → `zoom`,
`node:ctrl-drag` → `snapToGrid`); they don't need a separate system. Doing this unified is
also what lets us retire the desktop-side shims listed below in one pass.

Building this first is what keeps every later "swap two gestures" change to a config edit,
and makes the recognizer unit-testable without a touchscreen ("long-press then drag emits
`connect`").

## Suggested action layout

### Canvas (empty space)
| Action | Gesture | Notes |
| --- | --- | --- |
| Pan | 1-finger drag | Reclaimed from today's two-finger-only pan. |
| Zoom | 2-finger pinch | Standard. |
| Create node | Double-tap | Unchanged from today. |
| Deselect | Tap empty | Dismisses the contextual bar. |

### Node
| Action | Gesture | Notes |
| --- | --- | --- |
| Select | Tap | Reveals the floating action bar. |
| Rename | Double-tap *(or Rename in bar)* | Fast path + discoverable fallback. |
| Move | 1-finger drag | Starts on the node, so it never fights pan. |
| Create edge | Long-press → drag to target | ~300 ms hold; node lifts + shows a connect glow to signal the mode switch. The hold is the only difference from Move. |
| Delete | 🗑 in action bar | No accidental deletes. |
| Module action | Button in action bar | See per-module table. |

### Edge
| Action | Gesture | Notes |
| --- | --- | --- |
| Select | Tap | Reveals bar. |
| Delete | 🗑 in bar | Consistent with nodes. |
| Switch type | Toggle in bar | BAF: attack↔support; iAF: definite↔uncertain. Replaces today's tap-cycles-a-popup. |
| Edit probability | Button in bar → sheet | PAF. |

### Per-module (all in the selected element's action bar)
| Module | Action | Location |
| --- | --- | --- |
| ADF | Edit acceptance condition | Node bar → condition sheet *(also tap the condition annotation directly)*. |
| PAF | Edit node / edge probability | Node & edge bar → probability sheet. |
| iAF | Toggle node certainty (definite↔uncertain) | Node bar — **new**; no per-node toggle exists today. |
| SetAF | Collective attack | Tap several nodes to build a source set (`node:tap` → `addToGroup`), then long-press → drag from any selected node to the target. Reuses the existing hyper-link source machinery. |

### Global (stay as visible buttons — discoverability beats hidden gestures)
| Fit-view · Relayout · Undo/Redo · Evaluation · Menu · Export · type/mode pre-selectors |
| --- |

The floating **action bar** anchors near the selected element (not a bottom sheet) so it
never covers the graph.

> **Prerequisite — the action bar must be designed and mocked up before implementation.**
> Everything module-specific hangs off this bar, so its exact behaviour is not settled by
> this plan and must be worked out first. Open questions the mockups need to answer:
> its shape and placement (does it follow the element, dodge the fingers, reflow near
> screen edges?); the exact button set and ordering per module; how it handles an element
> with many actions (overflow / grouping); its appearance for a node vs. an edge vs. a
> SetAF multi-selection; and how it animates in/out on select/deselect. Implementation of
> Phase 1+ should not start until these are mocked up and agreed.

## Required `graph-component` changes

The app-side shim in `GraphEditor.vue` should shrink; the interaction logic belongs in the
library:

1. **Remove the touch→right-click aliasing.** `pointerType === 'touch'` is currently
   force-routed into the delete-timer + instant-link-preview branch (`onPointerDownNode`).
   This is the root of the overload — delete it.
2. **Zoom filter:** allow single-finger pan. The filter today rejects `touches.length < 2`
   (`d3/zoom.ts`), so one finger on empty canvas does nothing.
3. **Node drag on touch:** the drag filter is mouse-only (`button === 0`, `d3/drag.ts`).
   Enable it for touch, and gate edge-creation behind a real long-press timer instead of
   firing a link preview on every touch-down.
4. **Emit a real `select` event.** `nodeClicked` fires on every `pointerdown` today; the
   app needs a clean select signal to drive the contextual bar.
5. **Demote delete to an API call.** `deleteElement(ids)` already exists — the app's trash
   button calls it; the built-in hold-to-delete gesture goes away.
6. **iAF certainty API.** Add a call to flip an existing argument's `uncertain` flag so the
   new node-bar toggle has something to invoke.

## Audit: reclaim app-side gesture overrides

While we are in the component adding the gesture layer, recheck the AgonProject code for
**awkward action/gesture overrides — desktop and mobile — that should be cleaned up or
implemented properly in `graph-component` itself** rather than patched from the app. Today
the shared `GraphEditor.vue` reaches into the library's private DOM (`querySelector` on
`.graph-controller__*` classes, synthetic events) to bolt on behaviour the library does not
expose. These are fragile (they break when the library re-creates its SVG) and are exactly
what the pointer-based binding map should absorb. Known cases to review:

| Override in `GraphEditor.vue` | What it patches | Target |
| --- | --- | --- |
| `handleDoubleTap` | Synthesizes a `dblclick` because `touch-action: none` kills native double-tap → create node. | Move into the component's own gesture layer. |
| `handleMiddleClick` | Middle-click on empty canvas → fit view. | A real `fit`/`select` binding, not an `auxclick` shim. |
| ctrl-snap pointer handlers | Ctrl + drag a node → snap-to-grid while dragging. | A `node:ctrl-drag` binding on the component. |
| rename-commit pointerdown | Tap outside during a label edit to commit and keep the keyboard closed. | Proper commit semantics in the component's label editing. |

This is a review pass, not a fixed list — the goal is that when the work is done the app
holds **no** gesture logic that pokes at the library's internals; all of it lives behind the
component's binding map. Fold the confirmed cleanups into the phases below.

## Implementation phases

- **Phase 0 — Gesture layer.** Build `GestureRecognizer` + `BindingMap` + intent types
  with unit tests. No behavior change yet; wire it in parallel to the existing handlers
  behind a flag. *This is the enabling step; everything else binds to it.*
- **Design gate — Action bar.** Develop and mock up the floating action bar (see the
  prerequisite above) and get it agreed. This blocks Phase 1+, since the bar carries every
  select-driven action.
- **Phase 1 — Canvas + node basics.** Bind pan (1-finger), pinch zoom, double-tap create,
  tap select, drag move. Remove the two-finger-pan and touch→right-click paths in the
  library. Ship the floating action bar with Rename + Delete.
- **Phase 2 — Edges.** Long-press→drag connect; tap-select edge; delete + switch-type in
  the edge bar. Retire the tap-cycles-a-popup type switcher.
- **Phase 3 — Per-module actions.** ADF condition, PAF probability, iAF certainty toggle
  (incl. the new library API), SetAF collective-attack multi-select.
- **Override audit (runs alongside all phases).** As each area is touched, migrate the
  matching app-side override from the [audit table](#audit-reclaim-app-side-gesture-overrides)
  into the component and delete the app shim — both desktop and mobile.
- **Phase 4 — Polish & tuning.** Long-press duration, slop, connect affordance, haptics;
  on-device intuition passes (cheap now — each swap is a config edit).

## Decisions already made

Resolved with the maintainer (see conversation of 2026-08):

- **Core model:** select-first (tap selects, contextual bar acts).
- **Edge creation:** long-press then drag.
- **Node move on touch:** enabled (free drag).
- **Delete:** trash button in the action bar, not a hold gesture.
- **Defaults pending confirmation:** double-tap-node = Rename everywhere; action bar is a
  floating toolbar (not a bottom sheet).

## Open questions

- Exact long-press threshold and connect affordance (needs on-device feel).
- Does the persistent edge-type / iAF-mode pre-selector stay, given post-hoc switching now
  lives in the bar? (Leaning: keep it — it sets the default for the *next* edge.)
- SetAF: should `node:tap` always mean multi-select, or only after a first selection?
