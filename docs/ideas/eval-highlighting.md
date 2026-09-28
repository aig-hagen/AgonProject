# Evaluation highlighting — shared labeling

Unifies how evaluation results are painted on the canvas, across all modules.

## Problem

`Highlight.attackedByFirst` let the painter (`useHighlight`) guess which nodes an extension
attacks by walking **every** drawn link. Link types mean different things per module, so this
was wrong wherever a link is not an attack:

- BAF: supports (`DOUBLE`) counted as attacks; complex attacks of the chosen support type ignored.
- IAF: uncertain attacks counted like definite ones.
- ABA: theory-view links are rules; BSAF double links are supports; always-out assumptions have
  no edge at all.

## Design

```text
module                                 common/evaluation                     graph-editor
──────                                 ─────────────────                     ────────────
result + effective attack relation ─▶ extensionLabels(E, attacks) ─▶ labels ─▶ labelingToHighlight ─▶ useHighlight
       (per module / per view)         or a server labeling (ADF)                (palette + legend)     (pure painter)
```

- **Labels:** `nodeId → 'in' | 'out' | 'undec' | 'derived'`. `undec` paints the default color.
- **`extensionLabels(E, attacks)`:** `E` is in; the head of any attack whose tail is inside `E` is
  out. Attacks are `{ tail, head }`, so binary and collective attacks share one shape.
- **Effective attack relation, per module:**
  - AF: attacks · SetAF: collective attacks · IAF: definite attacks only
  - BAF: coalition → direct attacks; deductive → Tweety's mediated attacks (`a → b`, `c`
    transitively supports `b`); necessity → the same with supports reversed
  - ADF: the server's three-valued interpretation, no attack relation needed
  - ABA: computed in assumption space, mapped per view (below)
- **`useEvaluationFocus`:** one active evaluation window paints the canvas; closing the active
  window clears the highlight. Replaces the per-module `activeWindow` / `suppressed` plumbing.

### ABA

Compute once for an assumption set `E`: `Th(E)` (atoms derivable from `E`) and
`Att(E) = {b | ‾b ∈ Th(E)}`.

| View        | in               | out                       | derived          |
| ----------- | ---------------- | ------------------------- | ---------------- |
| Theory      | assumptions in E | assumptions in Att(E)     | atoms in Th(E)∖E |
| SETAF, BSAF | E                | Att(E)                    | —                |
| AF          | args with S ⊆ E  | args whose S meets Att(E) | —                |

Credulous/skeptical results are treated as `E` for now. Rule-edge and contrary highlighting are
deferred.

## Progress

1. [x] Labeling core + port all modules (fixes BAF, IAF); drop `attackedByFirst`
2. [x] `useEvaluationFocus` in every module editor
3. [x] ABA: assumption-space labeling, mapped per view; window + editor wiring
