---
label: serialisability-based
title: Serialisability-Based Ranking
symbol: \theta^{\mathsf{ser}}
reference: BT22b
---

The serialisability-based ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{ser}}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^{\mathsf{ser}}}_F b$ iff $\mathsf{ser}_F(a) \leq \mathsf{ser}_F(b)$, where $\mathsf{ser}_F$ is the [[serialisationIndex|serialisation index]].
