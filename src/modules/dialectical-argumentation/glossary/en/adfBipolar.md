---
label: bipolar ADF
title: Bipolar ADF (BADF)
reference: BW10
---

An [[ADF]] is bipolar iff each of its links is supporting or attacking. A link $(b, a) \in L$ is supporting iff for all $R \subseteq$ [[parents|$par(a)$]], [[acceptanceCondition|$C_a$]]$(R) = \mathbf{t}$ implies $C_a(R \cup \{b\}) = \mathbf{t}$, and attacking iff for all $R \subseteq par(a)$, $C_a(R \cup \{b\}) = \mathbf{t}$ implies $C_a(R) = \mathbf{t}$.

## Link types

A link that is both supporting and attacking (called redundant) has no influence on its target and can be deleted [@BW10].

Complexity results for bipolar ADFs assume that the supporting links $L^+$ and the attacking links $L^-$ are given with the ADF, i.e. the link types are known [@SW15]. Recognising bipolarity is itself coNP-hard, and deciding the type of a single link is intractable as well [@BW10].
