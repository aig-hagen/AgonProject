# Glossary review: abstract argumentation

Audit of all 87 entries in `src/modules/abstract-argumentation/glossary/en/`. Checked for
correctness against the cited PDFs, missing links, missing entries, formality, readability, and
notation. Pilot for the other modules.

## Status

- [x] Phase 0: mechanical pre-pass (unlinked mentions, rule breaks, link graph)
- [x] Phase 1: review by three `formal-reviewer` agents (core, weak/SCC/serialisation, rankings)
- [x] Phase 2: merge into this file
- [x] Phase 3: triage (decisions in §1, entries in §3; all 77 accepted via the review page)
- [x] Phase 4: applied; `symbol` field, new entries, cross-module tooltip registry; `formal-reviewer`
      findings resolved (D7 serialisation still deferred)

**How to triage:** tick a box to accept, strike it or write `reject` to drop it, or add a note to
tweak it. Decisions in §1 shape many proposals in §3, so settle them first. Proposed texts in §3
already assume the recommended option of each decision.

Severity tags: **[fix]** the entry is wrong or misattributed; **[variant]** the entry silently
uses an equivalent form or deviates from the source; **[style]** links, formality, notation,
readability.

## Next: other modules

The AF review is applied (commits `9b501f6`, `f2239fd`, `9ee7707`). Its conventions now live in
[glossary.md](../contributing/glossary.md#style-and-notation); the tooling and process are in
[`scripts/glossary-review/`](../../scripts/glossary-review/README.md).

- [ ] D7 serialisation entries (SER, serialisation, serialisability principle): maintainer to decide.
- [ ] Remaining modules, smallest first to warm up: incomplete (4), bipolar (6), SetAF (10), PAF
      (10), complexity (19), ABA (19), ADF (25), principles (51). Each gets its own review file.
- [ ] `symbol` for the other modules' semantics entries (AF only so far).

Lessons from the AF pass:

- Settle cross-cutting decisions (§1) before entry-level triage; most proposals follow from them.
- Tell reviewers the house style up front: lean entries, nothing new below `##`, link only to keys
  the editor registry provides, and course notation.
- Proposals drift from the files once fixes land after review; regenerate §3 or treat the files as
  the source of truth.
- Check every claim a reviewer makes against the PDF before it becomes a fix.

## 1. Cross-cutting decisions

### D1. Opening template for definitions

- [x] **Decided.** Template:

> A set $E \subseteq A$ is _X_ iff …

- No "In an [[AF]] $F=(A,R)$," opener and no global convention sentence: the ambient AF is implied,
  and $E \subseteq A$ ties $E$ to it.
- Always "$E \subseteq A$", never "a set of arguments $E$" or bare "$E$".
- Mention $F$ explicitly only where the definition quantifies over AFs: semantics, ranking
  semantics ("associates to any [[AF]] $F$ …", without $(A,R)$), principles, serialisability.
- [x] **Symbols:** not in the definition text. A new optional frontmatter field `symbol` (bare
      LaTeX, e.g. `\mathsf{co}`) is rendered as a small chip after the title in the tooltip and on
      the glossary page. AF module only for now. `semantics` states the $\sigma(F)$ convention once.
      Entries whose label is the symbol ($E^+$, $E^\oplus$, $\alpha_{\mathsf{ad}}$) need no field.
- [x] **General rules** (from the first review pass):
  - No new text below `##`; only existing content may move there, and decided notes (D5 SAF
    credit, D8 IGD) stay.
  - No reading-aid sentences that restate the formula.
  - Spell out conditions ("complete and there is no complete $E'$ …"), no $\sigma(F)$ shorthand.
    Compact formulas such as $E \subseteq \bigcap \mathsf{pr}(F)$ stay.
  - Exception: `attackedSet` and `attackersSet` open informally ("The set of arguments attacked by
    $E$, i.e. …"), since they are linked often.

### D2. Notation conventions

Guiding rule: align with the FernUni course text (`../m_64402_fa/kurstext`, macros in
`_macros/fa_header.tex`) wherever possible.

- [x] **Extension semantics** in lowercase `\mathsf`, as in the course and DD18: $\mathsf{cf}$,
      $\mathsf{ad}$, $\mathsf{co}$, $\mathsf{gr}$, $\mathsf{pr}$, $\mathsf{st}$, $\mathsf{sst}$,
      $\mathsf{stg}$, $\mathsf{na}$, $\mathsf{id}$, $\mathsf{sad}$, $\mathsf{ud}$, $\mathsf{sud}$,
      $\mathsf{wad}$, $\mathsf{wco}$, $\mathsf{wgr}$, $\mathsf{wpr}$, $\mathsf{uc}$,
      $\mathsf{cf2}$, $\mathsf{stg2}$, $\mathsf{scf2}$, $\mathsf{is}$.
- [x] **Eager:** $\mathsf{ea}$, following TweetyProject (`EAGER_SEMANTICS = EA`). Not in the course.
- [x] **Set variable:** $E$ (deviates from the course's $S$, on purpose).
- [x] **Attacks:** always $(a,b) \in R$; drop $a \to b$ from AF. Use $E^+$, $E^-$, $a^+$, $a^-$, and
      $E^\oplus$ for the range, without the course's $F$ subscript.
- [x] **Characteristic function:** keep $\Delta_F$ (also the course's notation).
- [x] **Ranking semantics**, as in the course: a ranking semantics is $\theta$, the set of all is
      $\Theta$ (extension semantics: $\Sigma$). Named ones as $\theta^{\mathsf{Cat}}$,
      $\theta^{\mathsf{ser}}$, …, with the relation $a \succeq^{\theta^{\mathsf{Cat}}}_F b$ and
      $\succ$, $\simeq$, $\asymp$ for strict, equal, incomparable.
- [x] **Functions** in `\mathsf` too, as in the course: $\mathsf{Cat}_F$, $\mathsf{ser}_F$. The
      $\theta^{\cdot}$ wrapper keeps the semantics apart from the function. Open: names not in the
      course ($\mathsf{Bur}$, $\mathsf{Dis}$ vs the course's $\mathsf{D}^F$, $\mathsf{s}$, …) get
      settled per entry when applied.
- [x] **Labels:** $\mathsf{in}$, $\mathsf{out}$, $\mathsf{undec}$, as in the course (replaces
      $\mathrm{I}, \mathrm{O}, \mathrm{U}$).
- [x] **Built-ins and symbols:** `\min`, not `\mathrm{min}`; `\colon X \to Y` for signatures, never
      `\mapsto`; `\cdot` for real products, not `\times`; hyphenated subscripts as
      `\mathsf{q}\text{-}\sigma`.
- [x] **Initial sets:** $\mathsf{is}(F)$, $\mathsf{is}^{\not\leftarrow}(F)$,
      $\mathsf{is}^{\not\leftrightarrow}(F)$, $\mathsf{is}^{\leftrightarrow}(F)$ (as in the course),
      each introduced in its own entry. Selection and termination functions as equations,
      $\alpha_{\mathsf{x}}(X,Y,Z) = \dots$ and $\beta_{\mathsf{x}}(F,S) = 1$ iff ….
- [x] **Markdown mechanics:** a link goes on the whole symbol (`[[reduct|$F^E$]]`), with no spaces
      inside the label. Never split a set-builder across `$…$` spans; use `\text{}` inside.
- [x] **Wording:** always "iff" in definitions. Every "⊆-maximal/minimal" says among which sets.
      Write "fixed point", not "fixpoint".
- The §3 proposals still use the old ranking notation ($\succeq^{\mathsf{Cat}}_F$, `\mathrm`
  functions, $\mathrm{I}/\mathrm{O}/\mathrm{U}$); they get adjusted when applied.

### D3. Ranking template

No ranking entry links [[rankingSemantics]] or [[preorder]]. TU, counting, and propagation are
prose.

- [x] **Decided:** keep the current template, link [[rankingSemantics]] on "ranking", and switch
      to the D2 notation:

> The _X_ ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]]
> $\succeq^{\theta^{\mathsf{X}}}_F$ on $A$ such that $\forall a,b \in A$:
> $a \succeq^{\theta^{\mathsf{X}}}_F b$ iff …

- TU, counting, and propagation move to this template too.

### D4. Undeclared variants

Several entries state an equivalent theorem as the definition, or deviate from the source without
saying so:

| Entry                | Source definition                              | Entry uses                       |
| -------------------- | ---------------------------------------------- | -------------------------------- |
| AF                   | D95: $A$ may be infinite                       | finite $A$ (as DD18)             |
| GR                   | D95 Def. 20: least fixed point of $F_{AF}$     | ⊆-minimal complete (D95 Thm. 25) |
| PR                   | D95 Def. 7: ⊆-maximal admissible               | ⊆-maximal complete (C07)         |
| SUD                  | T23 Def. 5: undisputed and $F^E$ is ud-vacuous | conflict-free + … (T23 Prop. 6)  |
| STG                  | V96 Def. 3: pairs (undefeated, defeated) args  | sets (DD18 Def. 3.4)             |
| semiQualifiedLocalFn | DRT20 Def. 12: $g_\sigma$ on the right (typo)  | $f_\sigma$                       |

- [x] **Decided:** keep the current forms of AF, GR, PR, SUD, and STG (they match the course). Add
      the source's form below `##` with a citation.
- [x] DRT20 Def. 12 typo: recorded in `literature/notes/principles.md`; no glossary note.

### D5. References

- [x] `semantics`, `extension`: keep D95 (Dung uses both terms).
- [x] `NA`: cite BGG05 (Def. 6). Nothing below `##`.
- [x] `scc`: graph-theory term; leave without a reference.
- [x] `sccRecursive`: keep BGG05. The §3 proposal (DG16's simplified scheme) gets rewritten to follow
      BGG05 when applied.
- [x] `SAF`: cite BDKM16 (Def. 12); credit LM11 below `##`.
- [x] `IS`: cite XC16 (Def. 9).
- [x] `categorizerFunction`: keep BH01, no PLZL14 note.
- [x] `rankingPR`: keep D17.
- Missing PDFs (C06, C14, XC18, AB13, MT08, D17): not now; those entries stay unverified.

### D6. Labels and titles

All accepted. Keys stay unchanged; only display labels and titles change.

- [x] Initial-set labels: `unattacked initial set`, `unchallenged initial set`,
      `challenged initial set`. Today `unchallengedInitial` and `UC` are both "unchallenged".
- [x] `IS`: label `initial set`, title `Initial Set`.
- [x] `semiQualifiedLocalFn` label: `semi-qualified weak local function` (matches the title).
- [x] `sccRecursive` title: `SCC-Recursive Scheme` (matches the label and BGG05's "schema").
- [x] `probabilisticSumTCoNorm` and `productTNorm` labels: lowercase `probabilistic sum t-conorm`
      and `product t-norm`.
- [x] `rankingSER`: "serialisability-based" lowercase in the text; title
      `Serialisability-Based Ranking`.

**When applying:** bare links (`[[key]]`, no own text) render the new label, so reread these:
selFnGR, selFnUC, UC (initial sets); SER, serialisation, serialisationSequence (`[[IS]]`); SQLD;
simpleProductSemantics. Most are rewritten in §3 anyway. Also check where labels show outside the
glossary (e.g. `IS` as a row in the complexity and principle tables, evaluation-window term lists).

### D7. SER, serialisation, serialisability

`SER` and `serialisation` share the title "Serialisable Semantics" and say nearly the same thing.
The principle `serialisability` repeats them.

**Deferred** (maintainer to rethink). Skip SER, serialisation, and serialisability when applying.

- [ ] Split: `SER` = the parametrised $(\alpha,\beta)$-serialised semantics; `serialisation` = the
      property "σ is serialisable" (T22 Def. 7), retitled `Serialisability`; the principle links to
      `serialisation`.
- [ ] Check the course's serialisation terms (e.g. "Serialisierungszustand") first.

### D8. IGD names the wrong definition

The entry gives GM15 Def. 10 (ranking by graded semantics, via $mn$-complete skeptical
acceptance), but calls it the iterated graded defense ranking, which is GM15 Def. 8 (via the limit
${d^m_n}^*(\emptyset)$). They differ for $n < m$. The app (TweetyProject) computes Def. 10, with
$1 \le m,n \le |A|-1$.

Verified: GM15 Def. 8 vs Def. 10 as stated; `IteratedGradedDefenseReasoner.getModel` collects all
$mn$-complete extensions for $1 \le m,n < |A|$ and compares skeptical membership.

- [x] **Decided:** the text matches what is computed. Keep the Def. 10 / $mn$-complete text and
      state the bound $1 \le m,n \le |A|-1$. Below `##`: GM15 calls this ranking by graded
      semantics (Def. 10), distinct from iterated graded defence (Def. 8). Keep the app's name
      (spelled "defence", see D9).

### D9. Smaller placement and spelling calls

- [x] `SCOOC` stays in the AF glossary.
- [x] "defence" everywhere: labels, titles, and text of gradedDefenseFunction, IGD, TU, and the
      `displayName` 'Iterated Graded Defense' in `evaluation/tweetyProjectRanking.ts`. Keys
      (`gradedDefenseFunction`) and publication titles stay unchanged.

### D10. Out of scope here, flagged for later

- IGD implementation: see D8.
- SAF `epsilon` parameter allows `min: 0`; LM11 Ex. 15 shows social models aren't unique there.
- Whether the app's SCF2 applies the nsa step (deleting self-attackers) is unchecked.
- `PROB` (probabilistic ranking): moved to §2 as a new entry. The app offers stable as base
  semantics (TCR18 covers co, gr, pr only) and allows $p \in \{0, 1\}$ (degenerate: all scores 0, or
  classical acceptance).
- The local PLZL15 PDF is the arXiv version; `publications.ts` cites CogSci. Check the locators.

## 2. New entries

To be written via the `glossary-entry` skill. Keep the glossary lean: only core notions or entries
the app needs; niche helper terms are phrased inline instead.

- [x] `range` $E^\oplus = E \cup E^+$: DD18 Def. 3.3 (V96 Def. 3(1)). Used by ST, SST, STG; mirrors
      `setafRange`; the course uses $S^\oplus$.
- [x] `labelling` (AF): CG09 Def. 4 (Caminada, Gabbay, Studia Logica 93, pp. 109–145, 2009, DOI
      10.1007/s11225-009-9218-x; PDF in `literature/CG09.pdf`; add to `publications.ts` with the entry); course labels $\mathsf{in}/\mathsf{out}/\mathsf{undec}$. Used by
      QLD, SQLD, and the decomposability principles.
- [x] `rankingPROB` (probabilistic ranking): Thimm, Cerutti, Rienstra, "Probabilistic Graded
      Semantics", COMMA'18, FAIA 305, pp. 369–380, IOS Press, DOI 10.3233/978-1-61499-906-5-369
      (DBLP; course bib `Thimm:2018a`; cited by TweetyProject's `ProbabilisticRankingReasoner`).
      PDF in `literature/TCR18.pdf` (author version). Add `TCR18` to `publications.ts` with the entry.
  - Paper Def. 4–5: $F[p] = (A,R,P)$ with $P(a)=p$ (attacks always present), graded semantics
    $G^{\sigma,\circ,p}_F(a) = P^{F[p]}_{\circ,\sigma}(a)$ for $p \in [0,1]$,
    $\sigma \in \{\mathsf{co},\mathsf{gr},\mathsf{pr}\}$, $\circ \in \{s,c\}$; ranked via $\geq$ (after
    Def. 2). Course 3.4.3 states the same as $\theta^p_{\sigma,\circ}$ with $p \in (0,1)$,
    $\circ \in \{l,s\}$.
  - Write $\theta^p_{\sigma,\circ}$ (course) with $\circ \in \{c,s\}$ (paper; "l" is German). Say
    attacks are certain (our PAF entry also has attack probabilities). Keep the PAF module's
    $P_\sigma$ so links stay consistent.
  - Wire `tooltipId: 'rankingPROB'` in `tweetyProjectRanking.ts`.

Not added, phrased inline or dropped:

- SCF2 helpers (odd cycle, SCOOC-naive, nsa): SCF2 becomes an idea-level sentence linking [[SCOOC]].
- QLD/SQLD helpers (local function, AF with (total) input, weak local function, outparent): QLD,
  SQLD, qualifiedLocalFn, semiQualifiedLocalFn become idea-level texts.
- Lexicographic order: "lexicographically" inline in BB, DB.
- Walk / attack path: phrased inline in discussionCount, rankingCO, rankingPR (course: paths of
  length $i$ ending in $a$, length = number of edges).
- Attack/defence branch, tupled value, t-norm/t-conorm, $D_F(S)$, total preorder: dropped.
- State $(F,S)$: deferred with D7.

Not needed: "argument" and "attack" are defined in `AF`. The pre-pass hits on `abaAttack` are noise.

## 3. Entries

Proposals follow the decisions in §1 and §2. Each entry shows the current definition, the
proposal, and what goes below `##` (longer text, not the tooltip). Tick to accept, or comment.

### 3.1 Core

#### AF

- [ ] Accept

```md
current: An argumentation framework $F = (A, R)$ consists of a finite set of arguments $A$ and an attack relation $R \subseteq A \times A$. We write $a \to b$ if $(a,b) \in R$, meaning $a$ attacks $b$.
proposed: An argumentation framework $F = (A, R)$ consists of a finite set of arguments $A$ and an attack relation $R \subseteq A \times A$, where $(a,b) \in R$ means that $a$ attacks $b$.
```

#### CF (symbol: $\mathsf{cf}$)

- [ ] Accept

```md
current: A set of arguments $E$ is conflict-free iff for all arguments $a,b \in E$ we have that $(a,b) \notin R$.
proposed: A set $E \subseteq A$ is conflict-free iff there are no $a,b \in E$ with $(a,b) \in R$.
```

#### ADM (symbol: $\mathsf{ad}$)

- [ ] Accept

```md
current: A set of arguments $E$ is admissible iff $E$ is [[CF]] and [[defends]] every argument $a \in E$.
proposed: A set $E \subseteq A$ is admissible iff $E$ is [[CF|conflict-free]] and [[defends]] every $a \in E$.
```

#### CO (symbol: $\mathsf{co}$)

- [ ] Accept

```md
current: A set of arguments $E$ is a complete extension iff $E$ is [[ADM]] and for every argument $a \in A$ [[defends|defended]] by $E$, we have that $a \in E$.
proposed: A set $E \subseteq A$ is a complete [[extension]] iff $E$ is [[ADM|admissible]] and for every argument $a \in A$ [[defends|defended]] by $E$, we have $a \in E$.
```

#### GR (symbol: $\mathsf{gr}$)

- [ ] Accept

```md
current: A set of arguments $E$ is the grounded extension iff $E$ is [[CO]] and $\subseteq$-minimal. The unique grounded extension is the least fixpoint of the [[charFunction]] $\Delta_F$.
proposed: A set $E \subseteq A$ is the grounded [[extension]] iff $E$ is a $\subseteq$-minimal [[CO|complete]] extension. It is the least fixed point of the [[charFunction|characteristic function]] $\Delta_F$.
```

#### PR (symbol: $\mathsf{pr}$)

- [ ] Accept

```md
current: A set of arguments $E$ is a preferred extension iff $E$ is [[CO]] and $\subseteq$-maximal.
proposed: A set $E \subseteq A$ is a preferred [[extension]] iff $E$ is a $\subseteq$-maximal [[CO|complete]] extension.
```

#### ST (symbol: $\mathsf{st}$)

- [ ] Accept

```md
current: A set of arguments $E$ is a stable extension iff $E$ is [[CF]] and we have that $E \cup$ [[attackedSet|$E^+$]] $= A$.
proposed: A set $E \subseteq A$ is a stable [[extension]] iff $E$ is [[CF|conflict-free]] and [[range|$E^\oplus$]] $= A$.
```

#### SST (unverified: C06 missing; symbol: $\mathsf{sst}$)

- [ ] Accept

```md
current: A set of arguments $E$ is a semi-stable extension iff $E$ is [[CO]] and $E \cup $[[attackedSet|$E^+$]] is $\subseteq$-maximal.
proposed: A set $E \subseteq A$ is a semi-stable [[extension]] iff $E$ is [[CO|complete]] and there is no complete extension $E'$ with [[range|$E^\oplus$]] $\subsetneq E'^\oplus$.
```

#### STG (symbol: $\mathsf{stg}$)

- [ ] Accept

```md
current: A set of arguments $E$ is a stage extension iff $E$ is [[CF]] and $E \cup $[[attackedSet|$E^+$]] is $\subseteq$-maximal.
proposed: A set $E \subseteq A$ is a stage [[extension]] iff $E$ is [[CF|conflict-free]] and there is no conflict-free $E' \subseteq A$ with [[range|$E^\oplus$]] $\subsetneq E'^\oplus$.
```

#### NA (reference: BGG05; symbol: $\mathsf{na}$)

- [ ] Accept

```md
current: A set of arguments $E$ is naive iff $E$ is a $\subseteq$-maximal [[CF]] set.
proposed: A set $E \subseteq A$ is a naive [[extension]] iff $E$ is a $\subseteq$-maximal [[CF|conflict-free]] set.
```

#### ID (symbol: $\mathsf{id}$)

- [ ] Accept

```md
current: The ideal extension is the $\subseteq$-maximal [[ADM]] set in the intersection of all [[PR]] extensions.
proposed: A set $E \subseteq A$ is the ideal [[extension]] iff $E$ is the $\subseteq$-maximal [[ADM|admissible]] set with $E \subseteq \bigcap$ [[PR|$\mathsf{pr}(F)$]].
```

#### EA (symbol: $\mathsf{ea}$)

- [ ] Accept

```md
current: The eager extension is the $\subseteq$-maximal [[ADM]] set in the intersection of all [[SST]] extensions.
proposed: A set $E \subseteq A$ is the eager [[extension]] iff $E$ is the $\subseteq$-maximal [[ADM|admissible]] set with $E \subseteq \bigcap$ [[SST|$\mathsf{sst}(F)$]].
```

#### SAD (unverified: C14 missing; symbol: $\mathsf{sad}$)

- [ ] Accept

```md
current: A set of arguments $E$ is strongly admissible iff $E=\emptyset$ or each $a \in E$ is [[defends|defended]] by some strongly admissible $E' \subseteq E \setminus \{a\}$.
proposed: A set $E \subseteq A$ is strongly admissible iff every $a \in E$ is [[defends|defended]] by some strongly admissible $E' \subseteq E \setminus \{a\}$.
```

#### UD (symbol: $\mathsf{ud}$)

- [ ] Accept

```md
current: A set of arguments $E$ is undisputed iff $E$ is [[CF]] in $F$ and the [[reduct]] $F^E$ contains no non-empty [[ADM]] set.
proposed: A set $E \subseteq A$ is undisputed iff $E$ is [[CF|conflict-free]] and the [[reduct]] $F^E$ has no non-empty [[ADM|admissible]] set.
```

- Below `##` (accepted): "That is, $\mathsf{ud} = \mathsf{cf}^{\mathsf{ad}}$, a [[VR|vacuous reduct semantics]]."

#### SUD (symbol: $\mathsf{sud}$)

- [ ] Accept

```md
current: A set of arguments $E$ is strongly undisputed iff $E$ is [[CF]] in $F$ and the [[reduct]] $F^E$ contains no non-empty [[UD]] set.
proposed: A set $E \subseteq A$ is strongly undisputed iff $E$ is [[CF|conflict-free]] and the [[reduct]] $F^E$ has no non-empty [[UD|undisputed]] set.
```

- Below `##`, as in UD: "That is, $\mathsf{sud} = \mathsf{cf}^{\mathsf{ud}}$, a [[VR|vacuous reduct semantics]]."

#### attackedSet

- [ ] Accept

```md
current: The set of arguments attacked by $E$, i.e. $E^+ = \{ a \in A \mid \exists b \in E: (b,a) \in R \}$
proposed: The set of arguments attacked by $E \subseteq A$, i.e. $E^+ = \{a \in A \mid \exists b \in E : (b,a) \in R\}$.
```

#### attackersSet

- [ ] Accept

```md
current: The set of arguments attacking $E$, i.e. $E^- = \{ a \in A \mid \exists b \in E: (a,b) \in R \}$
proposed: The set of arguments attacking $E \subseteq A$, i.e. $E^- = \{a \in A \mid \exists b \in E : (a,b) \in R\}$.
```

- $a^-$ for single arguments stays undefined (accepted).

#### unattackedSet

- [ ] Accept

```md
current: A set $U \subseteq A$ is unattacked iff no argument in $A \setminus U$ attacks an argument in $U$.
proposed: A set $E \subseteq A$ is unattacked iff no argument in $A \setminus E$ attacks an argument in $E$, i.e. [[attackersSet|$E^-$]] $\subseteq E$.
```

#### defends

- [ ] Accept

```md
current: A set of arguments $E$ defends an argument $a$ iff for every argument $b$ attacking $a$, there is some argument $c \in E$ attacking $b$.
proposed: A set $E \subseteq A$ defends $a \in A$ iff for every $b \in A$ with $(b,a) \in R$ there is $c \in E$ with $(c,b) \in R$.
```

#### stronglyDefends

- [ ] Accept

```md
current: A set of arguments $E$ strongly defends an argument $a$ iff for every argument $b$ attacking $a$, there is some argument $c \in E \setminus \{a\}$ attacking $b$ such that $E \setminus \{a\}$ strongly defends $c$.
proposed: A set $E \subseteq A$ strongly defends $a \in A$ iff for every $b \in$ [[attackersSet|$a^-$]] there is $c \in E \setminus \{a\}$ with $(c,b) \in R$ such that $E \setminus \{a\}$ strongly defends $c$.
```

#### charFunction

- [ ] Accept

```md
current: The characteristic function $\Delta_F: 2^A \to 2^A$ maps each set $E$ to the arguments [[defends|defended]] by $E$, i.e. $\Delta_F(E) = \{ a \in A \mid E$ defends $a \}$.
proposed: The characteristic function $\Delta_F \colon 2^A \to 2^A$ maps each $E \subseteq A$ to the set of arguments it [[defends]], $\Delta_F(E) = \{a \in A \mid E \text{ defends } a\}$.
```

#### extension

- [ ] Accept (reference stays D95)

```md
current: An extension $E$ of an AF $F$ under a semantics $\sigma$ is a set of arguments $E \in \sigma(F)$.
proposed: Given a [[semantics]] $\sigma$ and an [[AF]] $F$, a $\sigma$-extension of $F$ is a set $E \in \sigma(F)$.
```

#### semantics

- [ ] Accept (reference stays D95)

```md
current: A semantics $\sigma$ is a function that assigns to each [[AF]] $F$ a set of extensions $\sigma(F) \subseteq 2^A$.
proposed: An (extension-based) semantics $\sigma$ assigns to each [[AF]] $F$ a set $\sigma(F) \subseteq 2^A$ of sets of arguments, the [[extension|$\sigma$-extensions]] of $F$.
```

- Below `##`: the list of abbreviations ($\mathsf{cf}$, $\mathsf{ad}$, $\mathsf{co}$, …), each
  linked.

#### credulousAcceptance

- [ ] Accept

```md
current: An argument is credulously accepted under a [[semantics]] $\sigma$ if it is contained in at least one [[extension|$\sigma$-extension]] of $F$.
proposed: Given a [[semantics]] $\sigma$, an argument $a \in A$ is credulously accepted iff $a \in E$ for some [[extension|$\sigma$-extension]] $E \in \sigma(F)$, i.e. $a \in \mathsf{cred}_\sigma(F) = \bigcup \sigma(F)$.
```

- Below `##`: link [[problemCred]].

#### skepticalAcceptance

- [ ] Accept

```md
current: An argument is skeptically accepted under a [[semantics]] $\sigma$ if it is contained in every [[extension|$\sigma$-extension]] of $F$.
proposed: Given a [[semantics]] $\sigma$, an argument $a \in A$ is skeptically accepted iff $a \in E$ for every [[extension|$\sigma$-extension]] $E \in \sigma(F)$, i.e. $a \in \mathsf{skep}_\sigma(F) = \bigcap \sigma(F)$.
```

- Below `##`: "If $\sigma(F) = \emptyset$, every argument is skeptically accepted [@DD18]." Link
  [[problemSkept]].

#### reduct

- [ ] Accept

```md
current: The reduct of $F$ with respect to $E$ is the argumentation framework $F^E = (A', R \cap (A' \times A'))$ with $A' = A \setminus (E \cup$ [[attackedSet|$E^+$]]).
proposed: For $E \subseteq A$, the $E$-reduct of $F$ is the [[AF]] $F^E = (A', R \cap (A' \times A'))$ with $A' = A \setminus$ [[range|$E^\oplus$]].
```

#### mnComplete

- [ ] Accept

```md
current: A set $X \subseteq A$ is an $mn$-complete extension of an [[AF]] $F$ iff $X$ is [[gradedNeutralityFunction|$m$-conflict-free]] and a fixed point of the [[gradedDefenseFunction]], i.e. $X \subseteq n_m(X)$ and $X = d_n^m(X)$.
proposed: For integers $m,n \geq 1$, a set $E \subseteq A$ is an $mn$-complete [[extension]] iff $E \subseteq$ [[gradedNeutralityFunction|$n_m(E)$]] and $E =$ [[gradedDefenseFunction|$d_n^m(E)$]], i.e. $E$ is $m$-conflict-free and a fixed point of graded defence.
```

#### SCOOC

- [ ] Accept

```md
current: A semantics $\sigma$ satisfies the SCOOC-principle iff for any extension $E$ and every argument $a \in A$ it holds that if neither $a$ nor any $b \in$ [[attackersSet| $a^-$]] are in an odd cycle and $a \notin $[[attackedSet| $E^+$]], then $a \in E$.
proposed: A [[semantics]] $\sigma$ satisfies SCOOC iff for every [[AF]] $F$, every $E \in \sigma(F)$, and every $a \in A$: if neither $a$ nor any $b \in$ [[attackersSet|$a^-$]] lies on an odd attack cycle and $E \cap a^- = \emptyset$, then $a \in E$.
```

- Follows CT19 Def. 12–13.

### 3.2 SCC, weak admissibility, qualified, initial sets

#### scc

- [ ] Accept (no reference: graph-theory term)

```md
current: A strongly connected component (SCC) of an AF is a maximal subset of arguments $S \subseteq A$ such that for every pair of arguments $a,b \in S$ there is a path from $a$ to $b$.
proposed: A strongly connected component (SCC) of an [[AF]] $F$ is a $\subseteq$-maximal set $S \subseteq A$ such that for all distinct $a,b \in S$ there is a path of attacks from $a$ to $b$.
```

- "every pair" with $a=b$ would exclude unattacked single arguments; "distinct" fixes that.

#### sccRecursive (title: SCC-Recursive Scheme)

- [ ] Accept

```md
current: The SCC-recursiveness scheme defines a [[semantics]] by applying a base semantics $\sigma$ locally to each [[scc]] (SCC) of the framework, processing SCCs in topological order and restricting attacks from previously evaluated SCCs.
proposed: The SCC-recursiveness scheme defines a [[semantics]] by applying a base semantics $\sigma$ locally to each [[scc]] (SCC) of the framework, processing SCCs in topological order and restricting attacks from previously evaluated SCCs.
```

- Text unchanged, as decided; only the title changes.

#### CF2 (symbol: $\mathsf{cf2}$)

- [ ] Accept

```md
current: The CF2-extensions are defined via the [[sccRecursive]] with the [[NA]] semantics as the base function.
proposed: The CF2 semantics is defined via the [[sccRecursive]] with the [[NA]] semantics as the base function.
```

- Only the subject changes ("semantics" instead of "extensions"), plus the symbol.

#### SCF2 (symbol: $\mathsf{scf2}$)

- [ ] Accept

```md
current: The SCF2-extensions are defined via the [[sccRecursive]] with the [[NA]] semantics under the [[SCOOC|SCOOC-principle]] as the base function.
proposed: The SCF2 semantics is defined via the [[sccRecursive]] with the [[NA]] semantics under the [[SCOOC|SCOOC-principle]] as the base function, after removing all self-attacking arguments.
```

#### STG2 (symbol: $\mathsf{stg2}$)

- [ ] Accept

```md
current: The stage2 extensions are defined via the [[sccRecursive]] with the [[STG]] semantics as the base function.
proposed: The stage2 semantics is defined via the [[sccRecursive]] with the [[STG]] semantics as the base function.
```

- Only the subject changes ("semantics" instead of "extensions"), plus the symbol.

#### WAD (symbol: $\mathsf{wad}$)

- [ ] Accept

```md
current: A set of arguments $E$ is weakly admissible iff $E$ is [[CF]], and for any attacker $b \in$ [[attackersSet|$E^-$]], we have that $b \notin \bigcup \mathsf{wad}$[[reduct|$(F^E)$]].
proposed: A set $E \subseteq A$ is weakly admissible iff $E$ is [[CF|conflict-free]] and $b \notin \bigcup \mathsf{wad}($[[reduct|$F^E$]]$)$ for every $b \in$ [[attackersSet|$E^-$]].
```

#### weakDefence

- [ ] Accept

```md
current: A set of arguments $E$ weakly defends the set $E'$ iff for any attacker $b$ of $E'$ we have, $E$ attacks $b$, or $b \notin \bigcup \mathsf{wad}(F^E)$, $b \notin E$ and $E' \subseteq E'' \in \mathsf{wad}(F)$.
proposed: A set $E \subseteq A$ weakly defends $E' \subseteq A$ iff for every $b \in$ [[attackersSet|$E'^-$]], either $E$ attacks $b$, or $b \notin E$, $b \notin \bigcup \mathsf{wad}($[[reduct|$F^E$]]$)$, and $E' \subseteq E''$ for some [[WAD|weakly admissible]] $E''$.
```

#### WCO (symbol: $\mathsf{wco}$)

- [ ] Accept

```md
current: A set of arguments $E$ is a weakly complete extension iff $E$ is [[WAD]] and for any $E' \subseteq A$ such that $E \subseteq E'$ and $E'$ is [[weakDefence|weakly defended]] by $E$, we have that $E' \subseteq E$.
proposed: A set $E \subseteq A$ is a weakly complete [[extension]] iff $E$ is [[WAD|weakly admissible]] and $E' \subseteq E$ for every $E' \supseteq E$ that $E$ [[weakDefence|weakly defends]].
```

#### WGR (symbol: $\mathsf{wgr}$)

- [ ] Accept

```md
current: A set of arguments $E$ is a weakly grounded extension iff $E$ is a $\subseteq$-minimal [[WCO]] extension.
proposed: A set $E \subseteq A$ is a weakly grounded [[extension]] iff $E$ is a $\subseteq$-minimal [[WCO|weakly complete]] extension.
```

#### WPR (symbol: $\mathsf{wpr}$)

- [ ] Accept

```md
current: A set of arguments $E$ is a weakly preferred extension iff $E$ is a $\subseteq$-maximal [[WAD]] set.
proposed: A set $E \subseteq A$ is a weakly preferred [[extension]] iff $E$ is a $\subseteq$-maximal [[WAD|weakly admissible]] set.
```

#### VR (symbol: $\sigma^\tau$)

- [ ] Accept

```md
current: Given a base semantics $\sigma$ and a reduct semantics $\tau$, a set $E$ is a $\sigma^{\tau}$-extension of an [[AF]] $F$ iff $E \in \sigma(F)$ and the [[reduct]] $F^E$ is $\tau$-vacuous, i.e. $\tau(F^E) \subseteq \{\emptyset\}$.
proposed: Given a base [[semantics]] $\sigma$ and a reduct semantics $\tau$, a set $E \subseteq A$ is a $\sigma^{\tau}$-extension iff $E \in \sigma(F)$ and the [[reduct]] $F^E$ is $\tau$-vacuous, i.e. $\tau(F^E) \subseteq \{\emptyset\}$.
```

- Symbol $\sigma^\tau$ added; the text still writes it out.

#### QLD (symbol: $\mathsf{q}\text{-}\sigma$)

- [ ] Accept

```md
current: Given an [[sccRecursive|SCC-decomposable semantics]] $\sigma$, qualified $\sigma$-semantics evaluates each [[scc|SCC]] using the [[qualifiedLocalFn]], which treats external attackers labelled undecided as if they were labelled out.
proposed: Given an [[sccDecomposability|SCC-decomposable]] [[semantics]] $\sigma$, the qualified semantics [[labelling|labels]] each [[scc|SCC]] like $\sigma$, but treats every attacker from an earlier SCC that is labelled $\mathsf{undec}$ as if it were labelled $\mathsf{out}$ (see [[qualifiedLocalFn]]).
```

- Fixes the link target. The local function is linked inline instead of below `##`.

#### SQLD (symbol: $\mathsf{sq}\text{-}\sigma$)

- [ ] Accept

```md
current: Given an [[sccRecursive|SCC-decomposable semantics]] $\sigma$, semi-qualified $\sigma$-semantics evaluates each [[scc|SCC]] using the [[semiQualifiedLocalFn]]. This treats an undecided outparent as out only when no alternative labelling of the SCC's outparents labels it in.
proposed: Given an [[sccDecomposability|SCC-decomposable]] [[semantics]] $\sigma$, the semi-qualified semantics [[labelling|labels]] each [[scc|SCC]] like $\sigma$, but treats an attacker from an earlier SCC that is labelled $\mathsf{undec}$ as $\mathsf{out}$ only if no other labelling of these attackers labels it $\mathsf{in}$ (see [[semiQualifiedLocalFn]]).
```

- Fixes the link target.

#### qualifiedLocalFn

- [ ] Accept

```md
current: Let $f_\sigma$ be the local function of an [[sccRecursive|SCC-decomposable semantics]] $\sigma$. Its qualified local function is defined by $f_{q-\sigma}((A,R), A_{\mathrm{in}}, R_{\mathrm{in}}, L_{\mathrm{in}}) = f_\sigma(…, L'_{\mathrm{in}})$, where $L'_{\mathrm{in}}(x) = \mathrm{I}$ if $L_{\mathrm{in}}(x) = \mathrm{I}$, and $L'_{\mathrm{in}}(x) = \mathrm{O}$ if $L_{\mathrm{in}}(x) \in \{\mathrm{O}, \mathrm{U}\}$.
proposed: The qualified local function $f_{\mathsf{q}\text{-}\sigma}$ of an [[sccDecomposability|SCC-decomposable]] [[semantics]] $\sigma$ computes the [[labelling|labellings]] of an [[scc|SCC]] like the local function $f_\sigma$ of $\sigma$, after relabelling every $\mathsf{undec}$ attacker from outside the SCC as $\mathsf{out}$.
```

- Below `##`: the existing formula (DRT20 Def. 11), moved there with $\mathsf{in}/\mathsf{out}/\mathsf{undec}$. This moves existing content rather than adding new text.

#### semiQualifiedLocalFn (label: semi-qualified weak local function)

- [ ] Accept

```md
current: Let $f_\sigma$ be the local function of an [[sccRecursive|SCC-decomposable semantics]] $\sigma$, and let $S_{\mathrm{in}}$ be the set of possible labellings of the outparents of the current SCC. The semi-qualified weak local function is defined by $g_{sq-\sigma}(…) = f_\sigma(…)$, where … otherwise it remains $\mathrm{U}$.
proposed: The semi-qualified weak local function $g_{\mathsf{sq}\text{-}\sigma}$ of an [[sccDecomposability|SCC-decomposable]] [[semantics]] $\sigma$ computes the [[labelling|labellings]] of an [[scc|SCC]] like the local function $f_\sigma$ of $\sigma$, after relabelling an $\mathsf{undec}$ attacker from outside the SCC as $\mathsf{out}$ if no other given labelling of these attackers labels it $\mathsf{in}$.
```

- Below `##`: the existing formula (DRT20 Def. 12), moved there. This moves existing content rather than adding new text.

#### IS (label: initial set; reference: XC16; symbol: $\mathsf{is}$)

- [ ] Accept

```md
current: A set of arguments $E$ is initial iff $E$ is non-empty, [[ADM]] and $\subseteq$-minimal.
proposed: A set $E \subseteq A$ is an initial set iff $E \neq \emptyset$, $E$ is [[ADM|admissible]], and no non-empty $E' \subsetneq E$ is admissible.
```

#### UC (symbol: $\mathsf{uc}$)

- [ ] Accept

```md
current: Unchallenged extensions are defined via [[serialisation]] by exhaustively selecting only [[unattackedInitial]] and [[unchallengedInitial]] [[IS]].
proposed: Unchallenged extensions are defined via [[serialisation]] by exhaustively selecting only [[unattackedInitial]] and [[unchallengedInitial]] [[IS]].
```

- Proposal rejected: text unchanged; only the symbol is added. Revisit with D7.

#### unattackedInitial / unchallengedInitial / challengedInitial (labels: … initial set; symbols: $\mathsf{is}^{\not\leftarrow}$, $\mathsf{is}^{\not\leftrightarrow}$, $\mathsf{is}^{\leftrightarrow}$)

- [ ] Accept

```md
current: An [[IS|initial]] set $E$ is called unattacked iff there is no argument $a \in A$ such that $a$ attacks some argument in $E$.
current: An [[IS|initial]] set $E$ is called unchallenged iff [[attackersSet]]$\neq \emptyset$ and there is no other initial set $E'$ that attacks $E$.
current: An [[IS|initial]] set $E$ is called challenged iff there is some other initial set $E'$ that attacks $E$.
proposed: An [[IS|initial set]] $E$ is unattacked iff [[attackersSet|$E^-$]] $= \emptyset$.
proposed: An [[IS|initial set]] $E$ is unchallenged iff [[attackersSet|$E^-$]] $\neq \emptyset$ and no initial set attacks $E$.
proposed: An [[IS|initial set]] $E$ is challenged iff some initial set attacks $E$.
```

#### selFn

- [ ] Accept

```md
current: A selection function $\alpha$ is any function $\alpha : 2^{2^A} \times 2^{2^A} \times 2^{2^A} \mapsto 2^{2^A}$, such that $\alpha(X,Y,Z)\subseteq X\cup Y\cup Z$ for all $X,Y,Z\subseteq 2^A$.
proposed: A selection function is any function $\alpha$ that maps three sets $X, Y, Z$ of sets of arguments to a set $\alpha(X,Y,Z) \subseteq X \cup Y \cup Z$. Applied to the [[unattackedInitial|unattacked]], [[unchallengedInitial|unchallenged]], and [[challengedInitial|challenged]] [[IS|initial sets]] of the current [[reduct]], it selects those eligible in the next step.
```

#### selFnADM / selFnGR / selFnUC

- [ ] Accept all three

```md
proposed: The [[selFn|selection function]] $\alpha_{\mathsf{ad}}(X,Y,Z) = X \cup Y \cup Z$ selects every [[IS|initial set]] of the current [[reduct]].
proposed: The [[selFn|selection function]] $\alpha_{\mathsf{gr}}(X,Y,Z) = X$ selects only the [[unattackedInitial|unattacked]] [[IS|initial sets]] of the current [[reduct]].
proposed: The [[selFn|selection function]] $\alpha_{\mathsf{uc}}(X,Y,Z) = X \cup Y$ selects only the [[unattackedInitial|unattacked]] and [[unchallengedInitial|unchallenged]] [[IS|initial sets]] of the current [[reduct]].
```

#### termFn

- [ ] Accept

```md
current: A termination function $\beta$ is any function $\beta : \mathbb{F}\times 2^{\mathbb{A}}\mapsto \{0,1\}$.
proposed: A termination function is any function $\beta$ that maps each state $(F, E)$, with $F$ the current [[reduct]] and $E$ the set of arguments selected so far, to $\{0,1\}$; $\beta(F,E) = 1$ means the construction may end in this state.
```

#### termFnADM / termFnCO / termFnPR / termFnST / termFnUC

- [ ] Accept

```md
proposed: The [[termFn|termination function]] $\beta_{\mathsf{ad}}$ is defined by $\beta_{\mathsf{ad}}(F,E) = 1$ for every state $(F,E)$.
proposed: The [[termFn|termination function]] $\beta_{\mathsf{co}}$ is defined by $\beta_{\mathsf{co}}(F,E) = 1$ iff [[unattackedInitial|$\mathsf{is}^{\not\leftarrow}(F)$]] $= \emptyset$.
proposed: The [[termFn|termination function]] $\beta_{\mathsf{pr}}$ is defined by $\beta_{\mathsf{pr}}(F,E) = 1$ iff [[IS|$\mathsf{is}(F)$]] $= \emptyset$.
proposed: The [[termFn|termination function]] $\beta_{\mathsf{st}}$ is defined by $\beta_{\mathsf{st}}(F,E) = 1$ iff $F = (\emptyset, \emptyset)$.
proposed: The [[termFn|termination function]] $\beta_{\mathsf{uc}}$ is defined by $\beta_{\mathsf{uc}}(F,E) = 1$ iff [[unattackedInitial|$\mathsf{is}^{\not\leftarrow}(F)$]] $\cup$ [[unchallengedInitial|$\mathsf{is}^{\not\leftrightarrow}(F)$]] $= \emptyset$.
```

- All correct today; this aligns wording and spacing.

#### serialisationIndex (symbol: $\mathsf{ser}_F$)

- [ ] Accept

```md
current: The serialisation index $\mathrm{ser}_F(a)$ of an argument $a$ is defined as $\mathrm{ser}_F(a) = \mathrm{min}\{ n \mid (S_1, \ldots, S_n)$ is a [[serialisationSequence]] and $a \in S_n \}$, with $\min \emptyset = \infty$.
proposed: The serialisation index of $a \in A$ is $\mathsf{ser}_F(a) = \min\{ n \mid (S_1, \ldots, S_n)$ is a [[serialisationSequence|serialisation sequence]] with $a \in S_n \}$, with $\min \emptyset = \infty$.
```

#### serialisationSequence

- [ ] Accept

```md
current: A serialisation sequence is a sequence $(S_1, \ldots, S_n)$ such that $S_1$ is an [[IS]] of $F$ and every $S_{i}$ is an [[IS]] of the [[reduct]] $F^{S_1 \cup \ldots \cup S_{i-1}}$. Every serialisation sequence induces an [[ADM]] set.
proposed: A serialisation sequence is a sequence $(S_1, \ldots, S_n)$ such that $S_1$ is an [[IS|initial set]] of $F$ and each $S_i$ with $2 \le i \le n$ is an initial set of the [[reduct]] $F^{S_1 \cup \ldots \cup S_{i-1}}$.
```

- Below `##`: "Every serialisation sequence induces an [[ADM|admissible]] set." (moved from the definition)

#### SER, serialisation

- Deferred (D7).

### 3.3 Rankings

#### rankingSemantics

- [ ] Accept

```md
current: An argument-ranking semantics $\Theta$ is a function that associates to any [[AF]] $F$ a ranking $\succeq_F^\Theta$ on $A$, where $\succeq_F^\Theta$ is a [[preorder]] on $A$. $a \succeq_F^\Theta b$ means that $a$ is at least as acceptable as $b$.
proposed: An argument-ranking semantics $\theta$ assigns to each [[AF]] $F$ a [[preorder]] $\succeq^\theta_F$ on $A$, the ranking of $F$; $a \succeq^\theta_F b$ means that $a$ is at least as acceptable as $b$.
```

#### preorder / reflexive / transitive

- [ ] Accept all three

```md
proposed: A preorder on a set $X$ is a binary relation $\succeq \subseteq X \times X$ that is [[reflexive]] and [[transitive]].
proposed: A binary relation $\succeq$ on a set $X$ is reflexive iff $a \succeq a$ for all $a \in X$.
proposed: A binary relation $\succeq$ on a set $X$ is transitive iff for all $a,b,c \in X$, $a \succeq b$ and $b \succeq c$ imply $a \succeq c$.
```

#### BB (symbol: $\theta^{\mathsf{Bbs}}$)

- [ ] Accept

```md
current: The burden-based ranking associates to any AF $F$ a ranking $\succeq_F^\mathrm{BB}$ on $A$ such that $\forall a,b \in A: a \succeq_F^\mathrm{BB} b$ iff $\mathrm{Bur}(b) \succeq_{lex} \mathrm{Bur}(a)$, where $\mathrm{Bur}$ is the [[BurdenNumber]].
proposed: The burden-based ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{Bbs}}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^{\mathsf{Bbs}}}_F b$ iff $\mathsf{Bur}_F(a) \preceq_{\mathrm{lex}} \mathsf{Bur}_F(b)$, where $\mathsf{Bur}_F$ is the [[BurdenNumber|burden number]].
```

- $\theta^{\mathsf{Bbs}}$ after BDKM16 (the course has no burden-based ranking).

#### BurdenNumber (symbol: $\mathsf{Bur}_F$)

- [ ] Accept

```md
current: The Burden number of $a$ is denoted $\mathrm{Bur}(a) = \langle \mathrm{Bur}_0(a), \mathrm{Bur}_1(a), \ldots \rangle$, where $\mathrm{Bur}_0(a) = 1$ and $\mathrm{Bur}_{i}(a) = 1 + \sum_{b \in a^-} \frac{1}{\mathrm{Bur}_{i-1}(b)}$ for $i > 0$.
proposed: The burden number of $a \in A$ is the sequence $\mathsf{Bur}_F(a) = \langle \mathsf{Bur}_0(a), \mathsf{Bur}_1(a), \ldots \rangle$ with $\mathsf{Bur}_0(a) = 1$ and $\mathsf{Bur}_i(a) = 1 + \sum_{b \in a^-} \frac{1}{\mathsf{Bur}_{i-1}(b)}$ for $i > 0$, where [[attackersSet|$a^-$]] are the attackers of $a$.
```

#### CAT (symbol: $\theta^{\mathsf{Cat}}$)

- [ ] Accept

```md
current: The categorizer ranking associates to any AF $F$ a ranking $\succeq_F^\mathrm{Cat}$ on $A$ such that $\forall a,b \in A: a \succeq_F^\mathrm{Cat} b$ iff $\mathrm{Cat}_F(a) \geq \mathrm{Cat}_F(b)$, where $\mathrm{Cat}_F$ is the [[categorizerFunction]].
proposed: The categorizer ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{Cat}}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^{\mathsf{Cat}}}_F b$ iff $\mathsf{Cat}_F(a) \geq \mathsf{Cat}_F(b)$, where $\mathsf{Cat}_F$ is the [[categorizerFunction|categorizer function]].
```

#### categorizerFunction (reference stays BH01; symbol: $\mathsf{Cat}_F$)

- [ ] Accept

```md
current: The categorizer function $\mathrm{Cat}_F: A \mapsto (0,1]$ is defined as $\mathrm{Cat}_F(a) = 1$ if $a^-=\emptyset$ and $\mathrm{Cat}_F(a) = \frac{1}{1 + \sum_{b \in a^-} \mathrm{Cat}_F(b)}$ otherwise.
proposed: The categorizer function $\mathsf{Cat}_F \colon A \to (0,1]$ is the unique function with $\mathsf{Cat}_F(a) = 1$ if [[attackersSet|$a^-$]] $= \emptyset$ and $\mathsf{Cat}_F(a) = \frac{1}{1 + \sum_{b \in a^-} \mathsf{Cat}_F(b)}$ otherwise.
```

- "is the unique function with" instead of "is defined as": on AFs with cycles the equation is
  circular.

#### DB (symbol: $\theta^{\mathsf{Dbs}}$)

- [ ] Accept

```md
current: The discussion-based ranking associates to any AF $F$ a ranking $\succeq_F^\mathrm{DB}$ on $A$ such that $\forall a,b \in A: a \succeq_F^\mathrm{DB} b$ iff $\mathrm{Dis}(a) \succeq_{lex} \mathrm{Dis}(b)$, where $\mathrm{Dis}$ is the [[discussionCount]].
proposed: The discussion-based ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{Dbs}}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^{\mathsf{Dbs}}}_F b$ iff $\mathsf{D}^F(a) \succeq_{\mathrm{lex}} \mathsf{D}^F(b)$, where $\mathsf{D}^F$ is the [[discussionCount|discussion count]].
```

- $\theta^{\mathsf{Dbs}}$ and $\mathsf{D}^F$ as in the course, which uses our sign convention.

#### discussionCount (symbol: $\mathsf{D}^F$)

- [ ] Accept

```md
current: The discussion count of an argument $a$ is the tuple $\mathrm{Dis}(a) = \langle -|\mathrm{P}^F_1(a)|, |\mathrm{P}^F_2(a)|, -|\mathrm{P}^F_3(a)|, |\mathrm{P}^F_4(a)|, \ldots \rangle$, where $\mathrm{P}^F_i(a)$ is the set of all paths of length $i$ that end in $a$.
proposed: The discussion count of $a \in A$ is the sequence $\mathsf{D}^F(a) = \langle -|\mathsf{P}^F_1(a)|, |\mathsf{P}^F_2(a)|, -|\mathsf{P}^F_3(a)|, \ldots \rangle$, where $\mathsf{P}^F_i(a)$ is the set of attack paths $(b_i, \ldots, b_1, a)$ of length $i$ ending in $a$.
```

- Path inline, as in the course (length = number of attacks).

#### IGD (title: Iterated Graded Defence Ranking; symbol: $\theta^{\mathsf{IGD}}$)

- [ ] Accept

```md
current: The iterated graded defense ranking associates to any [[AF]] $F$ a ranking $\succeq_F^\mathrm{IGD}$ on $A$ such that $\forall a,b \in A: a \succeq_F^\mathrm{IGD} b$ iff, for every $m,n \geq 1$, whenever $b$ is [[skepticalAcceptance|skeptically accepted]] under [[mnComplete|$mn$-complete semantics]], so is $a$.
proposed: The iterated graded defence ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{IGD}}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^{\mathsf{IGD}}}_F b$ iff for all $1 \le m,n \le |A|-1$, whenever $b$ is [[skepticalAcceptance|skeptically accepted]] under [[mnComplete|$mn$-complete]] semantics, so is $a$.
```

#### gradedDefenseFunction (label/title: graded defence function)

- [ ] Accept

```md
current: For an [[AF]] $F=(A,R)$, a set $X \subseteq A$, and integers $m,n \geq 1$, the graded defense function is defined by $d_n^m(X) = \{x \in A \mid |\{y \in A \mid (y,x) \in R \text{ and } |\{z \in X \mid (z,y) \in R\}| < n\}| < m\}$.
proposed: For $E \subseteq A$ and integers $m,n \geq 1$, the graded defence function is $d_n^m(E) = \{a \in A \mid |\{b \in a^- \mid |b^- \cap E| < n\}| < m\}$.
```

#### gradedNeutralityFunction

- [ ] Accept

```md
current: For an [[AF]] $F=(A,R)$, a set $X \subseteq A$, and an integer $m \geq 1$, the graded neutrality function is defined by $n_m(X) = \{x \in A \mid |\{y \in X \mid (y,x) \in R\}| < m\}$. A set $X$ is $m$-conflict-free iff $X \subseteq n_m(X)$.
proposed: For $E \subseteq A$ and an integer $m \geq 1$, the graded neutrality function is $n_m(E) = \{a \in A \mid |a^- \cap E| < m\}$. A set $E$ is $m$-conflict-free iff $E \subseteq n_m(E)$.
```

#### SAF (reference: BDKM16; symbol: $\theta^{\mathsf{SAF}}$)

- [ ] Accept

```md
current: The social argumentation ranking associates to any AF $F$ a ranking $\succeq_F^\mathrm{SA}$ on $A$ such that $\forall a,b \in A: a \succeq_F^\mathrm{SA} b$ iff $M_S(a) \geq M_S(b)$, where $M_S$ is a [[socialModel]] based on the [[simpleProductSemantics]] $S$.
proposed: The social argumentation ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{SAF}}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^{\mathsf{SAF}}}_F b$ iff $M(a) \geq M(b)$, where $M$ is the [[socialModel|social model]] of $F$ under the [[simpleProductSemantics|simple product semantics]].
```

- Below `##`: "Social models were introduced for vote-annotated frameworks [@LM11]; the ranking applies
  them to plain AFs, where every argument gets the same base score [@BDKM16]."

#### saSemantics

- [ ] Accept

```md
current: A social argumentation semantics is defined by the tuple $\langle L, \tau, \curlywedge, \curlyvee, \neg \rangle$, where $L$ is a totally ordered set of labels, $\tau$ is an attenuation factor, $\curlywedge$ is a T-norm, $\curlyvee$ is a T-CoNorm and $\neg$ is a negation operator.
proposed: A social argumentation semantics is a tuple $\langle L, \tau, \curlywedge, \curlyvee, \neg \rangle$, where $L$ is a totally ordered set with top $\top$ and bottom $\bot$, $\tau$ gives each argument a base score in $L$, $\curlyvee \colon L \times L \to L$ aggregates the values of the attackers, $\curlywedge \colon L \times L \to L$ combines the base score with the negated aggregate, and $\neg \colon L \to L$ is a negation.
```

#### socialModel

- [ ] Accept

```md
current: A social model of an AF $F$ is a mapping $M_S : A \mapsto L$ with $M_S(a) = \tau(a) \curlywedge \neg \{ M_S(b) \mid b \in a^- \}$, where $\langle L, \tau, \curlywedge, \curlyvee, \neg \rangle$ is a [[saSemantics]].
proposed: A social model of $F$ is a mapping $M_S \colon A \to L$ with $M_S(a) = \tau(a) \curlywedge \neg \big(\curlyvee_{b \in a^-} M_S(b)\big)$ for all $a \in A$, where $S = \langle L, \tau, \curlywedge, \curlyvee, \neg \rangle$ is an [[saSemantics|SA-semantics]] and the empty aggregate is $\bot$.
```

- Fixes the missing $\curlyvee$-aggregation (LM11 Def. 7).

#### simpleProductSemantics

- [ ] Accept

```md
current: The simple product semantics is defined by the tuple $SP_\epsilon = \langle [0,1], \tau_\epsilon, \curlywedge, \curlyvee, \neg \rangle$, where $\tau_\epsilon = \frac{1}{1 + \epsilon}$ and $\epsilon > 0$ ensure the uniqueness, $x \curlywedge y$ is the [[productTNorm]] and $x \curlyvee y$ is the [[probabilisticSumTCoNorm]].
proposed: The simple product semantics is the [[saSemantics|SA-semantics]] $SP_\epsilon = \langle [0,1], \tau_\epsilon, \curlywedge, \curlyvee, \neg \rangle$ with $\epsilon > 0$, base score $\tau_\epsilon = \frac{1}{1+\epsilon}$, the [[productTNorm|product t-norm]] $\curlywedge$, the [[probabilisticSumTCoNorm|probabilistic sum t-conorm]] $\curlyvee$, and $\neg x = 1 - x$.
```

- Drops the overstated uniqueness claim.

#### probabilisticSumTCoNorm / productTNorm (labels lowercase)

- [ ] Accept both

```md
proposed: The probabilistic sum t-conorm is the operation $x \curlyvee y = x + y - x \cdot y$ on $[0,1]$.
proposed: The product t-norm is the operation $x \curlywedge y = x \cdot y$ on $[0,1]$.
```

#### SB (symbol: $\theta^{\mathsf{SB}}$)

- [ ] Accept

```md
current: The strategy-based ranking associates to any AF $F$ a ranking $\succeq_F^\mathrm{SB}$ on $A$ such that $\forall a,b \in A: a \succeq_F^\mathrm{SB} b$ iff $\mathrm{s}(a) \geq \mathrm{s}(b)$ where $\mathrm{s}(a)$ is the strength of $a$ based on a [[strategyGame|two-person zero-sum game]].
proposed: The strategy-based ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{SB}}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^{\mathsf{SB}}}_F b$ iff $\mathsf{s}_F(a) \geq \mathsf{s}_F(b)$, where $\mathsf{s}_F(a)$ is the value of the [[strategyGame|strategic game]] for $a$.
```

#### strategyGame

- [ ] Accept (unverified: MT08 missing)

```md
current: For an [[AF]] $F=(A,R)$ and an argument $a \in A$, the associated two-person zero-sum game lets the proponent choose a set containing $a$ and the opponent choose any set. The payoff reflects whether the proponent's set is [[CF|conflict-free]] and the attacks between the chosen sets; the value under optimal play is the strength $\mathrm{s}(a)$.
proposed: For $a \in A$, the associated two-person zero-sum game lets the proponent choose a set containing $a$ and the opponent choose any set. The payoff reflects whether the proponent's set is [[CF|conflict-free]] and the attacks between the two sets; the value under optimal play is the strength $\mathsf{s}_F(a)$.
```

#### TU (symbol: $\theta^{\mathsf{Tu}}$)

- [ ] Accept

```md
current: The tuples ranking compares arguments based on the lengths of the attack and defense branches in the argumentation framework. The result is a partial ranking, i.e., two arguments can be incomparable. Note that this ranking is only implemented for acyclic AFs.
proposed: The tuples ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{Tu}}}_F$ on $A$ that compares arguments by the lengths of the defence (even) and attack (odd) branches ending in them; two arguments can be incomparable.
```

- Below `##`: "AgonProject computes this ranking for acyclic AFs only."

#### rankingCO (symbol: $\theta^{\mathsf{Cnt}}$)

- [ ] Accept

```md
current: The counting ranking compares arguments by counting the number of their attackers and defenders in form of a dialogue game where proponents are defenders and opponents are attackers.
proposed: The counting ranking associates to any [[AF]] $F$ and damping factor $\alpha \in (0,1)$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{Cnt}}}_F$ on $A$ that counts the attack paths ending in each argument, weighted by $\alpha^\ell$ for length $\ell$: defenders (even $\ell$) count positively, attackers (odd $\ell$) negatively.
```

#### rankingPR (symbol: $\theta^{\mathsf{Propa}}$)

- [ ] Accept (reference stays D17)

```md
current: The propagation ranking assigns each argument an initial value and propagates it along attack paths to obtain a propagation vector, which is turned into a ranking $\succeq_F^\mathrm{Prop}$ on $A$ using one of three variants (Propa$_\epsilon$, Propa$_{1+\epsilon}$, Propa$_{1\to\epsilon}$). Note that this ranking is only implemented for acyclic AFs.
proposed: The propagation ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{Propa}}}_F$ on $A$ by giving each argument an initial value, propagating it along attack paths, and comparing the resulting vectors, in one of three variants $\mathsf{Propa}_\epsilon$, $\mathsf{Propa}_{1+\epsilon}$, $\mathsf{Propa}_{1\to\epsilon}$.
```

- Below `##`: "AgonProject computes this ranking for acyclic AFs only."

#### rankingSER (title: Serialisability-Based Ranking; symbol: $\theta^{\mathsf{ser}}$)

- [ ] Accept

```md
current: The Serialisability-based ranking associates to any AF $F$ a ranking $\succeq_F^\mathrm{Ser}$ on $A$ such that $\forall a,b \in A: a \succeq_F^\mathrm{Ser} b$ iff $\mathrm{ser}_F(a) \leq \mathrm{ser}_F(b)$, where $\mathrm{ser}_F(a)$ is the [[serialisationIndex]].
proposed: The serialisability-based ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{ser}}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^{\mathsf{ser}}}_F b$ iff $\mathsf{ser}_F(a) \leq \mathsf{ser}_F(b)$, where $\mathsf{ser}_F$ is the [[serialisationIndex|serialisation index]].
```

### 3.4 New entries

#### range

- [ ] Accept

```md
---
label: $E^\oplus$
title: Range
short: Range
reference: DD18
---

For $E \subseteq A$, the range of $E$ is $E^\oplus = E \cup {}$[[attackedSet|$E^+$]].
```

#### labelling

- [ ] Accept

```md
---
label: labelling
title: Labelling
reference: CG09
---

A labelling is a total function $L \colon A \to \{\mathsf{in}, \mathsf{out}, \mathsf{undec}\}$; an argument $a$ is accepted, rejected, or undecided in $L$ if $L(a)$ is $\mathsf{in}$, $\mathsf{out}$, or $\mathsf{undec}$, respectively.
```

#### rankingPROB (symbol: $\theta^p_{\sigma,\circ}$)

- [ ] Accept

```md
---
label: probabilistic
title: Probabilistic Ranking
reference: TCR18
---

The probabilistic ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^p_{\sigma,\circ}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^p_{\sigma,\circ}}_F b$ iff $P_{\sigma,\circ}(a) \geq P_{\sigma,\circ}(b)$ in the [[PAF]] $F[p]$ that gives every argument [[argumentProbability|probability]] $p \in (0,1)$ and every attack probability $1$. Here $P_{\sigma,\circ}$ is the [[credulousAcceptanceProbability|credulous]] ($\circ = c$) or [[skepticalAcceptanceProbability|skeptical]] ($\circ = s$) acceptance probability under a [[semantics]] $\sigma$.
```
