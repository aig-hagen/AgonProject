# Extending AgonProject

This guide describes the extension points currently used by the application. AgonProject does not have a runtime plugin system; extensions are implemented in the source tree. See [Project structure](../architecture/structure.md) for directory ownership and [Coding conventions](./conventions.md) for shared implementation rules.

## Add an argumentation module

Each argumentation type implements [`ModuleConfig`](/src/app/home/moduleConfig.ts). Existing implementations are the best starting points:

- [Abstract argumentation](/src/modules/abstract-argumentation/moduleConfig.ts)
- [Bipolar argumentation](/src/modules/bipolar-argumentation/moduleConfig.ts)
- [Abstract dialectical frameworks](/src/modules/dialectical-argumentation/moduleConfig.ts)
- [Incomplete argumentation](/src/modules/incomplete-argumentation/moduleConfig.ts)
- [Probabilistic argumentation](/src/modules/probabilistic-argumentation/moduleConfig.ts)
- [Collective attacks](/src/modules/collective-attacks-argumentation/moduleConfig.ts)

A module config connects the application shell to the module's domain model. It supplies a stable `id`, document creation and internal IndexedDB serialization, examples, an editor component, portable save/load functions, and the supported evaluation kinds. Optional fields enable plain-text imports (`textImports`, e.g. ICCMA via `save/iccmaFormat.ts`), generation, publications, tags, and an under-construction state.

To register a module:

1. Create its directory under `src/modules/` with a model, `moduleConfig.ts`, and editor component. Follow the common module shape described in [Project structure](../architecture/structure.md#srcmodules--one-folder-per-argumentation-type).
2. Implement every required `ModuleConfig` field. The existing interface currently spells the initial-document field `initialCotent`; implementations must use that exact name.
3. Add the module's name and description under its stable ID in both locale catalogs at `src/localization/locales/{en,de}/messages/modules.ts`. Add localized tag metadata when introducing new tags.
4. Import the config and add it to the `modules` array in [`src/main.ts`](/src/main.ts). Array order is presentation order.
5. Add unit tests for the model and portable save/load boundary, including round trips and invalid input.

The editor component receives document state, history state, and the document ID. It emits changes and application commands according to [`EditorComponent`](/src/modules/common/graph-editor/graphEditor.ts). Argumentation editors normally adapt their model to the shared [`GraphEditor.vue`](/src/modules/common/graph-editor/GraphEditor.vue).

## Add examples

Examples are registered through `ModuleConfig.examples`. An [`Example`](/src/modules/common/examples.ts) provides a name, optional description, a `load()` function, and optionally `applyLayout()`.

Bundled example JSON files use the [native save format](../formats/save-format.md) with optional `name`, `description`, and `layoutType` metadata. Follow an existing module's `examples.ts` and `examples/` directory.

## Add auto-layout

Auto-layouts (the Layout menu, examples, share imports, generated graphs) all go through
[`layoutGraph`](/src/modules/common/graph-editor/layouting.ts), which translates a `LayoutGraph`
into Graphviz input: node boxes sized by shape, label and annotation, hyperedges via junction
points, and per-engine quirks. The Layout menu builds its graph from the editor state, so it needs
no module code.

For the other paths, a module's `layout.ts` exports `toLayoutGraph(content)` (nodes with their
label, shape and annotation; edges with one or several sources) and a `layout(content, layoutType)`
built on `applyGraphLayout`, which `moduleConfig.applyLayout` and `examples.ts` use. Follow the
[collective-attacks `layout.ts`](/src/modules/collective-attacks-argumentation/layout.ts).

## Add tutorials

Tutorials are wired into each module's `GraphEditor.vue`; they are not part of `ModuleConfig`. A module conventionally supplies basic and evaluation tutorials under `tutorials/` and explicitly appends [`commonTutorials`](/src/modules/common/tutorial/editor-navigation.ts):

```ts
const moduleTutorials = [basicsTutorial, evaluationTutorial, ...commonTutorials]
```

Pass the resulting list, a default tutorial ID, and any module-specific context to the shared graph editor. [`Tutorial`](/src/modules/common/tutorial/types.ts) defines the step content, anchors, placement, advancement behavior, and context-based conditions.

Tutorial progress is persisted by [`useTutorial`](/src/modules/common/tutorial/useTutorial.ts). When a step depends on a new domain action, expose an appropriate counter through `tutorialContextExtra`; existing module editors provide examples for uncertain elements, collective attacks, acceptance conditions, and probabilities.

## Add glossary entries

Each module keeps its glossary in `glossary/`: one Markdown file per term in `glossary/en/<key>.md` and `glossary/index.ts`, which builds the module's [`TooltipRegistry`](/src/modules/common/tooltip/tooltipRegistry.ts) with [`createGlossary`](/src/modules/common/glossary/load.ts) from the `en/` files plus any translations in sibling locale folders (see [localization](localization.md)). The file name is the term key, and keys must be unique across all modules.

```markdown
---
label: admissible
title: Admissible Set
reference: D95
---

A set $S$ is admissible if it is [[CF|conflict-free]] and [[defends]] all its members.
```

The optional `reference` names the defining publication by its key in [`publications.ts`](/src/modules/common/publications/publications.ts); an unknown key fails the build. An optional `short` field gives a shorter name for the glossary's term list, e.g. `NP` under the Complexity Classes heading instead of the full title.

The text before the first `##` heading is the definition shown in tooltips. It may contain KaTeX (`$…$`) and links to other entries (`[[key]]` or `[[key|label]]`). Anything after the first heading is the longer body, shown only on the glossary page: paragraphs, `##`/`###` headings, `-` lists, and `[@KEY]` citations of entries in [`publications.ts`](/src/modules/common/publications/publications.ts). [`glossaryData.test.ts`](/src/app/glossary/glossaryData.test.ts) checks that every link resolves.

Provide the module registry from its editor:

```ts
provide(TOOLTIP_REGISTRY_KEY, moduleGlossary)
```

Modules can merge the abstract-argumentation glossary with their own registry. Tutorials and evaluation result headers resolve `tooltipId` values through the registry provided by the active module.

## Add complexity results

A module can list known complexity results for its semantics in `complexity.ts` (see the AF and ADF modules): one row per semantics glossary key, one cell per reasoning problem, each with its source publication and a locator (theorem, table, page). Register the table in [`complexity.ts`](/src/app/glossary/complexity.ts) and add an overview entry to the Complexity glossary. Only add results a source states; a result that merely follows from one needs a `derived` reason and a review.

## Add exports

Modules define their available [`ExportConfig`](/src/modules/common/export/index.ts) objects in `export.ts`. They flow to three places: the LaTeX config drives the desktop **LaTeX studio** ([`WindowExport.vue`](/src/modules/common/export/WindowExport.vue)); the trivial formats (ICCMA, TGF) are surfaced as quick copy/download actions in the main menu's **Export** submenu (provided via `QUICK_EXPORT_KEY`); and the compact layout uses the export sheet. An export config contains:

- a stable `ExportFormatId` and technical display name;
- an `export()` function returning text and, optionally, an asynchronous SVG factory;
- an optional file extension, description, references, and lazy CodeMirror extension loader.

Use the [abstract-argumentation exports](/src/modules/abstract-argumentation/export.ts) as a representative implementation. The current output contracts are documented under [File formats](../formats/README.md).

LaTeX exports use the shared transformation in [`common/argumentation/export.ts`](/src/modules/common/argumentation/export.ts). SVG previews are rendered lazily by [`renderSvg.ts`](/src/modules/common/export/renderSvg.ts). Additional TeX packages are stored under `third-party/ctan.org/pkg/`, copied by `vite.config.ts`, and listed in the renderer's `data-tex-packages` configuration.

## Add evaluations

`ModuleConfig.evaluationKinds` tells the application shell whether a module provides extension, ranking, or serialisation entry points. The module editor supplies the corresponding window components and module-specific request/result mapping.

Shared evaluation UI and request infrastructure lives in [`src/modules/common/evaluation/`](/src/modules/common/evaluation/). Existing TweetyProject adapters under module `evaluation/` directories show how requests are constructed and responses are mapped to application argument IDs.

Desktop evaluation tools use [`FloatingWindow.vue`](/src/modules/common/window/FloatingWindow.vue), normally through [`BaseEvaluationWindow.vue`](/src/modules/common/evaluation/BaseEvaluationWindow.vue). The same evaluation body is hosted by the compact-layout evaluation sheet, so new evaluation UI must work in both hosts.

## Add layouts

Layout identifiers and icons are defined in [`main-menu/layouting.ts`](/src/modules/common/main-menu/layouting.ts). Labels come from the `editor.relayout.layouts` locale messages. [`GRAPH_EDITOR_LAYOUTS`](/src/modules/common/graph-editor/graphEditor.ts) controls which layouts are exposed in both desktop and compact interfaces.

Layout execution is implemented by [`graph-editor/layouting.ts`](/src/modules/common/graph-editor/layouting.ts). It maps the public layout identifiers to Graphviz engines: directional layouts use `dot`, force-directed uses `fdp`, and the remaining layouts use `neato`, `circo`, or `twopi`. Add the identifier, icon, localization keys, exposed-list entry, and engine handling together.
