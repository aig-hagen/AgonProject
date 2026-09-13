# LaTeX and TikZ export

Every argumentation module provides a `.tex` export built around the bundled [`argumentation` LaTeX package](https://ctan.org/pkg/argumentation). The generated text is the `af` environment body; the export interface separately shows a `\usepackage[...]{argumentation}` line matching the selected appearance options.

Arguments are emitted with absolute positions. Ordinary attacks and supports use the package's relation commands. Module-specific information is represented as follows:

| Module | LaTeX representation                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| AF     | Arguments and `\attack` relations                                                               |
| BAF    | Arguments with `\attack` and `\support` relations                                               |
| IAF    | Uncertain arguments and attacks use the package's `incomplete` option                           |
| PAF    | Probabilities below `1` are rendered as argument annotations or attack suffixes                 |
| SetAF  | Multi-source relations use `\setattack`; single-source relations use `\attack`                  |
| ADF    | Acceptance conditions are rendered as formula annotations; derived links are emitted as attacks |

Argument names are escaped for LaTeX. ADF formula labels retain only letters, digits, and spaces when constructing formula references.

## Export options

The export interface currently exposes:

- Argument style: `standard`, `large`, `thick`, `gray`, or `colored`.
- Name style: `math`, `bold`, `monospace`, `monoemph`, or `none`.
- Attack style: `standard`, `large`, or `modern`.
- Support style for BAF: `standard`, `dashed`, or `double`.
- Node distance from `0.5` through `4`.

Node distance changes the coordinates written into the TikZ source. The current grid-cell scale setting is also included when converting on-screen pixel positions to LaTeX units.

## Rendered preview

On desktop, the LaTeX export can also be rendered to SVG using `@drgrice1/tikzjax`. Rendering loads a TeX WebAssembly environment and converts text in the result to paths. This generated preview can be copied or saved as `.svg`.

This preview is distinct from the direct [graph SVG export](./svg-format.md), which serializes the live editor canvas without LaTeX or TikZ.

Implementation: [`common/argumentation/export.ts`](/src/modules/common/argumentation/export.ts) and [`renderSvg.ts`](/src/modules/common/export/renderSvg.ts).
