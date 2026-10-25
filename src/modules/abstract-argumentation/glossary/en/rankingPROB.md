---
label: probabilistic
title: Probabilistic Ranking
symbol: \theta^p_{\sigma,\circ}
reference: TCR18
---

The probabilistic ranking associates to any [[AF]] $F$ a [[rankingSemantics|ranking]] $\succeq^{\theta^p_{\sigma,\circ}}_F$ on $A$ such that $\forall a,b \in A$: $a \succeq^{\theta^p_{\sigma,\circ}}_F b$ iff $P_{\sigma,\circ}(a) \geq P_{\sigma,\circ}(b)$ in the [[PAF]] $F[p]$ that gives every argument [[argumentProbability|probability]] $p \in (0,1)$ and every attack probability $1$. Here $P_{\sigma,\circ}$ is the [[credulousAcceptanceProbability|credulous]] ($\circ = c$) or [[skepticalAcceptanceProbability|skeptical]] ($\circ = s$) acceptance probability under a [[semantics]] $\sigma$.
