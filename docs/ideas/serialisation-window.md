# Serialisation window rework

Branch: `feat/serialisation-graph`.

## Goal

Replace the two separate modes (Sequences / Interactive) of the AF serialisation window with a
**serialisation graph**: a DAG whose nodes are states E (arguments accepted so far) and whose edges
are the initial sets S added in each step, as drawn in the serialisation slides.

- By default the window shows the full result of `get_sequences`, as a graph or as a list.
- The list is purely a list: sequences grouped by their extension (collapsed), independent of
  exploration.
- **Explore** (a toggle in the graph view) switches the graph to step-by-step mode: it starts at ∅
  and selecting a state expands it (`get_selection` + `is_terminal` on its reduct). Only then is
  the full query skipped, so exploring is also the way out for AFs where `get_sequences` times out.
- Selecting a state paints it on the canvas: E accepted, E⁺ rejected. Hovering previews it.
- Full α/β controls stay as they are (no semantics presets).

Out of scope for now: initial-set type badges, fading reduced arguments on the canvas (needs graph
component support), sequence explanations, TikZ export of the graph.

## Design

```text
┌ Serialisation ──────────────────────────────────┐
│ Selection [Admissible ▾]  Termination [Pref ▾]  │
├─────────────────────────────────────────────────┤
│ [Graph | List]                    [Reset] ◯ Explore │
│              {c}         {e}                    │
│      ┌→ {a} ───→ {a,c} ───→ ⟦a,c,e⟧            │
│  ∅ ──┤     ╲{d}                                 │
│      └→ {d} ──{a}──→ ⟦a,d⟧    ⟦ ⟧: double border │
├─────────────────────────────────────────────────┤
│ ∅ →{a}→ {a} →{c}→ {a,c}               [◀ Back]  │
│ Next: [{e}]                       Not terminal  │
│ 2 extensions · 3 sequences · 41ms    [copy][TeX]│
└─────────────────────────────────────────────────┘
```

- Columns are the longest-path depth from ∅; rows are ordered by the parents' rows.
- Only edges on the selected path and the selected state's outgoing edges carry step labels,
  three quarters along the edge; column gaps still fit every label so the layout doesn't jump.
- The selected state scrolls into view.
- Unexplored states have a dashed border; terminal states get a double border (ring).
- The view, the explore toggle and the explored graph persist in the window instance state; the
  explored graph is keyed by an AF fingerprint and the α/β keys, so a reload restores it.

## Phase 1

- [x] Plan
- [x] `evaluation/serialisationGraph.ts`: graph model, reduct, expansion/sequence merge, layout,
      paths, persistence (+ unit tests)
- [x] `evaluation/useSerialisationExplorer.ts`: reactive graph, expand / select / back / reset,
      request generations, starts only when exploring is on
- [x] `SerialisationGraphView.vue`: DAG rendering
- [x] `WindowSerialisation.vue` rewrite (toolbar, graph/list, detail strip, footer, highlight)
- [x] Instance state migration (drop `mode`, add `view` and `explored`)
- [x] i18n (en/de), CHANGELOG, user guide
- [x] lint, format, type-check, tests
- [x] Full result by default (`useSerialisationSequencesQuery`), explore as an explicit toggle
- [ ] Mobile compact detent: the host measures the results' first child as a row, which is the
      graph's font probe; let results declare `data-evaluation-row-height` (graph: 44px)
- [ ] Visual check by Lars (graph spacing, long edge labels, mobile sheet)
