## Bugs and Issues

### desktop/general
- the dropdown for mode/supporttyxpe and iaf type selectors overflow the width of the actual selector
- need a ranking tutorial for AF
- setAF tutorials need update
- in editor -> generate random -> generate -> open in editor (opens the prev open AF not the new one)
- e2e tests based on the tutorial. does that make sense?
- some advance-on-action gaps in the eval tutorials remain; in particular the "select semantics and eval" step should be adjusted
- highlight result area in corresponding tutorial step; missing for all modules except AF
- recenter graph on basic tutorial show in mobile

### Mobile
- if only one eval type exists open that immediately
- set-attack creation on mobile is still missing
- rename on mobile should select name text to allow easy override

- the select toolbar should disappear on any other interaction, ie panning or creating an edge somewhere etc
- make nodes react on interaction (pulse size or something); maybe also on hover

#### Home and document management

- show reference on main view cards
- **[Decision needed]** "Document" should be renamed to something more fitting
- **[Design]** Switch document icons to AF type icon; like the ones in the home view. Blocked:
  document metadata only stores `{ id, name }`, so the AF type must either be persisted (small DB
  migration; existing docs need a backfill/fallback) or derived on load (read each doc's content
  on the home list). Decision pending.

#### Graph editor and interaction

- **[Bug]** The relayout sheet should disappear on selecting an option. This works in the browser mobile preview, but not on the actual phone (for AF, for ADF it works)
- **[Enhancement]** Extension highlighting: could use some way to deactivate highlighting (other than clicking the extension again)
- **[Design]** rethink the mobile command-action scheme from scratch; large rework of the command contract, needs changes to the graph-component
- **[Decision needed]** add some kind of toggle for physics mode: something that activated physics for a brief moment to let arguments adjust position. or something that enables pyhsics while pressed

#### ADF editing and evaluation

- **[Design]** ADF condition editor needs a rework: no argument name editing here; better design
- ~~**[Enhancement]** compact eval sheet should resize to fit content: fit up to three rows of
  results, if more enable scroll, if less contract to fit content~~ — done: the sheet's lowest
  detent is now content-sized (BottomSheet `lowestDetentPx`), measured in EvaluationHost as chrome +
  the results grid capped to three rows; more rows scroll in the sheet body, fewer contract to fit
- ~~compact eval switcher: the drop-down list is clipped by the short sheet, and the add-kind picker
  is nested/awkward~~ — done: the switcher now floats upward from the header pill into the canvas
  above the sheet (teleported, flips down only if no room), and Add is an in-place list↔kinds swap

#### Sharing and export

- **[Feature]** Per-share link preview cards. `index.html` now serves static Open Graph tags,
  so a shared link shows one *generic* branded card. To get a card specific to the shared
  framework, the `/share/:id` route must return server-rendered HTML with per-share `og:*` tags
  (title = framework name, description = arg/attack counts) — the share server currently only
  serves JSON. Stretch goal: a dynamic `og:image` rendering the actual graph (server-side
  SVG→PNG). Crawlers don't run JS, so this can't be done from the SPA.

#### Settings and visual design

- **[Design]** look of the bottom bar doesnt feel that nice, maybe redesign the buttons; not important now
- **[Design]** could update the creation-mode-switchers in the bottom left. visual style doesnt really fit well

#### Tutorials, glossary, and help

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
