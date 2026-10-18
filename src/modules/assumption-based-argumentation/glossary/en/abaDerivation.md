---
label: tree-derivable
title: Tree-Derivability
---

An atom $p \in \mathcal{L}$ is tree-derivable from assumptions $S \subseteq \mathcal{A}$ and rules $R \subseteq \mathcal{R}$, denoted $S \vdash_R p$, if there is a finite rooted labeled tree $t$ such that (i) the root of $t$ is labeled with $p$, (ii) the set of labels for the leaves of $t$ is $S$ or $S \cup \{\top\}$, and (iii) each non-leaf node $v$ is labeled with $\mathit{head}(r)$ for some [[abaRule]] $r \in R$, and the labels of its children are $\mathit{body}(r)$, or $\top$ if $\mathit{body}(r) = \emptyset$. We write $S \vdash p$ iff $S \vdash_R p$ for some $R \subseteq \mathcal{R}$.
