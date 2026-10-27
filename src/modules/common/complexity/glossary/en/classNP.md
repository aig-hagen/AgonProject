---
label: $\mathsf{NP}$
title: Complexity Class $\mathsf{NP}$
short: $\mathsf{NP}$
reference: P94
---

The decision problems of the form $\exists y\, W(x, y)$, where $y$ has size polynomial in $|x|$ and $W$ is decidable in polynomial time: $x$ is a yes-instance if and only if it has a short witness $y$ (e.g. a satisfying assignment) that can be checked efficiently. Equivalently, the problems solvable by a nondeterministic polynomial-time algorithm.

## Further reading

- [@C71]: introduces NP-completeness and shows that SAT is NP-complete.
- [@K72]: shows that 21 classic combinatorial problems are NP-complete.
