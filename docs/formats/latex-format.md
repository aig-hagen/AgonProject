# LaTeX and TikZ export

Every argumentation module provides a `.tex` export built around the bundled [`argumentation` LaTeX package](https://ctan.org/pkg/argumentation). The appearance options are spliced onto the `\begin{af}[…]` environment, so the copied or saved figure is self-contained. The studio separately shows a constant `\usepackage{argumentation}` preamble hint (with its own copy button) that belongs in the document preamble.

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

## The LaTeX studio (desktop)

On desktop the LaTeX export opens in the **LaTeX studio**: an editable code buffer beside a live SVG preview rendered with `@drgrice1/tikzjax` (a TeX WebAssembly environment that converts text in the result to paths). The preview re-renders as you change the style options or edit the code — debounced while typing, immediate on an option change.

The code buffer stays **synced** with the graph until you edit it, at which point it **detaches** (a status badge shows _Synced_ / _Edited_) and graph changes no longer overwrite your edits; **Reset to graph** regenerates it and re-syncs. The preview is display-only; use **Save .tex** / **Copy code** for the source.

This preview is distinct from the direct [graph SVG export](./svg-format.md), which serializes the live editor canvas without LaTeX or TikZ.

Implementation: [`common/argumentation/export.ts`](/src/modules/common/argumentation/export.ts), [`renderSvg.ts`](/src/modules/common/export/renderSvg.ts), and [`WindowExport.vue`](/src/modules/common/export/WindowExport.vue).
