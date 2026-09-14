# User Guide

AgonProject is a browser-based workspace for constructing, evaluating, explaining, exporting, and
sharing formal argumentation frameworks. The public instance is available at
<https://agonproject.aig.fernuni-hagen.de/>.

## Supported frameworks

| Framework | Structure                                          | Evaluation                                       |
| --------- | -------------------------------------------------- | ------------------------------------------------ |
| AF        | Arguments and directed attacks                     | Extensions, argument rankings, and serialisation |
| BAF       | AF plus support relations                          | Extensions                                       |
| ADF       | Arguments with propositional acceptance conditions | Interpretations                                  |
| iAF       | Certain and uncertain arguments and attacks        | Extensions                                       |
| PAF       | Probabilities on arguments and attacks             | Extensions                                       |
| SetAF     | Attacks originating from sets of arguments         | Extensions                                       |

The exact semantics available in a selector depend on both the framework and the TweetyProject
backend. The in-app glossary gives definitions and publication references for supported concepts.

## Typical workflow

1. Create a blank framework, open a bundled example, import a saved document, or generate a random
   framework.
2. Add, connect, rename, move, or delete arguments in the graph editor. Undo and redo operate on
   document edits.
3. Open an evaluation window, choose a semantics and any parameters, and run it. Selecting a result
   highlights the corresponding arguments in the graph.
4. Save the portable JSON document, or export it as LaTeX/TikZ, ICCMA-style text, or TGF where the
   module supports that format.
5. Create a share link when somebody else should be able to open a copy.

The Tutorials menu provides guided versions of the editing, evaluation, navigation, and export
workflows. The Help menu lists mouse, touch, and keyboard controls.

## Documents and storage

Open documents, undo/redo state, and per-document window state are stored locally in the browser's
IndexedDB database. Settings and tutorial progress use browser storage. Consequently:

- documents do not automatically follow you to another browser or device;
- clearing site data removes local documents and preferences;
- a portable save file is the appropriate backup;
- the internal browser representation is different from the documented
  [native save format](./formats/save-format.md).

## Sharing and privacy

A share link uploads the portable serialized document to the share service. Anyone with the link
can retrieve its content, so do not put confidential information in a shared framework. Shares that
have not been accessed for more than one year expire.

The hosted application records limited anonymous usage events without cookies and honors Do Not
Track and Global Privacy Control. See the in-app Privacy page or the
[analytics documentation](./operations/analytics/README.md) for the exact event contract.

## Import and export formats

- Native JSON preserves names, positions, and framework-specific data and can be loaded again.
- ICCMA export is official ICCMA syntax only for AF. BAF, iAF, PAF, and SetAF exports are
  AgonProject extensions; see [ICCMA-style formats](./formats/iccma-format.md).
- [TGF](./formats/tgf-format.md) is intended for graph interchange and uses project-specific
  annotations for BAF, IAF, PAF, and SetAF.
- [LaTeX](./formats/latex-format.md) export opens the LaTeX studio on desktop: editable TikZ source
  beside a live rendered preview. ICCMA and TGF are one-click copy/download actions in the Export
  menu.
- [Graph SVG](./formats/svg-format.md) directly captures the live editor canvas on desktop and
  compact layouts, independently of the LaTeX preview.

When long-term round-tripping matters, use the native JSON format.
