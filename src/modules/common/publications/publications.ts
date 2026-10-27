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
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics', 'survey', 'handbook'],
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
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics', 'principles'],
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
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics', 'algorithms'],
  title: 'Computing Ideal Sceptical Argumentation',
  journal: 'Artificial Intelligence',
  volume: '171',
  number: '10–15',
  pages: '642–674',
  doi: '10.1016/j.artint.2007.05.003',
}

export const T22: Publication = {
  kind: 'article',
  authors: ['Thimm, M.'],
  year: 2022,
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics', 'complexity'],
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
  tags: ['AF', 'ADF', 'ABA', 'complexity', 'survey', 'handbook'],
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
  tags: ['AF', 'semantics'],
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
  tags: ['AF', 'semantics'],
  title: 'SCF2 - an Argumentation Semantics for Rational Human Judgments on Argument Acceptability',
  booktitle:
    'Proceedings of the 8th Workshop on Dynamics of Knowledge and Belief (DKB-2019) and the 7th Workshop KI & Kognition (KIK-2019)',
  series: 'CEUR-WS',
  seriesVolume: '2445',
  pages: '24–35',
  url: 'https://ceur-ws.org/Vol-2445/paper_3.pdf',
}

// ── Principles ────────────────────────────────────────────────────────────────

export const CDM05: Publication = {
  kind: 'inproceedings',
  authors: ['Coste-Marquis, S.', 'Devred, C.', 'Marquis, P.'],
  year: 2005,
  tags: ['AF', 'semantics', 'principles'],
  title: 'Prudent Semantics for Argumentation Frameworks',
  booktitle: '17th IEEE International Conference on Tools with Artificial Intelligence',
  acronym: 'ICTAI 2005',
  publisher: 'IEEE',
  doi: '10.1109/ICTAI.2005.103',
}

export const BG07: Publication = {
  kind: 'article',
  authors: ['Baroni, P.', 'Giacomin, M.'],
  year: 2007,
  tags: ['AF', 'principles'],
  title: 'On Principle-Based Evaluation of Extension-Based Argumentation Semantics',
  journal: 'Artificial Intelligence',
  volume: '171',
  number: '10–15',
  pages: '675–700',
  doi: '10.1016/j.artint.2007.04.004',
}

export const BCG11: Publication = {
  kind: 'article',
  authors: ['Baroni, P.', 'Caminada, M.', 'Giacomin, M.'],
  year: 2011,
  tags: ['AF', 'semantics', 'principles', 'survey'],
  title: 'An Introduction to Argumentation Semantics',
  journal: 'The Knowledge Engineering Review',
  volume: '26',
  number: '4',
  pages: '365–410',
  doi: '10.1017/S0269888911000166',
}

export const CCD12: Publication = {
  kind: 'article',
  authors: ['Caminada, M.W.A.', 'Carnielli, W.A.', 'Dunne, P.E.'],
  year: 2012,
  tags: ['AF', 'semantics', 'principles'],
  title: 'Semi-Stable Semantics',
  journal: 'Journal of Logic and Computation',
  volume: '22',
  number: '5',
  pages: '1207–1254',
  doi: '10.1093/logcom/exr033',
}

export const GW13: Publication = {
  kind: 'article',
  authors: ['Gaggl, S.A.', 'Woltran, S.'],
  year: 2013,
  tags: ['AF', 'semantics', 'principles'],
  title: 'The cf2 Argumentation Semantics Revisited',
  journal: 'Journal of Logic and Computation',
  volume: '23',
  number: '5',
  pages: '925–949',
  doi: '10.1093/logcom/exs011',
}

export const BBCGTV14: Publication = {
  kind: 'article',
  authors: [
    'Baroni, P.',
    'Boella, G.',
    'Cerutti, F.',
    'Giacomin, M.',
    'van der Torre, L.',
    'Villata, S.',
  ],
  year: 2014,
  tags: ['AF', 'principles'],
  title: 'On the Input/Output Behavior of Argumentation Frameworks',
  journal: 'Artificial Intelligence',
  volume: '217',
  pages: '144–197',
  doi: '10.1016/j.artint.2014.08.004',
}

export const DDLW15: Publication = {
  kind: 'article',
  authors: ['Dunne, P.E.', 'Dvořák, W.', 'Linsbichler, T.', 'Woltran, S.'],
  year: 2015,
  tags: ['AF', 'principles'],
  title: 'Characteristics of Multiple Viewpoints in Abstract Argumentation',
  journal: 'Artificial Intelligence',
  volume: '228',
  pages: '153–178',
  doi: '10.1016/j.artint.2015.07.006',
}

export const BLW16: Publication = {
  kind: 'inproceedings',
  authors: ['Baumann, R.', 'Linsbichler, T.', 'Woltran, S.'],
  year: 2016,
  tags: ['AF', 'principles'],
  title: 'Verifiability of Argumentation Semantics',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2016',
  series: 'FAIA',
  seriesVolume: '287',
  pages: '83–94',
  publisher: 'IOS Press',
  doi: '10.3233/978-1-61499-686-6-83',
}

export const XC16: Publication = {
  kind: 'inproceedings',
  authors: ['Xu, Y.', 'Cayrol, C.'],
  year: 2016,
  tags: ['AF', 'semantics'],
  title: 'Initial Sets in Abstract Argumentation Frameworks',
  booktitle: 'First Chinese Conference on Logic and Argumentation',
  acronym: 'CLAR 2016',
  series: 'CEUR-WS',
  seriesVolume: '1811',
  pages: '72–85',
  url: 'https://ceur-ws.org/Vol-1811/paper6.pdf',
}

export const TV18: Publication = {
  kind: 'chapter',
  authors: ['van der Torre, L.', 'Vesic, S.'],
  year: 2018,
  tags: ['AF', 'principles', 'handbook'],
  title: 'The Principle-Based Approach to Abstract Argumentation Semantics',
  booktitle: 'Handbook of Formal Argumentation',
  editors: ['Baroni, P.', 'Gabbay, D.', 'Giacomin, M.', 'van der Torre, L.'],
  volume: '1',
  chapter: '16',
  pages: '797–837',
  publisher: 'College Publications',
  url: 'https://www.collegepublications.co.uk/downloads/handbooks00003.pdf',
}

export const CD19: Publication = {
  kind: 'article',
  authors: ['Caminada, M.', 'Dunne, P.E.'],
  year: 2019,
  tags: ['AF', 'semantics'],
  title: 'Strong Admissibility Revisited: Theory and Applications',
  journal: 'Argument & Computation',
  volume: '10',
  number: '3',
  pages: '277–300',
  doi: '10.3233/AAC-190463',
}

export const BBU20a: Publication = {
  kind: 'inproceedings',
  authors: ['Baumann, R.', 'Brewka, G.', 'Ulbricht, M.'],
  year: 2020,
  tags: ['AF', 'semantics', 'principles'],
  title:
    'Comparing Weak Admissibility Semantics to their Dung-style Counterparts – Reduct, Modularization, and Strong Equivalence in Abstract Argumentation',
  booktitle:
    'Proceedings of the 17th International Conference on Principles of Knowledge Representation and Reasoning',
  acronym: 'KR 2020',
  pages: '79–88',
  publisher: 'ijcai.org',
  doi: '10.24963/kr.2020/9',
}

export const FU21: Publication = {
  kind: 'inproceedings',
  authors: ['Friese, T.', 'Ulbricht, M.'],
  year: 2021,
  tags: ['AF', 'principles'],
  title: 'On the Relationship of Modularity Notions in Abstract Argumentation',
  booktitle: 'Proceedings of the 19th International Workshop on Non-Monotonic Reasoning',
  acronym: 'NMR 2021',
  pages: '51–60',
  url: 'https://iccl.inf.tu-dresden.de/web/Inproceedings3408',
}

export const BBU22: Publication = {
  kind: 'article',
  authors: ['Baumann, R.', 'Brewka, G.', 'Ulbricht, M.'],
  year: 2022,
  tags: ['AF', 'semantics', 'principles'],
  title:
    'Shedding New Light on the Foundations of Abstract Argumentation: Modularization and Weak Admissibility',
  journal: 'Artificial Intelligence',
  volume: '310',
  articleNo: '103742',
  doi: '10.1016/j.artint.2022.103742',
}

export const BU22: Publication = {
  kind: 'inproceedings',
  authors: ['Blümel, L.', 'Ulbricht, M.'],
  year: 2022,
  tags: ['AF', 'semantics', 'principles'],
  title:
    'Defining Defense and Defeat in Abstract Argumentation From Scratch – A Generalizing Approach',
  booktitle:
    'Proceedings of the 19th International Conference on Principles of Knowledge Representation and Reasoning',
  acronym: 'KR 2022',
  pages: '63–72',
  publisher: 'ijcai.org',
  doi: '10.24963/kr.2022/7',
}

export const CT23: Publication = {
  kind: 'article',
  authors: ['Cramer, M.', 'van der Torre, L.'],
  year: 2023,
  tags: ['AF', 'semantics', 'principles'],
  title: 'An Argumentation Semantics for Rational Human Evaluation of Arguments',
  journal: 'Frontiers in Artificial Intelligence',
  volume: '6',
  articleNo: '1045663',
  doi: '10.3389/frai.2023.1045663',
}

export const BlT24: Publication = {
  kind: 'inproceedings',
  authors: ['Blümel, L.', 'Thimm, M.'],
  year: 2024,
  tags: ['AF', 'semantics', 'principles'],
  title: 'Revisiting Vacuous Reduct Semantics for Abstract Argumentation',
  booktitle: 'ECAI 2024',
  series: 'FAIA',
  seriesVolume: '392',
  pages: '3517–3524',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA240905',
}

export const BT26: Publication = {
  kind: 'preprint',
  authors: ['Bengel, L.', 'Thimm, M.'],
  year: 2026,
  tags: ['AF', 'ADF', 'semantics', 'principles'],
  title: 'Serialisability in Formal Argumentation',
  repository: 'Zenodo',
  doi: '10.5281/zenodo.19048256',
}

export const DT25: Publication = {
  kind: 'article',
  authors: ['Doukas, T.', 'Thimm, M.'],
  year: 2025,
  tags: ['AF', 'semantics', 'principles'],
  title: 'On the Realisability of Weak Argumentation Semantics',
  journal: 'Journal of Logic and Computation',
  volume: '35',
  number: '8',
  articleNo: 'exaf058',
  doi: '10.1093/logcom/exaf058',
}

// ── Ranking Semantics ──────────────────────────────────────────────────

export const BDKM16: Publication = {
  kind: 'inproceedings',
  authors: ['Bonzon, E.', 'Delobelle, J.', 'Konieczny, S.', 'Maudet, N.'],
  year: 2016,
  tags: ['AF', 'ranking', 'principles'],
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
  tags: ['AF', 'ranking'],
  title: 'Ranking-based Semantics for Abstract Argumentation',
  degree: 'PhD',
  school: "Université d'Artois",
  url: 'https://theses.hal.science/tel-01937279',
}

export const BH01: Publication = {
  kind: 'article',
  authors: ['Besnard, P.', 'Hunter, A.'],
  year: 2001,
  tags: ['ranking'],
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
  tags: ['AF', 'ranking'],
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
  tags: ['AF', 'ranking'],
  title: 'Attacker and Defender Counting Approach for Abstract Argumentation',
  booktitle: 'Proceedings of the 37th Annual Meeting of the Cognitive Science Society',
  acronym: 'CogSci 2015',
  url: 'https://escholarship.org/uc/item/0r80h6vf',
}

export const AB13: Publication = {
  kind: 'inproceedings',
  authors: ['Amgoud, L.', 'Ben-Naim, J.'],
  year: 2013,
  tags: ['AF', 'ranking', 'principles'],
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
  tags: ['AF', 'ranking'],
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
  tags: ['AF', 'ranking'],
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
  tags: ['AF', 'ranking'],
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
  tags: ['AF', 'ranking'],
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
  tags: ['AF', 'ranking'],
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
  tags: ['BAF', 'semantics'],
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
  tags: ['BAF', 'semantics'],
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
  tags: ['BAF', 'survey', 'handbook'],
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
  tags: ['BAF', 'semantics'],
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
  tags: ['BAF', 'semantics'],
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
  tags: ['PAF', 'semantics'],
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
  tags: ['PAF', 'semantics'],
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
  tags: ['PAF', 'survey', 'handbook'],
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
  tags: ['iAF'],
  title: "On the Merging of Dung's Argumentation Systems",
  journal: 'Artificial Intelligence',
  volume: '171',
  number: '10–15',
  pages: '730–753',
  doi: '10.1016/j.artint.2007.04.012',
}

export const BNRS18: Publication = {
  kind: 'article',
  authors: ['Baumeister, D.', 'Neugebauer, D.', 'Rothe, J.', 'Schadrack, H.'],
  year: 2018,
  tags: ['iAF', 'complexity'],
  title: 'Verification in Incomplete Argumentation Frameworks',
  journal: 'Artificial Intelligence',
  volume: '264',
  pages: '1–26',
  doi: '10.1016/j.artint.2018.08.001',
}

export const BJNNR21: Publication = {
  kind: 'article',
  authors: ['Baumeister, D.', 'Järvisalo, M.', 'Neugebauer, D.', 'Niskanen, A.', 'Rothe, J.'],
  year: 2021,
  tags: ['iAF', 'complexity'],
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
  tags: ['SetAF', 'semantics'],
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
  tags: ['SetAF', 'survey', 'handbook'],
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
  tags: ['ADF', 'complexity'],
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
  tags: ['ADF', 'semantics'],
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
  tags: ['ADF', 'semantics', 'complexity'],
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
  tags: ['ADF', 'survey', 'handbook'],
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
  tags: ['ADF', 'semantics'],
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
  tags: ['ADF', 'semantics'],
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
  tags: ['ADF', 'semantics', 'complexity'],
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
  tags: ['ABA', 'semantics'],
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
  tags: ['ABA', 'survey', 'handbook'],
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
  tags: ['ABA', 'SetAF', 'semantics'],
  title: 'Capturing Non-flat Assumption-based Argumentation with Bipolar SETAFs',
  booktitle:
    'Proceedings of the 21st International Conference on Principles of Knowledge Representation and Reasoning',
  acronym: 'KR 2024',
  pages: '128–133',
  publisher: 'ijcai.org',
  doi: '10.24963/kr.2024/12',
}

export const DKUW24: Publication = {
  kind: 'article',
  authors: ['Dvořák, W.', 'König, M.', 'Ulbricht, M.', 'Woltran, S.'],
  year: 2024,
  tags: ['SetAF', 'principles'],
  title:
    'Principles and their Computational Consequences for Argumentation Frameworks with Collective Attacks',
  journal: 'Journal of Artificial Intelligence Research',
  volume: '79',
  pages: '69–136',
  doi: '10.1613/jair.1.14879',
}

export const BKU24: Publication = {
  kind: 'inproceedings',
  authors: ['Blümel, L.', 'König, M.', 'Ulbricht, M.'],
  year: 2024,
  tags: ['ABA', 'SetAF', 'semantics'],
  title: 'Weak Admissibility for ABA via Abstract Set-Attacks',
  booktitle:
    'Proceedings of the 21st International Conference on Principles of Knowledge Representation and Reasoning',
  acronym: 'KR 2024',
  pages: '178–188',
  publisher: 'ijcai.org',
  doi: '10.24963/kr.2024/17',
}

export const KRU22: Publication = {
  kind: 'inproceedings',
  authors: ['König, M.', 'Rapberger, A.', 'Ulbricht, M.'],
  year: 2022,
  tags: ['ABA', 'SetAF', 'foundations'],
  title: 'Just a Matter of Perspective: Intertranslating Expressive Argumentation Formalisms',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2022',
  series: 'FAIA',
  seriesVolume: '353',
  pages: '212–223',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA220154',
}

export const BBR25: Publication = {
  kind: 'inproceedings',
  authors: ['Berthold, M.', 'Blümel, L.', 'Rapberger, A.'],
  year: 2025,
  tags: ['ABA', 'SetAF', 'semantics'],
  title: 'On Strong and Weak Admissibility in Non-Flat Assumption-Based Argumentation',
  booktitle:
    'Proceedings of the 22nd International Conference on Principles of Knowledge Representation and Reasoning',
  acronym: 'KR 2025',
  publisher: 'ijcai.org',
  doi: '10.24963/kr.2025/14',
}

// ── Computational Complexity ──────────────────────────────────────────────────

export const DDW13: Publication = {
  kind: 'article',
  authors: ['Dunne, P.E.', 'Dvořák, W.', 'Woltran, S.'],
  year: 2013,
  tags: ['AF', 'complexity'],
  title: 'Parametric Properties of Ideal Semantics',
  journal: 'Artificial Intelligence',
  volume: '202',
  pages: '1–28',
  doi: '10.1016/j.artint.2013.06.004',
}

export const KPW17: Publication = {
  kind: 'inproceedings',
  authors: ['Kröll, M.', 'Pichler, R.', 'Woltran, S.'],
  year: 2017,
  tags: ['AF', 'complexity', 'algorithms'],
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
  tags: ['AF', 'complexity', 'algorithms'],
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
  tags: ['AF', 'complexity'],
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
  tags: ['ADF', 'complexity'],
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
  tags: ['AF', 'complexity'],
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
  tags: ['ADF', 'complexity'],
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
  tags: ['ADF', 'complexity'],
  title: 'On the Complexity of Initial Models in Abstract Dialectical Frameworks',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2026',
  series: 'FAIA',
  seriesVolume: '428',
  pages: '113–124',
  publisher: 'IOS Press',
  doi: '10.3233/FAIA260805',
}

export const P94: Publication = {
  kind: 'book',
  authors: ['Papadimitriou, C.H.'],
  year: 1994,
  tags: ['foundations'],
  title: 'Computational Complexity',
  publisher: 'Addison-Wesley',
  url: 'https://openlibrary.org/books/OL1398106M',
}

export const C71: Publication = {
  kind: 'inproceedings',
  authors: ['Cook, S.A.'],
  year: 1971,
  tags: ['foundations'],
  title: 'The Complexity of Theorem-Proving Procedures',
  booktitle: 'Proceedings of the 3rd Annual ACM Symposium on Theory of Computing',
  acronym: 'STOC 1971',
  pages: '151–158',
  publisher: 'ACM',
  doi: '10.1145/800157.805047',
}

export const K72: Publication = {
  kind: 'chapter',
  authors: ['Karp, R.M.'],
  year: 1972,
  tags: ['foundations'],
  title: 'Reducibility among Combinatorial Problems',
  booktitle: 'Complexity of Computer Computations',
  editors: ['Miller, R.E.', 'Thatcher, J.W.'],
  pages: '85–103',
  publisher: 'Plenum Press',
  doi: '10.1007/978-1-4684-2001-2_9',
}

export const PY84: Publication = {
  kind: 'article',
  authors: ['Papadimitriou, C.H.', 'Yannakakis, M.'],
  year: 1984,
  tags: ['foundations'],
  title: 'The Complexity of Facets (and Some Facets of Complexity)',
  journal: 'Journal of Computer and System Sciences',
  volume: '28',
  number: '2',
  pages: '244–259',
  doi: '10.1016/0022-0000(84)90068-0',
}

export const S76: Publication = {
  kind: 'article',
  authors: ['Stockmeyer, L.J.'],
  year: 1976,
  tags: ['foundations'],
  title: 'The Polynomial-Time Hierarchy',
  journal: 'Theoretical Computer Science',
  volume: '3',
  number: '1',
  pages: '1–22',
  doi: '10.1016/0304-3975(76)90061-X',
}

export const W90: Publication = {
  kind: 'article',
  authors: ['Wagner, K.W.'],
  year: 1990,
  tags: ['foundations'],
  title: 'Bounded Query Classes',
  journal: 'SIAM Journal on Computing',
  volume: '19',
  number: '5',
  pages: '833–846',
  doi: '10.1137/0219058',
}

export const H89: Publication = {
  kind: 'article',
  authors: ['Hemachandra, L.A.'],
  year: 1989,
  tags: ['foundations'],
  title: 'The Strong Exponential Hierarchy Collapses',
  journal: 'Journal of Computer and System Sciences',
  volume: '39',
  number: '3',
  pages: '299–322',
  doi: '10.1016/0022-0000(89)90025-1',
}

export const BH91: Publication = {
  kind: 'article',
  authors: ['Buss, S.R.', 'Hay, L.'],
  year: 1991,
  tags: ['foundations'],
  title: 'On Truth-Table Reducibility to SAT',
  journal: 'Information and Computation',
  volume: '91',
  number: '1',
  pages: '86–102',
  doi: '10.1016/0890-5401(91)90075-D',
}

export const CK96: Publication = {
  kind: 'article',
  authors: ['Chang, R.', 'Kadin, J.'],
  year: 1996,
  tags: ['foundations'],
  title: 'The Boolean Hierarchy and the Polynomial Hierarchy: A Closer Connection',
  journal: 'SIAM Journal on Computing',
  volume: '25',
  number: '2',
  pages: '340–354',
  doi: '10.1137/S0097539790178069',
}

export const EG97: Publication = {
  kind: 'inproceedings',
  authors: ['Eiter, T.', 'Gottlob, G.'],
  year: 1997,
  tags: ['foundations'],
  title: 'The Complexity Class Θ₂ᵖ: Recent Results and Applications in AI and Modal Logic',
  booktitle: 'Fundamentals of Computation Theory',
  acronym: 'FCT 1997',
  series: 'LNCS',
  seriesVolume: '1279',
  pages: '1–18',
  publisher: 'Springer',
  doi: '10.1007/BFb0036168',
}

export const CG09: Publication = {
  kind: 'article',
  authors: ['Caminada, M.', 'Gabbay, D.M.'],
  year: 2009,
  tags: ['AF', 'semantics'],
  title: 'A Logical Account of Formal Argumentation',
  journal: 'Studia Logica',
  volume: '93',
  pages: '109–145',
  doi: '10.1007/s11225-009-9218-x',
}

export const TCR18: Publication = {
  kind: 'inproceedings',
  authors: ['Thimm, M.', 'Cerutti, F.', 'Rienstra, T.'],
  year: 2018,
  tags: ['AF', 'ranking'],
  title: 'Probabilistic Graded Semantics',
  booktitle: 'Computational Models of Argument',
  acronym: 'COMMA 2018',
  series: 'FAIA',
  seriesVolume: '305',
  pages: '369–380',
  publisher: 'IOS Press',
  doi: '10.3233/978-1-61499-906-5-369',
}
