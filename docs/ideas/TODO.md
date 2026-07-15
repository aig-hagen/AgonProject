## Bugs and Issues

- on drag to create edge: the arrow tip does sometimes not line up with mouse cursor
- PAF: arg probs do not show for new created arguments

## Features

### add tags to AF types
In the future, those can then be used to filter AF types; can also implement a search bar on the main page

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
- reconsider TweetyProject reasoners; can we extend that easily to have more semantics available?
