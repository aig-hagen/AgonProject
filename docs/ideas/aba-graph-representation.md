# ABA graphical representation — modeling vs. reasoning

Design notes for a future **assumption-based argumentation (ABA)** module. Captured before
building, so the core split (what the user edits vs. what the solver evaluates) is on record.

Prototype lives in the **ABA Studio** artifact
(<https://claude.ai/artifact/DjeP7i9dkcvMUgD4gpTE4A>) — that one covers the _flat_ case only.
Background reading: Berthold, Rapberger, Ulbricht, _Capturing Non-flat ABA with Bipolar SETAFs_
(KR 2024) — the **BSAF** (bipolar set-argumentation framework) instantiation used below.

Notation: `~a` = contrary of assumption `a`; `⊢` = tree-derivability; `A` = assumptions,
`L` = all atoms.

## The tempting idea (and why it bites)

A natural authoring graph: **all atoms are nodes**, and each rule is a collective (set-to-node)
edge, colored by its head:

```
rule  h ← b1..bn ,  h a contrary   →  collective ATTACK
rule  h ← b1..bn ,  h a plain atom →  collective SUPPORT
```

This is intuitive to draw, but it is **unsound as a uniform argumentation graph**. The reason is
one principle:

> **Rules derive. Contraries attack.** In ABA a rule never _is_ an attack — it only derives its
> head. The attack is a _separate_ fact: "that head happens to be some assumption's contrary."
> An attack is the composition `derive(head) ∘ (head is a contrary)`.

Coloring an edge by its head fuses those two moves into one. That is lossless only when a contrary
head does nothing _except_ be a contrary. Every failure below is a case where a head plays two
roles at once.

## Scenarios that don't model neatly

1. **Shared contraries.** `~a = ~b = x`: the single rule `x ← B` attacks _both_ `a` and `b`.
   BSAF edges are set-to-**single**-target, so one rule must split into several attack edges.
   Survivable, but "one rule = one edge" is already gone.

2. **A contrary head reused downstream — the killer.**

   ```
   x ← ⊤       (x is a fact;  x = ~a)
   d ← x       (d needs x)
   ~b = d      (d is b's contrary)
   ```

   ABA: `∅ ⊢ x = ~a` (attacks `a`) and `∅ ⊢ x ⊢ d = ~b` (attacks `b`) — **both a and b are out.**
   But if the coloring scheme "spends" `x` as an attack on `a`, then `d ← x` has no _supporting_
   node to stand on, `d` never derives, the attack on `b` never fires, and **`b` looks unattacked
   → wrongly "in".** The atom `x` had to be both "the attack on a" and "a derived fact feeding d";
   one colored edge cannot be both.

3. **The mirror failure — keep the contrary as a uniform node.** Then run Dung/BSAF semantics over
   all atoms:

   ```
   A = {a},  ~a = x,  rule:  x ← a
   ```

   ABA: `{a} ⊢ x = ~a`, so `{a}` attacks _itself_ → only extension is `∅`. The correct BSAF encodes
   this as a **self-loop on `a`**. But the uniform atom-graph has `a → x` (rule) and `x → a`
   (contrary) — a clean 2-cycle — so a Dung reading returns preferred extensions `{a}` and `{x}`.
   **Wrong**, because `x` is only true _parasitically_ (when `a` is); it is not a free choice.

   → Pinched both ways: consume contrary-heads and you sever derivations (#2); keep them as uniform
   nodes and you invent phantom choices (#3).

4. **Assumption-as-contrary + non-flat heads.** If `~a = b` with `b` an assumption (allowed:
   `~ : A → L`, and `A ⊆ L`), the contrary link lands on a node that is _also_ a free choice — and
   if `b` is itself rule-derivable (non-flat), that node is "true if assumed" OR "true if derived",
   with no principled tiebreak in a uniform graph.

5. **Dangling atoms.** A body atom that is never a head and not an assumption is simply _false_
   (underivable). A uniform AF semantics sees an unattacked node and labels it "in" — wrong, same
   root cause as #3.

## Why: atoms are _determined_, not _chosen_

ABA has two kinds of node obeying different laws:

```
assumption node   →  DEFEASIBLE    : true by default, retracted if its contrary is derived
ordinary atom     →  DETERMINISTIC : true iff some rule derives it from what is already true (Th)
```

Ordinary atoms are a _function_ of the assumptions — zero free choice. Dung AFs and BSAFs assume
every node is a free, defeasible argument, so putting deterministic atoms in as ordinary nodes
points the semantics at the wrong kind of object. (In bipolar-argumentation terms: plain-headed
rules are **evidential/necessary support** — the head can't hold unless grounded back to a fact —
while assumptions are **defeasible**. Mixing the two under one semantics is a known sore spot.)

## Can this graph instantiate ABA in general?

**As a uniform Dung-AF / BSAF (all nodes equal, one semantics): no.** The counterexamples above are
general, not pathological.

**As a two-tier structure: yes — but that is just ABA (an ADF) redrawn.**

```
tier 1 (deterministic):  atom p is IN  ⇔  some rule p←B has all of B IN     (monotone Th fixpoint)
tier 2 (argumentative):  assumption a is a free choice; a is attacked ⇔ ~a is IN;
                         conflict-free / defense / … over assumptions only
```

Sound, and matches ABA exactly — because it _is_ ABA. Each atom with an acceptance condition
(`OR` over rules, `AND` over bodies) and each assumption with "accept unless contrary holds" is
exactly an **ADF** (abstract dialectical framework — Brewka/Woltran). For the **flat** fragment this
collapses to the textbook result: flat ABA = normal logic programs (`stable ↔ stable models`,
`grounded ↔ well-founded`). Rock-solid for flat; delicate-but-known for non-flat (the KR-24 paper's
subject).

**Punchline:** the paper's BSAF is what you get by _contracting tier 1 away_ — compile out every
deterministic atom, keep assumptions as the only nodes, re-express derivations as collective
set-edges (their Def 3.5). Atoms are absent from the BSAF not by oversight but because they carry no
semantic freedom; keeping them as uniform nodes is the specific thing that breaks a uniform AF
semantics.

## Recommended architecture

Do **not** force one graph to be both the model and the reasoning object. Split them:

```
  ┌─────────────────────────────┐        compile         ┌──────────────────────┐
  │  ATOM GRAPH  (authoring)     │  ───────────────────▶  │  BSAF over A          │
  │  • atoms = nodes             │   contract tier 1      │  (assumptions only)   │
  │  • rule edges (derivation)   │   fold ~ into edges    │  collective R and S   │
  │  • contrary = overlay links  │                        │                       │
  └─────────────────────────────┘                        └──────────┬───────────┘
        what the user edits & sees                                  │ solve
        (rich, intuitive, faithful)                        TweetyProject ABA reasoner
                                                            or BSAF semantics (incl. Δ)
```

- The atom graph is a good **modeling surface** — keep atoms, rules, and contraries visible. But
  treat rules as plain derivation edges and contraries as a _separate overlay_ (the two-tier view),
  not as attack/support colors.
- **Evaluate** by compiling to the assumptions-only BSAF (or handing the ABAF straight to a solver).
  Never run flat Dung semantics on the atom graph.
- Going non-flat: default the semantics to the paper's **Δ-versions** (`co_Δ`, `gr_Δ`), which patch
  the "no admissible / no complete extension" pathologies otherwise inherited.
- Either target: nodes stay at `|A|`, but the collective edge relation can blow up to _all_ deriving
  subsets — compute **minimal supports/attacks only**.

## In-graph authoring — interactions, blockers, restrictions

Goal: assemble/modify the ABA theory _directly in the graph_, not only in a side panel.

**Drop the left/right tier split for editing.** The lanes in the mockup were didactic. They can't
survive an editor: non-flat rules put an assumption on both sides, and rule↔contrary cycles fold the
graph back on itself. Encode the tier in **node appearance** (amber rounded = assumption, neutral
squared = atom) and let position be free.

**The rule that shapes the whole editor:**

> Drawable primitives are `atom`, `rule (body→head)`, and `contrary (assumption→atom)`. Attacks and
> supports are **computed overlays — never drawn.** Two edge _tools_, not two edge _types_.

Drawing "attack"/"support" directly re-fuses `derive ∘ is-a-contrary` and reintroduces the
unsoundness above. Give assumption nodes a dedicated **contrary handle** (a red port) separate from
the rule handle, so the two primitives can't be confused.

### Significant blockers (only four are real)

1. **Collective rules are hyperedges.** `q ← a, b` is set-to-node; graph UIs are natively binary.
   Solve with a **rule-hub node** (body spokes meet, one arrow to head) plus a **rule inspector**
   for editing the body set. Don't force arbitrary bodies through pure drag.
2. **Rule vs contrary must stay physically distinct** — the two-handle design.
3. **Non-DAG rendering** — self-loops, back-edges, rule↔contrary cycles are all valid; no
   acyclicity assumption in layout.
4. **Facts / empty bodies** (`h ←`) have no drag source — need a **"fact" badge** on the node.
   Don't model `⊤` as a real atom.

The graph is **representationally complete** for finite ABAFs — every construct maps. The limits are
UX and guardrails, not expressive power.

### Interaction catalog

| Gesture                                    | Creates / edits                    | Allowed? Restriction                          |
| ------------------------------------------ | ---------------------------------- | --------------------------------------------- |
| Click empty canvas                         | new **ordinary atom** (auto-named) | ✓                                             |
| Toggle node type                           | atom ⇄ **assumption**              | ✓ — promoting _forces_ a contrary (auto `~x`) |
| Rename node                                | atom label                         | ✓ — names must be **unique**                  |
| Drag rule-handle node→node                 | **rule** body→head (single body)   | ✓                                             |
| Hub / multi-select → head                  | **collective rule**                | ✓ — needs hub or inspector (blocker 1)        |
| Drag rule into an **assumption** (as head) | non-flat rule                      | ✓ non-flat · **✗ flat mode**                  |
| Mark node "fact"                           | empty-body rule                    | ✓ (blocker 4)                                 |
| Drag **contrary-handle** (assm→atom)       | set `~a`                           | ✓ — **single-valued**; redraw _replaces_      |
| Second contrary from one assm              | —                                  | ✗ contrary is a function                      |
| Contrary on a non-assumption               | —                                  | ✗ only assumptions have contraries            |
| Draw an "attack"/"support" edge            | —                                  | ✗ **not a primitive** — computed overlay      |
| Delete node / rule / contrary              | remove + **cascade**               | ✓                                             |
| Leave an assumption with no contrary       | —                                  | ✗ demote to atom instead                      |

**Read-only overlays** (views, not edits): emergent **attacks** (rule ∘ contrary), **derivability
shading** (atoms reachable from current assumptions), post-eval **extension highlighting**. This is
where the `Σ`/evaluate button plugs in.

### Constraints ledger

**Hard-enforce (reject at edit time):** unique names; atom-XOR-assumption typing; contrary total +
single-valued on assumptions, none on atoms; every assumption keeps a contrary; deletion cascades.

**Mode knob — flat vs non-flat:** _flat_ (recommended v1) rejects any rule whose head is an
assumption — keeps the LP correspondence, dodges Δ-semantics. _non-flat_ allows it and defaults eval
to the Δ-semantics.

**Legal but pathological → allow + lint (never block):** self-contrary `~a = a`; contrary that is an
assumption; a fact that is a contrary (`~a ←`); tautological/cyclic rule `h ← …, h`; isolated atom
with no deriving rule. All valid ABAFs — warn, don't wall, since users hit them mid-construction.

## Semantic views — AF / SETAF / BSAF / BAF / ADF

The editable atom graph stays the **only** thing the user edits. The instantiations are read-only
_lenses_ computed from it, and all of them display one evaluation result. The user flips the
canvas between them with a **view switcher**, not separate windows (see _View switcher_).

### Fidelity differs per view

| View      | Nodes                   | Edges                                       | Faithful for                    | Status  |
| --------- | ----------------------- | ------------------------------------------- | ------------------------------- | ------- |
| **AF**    | arguments `(S, claims)` | binary attacks                              | flat                            | done    |
| **SETAF** | assumptions             | collective attacks                          | flat                            | done    |
| **BSAF**  | assumptions             | collective attacks + supports               | non-flat (replaces SETAF there) | done    |
| **BAF**   | arguments `(S, claims)` | binary attacks (onto `{b}` only) + supports | flat (co, pr, gr, st)           | planned |
| **ADF**   | all atoms               | dependency links + acceptance conditions    | flat (to verify, see below)     | planned |

Worked example (the module's initial theory: `p ← a`, `q ← a,b`, `‾a = q`, `‾b = p`), with
`A1 = ({a}, {a, p})`, `A2 = ({b}, {b})`, `A3 = ({a, b}, {q})`:

```
AF                     SETAF            BAF                       ADF
A1 ──▶ A2, A3          {a,b} ══▶ a      A3 ──▶ A1                 a [¬q]    p [a]
A3 ──▶ A1, A3          a ──▶ b          A1 ──▶ A2                 b [¬p]    q [a ∧ b]
                                        A1 ⇒ A3,  A2 ⇒ A3
```

A view is either **exact** or **unavailable** — no partial states. AF, SETAF, BAF and ADF are
flat-only; for non-flat theories the SETAF slot shows the BSAF instead, and the others are
disabled with the reason on the switcher (see _View switcher_).

### BAF view (flat, planned)

Lehtonen, _Constructing Compact Structured Argumentation Frameworks_ (COMMA 2026), Def. 12 for the
ABA case (no defeasible rules), on an AF built with any merges — here the support-unique AF:

```text
Att = {(A, b_singleton) | ‾b ∈ Conc(A)}      b_singleton: the argument with support {b}
Sup = {(b_singleton, A) | b ∈ Prem(A)}
```

- **Nodes:** the AF view's support-unique arguments (`supportArguments`), so positions can share
  the AF view's keys.
- **Attacks:** only onto singleton arguments: an argument claiming `‾b` attacks the `{b}` argument.
- **Supports:** from the `{b}` argument to every other argument using `b` (the self-support
  `(b_singleton, b_singleton)` is trivial and not drawn).
- **Semantics:** Def. 11 — `X` attacks `B` iff `X` attacks `B` directly, or attacks some `C` with
  `(C, B) ∈ Sup` (necessary support). Prop. 13: exact for co, stb, prf, grd, mapping an extension
  `E` to `Prem(E)` and an assumption set `S` back to `{x | Prem(x) ⊆ S}`.
- **Why show it:** the AF has an attack from every attacker of `b` to every argument using `b`;
  the BAF routes those through the `{b}` argument (Lehtonen's `n·m` vs. `n + m`), so attacks only
  hit `|A|` targets and "which assumptions an argument rests on" shows as supports. Drawn with
  the BAF module's double-arrow support style.

### ADF view (flat, planned)

The "two-tier" reading from above, drawn: every atom is a node with an acceptance condition.

- **Nodes:** all atoms and assumptions, at their theory positions.
- **Conditions:** atom `p` → OR over its rules of the AND of each body (a fact is `⊤`, no rule is
  `⊥`); assumption `a` → `¬‾a` (no contrary is `⊤`).
- **Links:** body atom → head (supporting), contrary → assumption (attacking).
- **Reuse:** the dialectical (ADF) module's formula model and condition annotations render it;
  "open as document" goes to the ADF module.
- **Semantics:** this is the standard flat ABA → normal logic program → ADF chain (Caminada &
  Schulz 2017 for ABA ↔ LP; Strass 2013 for LP ↔ ADF). Which semantics correspond exactly (co,
  gr, pr, st expected) needs checking against both papers before the view claims to be exact.
- **Why show it:** the only view that keeps the non-assumption atoms, so derivations stay
  visible; the others compile them away.

### Compile layer (pure, tested)

`src/modules/assumption-based-argumentation/views/` — one core engine plus thin mappings:

- **Minimal derivations:** for each atom, the ⊆-minimal assumption sets deriving it (fixpoint
  over the rules, keeping only an antichain of sets). Everything below reads from this.
- `toSETAF` (flat, done): minimal `S ⊢ ‾b` → collective attack `S → b`. Node ids are the ABA
  assumption ids.
- `toBSAF` (done): Def. 3.5 of Berthold et al. (KR 2024) literally — minimal `S ⊢ ‾b` →
  collective attack, minimal `S ⊢ b` (`b ∈ A`, `S ≠ {b}`) → collective support, including
  derivations that pass through another assumption. Empty tails become _always out_ /
  _always derived_ annotations.
- `toBAF` (flat, planned): the AF's arguments with Lehtonen's attacks and supports (above).
- `toADF` (flat, planned): one node per atom, conditions as above.
- `toAF` (flat, done): one **support-unique** argument per minimal support, carrying all its
  claims — the same construction as TweetyProject's AF reduction, so results map 1:1. Attacks
  onto every argument using the attacked assumption. Capped, with "showing N of M".
- Edge cases: `∅ ⊢ ‾b` (unconditional attack) has no SETAF/BSAF edge — show `b` as _always out_
  (outline/badge) instead; Tweety drops `b` and its attacks, which gives the same extensions.
  Self-attacks are legal and must render.
- Return the existing module models (AF, BAF, SetAF) so tests and the "open as" export reuse them.

### Fit with the current graph editor

How the app renders graphs today, and what each approach would cost:

- **Shared `GraphEditor.vue` is a page shell, not a widget.** It renders the MainMenu, tutorials,
  help, settings, export, and the mobile bars. It registers window-level `keydown`/`keyup`
  listeners, and it persists the viewport under a per-document `viewport` key. Two instances for
  the same document would fire shortcuts twice and overwrite each other's viewport.
  → **Only one graph on screen at a time**, which the view switcher gives us anyway.
- **It has no read-only mode.** Node creation, deletion and label editing are hard-wired to
  `true` in `setDefaults`. Only link creation/deletion are props.
- **The library already supports read-only.** `@aig-hagen/graph-component` exposes
  `toggleNodeCreationViaGUI`, per-node `deletable` / `labelEditable` / `fixedPosition` /
  `allowIncoming|OutgoingLinks`, and per-link `deletable`. Other modules (incomplete, probabilistic,
  dialectical) already import it directly.
- **~~Library gap: hyperlinks carry only a colour.~~** Fixed in the vendored `5.0.0-rc.24`:
  hyperlinks take `arrowType` (`SINGLE` / `DOUBLE` / `DASHED`), so a collective _support_ can be
  drawn differently from a collective attack. `setReadOnly(true)` also covers the read-only view.
- **Node shapes are circle or rect only.** That's fine: the views only contain assumptions or
  arguments. For AF, use short labels (`A1`…) with the `S ⊢ c` text as an annotation/tooltip, or
  rect + `nodeAutoGrowToLabelSize`.
- **Highlighting already fits.** `Highlight = { stateId, groups: {nodes: Set<NodeId>, color}[] }`.
  If the BSAF/BAF view nodes reuse the ABA assumption `NodeId`s, a result in assumption space maps
  1:1. Only the AF view needs an argument-id map.

**Verdict: no major changes.** The plan is additive:

1. **Read-only mode on the shared editor** (done instead of a separate `GraphView.vue`): the
   derived view is fed to the same `GraphEditor.vue` with `readOnly` and a `canvasKey`, so menus,
   layouts, export, highlight and the side panel keep working. See _Suggested order_.
2. **Upstream library change** for hyperlink `arrowType`. Small, but it's a release of a separate
   package. Not blocking.
3. **View switcher inside the ABA editor** (below). The ABA canvas now runs on the shared
   editor (rules only; contraries as annotations until they can be drawn — see
   [`graph-component.md`](graph-component.md)), so the switcher can live there as a slot or prop.

### View switcher

A segmented control that swaps what the canvas shows. The theory editor is one of the options:

```
                     ┌────────┬────┬──────────────┬─────┬─────┐
 bottom-centre  →    │ Theory │ AF │ SetAF / BSAF │ BAF │ ADF │   (+ read-only chip beside it)
                     └────────┴──┬─┴──────┬───────┴──┬──┴──┬──┘
                                 │        │          └─────┴ planned, flat-only
                                 │        └ SetAF when flat, BSAF when not; never disabled
                                 └ disabled for non-flat: "Only exact for flat theories"
```

Implemented as a pill segmented control (`common/graph-editor/SegmentedControl.vue`); on compact
layout a "view" picker pill with a one-line description per view.

- **Placement:** bottom-centre of the canvas on desktop. It's a _canvas mode_, so it stays apart
  from the tool buttons on the left, and it uses the same `btn-sm` / `join` styling. On compact
  layout it goes as a chip row just above the command bar (where `#canvasSelector` sits).
- **Availability on the button:** a view is enabled (exact) or greyed out with the reason as a
  tooltip. AF (later BAF and ADF) is greyed out for non-flat theories. The current
  flat/non-flat badge folds into this.
- **Becoming unavailable while active:** if a side-panel edit makes the active view unavailable
  (e.g. the theory turns non-flat while on AF), keep the view selected. Show an empty state with the
  reason and a "back to Theory" button. It comes back on its own once the theory qualifies again.
  No surprise jumps.
- **Derived views are read-only on the canvas; the side panel always stays editable** (decided).
  Editing a rule while looking at the AF updates it live, which is great for teaching. A small
  `read-only · derived from theory` chip sits at the top of the canvas.
  Double-click or drag on empty canvas does nothing (optionally a hint: "switch to Theory to
  edit").
- **Stable layout:** BSAF/BAF nodes are assumptions, so they start at their theory positions.
  That gives continuity when switching. In every view, unchanged nodes keep their place across
  edits and only new ones are laid out. View positions are UI state, not document content.
- **Per-view memory:** zoom/pan per view. The active view is kept in document UI state, so a
  reload returns to it.
- **Evaluation stays across switches:** the result window stays open, and the highlight is drawn
  on whichever view is active.
- **Shortcuts:** `Alt+1…4` (to be checked against `shortcuts.ts`).

### Evaluation

- **Compute once, in assumption space.** ABA extensions are assumption sets `E`. Each view
  displays it:
  - theory: `E` shaded, `Th(E)` (atoms derived from `E`) lighter, attacked assumptions struck
  - BSAF/BAF: `E` highlighted directly
  - AF: arguments whose support ⊆ `E`
- The ABA editor has no `EvaluationHost` / `WindowExtensions` wiring yet (the shared editor
  provides those slots). Evaluation needs that wiring whether or not the canvas converges.
- **Shortcut for flat ABA:** it compiles exactly to a SETAF, so the SETAF module's existing
  extension backend could evaluate it (with `∅`-attacked assumptions pre-removed). Non-flat needs
  a real ABA/BSAF reasoner.
- **Views as explanations:** "why is `a` out?" → highlight the BSAF edge `{a,b} ⇒ a`, then the
  theory rule behind it.

### "Open as document"

Copy a compiled view into its target module as a new, independent document (AF → AF module,
SETAF → SETAF module, BAF → BAF module, ADF → ADF module). There is no BSAF module, so non-flat
BSAF can't be opened this way. There's no cross-module conversion hook today, so this needs a small
document-creation entry point.

### Suggested order

v1 is **flat only**: AF and SETAF views, greyed out for non-flat theories.

1. [x] Compile layer + tests (`views/supports.ts`, `af.ts`, `setaf.ts`).
2. [x] View switcher with the SETAF view. Instead of a separate `GraphView.vue`, the shared
       `GraphEditor.vue` got a `readOnly` prop (library `setReadOnly`, no action bar), a
       `canvasKey` prop (rebuild + per-view viewport), and a `canvasOverlay` slot. View positions
       and the active view live in document UI state.
3. [x] AF view (capped at 200): rect nodes labelled `(support, claims)` that grow to fit the
       label (library autogrow, switched on only while every node is a rect). Unplaced arguments
       get a left-to-right graphviz layout; positions are keyed by support set.
4. [x] BSAF view in the SETAF slot for non-flat theories; supports as BAF-style double arrows.
5. [ ] BAF view (flat): Lehtonen Def. 12 on the AF's arguments.
6. [ ] ADF view (flat): after checking the LP ↔ ADF correspondence.
7. [ ] Parallel edges in the graph component: an attack and a support with the same tail and
       head currently collapse to one edge (the BSAF view lists the hidden attack in its note).
8. [x] Evaluation wiring; [ ] display across all views. "Open as document" whenever convenient.

## Open questions

- ~~Backend: does TweetyProject expose (non-flat) ABA reasoning?~~ It has `/aba`, but it needs a
  rework before use — see [`aba-tweety-rework.md`](aba-tweety-rework.md).
- Model shape for `model.ts`: `{ atoms, assumptions: {name → contrary}, rules: [{head, body}] }`
  (the ABA Studio prototype's state) is a clean starting point.
- ~~Graph component: hyperlinks carry only a colour.~~ Fixed (`arrowType`). Still open:
  parallel edges of different types between the same ends.
- Flat-only v1 vs. non-flat: flat keeps the LP correspondence clean and dodges the Δ-semantics work;
  non-flat is the research-interesting case but needs the refined semantics.
