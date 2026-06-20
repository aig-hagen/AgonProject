## Bugs and Issues

### Set Attack to Self
Needs implementation

### Interact with edge to Make them bend
That could be useful in combination with the LaTeX export

### Add grid directly to graph-component
Implement grid function directly in graph-component and export toggle for it. Should ideally also implement a snap-to-grid function and a scaling of the grid (relative to node size)

### The LaTeX export coordinate computation needs work
Very hard to have nodes aligned (might even be impossible right now). Need to completely rework this.

### Update document state elements
Stuff like the grid toggle or physics are currently not saved. once fully functional that should be changed. Need to keep in mind that physics should prob still be disabled in non-focused tabs

### Full Guided Tutorial System
Instead of the hints right now, have an (optional) tutorial that guides the user through all important functionalities step-by-step. Needs to be robust to misbehaviour and should ideally be quite dynamic. Need different/extra steps for other AF types