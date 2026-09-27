# TweetyProject ABA rework

Plan for making TweetyProject's assumption-based argumentation (ABA) reasoning correct, fast and
usable from Agon's `/aba` evaluation. Semantics stay in TweetyProject — including the flat-ABA
conversion — and Agon only maps its model to the request and the answer back.

Related: [`aba-graph-representation.md`](aba-graph-representation.md) (editor and views design).
Sources:

- **Definitions:** Čyras, Fan, Schulz, Toni, _Assumption-Based Argumentation: Disputes,
  Explanations, Preferences_, Handbook of Formal Argumentation Vol. 1, Ch. 7 (2018) — "the
  handbook" below. Standard reference; Tweety's semantics names (`wf`, `id`) follow it.
- **Origin:** Bondarenko, Dung, Kowalski, Toni, _An abstract, argumentation-theoretic approach to
  default reasoning_, AIJ 93 (1997).
- **Non-flat / BSAF / Δ-semantics:** Berthold, Rapberger, Ulbricht, _Capturing Non-flat
  Assumption-based Argumentation with Bipolar SETAFs_ (KR 2024) — "the paper" below. Its
  Background recalls the handbook's definitions (with one change, see below).
- **Flat ABA, both semantics routes:** Thimm, _Formale Argumentation 4.3: Annahmenbasierte
  Argumentation_, FernUniversität in Hagen lecture notes v1.6 (2024) — "the script" below. Flat
  only, contrary = classical negation. Defines the indirect semantics via the argument graph
  (ABA1) and the direct one on assumption sets (ABA2), and proves they coincide for cf, adm, co,
  pr, gr, st (Thm 4.3.3).
- **Compact AF/BAF translation:** Lehtonen, _Constructing Compact Structured Argumentation
  Frameworks_ (COMMA 2026) — support-minimal and support-unique arguments, the flat BAF with
  attacks only on singleton arguments; equivalence for co, pr, gr, st (Props 8, 10, 13).
  Lehtonen, _ABu: Efficient Argument Builder for Assumption-Based Argumentation_ (SAFA 2026) —
  the bottom-up construction algorithm (Alg. 1, 2). Tweety solved none of its benchmark instances.
- **ABA ↔ SETAF / CAF:** König, Rapberger, Ulbricht, _Just a Matter of Perspective:
  Intertranslating Expressive Argumentation Formalisms_ (COMMA 2022) — flat ABA to a SETAF over the
  assumptions (Def. 3.13, Prop. 3.15: grd, com, pref, stb), SETAF back to ABA, conclusion-based
  SETAF (Def. 3.17), ABA to CAF (Def. 3.6).

Work happens in a standalone clone (`~/GitHub/TweetyProject`, branch `aba-rework`), not in
Agon's submodule. Paths are relative to the TweetyProject root:

- library: `org-tweetyproject-arg-aba/src/main/java/org/tweetyproject/arg/aba/`
- web service: `org-tweetyproject-web/src/main/java/org/tweetyproject/web/services/`

Review state: `5940c1a1` (v1.31-10), 2026-09-26. Progress: `aba-rework` at `59ea8122`,
2026-09-27.

## Verdict

The definitions follow the handbook (closure, defence against closed attackers, admissible,
complete, preferred, well-founded, ideal). The implementation around them does not hold up:

- two of five semantics return wrong results,
- the core algorithm is factorial and unusable beyond ~8 assumptions,
- the parser accepts garbage silently,
- the module's tests never run,
- the web endpoint swallows errors and returns an unstructured string.

Keep the data model and the text format; rewrite the reasoning core.

## How this was checked

- Read every file in `arg-aba` and the `/aba` service.
- Scratch harness calling the same parser and `GeneralAbaReasonerFactory` the endpoint uses,
  against the compiled classes. The web server itself was not started, so the HTTP layer is
  untested. The FOL path was only read.
- Brute-force reference of the handbook's Def. 2.8 in Python (identical to the paper's Defs
  2.2/2.3 except for grounded), used as ground truth.
- Theories: paper Ex. 2.4, 3.14, 3.15; Tweety's `example3/4/5.aba`; Agon's default theory
  (`p ← a`, `q ← a,b`, `‾a = q`, `‾b = p`).

| Semantics           | Result       | Notes                                                                            |
| ------------------- | ------------ | -------------------------------------------------------------------------------- |
| complete (`co`)     | ✅ 7/7       |                                                                                  |
| preferred (`pr`)    | ✅ 7/7       |                                                                                  |
| ideal (`id`)        | ✅ plausible |                                                                                  |
| stable (`st`)       | ❌ 0/7       | returns every conflict-free closed set                                           |
| well-founded (`wf`) | ❌ 4/7       | correct as the handbook's intersection; `[[]]` when no complete extension exists |

Scaling (preferred, chain of `n` assumptions): 0.09 s at n=7, 0.63 s at n=8, **7.9 s at n=9**,
~10× per extra assumption.

Note on the paper: Ex. 2.4 claims no stable extension, but read with the rules of its BSAF
(Ex. 3.4), `{b,d}` satisfies the stable definition (attacks `a`, `c`, `e`). Don't use that claim
as a test expectation.

## Which definitions

The three sources agree on rules, deductions, closure, attack, admissible, preferred, complete,
stable and flatness. They differ in these places:

| Notion                  | Bondarenko 1997                       | Handbook 2018 (Def. 2.8)                            | Paper (KR 2024)               |
| ----------------------- | ------------------------------------- | --------------------------------------------------- | ----------------------------- |
| Contrary                | mapping `Ab → L`                      | **total** mapping; only assumptions have one        | function `A → L`              |
| Conflict-free           | no `α` with `T ∪ Δ ⊢ α, ᾱ` (stricter) | does not attack itself                              | as handbook                   |
| Defence                 | `Δ` attacks `Δ′ − Δ`                  | `A` attacks `B` (closed attackers)                  | as handbook                   |
| Well-founded / grounded | intersection of complete sets         | intersection of complete sets ("grounded" for flat) | `gr`: ⊆-minimal complete sets |

Follow the handbook. The paper's `gr` coincides with well-founded for flat frameworks only; offer it
separately if needed. The 1997 conflict-free and defence notions coincide with the handbook's on
closed sets, which is all the semantics use.

## Findings

### A. Correctness

- **A1 — stable is broken.** `reasoner/StableReasoner.java:60`: the `continue` inside the inner
  loop only skips to the next assumption, so "attacks every assumption outside E" is never
  checked.
- **A2 — well-founded with no complete extension.** `reasoner/WellFoundedReasoner.java:52`. The
  intersection of complete extensions is the handbook's definition, so the result is right when
  complete extensions exist (incl. non-flat ex5: `{c}`). With none, it returns `[∅]` via
  `new AbaExtension<T>()`; the intersection of an empty family is undefined, so return no
  extension. The paper's `gr` (⊆-minimal complete) is a different notion for non-flat
  frameworks.
- **A3 — missing semantics.** No conflict-free, admissible, the paper's `gr`, or its
  Δ-semantics (`co_Δ`, `gr_Δ`, Defs 4.6/4.7/4.12).
- **A4 — `FlatAbaReasoner` is unused and costly.** Converts to a Dung AF with one argument per
  derivation tree (exponential), and maps back by matching name strings (an assumption named
  `arg_0` would collide).

### B. Performance

- **B1 — factorial powerset.** `syntax/AbaTheory.java:189` `toPowerSet` recurses by removing
  each element and dedupes afterwards: n! calls instead of 2ⁿ. Used by `isFlat`, `defends`,
  `isAdmissible` and all reasoners.
- **B2 — no reuse.** `isAdmissible` enumerates all subsets per candidate; `defends` does it again
  per (candidate, assumption). Complete is roughly n! × n! × derivation cost.
- **B3 — derivation by enumerating all derivation trees.** `getAllDeductions` (`AbaTheory.java:81`)
  builds every tree, inside every `attacks()` / `isClosed()`. Closure and attacks only need
  derivability, which one forward-chaining pass gives.
- **B4 — FOL grounding per call.** `getRules()`, `getAssumptions()`, `getNegations()` re-ground
  on every call, also inside inner loops.

### C. Model and parser

- **C1 — contrary is a relation, not a function.** Zero or several contraries per assumption,
  and contraries on non-assumptions, are accepted without check or documentation. All three
  sources define a total mapping; the handbook adds "sentences have a contrary if, and only if,
  they are assumptions". Several contraries can be rewritten into one via a fresh atom
  (`c_a ← x`, `c_a ← y`), so they are a harmless shorthand; a missing one is not ABA.
- **C2 — unknown lines become assumptions.** `parser/AbaParser.java:153`: anything that isn't a
  rule or `not … = …` is an assumption. Typos either throw deep in the formula parser or add a
  bogus assumption.
- **C3 — `a <- true` is not a fact.** `symbolTrue` is declared but never used; `true` parses as
  an ordinary (underivable) atom. Only `a <-` works.
- **C4 — `Negation.getSignature()`** (`syntax/Negation.java:110`) adds the formula's signature
  twice and never the contrary's; FOL constants that only occur in contraries are missed when
  grounding.
- **C5 — smaller oddities.** `Assumption.isFact()` returns `true`; `AbaAttack.attacks(...)` uses
  `complement()` instead of the theory's contraries (inconsistent, unused);
  `InferenceRule.isConstraint()` throws.

### D. Tests

- **D1 — `AbaTest` never runs.** `commons` pulls in JUnit 5, so surefire uses the JUnit Platform;
  `AbaTest` is JUnit 4 (`org.junit.Test`). `mvn test` reports "Tests run: 0".
- **D2 — disabled tests pass.** `ClosureTest`, `Example4`, `Example5`, `Example11` had `@Test`
  commented out. Run with JUnit 4: 12 tests, 1 failure.
- **D3 — the failure is a wrong expectation.** `example3.aba` is the handbook's Example 2.9,
  and the commented-out asserts copy its stated results: `{c}` and `∅` complete, `∅`
  well-founded. By the handbook's own Def. 2.8 that is wrong — both defend the unattacked `b`
  without containing it. Correct: complete `{a,b}` only, well-founded `{a,b}`. Tweety is right.
- **D4 — no coverage** for stable, non-flat grounded, ideal, or the paper's examples.

### E. Web service (`/aba`)

- **E1 — parse errors swallowed.** `RequestController.java:185/204`: exception logged, theory
  stays `null`, client gets a generic `"Error"`.
- **E2 — missing fields crash.** Missing `kb_format` → NPE; unknown semantics id → `null` into
  the factory's `switch` → NPE. No useful message either way.
- **E3 — query is skeptical only.** `aba/AbaReasonerQueryCallee.java:64`; `/setaf` offers
  `get_credulous` / `get_skeptical`.
- **E4 — answer is `Collection.toString()`.** `AbaExtension` printed `[a, b]`, while Dung and
  SETAF print `{a,b}`, which is what Agon's integer-only `listOfSets.ts` parser expects. Unordered
  (`HashSet`) like the other modules. Numeric names (`0`, `1`, …) parse fine as PL atoms, so Agon
  can send its ids.
- **E5 — timeouts don't stop work.** `runCallee` → `shutdownNow()` interrupts, but the ABA code
  never checks for interrupts. Shared across endpoints, much worse with ABA's cost.
- **E6 — not routed in Agon.** `/aba` is missing from `config/backend-routes.json`.

## Plan

Work on branch `aba-rework`, one change per commit, PR upstream later. Keep the classes
`AbaTheory`, `Assumption`, `InferenceRule`, `Negation`, `AbaExtension` and the text format
(`{…}`, `h <- b`, `not a = c`). Only `org-tweetyproject-web` depends on `arg-aba`.

### Target structure

```text
AbaTheory        data + consequence: rules, assumptions, contraries,
                 getDerivable (Th), getClosure (cl), getMinimalSupports,
                 attacks, isClosed, isConflictFree, isFlat, ground

reasoner/        all extend GeneralAbaReasoner (getModels, query)
  direct         one class per semantics, on top of getMinimalSupports (B2)
  reduction      one class per target, Dung semantics as parameter:
                 AbaTheory → AF / BAF / SETAF / BSAF → reasoner → map back
```

- Derivation stays in `AbaTheory`: it is the theory's consequence relation, and the
  translations need it too (SETAF attacks come from minimal supports of contraries).
- FOL is grounded once "at the door" (`ground()`, called by the parser); everything after that
  treats sentences as opaque atoms.
- A reduction throws for semantics known to give wrong results; the others are allowed, and the
  class comment says which are proven. AF and SETAF need a flat theory.
- Tests: the direct reasoners are checked against brute-force definitional oracles, the
  reductions against the direct reasoners.
- AF mapping: the script's `M_S` (all arguments with support ⊆ S) maps S to the AF; an AF
  extension maps back to the union of its arguments' supports. Support-minimal and
  support-unique arguments keep the correspondence for co, pr, gr, st (Lehtonen, Props 8, 10);
  not shown for cf, adm, id. The removed `FlatAbaReasoner` mapped back by name and kept only
  assumption arguments — wrong for adm (`a, b, c`; `p <- b`; `‾a = c`, `‾c = p`: returns `{a}`).
- The AF reduction is self-contained: it builds its own arguments (ABu Alg. 1, 2) from the
  theory's rules, assumptions and contraries, not from `getMinimalSupports`; the SETAF reduction
  reuses them.
- cf-, wad- and vacuous-reduct-based semantics (cf, na, stg, stg2, cf2, scf2, wad, wco, wpr, wgr,
  ud, sud, cg) do not map back: a set can attack itself only through an argument outside the
  extension, typically a self-attacking one (`p <- b,c`, `‾b = p`: all return `{b, c}`). The AF
  reduction rejects them. adm matches in tests; sst, id, ea, sad, is, uc pass the counterexamples
  but are unproven.
  An `M_S` post-filter would fix cf alone, not the maximising ones (naive, wpr, …).
- BAF: the paper's supports are necessary support with secondary attacks only, i.e. Tweety's
  `SIMPLE_NECESSITY` (`SimpleNecessityReasoner`); `NECESSITY` adds extended attacks. Same
  extensions as the AF reduction, and Tweety solves it by expanding to an AF — worth it only as
  data (fewer edges) or with the paper's SAT encoding.

**Minimal supports instead of all subsets (B2).** `S′` attacks `S` iff `S′ ⊇ T` for a minimal
support `T` of a contrary of some `a ∈ S`, and attacking `T` means attacking every superset. So

```text
S admissible  ⇔  S conflict-free  ∧  S attacks every minimal support T of a contrary of some a ∈ S
S defends a   ⇔  S attacks every minimal support T of a contrary of a
```

This is how the script argues in Ex. 4.3.13. Admissibility then costs one check per minimal
support instead of 2ⁿ subsets, and the supports are computed once — the same ones the SETAF
translation needs. Non-flat: only closed attackers count, so check `cl(T)` instead of `T`
(`cl(T)` is the smallest closed superset of `T`) — needs a proof check before relying on it.

| Target | Theories | Tweety support                      | Notes                                             |
| ------ | -------- | ----------------------------------- | ------------------------------------------------- |
| AF     | flat     | `arg-dung`                          | support-unique arguments (Lehtonen)               |
| BAF    | flat     | none — own attack notion            | Lehtonen Def. 12; attacks only on `{b}`           |
| SETAF  | flat     | `arg-setaf` (native + metalevel AF) | identity mapping; cf-based semantics stay correct |
| BAF    | non-flat | `arg-bipolar` (deductive/necessity) | check its semantics match the ABA correspondence  |
| BSAF   | non-flat | none — needs building               | the paper's target; basis for Δ-semantics         |

### Phase 1 — tests first

- [x] Make `AbaTest` run (migrated to JUnit 5) (D1)
- [x] Re-enable the disabled tests (D2)
- [x] Add the handbook's Ex. 2.9 (= `example3.aba`) with the corrected expectations (D3)
- [x] Slim `AbaTest` down to 9 tests: regression cases are data in `comparisonTheories()`, checked
      against definitional oracles and hand-checked values for the non-flat examples

### Phase 2 — core (`AbaTheory`)

- [x] 2ⁿ subset enumeration via `SetTools.powerSet` (B1)
- [x] `isFlat`: syntactic shortcut (no assumption heads a rule), else exact check
      `α ∉ cl(A \ {α})` for each α — n closures instead of 2ⁿ (B1)
- [x] Forward-chaining `getDerivable` (`Th(S)`); `getClosure`, `attacks` on top of it (B3)
- [x] Ground FOL once: explicit `ground()`, called by the parser; no grounding in getters (B4)
- [x] `getAllDeductions()` starts from ground assumptions
- [x] Contraries stored as a map formula → contraries; `getContraries` (C1 groundwork)
- [x] Keep `getAllDeductions` for callers that need actual arguments (`asDungTheory`,
      `AbaAttack`)
- [x] Fix `Negation.getSignature()` (C4)

### Phase 3 — reasoners

- [x] Implement the semantics checks anew in the direct reasoners (one reasoner per commit):
      cf, adm, co, st are new; pr, wf, id build on them
- [x] Remove the old semantics helpers from `AbaTheory` (`getAll*Extensions`, `isAdmissible`,
      `defends`); the non-flat adm/co fallback lives in `AdmissibleReasoner`, the definitional
      brute force in the tests as oracle
- [x] Fix stable: closed, conflict-free, attacks each `x ∈ A \ E` (A1)
- [x] Well-founded (`wf`, handbook): no extension when there is no complete extension (A2)
- [x] Add conflict-free and admissible reasoners (A3)
- [ ] Optional `gr` (paper): ⊆-minimal complete sets; label it clearly, it equals `wf` only for
      flat frameworks (A3)
- [x] Enumerate candidates with `IncreasingSubsetIterator` instead of `SetTools.powerSet`
      (no 2ⁿ set in memory; ~50–200× faster enumeration at n=14–18)
- [x] Stop `WellFoundedReasoner`/`IdealReasoner` from mutating the first extension (`retainAll`)
- [x] Minimal supports for the direct reasoners: compute each contrary's minimal supports once;
      admissible/defends check against them instead of all subsets (B2, see above). Flat only
- [ ] Non-flat adm/co on minimal supports: prove the `cl(T)` check, then replace the closed-set
      brute force in `AdmissibleReasoner` (still ~4ⁿ)
- [x] SETAF reduction reasoner (flat, König et al. Def. 3.13): nodes = assumptions, attacks
      `(T, a)` for minimal `T ⊢ ‾a`; `∅ ⊢ ‾a` drops `a` and the attacks it is in. Native SETAF
      reasoner for cf, adm, co, gr, pr, st, sst, id, ea, stg; metalevel AF reduction (Modgil,
      Bench-Capon) for the rest; rejects na, cf2, scf2, stg2 — the metalevel AF hides conflicts
      from cf-based semantics (wrong even on plain AFs), but keeps them for wad/ud/cg
- [ ] Optional: SETAF → ABA (Def. 3.13) round-trip test, `SF_{D_SF} = SF` (Prop. 3.16)
- [x] AF reduction reasoner (flat): support-unique arguments via ABu Alg. 1, 2; attack if a
      claim is the contrary of an assumption in the support; map back by the union of supports;
      rejects cf- and wad-based semantics. Replaces `FlatAbaReasoner` (A4)
- [ ] BAF construction (flat) as data: same arguments; attacks only on singleton arguments,
      supports from `{b}` to each argument using `b` (Lehtonen Def. 12); cross-check with
      `SimpleNecessityReasoner` in a test. Parked until Agon needs it
- [x] Tests: the `x ← a,b`, `x ← a`, `y ← a` example (one argument `({a}, {x, y})`), the
      `FlatAbaReasoner` adm counterexample, and co/pr/gr/st against the direct reasoners
- [ ] BAF translation for non-flat theories, after checking `arg-bipolar`'s semantics
- [ ] BSAF translation (new framework type)
- [x] Test every reduction against the direct reasoners (`ReductionsMatchDirectReasoners`)
- [x] Credulous/skeptical query on the reasoners (`GeneralAbaReasoner.query`)
- [ ] Optional: a query that stops at the first witness instead of computing all extensions

### Phase 4 — parser and model

- [x] Strict line grammar; clear `ParserException` with line number for anything else (C2);
      no bare assumption lines, every sentence an atom
- [x] `true` as empty body (C3)
- [x] Contrary validation (C1): missing and multiple contraries allowed and documented; a
      contrary of a non-assumption is a `ParserException`
- [ ] Clean up `Assumption.isFact()`, `AbaAttack.attacks`, `InferenceRule.isConstraint()` (C5)

### Phase 5 — web service

- [x] `get_credulous` / `get_skeptical` commands (E3); `GeneralAbaReasoner.queryAll`
- [x] Return parse and validation errors to the client (E1, E2)
- [x] Validate `kb_format`, `semantics`, `cmd` up front (E2)
- [x] Print extensions as `{a,b}` like Dung's `Extension` (E4); no sorting, like the other modules
- [x] ~~Check `Thread.interrupted()` in the reasoner loops (E5)~~ skipped: no other module's
      reasoners check interrupts; a service-wide issue, out of scope here
- [x] Semantics list: direct reasoners (cf, adm, co, pr, st, wf, id) first; every other Dung
      semantics the SETAF reduction accepts goes through it (flat only, error for non-flat
      theories). `wf` (direct) and `gr` (SETAF) both offered: equal on flat theories, and `gr`
      switches to a direct reasoner once the paper's non-flat `gr` exists
- [x] Fix `SimpleEagerSetAfReasoner` (`arg-setaf`): built an `Extension` instead of a `Labeling`
      for the semi-stable side, so `ea` crashed on every input

### Phase 6 — Agon side

- [x] Add `/aba` to `config/backend-routes.json`, the Caddyfile and `overview.md` (E6)
- [x] Adapter: model → KB text with numeric ids, answer → assumption ids via `listOfSets.ts`;
      `status: "ERROR"` surfaces the server message
- [x] Semantics picker: direct (cf, adm, co, pr, st, wf, id) and SETAF-reduction group (flat
      only, shown disabled on non-flat theories); `st` default. Needs disabled options in
      `GroupedSelect`
- [x] Evaluation wiring in the ABA module (`evaluation/`, `WindowExtensions.vue`, editor host,
      `evaluationKinds`); no highlighting for now
- [x] Glossary: cf, adm, co, pr, st, wf, id from the handbook (Def. 2.8); gr from the paper
      (Def. 2.3); no entries for the other reduction semantics
- [x] Tests for the KB text; changelog

### Later

- [ ] Δ-semantics (`co_Δ`, `gr_Δ`); tests from paper Ex. 4.8/4.9
- [ ] Optionally return the compiled BSAF, so Agon's semantic views don't duplicate the logic

## Open decisions

- **Contraries (decided):** the sources require exactly one per assumption. Missing (never
  attacked) and multiple (shorthand) are accepted and documented; a contrary of a non-assumption
  is rejected. No strict mode.
- **PR scope:** phases 1–3 make results correct and fast; 4–5 harden the endpoint; Δ separately.
  One PR or two?
- **Grounding constants:** `ground()` uses the minimal signature (constants that occur in the
  theory), so a declared-but-unused constant is never substituted. Use the parser's declared
  signature instead?
- **FOL:** kept, but only as the grounding step. Dropping it (PL-only) would remove ~350–400
  lines but breaks the web endpoint's `kb_format: "fol"`; maintainers' call.
- **Upstream:** branch `aba-rework`, then PR to TweetyProjectTeam — confirm with the
  maintainers how they take a rework of this size.
