# Glossary review: probabilistic argumentation

Audit of the 10 entries in `src/modules/probabilistic-argumentation/glossary/en/`, same pass as the
[AF review](glossary-review.md), against the style in
[glossary.md](../contributing/glossary.md#style-and-notation). Orientation: course text
`m_64402_fa`, chapter 3.4 (sources in 3.0), the HPPRT21 survey, and what the app computes (Tweety
`SimplePafReasoner` / `MonteCarloPafReasoner`, `evaluation/tweetyProject.ts`).

## Status

- [x] Phase 0: pre-pass (`PAF`: unlinked "probabilistic" → `rankingPROB` is a false hit)
- [x] Phase 1: review (inline, 10 entries)
- [ ] Phase 1b: check against LON11 and H12 once the PDFs are in `literature/`
- [x] Phase 2: cross-cutting decisions D1–D5
- [x] Phase 3: triage
- [x] Phase 4: apply, checks, `formal-reviewer` pass (no findings)

## 1. Cross-cutting decisions

Decided: D2 = $P_{\sigma,c}$ / $P_{\sigma,s}$; the others keep the default (no change; D4: verify the bug, then TODO).

- [x] **D1. Sources.** HPPRT21 is in `literature/`; LON11 and H12 are not. Entries are checked
      against the course and HPPRT21 (survey corroborates, is not the source). Course 3.0: PAFs
      "initially presented by Li et al. [LON11]", deeper discussion in Hunter 2012/2014 and Hunter &
      Thimm 2014/2016. HPPRT21 §4.2 (p. 421): LON11 introduced argument and attack probabilities and
      extension probabilities for all semantics. Recommended: keep `reference: LON11` on `PAF`,
      `subframework`, `subframeworkProbability`; verify once the PDF is there.
- [x] **D2. Acceptance-probability notation.** Both acceptance entries write $P_\sigma(a)$ for
      different quantities. The course writes $\text{Prob}^{\sigma,\text{l}}_Q(a)$ /
      $\text{Prob}^{\sigma,\text{s}}_Q(a)$ (German "l" = leichtgläubig), HPPRT21 $P^{PAF}_{\circ,\sigma}$
      with $\circ \in \{s, c\}$, and the shipped `rankingPROB` entry already uses $P_{\sigma,\circ}$
      with $\circ = c$ / $s$. Recommended: $P_{\sigma,c}(a)$ and $P_{\sigma,s}(a)$, as `symbol` and in
      the formula; proposals in §3 assume it.
- [x] **D3. "Subframework" vs. course "Instantiierung".** The course calls the possible AFs
      instantiations, $\mathsf{Inst}(Q)$, and requires components with probability $1$ to be
      present; HPPRT21 says subgraphs. The glossary's definition admits all subframeworks; the
      extra ones get probability $0$, so the distribution is the same. Recommended: keep
      "subframework", no change.
- [x] **D4. Skeptical probability when $\sigma(F') = \emptyset$ (app bug, not entry text).** Tweety's
      `AbstractExtensionReasoner.query` returns true for skeptical acceptance whenever $F'$ has no
      extension, also when $a \notin A'$. Example: $A = \{a, b\}$, $R = \{(b, b)\}$, $P(a) = 0.5$, all
      else $1$. Both subframeworks have no stable extension (solver-checked), so the app gives
      $P_{\mathsf{st},s}(a) = 1$, while the definition with $\bigcap \emptyset = A'$ (as in
      `skepticalAcceptance`, DD18) gives $0.5$. Only semantics that can have no extension are
      affected (stable). Recommended: TODO for an upstream Tweety fix (count $F'$ only if
      $a \in A'$); entry unchanged.
- [x] **D5. References of `constellations` and the acceptance entries.** They cite H12. HPPRT21
      (p. 402) attributes the constellations/epistemic distinction to Hunter 2013 (IJAR), and
      (p. 421) the extension probabilities to LON11. H12 may still fit (full-subgraph
      distributions, p. 422). Recommended: keep H12 until the PDFs can be checked.

## 2. New entries

None.

## 3. Entries

### 3.1 Probabilistic argumentation

#### PAF

- [ ] Accept

<!-- prettier-ignore -->
```md
current: A probabilistic argumentation framework is a tuple $(A, R, P)$ such that $(A, R)$ is an [[AF]] and $P : A \cup R \to (0,1]$ assigns each [[argumentProbability|argument]] and [[attackProbability|attack]] the probability that it is present. We consider semantics under  the [[constellations]].
proposed: A probabilistic argumentation framework is a tuple $(A, R, P)$ such that $(A, R)$ is an [[AF]] and $P : A \cup R \to (0,1]$ assigns each [[argumentProbability|argument]] and [[attackProbability|attack]] the probability that it is present. Semantics follow the [[constellations|constellation approach]].
```

- [style] "We consider …" plus a double space; link label made explicit.
- [source checked] Course Def. 1 (3.4.1): $Q = (A, R, P)$, $P : A \cup R \to (0, 1]$. Matches.
- [unverified] LON11 PDF missing.

#### argumentProbability

- [ ] Accept

```md
current: Each argument $a$ in a [[PAF]] is assigned a probability $P(a) \in (0,1]$ representing the degree of belief in the existence or validity of $a$.
proposed: Each argument $a \in A$ of a [[PAF]] $(A, R, P)$ has a probability $P(a) \in (0,1]$ of being present.
```

- Round 2: $a \in A$ (your comment).
- [content] "or validity" has no source: course and HPPRT21 (p. 422) read $P(a)$ as the probability that $a$ is present. Argument probabilities are independent (course).

#### attackProbability

- [ ] Accept

```md
current: Each attack $(a, b)$ in a [[PAF]] is assigned a probability $P(a,b) \in (0,1]$ representing the degree of belief in the attack being present.
proposed: Each attack $(a, b) \in R$ of a [[PAF]] $(A, R, P)$ has a probability $P(a,b) \in (0,1]$ of being present, given that $a$ and $b$ are present.
```

- Round 2: $(a, b) \in R$ (your comment).
- [content] The course defines $P((a, b))$ as a conditional probability given that $a$ and $b$ exist; the subframework probability (and Tweety `sample()`) relies on this. The current text drops the condition.

#### constellations

- [ ] Accept

```md
current: The constellation approach models uncertainty about which arguments and attacks are present. The probabilities of a [[PAF]] induce a [[subframeworkProbability|probability distribution]] over all its [[subframework|subframeworks]], and an argument is evaluated by how likely it is to be accepted in them.
proposed: The constellation approach models uncertainty about which arguments and attacks are present. The probabilities of a [[PAF]] induce a [[subframeworkProbability|probability distribution]] over all its [[subframework|subframeworks]], and an argument is evaluated by how likely it is to be accepted in them.
```

- No change. Matches the course (3.4 intro and footnote) and HPPRT21 §4 (p. 419).
- [unverified] Reference H12, see D5.

#### credulousAcceptanceProbability (symbol: $P_{\sigma,c}(a)$)

- [ ] Accept

```md
current: The probability that $a$ is [[credulousAcceptance|credulously accepted]] under $\sigma$ is the sum of the [[subframeworkProbability|probabilities]] of all subframeworks $F'$ in which $a$ is credulously accepted: $P_\sigma(a) = \sum_{F' : a \in \bigcup \sigma(F')} P(F')$.
proposed: Given a [[semantics]] $\sigma$, the probability that an argument $a \in A$ of a [[PAF]] is [[credulousAcceptance|credulously accepted]] is the sum of the [[subframeworkProbability|probabilities]] of all [[subframework|subframeworks]] $F'$ in which $a$ is credulously accepted: $P_{\sigma,c}(a) = \sum_{F' : a \in \bigcup \sigma(F')} P(F')$.
```

- Round 2: $a \in A$ (your comment).
- [style] $a$ and $\sigma$ were not introduced; "Given a semantics" opener; symbol per D2.
- [source checked] Course Def. 4 (3.4.1), $\text{Prob}^{\sigma,\text{l}}_Q(a)$; HPPRT21 p. 423. Formula matches.
- [unverified] Reference H12, see D5.

#### skepticalAcceptanceProbability (symbol: $P_{\sigma,s}(a)$)

- [ ] Accept

```md
current: The probability that $a$ is [[skepticalAcceptance|skeptically accepted]] under $\sigma$ is the sum of the [[subframeworkProbability|probabilities]] of all subframeworks $F'$ in which $a$ is skeptically accepted: $P_\sigma(a) = \sum_{F' : a \in \bigcap \sigma(F')} P(F')$.
proposed: Given a [[semantics]] $\sigma$, the probability that an argument $a \in A$ of a [[PAF]] is [[skepticalAcceptance|skeptically accepted]] is the sum of the [[subframeworkProbability|probabilities]] of all [[subframework|subframeworks]] $F'$ in which $a$ is skeptically accepted: $P_{\sigma,s}(a) = \sum_{F' : a \in \bigcap \sigma(F')} P(F')$.
```

- Round 2: $a \in A$ (your comment).

- Same changes as `credulousAcceptanceProbability`.
- [source checked] Course Def. 4 (3.4.1), $\text{Prob}^{\sigma,\text{s}}_Q(a)$. Formula matches.
- App deviates when $\sigma(F') = \emptyset$, see D4.

#### subframework

- [ ] Accept

```md
current: A subframework of a [[PAF]] $(A, R, P)$ is an AF $F' = (A', R')$ with $A' \subseteq A$ and $R' \subseteq R \cap (A' \times A')$, i.e., an attack can only be present if both of its arguments are.
proposed: A subframework of a [[PAF]] $(A, R, P)$ is an [[AF]] $F' = (A', R')$ with $A' \subseteq A$ and $R' \subseteq R \cap (A' \times A')$.
```

- [style] Link "AF"; the "i.e." clause restates the formula (lean rule).
- [source checked] HPPRT21 Def. 4.2 (p. 419), subgraph. Course: see D3.
- [unverified] LON11 PDF missing.

#### subframeworkProbability

- [ ] Accept

```md
current: Assuming independence, the probability of a [[subframework]] $F' = (A', R')$ is $P(F') = \prod_{a \in A'} P(a) \prod_{a \in A \setminus A'} (1 - P(a)) \prod_{r \in R'} P(r) \prod_{r \in R_{A'} \setminus R'} (1 - P(r))$, where $R_{A'} = R \cap (A' \times A')$.
proposed: Assuming independence, the probability of a [[subframework]] $F' = (A', R')$ is $P(F') = \prod_{a \in A'} P(a) \prod_{a \in A \setminus A'} (1 - P(a)) \prod_{r \in R'} P(r) \prod_{r \in R_{A'} \setminus R'} (1 - P(r))$, where $R_{A'} = R \cap (A' \times A')$.
```

- No change. [source checked] Course Def. 2 (3.4.1), $\text{Prob}_Q(F)$; matches Tweety `getProbability`.
- [unverified] LON11 PDF missing.

#### exactInference

- [ ] Accept

```md
current: The acceptance probabilities are computed by enumerating all [[subframework|subframeworks]] of the [[PAF]]. Exact, but exponential in the number of arguments and attacks.
proposed: The acceptance probabilities are computed by enumerating all [[subframework|subframeworks]] of the [[PAF]]. Exact, but exponential in the number of arguments and attacks.
```

- No change. Matches `SimplePafReasoner` (enumerates all subgraphs) and the course's naive algorithm (3.4.2).

#### approximateInference

- [ ] Accept

```md
current: The acceptance probabilities are approximated via a Monte Carlo algorithm that samples 1,000 [[subframework|subframeworks]] of the [[PAF]] and counts how often the argument is accepted.
proposed: The acceptance probabilities are approximated via a Monte Carlo algorithm that samples 1,000 [[subframework|subframeworks]] of the [[PAF]] and counts how often the argument is accepted.
```

- No change. Matches `MonteCarloPafReasoner` and `MONTE_CARLO_TRIALS = 1000`.
- [unverified] LON11 proposes Monte Carlo approximation, as far as known; could become `reference: LON11` once checked.
