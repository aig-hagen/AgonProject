# Extending

The AgonProject is still in early development.
Extension points are yet to be fully figured out, and no plugin mechanism exists.

Still, extending some common parts of the application is possible more simply than others. Those parts are described below.

## Add new argumentation types

You are not limited to argumentation types — any type of document can be added as long as you provide an appropriate editor.

If you want to add a new module, create a [`ModuleConfig`](/src/app/home/moduleConfig.ts) similar to the existing ones:

- [`abstractArgumentationModule`](/src/modules/abstract-argumentation/moduleConfig.ts) (AF)
- [`bipoloarArgumentationModule`](/src/modules/bipolar-argumentation/moduleConfig.ts) (BAF)
- [`dialecticalArgumentationModule`](/src/modules/dialectical-argumentation/moduleConfig.ts) (ADF)
- [`incompleteArgumentationModule`](/src/modules/incomplete-argumentation/moduleConfig.ts) (IAF)
- [`probabilisticArgumentationModule`](/src/modules/probabilistic-argumentation/moduleConfig.ts) (PAF)
- [`collectiveAttacksArgumentationModule`](/src/modules/collective-attacks-argumentation/moduleConfig.ts) (SetAF)

## Extending an existing argumentation type

### Modify examples

You can modify the examples provided for each argumentation by changing the list of `ModuleConfig.examples` of the associated module config.

### Modify exports

The available exports and how they are exposed to the user, are managed by the `ModuleConfig.editorComponent`. Currently they are registered when creating the [`<WindowExport/>`](/src/modules/common/export/WindowExport.vue) by passing [`ExportConfig`s](/src/modules/common/export/index.ts).

When adding new exports, you can follow the [exports provided for abstract argumentation](/src/modules/abstract-argumentation/export.ts).

#### Text

The simplest type of export just transforms the given model into text by returning an [`ExportResult`](/src/modules/common/export/index.ts) with `ExportResult.text` being set.

#### Text highlighting and folding

[`CodeMirror`](https://codemirror.net/) is used to display the returned text. `ExportConfig.codemirrorOptions.extensions` can be used to modify how CodeMirror behaves. For example, it can be used to add syntax highlighting.

#### Additional SVGs

In addition to text, an image (as SVG) can be provided by setting `ExportResult.svg`.

##### LaTeX export

The [export to LaTeX](/src/modules/common/argumentation/export.ts) is currently the most involved export and worth being explained in detail.

1. The model (e.g., arguments and attacks) is transformed to LaTeX source.
2. Under `ExportConfig.codemirrorOptions` an extension is added to add syntax highlighting and code folding.
3. Then the LaTeX source is then [`rendered to SVG`](/src/modules/common/export/renderSvg.ts)

Rendering the LaTeX source to an SVG is done by running a stripped-down TeX distribution provided by [@drgrice1/tikzjax](https://www.npmjs.com/package/@drgrice1/tikzjax) and doing some post processing:

1. Transform LaTeX source to an SVG with @drgrice1/tikzjax
2. Transform `<text/>` to `<path/>` so the SVG works even when the special fonts are not available in a viewer.

New LaTeX exports might require TeX packages that are not yet bundled by @drgrice1/tikzjax. In this case you have to add them to the bundle like we did for [`tikz-argumentation`](/third-party/ctan.org/pkg/argumentation/):

1. Create a folder (preferably with the official package name) under [/third-party/ctan.org/pkg/](/third-party/ctan.org/pkg/)
2. In that folder, create a folder with the version of the package.  
   e.g., [/third-party/ctan.org/pkg/argumentation/1.7 2026-06-20/](/third-party/ctan.org/pkg/argumentation/1.7%202026-06-20/)
3. There you have to put the content of the package.  
   You can download it, for example, from [CTAN](https://ctan.org/)
4. Extend the configuration of `viteStaticCopy` in the [vite.config.ts](/vite.config.ts) to copy the newly added files to `node_modules/@drgrice1/tikzjax/dist/tex_files/`
5. Add the package to `script.dataset.texPackages` in the [code for rendering SVGs](/src/modules/common/export/renderSvg.ts).

### Modify evaluations

The evaluation is the part with the least straightforward extensibility.
All new evaluations would require new implementation.

You can look at [`tweetyProject.ts`](/src/modules/abstract-argumentation/evaluation/tweetyProject.ts) for how to do a request to a backend (or local evaluation library) or how to add different kinds of evaluation.
Depending on what backends or evaluations are a added in the future, common interfaces for evaluation might arise.

In addition to evaluation logic, a UI is needed to display the results, like [`<WindowExtensions/>`](/src/modules/abstract-argumentation/WindowExtensions.vue).

## Extend Layouting

Layouting is managed by the [`<GraphEditor/>`](/src/modules/common/graph-editor/GraphEditor.vue). It is a transformation from nodes and links to new positions for nodes.

All current layouts use the [`neato` layout from GraphViz](https://graphviz.org/docs/layouts/neato/) through [`@hpcc-js/wasm-graphviz`](https://www.npmjs.com/package/@hpcc-js/wasm-graphviz).

You can add new layouting algorithms by:

1. Adding new layouts to [`export const Layout`](/src/modules/common/main-menu/layouting.ts)
2. Setting the name and icon in [`export const layoutDatas`](/src/modules/common/main-menu/layouting.ts)
3. Enabling them by adding them to the `:layouts-to-show` array passed to `<MainMenu>` inside the shared [`<GraphEditor/>`](/src/modules/common/graph-editor/GraphEditor.vue), e.g.:

     ```vue
     :layouts-to-show="[
       Layout.TopToBottom,
       Layout.BottomToTop,
       Layout.LeftToRight,
       Layout.RightToLeft,
       Layout.ForceDirected,
       Layout.Neato,
       Layout.Circular,
       Layout.Radial,
     ]"
     ```

   - and implementing how to handle them in `doLayout`, in the same file.

   Note that `<MainMenu>` is only instantiated once, inside the shared `<GraphEditor/>` — not per module — so this array applies to every argumentation type.

