# Glossary review: collective attacks (SetAF)

Audit of the 10 entries in `src/modules/collective-attacks-argumentation/glossary/en/`, same pass
as the [AF review](glossary-review.md), against the style in
[glossary.md](../contributing/glossary.md#style-and-notation). Orientation: course text
`m_64402_fa`, chapter 3.5 (sources in 3.0). The course covers the framework, conflict-freeness,
defence, admissible, complete and stable; the weak and strong semantics are not in the course.

## Status

- [x] Phase 0: pre-pass
- [x] Phase 1: review (inline, 10 entries)
- [x] Phase 2: cross-cutting decisions D1–D5
- [x] Phase 3: triage
- [x] Phase 4: apply, checks, `formal-reviewer` pass (no findings)

## 1. Cross-cutting decisions

Decided: D4 = (a), cite the JAIR 2024 paper once the PDF is in `literature/`; `setafSAD` keeps BBR25 (Tweety's check is equivalent to the proposal without "closed"); the others keep the default.

- [x] **D1. Sources.** BKU24, BBR25 and BCDFP21 are in `literature/`; NP06 is not. `SetAF` and
      `collectiveAttack` are checked against the course and the BCDFP21 survey (corroborates, is
      not the source). Recommended: go ahead; verify NP06 if the PDF turns up.
- [x] **D2. Notation.** Entries write the framework as $S = (A, R)$ and attacks as $(T, h)$ (as
      BKU24 for attacks); the course writes $M = (A, R)$ (German "Mengenangriffe") and $(S, a)$;
      BKU24 and BBR25 write $SF$ / $F$. Recommended: keep $S = (A, R)$ and $(T, h)$; proposals
      assume it.
- [x] **D3. Semantics symbols.** The AF counterparts (`WAD`, `WCO`, `WGR`, `WPR`, `SAD`) carry
      `symbol: \mathsf{wad}` etc.; the SetAF entries write "($E \in \mathsf{wad}(S)$)" in the text.
      Recommended: move them to `symbol` (style guide: notation through `symbol`) and reword the
      definitions like the AF entries; BKU24's $\mathsf{adm}_w$, $\mathsf{com}_w$ are not used.
- [x] **D4. Reduct source.** BKU24 (Def. 22) takes the SetAF reduct from Dvořák, König, Ulbricht,
      Woltran 2024 (JAIR 79), not in `publications.ts`. Recommended: keep `reference: BKU24` for
      now; switch only if you want that paper added (PDF needed).
- [x] **D5. SetAF conflict-freeness and defence.** `setafWAD`, `setafWeakDefence` and `setafSAD`
      use them, but only the AF entries exist (`CF`, `defends`), whose definitions differ (single
      attackers). Recommended: leave them unlinked, no new entries; the course defines both in
      one line each.

## 2. New entries

None.

## 3. Entries

### 3.1 Framework

#### SetAF

- [ ] Accept

```md
current: An argumentation framework with collective attacks $S$ is a tuple $(A, R)$, where $A$ is a finite set of arguments and $R \subseteq (2^A \setminus \{\emptyset\}) \times A$ is the attack relation.
proposed: An argumentation framework with collective attacks (SetAF) $S = (A, R)$ consists of a finite set of arguments $A$ and an attack relation $R \subseteq (2^A \setminus \{\emptyset\}) \times A$.
```

- [style] "is a tuple $(A, R)$" with the name $S$ outside → "$S = (A, R)$ consists of", as in the accepted `BAF` entry.
- [unverified] NP06 PDF missing. Corroborated by BCDFP21 Def. 3.1 (p. 138), which quotes NP06 ("Nielsen and Parsons 2007b", same paper) with $(2^{Ar} \setminus \{\emptyset\}) \times Ar$, and by the course (3.5, Def. SetAF). BKU24 Def. 3 (p. 180) allows $T = \emptyset$; the entry follows NP06 and the course.

#### collectiveAttack

- [ ] Accept

```md
current: A collective attack $(T, h) \in R$ in a [[SetAF]] means that the set of arguments $T$ jointly attacks argument $h$. Hence, the attack is only successful if all members of $T$ are accepted.
proposed: A collective attack $(T, h) \in R$ of a [[SetAF]] $S = (A, R)$ is a joint attack of all arguments in $T$ on $h$; it succeeds only if every argument in $T$ is accepted.
```

- [style] "in a SetAF" → "of a SetAF $S = (A, R)$"; two sentences merged. Reading as in the course (3.5, after the SetAF definition: the attack fails if not all of $T$ are accepted).
- [unverified] NP06 PDF missing.

#### setafRange

- [ ] Accept

```md
current: For a set of arguments $E$, $E^+_R = \{h \in A \mid \exists (T, h) \in R : T \subseteq E\}$ and $E^\oplus_R = E \cup E^+_R$.
proposed: Given a [[SetAF]] $S = (A, R)$ and $E \subseteq A$, the range of $E$ is $E^\oplus_R = E \cup E^+_R$, where $E^+_R = \{h \in A \mid (T, h) \in R \text{ for some } T \subseteq E\}$.
```

- [source checked] BKU24 §2.2 (p. 180): $E^+_R = \{h \in A \mid \exists (T, h) \in R : T \subseteq E\}$, $E^\oplus_R = E \cup E^+_R$. Matches.
- [style] Names the framework and the term ("the range of $E$"), as in the AF `range` entry; $\exists$ spelled out.

#### setafReduct (reference: DKUW24)

- [ ] Accept

```md
current: Given a [[SetAF]] $S = (A, R)$ and $E \subseteq A$, the $E$-reduct of $S$ is the SetAF $S^E = (A', R')$, with $A' = A \setminus$ [[setafRange|$E^\oplus_R$]] and $R' = \{(T \setminus E, h) \mid (T, h) \in R,\ T \cap E^+_R = \emptyset,\ T \not\subseteq E,\ h \in A'\}$.
proposed: For $E \subseteq A$, the $E$-reduct of a [[SetAF]] $S$ is the SetAF $S^E = (A', R')$ with $A' = A \setminus$ [[setafRange|$E^\oplus_R$]] and $R' = \{(T \setminus E, h) \mid (T, h) \in R,\ T \cap E^+_R = \emptyset,\ T \not\subseteq E,\ h \in A'\}$.
```

- Round 2: mirrors AF `reduct` ("For $E \subseteq A$, the $E$-reduct of …"); the SetAF link stays since the SetAF reduct is a SetAF.
- [source checked] DKUW24 Def. 4.2 (p. 82), identical; BKU24 Def. 22 (p. 182) repeats it. Text unchanged.
- D4 = (a): `reference` BKU24 → DKUW24 (earliest source; added to `publications.ts`).

### 3.2 Semantics

#### setafWAD (symbol: $\mathsf{wad}$)

- [ ] Accept

```md
current: A set of arguments $E \subseteq A$ is weakly admissible in $S$ ($E \in \mathsf{wad}(S)$) iff (1) $E \in \mathsf{cf}(S)$, and (2) for each $(T, h) \in R$ with $h \in E$ and $T \cap$ [[setafRange|$E^+_R$]] $= \emptyset$ there is no $E' \in \mathsf{wad}($[[setafReduct|$S^E$]]) such that $T \cap A' \subseteq E'$.
proposed: A set $E \subseteq A$ is weakly admissible iff $E$ is conflict-free and $T \cap A' \not\subseteq E'$ for every $E' \in \mathsf{wad}($[[setafReduct|$S^E$]]$)$ and every $(T, h) \in R$ with $h \in E$ and $T \cap$ [[setafRange|$E^+_R$]] $= \emptyset$, where $S^E = (A', R')$.
```

- Round 2: mirrors AF `WAD`: "$E$ is conflict-free and <formula> for every …". SetAF needs $T \cap A' \not\subseteq E'$ (set inclusion) where AF has $b \notin \bigcup \mathsf{wad}(F^E)$, so it can't use $\bigcup$. "conflict-free" stays unlinked (D5).
- [source checked] BKU24 Def. 24 (p. 183). Content matches.
- [style] D3: notation into `symbol`; $\mathsf{cf}(S)$ (no entry, not defined) → "conflict-free"; (1)/(2) dropped; $A'$ was undefined in the entry, now said.
- App: Tweety `SimpleWeaklyAdmissibleSetAfReasoner` uses $T \setminus E$, equal to $T \cap A'$ when $T \cap E^+_R = \emptyset$; it drops self-attackers first, which cannot be in any weakly admissible set. Same result.

#### setafWeakDefence

- [ ] Accept

```md
current: A set of arguments $E$ weakly defends $X \subseteq A$ if for each $(T, h) \in R$ with $h \in X$, one of the following two conditions holds: $E$ attacks $T$, or simultaneously (1) there is no $E' \in \mathsf{wad}($[[setafReduct|$S^E$]]) with $T \subseteq E \cup E'$, and (2) there is some $X'$ such that $X \subseteq X' \in$ [[setafWAD|$\mathsf{wad}(S)$]].
proposed: A set $E \subseteq A$ weakly defends $E' \subseteq A$ iff for every $(T, h) \in R$ with $h \in E'$, either $E$ attacks some argument in $T$, or $T \not\subseteq E \cup E^*$ for every $E^* \in \mathsf{wad}($[[setafReduct|$S^E$]]$)$, and $E' \subseteq E''$ for some [[setafWAD|weakly admissible]] $E''$.
```

- Round 2: mirrors AF `weakDefence`: "either $E$ attacks …, or <formula>, and $E' \subseteq E''$ for some weakly admissible $E''$". AF's extra "$b \notin E$" is covered here by $E^* = \emptyset$.
- [source checked] BKU24 Def. 38 (p. 185). Content matches.
- [style] "if" → "iff"; framework named; "one of the following two conditions … simultaneously (1) … (2)" folded into one sentence, as in the AF `weakDefence` entry; "$E$ attacks $T$" → "attacks some argument in $T$".

#### setafWCO (symbol: $\mathsf{wco}$)

- [ ] Accept

```md
current: A set $E \in$ [[setafWAD|$\mathsf{wad}(S)$]] is weakly complete ($E \in \mathsf{wco}(S)$) iff for each $X \supseteq E$ such that $E$ [[setafWeakDefence|weakly defends]] $X$, we have $E = X$.
proposed: A set $E \subseteq A$ is a weakly complete [[extension]] iff $E$ is [[setafWAD|weakly admissible]] and $E' \subseteq E$ for every $E' \supseteq E$ that $E$ [[setafWeakDefence|weakly defends]].
```

- Round 2: word for word AF `WCO` with the SetAF links.
- [source checked] BKU24 Def. 41 (p. 185). Matches.
- [style] D3 symbol; mirrors the AF `WCO` entry.

#### setafWGR (symbol: $\mathsf{wgr}$)

- [ ] Accept

```md
current: A set $E$ is weakly grounded ($E \in \mathsf{wgr}(S)$) iff $E$ is minimal w.r.t. $\subseteq$ in [[setafWCO|$\mathsf{wco}(S)$]].
proposed: A set $E \subseteq A$ is a weakly grounded [[extension]] iff $E$ is a $\subseteq$-minimal [[setafWCO|weakly complete]] extension.
```

- Round 2: word for word AF `WGR` with the SetAF link.
- [source checked] BKU24 Def. 41 (p. 185). Matches.
- [style] D3 symbol; mirrors the AF `WGR` entry.

#### setafWPR (symbol: $\mathsf{wpr}$)

- [ ] Accept

```md
current: A set $E$ is weakly preferred ($E \in \mathsf{wpr}(S)$) iff $E$ is maximal w.r.t. $\subseteq$ in [[setafWAD|$\mathsf{wad}(S)$]].
proposed: A set $E \subseteq A$ is a weakly preferred [[extension]] iff $E$ is a $\subseteq$-maximal [[setafWAD|weakly admissible]] set.
```

- Round 2: word for word AF `WPR` with the SetAF link.
- [source checked] BKU24 Def. 41 (p. 185). Matches.
- [style] D3 symbol; mirrors the AF `WPR` entry.

#### setafSAD (symbol: $\mathsf{sad}$)

- [ ] Accept

```md
current: A set of arguments $E \subseteq A$ is strongly defended ($E \in \mathsf{sd}(S)$) iff $E$ is conflict-free and for every $a \in E$ there exists a strongly defended subset $E' \subseteq E \setminus \{a\}$, which defends $a$. $E$ is strongly admissible ($E \in \mathsf{sad}(S)$) iff $E \in \mathsf{sd}(S)$ and $E$ is closed.
proposed: A set $E \subseteq A$ is strongly admissible iff $E$ is conflict-free and every $a \in E$ is defended by some strongly admissible $E' \subseteq E \setminus \{a\}$.
```

- Round 2: mirrors AF `SAD`; keeps "conflict-free" (BBR25 requires it explicitly), "defended" unlinked (AF defence differs, D5).
- [error] "$E$ is closed" has no meaning in a SetAF. BBR25 Def. 5.2–5.3 (PDF p. 6) define $\mathsf{sd}$ and strong admissibility for bipolar SetAFs $(A, R, S)$, where closed means closed under the support $S$ (Def. 2.5, PDF p. 3). A SetAF is the case $S = \emptyset$ (BBR25 after Def. 2.4), where every set is closed, so strongly admissible = strongly defended and the recursion can use strong admissibility itself.
- [style] D3 symbol; the helper $\mathsf{sd}$ is no longer needed; mirrors the AF `SAD` entry. "defended" is SetAF defence (see D5).
- App: Tweety `SimpleStronglyAdmissibleSetAfReasoner` checks conflict-freeness and builds $E$ up by defence from $\emptyset$ (the constructive form, BBR25 Prop. 5.4). Matches.
- [unverified] Earliest source for SetAFs (without support) unknown; BBR25 says it lifts strong admissibility to BSAFs.
