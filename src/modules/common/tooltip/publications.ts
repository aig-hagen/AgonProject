/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
 *
 * Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program, if not, see <https://www.gnu.org/licenses/>.
 */

export interface Publication {
  shortLabel: string
  label: string
  href: string
}

// ── Abstract Argumentation ────────────────────────────────────────────────────

export const D95: Publication = {
  shortLabel: 'Dung (1995)',
  label: 'Dung, P.M. (1995). On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games. Artificial Intelligence, 77(2).',
  href: 'https://doi.org/10.1016/0004-3702(94)00041-X',
}

export const BCG18: Publication = {
  shortLabel: 'Baroni et al. (2018)',
  label: 'Baroni, P., Caminada, M. & Giacomin, M. (2018). Abstract Argumentation Frameworks and Their Semantics. In: Handbook of Formal Argumentation, Vol. 1, Chapter 4. College Publications.',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}

export const BBU20: Publication = {
  shortLabel: 'Baumann et al. (2020)',
  label: 'Baumann, R., Brewka, G. & Ulbricht, J. (2020). Revisiting the Foundations of Abstract Argumentation - Semantics Based on Weak Admissibility and Weak Defense. In: The Thirty-Fourth AAAI Conference on Artificial Intelligence (AAAI 2020), pp. 2742-2749.',
  href: 'https://doi.org/10.1609/aaai.v34i03.5661',
}

export const C06: Publication = {
  shortLabel: 'Caminada (2006)',
  label: 'Caminada, M. (2006). Semi-Stable Semantics. In: Computational Models of Argument – Proceedings of COMMA 2006, pp. 121–130.',
  href: 'https://dl.acm.org/doi/abs/10.5555/1565233.1565248',
}

export const C07: Publication = {
  shortLabel: 'Caminada (2007)',
  label: 'Caminada, M. (2007). Comparing Two Unique Extension Semantics for Formal Argumentation: Ideal and Eager. In: Proceedings of the 19th Belgian-Dutch Conference on Artificial Intelligence (BNAIC 2007), pp. 81–87.',
  href: 'http://www.martincaminada.net/publications/ideal-eager.pdf',
}

export const C14: Publication = {
  shortLabel: 'Caminada (2014)',
  label: 'Caminada, M. (2014). Strong Admissibility Revisited. In: Computational Models of Argument – Proceedings of COMMA 2014, pp. 197–208.',
  href: 'https://doi.org/10.3233/978-1-61499-436-7-197',
}

export const DMT07: Publication = {
  shortLabel: 'Dung et al. (2007)',
  label: 'Dung, P.M., Mancarella, P. & Toni, F. (2007). Computing Ideal Sceptical Argumentation. Artificial Intelligence, 171(10–15), pp. 642–674.',
  href: 'https://doi.org/10.1016/j.artint.2007.05.003',
}

export const XC18: Publication = {
  shortLabel: 'Xu & Cayrol (2018)',
  label: 'Xu, Y. & Cayrol, C. (2018). Initial Sets in Abstract Argumentation Frameworks. Journal of Applied Non-Classical Logics, 28(2–3), pp. 260–279.',
  href: 'https://doi.org/10.1080/11663081.2018.1457252',
}

export const T22: Publication = {
  shortLabel: 'Thimm (2022)',
  label: 'Thimm, M. (2022). Revisiting Initial Sets in Abstract Argumentation. Argument & Computation, 13(3), pp. 325-360.',
  href: 'https://doi.org/10.3233/AAC-210018',
}

export const BT22: Publication = {
  shortLabel: 'Bengel & Thimm (2022)',
  label: 'Bengel, L. & Thimm, M. (2022). Serialisable Semantics for Abstract Argumentation. In: Computational Models of Argument – Proceedings of COMMA 2022, pp. 80–91.',
  href: 'https://doi.org/10.3233/FAIA220143',
}

export const V96: Publication = {
  shortLabel: 'Verheij (1996)',
  label: 'Verheij, B. (1996). Two Approaches to Dialectical Argumentation: Admissible Sets and Argumentation Stages. In: Proceedings of NAIC 1996, pp. 357–368.',
  href: 'https://www.ai.rug.nl/~verheij/publications/pdf/cd96.pdf',
}

export const BGG05: Publication = {
  shortLabel: 'Baroni et al. (2005)',
  label: 'Baroni, P., Giacomin, M. & Guida, G. (2005). SCC-Recursiveness: A General Schema for Argumentation Semantics. Artificial Intelligence, 168(1–2), pp. 162–210.',
  href: 'https://doi.org/10.1016/j.artint.2005.05.006',
}

export const DG16: Publication = {
  shortLabel: 'Dvořák & Gaggl (2016)',
  label: 'Dvořák, W. & Gaggl, S.A. (2016). Stage Semantics and the SCC-Recursive Schema for Argumentation Semantics. Journal of Logic and Computation, 26(4), pp. 1149–1202.',
  href: 'https://doi.org/10.1093/logcom/exu006',
}

export const T23: Publication = {
  shortLabel: 'Thimm (2023)',
  label: 'Thimm, M. (2023). On Undisputed Sets in Abstract Argumentation. In: Proceedings of the AAAI Conference on Artificial Intelligence (AAAI 2023), pp. 6550–6557.',
  href: 'https://doi.org/10.1609/aaai.v37i5.25805',
}

// ── Bipolar Argumentation ─────────────────────────────────────────────────────

export const CL05: Publication = {
  shortLabel: 'Cayrol & Lagasquie-Schiex (2005)',
  label: 'Cayrol, C. & Lagasquie-Schiex, M.-C. (2005). On the Acceptability of Arguments in Bipolar Argumentation Frameworks. ECSQARU 2005, LNCS 3571.',
  href: 'https://doi.org/10.1007/11518655_33',
}

export const CL10: Publication = {
  shortLabel: 'Cayrol & Lagasquie-Schiex (2010)',
  label: 'Cayrol, C. & Lagasquie-Schiex, M.-C. (2010). Coalitions of Arguments: A Tool for Handling Bipolar Argumentation Frameworks. International Journal of Intelligent Systems, 25(1).',
  href: 'https://doi.org/10.1002/int.20403',
}

export const CCL21: Publication = {
  shortLabel: 'Cayrol et al. (2021)',
  label: 'Cayrol, C., Cohen, A. & Lagasquie-Schiex, M.-C. (2021). Higher-Order Interactions (Bipolar or Not) in Abstract Argumentation: A State of the Art. In: Handbook of Formal Argumentation, Vol. 2, Chapter 1. College Publications.',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
}

// ── Probabilistic Argumentation ───────────────────────────────────────────────

export const LON11: Publication = {
  shortLabel: 'Li et al. (2011)',
  label: 'Li, H., Oren, N. & Norman, T.J. (2011). Probabilistic Argumentation Frameworks. TAFA 2011, LNAI 7132.',
  href: 'https://link.springer.com/chapter/10.1007/978-3-642-29184-5_1',
}

export const H14: Publication = {
  shortLabel: 'Hunter (2014)',
  label: 'Hunter, A. (2014). Probabilistic Qualification of Attack in Abstract Argumentation. International Journal of Approximate Reasoning, 55(2).',
  href: 'https://doi.org/10.1016/j.ijar.2013.09.002',
}

export const HPPRT21: Publication = {
  shortLabel: 'Hunter et al. (2021)',
  label: 'Hunter, A., Polberg, S., Potyka, N., Rienstra, T. & Thimm, M. (2021). Probabilistic Argumentation: A Survey. In: Handbook of Formal Argumentation, Vol. 2, Chapter 7. College Publications.',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
}

// ── Incomplete Argumentation ──────────────────────────────────────────────────

export const CDKLM07: Publication = {
  shortLabel: 'Coste-Marquis et al. (2007)',
  label: "Coste-Marquis, S., Devred, C., Konieczny, S., Lagasquie-Schiex, M.-C. & Marquis, P. (2007). On the Merging of Dung's Argumentation Systems. Artificial Intelligence, 171(10–15).",
  href: 'https://doi.org/10.1016/j.artint.2007.04.012',
}

export const BJNNR21: Publication = {
  shortLabel: 'Baumeister et al. (2021)',
  label: 'Baumeister, D., Järvisalo, M., Neugebauer, D., Niskanen, A. & Rothe, J. (2021). Acceptance in Incomplete Argumentation Frameworks. Artificial Intelligence, 295, 103470.',
  href: 'https://doi.org/10.1016/j.artint.2021.103470',
}

// ── Collective Attacks Argumentation ──────────────────────────────────────────

export const NP06: Publication = {
  shortLabel: 'Nielsen & Parsons (2006)',
  label: "Nielsen, S.H. & Parsons, S. (2006). A Generalization of Dung's Abstract Framework for Argumentation: Arguing with Sets of Attacking Arguments. ArgMAS 2006, LNCS 4766.",
  href: 'https://doi.org/10.1007/978-3-540-75526-5_4',
}

export const BCDFP21: Publication = {
  shortLabel: 'Bikakis et al. (2021)',
  label: 'Bikakis, A., Cohen, A., Dvořák, W., Flouris, G. & Parsons, S. (2021). Joint Attacks and Accrual in Argumentation Frameworks. In: Handbook of Formal Argumentation, Vol. 2, Chapter 2. College Publications.',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
}

// ── Dialectical Argumentation ─────────────────────────────────────────────────

export const BW10: Publication = {
  shortLabel: 'Brewka & Woltran (2010)',
  label: 'Brewka, G. & Woltran, S. (2010). Abstract Dialectical Frameworks. KR 2010.',
  href: 'https://cdn.aaai.org/ocs/1294/1294-7400-1-PB.pdf',
}

export const BESWW13: Publication = {
  shortLabel: 'Brewka et al. (2013)',
  label: 'Brewka, G., Ellmauthaler, S., Strass, H., Wallner, J.P. & Woltran, S. (2013). Abstract Dialectical Frameworks Revisited. IJCAI 2013.',
  href: 'https://www.ijcai.org/Proceedings/13/Papers/125.pdf',
}

export const BESWW18: Publication = {
  shortLabel: 'Brewka et al. (2018)',
  label: 'Brewka, G., Ellmauthaler, S., Strass, H., Wallner, J.P. & Woltran, S. (2018). Abstract Dialectical Frameworks. In: Handbook of Formal Argumentation, Vol. 1, Chapter 5. College Publications.',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}
