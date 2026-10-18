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
import type { Publication } from '@/modules/common/publications/types'

// ── Abstract Argumentation ────────────────────────────────────────────────────

export const D95: Publication = {
  kind: 'article',
  authors: ['Dung, P.M.'],
  year: 1995,
  title:
    'On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games',
  journal: 'Artificial Intelligence',
  volume: '77',
  number: '2',
  pages: '321–357',
  doi: '10.1016/0004-3702(94)00041-X',
}

export const BCG18: Publication = {
  kind: 'chapter',
  authors: ['Baroni, P.', 'Caminada, M.', 'Giacomin, M.'],
  year: 2018,
  title: 'Abstract Argumentation Frameworks and Their Semantics',
  booktitle: 'Handbook of Formal Argumentation',
  editors: ['Baroni, P.', 'Gabbay, D.', 'Giacomin, M.', 'van der Torre, L.'],
  volume: '1',
  chapter: '4',
  pages: '159–236',
  publisher: 'College Publications',
  url: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}

export const BBU20: Publication = {
  kind: 'inproceedings',
  authors: ['Baumann, R.', 'Brewka, G.', 'Ulbricht, M.'],
  year: 2020,
  title:
    'Revisiting the Foundations of Abstract Argumentation - Semantics Based on Weak Admissibility and Weak Defense',
  booktitle: 'Proceedings of the 34th AAAI Conference on Artificial Intelligence',
  acronym: 'AAAI 2020',
  pages: '2742–2749',
  publisher: 'AAAI Press',
  doi: '10.1609/aaai.v34i03.5661',
}

export const DRT20: Publication = {
  kind: 'inproceedings',
  authors: ['Dauphin, J.', 'Rienstra, T.', 'van der Torre, L.'],
  year: 2020,
  title: 'A Principle-Based Analysis of Weakly Admissible Semantics',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2020',
  series: 'FAIA',
  seriesVolume: '326',
  pages: '167–178',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA200502',
}

export const C06: Publication = {
  kind: 'inproceedings',
  authors: ['Caminada, M.'],
  year: 2006,
  title: 'Semi-Stable Semantics',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2006',
  series: 'FAIA',
  seriesVolume: '144',
  pages: '121–130',
  publisher: 'IOS Press',
  url: 'https://dl.acm.org/doi/abs/10.5555/1565233.1565248',
}

export const C07: Publication = {
  kind: 'inproceedings',
  authors: ['Caminada, M.'],
  year: 2007,
  title: 'Comparing Two Unique Extension Semantics for Formal Argumentation: Ideal and Eager',
  booktitle: 'Proceedings of the 19th Belgian-Dutch Conference on Artificial Intelligence',
  acronym: 'BNAIC 2007',
  pages: '81–87',
  url: 'http://www.martincaminada.net/publications/ideal-eager.pdf',
}

export const C14: Publication = {
  kind: 'inproceedings',
  authors: ['Caminada, M.'],
  year: 2014,
  title: 'Strong Admissibility Revisited',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2014',
  series: 'FAIA',
  seriesVolume: '266',
  pages: '197–208',
  publisher: 'IOS Press',
  doi: '10.3233/978-1-61499-436-7-197',
}

export const DMT07: Publication = {
  kind: 'article',
  authors: ['Dung, P.M.', 'Mancarella, P.', 'Toni, F.'],
  year: 2007,
  title: 'Computing Ideal Sceptical Argumentation',
  journal: 'Artificial Intelligence',
  volume: '171',
  number: '10–15',
  pages: '642–674',
  doi: '10.1016/j.artint.2007.05.003',
}

export const XC18: Publication = {
  kind: 'article',
  authors: ['Xu, Y.', 'Cayrol, C.'],
  year: 2018,
  title: 'Initial Sets in Abstract Argumentation Frameworks',
  journal: 'Journal of Applied Non-Classical Logics',
  volume: '28',
  number: '2–3',
  pages: '260–279',
  doi: '10.1080/11663081.2018.1457252',
}

export const T22: Publication = {
  kind: 'article',
  authors: ['Thimm, M.'],
  year: 2022,
  title: 'Revisiting Initial Sets in Abstract Argumentation',
  journal: 'Argument & Computation',
  volume: '13',
  number: '3',
  pages: '325–360',
  doi: '10.3233/AAC-210018',
}

export const BT22: Publication = {
  kind: 'inproceedings',
  authors: ['Bengel, L.', 'Thimm, M.'],
  year: 2022,
  title: 'Serialisable Semantics for Abstract Argumentation',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2022',
  series: 'FAIA',
  seriesVolume: '353',
  pages: '80–91',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA220143',
}

export const V96: Publication = {
  kind: 'inproceedings',
  authors: ['Verheij, B.'],
  year: 1996,
  title: 'Two Approaches to Dialectical Argumentation: Admissible Sets and Argumentation Stages',
  booktitle: 'Proceedings of NAIC 1996',
  acronym: 'NAIC 1996',
  pages: '357–368',
  url: 'https://www.ai.rug.nl/~verheij/publications/pdf/cd96.pdf',
}

export const BGG05: Publication = {
  kind: 'article',
  authors: ['Baroni, P.', 'Giacomin, M.', 'Guida, G.'],
  year: 2005,
  title: 'SCC-Recursiveness: A General Schema for Argumentation Semantics',
  journal: 'Artificial Intelligence',
  volume: '168',
  number: '1–2',
  pages: '162–210',
  doi: '10.1016/j.artint.2005.05.006',
}

export const DG16: Publication = {
  kind: 'article',
  authors: ['Dvořák, W.', 'Gaggl, S.A.'],
  year: 2016,
  title: 'Stage Semantics and the SCC-Recursive Schema for Argumentation Semantics',
  journal: 'Journal of Logic and Computation',
  volume: '26',
  number: '4',
  pages: '1149–1202',
  doi: '10.1093/logcom/exu006',
}

export const DD18: Publication = {
  kind: 'chapter',
  authors: ['Dvořák, W.', 'Dunne, P.E.'],
  year: 2018,
  title: 'Computational Problems in Formal Argumentation and their Complexity',
  booktitle: 'Handbook of Formal Argumentation',
  editors: ['Baroni, P.', 'Gabbay, D.', 'Giacomin, M.', 'van der Torre, L.'],
  volume: '1',
  chapter: '13',
  pages: '631–688',
  publisher: 'College Publications',
  url: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}

export const T23: Publication = {
  kind: 'inproceedings',
  authors: ['Thimm, M.'],
  year: 2023,
  title: 'On Undisputed Sets in Abstract Argumentation',
  booktitle: 'Proceedings of the 37th AAAI Conference on Artificial Intelligence',
  acronym: 'AAAI 2023',
  pages: '6550–6557',
  publisher: 'AAAI Press',
  doi: '10.1609/aaai.v37i5.25805',
}

export const CT19: Publication = {
  kind: 'inproceedings',
  authors: ['Cramer, M.', 'van der Torre, L.'],
  year: 2019,
  title: 'SCF2 - an Argumentation Semantics for Rational Human Judgments on Argument Acceptability',
  booktitle:
    'Proceedings of the 8th Workshop on Dynamics of Knowledge and Belief (DKB-2019) and the 7th Workshop KI & Kognition (KIK-2019)',
  series: 'CEUR-WS',
  seriesVolume: '2445',
  pages: '24–35',
  url: 'https://ceur-ws.org/Vol-2445/paper_3.pdf',
}

// ── Ranking Semantics ──────────────────────────────────────────────────

export const BDKM16: Publication = {
  kind: 'inproceedings',
  authors: ['Bonzon, E.', 'Delobelle, J.', 'Konieczny, S.', 'Maudet, N.'],
  year: 2016,
  title: 'A Comparative Study of Ranking-Based Semantics for Abstract Argumentation',
  booktitle: 'Proceedings of the 30th AAAI Conference on Artificial Intelligence',
  acronym: 'AAAI 2016',
  pages: '914–920',
  publisher: 'AAAI Press',
  doi: '10.1609/aaai.v30i1.10116',
}

export const D17: Publication = {
  kind: 'thesis',
  authors: ['Delobelle, J.'],
  year: 2017,
  title: 'Ranking-based Semantics for Abstract Argumentation',
  degree: 'PhD',
  school: "Université d'Artois",
  url: 'https://theses.hal.science/tel-01937279',
}

export const BH01: Publication = {
  kind: 'article',
  authors: ['Besnard, P.', 'Hunter, A.'],
  year: 2001,
  title: 'A logic-based theory of deductive arguments',
  journal: 'Artificial Intelligence',
  volume: '128',
  number: '1–2',
  pages: '203–235',
  doi: '10.1016/S0004-3702(01)00071-6',
}

export const PLZL14: Publication = {
  kind: 'inproceedings',
  authors: ['Pu, F.', 'Luo, J.', 'Zhang, Y.', 'Luo, G.'],
  year: 2014,
  title: 'Argument Ranking with Categoriser Function',
  booktitle: 'Knowledge Science, Engineering and Management',
  acronym: 'KSEM 2014',
  series: 'LNCS',
  seriesVolume: '8793',
  pages: '290–301',
  publisher: 'Springer',
  doi: '10.1007/978-3-319-12096-6_26',
}

export const PLZL15: Publication = {
  kind: 'inproceedings',
  authors: ['Pu, F.', 'Luo, J.', 'Zhang, Y.', 'Luo, G.'],
  year: 2015,
  title: 'Attacker and Defender Counting Approach for Abstract Argumentation',
  booktitle: 'Proceedings of the 37th Annual Meeting of the Cognitive Science Society',
  acronym: 'CogSci 2015',
  url: 'https://escholarship.org/uc/item/0r80h6vf',
}

export const AB13: Publication = {
  kind: 'inproceedings',
  authors: ['Amgoud, L.', 'Ben-Naim, J.'],
  year: 2013,
  title: 'Ranking-Based Semantics for Argumentation Frameworks',
  booktitle: 'Scalable Uncertainty Management',
  acronym: 'SUM 2013',
  series: 'LNCS',
  seriesVolume: '8078',
  pages: '134–147',
  publisher: 'Springer',
  doi: '10.1007/978-3-642-40381-1_11',
}

export const BT22b: Publication = {
  kind: 'inproceedings',
  authors: ['Blümel, L.', 'Thimm, M.'],
  year: 2022,
  title: 'A Ranking Semantics for Abstract Argumentation Based on Serialisability',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2022',
  series: 'FAIA',
  seriesVolume: '353',
  pages: '104–115',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA220145',
}

export const MT08: Publication = {
  kind: 'inproceedings',
  authors: ['Matt, P.-A.', 'Toni, F.'],
  year: 2008,
  title: 'A Game-Theoretic Measure of Argument Strength for Abstract Argumentation',
  booktitle: 'Logics in Artificial Intelligence',
  acronym: 'JELIA 2008',
  series: 'LNCS',
  seriesVolume: '5293',
  pages: '285–297',
  publisher: 'Springer',
  doi: '10.1007/978-3-540-87803-2_24',
}

export const GM15: Publication = {
  kind: 'inproceedings',
  authors: ['Grossi, D.', 'Modgil, S.'],
  year: 2015,
  title: 'On the Graded Acceptability of Arguments',
  booktitle: 'Proceedings of the 24th International Joint Conference on Artificial Intelligence',
  acronym: 'IJCAI 2015',
  pages: '868–874',
  publisher: 'AAAI Press',
  url: 'http://ijcai.org/Abstract/15/127',
}

export const CL05b: Publication = {
  kind: 'article',
  authors: ['Cayrol, C.', 'Lagasquie-Schiex, M.-C.'],
  year: 2005,
  title: 'Graduality in Argumentation',
  journal: 'Journal of Artificial Intelligence Research',
  volume: '23',
  pages: '245–297',
  doi: '10.1613/jair.1411',
}

export const LM11: Publication = {
  kind: 'inproceedings',
  authors: ['Leite, J.', 'Martins, J.G.'],
  year: 2011,
  title: 'Social Abstract Argumentation',
  booktitle: 'Proceedings of the 22nd International Joint Conference on Artificial Intelligence',
  acronym: 'IJCAI 2011',
  pages: '2287–2292',
  publisher: 'AAAI Press',
  url: 'http://ijcai.org/Proceedings/11/Papers/381.pdf',
}

// ── Bipolar Argumentation ─────────────────────────────────────────────────────

export const CL05: Publication = {
  kind: 'inproceedings',
  authors: ['Cayrol, C.', 'Lagasquie-Schiex, M.-C.'],
  year: 2005,
  title: 'On the Acceptability of Arguments in Bipolar Argumentation Frameworks',
  booktitle: 'Symbolic and Quantitative Approaches to Reasoning with Uncertainty',
  acronym: 'ECSQARU 2005',
  series: 'LNCS',
  seriesVolume: '3571',
  pages: '378–389',
  publisher: 'Springer',
  doi: '10.1007/11518655_33',
}

export const CL10: Publication = {
  kind: 'article',
  authors: ['Cayrol, C.', 'Lagasquie-Schiex, M.-C.'],
  year: 2010,
  title: 'Coalitions of Arguments: A Tool for Handling Bipolar Argumentation Frameworks',
  journal: 'International Journal of Intelligent Systems',
  volume: '25',
  number: '1',
  pages: '83–109',
  doi: '10.1002/int.20389',
}

export const CCL21: Publication = {
  kind: 'chapter',
  authors: ['Cayrol, C.', 'Cohen, A.', 'Lagasquie-Schiex, M.-C.'],
  year: 2021,
  title: 'Higher-Order Interactions (Bipolar or Not) in Abstract Argumentation: A State of the Art',
  booktitle: 'Handbook of Formal Argumentation',
  editors: ['Gabbay, D.', 'Giacomin, M.', 'Simari, G.R.', 'Thimm, M.'],
  volume: '2',
  chapter: '1',
  pages: '15–130',
  publisher: 'College Publications',
  url: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
}

export const BGTV10: Publication = {
  kind: 'inproceedings',
  authors: ['Boella, G.', 'Gabbay, D.M.', 'van der Torre, L.W.N.', 'Villata, S.'],
  year: 2010,
  title: 'Support in Abstract Argumentation',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2010',
  series: 'FAIA',
  seriesVolume: '216',
  pages: '111–122',
  publisher: 'IOS Press',
  doi: '10.3233/978-1-60750-619-5-111',
}

export const NR10: Publication = {
  kind: 'inproceedings',
  authors: ['Nouioua, F.', 'Risch, V.'],
  year: 2010,
  title: 'Bipolar Argumentation Frameworks with Specialized Supports',
  booktitle:
    'Proceedings of the 22nd IEEE International Conference on Tools with Artificial Intelligence',
  acronym: 'ICTAI 2010',
  volume: '1',
  pages: '215–218',
  publisher: 'IEEE Computer Society',
  doi: '10.1109/ICTAI.2010.37',
}

// ── Probabilistic Argumentation ───────────────────────────────────────────────

export const LON11: Publication = {
  kind: 'inproceedings',
  authors: ['Li, H.', 'Oren, N.', 'Norman, T.J.'],
  year: 2011,
  title: 'Probabilistic Argumentation Frameworks',
  booktitle: 'Theory and Applications of Formal Argumentation',
  acronym: 'TAFA 2011',
  series: 'LNCS',
  seriesVolume: '7132',
  pages: '1–16',
  publisher: 'Springer',
  doi: '10.1007/978-3-642-29184-5_1',
}

export const H12: Publication = {
  kind: 'inproceedings',
  authors: ['Hunter, A.'],
  year: 2012,
  title: 'Some Foundations for Probabilistic Abstract Argumentation',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2012',
  series: 'FAIA',
  seriesVolume: '245',
  pages: '117–128',
  publisher: 'IOS Press',
  doi: '10.3233/978-1-61499-111-3-117',
}

export const HPPRT21: Publication = {
  kind: 'chapter',
  authors: ['Hunter, A.', 'Polberg, S.', 'Potyka, N.', 'Rienstra, T.', 'Thimm, M.'],
  year: 2021,
  title: 'Probabilistic Argumentation: A Survey',
  booktitle: 'Handbook of Formal Argumentation',
  editors: ['Gabbay, D.', 'Giacomin, M.', 'Simari, G.R.', 'Thimm, M.'],
  volume: '2',
  chapter: '7',
  pages: '397–444',
  publisher: 'College Publications',
  url: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
}

// ── Incomplete Argumentation ──────────────────────────────────────────────────

export const CDKLM07: Publication = {
  kind: 'article',
  authors: [
    'Coste-Marquis, S.',
    'Devred, C.',
    'Konieczny, S.',
    'Lagasquie-Schiex, M.-C.',
    'Marquis, P.',
  ],
  year: 2007,
  title: "On the Merging of Dung's Argumentation Systems",
  journal: 'Artificial Intelligence',
  volume: '171',
  number: '10–15',
  pages: '730–753',
  doi: '10.1016/j.artint.2007.04.012',
}

export const BJNNR21: Publication = {
  kind: 'article',
  authors: ['Baumeister, D.', 'Järvisalo, M.', 'Neugebauer, D.', 'Niskanen, A.', 'Rothe, J.'],
  year: 2021,
  title: 'Acceptance in Incomplete Argumentation Frameworks',
  journal: 'Artificial Intelligence',
  volume: '295',
  articleNo: '103470',
  doi: '10.1016/j.artint.2021.103470',
}

// ── Collective Attacks Argumentation ──────────────────────────────────────────

export const NP06: Publication = {
  kind: 'inproceedings',
  authors: ['Nielsen, S.H.', 'Parsons, S.'],
  year: 2006,
  title:
    "A Generalization of Dung's Abstract Framework for Argumentation: Arguing with Sets of Attacking Arguments",
  booktitle: 'Argumentation in Multi-Agent Systems',
  acronym: 'ArgMAS 2006',
  series: 'LNCS',
  seriesVolume: '4766',
  pages: '54–73',
  publisher: 'Springer',
  doi: '10.1007/978-3-540-75526-5_4',
}

export const BCDFP21: Publication = {
  kind: 'chapter',
  authors: ['Bikakis, A.', 'Cohen, A.', 'Dvořák, W.', 'Flouris, G.', 'Parsons, S.'],
  year: 2021,
  title: 'Joint Attacks and Accrual in Argumentation Frameworks',
  booktitle: 'Handbook of Formal Argumentation',
  editors: ['Gabbay, D.', 'Giacomin, M.', 'Simari, G.R.', 'Thimm, M.'],
  volume: '2',
  chapter: '2',
  pages: '131–210',
  publisher: 'College Publications',
  url: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
}

// ── Dialectical Argumentation ─────────────────────────────────────────────────

export const SW15: Publication = {
  kind: 'article',
  authors: ['Strass, H.', 'Wallner, J.P.'],
  year: 2015,
  title:
    'Analyzing the Computational Complexity of Abstract Dialectical Frameworks via Approximation Fixpoint Theory',
  journal: 'Artificial Intelligence',
  volume: '226',
  pages: '34–74',
  doi: '10.1016/j.artint.2015.05.003',
}

export const BW10: Publication = {
  kind: 'inproceedings',
  authors: ['Brewka, G.', 'Woltran, S.'],
  year: 2010,
  title: 'Abstract Dialectical Frameworks',
  booktitle:
    'Proceedings of the 12th International Conference on Principles of Knowledge Representation and Reasoning',
  acronym: 'KR 2010',
  pages: '102–111',
  publisher: 'AAAI Press',
  url: 'https://cdn.aaai.org/ocs/1294/1294-7400-1-PB.pdf',
}

export const BESWW13: Publication = {
  kind: 'inproceedings',
  authors: ['Brewka, G.', 'Ellmauthaler, S.', 'Strass, H.', 'Wallner, J.P.', 'Woltran, S.'],
  year: 2013,
  title: 'Abstract Dialectical Frameworks Revisited',
  booktitle: 'Proceedings of the 23rd International Joint Conference on Artificial Intelligence',
  acronym: 'IJCAI 2013',
  pages: '803–809',
  publisher: 'AAAI Press',
  url: 'https://www.ijcai.org/Proceedings/13/Papers/125.pdf',
}

export const BESWW18: Publication = {
  kind: 'chapter',
  authors: ['Brewka, G.', 'Ellmauthaler, S.', 'Strass, H.', 'Wallner, J.P.', 'Woltran, S.'],
  year: 2018,
  title: 'Abstract Dialectical Frameworks',
  booktitle: 'Handbook of Formal Argumentation',
  editors: ['Baroni, P.', 'Gabbay, D.', 'Giacomin, M.', 'van der Torre, L.'],
  volume: '1',
  chapter: '5',
  pages: '237–286',
  publisher: 'College Publications',
  url: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}

export const KVV21: Publication = {
  kind: 'inproceedings',
  authors: ['Keshavarzi Zafarghandi, A.', 'Verbrugge, R.', 'Verheij, B.'],
  year: 2021,
  title: 'Semi-Stable Semantics for Abstract Dialectical Frameworks',
  booktitle:
    'Proceedings of the 18th International Conference on Principles of Knowledge Representation and Reasoning',
  acronym: 'KR 2021',
  pages: '422–431',
  publisher: 'ijcai.org',
  doi: '10.24963/kr.2021/40',
}

export const KVV22: Publication = {
  kind: 'article',
  authors: ['Keshavarzi Zafarghandi, A.', 'Verbrugge, R.', 'Verheij, B.'],
  year: 2022,
  title: 'Strong Admissibility for Abstract Dialectical Frameworks',
  journal: 'Argument & Computation',
  volume: '13',
  number: '3',
  pages: '249–289',
  doi: '10.3233/AAC-210002',
}

export const BT25: Publication = {
  kind: 'inproceedings',
  authors: ['Bengel, L.', 'Thimm, M.'],
  year: 2025,
  title: 'Initial Models and Serialisability in Abstract Dialectical Frameworks',
  booktitle: 'Proceedings of the 34th International Joint Conference on Artificial Intelligence',
  acronym: 'IJCAI 2025',
  pages: '4365–4373',
  publisher: 'ijcai.org',
  doi: '10.24963/ijcai.2025/486',
}

// ── Assumption-based Argumentation ────────────────────────────────────────────

export const BDKT97: Publication = {
  kind: 'article',
  authors: ['Bondarenko, A.', 'Dung, P.M.', 'Kowalski, R.A.', 'Toni, F.'],
  year: 1997,
  title: 'An Abstract, Argumentation-Theoretic Approach to Default Reasoning',
  journal: 'Artificial Intelligence',
  volume: '93',
  number: '1–2',
  pages: '63–101',
  doi: '10.1016/S0004-3702(97)00015-5',
}

export const CFST18: Publication = {
  kind: 'chapter',
  authors: ['Čyras, K.', 'Fan, X.', 'Schulz, C.', 'Toni, F.'],
  year: 2018,
  title: 'Assumption-Based Argumentation: Disputes, Explanations, Preferences',
  booktitle: 'Handbook of Formal Argumentation',
  editors: ['Baroni, P.', 'Gabbay, D.', 'Giacomin, M.', 'van der Torre, L.'],
  volume: '1',
  chapter: '7',
  pages: '365–408',
  publisher: 'College Publications',
  url: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}

export const BRU24: Publication = {
  kind: 'inproceedings',
  authors: ['Berthold, M.', 'Rapberger, A.', 'Ulbricht, M.'],
  year: 2024,
  title: 'Capturing Non-flat Assumption-based Argumentation with Bipolar SETAFs',
  booktitle:
    'Proceedings of the 21st International Conference on Principles of Knowledge Representation and Reasoning',
  acronym: 'KR 2024',
  pages: '128–133',
  publisher: 'ijcai.org',
  doi: '10.24963/kr.2024/12',
}

// ── Computational Complexity ──────────────────────────────────────────────────

export const DVW11: Publication = {
  kind: 'inproceedings',
  authors: ['Dvořák, W.', 'Dunne, P.E.', 'Woltran, S.'],
  year: 2011,
  title: 'Parametric Properties of Ideal Semantics',
  booktitle: 'Proceedings of the 22nd International Joint Conference on Artificial Intelligence',
  acronym: 'IJCAI 2011',
  pages: '851–856',
  publisher: 'AAAI Press',
  url: 'https://www.ijcai.org/Proceedings/11/Papers/148.pdf',
}

export const KPW17: Publication = {
  kind: 'inproceedings',
  authors: ['Kröll, M.', 'Pichler, R.', 'Woltran, S.'],
  year: 2017,
  title: 'On the Complexity of Enumerating the Extensions of Abstract Argumentation Frameworks',
  booktitle: 'Proceedings of the 26th International Joint Conference on Artificial Intelligence',
  acronym: 'IJCAI 2017',
  pages: '1145–1152',
  publisher: 'ijcai.org',
  doi: '10.24963/ijcai.2017/159',
}

export const DW20: Publication = {
  kind: 'inproceedings',
  authors: ['Dvořák, W.', 'Wallner, J.P.'],
  year: 2020,
  title: 'Computing Strongly Admissible Sets',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2020',
  series: 'FAIA',
  seriesVolume: '326',
  pages: '179–190',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA200503',
}

export const DUW22: Publication = {
  kind: 'article',
  authors: ['Dvořák, W.', 'Ulbricht, M.', 'Woltran, S.'],
  year: 2022,
  title:
    'Recursion in Abstract Argumentation is Hard — On the Complexity of Semantics Based on Weak Admissibility',
  journal: 'Journal of Artificial Intelligence Research',
  volume: '74',
  pages: '1403–1447',
  doi: '10.1613/jair.1.13603',
}

export const KDVV22: Publication = {
  kind: 'inproceedings',
  authors: ['Keshavarzi Zafarghandi, A.', 'Dvořák, W.', 'Verbrugge, R.', 'Verheij, B.'],
  year: 2022,
  title: 'How Complex Is the Strong Admissibility Semantics for Abstract Dialectical Frameworks?',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2022',
  series: 'FAIA',
  seriesVolume: '353',
  pages: '200–211',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA220153',
}

export const FHM24: Publication = {
  kind: 'article',
  authors: ['Fichte, J.K.', 'Hecher, M.', 'Meier, A.'],
  year: 2024,
  title: 'Counting Complexity for Reasoning in Abstract Argumentation',
  journal: 'Journal of Artificial Intelligence Research',
  volume: '80',
  pages: '805–834',
  doi: '10.1613/jair.1.16210',
}

export const KW24: Publication = {
  kind: 'inproceedings',
  authors: ['Keshavarzi Zafarghandi, A.', 'Wallner, J.P.'],
  year: 2024,
  title: 'Complexity of Semi-Stable Semantics in Abstract Dialectical Frameworks',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2024',
  series: 'FAIA',
  seriesVolume: '388',
  pages: '109–120',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA240314',
}

export const SW26: Publication = {
  kind: 'inproceedings',
  authors: ['Strass, H.', 'Wallner, J.P.'],
  year: 2026,
  title: 'On the Complexity of Initial Models in Abstract Dialectical Frameworks',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2026',
  series: 'FAIA',
  seriesVolume: '428',
  pages: '113–124',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA260805',
}
