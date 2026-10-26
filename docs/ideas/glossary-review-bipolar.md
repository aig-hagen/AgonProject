# Glossary review: bipolar argumentation

Audit of the 6 entries in `src/modules/bipolar-argumentation/glossary/en/`, same pass as the
[AF review](glossary-review.md), against the style in
[glossary.md](../contributing/glossary.md#style-and-notation). Orientation: course text
`m_64402_fa`, chapter 3.1 (sources in 3.0).

## Status

- [x] Phase 0: pre-pass (`BAF` long; `coalitionSemantics` no inbound links)
- [x] Phase 1: review (inline, 6 entries)
- [x] Phase 2: cross-cutting decisions D1–D4
- [ ] Phase 1b: check against CL10, BGTV10, NR10 once the PDFs are in `literature/`
- [x] Phase 3: triage (rounds 1–2, all accepted and applied)
- [x] Phase 4: apply, checks, `formal-reviewer` pass
- [x] Phase 5: round 3, triage of the `formal-reviewer` findings (§3); applied: symbols for
  `coalition`, `coalitionGraph`, hyphen style, `R^B_{me}` wording. No "weakly", no new Remarks
  sentences, CL10 stays.

## 1. Cross-cutting decisions

- [x] **D1. Sources.** CL05 (extracted from the ECSQARU 2005 proceedings) and CCL21 are in
      `literature/`; CL10, BGTV10 and NR10 are not. Where those are cited, entries are checked
      against the course text and the CCL21 survey only (survey corroborates, is not the source).
      CCL21 §4.2 (p. 57) confirms NR10 first introduced necessary support; the course's
      Nouioua & Risch 2011 (SUM) is the follow-up with extended attacks, so `reference: NR10`
      stays. Decided: go ahead; verify the `[unverified]` items if the PDFs turn up.
- [x] **D2. Notation.** Decided: keep $B = (A, R, S)$ for the support relation (the course's $U$
      is German, "Unterstützung"); coalitions are named $C$, sets of coalitions $\mathcal{C}$, to
      avoid the clash with $S$.
- [x] **D3. What ded/nec evaluation computes.** The app (Tweety `SimpleDeductiveReasoner` /
      `SimpleNecessityReasoner`, `complexAttacks.ts`) and the course evaluate $(A, R^B_{me})$ with
      mediated attacks (direct attacks included); necessary = the same with all supports
      reversed. BGTV10 also adds supported attacks; the course footnote states this deviation.
      Decided: (a), one extra sentence in `deductiveSupport` / `necessarySupport`, no new
      entries.
- [x] **D4. Semantics symbols.** Decided: course notation, with English "nec" instead of the
      German "not": $\mathsf{b\text{-}coal\text{-}}\sigma$ as `symbol` of `coalitionSemantics`;
      $\mathsf{b\text{-}ded\text{-}}\sigma$ and $\mathsf{b\text{-}nec\text{-}}\sigma$ named inline
      in the support entries (they keep no `symbol`, as they define the reading, not the
      semantics).

## 2. New entries

None (D3 = a).

## 3. Entries

Round 3: `current` is the applied round-2 text, `proposed` the `formal-reviewer` findings.
Rounds 1–2 were accepted and applied.

### 3.1 Bipolar argumentation

#### BAF

- [ ] Accept

```md
current: A bipolar argumentation framework $B = (A, R, S)$ consists of an [[AF]] $(A, R)$ and a support relation $S \subseteq A \times A$. Support can be read in different ways, e.g. as [[deductiveSupport|deductive]] or [[necessarySupport|necessary]] support.
proposed: A bipolar argumentation framework $B = (A, R, S)$ consists of an [[AF]] $(A, R)$ and a support relation $S \subseteq A \times A$. Support can be read in different ways, e.g. as [[deductiveSupport|deductive]] or [[necessarySupport|necessary]] support.
```

- [source checked] CL05 Def. 1, p. 381. No findings; nothing to decide.

#### coalition

- [ ] Accept

```md
current: A set $C \subseteq A$ is a coalition of a [[BAF]] $B = (A, R, S)$ iff $C$ is [[CF|conflict-free]] in $(A, R)$, connected in $(A, S)$, and $\subseteq$-maximal with both properties.
proposed: A set $C \subseteq A$ is a coalition of a [[BAF]] $B = (A, R, S)$ iff $C$ is [[CF|conflict-free]] in $(A, R)$, weakly connected in $(A, S)$, and $\subseteq$-maximal with both properties.
```

- [nit] "connected" in a directed graph can be read as strongly connected. The course says "(einfach) zusammenhängend" (undirected path), Tweety uses weak components. "weakly" says that in one word.
- [option] `coalition` could carry `symbol: \mathsf{Coal}(B)`, since it defines the set first used in `coalitionGraph`. Not in the proposal; say so in a comment if you want it.
- [unverified] Earliest source: the course (3.0) credits coalitions to Cayrol & Lagasquie-Schiex 2007 (CMNA, "Coalitions of arguments in bipolar argumentation frameworks"), not in `publications.ts`. If it already defines coalitions and the coalition graph, the earliest-source rule wants it instead of CL10. PDF needed.

#### coalitionGraph (symbol: $F^{\mathsf{Coal}}_B$)

- [ ] Accept

```md
current: The coalition graph of a [[BAF]] $B = (A, R, S)$ is the [[AF]] $F^{\mathsf{Coal}}_B = (\mathsf{Coal}(B), R^{\mathsf{Coal}}_B)$, where $\mathsf{Coal}(B)$ is the set of [[coalition|coalitions]] of $B$ and $(C_1, C_2) \in R^{\mathsf{Coal}}_B$ iff $(a, b) \in R$ for some $a \in C_1$, $b \in C_2$.
proposed: The coalition graph of a [[BAF]] $B = (A, R, S)$ is the [[AF]] $F^{\mathsf{Coal}}_B = (\mathsf{Coal}(B), R^{\mathsf{Coal}}_B)$, where $\mathsf{Coal}(B)$ is the set of [[coalition|coalitions]] of $B$ and $(C_1, C_2) \in R^{\mathsf{Coal}}_B$ iff $(a, b) \in R$ for some $a \in C_1$, $b \in C_2$.
```

- [nit] Text unchanged; adds `symbol: F^{\mathsf{Coal}}_B` for the notation the entry introduces, like `coalitionSemantics` got one.
- [unverified] Same CL07 question as `coalition`.

#### coalitionSemantics (symbol: $\mathsf{b}\text{-}\mathsf{coal}\text{-}\sigma$)

- [ ] Accept

```md
current: Given a [[semantics]] $\sigma$, a set $E \subseteq A$ is a coalition $\sigma$-extension of a [[BAF]] $B = (A, R, S)$ iff $E = \bigcup \mathcal{C}$ for some $\sigma$-extension $\mathcal{C}$ of the [[coalitionGraph|coalition graph]] $F^{\mathsf{Coal}}_B$.
proposed: Given a [[semantics]] $\sigma$, a set $E \subseteq A$ is a coalition $\sigma$-extension of a [[BAF]] $B = (A, R, S)$ iff $E = \bigcup \mathcal{C}$ for some $\sigma$-extension $\mathcal{C}$ of the [[coalitionGraph|coalition graph]] $F^{\mathsf{Coal}}_B$.
```

- [nit] Text unchanged; symbol hyphen style per the style guide (`\text{-}` outside `\mathsf`, as in $\mathsf{q}\text{-}\sigma$): `\mathsf{b\text{-}coal\text{-}}\sigma` → `\mathsf{b}\text{-}\mathsf{coal}\text{-}\sigma`. Renders nearly the same.
- [unverified] Same CL07 question as `coalition`.

#### deductiveSupport

- [ ] Accept

```md
current: Under the deductive support interpretation of a [[BAF]] $B = (A, R, S)$, an argument $a$ supports an argument $b$ if the acceptance of $a$ implies the acceptance of $b$.
proposed: Under the deductive support interpretation of a [[BAF]] $B = (A, R, S)$, an argument $a$ supports an argument $b$ if the acceptance of $a$ implies the acceptance of $b$.
remarks: Given a [[semantics]] $\sigma$, the deductive $\sigma$-extensions ($\mathsf{b}\text{-}\mathsf{ded}\text{-}\sigma$) of $B$ are the $\sigma$-extensions of the [[AF]] $(A, R^B_{me})$, where $(a, b) \in R^B_{me}$ iff $a$ attacks $b$ or attacks some argument that $b$ reaches by a chain of supports. [@BGTV10] additionally use supported attacks; here, as in the app, only these mediated attacks are used.
```

- Definition unchanged; only the Remarks change.
- [nit] "iff $a$ attacks $b$ or an argument that …" can be parsed as "or an argument … [attacks $b$]"; "or attacks some argument" fixes it. Content matches the course, CCL21 Def. 38, Tweety and `complexAttacks.ts`.
- [nit] Symbol hyphen style, as in `coalitionSemantics`.
- [rules] Last sentence: you dropped this remark in round 2. The reviewer flags it because the entry cites BGTV10 but gives the course's simplified evaluation (glossary rules: a deliberate deviation from the cited source is stated). Your call; to keep it out, comment "drop last sentence".
- [unverified] BGTV10 PDF missing; Def. 7 as quoted in CCL21 Def. 38 (p. 68).

#### necessarySupport

- [ ] Accept

```md
current: Under the necessary support interpretation of a [[BAF]] $B = (A, R, S)$, an argument $a$ supports an argument $b$ if the acceptance of $a$ is a necessary condition for the acceptance of $b$.
proposed: Under the necessary support interpretation of a [[BAF]] $B = (A, R, S)$, an argument $a$ supports an argument $b$ if the acceptance of $a$ is a necessary condition for the acceptance of $b$.
remarks: Given a [[semantics]] $\sigma$, the necessary $\sigma$-extensions ($\mathsf{b}\text{-}\mathsf{nec}\text{-}\sigma$) of $B$ are the [[deductiveSupport|deductive]] $\sigma$-extensions of $(A, R, S^{-1})$, i.e. with all supports reversed. Unlike [@NR10], this omits attacks from $a$ to $b$ where an argument that $a$ necessarily depends on attacks $b$.
```

- Definition unchanged; only the Remarks change.
- [nit] Symbol hyphen style.
- [rules] Last sentence: NR's extended attacks (CCL21 Def. 32 = NR11 Def. 2, p. 59) have two kinds. (a) $a$ attacks $c$ and $(c, b) \in S$: exactly what the reversal gives. (b) $c$ attacks $b$ and $(c, a) \in S$: dropped by the reversal. So $\mathsf{b}\text{-}\mathsf{nec}$ is the course variant. Same call as for `deductiveSupport`.
- [unverified] CCL21 cites NR11 for Def. 32; whether NR10 already has kind (b) needs the NR10 PDF.
