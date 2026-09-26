/*
 * AgonProject - The platform to explore different approaches to formal argumentation.
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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export interface Publication {
  shortLabel: string
  /** "Last, I." per author, in order. */
  authors: string[]
  year: number
  title: string
  /** Journal, proceedings or book, with volume and pages. */
  venue: string
  href: string
}

/** The full one-line citation, e.g. for plain-text contexts. */
export function formatCitation(pub: Publication): string {
  const { authors } = pub
  const names =
    authors.length === 1
      ? authors[0]
      : `${authors.slice(0, -1).join(', ')} & ${authors[authors.length - 1]}`
  return `${names} (${pub.year}). ${pub.title}. ${pub.venue}.`
}

// ── Abstract Argumentation ────────────────────────────────────────────────────

export const D95: Publication = {
  shortLabel: 'Dung (1995)',
  authors: ['Dung, P.M.'],
  year: 1995,
  title:
    'On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games',
  venue: 'Artificial Intelligence, 77(2)',
  href: 'https://doi.org/10.1016/0004-3702(94)00041-X',
}

export const BCG18: Publication = {
  shortLabel: 'Baroni et al. (2018)',
  authors: ['Baroni, P.', 'Caminada, M.', 'Giacomin, M.'],
  year: 2018,
  title: 'Abstract Argumentation Frameworks and Their Semantics',
  venue: 'In: Handbook of Formal Argumentation, Vol. 1, Chapter 4. College Publications',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}

export const BBU20: Publication = {
  shortLabel: 'Baumann et al. (2020)',
  authors: ['Baumann, R.', 'Brewka, G.', 'Ulbricht, M.'],
  year: 2020,
  title:
    'Revisiting the Foundations of Abstract Argumentation - Semantics Based on Weak Admissibility and Weak Defense',
  venue:
    'In: The Thirty-Fourth AAAI Conference on Artificial Intelligence (AAAI 2020), pp. 2742-2749',
  href: 'https://doi.org/10.1609/aaai.v34i03.5661',
}

export const DRT20: Publication = {
  shortLabel: 'Dauphin et al. (2020)',
  authors: ['Dauphin, J.', 'Rienstra, T.', 'van der Torre, L.'],
  year: 2020,
  title: 'A Principle-Based Analysis of Weakly Admissible Semantics',
  venue: 'In: Computational Models of Argument – Proceedings of COMMA 2020, pp. 167–178. IOS Press',
  href: 'https://doi.org/10.3233/FAIA200502',
}

export const C06: Publication = {
  shortLabel: 'Caminada (2006)',
  authors: ['Caminada, M.'],
  year: 2006,
  title: 'Semi-Stable Semantics',
  venue: 'In: Computational Models of Argument – Proceedings of COMMA 2006, pp. 121–130',
  href: 'https://dl.acm.org/doi/abs/10.5555/1565233.1565248',
}

export const C07: Publication = {
  shortLabel: 'Caminada (2007)',
  authors: ['Caminada, M.'],
  year: 2007,
  title: 'Comparing Two Unique Extension Semantics for Formal Argumentation: Ideal and Eager',
  venue:
    'In: Proceedings of the 19th Belgian-Dutch Conference on Artificial Intelligence (BNAIC 2007), pp. 81–87',
  href: 'http://www.martincaminada.net/publications/ideal-eager.pdf',
}

export const C14: Publication = {
  shortLabel: 'Caminada (2014)',
  authors: ['Caminada, M.'],
  year: 2014,
  title: 'Strong Admissibility Revisited',
  venue: 'In: Computational Models of Argument – Proceedings of COMMA 2014, pp. 197–208',
  href: 'https://doi.org/10.3233/978-1-61499-436-7-197',
}

export const DMT07: Publication = {
  shortLabel: 'Dung et al. (2007)',
  authors: ['Dung, P.M.', 'Mancarella, P.', 'Toni, F.'],
  year: 2007,
  title: 'Computing Ideal Sceptical Argumentation',
  venue: 'Artificial Intelligence, 171(10–15), pp. 642–674',
  href: 'https://doi.org/10.1016/j.artint.2007.05.003',
}

export const XC18: Publication = {
  shortLabel: 'Xu & Cayrol (2018)',
  authors: ['Xu, Y.', 'Cayrol, C.'],
  year: 2018,
  title: 'Initial Sets in Abstract Argumentation Frameworks',
  venue: 'Journal of Applied Non-Classical Logics, 28(2–3), pp. 260–279',
  href: 'https://doi.org/10.1080/11663081.2018.1457252',
}

export const T22: Publication = {
  shortLabel: 'Thimm (2022)',
  authors: ['Thimm, M.'],
  year: 2022,
  title: 'Revisiting Initial Sets in Abstract Argumentation',
  venue: 'Argument & Computation, 13(3), pp. 325-360',
  href: 'https://doi.org/10.3233/AAC-210018',
}

export const BT22: Publication = {
  shortLabel: 'Bengel & Thimm (2022)',
  authors: ['Bengel, L.', 'Thimm, M.'],
  year: 2022,
  title: 'Serialisable Semantics for Abstract Argumentation',
  venue: 'In: Computational Models of Argument – Proceedings of COMMA 2022, pp. 80–91',
  href: 'https://doi.org/10.3233/FAIA220143',
}

export const V96: Publication = {
  shortLabel: 'Verheij (1996)',
  authors: ['Verheij, B.'],
  year: 1996,
  title: 'Two Approaches to Dialectical Argumentation: Admissible Sets and Argumentation Stages',
  venue: 'In: Proceedings of NAIC 1996, pp. 357–368',
  href: 'https://www.ai.rug.nl/~verheij/publications/pdf/cd96.pdf',
}

export const BGG05: Publication = {
  shortLabel: 'Baroni et al. (2005)',
  authors: ['Baroni, P.', 'Giacomin, M.', 'Guida, G.'],
  year: 2005,
  title: 'SCC-Recursiveness: A General Schema for Argumentation Semantics',
  venue: 'Artificial Intelligence, 168(1–2), pp. 162–210',
  href: 'https://doi.org/10.1016/j.artint.2005.05.006',
}

export const DG16: Publication = {
  shortLabel: 'Dvořák & Gaggl (2016)',
  authors: ['Dvořák, W.', 'Gaggl, S.A.'],
  year: 2016,
  title: 'Stage Semantics and the SCC-Recursive Schema for Argumentation Semantics',
  venue: 'Journal of Logic and Computation, 26(4), pp. 1149–1202',
  href: 'https://doi.org/10.1093/logcom/exu006',
}

export const DD17: Publication = {
  shortLabel: 'Dvořák & Dunne (2017)',
  authors: ['Dvořák, W.', 'Dunne, P.E.'],
  year: 2017,
  title: 'Computational Problems in Formal Argumentation and their Complexity',
  venue: 'Logics for New-Generation AI (FLAP), 4(8)',
  href: 'http://www.collegepublications.co.uk/downloads/ifcolog00017.pdf',
}

export const T23: Publication = {
  shortLabel: 'Thimm (2023)',
  authors: ['Thimm, M.'],
  year: 2023,
  title: 'On Undisputed Sets in Abstract Argumentation',
  venue:
    'In: Proceedings of the AAAI Conference on Artificial Intelligence (AAAI 2023), pp. 6550–6557',
  href: 'https://doi.org/10.1609/aaai.v37i5.25805',
}

export const CT19: Publication = {
  shortLabel: 'Cramer & van der Torre (2019)',
  authors: ['Cramer, M.', 'van der Torre, L.'],
  year: 2019,
  title: 'SCF2 - an Argumentation Semantics for Rational Human Judgments on Argument Acceptability',
  venue:
    'In: Proceedings of the 8th Workshop on Dynamics of Knowledge and Belief (DKB-2019) and the 7th Workshop KI & Kognition (KIK-2019), CEUR Workshop Proceedings, Vol. 2445, pp. 24–35',
  href: 'https://ceur-ws.org/Vol-2445/paper_3.pdf',
}

// ── Ranking Semantics ──────────────────────────────────────────────────

export const BDKM16: Publication = {
  shortLabel: 'Bonzon et al. (2016)',
  authors: ['Bonzon, E.', 'Delobelle, J.', 'Konieczny, S.', 'Maudet, N.'],
  year: 2016,
  title: 'A Comparative Study of Ranking-Based Semantics for Abstract Argumentation',
  venue:
    'In: Proceedings of the 30th AAAI Conference on Artificial Intelligence (AAAI 2016), pp. 914-920',
  href: 'https://doi.org/10.1609/aaai.v30i1.10116',
}

export const D17: Publication = {
  shortLabel: 'Delobelle (2017)',
  authors: ['Delobelle, J.'],
  year: 2017,
  title: 'Ranking-based Semantics for Abstract Argumentation',
  venue: "PhD Thesis, Université d'Artois",
  href: 'https://theses.hal.science/tel-01937279',
}

export const BH01: Publication = {
  shortLabel: 'Besnard & Hunter (2001)',
  authors: ['Besnard, P.', 'Hunter, A.'],
  year: 2001,
  title: 'A logic-based theory of deductive arguments',
  venue: 'Artificial Intelligence, 128(1–2), pp. 203–235',
  href: 'https://doi.org/10.1016/S0004-3702(01)00071-6',
}

export const PLZL14: Publication = {
  shortLabel: 'Pu et al. (2014)',
  authors: ['Pu, F.', 'Luo, J.', 'Zhang, Y.', 'Luo, G.'],
  year: 2014,
  title: 'Argument Ranking with Categoriser Function',
  venue:
    'In: Knowledge Science, Engineering and Management – KSEM 2014, LNCS 8793, pp. 290–301. Springer',
  href: 'https://doi.org/10.1007/978-3-319-12096-6_26',
}

export const PLZL15: Publication = {
  shortLabel: 'Pu et al. (2015)',
  authors: ['Pu, F.', 'Luo, J.', 'Zhang, Y.', 'Luo, G.'],
  year: 2015,
  title: 'Attacker and Defender Counting Approach for Abstract Argumentation',
  venue:
    'In: Proceedings of the 37th Annual Meeting of the Cognitive Science Society (CogSci 2015)',
  href: 'https://escholarship.org/uc/item/0r80h6vf',
}

export const AB13: Publication = {
  shortLabel: 'Amgoud & Ben-Naim (2013)',
  authors: ['Amgoud, L.', 'Ben-Naim, J.'],
  year: 2013,
  title: 'Ranking-Based Semantics for Argumentation Frameworks',
  venue: 'In: Scalable Uncertainty Management – SUM 2013, LNCS 8078, pp. 134–147. Springer',
  href: 'https://doi.org/10.1007/978-3-642-40381-1_11',
}

export const BT22b: Publication = {
  shortLabel: 'Blümel & Thimm (2022)',
  authors: ['Blümel, L.', 'Thimm, M.'],
  year: 2022,
  title: 'A Ranking Semantics for Abstract Argumentation Based on Serialisability',
  venue:
    'In: Computational Models of Argument – Proceedings of COMMA 2022, Frontiers in Artificial Intelligence and Applications, Vol. 353, pp. 104–115. IOS Press',
  href: 'https://doi.org/10.3233/FAIA220145',
}

export const MT08: Publication = {
  shortLabel: 'Matt & Toni (2008)',
  authors: ['Matt, P.-A.', 'Toni, F.'],
  year: 2008,
  title: 'A Game-Theoretic Measure of Argument Strength for Abstract Argumentation',
  venue: 'In: Logics in Artificial Intelligence – JELIA 2008, LNCS 5293, pp. 285–297. Springer',
  href: 'https://doi.org/10.1007/978-3-540-87803-2_24',
}

export const GM15: Publication = {
  shortLabel: 'Grossi & Modgil (2015)',
  authors: ['Grossi, D.', 'Modgil, S.'],
  year: 2015,
  title: 'On the Graded Acceptability of Arguments',
  venue:
    'In: Proceedings of the Twenty-Fourth International Joint Conference on Artificial Intelligence (IJCAI 2015), pp. 868–874. AAAI Press',
  href: 'http://ijcai.org/Abstract/15/127',
}

export const CL05b: Publication = {
  shortLabel: 'Cayrol & Lagasquie-Schiex (2005)',
  authors: ['Cayrol, C.', 'Lagasquie-Schiex, M.-C.'],
  year: 2005,
  title: 'Graduality in Argumentation',
  venue: 'Journal of Artificial Intelligence Research, 23, pp. 245–297',
  href: 'https://doi.org/10.1613/jair.1411',
}

export const LM11: Publication = {
  shortLabel: 'Leite & Martins (2011)',
  authors: ['Leite, J.', 'Martins, J.G.'],
  year: 2011,
  title: 'Social Abstract Argumentation',
  venue:
    'In: Proceedings of the 22nd International Joint Conference on Artificial Intelligence (IJCAI 2011), pp. 2287–2292',
  href: 'http://ijcai.org/Proceedings/11/Papers/381.pdf',
}

// ── Bipolar Argumentation ─────────────────────────────────────────────────────

export const CL05: Publication = {
  shortLabel: 'Cayrol & Lagasquie-Schiex (2005)',
  authors: ['Cayrol, C.', 'Lagasquie-Schiex, M.-C.'],
  year: 2005,
  title: 'On the Acceptability of Arguments in Bipolar Argumentation Frameworks',
  venue: 'ECSQARU 2005, LNCS 3571',
  href: 'https://doi.org/10.1007/11518655_33',
}

export const CL10: Publication = {
  shortLabel: 'Cayrol & Lagasquie-Schiex (2010)',
  authors: ['Cayrol, C.', 'Lagasquie-Schiex, M.-C.'],
  year: 2010,
  title: 'Coalitions of Arguments: A Tool for Handling Bipolar Argumentation Frameworks',
  venue: 'International Journal of Intelligent Systems, 25(1)',
  href: 'https://doi.org/10.1002/int.20389',
}

export const CCL21: Publication = {
  shortLabel: 'Cayrol et al. (2021)',
  authors: ['Cayrol, C.', 'Cohen, A.', 'Lagasquie-Schiex, M.-C.'],
  year: 2021,
  title: 'Higher-Order Interactions (Bipolar or Not) in Abstract Argumentation: A State of the Art',
  venue: 'In: Handbook of Formal Argumentation, Vol. 2, Chapter 1. College Publications',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
}

export const BGTV10: Publication = {
  shortLabel: 'Boella et al. (2010)',
  authors: ['Boella, G.', 'Gabbay, D.M.', 'van der Torre, L.W.N.', 'Villata, S.'],
  year: 2010,
  title: 'Support in Abstract Argumentation',
  venue:
    'In: Computational Models of Argument – Proceedings of COMMA 2010, Frontiers in Artificial Intelligence and Applications, Vol. 216, pp. 111–122. IOS Press',
  href: 'https://doi.org/10.3233/978-1-60750-619-5-111',
}

export const NR10: Publication = {
  shortLabel: 'Nouioua & Risch (2010)',
  authors: ['Nouioua, F.', 'Risch, V.'],
  year: 2010,
  title: 'Bipolar Argumentation Frameworks with Specialized Supports',
  venue:
    'In: 22nd IEEE International Conference on Tools with Artificial Intelligence (ICTAI 2010), Vol. 1, pp. 215–218. IEEE Computer Society',
  href: 'https://doi.org/10.1109/ICTAI.2010.37',
}

// ── Probabilistic Argumentation ───────────────────────────────────────────────

export const LON11: Publication = {
  shortLabel: 'Li et al. (2011)',
  authors: ['Li, H.', 'Oren, N.', 'Norman, T.J.'],
  year: 2011,
  title: 'Probabilistic Argumentation Frameworks',
  venue: 'TAFA 2011, LNAI 7132',
  href: 'https://link.springer.com/chapter/10.1007/978-3-642-29184-5_1',
}

export const H12: Publication = {
  shortLabel: 'Hunter (2012)',
  authors: ['Hunter, A.'],
  year: 2012,
  title: 'Some Foundations for Probabilistic Abstract Argumentation',
  venue:
    'In: Computational Models of Argument – Proceedings of COMMA 2012, Frontiers in Artificial Intelligence and Applications, Vol. 245, pp. 117–128. IOS Press',
  href: 'https://doi.org/10.3233/978-1-61499-111-3-117',
}

export const HPPRT21: Publication = {
  shortLabel: 'Hunter et al. (2021)',
  authors: ['Hunter, A.', 'Polberg, S.', 'Potyka, N.', 'Rienstra, T.', 'Thimm, M.'],
  year: 2021,
  title: 'Probabilistic Argumentation: A Survey',
  venue: 'In: Handbook of Formal Argumentation, Vol. 2, Chapter 7. College Publications',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
}

// ── Incomplete Argumentation ──────────────────────────────────────────────────

export const CDKLM07: Publication = {
  shortLabel: 'Coste-Marquis et al. (2007)',
  authors: [
    'Coste-Marquis, S.',
    'Devred, C.',
    'Konieczny, S.',
    'Lagasquie-Schiex, M.-C.',
    'Marquis, P.',
  ],
  year: 2007,
  title: "On the Merging of Dung's Argumentation Systems",
  venue: 'Artificial Intelligence, 171(10–15)',
  href: 'https://doi.org/10.1016/j.artint.2007.04.012',
}

export const BJNNR21: Publication = {
  shortLabel: 'Baumeister et al. (2021)',
  authors: ['Baumeister, D.', 'Järvisalo, M.', 'Neugebauer, D.', 'Niskanen, A.', 'Rothe, J.'],
  year: 2021,
  title: 'Acceptance in Incomplete Argumentation Frameworks',
  venue: 'Artificial Intelligence, 295, 103470',
  href: 'https://doi.org/10.1016/j.artint.2021.103470',
}

// ── Collective Attacks Argumentation ──────────────────────────────────────────

export const NP06: Publication = {
  shortLabel: 'Nielsen & Parsons (2006)',
  authors: ['Nielsen, S.H.', 'Parsons, S.'],
  year: 2006,
  title:
    "A Generalization of Dung's Abstract Framework for Argumentation: Arguing with Sets of Attacking Arguments",
  venue: 'ArgMAS 2006, LNCS 4766',
  href: 'https://doi.org/10.1007/978-3-540-75526-5_4',
}

export const BCDFP21: Publication = {
  shortLabel: 'Bikakis et al. (2021)',
  authors: ['Bikakis, A.', 'Cohen, A.', 'Dvořák, W.', 'Flouris, G.', 'Parsons, S.'],
  year: 2021,
  title: 'Joint Attacks and Accrual in Argumentation Frameworks',
  venue: 'In: Handbook of Formal Argumentation, Vol. 2, Chapter 2. College Publications',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
}

// ── Dialectical Argumentation ─────────────────────────────────────────────────

export const SW15: Publication = {
  shortLabel: 'Strass & Wallner (2015)',
  authors: ['Strass, H.', 'Wallner, J.P.'],
  year: 2015,
  title:
    'Analyzing the Computational Complexity of Abstract Dialectical Frameworks via Approximation Fixpoint Theory',
  venue: 'Artificial Intelligence, 226, pp. 34–74',
  href: 'https://doi.org/10.1016/j.artint.2015.05.003',
}

export const BW10: Publication = {
  shortLabel: 'Brewka & Woltran (2010)',
  authors: ['Brewka, G.', 'Woltran, S.'],
  year: 2010,
  title: 'Abstract Dialectical Frameworks',
  venue: 'KR 2010',
  href: 'https://cdn.aaai.org/ocs/1294/1294-7400-1-PB.pdf',
}

export const BESWW13: Publication = {
  shortLabel: 'Brewka et al. (2013)',
  authors: ['Brewka, G.', 'Ellmauthaler, S.', 'Strass, H.', 'Wallner, J.P.', 'Woltran, S.'],
  year: 2013,
  title: 'Abstract Dialectical Frameworks Revisited',
  venue: 'IJCAI 2013',
  href: 'https://www.ijcai.org/Proceedings/13/Papers/125.pdf',
}

export const BESWW18: Publication = {
  shortLabel: 'Brewka et al. (2018)',
  authors: ['Brewka, G.', 'Ellmauthaler, S.', 'Strass, H.', 'Wallner, J.P.', 'Woltran, S.'],
  year: 2018,
  title: 'Abstract Dialectical Frameworks',
  venue: 'In: Handbook of Formal Argumentation, Vol. 1, Chapter 5. College Publications',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}

// ── Assumption-based Argumentation ────────────────────────────────────────────

export const BDKT97: Publication = {
  shortLabel: 'Bondarenko et al. (1997)',
  authors: ['Bondarenko, A.', 'Dung, P.M.', 'Kowalski, R.A.', 'Toni, F.'],
  year: 1997,
  title: 'An Abstract, Argumentation-Theoretic Approach to Default Reasoning',
  venue: 'Artificial Intelligence, 93(1-2), pp. 63-101',
  href: 'https://doi.org/10.1016/S0004-3702(97)00015-5',
}

export const CFST18: Publication = {
  shortLabel: 'Čyras et al. (2018)',
  authors: ['Čyras, K.', 'Fan, X.', 'Schulz, C.', 'Toni, F.'],
  year: 2018,
  title: 'Assumption-Based Argumentation: Disputes, Explanations, Preferences',
  venue: 'In: Handbook of Formal Argumentation, Vol. 1, Chapter 7. College Publications',
  href: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}

export const BRU24: Publication = {
  shortLabel: 'Berthold et al. (2024)',
  authors: ['Berthold, M.', 'Rapberger, A.', 'Ulbricht, M.'],
  year: 2024,
  title: 'Capturing Non-flat Assumption-based Argumentation with Bipolar SETAFs',
  venue:
    'In: Proceedings of the 21st International Conference on Principles of Knowledge Representation and Reasoning (KR 2024), pp. 128-133',
  href: 'https://doi.org/10.24963/kr.2024/12',
}
