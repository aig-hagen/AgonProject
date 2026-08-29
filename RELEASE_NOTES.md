## Highlights

This release introduces a **select-first mobile graph workflow**: tap a node or edge to
open a floating action bar, then use clear, visible controls for common and
module-specific actions. It also adds a system-aware theme setting and improves the
accessibility of settings and graph controls.

## Mobile graph actions

- Tap a node or edge to select it and open an action bar anchored to the graph element.
- Rename and delete nodes from the action bar; delete or switch the type of supported
  edges from the same interface.
- The action bar follows its element while the graph pans, zooms, or moves, and flips or
  shifts to remain on screen.
- Revised the touch contract: drag from a node to create an edge, long-press then drag to
  move a node, drag empty canvas to pan, and tap empty canvas to clear the selection.
- Desktop mouse interactions remain unchanged.

## Module-specific actions

- **ADF:** open the selected node's acceptance-condition editor from the action bar.
- **PAF:** edit node and edge probabilities from the action bar.
- **iAF:** mark selected nodes definite or uncertain without closing the action bar.
- **BAF and iAF:** switch supported edge types from the selected edge's action bar.

## Themes and accessibility

- Choose **Light**, **System**, or **Dark** appearance; System follows the operating-system
  preference and updates automatically.
- Apply the saved theme before the app renders to avoid a flash of the wrong appearance.
- Use consistent, labelled segmented controls for theme, grid, snap, physics, and tutorial
  settings.
- Improved accessible labels for selection actions and incomplete-argumentation controls.

## Fixes and maintenance

- Route action-bar node and edge deletion through the document and history state, avoiding
  stale mappings, missing undo entries, and follow-up graph crashes.
- Harden touch selection and dragging, including node-label taps, pointer capture, and ADF
  drag handling.
- Updated the bundled graph component from 5.0.0-rc.11 to 5.0.0-rc.20.
- Added tests for system theme preference and documented the mobile gesture design and
  implementation status.
