# Desktop action inventory

Phase 0 reference for the [mobile layout plan](mobile-layout.md). It enumerates every
user-invokable action the desktop editor exposes today, so the mobile shell can offer
the same set through its own chrome without missing anything. Grouped into **global**
actions (shared by all six modules via the graph editor) and **per-module** extras.

Where an action already has a presentation-neutral entry point, it is noted:

- **cmd** — reachable through the `GraphEditorCommands` surface (`defineExpose`) on the
  shared [`GraphEditor.vue`](../src/modules/common/graph-editor/GraphEditor.vue).
- **emit** — emitted up to the module wrapper → home controller; the mobile shell calls
  the same handler.
- **gesture** — a canvas interaction, not a button.

## Global actions (all modules)

### Document lifecycle — `emit`
| Action | Notes |
| --- | --- |
| New | Blank document of this module type. |
| Load | Import a file from disk. |
| Generate | Only when the module sets `generateHref` (route link). |
| Save | Export the document to a `.json` file. |
| Share | Upload and copy a share link. |

### History — `emit`, state via `historyState`
| Action | Notes |
| --- | --- |
| Undo | Enabled when `historyState.canUndo`. |
| Redo | Enabled when `historyState.canRedo`. |

### View — `cmd`
| Action | Entry point today | Command |
| --- | --- | --- |
| Fit to view | middle-click canvas | `fitToView()` |
| Apply layout | main menu (8 layouts) | `applyLayout(layout)`, `GRAPH_EDITOR_LAYOUTS` |
| Toggle grid | `g` shortcut | `toggleGrid()`, state `gridVisibility` |
| Toggle physics | `p` shortcut | `toggleNodePhysics()`, state `physicsMode` |

Layouts: `TopToBottom`, `BottomToTop`, `LeftToRight`, `RightToLeft`, `ForceDirected`,
`Neato`, `Circular`, `Radial`.

### Panels — `cmd`
| Action | Command |
| --- | --- |
| Export | `openExport()` |
| Settings | `openSettings()` |
| Help | `openHelp()` |
| Tutorials | `openTutorials()` |

### Canvas — `gesture`
| Action | Desktop gesture | Mobile decision |
| --- | --- | --- |
| Create node | double-click empty canvas | double-tap (already handled) |
| Delete node | node delete affordance | hold → contextual menu |
| Edit node label | click label | tap label |
| Move node | drag | drag |
| Create link | drag node → node | drag |
| Delete link | link delete affordance | contextual menu |
| Switch link type | click link (when >1 type) | tap link |
| Snap to grid | `Ctrl`+drag | — (no coarse-pointer equivalent yet) |

### Evaluation — `emit`, declared via `evaluationKinds`
Every module offers **Extension** semantics (`open-extension-window`). Ranking and
serialisation are module-specific (below).

## Per-module extras

| Module | Link types | Hyperlinks | Module tools | Evaluation kinds |
| --- | --- | --- | --- | --- |
| **Abstract (AF)** | Attack | — | — | extension, ranking, serialisation |
| **Bipolar (BAF)** | Attack, Support → link switch | — | — | extension |
| **Collective (SetAF)** | Collective Attack | yes (create + delete) | tap-to-toggle sources (mobile) | extension |
| **Dialectical (ADF)** | Link | — | Condition editor (tap node → `ConditionEditorBar`); Interpretations window | extension |
| **Incomplete (iAF)** | Definite Attack, Uncertain Attack → link switch | — | Argument-type toggle (definite / uncertain), toolbar; node outlines mark uncertain | extension |
| **Probabilistic (PAF)** | Attack | — | Probabilities toggle (toolbar) → `ProbabilityEditor`; probability annotations; node overlay | extension |

### Module tool details
- **BAF / iAF** — a link-type switch (the `enableLinkSwitching` join) lets the user pick
  which relation the next drag creates. Two types each.
- **SetAF** — supports hyperlink (set-to-argument) creation and deletion. The mobile
  interaction for choosing a source set is **tap-to-toggle sources**, then hold-drag from
  the set.
- **ADF** — tapping a node opens a condition editor bar (`@node-created` and
  `@annotation-clicked` both route here); a separate Interpretations window lists models.
  Conditions render as node annotations.
- **iAF** — a toolbar toggle (`#toolbar` slot) switches between creating definite and
  uncertain arguments; uncertain nodes get a dashed outline (`node-outlines`).
- **PAF** — a toolbar toggle opens the `ProbabilityEditor`; probabilities render as node
  annotations, and a `nodeOverlay` slot draws extra canvas decoration.

## Windows in play

The mobile shell renders these bodies as sheets instead of floating windows. Direct
[`FloatingWindow`](../src/modules/common/window/FloatingWindow.vue) consumers:

- `WindowHelp`, `WindowExport`, `WindowTutorials`, `WindowSettings`
- `WindowConditionEditor` / `ConditionEditorBar`, `WindowInterpretations` (ADF)
- `WindowSerialisation` (AF), `ProbabilityEditor` (PAF)
- `BaseEvaluationWindow` — the shared base every `WindowExtensions` / `WindowRanking`
  instance flows through (extension/ranking bodies live in its slots, not in
  `FloatingWindow` directly).
</content>
