# ABA graphical representation — modeling vs. reasoning

Design notes for a future **assumption-based argumentation (ABA)** module. Captured before
building, so the core split (what the user edits vs. what the solver evaluates) is on record.

Prototype lives in the **ABA Studio** artifact
(<https://claude.ai/artifact/DjeP7i9dkcvMUgD4gpTE4A>) — that one covers the *flat* case only.
Background reading: Berthold, Rapberger, Ulbricht, *Capturing Non-flat ABA with Bipolar SETAFs*
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

> **Rules derive. Contraries attack.** In ABA a rule never *is* an attack — it only derives its
> head. The attack is a *separate* fact: "that head happens to be some assumption's contrary."
> An attack is the composition `derive(head) ∘ (head is a contrary)`.

Coloring an edge by its head fuses those two moves into one. That is lossless only when a contrary
head does nothing *except* be a contrary. Every failure below is a case where a head plays two
roles at once.

## Scenarios that don't model neatly

1. **Shared contraries.** `~a = ~b = x`: the single rule `x ← B` attacks *both* `a` and `b`.
   BSAF edges are set-to-**single**-target, so one rule must split into several attack edges.
   Survivable, but "one rule = one edge" is already gone.

2. **A contrary head reused downstream — the killer.**

   ```
   x ← ⊤       (x is a fact;  x = ~a)
   d ← x       (d needs x)
   ~b = d      (d is b's contrary)
   ```

   ABA: `∅ ⊢ x = ~a` (attacks `a`) and `∅ ⊢ x ⊢ d = ~b` (attacks `b`) — **both a and b are out.**
   But if the coloring scheme "spends" `x` as an attack on `a`, then `d ← x` has no *supporting*
   node to stand on, `d` never derives, the attack on `b` never fires, and **`b` looks unattacked
   → wrongly "in".** The atom `x` had to be both "the attack on a" and "a derived fact feeding d";
   one colored edge cannot be both.

3. **The mirror failure — keep the contrary as a uniform node.** Then run Dung/BSAF semantics over
   all atoms:

   ```
   A = {a},  ~a = x,  rule:  x ← a
   ```

   ABA: `{a} ⊢ x = ~a`, so `{a}` attacks *itself* → only extension is `∅`. The correct BSAF encodes
   this as a **self-loop on `a`**. But the uniform atom-graph has `a → x` (rule) and `x → a`
   (contrary) — a clean 2-cycle — so a Dung reading returns preferred extensions `{a}` and `{x}`.
   **Wrong**, because `x` is only true *parasitically* (when `a` is); it is not a free choice.

   → Pinched both ways: consume contrary-heads and you sever derivations (#2); keep them as uniform
   nodes and you invent phantom choices (#3).

4. **Assumption-as-contrary + non-flat heads.** If `~a = b` with `b` an assumption (allowed:
   `~ : A → L`, and `A ⊆ L`), the contrary link lands on a node that is *also* a free choice — and
   if `b` is itself rule-derivable (non-flat), that node is "true if assumed" OR "true if derived",
   with no principled tiebreak in a uniform graph.

5. **Dangling atoms.** A body atom that is never a head and not an assumption is simply *false*
   (underivable). A uniform AF semantics sees an unattacked node and labels it "in" — wrong, same
   root cause as #3.

## Why: atoms are *determined*, not *chosen*

ABA has two kinds of node obeying different laws:

```
assumption node   →  DEFEASIBLE    : true by default, retracted if its contrary is derived
ordinary atom     →  DETERMINISTIC : true iff some rule derives it from what is already true (Th)
```

Ordinary atoms are a *function* of the assumptions — zero free choice. Dung AFs and BSAFs assume
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

Sound, and matches ABA exactly — because it *is* ABA. Each atom with an acceptance condition
(`OR` over rules, `AND` over bodies) and each assumption with "accept unless contrary holds" is
exactly an **ADF** (abstract dialectical framework — Brewka/Woltran). For the **flat** fragment this
collapses to the textbook result: flat ABA = normal logic programs (`stable ↔ stable models`,
`grounded ↔ well-founded`). Rock-solid for flat; delicate-but-known for non-flat (the KR-24 paper's
subject).

**Punchline:** the paper's BSAF is what you get by *contracting tier 1 away* — compile out every
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
  treat rules as plain derivation edges and contraries as a *separate overlay* (the two-tier view),
  not as attack/support colors.
- **Evaluate** by compiling to the assumptions-only BSAF (or handing the ABAF straight to a solver).
  Never run flat Dung semantics on the atom graph.
- Going non-flat: default the semantics to the paper's **Δ-versions** (`co_Δ`, `gr_Δ`), which patch
  the "no admissible / no complete extension" pathologies otherwise inherited.
- Either target: nodes stay at `|A|`, but the collective edge relation can blow up to *all* deriving
  subsets — compute **minimal supports/attacks only**.

## In-graph authoring — interactions, blockers, restrictions

Goal: assemble/modify the ABA theory *directly in the graph*, not only in a side panel.

**Drop the left/right tier split for editing.** The lanes in the mockup were didactic. They can't
survive an editor: non-flat rules put an assumption on both sides, and rule↔contrary cycles fold the
graph back on itself. Encode the tier in **node appearance** (amber rounded = assumption, neutral
squared = atom) and let position be free.

**The rule that shapes the whole editor:**

> Drawable primitives are `atom`, `rule (body→head)`, and `contrary (assumption→atom)`. Attacks and
> supports are **computed overlays — never drawn.** Two edge *tools*, not two edge *types*.

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

| Gesture | Creates / edits | Allowed? Restriction |
|---|---|---|
| Click empty canvas | new **ordinary atom** (auto-named) | ✓ |
| Toggle node type | atom ⇄ **assumption** | ✓ — promoting *forces* a contrary (auto `~x`) |
| Rename node | atom label | ✓ — names must be **unique** |
| Drag rule-handle node→node | **rule** body→head (single body) | ✓ |
| Hub / multi-select → head | **collective rule** | ✓ — needs hub or inspector (blocker 1) |
| Drag rule into an **assumption** (as head) | non-flat rule | ✓ non-flat · **✗ flat mode** |
| Mark node "fact" | empty-body rule | ✓ (blocker 4) |
| Drag **contrary-handle** (assm→atom) | set `~a` | ✓ — **single-valued**; redraw *replaces* |
| Second contrary from one assm | — | ✗ contrary is a function |
| Contrary on a non-assumption | — | ✗ only assumptions have contraries |
| Draw an "attack"/"support" edge | — | ✗ **not a primitive** — computed overlay |
| Delete node / rule / contrary | remove + **cascade** | ✓ |
| Leave an assumption with no contrary | — | ✗ demote to atom instead |

**Read-only overlays** (views, not edits): emergent **attacks** (rule ∘ contrary), **derivability
shading** (atoms reachable from current assumptions), post-eval **extension highlighting**. This is
where the `Σ`/evaluate button plugs in.

### Constraints ledger

**Hard-enforce (reject at edit time):** unique names; atom-XOR-assumption typing; contrary total +
single-valued on assumptions, none on atoms; every assumption keeps a contrary; deletion cascades.

**Mode knob — flat vs non-flat:** *flat* (recommended v1) rejects any rule whose head is an
assumption — keeps the LP correspondence, dodges Δ-semantics. *non-flat* allows it and defaults eval
to the Δ-semantics.

**Legal but pathological → allow + lint (never block):** self-contrary `~a = a`; contrary that is an
assumption; a fact that is a contrary (`~a ←`); tautological/cyclic rule `h ← …, h`; isolated atom
with no deriving rule. All valid ABAFs — warn, don't wall, since users hit them mid-construction.

## Open questions

- Backend: does the TweetyProject reasoner Agon already uses expose (non-flat) ABA and/or BSAF
  reasoning, or is a new endpoint needed? (Same gap flagged for Extended/Weighted AFs in
  [`TODO.md`](TODO.md).)
- Model shape for `model.ts`: `{ atoms, assumptions: {name → contrary}, rules: [{head, body}] }`
  (the ABA Studio prototype's state) is a clean starting point.
- Graph component: rendering *collective* (set-to-node) attack **and** support edges is new — the
  current component only does binary attacks.
- Flat-only v1 vs. non-flat: flat keeps the LP correspondence clean and dodges the Δ-semantics work;
  non-flat is the research-interesting case but needs the refined semantics.
