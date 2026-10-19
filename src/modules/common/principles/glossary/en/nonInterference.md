---
label: non-interference
title: Non-Interference
---

A [[semantics]] $\sigma$ satisfies non-interference iff for every framework $F$ and every set $S$ isolated in $F$ (no attacks between $S$ and the rest), $\sigma(F|_S) = \{E \cap S \mid E \in \sigma(F)\}$, where $F|_S$ is the restriction of $F$ to $S$.
