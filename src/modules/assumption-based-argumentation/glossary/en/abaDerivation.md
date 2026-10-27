---
label: tree-derivable
title: Tree-Derivability
symbol: S \vdash_R p
reference: CFST18
---

An atom $p \in \mathcal{L}$ is tree-derivable from [[abaAssumption|assumptions]] $S \subseteq \mathcal{A}$ and [[abaRule|rules]] $R \subseteq \mathcal{R}$, written $S \vdash_R p$, iff there is a finite rooted labelled tree $t$ such that (i) the root of $t$ is labelled with $p$, (ii) the set of labels for the leaves of $t$ is $S$ or $S \cup \{\top\}$, and (iii) each non-leaf node $v$ is labelled with $\mathit{head}(r)$ for some rule $r \in R$, and the labels of its children are $\mathit{body}(r)$, or $\top$ if $\mathit{body}(r) = \emptyset$. We write $S \vdash p$ iff $S \vdash_R p$ for some $R \subseteq \mathcal{R}$.
