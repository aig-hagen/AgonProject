## Bugs and Issues

### Zooming breaks probability labels
Zooming in/out on the graph can cause probability labels to render incorrectly or disappear; the exact trigger condition is unknown and needs investigation.

### TweetyProject Server crashes on large PAF
Submitting a large PAF to the TweetyProject server can cause an out-of-heap memory error that crashes the server process entirely, with no graceful recovery.

## Potential Features

### Make Deductive/Necessary Reasoner available for all AF semantics
Currently restricted to bipolar semantics; this should be extended to cover all supported argumentation framework semantics for consistency.

### Improve tooltips for probabilistic AFs
The existing tooltips do not explain the probabilistic component; they should be updated to clarify what probability values represent and how they affect reasoning.

### Add tooltip/info display for AF type definition
There is no visible explanation of what each AF type means in the UI; a suitable location should be found to surface the definition of the currently active AF type.

### LaTeX export for SetAFs
LaTeX export is not yet supported for Set Argumentation Frameworks; the correct representation needs to be determined and implemented.

### Random generation of SetAFs
No random generation is available for SetAFs; a method needs to be devised that produces well-formed random SetAFs.

### ICCMA/TGF export for SetAFs
SetAF export in ICCMA/TGF format is missing; the existing ABA-ICCMA export format may be adaptable as a starting point.
