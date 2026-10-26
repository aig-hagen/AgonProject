# Glossary review: incomplete argumentation

Audit of the 4 entries in `src/modules/incomplete-argumentation/glossary/en/`, same pass as the
[AF review](glossary-review.md), against the style in
[glossary.md](../contributing/glossary.md#style-and-notation).

## Status

- [x] Phase 0: pre-pass (`IAF` has no links; `possibleAcceptance`, `necessaryAcceptance` long)
- [x] Phase 1: review (inline, 4 entries)
- [x] Phase 1b: checked against `BJNNR21` §2.2 (p. 6) and BNRS18 (Def. 22, 25, p. 14)
- [x] Phase 3: triage via the review page; `completion` accepted, the rest revised:
      `IAF` keeps its definition, only "Further reading" is clarified (plus BNRS18);
      possible/necessary are split into acceptance entries (BJNNR21, literature only) and new
      `possibleExtension`/`necessaryExtension` entries (no `reference`; Remarks name the BNRS18
      variant). The evaluation's type hint links the extension entry in Enumerate mode.
- [x] Phase 4: applied; type-check, unit tests, lint, `docs:check` pass
- [x] Phase 5: `formal-reviewer` pass (no errors), nits triaged in rounds 2–3 of the review page:
      acceptance entries scoped to $a \in A$ (BJNNR21 p. 6); "partial argumentation systems";
      $X|_{A^*}$ in `completion`; extension entries use $E$ and link [[extension]].
      `necessaryExtension`: $E \subseteq A$ (then $E \cap A^* = E$), `reference: BNRS18`, Remarks
      on BNRS18's wider $S \subseteq A \cup A^?$. `possibleExtension`: $E \subseteq A \cup A^?$, no
      `reference`, no Remarks. §3 shows round 1 only; the glossary files are the source of truth.

## 1. Cross-cutting decisions

- [x] **D1. Source PDF.** `BJNNR21` and the verification paper by Baumeister, Neugebauer, Rothe
      and Schadrack (AIJ 264, 2018; key `BNRS18` here) are now in `literature/`.
- [x] **D2. Possible/necessary extensions.** BJNNR21 defines only the acceptance problems (PCA,
      NCA, PSA, NSA; §2.2, p. 6), not possible/necessary extensions. Those come from BNRS18
      (s-IncPV, s-IncNV, p. 14), which asks whether $S \cap A^*$ is an extension of each completion,
      with $S \subseteq A \cup A^?$. The app (Tweety `IncompleteReasoner.getPossibleModels` /
      `getNecessaryModels`) instead checks $S$ itself: the union, resp. intersection, of the
      completions' extension sets. Example: $A = \{a\}$, $A^? = \{b\}$, no attacks. BNRS18:
      $\{a,b\}$ is a necessary $\mathsf{pr}$-extension; app and current entry: none is.
      **Decided: keep the app's definition** (option a). It keeps the possible side consistent:
      the possibly credulously accepted arguments are exactly the union of possible extensions,
      which fails under BNRS18 for uncertain arguments ($A = \{a\}$, $A^? = \{b\}$, $a \to b$:
      $\{a,b\}$ is BNRS18-possible, $b$ is never accepted). Applied as a split (see Phase 3).
      BNRS18 added
      to `publications.ts`. Necessary credulous acceptance does not imply a
      necessary extension under either definition (solver-checked: $b \to a$, $x \to b$,
      $y \to b$, uncertain $c \to x$); candidate for a later `## Example` (TODO #33).
- [ ] **D3. Tuple notation.** Keep $I = (A, A^?, R, R^?)$ with round brackets like $F = (A, R)$,
      even if the paper uses $\langle \dots \rangle$. Recommended: keep.
- [ ] **D4. `symbol`.** None of the four entries is a semantics, so no `symbol` field. Recommended:
      none.

## 2. New entries

None. Argument-incomplete and attack-incomplete IAFs ($R^? = \emptyset$ or $A^? = \emptyset$) are
niche and can be phrased inline if ever needed.

## 3. Entries

### 3.1 Incomplete argumentation

#### IAF

- [ ] Accept

```md
current: An incomplete argumentation framework $I = (A, A^?, R, R^?)$ splits both the set of arguments and the set of attacks into two disjoint parts, the definite part ($A$ and $R$) and the uncertain part ($A^?$ and $R^?$), where both $R$ and $R^?$ are subsets of $(A \cup A^?) \times (A \cup A^?)$
proposed: An incomplete argumentation framework $I = (A, A^?, R, R^?)$ extends an [[AF]] by uncertain arguments and attacks: $A$ and $A^?$ are disjoint sets of definite and uncertain arguments, and $R, R^? \subseteq (A \cup A^?) \times (A \cup A^?)$ are disjoint sets of definite and uncertain attacks.
```

- [style] No outgoing links; missing final full stop; definite/uncertain roles only implied.
- [source checked] Current text is BJNNR21 §2.2 (p. 6) almost verbatim; disjointness of $R$ and $R^?$ is explicit in BNRS18 Def. 22, implied ("two disjoint parts") in BJNNR21.
- Below `##`, Further reading: "[@CDKLM07]: partial argumentation frameworks with uncertain attacks, a precursor of incomplete AFs." CDKLM07 (checked, §4) has uncertain attacks only, so "where incomplete frameworks first came up" overstates it.

#### completion

- [ ] Accept

```md
current: A completion of an [[IAF]] is a classical [[AF]] $F^* = (A^* , R^*)$ such that $A \subseteq A^* \subseteq A \cup A^?$ and $R|_{A^*} \subseteq R^* \subseteq (R \cup R^?)|_{A^*}$.
proposed: A completion of an [[IAF]] $I = (A, A^?, R, R^?)$ is an [[AF]] $F^* = (A^*, R^*)$ with $A \subseteq A^* \subseteq A \cup A^?$ and $R|_{A^*} \subseteq R^* \subseteq (R \cup R^?)|_{A^*}$, where $R|_{A^*} = R \cap (A^* \times A^*)$.
```

- [style] $R|_{A^*}$ is used without being defined; stray space in $(A^* , R^*)$; "classical" is redundant next to the [[AF]] link.
- [source checked] Formula matches BJNNR21 §2.2 (p. 6), which defines $R|_{A^*} = \{(a,b) \in R \mid a,b \in A^*\}$.

#### necessaryAcceptance

- [ ] Accept

```md
current: Under a [[semantics]] $\sigma$, a set $S$ is a necessary $\sigma$-extension of an [[IAF]] if $S \in \sigma(F^*)$ for every [[completion]] $F^*$. An argument is necessarily [[credulousAcceptance|credulously]] (resp. [[skepticalAcceptance|skeptically]]) accepted if it is credulously (resp. skeptically) accepted in every completion.
proposed: Given a [[semantics]] $\sigma$, a set $S$ is a necessary $\sigma$-extension of an [[IAF]] iff $S \in \sigma(F^*)$ for every [[completion]] $F^*$. An argument is necessarily [[credulousAcceptance|credulously]] (resp. [[skepticalAcceptance|skeptically]]) accepted iff it is so in every completion.
```

- [style] "if" → "iff"; "Under" → "Given" (as in `credulousAcceptance`); repeated "credulously (resp. skeptically) accepted" shortened.
- [source checked] Acceptance half matches BJNNR21 NCA/NSA (p. 6). Extension half from BNRS18 (p. 14), with a deviation; see D2.
- Below `##`, new Remarks: "[@BNRS18] defines necessary extensions for $S \subseteq A \cup A^?$ with $S \cap A^*$ in place of $S$; the app checks $S$ itself."

#### possibleAcceptance

- [ ] Accept

```md
current: Under a [[semantics]] $\sigma$, a set $S$ is a possible $\sigma$-extension of an [[IAF]] if $S \in \sigma(F^*)$ for at least one [[completion]] $F^*$. An argument is possibly [[credulousAcceptance|credulously]] (resp. [[skepticalAcceptance|skeptically]]) accepted if it is credulously (resp. skeptically) accepted in at least one completion.
proposed: Given a [[semantics]] $\sigma$, a set $S$ is a possible $\sigma$-extension of an [[IAF]] iff $S \in \sigma(F^*)$ for some [[completion]] $F^*$. An argument is possibly [[credulousAcceptance|credulously]] (resp. [[skepticalAcceptance|skeptically]]) accepted iff it is so in some completion.
```

- [style] Same changes as `necessaryAcceptance`.
- [source checked] Acceptance half matches BJNNR21 PCA/PSA (p. 6); PSA is plain skeptical acceptance (no existence condition; that is PExSA), as in Tweety.
- Below `##`, new Remarks: "[@BNRS18] defines possible extensions for $S \subseteq A \cup A^?$ with $S \cap A^*$ in place of $S$; the app checks $S$ itself."
