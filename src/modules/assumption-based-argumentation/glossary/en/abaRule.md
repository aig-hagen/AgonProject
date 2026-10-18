---
label: rule
title: Inference Rule
---

A rule $r \in \mathcal{R}$ has the form $a_0 \leftarrow a_1, \ldots, a_n$ with $a_i \in \mathcal{L}$ for all $0 \leq i \leq n$; $\mathit{head}(r) := a_0$ is the head and $\mathit{body}(r) := \{a_1, \ldots, a_n\}$ is the (possibly empty) body of $r$. A rule with an empty body, written $a_0 \leftarrow \top$, is a fact.
