---
label: $\Theta_2^{\mathsf{P}}$
title: Complexity Class $\Theta_2^{\mathsf{P}}$
short: $\Theta_2^{\mathsf{P}}$
reference: EG97
---

The decision problems decidable by a deterministic polynomial-time algorithm that may make $O(\log |x|)$ calls to an [[classNP|$\mathsf{NP}$]] oracle, written $\Theta_2^{\mathsf{P}} = \mathsf{P}^{\mathsf{NP}}[\log]$. Equivalently, the algorithm may make polynomially many non-adaptive oracle calls, all evaluated in parallel; the class is then also written $\mathsf{P}^{\mathsf{NP}}_{\parallel}$.

## Further reading

- [@W90]: characterises the class in several equivalent ways and names it.
- [@H89]: shows the equivalence with polynomially many non-adaptive calls.
- [@BH91]: proves the same equivalence independently.
