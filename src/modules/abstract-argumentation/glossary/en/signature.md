---
label: signature
title: Signature
symbol: \mathsf{sig}(\sigma)
reference: DDLW15
---

A set $\mathbb{S}$ of sets of arguments is _realisable_ under a [[semantics]] $\sigma$ iff there is an [[AF]] $F$ with $\sigma(F) = \mathbb{S}$. The signature of $\sigma$ is $\mathsf{sig}(\sigma) = \{\mathbb{S} \mid \mathbb{S}$ is realisable under $\sigma\}$.

## Properties of sets of extensions

For a set $\mathbb{S}$ of sets of arguments, let $\mathrm{Args}_\mathbb{S} = \bigcup_{S \in \mathbb{S}} S$, $\mathrm{Pairs}_\mathbb{S} = \{(a,b) \mid \{a,b\} \subseteq S$ for some $S \in \mathbb{S}\}$ and $\mathrm{dcl}_\mathbb{S} = \{S' \mid S' \subseteq S$ for some $S \in \mathbb{S}\}$ [@DDLW15]. Then $\mathbb{S}$ is

- _downward-closed_ iff $\mathbb{S} = \mathrm{dcl}_\mathbb{S}$ (see [[downwardClosure]]),
- _incomparable_ iff for all $S, S' \in \mathbb{S}$, $S \subseteq S'$ implies $S = S'$ (see [[iMaximality]]),
- _tight_ iff for all $S \in \mathbb{S}$ and $a \in \mathrm{Args}_\mathbb{S}$ with $S \cup \{a\} \notin \mathbb{S}$ there is $b \in S$ with $(a,b) \notin \mathrm{Pairs}_\mathbb{S}$ (see [[tightness]]),
- _conflict-sensitive_ iff for all $S, S' \in \mathbb{S}$ with $S \cup S' \notin \mathbb{S}$ there are $a, b \in S \cup S'$ with $(a,b) \notin \mathrm{Pairs}_\mathbb{S}$ (see [[conflictSensitiveness]]),
- _com-closed_ iff for every $\mathbb{T} \subseteq \mathbb{S}$ with $(a,b) \in \mathrm{Pairs}_\mathbb{S}$ for all $a, b \in \mathrm{Args}_\mathbb{T}$, $\mathrm{Args}_\mathbb{T}$ has exactly one $\subseteq$-minimal superset in $\mathbb{S}$ (see [[comClosure]]).

## Known Signatures

| $\sigma$ | $\mathbb{S} \in \mathsf{sig}(\sigma)$ iff | Source |
| --- | --- | --- |
| [[CF|$\mathsf{cf}$]] | $\mathbb{S} \neq \emptyset$, downward-closed and tight | [@DDLW15] |
| [[NA|$\mathsf{na}$]] | $\mathbb{S} \neq \emptyset$, incomparable and $\mathrm{dcl}_\mathbb{S}$ is tight | [@DDLW15] |
| [[ST|$\mathsf{st}$]] | $\mathbb{S}$ is incomparable and tight | [@DDLW15] |
| [[STG|$\mathsf{stg}$]] | $\mathbb{S} \neq \emptyset$, incomparable and tight | [@DDLW15] |
| [[ADM|$\mathsf{ad}$]] | $\emptyset \in \mathbb{S}$ and $\mathbb{S}$ is conflict-sensitive | [@DDLW15] |
| [[PR|$\mathsf{pr}$]], [[SST|$\mathsf{sst}$]] | $\mathbb{S} \neq \emptyset$, incomparable and conflict-sensitive | [@DDLW15] |
| [[GR|$\mathsf{gr}$]] | $\lvert\mathbb{S}\rvert = 1$ | [@DDLW15] |
| [[ID|$\mathsf{id}$]], [[EA|$\mathsf{ea}$]] | $\lvert\mathbb{S}\rvert = 1$ | [@DSLW16] |
| [[SAD|$\mathsf{sad}$]] | $\mathbb{S}$ is decomposable | [@D20] |