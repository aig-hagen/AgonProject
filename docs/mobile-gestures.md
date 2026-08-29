# Mobile Gestures — Implementation Plan

The touch interaction model for the graph editor, redesigned from scratch. Today's scheme
overloads a single finger-press on a node (split only by a 250 ms timer and a 2 px slop)
while leaving one-finger drag on the canvas dead. This plan replaces it with a
**select-first** model driven by a reusable gesture layer.

> **Branch:** the whole of this plan — the gesture layer, the `graph-component` changes,
> and the override audit — is developed on the `docs/mobile-gesture-plan` branch.

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
4. **Gesture → action is declarative, not hard-wired code.** See the architecture below —
   reassigning a gesture is a binding edit, so we can iterate on "what feels intuitive"
   cheaply on real devices while still preserving input-specific desktop behaviour.

## Architecture: the gesture layer (Phase 0)

The core reason today's scheme is hard to change is that the `pointerdown` handler itself
decides what the gesture *means* (see `GraphComponent.vue` `onPointerDownNode`). Gesture
detection and action are fused. We split them:

```
  pointer events ──► GestureRecognizer ──► intent ──► BindingProfile ──► action
                     (one state machine)              (declarative rules)
```

- **GestureRecognizer** — consumes raw pointer events on the canvas and emits semantic
  **intents** tagged with the target (`node` / `edge` / `hyperlink` / `annotation` /
  `canvas`), target identity, input metadata, and geometry. It owns all thresholds
  (long-press duration, move slop, double-tap window). It emits nothing else — no side
  effects.
- **Intents** (the primitive vocabulary — the only things the recognizer knows):

  | Intent | Fired when |
  | --- | --- |
  | `tap` | down + up, no move past slop, within tap time |
  | `doubletap` | two taps within the double-tap window on the same target (used on canvas only) |
  | `drag` | down + move past slop (with `start` / `move` / `end` phases) |
  | `longpress-drag` | held past the long-press threshold, then dragged |
  | `pinch` | two pointers (scale + translate) |

- **BindingProfile** — declarative matching rules over target, intent, pointer type, button,
  modifiers, and module capabilities. The profile contract and defaults live in
  `graph-component`; Agon's shared `GraphEditor` composes a default input profile with the
  current module's overrides and passes the result to the component. This preserves
  desktop controls instead of forcing touch and mouse into identical bindings:

  ```ts
  const touchBindings = {
    'canvas:drag':           'pan',
    'canvas:pinch':          'zoom',
    'canvas:doubletap':      'createNode',
    'canvas:tap':            'deselect',
    'node:tap':              'select',
    'node:drag':             'move',
    'node:longpress-drag':   'connect',
    'edge:tap':              'select',
    'hyperlink:tap':         'select',
    'annotation:tap':        'activate',
  }

  const mouseBindings = {
    // Existing desktop behaviour stays intact.
    'canvas:primary-drag':   'pan',
    'node:primary-drag':     'move',
    'node:secondary-drag':   'connect',
    // ...click, wheel, hover, and keyboard-modified bindings
  }
  ```

  The notation above is illustrative; the typed representation may use rule objects rather
  than encoded strings. SetAF overrides touch `node:tap` to `addToGroup`. Node double-tap
  is deliberately unbound in every module; Rename lives in the selected node's action bar.

- **Actions** — thin functions that call existing `GraphComponent` / app APIs
  (`deleteElement`, `createLink`, `setViewport`, emit `select` / `activate`, …). Graph-native
  actions execute inside the component. App-domain actions are emitted with a typed internal
  target; Agon's shared editor maps it to a public document target before the shared or module
  editor handles it. The library never learns concepts such as ADF conditions or iAF certainty.

**One recognizer owns each pointer sequence.** The new recognizer replaces, rather than runs
beside, D3's gesture recognition for behaviours migrated to it. D3 may remain the movement /
zoom executor after an intent is accepted, but must not independently decide that the same
pointer sequence is a drag or zoom. The recognizer is an explicit state machine covering:

- pointer capture, `pointercancel`, lost capture, window blur, and component unmount;
- movement past slop before the long-press threshold → move; hold past the threshold and then
  move → connect; hold and release without dragging → ordinary selection;
- a second pointer cancelling any pending tap / long-press and promoting the sequence to pinch;
- exclusive tap vs. double-tap delivery (no two `tap` actions followed by `doubletap`);
- hit-test precedence for controls/labels, annotations, nodes, link/hyperlink hit areas, then
  canvas.

**Scope: pointer, not just touch.** The recognizer sits on **pointer events**, so mouse, touch,
and pen share one recognition system while their profiles can bind the same intent differently.
Inputs with no cross-over (mouse right-click, wheel, hover, keyboard chords) are additional,
more-specific rules (`canvas:wheel` → `zoom`, `node:ctrl-primary-drag` → `snapToGrid`); they
do not need a separate gesture system. This is also what lets us retire the desktop-side shims
listed below in one pass without changing established desktop behaviour.

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
| Rename | Rename in action bar | Node double-tap is unbound in every module. |
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
| ADF | Edit acceptance condition | Node bar → condition sheet; tapping the condition annotation activates the editor immediately. |
| PAF | Edit node / edge probability | Node & edge bar → probability sheet. |
| iAF | Toggle node certainty (definite↔uncertain) | Node bar — **new**; no per-node toggle exists today. |
| SetAF | Collective attack | Tap several nodes to build a source set (`node:tap` → `addToGroup`), then long-press → drag from any selected node to the target. Reuses the existing hyper-link source machinery. |

### Global (stay as visible buttons — discoverability beats hidden gestures)
| Fit-view · Relayout · Undo/Redo · Evaluation · Menu · Export · type/mode pre-selectors |
| --- |

The floating **action bar** anchors near the selected element (not a bottom sheet) so it
never covers the graph.

### Selection and action-bar ownership

The low-level `graph-component` owns gesture recognition, target hit-testing, selection
visuals, and the anchor geometry needed to place UI near the selected element. Its selection
event is a discriminated union for `node`, `edge`, and `hyperlink`; it contains the internal
target identity and current anchor geometry. `activate` is separate from `select` and may target
an annotation: in ADF, `annotation:tap` activates the annotation immediately, and the ADF editor
opens the acceptance-condition sheet without selecting the annotation or opening an action bar.

Agon's shared `GraphEditor.vue` maps internal identities to stable public document identities,
stores the authoritative selection across `setGraph` redraws, and renders/positions the common
action-bar shell. It supplies common actions such as Rename and Delete. Selection follows a
moved element and updated viewport, and clears when the target is deleted, the document changes,
or empty canvas is tapped.

Module `GraphEditor.vue` wrappers contribute typed action descriptors (label, icon, ordering,
danger state, availability, and callback) for their domain actions. For example, iAF contributes
`Mark uncertain` / `Mark definite`; its callback updates `IafArgumentData.uncertain` through the
normal immutable document/history path, after which the existing node-outline rendering reflects
the new value. The generic graph library has no certainty-specific API or state.

> **Design gate — CLEARED.** The action bar was mocked up and agreed before implementation
> (interactive mockup: <https://claude.ai/code/artifact/e7392e75-3688-490a-96e9-e23c870ba9b4>).
> The settled behaviour, which Phase 1+ builds to:
>
> - **Placement** — the bar follows the element, anchored above it with a connector tail. It
>   flips **below** when the element is near the top edge, and clamps inward with an 8&nbsp;px
>   margin near the sides so it never leaves the screen. It rides along as the element moves or
>   the viewport pans.
> - **Finger dodge** — the bar offsets a finger-radius clear of the contact point, so the thumb
>   that selected the element never covers the buttons.
> - **Ordering** — left to right: **common** actions (Rename) first, then the module's own
>   (Condition, probability, certainty, type switch…), then a separator and **Delete** pushed to
>   the far right in danger red, so a mis-tap never lands on delete.
> - **Overflow** — Rename and Delete stay visible; when the module action set is dense, the extra
>   module actions collapse into a `⋯ More` button that expands a stacked menu. The bar never
>   grows wider than the screen.
> - **Node vs. edge vs. set** — same shell, different contents. An edge bar drops Rename and may
>   carry Switch type. A SetAF multi-selection swaps the left cluster for a live count + **Attack
>   from set** + **Clear**, with the same anchoring and animation.
> - **Animation** — in: ~140&nbsp;ms fade with a small scale-and-rise from the anchor; re-anchoring
>   between elements slides rather than pops; out mirrors in; `prefers-reduced-motion` drops it.
>
> Per-module button sets are tabulated under [Suggested action layout](#suggested-action-layout)
> above. What is deliberately **left to Phase 4 on-device tuning**: the long-press threshold and
> connect affordance, whether the edge-type / iAF-mode pre-selector survives, and SetAF
> `node:tap` semantics (see [Open questions](#open-questions)).

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
   app needs a clean, typed selection signal for nodes, edges, and hyperlinks to drive the
   contextual bar. Also emit a separate typed `activate` event whose targets include annotations,
   for direct actions such as ADF annotation activation.
5. **Demote delete to an API call.** `deleteElement(ids)` already exists — the app's trash
   button calls it; the built-in hold-to-delete gesture goes away.

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

- **Phase 0 — Gesture layer. ✅ Core done.** Build `GestureRecognizer` + `BindingProfile` +
  intent and target types with unit tests. Add touch/pen and mouse defaults, including the
  explicit arbitration/cancellation state machine above. No behavior change yet: recognition may
  be observed behind a flag, but when an action is enabled its corresponding legacy D3/handler
  recognizer must be disabled atomically so both paths cannot fire. *This is the enabling step;
  everything else binds to it.*
  - **Landed** on `dev` in `../aig_graph_component` (`src/gestures/`), 28 unit tests, no app
    impact: `intents.ts` (vocabulary), `recognizer.ts` (state machine: tap / double-tap /
    drag / long-press→drag connect / pinch, plus cancel paths), `binding.ts`
    (`resolveAction` / `composeProfile` / `bindingsFromMap` with specificity + capability
    gates), `dom-adapter.ts` (`PointerAdapter` + `createDomHitTest`), `clock.ts` (injectable
    clock for testable timing). Commits `f1bf955`, `bb2bdd0`.
  - **Observe-only mount landed.** `GraphComponent.vue` now mounts a `PointerAdapter` +
    `GestureRecognizer` behind a `gestureObserveEnabled` config flag (default off), with
    `toCanvasPoint` wired to `d3.pointer(event, canvasGroup.node())` and the default DOM
    hit-test. It runs *alongside* the existing D3 handlers and only `console.debug`s the
    recognized intents — no action dispatch, no legacy path disabled yet. `EventTargetLike`
    was also fixed to genuinely accept real DOM elements. This is the seam where the atomic
    legacy-recognizer swap begins in Phase 1.
- **Design gate — Action bar. ✅ Cleared.** The floating action bar was mocked up and agreed
  (see the [prerequisite above](#selection-and-action-bar-ownership) for the settled behaviour and
  the mockup link). Phase 1+ is unblocked.
- **Phase 1 — Canvas + node basics.** Bind pan (1-finger), pinch zoom, canvas double-tap
  create, node tap select, and node drag move. Remove the two-finger-pan and touch→right-click
  paths in the library. Ship the floating action bar with Rename + Delete. Node double-tap has
  no binding.
- **Phase 2 — Edges.** Long-press→drag connect; tap-select edge; delete + switch-type in
  the edge bar; add select/delete support for SetAF hyperlinks. Retire the
  tap-cycles-a-popup type switcher.
- **Phase 3 — Per-module actions.** ADF condition, PAF probability, iAF certainty toggle
  (implemented in the iAF document model), SetAF collective-attack multi-select. ADF
  annotation tap emits `activate` and opens the condition editor immediately.
- **Override audit (runs alongside all phases).** As each area is touched, migrate the
  matching app-side override from the [audit table](#audit-reclaim-app-side-gesture-overrides)
  into the component and delete the app shim — both desktop and mobile.
- **Phase 4 — Polish & tuning.** Long-press duration, slop, connect affordance, haptics;
  on-device intuition passes (cheap now — each swap is a config edit).

### Delivery and verification across repositories

`AgonProject` consumes a built, vendored `@aig-hagen/graph-component` archive rather than the
sibling checkout directly. Each integration milestone therefore includes: a coordinated library
branch/commit, library build and tests, an updated package version/archive, `package.json` and
lockfile updates in AgonProject, and app type-check/unit/component tests against that archive.

Recognizer unit tests are necessary but not sufficient. Component tests cover mouse, touch, and
pen profiles; cancellation and pinch promotion; zoomed coordinate conversion; redraw and deletion
selection invalidation; SetAF source selection and hyperlinks; ADF annotation activation; and the
guarantee that every completed sequence triggers exactly one action.

## Decisions already made

Resolved with the maintainer (see conversation of 2026-08):

- **Core model:** select-first (tap selects, contextual bar acts).
- **Edge creation:** long-press then drag.
- **Node move on touch:** enabled (free drag).
- **Delete:** trash button in the action bar, not a hold gesture.
- **Rename:** action-bar button only; node double-tap is unbound everywhere.
- **ADF annotation:** tap activates the acceptance-condition editor immediately; the node bar
  also contains an Edit condition action.
- **Action-bar ownership:** `graph-component` owns selection/anchor primitives; Agon's shared
  editor owns the shell and common actions; module editors own domain mutations.
- **Input profiles:** one recognizer with pointer-specific bindings; existing desktop move/connect
  controls are preserved.
- **Creation alternatives:** node creation remains canvas double-tap and edge creation remains
  drag-based for now; visible alternative creation actions are deferred and can be added later.
- **Action-bar form:** floating toolbar, not a bottom sheet.
- **Action-bar layout (design gate cleared):** follows the element (above by default, flips below
  near the top edge, clamps 8&nbsp;px from the sides), offsets clear of the finger, orders actions
  common → module → Delete (far right, danger red), and overflows dense module actions into a
  `⋯ More` menu while keeping Rename/Delete visible. Mocked up and agreed
  ([mockup](https://claude.ai/code/artifact/e7392e75-3688-490a-96e9-e23c870ba9b4)).

## Open questions

- Exact long-press threshold and connect affordance (needs on-device feel).
- Does the persistent edge-type / iAF-mode pre-selector stay, given post-hoc switching now
  lives in the bar? (Leaning: keep it — it sets the default for the *next* edge.)
- SetAF: should `node:tap` always mean multi-select, or only after a first selection?
