---
label: burden number
title: Burden Number
symbol: \mathsf{Bur}_F
reference: AB13
---

The burden number of $a \in A$ is the sequence $\mathsf{Bur}_F(a) = \langle \mathsf{Bur}_0(a), \mathsf{Bur}_1(a), \ldots \rangle$ with $\mathsf{Bur}_0(a) = 1$ and $\mathsf{Bur}_i(a) = 1 + \sum_{b \in a^-} \frac{1}{\mathsf{Bur}_{i-1}(b)}$ for $i > 0$, where [[attackersSet|$a^-$]] are the attackers of $a$.
