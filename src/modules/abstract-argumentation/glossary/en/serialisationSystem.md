---
label: serialisation system
title: Serialisation System
symbol: \mathcal{E}_{\alpha,\beta}
reference: T22
---

For a [[selFn|selection function]] $\alpha$, a [[serialisationState|serialisation state]] $(F, E)$ transitions to $(F^S, E \cup S)$ for every $S \in \alpha($[[unattackedInitial|$\mathsf{is}^{\not\leftarrow}(F)$]]$,$ [[unchallengedInitial|$\mathsf{is}^{\not\leftrightarrow}(F)$]]$,$ [[challengedInitial|$\mathsf{is}^{\leftrightarrow}(F)$]]$)$, where $F^S$ is the [[reduct]]. For a [[termFn|termination function]] $\beta$, $\mathcal{E}_{\alpha,\beta}(F)$ is the set of all $E$ such that some $(F', E)$ with $\beta(F', E) = 1$ is reachable from $(F, \emptyset)$ in finitely many steps.

## Serialisable semantics

The following semantics are serialisable [@T22]:

| Semantics | Selection function | Termination function |
| --- | --- | --- |
| [[ADM|admissible]] | [[selFnADM|$\alpha_{\mathsf{ad}}$]] | [[termFnADM|$\beta_{\mathsf{ad}}$]] |
| [[CO|complete]] | [[selFnADM|$\alpha_{\mathsf{ad}}$]] | [[termFnCO|$\beta_{\mathsf{co}}$]] |
| [[GR|grounded]] | [[selFnGR|$\alpha_{\mathsf{gr}}$]] | [[termFnCO|$\beta_{\mathsf{co}}$]] |
| [[PR|preferred]] | [[selFnADM|$\alpha_{\mathsf{ad}}$]] | [[termFnPR|$\beta_{\mathsf{pr}}$]] |
| [[ST|stable]] | [[selFnADM|$\alpha_{\mathsf{ad}}$]] | [[termFnST|$\beta_{\mathsf{st}}$]] |
| [[SAD|strongly admissible]] | [[selFnGR|$\alpha_{\mathsf{gr}}$]] | [[termFnADM|$\beta_{\mathsf{ad}}$]] |

The [[UC|unchallenged semantics]] is defined via [[selFnUC|$\alpha_{\mathsf{uc}}$]] and [[termFnUC|$\beta_{\mathsf{uc}}$]] [@BT22].
