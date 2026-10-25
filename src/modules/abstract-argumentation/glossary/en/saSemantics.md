---
label: SA-semantics
title: Social Argumentation Semantics
reference: LM11
---

A social argumentation semantics is a tuple $\langle L, \tau, \curlywedge, \curlyvee, \neg \rangle$, where $L$ is a totally ordered set with top $\top$ and bottom $\bot$, $\tau$ gives each argument a base score in $L$, $\curlyvee \colon L \times L \to L$ aggregates the values of the attackers, $\curlywedge \colon L \times L \to L$ combines the base score with the negated aggregate, and $\neg \colon L \to L$ is a negation.
