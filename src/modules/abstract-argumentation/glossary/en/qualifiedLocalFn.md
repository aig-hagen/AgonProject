---
label: qualified local function
title: Qualified Local Function $f_{\mathsf{q}\text{-}\sigma}$
reference: DRT20
---

The qualified local function $f_{\mathsf{q}\text{-}\sigma}$ of an [[sccDecomposability|SCC-decomposable]] [[semantics]] $\sigma$ computes the [[labelling|labellings]] of an [[scc|SCC]] like the local function $f_\sigma$ of $\sigma$, after relabelling every $\mathsf{undec}$ attacker from outside the SCC as $\mathsf{out}$.

## Formal definition

$f_{\mathsf{q}\text{-}\sigma}((A,R), A_{\mathrm{in}}, R_{\mathrm{in}}, L_{\mathrm{in}}) = f_\sigma((A,R), A_{\mathrm{in}}, R_{\mathrm{in}}, L'_{\mathrm{in}})$, where $L'_{\mathrm{in}}(x) = \mathsf{out}$ if $L_{\mathrm{in}}(x) = \mathsf{undec}$, and $L'_{\mathrm{in}}(x) = L_{\mathrm{in}}(x)$ otherwise [@DRT20].
