---
label: social argumentation
title: Social Argumentation Ranking
symbol: \theta^{\mathsf{SAF}}
reference: BDKM16
---

The social argumentation ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^{\mathsf{SAF}}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^{\mathsf{SAF}}}_F b$ iff $M(a) \geq M(b)$, where $M$ is the [[socialModel|social model]] of $F$ under the [[simpleProductSemantics|simple product semantics]].

## Remarks

Social models were introduced for vote-annotated frameworks [@LM11]; the ranking applies them to plain AFs, where every argument gets the same base score [@BDKM16].
