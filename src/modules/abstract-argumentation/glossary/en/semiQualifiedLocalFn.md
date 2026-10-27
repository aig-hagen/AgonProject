---
label: semi-qualified weak local function
title: Semi-Qualified Weak Local Function
symbol: g_{\mathsf{sq}\text{-}\sigma}
reference: DRT20
---

The semi-qualified weak local function $g_{\mathsf{sq}\text{-}\sigma}$ of an [[sccDecomposability|SCC-decomposable]] [[semantics]] $\sigma$ computes the [[labelling|labellings]] of an [[scc|SCC]] like the local function $f_\sigma$ of $\sigma$, after relabelling an $\mathsf{undec}$ attacker from outside the SCC as $\mathsf{out}$ exactly when no other given labelling of these attackers labels it $\mathsf{in}$.

## Formal definition

Let $S_{\mathrm{in}}$ be the set of possible labellings of the outparents of the current SCC. Then $g_{\mathsf{sq}\text{-}\sigma}((A,R), A_{\mathrm{in}}, R_{\mathrm{in}}, L_{\mathrm{in}}, S_{\mathrm{in}}) = f_\sigma((A,R), A_{\mathrm{in}}, R_{\mathrm{in}}, L'_{\mathrm{in}})$, where $L'_{\mathrm{in}}(x) = \mathsf{out}$ if $L_{\mathrm{in}}(x) = \mathsf{undec}$ and no $L \in S_{\mathrm{in}}$ labels $x$ as $\mathsf{in}$, and $L'_{\mathrm{in}}(x) = L_{\mathrm{in}}(x)$ otherwise [@DRT20].
