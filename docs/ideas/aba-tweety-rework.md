# TweetyProject ABA rework

Plan for making TweetyProject's assumption-based argumentation (ABA) reasoning correct, fast and
usable from Agon's `/aba` evaluation. Semantics stay in TweetyProject — including the flat-ABA
conversion — and Agon only maps its model to the request and the answer back.

Related: [`aba-graph-representation.md`](aba-graph-representation.md) (editor and views design).
Reference paper: Berthold, Rapberger, Ulbricht, _Capturing Non-flat Assumption-based
Argumentation with Bipolar SETAFs_ (KR 2024) — "the paper" below.

Paths are relative to `third-party/TweetyProjectTeam/TweetyProject/`:

- library: `org-tweetyproject-arg-aba/src/main/java/org/tweetyproject/arg/aba/`
- web service: `org-tweetyproject-web/src/main/java/org/tweetyproject/web/services/`

Review state: submodule at `5940c1a1` (v1.31-10), 2026-09-26.

## Verdict

The definitions follow the paper (closure, defence against closed attackers, admissible,
complete, preferred). The implementation around them does not hold up:

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
- Brute-force reference of the paper's Defs 2.2/2.3 in Python, used as ground truth.
- Theories: paper Ex. 2.4, 3.14, 3.15; Tweety's `example3/4/5.aba`; Agon's default theory
  (`p ← a`, `q ← a,b`, `‾a = q`, `‾b = p`).

| Semantics        | Result        | Notes                                                                      |
| ---------------- | ------------- | -------------------------------------------------------------------------- |
| complete (`co`)  | ✅ 7/7        |                                                                            |
| preferred (`pr`) | ✅ 7/7        |                                                                            |
| ideal (`id`)     | ✅ plausible  |                                                                            |
| stable (`st`)    | ❌ 0/7        | returns every conflict-free closed set                                     |
| grounded (`wf`)  | ❌ 3/7        | `[[]]` when no complete extension exists; `{c}` on ex5 (not even admissible) |

Scaling (preferred, chain of `n` assumptions): 0.09 s at n=7, 0.63 s at n=8, **7.9 s at n=9**,
~10× per extra assumption.

Note on the paper: Ex. 2.4 claims no stable extension, but read with the rules of its BSAF
(Ex. 3.4), `{b,d}` satisfies the stable definition (attacks `a`, `c`, `e`). Don't use that claim
as a test expectation.

## Findings

### A. Correctness

- **A1 — stable is broken.** `reasoner/StableReasoner.java:60`: the `continue` inside the inner
  loop only skips to the next assumption, so "attacks every assumption outside E" is never
  checked.
- **A2 — grounded = intersection of complete extensions.** `reasoner/WellFoundedReasoner.java:52`.
  Only correct for flat theories. The paper's `gr` is the ⊆-minimal complete sets (possibly
  several, possibly none). With no complete extension it returns `[∅]` via
  `new AbaExtension<T>()`. Also named "well-founded".
- **A3 — missing semantics.** No conflict-free, admissible, proper grounded, or the paper's
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
  and contraries on non-assumptions, are accepted without check or documentation.
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
- **D3 — the failure is a wrong expectation.** The commented-out asserts in `Example3` expect
  `{c}` and `∅` to be complete; both defend the unattacked `b` without containing it. Tweety is
  right.
- **D4 — no coverage** for stable, non-flat grounded, ideal, or the paper's examples.

### E. Web service (`/aba`)

- **E1 — parse errors swallowed.** `RequestController.java:185/204`: exception logged, theory
  stays `null`, client gets a generic `"Error"`.
- **E2 — missing fields crash.** Missing `kb_format` → NPE; unknown semantics id → `null` into
  the factory's `switch` → NPE. No useful message either way.
- **E3 — query is skeptical only.** `aba/AbaReasonerQueryCallee.java:64`; `/setaf` offers
  `get_credulous` / `get_skeptical`.
- **E4 — answer is `Collection.toString()`.** Unordered (`HashSet`), and ambiguous for names with
  commas or brackets. Numeric names (`0`, `1`, …) parse fine as PL atoms, so Agon can send its
  ids and reuse the integer-only `listOfSets.ts` parser.
- **E5 — timeouts don't stop work.** `runCallee` → `shutdownNow()` interrupts, but the ABA code
  never checks for interrupts. Shared across endpoints, much worse with ABA's cost.
- **E6 — not routed in Agon.** `/aba` is missing from `config/backend-routes.json`.

## Plan

Work on a branch in the submodule (`aba-rework`), PR upstream later. Keep the classes
`AbaTheory`, `Assumption`, `InferenceRule`, `Negation`, `AbaExtension` and the text format
(`{…}`, `h <- b`, `not a = c`). Only `org-tweetyproject-web` depends on `arg-aba`.

### Phase 1 — tests first

- [ ] Make `AbaTest` run (migrate to JUnit 5, or add `junit-vintage-engine`) (D1)
- [ ] Re-enable the disabled tests; fix the `Example3` expectations (D2, D3)
- [ ] Add the paper's examples with expected results from the reference (2.4, 3.14, 3.15) (D4)
- [ ] Add a scaling test (e.g. 12 assumptions under a time budget)

### Phase 2 — core rewrite (`AbaTheory`)

- [ ] Real 2ⁿ subset enumeration (bitmask or iterative) (B1)
- [ ] Forward-chaining `Th(S)`; `cl(S)`, `isClosed`, `attacks` on top of it (B3)
- [ ] Compute closed sets and their attack targets once per query, reuse across checks (B2)
- [ ] Syntactic `isFlat` (no assumption heads a rule) (B1)
- [ ] Ground FOL once and cache (B4); fix `Negation.getSignature()` (C4)
- [ ] Keep `getAllDeductions` for callers that need actual arguments (e.g. `asDungTheory`)

### Phase 3 — semantics

- [ ] Fix stable: closed, conflict-free, attacks each `x ∈ A \ E` (A1)
- [ ] Grounded = ⊆-minimal complete; none when there is no complete extension; keep `wf` as an
      alias (A2)
- [ ] Add conflict-free and admissible reasoners (A3)
- [ ] Flat fast path: compile to a SETAF over the assumptions (paper Def. 3.5; attacks
      `(T, h)` for `T ⊢ ‾h`, minimal `T` only), evaluate with `arg-setaf`; handle `∅ ⊢ ‾a`
      (assumption always out, no SETAF edge). Replaces `FlatAbaReasoner` (A4)
- [ ] Credulous/skeptical query on the reasoners

### Phase 4 — parser and model

- [ ] Strict line grammar; clear `ParserException` with line number for anything else (C2)
- [ ] `true` as empty body (C3)
- [ ] Contrary validation per the decision below (C1)
- [ ] Clean up `Assumption.isFact()`, `AbaAttack.attacks`, `InferenceRule.isConstraint()` (C5)

### Phase 5 — web service

- [ ] `get_credulous` / `get_skeptical` commands (E3)
- [ ] Return parse and validation errors to the client (E1, E2)
- [ ] Validate `kb_format`, `semantics`, `cmd` up front (E2)
- [ ] Deterministic answer order (sort) (E4)
- [ ] Check `Thread.interrupted()` in the reasoner loops (E5)
- [ ] Update the semantics list returned by `cmd: semantics`

### Phase 6 — Agon side

- [ ] Add `/aba` to `config/backend-routes.json` (E6)
- [ ] Adapter: model → KB text with numeric ids, answer → assumption ids via `listOfSets.ts`
- [ ] Evaluation wiring in the ABA module (`evaluation/`, `WindowExtensions.vue`)

### Later

- [ ] Δ-semantics (`co_Δ`, `gr_Δ`); tests from paper Ex. 4.8/4.9
- [ ] Optionally return the compiled BSAF, so Agon's semantic views don't duplicate the logic

## Open decisions

- **Contraries:** keep the relation (general, backwards compatible), enforce exactly one per
  assumption like the paper, or accept the relation with a strict mode the app turns on?
- **PR scope:** phases 1–3 make results correct and fast; 4–5 harden the endpoint; Δ separately.
  One PR or two?
- **Upstream:** branch in the submodule, then PR to TweetyProjectTeam — confirm with the
  maintainers how they take a rework of this size.
