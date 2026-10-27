---
label: stage
title: Stage Semantics
symbol: \mathsf{stg}
reference: V96
---

A set $E \subseteq A$ is a stage [[extension]] iff $E$ is [[CF|conflict-free]] and there is no conflict-free $E' \subseteq A$ with [[range|$E^\oplus$]] $\subsetneq E'^\oplus$.

## Signature

A set $\mathbb{S}$ of sets of arguments is in [[signature|$\mathsf{sig}(\mathsf{stg})$]] iff $\mathbb{S} \neq \emptyset$, $\mathbb{S}$ is incomparable and tight [@DDLW15].
