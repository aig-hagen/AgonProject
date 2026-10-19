---
label: qualified local function
title: Qualified Local Function $f_{q-\sigma}$
reference: DRT20
---

Let $f_\sigma$ be the local function of an [[sccRecursive|SCC-decomposable semantics]] $\sigma$. Its qualified local function is defined by $f_{q-\sigma}((A,R), A_{\mathrm{in}}, R_{\mathrm{in}}, L_{\mathrm{in}}) = f_\sigma((A,R), A_{\mathrm{in}}, R_{\mathrm{in}}, L'_{\mathrm{in}})$, where $L'_{\mathrm{in}}(x) = \mathrm{I}$ if $L_{\mathrm{in}}(x) = \mathrm{I}$, and $L'_{\mathrm{in}}(x) = \mathrm{O}$ if $L_{\mathrm{in}}(x) \in \{\mathrm{O}, \mathrm{U}\}$.
