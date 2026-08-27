## Bugs and Issues

### General

- **[Enhancement]** double the request limit to the TweetyProject backend

### Mobile

#### Home and document management

- **[Bug]** home view: some AF module description texts are truncated; references are missing entirely
- **[Enhancement]** no confirmation when deleting a document
- **[Decision needed]** "Document" should be renamed to something more fitting
- **[Design]** Switch document icons to AF type icon; like the ones in the home view

#### Graph editor and interaction

- **[Bug]** The relayout sheet should disappear on selecting an option. This works in the browser mobile preview, but not on the actual phone (for AF, for ADF it works)
- **[Bug]** SVG doesnt render on mobile device; is this a general mobile problem?
- **[Enhancement]** Extension highlighting: could use some way to deactivate highlighting (other than clicking the extension again)
- **[Bug]** dont open keyboard on argument creation on mobile
- **[Design]** rethink the mobile command-action scheme from scratch; large rework of the command contract, needs changes to the graph-component
- **[Enhancement]** add undo action to menu, next to redo
- **[Decision needed]** what happens with the hover tooltips on mobile? currently the highlighting shows, but they are not clickable. How can we handle this?
- **[Decision needed]** add some kind of toggle for physics mode: something that activated physics for a brief moment to let arguments adjust position. or something that enables pyhsics while pressed

#### ADF editing and evaluation

- **[Design]** ADF condition editor needs a rework: no argument name editing here; better design
- **[Bug]** in the eval sheet, the bottom row text does not actually stick to the bottom properly. when the result grid is not filled enough it moved up a bit. the same happens when scrolling a larger results grid to the end, where the bar moves up a bit
- **[Enhancement]** compact eval sheet should resize to fit content: fit up to three rows of results, if more enable scroll, if less contract to fit content

#### Sharing and export

- **[Decision needed]** The Web Share action includes "AF - AgonProject". Why? just plain link probably
- **[Design]** Export sheet: Code&Data -> Text
- **[Design]** switch exprt logo to a share icon
- **[Enhancement]** export sheet should close when clicking the share link button

#### Settings and visual design

- **[Bug]** settings toggles dont show the selected option visually; the default
- **[Design]** look of the bottom bar doesnt feel that nice, maybe redesign the buttons; not important now
- **[Design]** mobile settings menu does actually need a pass to make it fit the mobile theme better
- **[Design]** could update the creation-mode-switchers in the bottom left. visual style doesnt really fit well

#### Tutorials, glossary, and help

- **[Bug]** Glossary AF-type Pills show wrong names; just use AF, BAF, etc; same for desktop
- **[Enhancement]** Several tutorials need updating; in particular also for mobile; update highlighting of next action on mobile
- **[Design]** tutorial start buttons look bad

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
