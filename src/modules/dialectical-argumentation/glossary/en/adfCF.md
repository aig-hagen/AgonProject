---
label: conflict-free
title: Conflict-Freeness (ADF)
short: Conflict-Freeness
symbol: \mathsf{cf}
reference: SW15
---

A [[threeValuedInterpretation]] $v$ of an [[ADF]] is a conflict-free model iff for every $a \in A$, $v(a) = \mathsf{t}$ implies $w(C_a) = \mathsf{t}$ for some [[completions|completion]] $w \in [v]_2$, and $v(a) = \mathsf{f}$ implies $w(C_a) = \mathsf{f}$ for some $w \in [v]_2$.
