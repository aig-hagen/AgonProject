---
label: semi-qualified local function
title: Semi-Qualified Weak Local Function $g_{sq-\sigma}$
---

Let $f_\sigma$ be the local function of an [[sccRecursive|SCC-decomposable semantics]] $\sigma$, and let $S_{\mathrm{in}}$ be the set of possible labellings of the outparents of the current SCC. The semi-qualified weak local function is defined by $g_{sq-\sigma}((A,R), A_{\mathrm{in}}, R_{\mathrm{in}}, L_{\mathrm{in}}, S_{\mathrm{in}}) = f_\sigma((A,R), A_{\mathrm{in}}, R_{\mathrm{in}}, L'_{\mathrm{in}})$, where $L'_{\mathrm{in}}(x) = \mathrm{I}$ if $L_{\mathrm{in}}(x) = \mathrm{I}$, $L'_{\mathrm{in}}(x) = \mathrm{O}$ if $L_{\mathrm{in}}(x) = \mathrm{O}$, and an undecided $x$ is relabelled $\mathrm{O}$ iff no $L \in S_{\mathrm{in}}$ labels $x$ as $\mathrm{I}$; otherwise it remains $\mathrm{U}$.
