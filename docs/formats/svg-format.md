# Graph SVG export

Every graph editor provides a direct `.svg` export of the graph currently displayed on the canvas. It is available in both desktop and compact layouts and is independent of the LaTeX/TikZ preview.

The export comes from the graph component's `exportSVG()`, which clones the live SVG canvas and:

- inlines every computed style that applies on screen, including our stylesheets and CSS variables;
- turns CSS transforms (e.g. the squashed arrowheads) into plain `transform` attributes;
- replaces the HTML node labels with SVG `<text>`, keeping the on-screen line breaks, so tools like Inkscape render them;
- removes editor-only elements such as the grid, hit boxes, drag previews, label placeholders, and label editor;
- resets the current pan and zoom and crops to the graph with a 16-pixel margin;
- fills the background with the canvas colour, so dark-theme exports stay readable.

Fonts are referenced by name, not embedded.

Because it serializes the live canvas, the result reflects current node positions, relation styles, labels, and the active application theme. It requires a mounted graph editor but does not require TeX, WebAssembly, or a backend service. On desktop it is a one-click **Export image** action in the main menu's **Export** submenu that downloads directly as an `.svg` file; in the compact layout it is offered through the export sheet.

The direct SVG option is supplied through `GRAPH_SVG_RENDERER_KEY`; it is not a module `ExportConfig` and has no `ExportFormatId`.

Implementation: [`GraphEditor.vue`](/src/modules/common/graph-editor/GraphEditor.vue) (provides the renderer), [`MainMenu.vue`](/src/modules/common/main-menu/MainMenu.vue) (the Export submenu), and [`ExportSheet.vue`](/src/modules/common/export/ExportSheet.vue).
