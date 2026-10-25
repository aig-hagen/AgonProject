---
label: reduct
title: $E$-Reduct (SetAF)
short: $E$-Reduct
reference: BKU24
---

Given a [[SetAF]] $S = (A, R)$ and $E \subseteq A$, the $E$-reduct of $S$ is the SetAF $S^E = (A', R')$, with $A' = A \setminus$ [[setafRange|$E^\oplus_R$]] and $R' = \{(T \setminus E, h) \mid (T, h) \in R,\ T \cap E^+_R = \emptyset,\ T \not\subseteq E,\ h \in A'\}$.
