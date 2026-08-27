## Bugs and Issues

- double the request limit per minute

### Mobile
- The relayout sheet should disappear on selecting an option. This works in the browser mobile preview, but not on the actual phone (for AF, for ADF it works)
- The device-share thing includes AF - AgonProject. Why? just plain link
- SVG doesnt render on mobile device
- home view: some text is truncated; refernces are missing
- maybe some way to deactivate highlighting (other than clicking the extension again)
- ADF condition editor needs a rework: no argument name editing; better design
- Glossary AF-type Pills show wrong names; just use AF, BAF, etc; same for desktop
- dont open keyboard on argument creation on mobile
- adf condition editor shouldnt dim canvas; same for prob panel
- no confirmation for deleting a document
- "Document" should be renamed to something more fitting
- Export sheet: Code&Data -> Text
- switch exprt logo to a share icon
- Switch document icons to AF type icon; like the ones in the home view
- Several tutorials need updating; in particular also for mobile; update highlighting of next action on mobile
- visual bug for ADF eval: switching between two evals shows totally scrambled letters sometimes (the reuslting interpretations)
- settings toggles dont show the selected option visually; the default
- rethink the mobile command-action scheme from scratch
- add undo to menu
- look of the bottom bar doesnt feel that nice, maybe redesign the buttons; not important now
- Dark Mode colors need another pass. In particular highlighting is weird (text color white, so hard to read on light colored arguments); in general other node styles are not worked out well for this
- the default blue button color could be customized to get a more unique feel
- mobile settings menu does actually need a pass to make it fit the mobile theme better
- what happens with the hover tooltips on mobile?
- could update the creation-mode-switchers in the bottom left. visual style doesnt really fit well

## Features
- track last edited time per document; show on mobile

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
