## Name Ideas
- kratos (power/strength; what winning an argument can confer)
- aporia (puzzlement/deadlock; the productive state of being stuck, often where Socratic dialogue begins)
- kosmos (order/beauty; the idea that a good argument has an elegant shape)
- agora (the central public space of a Greek city; the primary site of civic debate, commerce, and encounter)
- argnexus
- polyarg
- argkit
- argsuite
- argvault
- openarg :(
- platagon  Plato + Agon (agon = contest/debate in Greek)
- formagon
- argonline

## Bugs

### Physics simulation breaks when switching tabs
When physics simulation is enabled and the user switches tabs, the simulation state becomes inconsistent — needs investigation into how the `@aig-hagen/graph-component` lifecycle interacts with Vue's tab switching.

### Prob values / acc conditions stick to old position after nodes are moved
Probability value overlays (PAF) and acceptance condition overlays (ADF) are sometimes not repositioned when their node is dragged, remaining at the old coordinates until a re-render is forced.

### Weight badges render behind nodes/edges when moving nodes
Weight badges (ranking scores) smear behind nodes and edges instead of staying on top.

### Rename ICCMA file format to "AF"
Export format name "ICCMA" in the UI and `abstract-argumentation/export.ts` should be renamed to "AF" since thats the produced file name extension.

### No "Open AF" button on main screen
The blank-canvas home screen has no button to open/import an existing AF file; users can only create new documents or load examples.

### LaTeX export: node positioning needs improvement
Node coordinates from the graph editor do not translate well to readable TikZ output and need to be scaled/adjusted more during export.

### Fix Window Overflow
Floating windows can sometimes go outside the screen leading to a scrollbar appearing for the whole editor view.


## Potential Features

### Split View
Add the option to split the editor view to have two AFs next to each other

### Window Snapping
Make windows snap to the edge of the screen and potentially to each other

### Reference to Implementation
In addition to the literature reference, glossary entries could have a reference to their TweetyProject implementation.

### Separate Glossary View
Could implement a new subsite presenting the glossary.

### Include evaluation window state in shares
Shares currently only serialize graph content; evaluation window positions, open/closed state, and selected semantics are not included. Should be optional.

### Import from TGF and AF/ICCMA format
TGF and AF/ICCMA import is not implemented — only export exists.

### Convert between different AF types
Could add the option to convert between different AF types. Some cases are trivial, but other cases require an implementation of translation algorithms in TweetyProject first.

### Infer AF type on demand instead of strict editor distinction
Instead of locking a document to one AF type at creation, the type could be inferred or adapted from the graph's actual content — a larger architectural change which might also be overwhelming and some point and will also lead to several problems.

### Explanations for AFs
Add Explanation Evaluation to AFs; most of this still needs a backend implementation in TweetyProject first.


## Planned Features

### Settings
Add possibility to customize the app, ie, changing color scheme.

### SetAFs (Collective-Attacks Argumentation)
The TweetyProject Backend supports most relevant features already. Requires a support of set-edges in the `@aig-hagen/graph-component` to be implemented.

### BSAFs (Bipolar SetAFs)
Add support for Bipolar SetAFs; Depends on implementation of set-edges in `@aig-hagen/graph-component` and also required implementation in TweetyProject first.

### ABA (Assumption-Based Argumentation)
Add support for Assumption-Based Argumentation, including a rule input UI; should be relatively straightforward once BSAF is in place; backend in TweetyProject already exists.

### QBAFs and Gradual Semantics
Add support for Quantitative Bipolar Argumentation Frameworks with gradual semantics; depends on backend implementation in TweetyProject first.
