## Bugs and Issues

### General

- **[Enhancement]** double the request limit to the TweetyProject backend
- ~~The mode/type selector in the eval window does use a slightly different style than the semantics selector~~ — fixed: `PickerSelect` now renders the shared `GroupedSelect` on desktop too, so Mode/type matches Semantics exactly

### Mobile

#### Open items from the mobile-layout plan (plan now closed)

The `docs/mobile-layout.md` plan is closed; its remaining threads live here.

*Blocked on the real-device gesture work (all hinge on the same spike):*

- **[Spike — Phase 1]** Real-device gesture spike. On real iOS + Android, verify tap/hold
  node gestures with node-moving disabled: tap, hold-to-delete vs hold-drag-to-link
  disambiguation, pointer cancellation, scroll prevention, and agreed movement/time
  thresholds. Blocks the two items below.
- **[Feature — Phase 5]** iAF node context menu (rename / certainty / delete on tap). Needs
  the gesture spike's thresholds first.
- **[Feature — Phase 5]** SETAF (collective attacks) editing entirely: tap-to-toggle source
  selection distinct from eval highlights, hold-drag from selected sources to create a
  collective attack, Clear-selection / Rename / Delete actions, and tapping a collective
  attack to inspect its sources. Needs the gesture spike, a *collective attacks* mockup, and
  Decision #5 (tap-to-select vs a dedicated creation mode).

*Phase 7 (hardening) follow-ups:*

- **[Content]** Tutorial-step wording pass for mobile: audit each tutorial's steps against the
  settled mobile gestures / primary-action table and update copy (e.g. "double-tap to add",
  per-module tap actions). Scope unclear — needs a decision on which tutorials change.
- **[Perf]** Memory/perf profiling with **many evaluation configs** open (real device/profiler;
  emulated e2e can't prove it). Many-*documents* is already covered by `e2e/stress.mobile.spec.ts`.
- **[CI]** First-run validation of the new `Test` workflow: open a PR so it actually executes on
  Ubuntu — this is the first real **WebKit / Mobile Safari** coverage (they can't run on the Arch
  dev box) and the first time the workflow itself runs.
- **[Test]** e2e asserts evaluation *sheets open*, not backend-computed **results** (TweetyProject
  servers aren't up in e2e). Add result-level coverage if/when a backend is available in CI.

#### Home and document management

- ~~**[Bug]** home view: AF description text is truncated in the mobile accordion when expanded~~ —
  fixed: the description now drops its `line-clamp-2` while its card is expanded (collapsed cards
  still clamp). Note on "references are missing entirely": they aren't — every module has
  publications, but they only surface via a hover-only book icon (top-right of the desktop cards).
  Surfacing them on the card is a **[Design]** decision, still open.
- ~~**[Bug]** home view: expanding one mobile card warps the width of all cards~~ — fixed: the
  "new" surface reserves the scrollbar gutter (`scrollbar-gutter: stable`), so the scrollbar
  appearing no longer shrinks the content width.
- **[Enhancement]** no confirmation when deleting a document
- **[Decision needed]** "Document" should be renamed to something more fitting
- **[Design]** Switch document icons to AF type icon; like the ones in the home view. Blocked:
  document metadata only stores `{ id, name }`, so the AF type must either be persisted (small DB
  migration; existing docs need a backfill/fallback) or derived on load (read each doc's content
  on the home list). Decision pending.

#### Graph editor and interaction

- **[Bug]** The relayout sheet should disappear on selecting an option. This works in the browser mobile preview, but not on the actual phone (for AF, for ADF it works)
- **[Bug]** SVG doesnt render on mobile device; is this a general mobile problem?
- **[Enhancement]** Extension highlighting: could use some way to deactivate highlighting (other than clicking the extension again)
- **[Bug]** dont open keyboard on argument creation on mobile
- **[Design]** rethink the mobile command-action scheme from scratch; large rework of the command contract, needs changes to the graph-component
- ~~**[Enhancement]** add undo action to menu, next to redo~~ — done: Undo now sits above Redo in the mobile menu's Edit section
- **[Decision needed]** what happens with the hover tooltips on mobile? currently the highlighting shows, but they are not clickable. How can we handle this?
- **[Decision needed]** add some kind of toggle for physics mode: something that activated physics for a brief moment to let arguments adjust position. or something that enables pyhsics while pressed

#### ADF editing and evaluation

- **[Design]** ADF condition editor needs a rework: no argument name editing here; better design
- **[Enhancement]** compact eval sheet should resize to fit content: fit up to three rows of results, if more enable scroll, if less contract to fit content

#### Sharing and export

- **[Feature]** Per-share link preview cards. `index.html` now serves static Open Graph tags,
  so a shared link shows one *generic* branded card. To get a card specific to the shared
  framework, the `/share/:id` route must return server-rendered HTML with per-share `og:*` tags
  (title = framework name, description = arg/attack counts) — the share server currently only
  serves JSON. Stretch goal: a dynamic `og:image` rendering the actual graph (server-side
  SVG→PNG). Crawlers don't run JS, so this can't be done from the SPA.
- ~~**[Design]** Export sheet: Code&Data -> Text~~ — done: renamed the section header to "Text"
- ~~**[Design]** switch exprt logo to a share icon~~ — done: mobile export button now uses a share icon (desktop unchanged)
- ~~**[Enhancement]** export sheet should close when clicking the share link button~~ — done: share button emits `close`, closing the sheet

#### Settings and visual design

- ~~**[Bug]** settings toggles dont show the selected option visually; the default~~ — fixed: replaced `input.btn`/`:checked` join groups with an explicit `SegmentedControl` that shows selection clearly
- **[Design]** look of the bottom bar doesnt feel that nice, maybe redesign the buttons; not important now
- ~~**[Design]** mobile settings menu does actually need a pass to make it fit the mobile theme better~~ — done: settings now opens as a `BottomSheet` on mobile with grouped-card sections, shared with the desktop modal
- **[Design]** could update the creation-mode-switchers in the bottom left. visual style doesnt really fit well

#### Tutorials, glossary, and help

- ~~**[Bug]** Glossary AF-type Pills show wrong names; just use AF, BAF, etc; same for desktop~~ — fixed: pills/tabs now show the acronym (AF, BAF, ADF, …) on mobile and desktop
- **[Enhancement]** Several tutorials need updating; in particular also for mobile; update highlighting of next action on mobile
- **[Design]** tutorial start buttons look bad

#### Other
- Can we somehow enforce fullscreen on mobile? does that make sense?

## Features
- track last edited time per document; show on mobile

### Smooth graph recenter (animate `centerView`)
`centerView` (graph-component) currently jumps: internally it does the instant d3-zoom
`zoom.transform(selection, t)`. d3-zoom animates natively, so add an optional `duration`
param and pass a transitioning selection when set:
```js
const target = duration ? selection.transition().duration(duration) : selection
zoom.transform(target, d3.zoomIdentity.scale(k).translate(-x, -y))
```
Then have `fitToView` / the mobile eval re-fit pass ~250–300ms. Needs a graph-component
change + new rc tarball (it's the `@aig-hagen` package). Keep the sheet-close re-fit
instant/short so it doesn't feel sluggish.

### Mobile eval sheet: full-detent two-pane compare
At the `full` (~90dvh) detent, the mobile evaluation sheet should show a **second, one-off,
view-only** eval below a `Compare with` divider (`view only` + `✕` clear), so two evaluations
can be read side by side. Rules:
- Top pane = the switchable saved eval; **owns** the canvas highlight.
- Bottom pane = a one-off eval slot (own params + result), must **not** emit `highlight` — only
  one eval touches the canvas.
- Needs host-local state to hold the one-off instance (not in the saved chip list).
See the checklist in `docs/mobile-layout.md` (Evaluate UI rework).

### use tags to filter AF types
Tags are now defined and associated with each module (see `src/modules/common/tags.ts` and each module's `moduleConfig.ts`). In the future, those can be used to filter AF types; can also implement a search bar on the main page.


### Split Basic Tutorials into functional part and argumentation part
There should be a short tutorial, just for the controls, and one more detailed tutorial that explains in more detail the specifics of the argumentation formalism.

### Qualified Reasoners
Make available all (Semi-)Qualified Reasoners in the interface

## New Framework Types

### Extended AFs
- need to implement extended edges in graph-component
- extended attacks stored separately
- distinguish between extended and recursive-extended AFs?
- need TweetyProject endpoint
- take a look at the TweetyProject reasoner (performance)

### Weighted AFs
- How to incorporate the Semiring? Select in EvalWindow?
- alpha/beta parameters need to be setable in the EvalWindow as well
- need TweetyProject endpoint
- reconsider TweetyProject reasoners; can we extend that easily to have more semantics available? no
