# Glossary review: assumption-based argumentation

Audit of the 19 entries in `src/modules/assumption-based-argumentation/glossary/en/`, same pass as
the [AF review](glossary-review.md), against the style in
[glossary.md](../contributing/glossary.md#style-and-notation). Sources CFST18, BRU24, BKU24 and
BDKT97 are in `literature/` and checked (locators in §3). Course text `m_64402_fa`, chapter 4.3.
Backend: Tweety (`evaluation/tweetyProject.ts`).

## Status

- [x] Phase 0: pre-pass
- [x] Phase 1: review (inline, 19 entries)
- [x] Phase 2: cross-cutting decisions D1–D6
- [x] Phase 3: triage (rounds 1–4; remark: semantics open with "A set of assumptions $S \subseteq \mathcal{A}$")
- [x] Phase 4: applied, checks pass
- [x] Phase 5: `formal-reviewer` pass; `abaSetAF` restricted to flat ABAFs (KRU22 p. 215). Not taken: an empty-tail remark ($\emptyset \vdash \overline{h}$ gives $(\emptyset, h)$) and $SF_D$ instead of $S_D$.

## 1. Cross-cutting decisions

Decided: D1 = keep CFST18 as the reference; D2–D6 as recommended; `abaDefence` added.

- [x] **D1. Sources of the basic notions.** Six entries cite CFST18 but follow BRU24 §2
      (pp. 128–129) almost word for word: `abaDeductiveSystem`, `abaRule`, `abaDerivation`,
      `abaTh`, `abaAttack`, `abaClosure`. CFST18 differs in substance: $\mathcal{L}$ is a set of
      sentences, not atoms; a deduction (Def. 2.2) has its leaves _in_ $S \cup \{\tau\}$ with
      $S \subseteq \mathcal{L}$, where BRU24's tree-derivation needs the leaf set to _equal_ $S$ or
      $S \cup \{\top\}$ with $S \subseteq \mathcal{A}$; the closure is $Cl(S)$ over
      $S \subseteq \mathcal{L}$ (Def. 2.4) and the consequences are $Cn(A)$ (Def. 2.10), not
      $Th_D(S)$. Recommended: cite BRU24 for these six, since the text is its variant and matches
      the app's atom-based model. The other entries stay CFST18.
- [x] **D2. Variable for assumption sets.** The eight semantics entries write $A \subseteq
      \mathcal{A}$ (CFST18), which is hard to tell from $\mathcal{A}$ and clashes with $A$ for
      arguments elsewhere. `abaAttack`, `abaClosure`, `abaTh`, BRU24 and the course write $S$, with
      $T$ for attackers. Recommended: $S$ and $T$ throughout; proposals in §3 assume it.
- [x] **D3. Symbols.** No ABA entry has `symbol`. Recommended, as in the ADF review: the AF
      symbols for the semantics ($\mathsf{cf}$, $\mathsf{ad}$, $\mathsf{co}$, $\mathsf{gr}$,
      $\mathsf{pr}$, $\mathsf{st}$, $\mathsf{id}$) plus $\mathsf{wf}$ (app key; CFST18 names
      none), and the notation entries $\overline{a}$, $S \vdash_R p$, $cl(S)$, $Th_D(S)$, $S_D$.
      BRU24 writes $\mathit{stb}$, BKU24 $\mathit{adm}$, $\mathit{com}$, $\mathit{grd}$,
      $\mathit{pref}$; the house symbols win.
- [x] **D4. Course notation.** Chapter 4.3 uses another, flat-only ABA variant: a theory
      $T = (\mathcal{R}, \mathcal{A})$ over propositional formulas, negation as contrary, and
      arguments built from sequences. The app needs the contrary function and non-flat
      frameworks. Recommended: keep $D = (\mathcal{L}, \mathcal{R}, \mathcal{A},
      \overline{\phantom{a}})$; take from the course only what fits ($S$ for sets, $\top$ for an
      empty body, "fact"). No proposals depend on it.
- [x] **D5. Lean pass.** Reading aids that restate the definition: `abaClosure` ("i.e. the
      assumptions derivable from $S$"), `abaFlat` ("assumptions cannot be derived, only assumed,
      i.e."; "Otherwise it is non-flat."), `abaContrary` ("Deriving $\overline{a}$ attacks $a$."),
      `abaAssumption` (default reading and retraction; not in CFST18). Proposed to drop.
- [x] **D6. Semantics without a tooltip.** The backend offers twelve ABA semantics with no
      `tooltipId` (sad, sst, ea, is, uc, stg, ud, sud, wad, wco, wgr, wpr), all flat-only and
      computed via the AF or SetAF instantiation. Recommended: out of scope here, add a TODO. A
      later pass could point wad/wco/wgr/wpr to the SetAF entries (BKU24 Def. 50, p. 185, defines
      them as $\sigma(D) = \sigma(SF_D)$).

## 2. New entries

- [x] **`abaDefence`** (Defence, CFST18 Def. 2.8, p. 371; BRU24 Def. 2.2, p. 129). `abaCO`
      defines defence inline, and the pre-pass flags it. Lets `abaCO` drop its inline clause.
      Proposed text in §3.5.

## 3. Entries

### 3.1 Framework

#### ABAF (reference: CFST18)

- [ ] Accept

```md
current: An ABA framework is a tuple $D = (\mathcal{L}, \mathcal{R}, \mathcal{A}, \overline{\phantom{a}})$, where $(\mathcal{L}, \mathcal{R})$ is a [[abaDeductiveSystem|deductive system]], $\mathcal{A} \subseteq \mathcal{L}$ a set of [[abaAssumption|assumptions]], and $\overline{\phantom{a}}: \mathcal{A} \to \mathcal{L}$ a [[abaContrary|contrary function]].
proposed: An ABA framework is a tuple $D = (\mathcal{L}, \mathcal{R}, \mathcal{A}, \overline{\phantom{a}})$, where $(\mathcal{L}, \mathcal{R})$ is a [[abaDeductiveSystem|deductive system]], $\mathcal{A} \subseteq \mathcal{L}$ a set of [[abaAssumption|assumptions]], and $\overline{\phantom{a}} \colon \mathcal{A} \to \mathcal{L}$ a [[abaContrary|contrary function]].
```

- [style] `\colon` per style guide. Checked: CFST18 Def. 2.1, p. 368; BRU24 Def. 2.1, p. 128. CFST18 also asks $\mathcal{A}$ to be non-empty; BRU24 doesn't. `## Further reading` (BDKT97) is fine.

#### abaDeductiveSystem

- [ ] Accept

```md
current: A deductive system is a tuple $(\mathcal{L}, \mathcal{R})$, where $\mathcal{L}$ is a set of atoms and $\mathcal{R}$ is a set of [[abaRule|inference rules]] over $\mathcal{L}$.
proposed: A deductive system is a tuple $(\mathcal{L}, \mathcal{R})$, where $\mathcal{L}$ is a set of atoms and $\mathcal{R}$ is a set of [[abaRule|inference rules]] over $\mathcal{L}$.
```

- [variant] Text is BRU24 p. 128 verbatim; CFST18 has "a language (a set of sentences)". Reference stays CFST18 (D1).

#### abaRule

- [ ] Accept

```md
current: A rule $r \in \mathcal{R}$ has the form $a_0 \leftarrow a_1, \ldots, a_n$ with $a_i \in \mathcal{L}$ for all $0 \leq i \leq n$; $\mathit{head}(r) := a_0$ is the head and $\mathit{body}(r) := \{a_1, \ldots, a_n\}$ is the (possibly empty) body of $r$. A rule with an empty body, written $a_0 \leftarrow \top$, is a fact.
proposed: A rule $r \in \mathcal{R}$ of a [[abaDeductiveSystem|deductive system]] has the form $a_0 \leftarrow a_1, \ldots, a_n$ with $a_i \in \mathcal{L}$ for all $0 \leq i \leq n$; $\mathit{head}(r) := a_0$ is the head and $\mathit{body}(r) := \{a_1, \ldots, a_n\}$ is the (possibly empty) body of $r$. A rule with an empty body, written $a_0 \leftarrow \top$, is a fact.
```

- [variant] First sentence is BRU24 p. 128 verbatim. "$a_0 \leftarrow \top$" and "fact" are from the course (4.3, example `ex:flat` and the figure after `ex:flat2`); CFST18 writes "$y \leftarrow$" and $\tau$. Reference stays CFST18 (D1).
- [style] Pre-pass: no outgoing links; link added.

#### abaAssumption (reference: CFST18)

- [ ] Accept

```md
current: An assumption is an atom $a \in \mathcal{A} \subseteq \mathcal{L}$ that may be taken to hold by default. Each assumption $a$ has a [[abaContrary|contrary]] $\overline{a}$; it is retracted when $\overline{a}$ is [[abaDerivation|derived]].
proposed: An assumption is an atom $a \in \mathcal{A} \subseteq \mathcal{L}$ of an [[ABAF]]. Each assumption $a$ has a [[abaContrary|contrary]] $\overline{a} \in \mathcal{L}$.
```

- [variant] CFST18 Def. 2.1 (p. 368) only says the elements of $\mathcal{A}$ are "referred to as assumptions"; "taken to hold by default" and "retracted" are an unsourced reading. Dropped per D5.

#### abaContrary (symbol: $\overline{a}$)

- [ ] Accept

```md
current: The contrary function $\overline{\phantom{a}}: \mathcal{A} \to \mathcal{L}$ maps each [[abaAssumption]] $a$ to its contrary $\overline{a} \in \mathcal{L}$. Deriving $\overline{a}$ [[abaAttack|attacks]] $a$.
proposed: The contrary function $\overline{\phantom{a}} \colon \mathcal{A} \to \mathcal{L}$ of an [[ABAF]] maps each [[abaAssumption]] $a$ to its contrary $\overline{a} \in \mathcal{L}$. If a set of assumptions $S \subseteq \mathcal{A}$ [[abaDerivation|derives]] $\overline{a}$, then $S$ [[abaAttack|attacks]] $a$.
```

- [style] `\colon`; second sentence dropped per D5 (`abaAttack` states it). Checked: CFST18 Def. 2.1, p. 368 ("total mapping").

#### abaFlat (reference: CFST18)

- [ ] Accept

```md
current: An [[ABAF]] is flat if assumptions cannot be derived, only assumed, i.e. every $S \subseteq \mathcal{A}$ is [[abaClosure|closed]]. Otherwise it is non-flat.
proposed: An [[ABAF]] is flat if assumptions cannot be [[abaDerivation|derived]], only assumed, i.e. every $S \subseteq \mathcal{A}$ is [[abaClosure|closed]]. Otherwise it is non-flat.
```

- [style] "iff"; reading aid and last sentence dropped per D5. Checked: CFST18 Def. 2.5, p. 370.

### 3.2 Derivations

#### abaDerivation (symbol: $S \vdash_R p$)

- [ ] Accept

```md
current: An atom $p \in \mathcal{L}$ is tree-derivable from assumptions $S \subseteq \mathcal{A}$ and rules $R \subseteq \mathcal{R}$, denoted $S \vdash_R p$, if there is a finite rooted labeled tree $t$ such that (i) the root of $t$ is labeled with $p$, (ii) the set of labels for the leaves of $t$ is $S$ or $S \cup \{\top\}$, and (iii) each non-leaf node $v$ is labeled with $\mathit{head}(r)$ for some [[abaRule]] $r \in R$, and the labels of its children are $\mathit{body}(r)$, or $\top$ if $\mathit{body}(r) = \emptyset$. We write $S \vdash p$ iff $S \vdash_R p$ for some $R \subseteq \mathcal{R}$.
proposed: An atom $p \in \mathcal{L}$ is tree-derivable from [[abaAssumption|assumptions]] $S \subseteq \mathcal{A}$ and [[abaRule|rules]] $R \subseteq \mathcal{R}$, written $S \vdash_R p$, iff there is a finite rooted labelled tree $t$ such that (i) the root of $t$ is labelled with $p$, (ii) the set of labels for the leaves of $t$ is $S$ or $S \cup \{\top\}$, and (iii) each non-leaf node $v$ is labelled with $\mathit{head}(r)$ for some rule $r \in R$, and the labels of its children are $\mathit{body}(r)$, or $\top$ if $\mathit{body}(r) = \emptyset$. We write $S \vdash p$ iff $S \vdash_R p$ for some $R \subseteq \mathcal{R}$.
```

- [variant] BRU24 pp. 128–129 verbatim. CFST18 Def. 2.2 (p. 369) is weaker: leaves only need to be in $S \cup \{\tau\}$, and $S \subseteq \mathcal{L}$. Reference stays CFST18 (D1).
- [style] "iff", "written", British "labelled". Long (101 words), but it is the definition; keep.

#### abaTh (symbol: $Th_D(S)$)

- [ ] Accept

```md
current: The set of all conclusions [[abaDerivation|derivable]] from an assumption set $S$ in an [[ABAF]] $D$ is $Th_D(S) := \{p \in \mathcal{L} \mid \exists S' \subseteq S: S' \vdash p\}$.
proposed: The set of all conclusions [[abaDerivation|derivable]] from $S \subseteq \mathcal{A}$ in an [[ABAF]] $D$ is $Th_D(S) := \{p \in \mathcal{L} \mid \exists S' \subseteq S: S' \vdash p\}$.
```

- [variant] BRU24 p. 129 verbatim; CFST18 has the same set as $Cn(A)$ (Def. 2.10, p. 371). Reference stays CFST18 (D1).
- [style] "$S \subseteq \mathcal{A}$" instead of "an assumption set $S$" (pre-pass unlinked mention).

#### abaClosure (symbol: $cl(S)$)

- [ ] Accept

```md
current: The closure of $S \subseteq \mathcal{A}$ is $cl(S) := $ [[abaTh|$Th_D(S)$]] $\cap\, \mathcal{A}$, i.e. the assumptions derivable from $S$. $S$ is closed if $S = cl(S)$.
proposed: The closure of $S \subseteq \mathcal{A}$ is $cl(S) := $ [[abaTh|$Th_D(S)$]] $\cap\, \mathcal{A}$, the set of assumptions derivable from $S$. $S$ is closed iff $S = cl(S)$.
```

- [variant] BRU24 p. 129 verbatim; CFST18 Def. 2.4 (p. 369) defines $Cl(S)$ for $S \subseteq \mathcal{L}$, same set for $S \subseteq \mathcal{A}$. Reference stays CFST18 (D1).
- [style] "iff"; reading aid dropped per D5.

#### abaAttack

- [ ] Accept

```md
current: A set $S \subseteq \mathcal{A}$ attacks a set $T \subseteq \mathcal{A}$ if there are $S' \subseteq S$ and $a \in T$ such that $S' \vdash \overline{a}$; if $S$ attacks $\{a\}$ we say $S$ attacks $a$.
proposed: A set $S \subseteq \mathcal{A}$ attacks a set $T \subseteq \mathcal{A}$ iff there are $S' \subseteq S$ and $a \in T$ such that [[abaDerivation|$S' \vdash \overline{a}$]] for the [[abaContrary|contrary]] $\overline{a}$ of $a$.
```

- [style] "iff"; pre-pass: no outgoing links. Checked: BRU24 p. 129 verbatim; CFST18 Def. 2.7 (p. 370) is the same.

### 3.3 Instantiation

#### abaSetAF (reference: KRU22; symbol: $S_D$)

- [ ] Accept

```md
current: For an [[ABAF]] $D = (\mathcal{L}, \mathcal{R}, \mathcal{A}, \overline{\phantom{a}})$, the corresponding [[SetAF]] is $S_D = (\mathcal{A}, R)$ with $R = \{(T, h) \mid h \in \mathcal{A},\ T \subseteq \mathcal{A} \text{ and } T$ [[abaDerivation|$\vdash$]] $\overline{h}\}$.
proposed: For an [[ABAF]] $D = (\mathcal{L}, \mathcal{R}, \mathcal{A}, \overline{\phantom{a}})$, the corresponding [[SetAF]] is $S_D = (\mathcal{A}, R)$ with $R = \{(T, h) \mid h \in \mathcal{A},\ T \subseteq \mathcal{A},\ T \vdash \overline{h}\}$, where $\vdash$ is [[abaDerivation|tree-derivability]].
```

- [style] Set-builder split over three math spans; keep it in one, move the link out.
- [source] Earliest source: KRU22 Def. 3.13, p. 217 ($SF_D$, flat ABAFs; added to `publications.ts`). BKU24 Def. 47 (p. 185) recalls it from KRU22. Reference moves to KRU22.

### 3.4 Semantics

#### abaCF (symbol: $\mathsf{cf}$)

- [ ] Accept

```md
current: A set of assumptions $A \subseteq \mathcal{A}$ is conflict-free iff it does not [[abaAttack|attack]] itself.
proposed: A set of assumptions $S \subseteq \mathcal{A}$ is conflict-free iff $S$ does not [[abaAttack|attack]] itself.
```

- [style] D2. Checked: CFST18 Def. 2.8, p. 370.

#### abaADM (symbol: $\mathsf{ad}$)

- [ ] Accept

```md
current: A set of assumptions $A \subseteq \mathcal{A}$ is admissible iff it is [[abaClosure|closed]], [[abaCF]] and, for every $B \subseteq \mathcal{A}$, if $B$ is closed and [[abaAttack|attacks]] $A$, then $A$ attacks $B$.
proposed: A set of assumptions $S \subseteq \mathcal{A}$ is admissible iff $S$ is [[abaClosure|closed]], [[abaCF]] and [[abaAttack|attacks]] every closed $T \subseteq \mathcal{A}$ that attacks $S$.
```

- [style] D2; quantifier folded into one clause. Checked: CFST18 Def. 2.8, p. 370.

#### abaCO (symbol: $\mathsf{co}$)

- [ ] Accept

```md
current: A set of assumptions $A \subseteq \mathcal{A}$ is complete iff it is [[abaADM]] and contains all assumptions it defends, where $A$ defends $a$ iff for every $B \subseteq \mathcal{A}$, if $B$ is [[abaClosure|closed]] and [[abaAttack|attacks]] $\{a\}$, then $A$ attacks $B$.
proposed: A set of assumptions $S \subseteq \mathcal{A}$ is complete iff $S$ is [[abaADM]] and contains every assumption it [[abaDefence|defends]].
```

- [style] D2; defence moves to the new entry (§2). Checked: CFST18 Def. 2.8, p. 371.

#### abaGR (reference: BRU24; symbol: $\mathsf{gr}$)

- [ ] Accept

```md
current: A set of assumptions $A \subseteq \mathcal{A}$ is grounded iff $A$ is [[abaCO]] and $\subseteq$-minimal.
proposed: A set of assumptions $S \subseteq \mathcal{A}$ is grounded iff $S$ is $\subseteq$-minimal among the [[abaCO|complete]] extensions.
```

- [style] D2; say among which sets. Checked: BRU24 Def. 2.3, p. 129 ("$\subseteq$-minimal in $co(D)$"). Not unique in non-flat ABAFs, so "a", not "the". CFST18 has no grounded semantics for non-flat ABAFs (only well-founded); BRU24 is the right source.

#### abaPR (symbol: $\mathsf{pr}$)

- [ ] Accept

```md
current: A set of assumptions $A \subseteq \mathcal{A}$ is preferred iff it is maximally (w.r.t. $\subseteq$) [[abaADM]].
proposed: A set of assumptions $S \subseteq \mathcal{A}$ is preferred iff $S$ is $\subseteq$-maximal among the [[abaADM|admissible]] sets.
```

- [style] D2; house wording. Checked: CFST18 Def. 2.8, p. 370.

#### abaST (symbol: $\mathsf{st}$)

- [ ] Accept

```md
current: A set of assumptions $A \subseteq \mathcal{A}$ is stable iff it is [[abaClosure|closed]], [[abaCF]] and, for every $a \notin A$, $A$ [[abaAttack|attacks]] $\{a\}$.
proposed: A set of assumptions $S \subseteq \mathcal{A}$ is stable iff $S$ is [[abaClosure|closed]], [[abaCF]] and [[abaAttack|attacks]] $\{a\}$ for every $a \in \mathcal{A} \setminus S$.
```

- [style] D2; "$a \notin A$" leaves the range of $a$ open (BRU24 and the course write $\mathcal{A} \setminus S$). Checked: CFST18 Def. 2.8, p. 371.

#### abaID (symbol: $\mathsf{id}$)

- [ ] Accept

```md
current: A set of assumptions $A \subseteq \mathcal{A}$ is ideal iff $A$ is maximal (w.r.t. $\subseteq$) such that (i) it is [[abaADM]], and (ii) for all [[abaPR]] extensions $P \subseteq \mathcal{A}$, $A \subseteq P$.
proposed: A set of assumptions $S \subseteq \mathcal{A}$ is ideal iff $S$ is $\subseteq$-maximal among the [[abaADM|admissible]] sets that are contained in every [[abaPR|preferred]] extension.
```

- [style] D2; house wording. Words instead of $\bigcap \mathsf{pr}(D)$ (as in AF `ID`), since a non-flat ABAF can have no preferred extension. Checked: CFST18 Def. 2.8, p. 371.

#### abaWF (symbol: $\mathsf{wf}$)

- [ ] Accept

```md
current: A set of assumptions $A \subseteq \mathcal{A}$ is well-founded iff it is the intersection of all [[abaCO]] extensions. For [[abaFlat]] ABA frameworks, this coincides with the [[abaGR]] semantics.
proposed: A set of assumptions $S \subseteq \mathcal{A}$ is well-founded iff $S$ is the intersection of all [[abaCO|complete]] extensions. For [[abaFlat]] ABA frameworks, it coincides with the [[abaGR|grounded]] extension.
```

- [style] D2. Checked: CFST18 Def. 2.8 and the note after it, p. 371 ("in the case of flat ABA frameworks, the term grounded is conventionally used instead of well-founded").

### 3.5 New entries

#### abaDefence (new; label: defends; title: Defence (ABA); reference: CFST18)

```md
---
label: defends
title: Defence (ABA)
short: Defence
reference: CFST18
---

A set of assumptions $S \subseteq \mathcal{A}$ defends an assumption $a \in \mathcal{A}$ iff $S$ [[abaAttack|attacks]] every [[abaClosure|closed]] $T \subseteq \mathcal{A}$ that attacks $\{a\}$.
```
