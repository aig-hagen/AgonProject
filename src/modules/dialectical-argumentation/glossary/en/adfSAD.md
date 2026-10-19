---
label: strongly admissible
title: Strong Admissibility (ADF)
reference: KVV22
---

A [[threeValuedInterpretation]] $v$ of an [[ADF]] is strongly admissible iff every $a$ with $v(a) \neq \mathbf{u}$ is strongly justified in $v$ w.r.t. $\{a\}$. An argument $a$ is strongly justified in $v$ w.r.t. a set $E \subseteq A$ iff there is a set $P \subseteq par(a) \setminus E$ of [[parents]] such that $C_a$, with every $p \in P$ replaced by its truth value $v(p)$, is a tautology if $v(a) = \mathbf{t}$ or unsatisfiable if $v(a) = \mathbf{f}$, and every $p \in P$ is strongly justified in $v$ w.r.t. $E \cup \{p\}$.
