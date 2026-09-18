# Graph SVG export

Every graph editor provides a direct `.svg` export of the graph currently displayed on the canvas. It is available in both desktop and compact layouts and is independent of the LaTeX/TikZ preview.

The exporter clones the live SVG canvas and:

- inlines the computed presentation styles needed by the graph;
- removes editor-only elements such as the grid, hit boxes, drag previews, controls, and label editor;
- resets the current pan and zoom transformation;
- crops the output to the graph geometry with a 16-pixel margin;
- adds the SVG and XLink namespaces and explicit width, height, and `viewBox` values.

Because it serializes the live canvas, the result reflects current node positions, relation styles, labels, and the active application theme. It requires a mounted graph editor but does not require TeX, WebAssembly, or a backend service. On desktop it is a one-click **Export image** action in the main menu's **Export** submenu that downloads directly as an `.svg` file; in the compact layout it is offered through the export sheet.

The direct SVG option is supplied through `GRAPH_SVG_RENDERER_KEY`; it is not a module `ExportConfig` and has no `ExportFormatId`.

Implementation: [`renderGraphSvg.ts`](/src/modules/common/export/renderGraphSvg.ts), [`MainMenu.vue`](/src/modules/common/main-menu/MainMenu.vue) (the Export submenu), and [`ExportSheet.vue`](/src/modules/common/export/ExportSheet.vue).
