# Graph layout — one way to hand a graph to Graphviz

Unifies how every module gets auto-layouts, so Graphviz sees the real graph: node sizes,
annotations, hyperedges.

## Problem

Five entry points each built their own Graphviz input, all as uniform circles with plain edges:

| Entry point                          | Modules                              |
| ------------------------------------ | ------------------------------------ |
| Layout menu (`doLayout`)             | all                                  |
| `examples.ts` `applyLayout`          | AF, BAF, iAF, ADF, PAF (copy-pasted) |
| share import `applyLayout`           | AF only                              |
| generator                            | AF only; the rest on a fixed circle  |
| ABA derived views (`getForceLayout`) | ABA                                  |

Lost on the way: diamond/rect sizes, annotations (ADF conditions, PAF probabilities, ABA
contraries), hyperedges (SETAF attacks, ABA rules), and parallel edges double-count.

## Design

```text
module content ──toLayoutGraph()──▶ LayoutGraph ──layoutGraph(g, Layout)──▶ positions
editor state   ──(generic)────────▶
```

- **`LayoutGraph`:** `nodes: { id, label, shape, annotation?, pinned? }`,
  `edges: { sources, target }`. Sizes derive from shape + label, never from the module.
- **`layoutGraph`** owns every engine quirk:
  - hyperedges: junction point for `dot`/`neato`/`fdp`; flattened for `circo`/`twopi`
  - pins: `neato` only
  - annotations: the node box grows downward; the centre is shifted back
  - parallel edges merged, self-loops dropped, `pack` for force layouts
  - one y convention (Graphviz y up → editor y down), stable node order
- **Per module `layout.ts`:** `toLayoutGraph(content)`; `moduleConfig.applyLayout` for all modules
  via one shared helper. Generated graphs use `ForceDirected`.

## Phases

- [x] 1. Common core: `LayoutGraph`, `layoutGraph`, DOT tests
- [x] 2. Layout menu builds a `LayoutGraph` from editor state
- [x] 3. Per-module `toLayoutGraph` + `applyLayout`; examples, share import, generator use it
- [x] 4. ABA derived views on `layoutGraph`
- [x] 5. Docs (`extending.md`), changelog, cleanup of `getNodePositions`/`getForceLayout`
