# Glossary review: abstract dialectical frameworks

Audit of the 25 entries in `src/modules/dialectical-argumentation/glossary/en/`, same pass as the
[AF review](glossary-review.md), against the style in
[glossary.md](../contributing/glossary.md#style-and-notation). Orientation: course text
`m_64402_fa`, chapter 3.6 (sources in 3.0). Backend: Tweety `org-tweetyproject-arg-adf`
(`reasoner/simple`).

## Status

- [x] Phase 0: pre-pass
- [x] Phase 1: review (inline, 25 entries)
- [x] Phase 2: cross-cutting decisions D1–D6
- [ ] Phase 1b: check `adfSAD` against KVV22 once the PDF is in `literature/`
- [x] Phase 3: triage (rounds 1–2)
- [x] Phase 4: apply, checks, `formal-reviewer` pass
- [x] Phase 5: round 3, triage of the `formal-reviewer` findings (§3); `consensus` rejected, rest applied

## 1. Cross-cutting decisions

Decided: D3 = yes, $\mathsf{t}, \mathsf{f}, \mathsf{u}$; D2, D5, D6 follow the style guide; D1, D4 no change.

- [x] **D1. Sources.** BW10, BESWW13, BESWW18, SW15, KVV21 and BT25 are in `literature/` and
      checked (page numbers in §3). KVV22 (strong admissibility) is missing, so `adfSAD` is
      unverified. The course chapter covers ADF, two- and three-valued models, $\leq_i$,
      consensus, completions, $\Gamma_D$, grounded, admissible, complete and preferred; the other
      semantics are not in the course.
- [x] **D2. Semantics symbols.** All AF semantics carry `symbol`, no ADF semantics does.
      Recommended: the AF symbols where the ADF semantics generalises one ($\mathsf{cf}$,
      $\mathsf{na}$, $\mathsf{ad}$, $\mathsf{co}$, $\mathsf{gr}$, $\mathsf{pr}$, $\mathsf{st}$,
      $\mathsf{sst}$, $\mathsf{sad}$, $\mathsf{is}$), and for the rest the app keys:
      $\mathsf{s2v}$, $\mathsf{mod}_2$, $\mathsf{mod}_3$ (sources: BESWW13 $val_2$, KVV21
      $\mathit{semi\text{-}mod}$; the course names none). Notation entries also get `symbol`
      ($C_a$, $par(a)$, $\leq_i$, $[v]_2$, $\sqcap$, $\Gamma_D$, $D_{\downarrow v}$, $D^v$).
      Proposals in §3 assume this.
- [x] **D3. Truth values.** Entries write $\mathbf{t}, \mathbf{f}, \mathbf{u}$; the course writes
      $\textsf{t}, \textsf{f}, \textsf{u}$, and the style guide uses `\mathsf` for labels
      ($\mathsf{in}$, $\mathsf{out}$, $\mathsf{undec}$). Recommended: $\mathsf{t}, \mathsf{f},
      \mathsf{u}$; proposals in §3 assume it (most "text unchanged" entries change only this).
- [x] **D4. Framework notation.** Entries write $D = (A, L, C)$ with $C_a$ and interpretations
      $v$; the course writes $D = (A, C)$ with formulas $\phi_a$ (links implicit) and $\upsilon$;
      BW10/BESWW13 write $(S, L, C)$ and $v$. Recommended: keep $(A, L, C)$, $C_a$ and $v$:
      `parents` and `adfBipolar` need $L$, and changing $C_a$ touches every entry. No proposals
      depend on it.
- [x] **D5. Earliest source for the basic notions.** `completions`, `consensus` and `operator` cite
      the BESWW18 handbook chapter, but BESWW13 (pp. 804–805) defines all three in the stated
      form. Recommended: reference BESWW13 (proposed in §3). `adfGR` stays BESWW13: BW10 defines
      the operator over pairs of sets and calls the result "well-founded model"; BESWW13 gives
      this form and the name.
- [x] **D6. Lean pass.** Two existing texts restate their formula (`operator` second sentence,
      `subReduct` last sentence); proposed to drop. Existing `## Properties` (`twoValuedInterpretation`)
      and `## Link types` (`adfBipolar`) sections are correct (checked) and left as they are.

## 2. New entries

None.

## Rounds 1–2 (applied)

### R1 Framework and interpretations

##### ADF

- [ ] Accept

```md
current: An abstract dialectical framework $D = (A, L, C)$ consists of a set of arguments $A$, a set of links $L \subseteq A \times A$, and for each argument $a \in A$ an [[acceptanceCondition]] $C_a$ over its [[parents]] $par(a)$.
proposed: An abstract dialectical framework $D = (A, L, C)$ consists of a set of arguments $A$, a set of links $L \subseteq A \times A$, and for each argument $a \in A$ an [[acceptanceCondition]] $C_a$ over its [[parents]] $par(a)$.
```

- [source checked] BW10 Def. 1, p. 103 (statements $S$, acceptance conditions as total functions); BESWW13 p. 804 for the formula representation. Course writes $D = (A, C)$ with $\phi_a$ (D4). No change.

##### acceptanceCondition (symbol: $C_a$)

- [ ] Accept

```md
current: An acceptance condition $C_a$ for argument $a$ in an ADF is modelled as a propositional formula over the [[parents]] of $a$ that essentially determines when $a$ is accepted given the set of accepted parents.
proposed: The acceptance condition $C_a$ of an argument $a \in A$ in an [[ADF]] $D = (A, L, C)$ is modelled as a propositional formula over [[parents|$par(a)$]] that determines when $a$ is accepted, given the set of accepted parents.
```

- Round 2: back to the old text (your comment): adds $a \in A$ and $D = (A, L, C)$, links $par(a)$, drops "essentially". No function definition.

- [source checked] BW10 Def. 1, p. 103: $C_s \colon 2^{par(s)} \to \{in, out\}$; BESWW13 Def. 1, p. 804: values $\{t, f\}$, "convenient to represent acceptance conditions as propositional formulas".
- [style] "modelled as a propositional formula … that essentially determines" is vague and makes the formula the definition; the sources define a function and use formulas as representation.

##### parents (symbol: $par(a)$)

- [ ] Accept

```md
current: The parents of an argument $a$ in an ADF are the arguments that have a link to $a$, i.e., $par(a) = \{ b \in A \mid (b,a) \in L \}$.
proposed: The parents of an argument $a$ in an [[ADF]] $D = (A, L, C)$ are $par(a) = \{ b \in A \mid (b, a) \in L \}$.
```

- [source checked] BW10 p. 103: "the nodes with a direct link to $s$".
- [style] Links [[ADF]], names $L$; drops "i.e.".

##### adfBipolar

- [ ] Accept

```md
current: An [[ADF]] is bipolar iff each of its links is supporting or attacking. A link $(b, a) \in L$ is supporting iff for all $R \subseteq$ [[parents|$par(a)$]], [[acceptanceCondition|$C_a$]]$(R) = \mathbf{t}$ implies $C_a(R \cup \{b\}) = \mathbf{t}$, and attacking iff for all $R \subseteq par(a)$, $C_a(R \cup \{b\}) = \mathbf{t}$ implies $C_a(R) = \mathbf{t}$.
proposed: An [[ADF]] is bipolar iff each of its links is supporting or attacking. A link $(b, a) \in L$ is supporting iff for all $R \subseteq$ [[parents|$par(a)$]], [[acceptanceCondition|$C_a$]]$(R) = \mathsf{t}$ implies $C_a(R \cup \{b\}) = \mathsf{t}$, and attacking iff for all $R \subseteq par(a)$, $C_a(R \cup \{b\}) = \mathsf{t}$ implies $C_a(R) = \mathsf{t}$.
```

- [source checked] BW10 Def. 5, p. 105 (stated there as "for no $R$ …", equivalent). Text unchanged apart from D3.
- [source checked] Remarks: redundant links BW10 p. 105; link types given SW15 p. 38; bipolarity coNP-hard and link types intractable BW10 Prop. 14, p. 109.

##### threeValuedInterpretation

- [ ] Accept

```md
current: A three-valued interpretation $v: A \mapsto \{\mathbf{t}, \mathbf{f}, \mathbf{u}\}$ assigns to each argument $a$ in an [[ADF]] either the value $\mathbf{t}$ (accepted), $\mathbf{f}$ (rejected), or $\mathbf{u}$ (undecided).
proposed: A three-valued interpretation of an [[ADF]] is a function $v \colon A \to \{\mathsf{t}, \mathsf{f}, \mathsf{u}\}$ that assigns each argument the value $\mathsf{t}$ (accepted), $\mathsf{f}$ (rejected) or $\mathsf{u}$ (undecided).
```

- [source checked] BESWW13 p. 804 (there: $\mathsf{u}$ "unknown"; course: "unknown oder undecided").
- [style] `\mapsto` → `\colon … \to` (style guide).

##### twoValuedInterpretation

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is two-valued iff $v(a) \in \{\mathbf{t}, \mathbf{f}\}$ for all $a \in A$.
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is two-valued iff $v(a) \in \{\mathsf{t}, \mathsf{f}\}$ for all $a \in A$.
```

- [source checked] BESWW13 p. 805, also the Properties section. Text unchanged apart from D3.

##### informationOrdering (symbol: $\leq_i$)

- [ ] Accept

```md
current: The information ordering $\leq_i$ on truth values is given by $\mathbf{u} <_i \mathbf{t}$ and $\mathbf{u} <_i \mathbf{f}$. For two [[threeValuedInterpretation|three-valued interpretations]] $v_1, v_2$ we have $v_1 \leq_i v_2$ iff $v_1(a) \leq_i v_2(a)$ for all $a \in A$.
proposed: The information ordering $\leq_i$ on truth values is given by $\mathsf{u} <_i \mathsf{t}$ and $\mathsf{u} <_i \mathsf{f}$. For two [[threeValuedInterpretation|three-valued interpretations]] $v_1, v_2$ we have $v_1 \leq_i v_2$ iff $v_1(a) \leq_i v_2(a)$ for all $a \in A$.
```

- [source checked] BESWW13 p. 804; course Def. "Informationsordnung". Text unchanged apart from D3; adds `symbol`.

##### completions (title: Two-Valued Completions; reference: BESWW13; symbol: $[v]_2$)

- [ ] Accept

```md
current: For some [[threeValuedInterpretation]] $v$ of an [[ADF]] the two-valued completions are defined as $[v]_2 = \{ v' \mid v \leq_i v'$ and $(v')^{-1}(\textbf{u})=\emptyset\}$, where $\leq_i$ is the [[informationOrdering]].
proposed: The two-valued completions of a [[threeValuedInterpretation]] $v$ of an [[ADF]] are $[v]_2 = \{ w \mid v \leq_i w \text{ and } w^{-1}(\mathsf{u}) = \emptyset \}$, where $\leq_i$ is the [[informationOrdering]].
```

- [source] $[v]_2$ is defined in BESWW13 p. 805, earlier than BESWW18 (D5); course: "Vervollständigungen".
- [style] Title capitalisation as "Two-Valued Model"; `\textbf{u}` → D3; set-builder in one math span.

##### consensus (reference: BESWW13; symbol: $\sqcap$)

- [ ] Accept

```md
current: The consensus operator $\sqcap$ combines two [[threeValuedInterpretation|three-valued interpretations]] $v_1$ and $v_2$ into a new interpretation $v_3 = v_1 \sqcap v_2$ such that for each $a \in A$: $v_3(a) = \mathbf{t}$ iff $v_1(a) = v_2(a) = \mathbf{t}$, $v_3(a) = \mathbf{f}$ iff $v_1(a) = v_2(a) = \mathbf{f}$, and $v_3(a) = \mathbf{u}$ otherwise.
proposed: The consensus $v_1 \sqcap v_2$ of two [[threeValuedInterpretation|three-valued interpretations]] $v_1, v_2$ maps each $a \in A$ to $\mathsf{t}$ if $v_1(a) = v_2(a) = \mathsf{t}$, to $\mathsf{f}$ if $v_1(a) = v_2(a) = \mathsf{f}$, and to $\mathsf{u}$ otherwise.
```

- [source] BESWW13 pp. 804–805 defines the consensus meet, earlier than BESWW18 (D5).
- [style] Drops the auxiliary $v_3$.

##### operator (reference: BESWW13; symbol: $\Gamma_D$)

- [ ] Accept

```md
current: The characteristic operator $\Gamma_D$ of an [[ADF]] $D$ is defined as $\Gamma_D(v)(a) = \sqcap \{ v'(C_a) \mid v' \in [v]_2 \}$ for all $a \in A$. It maps $v$ to the [[consensus|consensus]] over its [[completions|two-valued completions]].
proposed: The characteristic operator $\Gamma_D$ of an [[ADF]] $D$ maps a [[threeValuedInterpretation]] $v$ to $\Gamma_D(v)$ with $\Gamma_D(v)(a) = \bigsqcap \{ w(C_a) \mid w \in [v]_2 \}$ for all $a \in A$, where $[v]_2$ are the [[completions]] of $v$ and $\bigsqcap$ is the [[consensus]].
```

- [source] This form is BESWW13 p. 805, which notes it is equivalent to BW10's operator (Def. 4, p. 104, over pairs of sets); BESWW18 Cor. 3.6, p. 248 repeats it (D5).
- [lean] Second sentence restated the formula; dropped. Links move to $[v]_2$ and $\bigsqcap$.

##### reducedAdf (symbol: $D_{\downarrow v}$)

- [ ] Accept

```md
current: The reduced ADF $D_{\downarrow v}$ of an [[ADF]] $D$ under $v$ is defined as $D_{\downarrow v} = (v^{-1}(\mathbf{t}), L', C')$, where in each $C'_a$ the occurrences of arguments $b$ with $v(b) = \mathbf{f}$ are substituted by $\bot$.
proposed: The reduced ADF of an [[ADF]] $D = (A, L, C)$ under a [[twoValuedInterpretation|two-valued interpretation]] $v$ is $D_{\downarrow v} = (A', L \cap (A' \times A'), C')$ with $A' = v^{-1}(\mathsf{t})$, where each $C'_a$ is $C_a$ with every $b$ such that $v(b) = \mathsf{f}$ substituted by $\bot$.
```

- Round 2: "substituted" instead of "replaced" (your comment).

- [source checked] BESWW13 Def. 6, p. 806 (as $D^v$, for a two-valued model $v$); BESWW18 Def. 3.10, p. 253 ($\bot$); notation $D_{\downarrow v}$ from BT25 Def. 7, p. 4367. Keeping $D_{\downarrow v}$ avoids a clash with the sub-reduct $D^v$ (KVV21 writes $D^v$ for both).
- [fix] $L'$ was undefined; $v$ must be two-valued.

##### subReduct (symbol: $D^v$)

- [ ] Accept

```md
current: The sub-reduct $D^v$ of an [[ADF]] $D$ under $v$ is defined as $D^v = (A^v, L^v, C^v)$ with $A^v = v^{-1}(\mathbf{t}) \cup v^{-1}(\mathbf{u})$, $L^v = L \cap (A^v \times A^v)$, and where in each $C^v_a$ the occurrences of arguments $b$ with $v(b) = \mathbf{f}$ are substituted by $\bot$. Unlike the [[reducedAdf|reduced ADF]], it keeps the undecided arguments.
proposed: The sub-reduct of an [[ADF]] $D = (A, L, C)$ under a [[threeValuedInterpretation|three-valued interpretation]] $v$ is $D^v = (A^v, L^v, C^v)$ with $A^v = v^{-1}(\mathsf{t}) \cup v^{-1}(\mathsf{u})$ and $L^v = L \cap (A^v \times A^v)$, where each $C^v_a$ is $C_a$ with every $b$ such that $v(b) = \mathsf{f}$ substituted by $\bot$.
```

- Round 2: "substituted" instead of "replaced" (your comment).

- [source checked] KVV21 Def. 10, p. 426.
- [lean] Drops "Unlike the reduced ADF, it keeps the undecided arguments" (restates $A^v$). Wording parallel to `reducedAdf`.

### R2 Semantics

##### adfCF (symbol: $\mathsf{cf}$)

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a conflict-free model iff, for every argument $a \in A$, $v(a) = \mathbf{t}$ implies that $C_a$ is satisfied by at least one [[completions|two-valued completion]] of $v$, and $v(a) = \mathbf{f}$ implies that $C_a$ is falsified by at least one two-valued completion of $v$.
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a conflict-free model iff for every $a \in A$, $v(a) = \mathsf{t}$ implies $w(C_a) = \mathsf{t}$ for some [[completions|completion]] $w \in [v]_2$, and $v(a) = \mathsf{f}$ implies $w(C_a) = \mathsf{f}$ for some $w \in [v]_2$.
```

- [source checked] SW15 p. 36 (partial evaluation satisfiable / refutable) and p. 39 (Table 1); SW15 p. 35 calls this conflict-freeness its own contribution, so it is the earliest source. Matches Tweety `SimpleConflictFreeAdfReasoner`.
- [style] Same content, stated via $w(C_a)$ like the other entries.

##### adfNA (symbol: $\mathsf{na}$)

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a naive model iff $v$ is [[adfCF|conflict-free]] and there is no conflict-free model $v'$ such that $v <_i v'$ in the [[informationOrdering]].
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a naive model iff $v$ is [[adfCF|conflict-free]] and there is no conflict-free model $v'$ such that $v <_i v'$ in the [[informationOrdering]].
```

- [source checked] SW15 p. 39 (Table 1: $\leq_i$-maximal conflict-free). Text unchanged; adds `symbol`.

##### adfADM (symbol: $\mathsf{ad}$)

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is an admissible model iff $v \leq_i \Gamma_D(v)$ in the [[informationOrdering]], where $\Gamma_D(v)$ is the [[operator|characteristic operator]] for ADFs.
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] $D$ is an admissible model iff $v \leq_i \Gamma_D(v)$, where $\leq_i$ is the [[informationOrdering]] and $\Gamma_D$ the [[operator|characteristic operator]].
```

- [source checked] BESWW13 Def. 2, p. 805; course Def. "zulässiges Modell".
- [style] Names $D$; drops "for ADFs".

##### adfCO (symbol: $\mathsf{co}$)

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a complete model iff $v = \Gamma_D(v)$, where $\Gamma_D(v)$ is the [[operator|characteristic operator]] for ADFs.
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] $D$ is a complete model iff $v = \Gamma_D(v)$, where $\Gamma_D$ is the [[operator|characteristic operator]].
```

- [source checked] BESWW13 Def. 3, p. 805; course.
- [style] As `adfADM`.

##### adfGR (symbol: $\mathsf{gr}$)

- [ ] Accept

```md
current: The grounded model of an [[ADF]] is the least fixed point of the [[operator|characteristic operator]] $\Gamma_D$.
proposed: The grounded model of an [[ADF]] $D$ is the [[informationOrdering|$\leq_i$]]-least fixed point of the [[operator|characteristic operator]] $\Gamma_D$.
```

- [source checked] BESWW13 p. 805 ("least fixpoint", Thm. 1: "$\leq_i$-least"); BW10 introduced it as "well-founded model" (D5). Course defines it by iterating $\Gamma_D$ from $v_{\mathsf{u}}$.
- [style] Says which order "least" refers to.

##### adfPR (symbol: $\mathsf{pr}$)

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a preferred model iff $v$ is [[adfCO|complete]] and there is no complete model $v'$ such that $v <_i v'$ in the [[informationOrdering]].
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a preferred model iff $v$ is [[adfCO|complete]] and there is no complete model $v'$ such that $v <_i v'$ in the [[informationOrdering]].
```

- [source checked] BESWW13 Def. 4, p. 805 defines preferred as $\leq_i$-maximal admissible; the entry follows the course (Def. "präferiertes Modell") and BT25 Def. 6; equivalent by BESWW13 Thm. 1. Text unchanged; adds `symbol`.

##### adfST (symbol: $\mathsf{st}$)

- [ ] Accept

```md
current: A [[twoValuedInterpretation]] $v$ of an [[ADF]] is a stable model iff $v$ is a [[adfMOD2|two-valued model]] of $D$ and $v^{-1}(\mathbf{t}) = v_{gr}^{-1}(\mathbf{t})$, where $v_{gr}$ is the [[adfGR|grounded model]] of the [[reducedAdf|reduced ADF]] $D_{\downarrow v}$.
proposed: A [[twoValuedInterpretation]] $v$ of an [[ADF]] $D$ is a stable model iff $v$ is a [[adfMOD2|two-valued model]] of $D$ and $v^{-1}(\mathsf{t}) = w^{-1}(\mathsf{t})$, where $w$ is the [[adfGR|grounded model]] of the [[reducedAdf|reduced ADF]] $D_{\downarrow v}$.
```

- [source checked] BESWW13 Def. 6, p. 806. Not in the course.
- [style] Names $D$ (used later in the sentence); $v_{gr}$ → $w$, as in `adfSST`.

##### adfMOD2 (symbol: $\mathsf{mod}_2$)

- [ ] Accept

```md
current: A [[twoValuedInterpretation]] $v: A \mapsto \{\mathbf{t}, \mathbf{f}\}$ of an [[ADF]] is a (two-valued) model iff $v(a) = v(C_a)$ for all $a \in A$.
proposed: A [[twoValuedInterpretation]] $v$ of an [[ADF]] is a two-valued model iff $v(a) = v(C_a)$ for all $a \in A$.
```

- [source checked] BW10 Def. 2, p. 104 (as sets $M \subseteq S$, earliest); this form BESWW13 p. 804 and the course.
- [style] Drops the repeated type $v \colon A \to \ldots$ (`\mapsto` against the style guide); "(two-valued)" in brackets dropped.

##### adfMOD3 (symbol: $\mathsf{mod}_3$)

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a three-valued model iff $v(a) \neq \mathbf{u}$ implies $v(a) = v(C_a)$ for all $a \in A$, where $v(C_a)$ is evaluated in Kleene's strong three-valued logic: negation switches $\mathbf{t}$ and $\mathbf{f}$ and leaves $\mathbf{u}$ unchanged, a conjunction is $\mathbf{t}$ if both conjuncts are $\mathbf{t}$, $\mathbf{f}$ if some conjunct is $\mathbf{f}$, and $\mathbf{u}$ otherwise; disjunction is dual.
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a three-valued model iff $v(a) \neq \mathsf{u}$ implies $v(a) = v(C_a)$ for all $a \in A$, where $v(C_a)$ is evaluated in Kleene's strong three-valued logic: negation switches $\mathsf{t}$ and $\mathsf{f}$ and leaves $\mathsf{u}$ unchanged, a conjunction is $\mathsf{t}$ if both conjuncts are $\mathsf{t}$, $\mathsf{f}$ if some conjunct is $\mathsf{f}$, and $\mathsf{u}$ otherwise; disjunction is dual.
```

- [source checked] BESWW13 p. 804, word for word; course Def. "dreiwertiges Modell". Text unchanged apart from D3.

##### adfS2V (symbol: $\mathsf{s2v}$)

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a semi-two-valued model iff $v$ is [[adfCO|complete]] and $v^{-1}(\mathbf{u})$ is $\subseteq$-minimal among all $w^{-1}(\mathbf{u})$ such that $w$ is a complete model.
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a semi-two-valued model iff $v$ is [[adfCO|complete]] and $v^{-1}(\mathsf{u})$ is $\subseteq$-minimal among all $w^{-1}(\mathsf{u})$ such that $w$ is a complete model.
```

- [source checked] KVV21 Def. 9, p. 426. Matches Tweety. Text unchanged apart from D3.

##### adfSST (symbol: $\mathsf{sst}$)

- [ ] Accept

```md
current: A [[adfS2V|semi-two-valued model]] $v$ of an [[ADF]] is a semi-stable model iff $v^{-1}(\mathbf{t}) = w^{-1}(\mathbf{t})$, where $w$ is the [[adfGR|grounded model]] of the [[subReduct|sub-reduct]] $D^v$.
proposed: A [[adfS2V|semi-two-valued model]] $v$ of an [[ADF]] is a semi-stable model iff $v^{-1}(\mathsf{t}) = w^{-1}(\mathsf{t})$, where $w$ is the [[adfGR|grounded model]] of the [[subReduct|sub-reduct]] $D^v$.
```

- [source checked] KVV21 Def. 10, p. 426. Matches Tweety. Text unchanged apart from D3.

##### adfSAD (symbol: $\mathsf{sad}$)

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is strongly admissible iff every $a$ with $v(a) \neq \mathbf{u}$ is strongly justified in $v$ w.r.t. $\{a\}$. An argument $a$ is strongly justified in $v$ w.r.t. a set $E \subseteq A$ iff there is a set $P \subseteq par(a) \setminus E$ of [[parents]] such that $C_a$, with every $p \in P$ replaced by its truth value $v(p)$, is a tautology if $v(a) = \mathbf{t}$ or unsatisfiable if $v(a) = \mathbf{f}$, and every $p \in P$ is strongly justified in $v$ w.r.t. $E \cup \{p\}$.
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is strongly admissible iff every $a$ with $v(a) \neq \mathsf{u}$ is strongly justified in $v$ w.r.t. $\{a\}$. An argument $a$ is strongly justified in $v$ w.r.t. a set $E \subseteq A$ iff there is a set $P \subseteq par(a) \setminus E$ of [[parents]] such that $C_a$, with every $p \in P$ replaced by its truth value $v(p)$, is a tautology if $v(a) = \mathsf{t}$ or unsatisfiable if $v(a) = \mathsf{f}$, and every $p \in P$ is strongly justified in $v$ w.r.t. $E \cup \{p\}$.
```

- [unverified] KVV22 PDF missing; not in the course. Tweety computes it differently (least fixpoint of $\Gamma_D$ capped by $v$), which should be equivalent if KVV22 proves it. Text unchanged apart from D3.

##### adfIS (symbol: $\mathsf{is}$)

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is an initial model iff $v$ is [[adfADM|admissible]] with $v \neq v_\mathbf{u}$ and there is no admissible model $v' \neq v_\mathbf{u}$ with $v' <_i v$ in the [[informationOrdering]], where $v_\mathbf{u}$ maps every argument to $\mathbf{u}$.
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is an initial model iff $v$ is [[adfADM|admissible]] with $v \neq v_\mathsf{u}$ and there is no admissible model $v' \neq v_\mathsf{u}$ with $v' <_i v$ in the [[informationOrdering]], where $v_\mathsf{u}$ maps every argument to $\mathsf{u}$.
```

- [source checked] BT25 Def. 9, p. 4368. Matches Tweety. Text unchanged apart from D3.

## 3. Entries

Round 3: `formal-reviewer` findings; `current` is the applied text.

### 3.1 Reviewer findings

#### operator

- [ ] Accept

```md
current: The characteristic operator $\Gamma_D$ of an [[ADF]] $D$ maps a [[threeValuedInterpretation]] $v$ to $\Gamma_D(v)$ with $\Gamma_D(v)(a) = \bigsqcap \{ w(C_a) \mid w \in [v]_2 \}$ for all $a \in A$, where $[v]_2$ are the [[completions]] of $v$ and $\bigsqcap$ is the [[consensus]].
proposed: The characteristic operator $\Gamma_D$ of an [[ADF]] $D$ maps a [[threeValuedInterpretation]] $v$ to $\Gamma_D(v)$ with $\Gamma_D(v)(a) = \sqcap \{ w(C_a) \mid w \in [v]_2 \}$ for all $a \in A$, where $[v]_2$ are the [[completions]] of $v$ and $\sqcap$ is the [[consensus]].
```

- [error] `\bigsqcap` is not a KaTeX command (checked with the repo's KaTeX): both math spans render as red error text. `\sqcap` renders.

#### consensus

- [ ] Accept

```md
current: The consensus $v_1 \sqcap v_2$ of two [[threeValuedInterpretation|three-valued interpretations]] $v_1, v_2$ maps each $a \in A$ to $\mathsf{t}$ if $v_1(a) = v_2(a) = \mathsf{t}$, to $\mathsf{f}$ if $v_1(a) = v_2(a) = \mathsf{f}$, and to $\mathsf{u}$ otherwise.
proposed: The consensus $\sqcap$ maps two truth values to $\mathsf{t}$ if both are $\mathsf{t}$, to $\mathsf{f}$ if both are $\mathsf{f}$, and to $\mathsf{u}$ otherwise. For two [[threeValuedInterpretation|three-valued interpretations]] $v_1, v_2$, $(v_1 \sqcap v_2)(a) = v_1(a) \sqcap v_2(a)$ for all $a \in A$.
```

- [error] `operator` applies $\sqcap$ to a set of truth values, but this entry defines it only for two interpretations. BESWW13 p. 804 defines it on truth values first, p. 805 lifts it argument-wise. Your call whether this is worth the second sentence.

#### adfSST

- [ ] Accept

```md
current: A [[adfS2V|semi-two-valued model]] $v$ of an [[ADF]] is a semi-stable model iff $v^{-1}(\mathsf{t}) = w^{-1}(\mathsf{t})$, where $w$ is the [[adfGR|grounded model]] of the [[subReduct|sub-reduct]] $D^v$.
proposed: A [[adfS2V|semi-two-valued model]] $v$ of an [[ADF]] $D$ is a semi-stable model iff $v^{-1}(\mathsf{t}) = w^{-1}(\mathsf{t})$, where $w$ is the [[adfGR|grounded model]] of the [[subReduct|sub-reduct]] $D^v$.
```

- [nit] $D^v$ is used without naming $D$; same fix as in `adfST`.

#### reducedAdf

- [ ] Accept

```md
current: The reduced ADF of an [[ADF]] $D = (A, L, C)$ under a [[twoValuedInterpretation|two-valued interpretation]] $v$ is $D_{\downarrow v} = (A', L \cap (A' \times A'), C')$ with $A' = v^{-1}(\mathsf{t})$, where each $C'_a$ is $C_a$ with every $b$ such that $v(b) = \mathsf{f}$ substituted by $\bot$.
proposed: The reduced ADF of an [[ADF]] $D = (A, L, C)$ under a [[twoValuedInterpretation|two-valued interpretation]] $v$ is $D_{\downarrow v} = (A', L \cap (A' \times A'), C')$ with $A' = v^{-1}(\mathsf{t})$, where each $C'_a$ is [[acceptanceCondition|$C_a$]] with every $b$ such that $v(b) = \mathsf{f}$ substituted by $\bot$.
```

- [nit] Links $C_a$ at its first use.

#### subReduct

- [ ] Accept

```md
current: The sub-reduct of an [[ADF]] $D = (A, L, C)$ under a [[threeValuedInterpretation|three-valued interpretation]] $v$ is $D^v = (A^v, L^v, C^v)$ with $A^v = v^{-1}(\mathsf{t}) \cup v^{-1}(\mathsf{u})$ and $L^v = L \cap (A^v \times A^v)$, where each $C^v_a$ is $C_a$ with every $b$ such that $v(b) = \mathsf{f}$ substituted by $\bot$.
proposed: The sub-reduct of an [[ADF]] $D = (A, L, C)$ under a [[threeValuedInterpretation|three-valued interpretation]] $v$ is $D^v = (A^v, L^v, C^v)$ with $A^v = v^{-1}(\mathsf{t}) \cup v^{-1}(\mathsf{u})$ and $L^v = L \cap (A^v \times A^v)$, where each $C^v_a$ is [[acceptanceCondition|$C_a$]] with every $b$ such that $v(b) = \mathsf{f}$ substituted by $\bot$.
```

- [nit] Links $C_a$ at its first use.

#### adfSAD

- [ ] Accept

```md
current: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is strongly admissible iff every $a$ with $v(a) \neq \mathsf{u}$ is strongly justified in $v$ w.r.t. $\{a\}$. An argument $a$ is strongly justified in $v$ w.r.t. a set $E \subseteq A$ iff there is a set $P \subseteq par(a) \setminus E$ of [[parents]] such that $C_a$, with every $p \in P$ replaced by its truth value $v(p)$, is a tautology if $v(a) = \mathsf{t}$ or unsatisfiable if $v(a) = \mathsf{f}$, and every $p \in P$ is strongly justified in $v$ w.r.t. $E \cup \{p\}$.
proposed: A [[threeValuedInterpretation]] $v$ of an [[ADF]] is strongly admissible iff every $a$ with $v(a) \neq \mathsf{u}$ is strongly justified in $v$ w.r.t. $\{a\}$. An argument $a$ is strongly justified in $v$ w.r.t. a set $E \subseteq A$ iff there is a set $P \subseteq par(a) \setminus E$ of [[parents]] such that [[acceptanceCondition|$C_a$]], with every $p \in P$ replaced by its truth value $v(p)$, is a tautology if $v(a) = \mathsf{t}$ or unsatisfiable if $v(a) = \mathsf{f}$, and every $p \in P$ is strongly justified in $v$ w.r.t. $E \cup \{p\}$.
```

- [nit] Links $C_a$ at its first use. [unverified] KVV22 PDF still missing.
