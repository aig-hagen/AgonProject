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
import {
  AB13,
  BBU20,
  BGG05,
  BH01,
  BT22,
  BT22b,
  C06,
  C07,
  C14,
  CL05b,
  D95,
  DD17,
  DG16,
  DMT07,
  GM15,
  LM11,
  MT08,
  PLZL14,
  T22,
  T23,
  V96,
  XC18,
} from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const abstractArgumentationGlossary: TooltipRegistry = {
  // General

  AF: {
    label: 'AF',
    title: 'Argumentation Framework (AF)',
    content: ['An argumentation framework $F = (A, R)$ consists of a finite set of arguments $A$ and an attack relation $R \\subseteq A \\times A$. We write $a \\to b$ if $(a,b) \\in R$, meaning $a$ attacks $b$.'],
    reference: D95,
  },

  charFunction: {
    label: 'characteristic function',
    title: 'Characteristic Function',
    content: ['The characteristic function $\\Delta_F: 2^A \\to 2^A$ maps each set $S$ to the arguments ', { ref: 'defends', label: 'defended' }, ' by $S$, i.e. $\\Delta_F(S) = \\{ a \\in A \\mid S$ defends $a \\}$.'],
    reference: D95,
  },

  scc: {
    label: 'strongly connected component',
    title: 'Strongly Connected Component',
    content: ['A strongly connected component (SCC) of an AF is a maximal subset of arguments $S \\subseteq A$ such that for every pair of arguments $a,b \\in S$ there is a path from $a$ to $b$.'],
  },

  sccRecursive: {
    label: 'SCC-recursive scheme',
    title: 'SCC-Recursiveness Scheme',
    content: ['The SCC-recursiveness scheme defines a ', { ref: 'semantics' }, ' by applying a base semantics $\\sigma$ locally to each ', { ref: 'scc' }, ' (SCC) of the framework, processing SCCs in topological order and restricting attacks from previously evaluated SCCs.'],
    reference: BGG05,
  },

  serialisation: {
    label: 'serialisation',
    title: 'Serialisable Semantics',
    content: ['For a serialisable semantics, the extensions can be computed by iteratively selecting ', { ref: 'IS' }, ' of the current AF and computing the ', { ref: 'reduct' }, ' until a predefined termination condition is met.'],
    reference: T22,
  },

  serialisationSequence: {
    label: 'serialisation sequence',
    title: 'Serialisation Sequence',
    content: ['A serialisation sequence is a sequence $(S_1, \\ldots, S_n)$ such that $S_1$ is an ', { ref: 'IS' }, ' of $F$ and every $S_{i}$ is an ', { ref: 'IS' }, ' of the ', { ref: 'reduct' }, ' $F^{S_1 \\cup \\ldots \\cup S_{i-1}}$. Every serialisation sequence induces an ', { ref: 'ADM' }, ' set.'],
    reference: BT22b,
  },

  // Serialisation selection functions
  selFn: {
    label: 'selection function',
    title: 'Selection Function $\\alpha$',
    content: ['TODO'],
    reference: T22,
  },
  selFnADM: {
    label: '$\\alpha_{\\mathsf{ad}}$',
    title: 'Admissible Selection Function $\\alpha_{\\mathsf{ad}}$',
    content: ['The ', { ref: 'selFn'}, ' $\\alpha_{\\mathsf{ad}}$ selects any ', { ref: 'IS' }, ') of the current ', { ref: 'AF' }, '.'],
    reference: T22,
  },
  selFnUC: {
    label: '$\\alpha_{\\mathsf{uc}}$',
    title: 'Unchallenged Selection Function $\\alpha_{\\mathsf{uc}}$',
    content: ['The ', { ref: 'selFn'}, ' $\\alpha_{\\mathsf{uc}}$ selects only ', { ref: 'unattackedInitial' }, ' and ', { ref: 'unchallengedInitial' }, ' initial sets of the current ', { ref: 'AF' }, '.'],
    reference: BT22,
  },
  selFnGR: {
    label: '$\\alpha_{\\mathsf{gr}}$',
    title: 'Grounded Selection Function $\\alpha_{\\mathsf{gr}}$',
    content: ['The ', { ref: 'selFn'}, ' $\\alpha_{\\mathsf{gr}}$ selects only ', { ref: 'unattackedInitial' }, ' initial sets of the current ', { ref: 'AF' }, '.'],
    reference: T22,
  },

  // Serialisation termination functions
  termFn: {
    label: 'termination function',
    title: 'Termination Function $\\beta$',
    content: ['TODO'],
    reference: T22,
  },
  termFnADM: {
    label: '$\\beta_{\\mathsf{ad}}$',
    title: 'Admissible Termination Function $\\beta_{\\mathsf{ad}}$',
    content: ['The termination function $\\beta_{\\mathsf{ad}}$ returns $\\mathsf{true}$ for every state.'],
    reference: T22,
  },
  termFnCO: {
    label: '$\\beta_{\\mathsf{co}}$',
    title: 'Complete Termination Function $\\beta_{\\mathsf{co}}$',
    content: ['The termination function $\\beta_{\\mathsf{co}}$ returns $\\mathsf{true}$ iff we have that ', { ref: 'unattackedInitial', label: '$\\mathsf{is}^{\\not\\leftarrow}(F)$' } ,'$=\\emptyset$.'],
    reference: T22,
  },
  termFnUC: {
    label: '$\\beta_{\\mathsf{uc}}$',
    title: 'Unchallenged Termination Function $\\beta_{\\mathsf{uc}}$',
    content: ['The termination function $\\beta_{\\mathsf{uc}}$ returns $\\mathsf{true}$ iff we have that ', { ref: 'unattackedInitial', label: '$\\mathsf{is}^{\\not\\leftarrow}(F)$' }, '$=$', { ref: 'unchallengedInitial', label: '$\\mathsf{is}^{\\not\\leftrightarrow}(F)$' } ,'$=\\emptyset$.'],
    reference: BT22,
  },
  termFnPR: {
    label: '$\\beta_{\\mathsf{pr}}$',
    title: 'Preferred Termination Function $\\beta_{\\mathsf{pr}}$',
    content: ['The termination function $\\beta_{\\mathsf{pr}}$ returns $\\mathsf{true}$ iff we have that ', { ref: 'IS', label: '$\\mathsf{is}(F)$' } ,'$=\\emptyset$.'],
    reference: T22,
  },
  termFnST: {
    label: '$\\beta_{\\mathsf{st}}$',
    title: 'Stable Termination Function $\\beta_{\\mathsf{st}}$',
    content: ['The termination function $\\beta_{\\mathsf{st}}$ returns $\\mathsf{true}$ iff we have $F = (\\emptyset, \\emptyset)$.'],
    reference: T22,
  },

  defends: {
    label: 'defends',
    title: 'Defence',
    content: ['A set of arguments $S$ defends an argument $a$ iff for every argument $b$ attacking $a$, there is some argument $c \\in S$ attacking $b$.'],
    reference: D95,
  },

  attackedSet: {
    label: '$S^+$',
    title: 'Attacked Arguments',
    content: ['The set of arguments attacked by $S$, i.e. $S^+ = \\{ a \\in A \\mid \\exists b \\in S: (b,a) \\in R \\}$'],
    reference: V96,
  },

  attackersSet: {
    label: '$S^-$',
    title: 'Attacking Arguments',
    content: ['The set of arguments attacking $S$, i.e. $S^- = \\{ a \\in A \\mid \\exists b \\in S: (a,b) \\in R \\}$'],
    reference: V96,
  },

  reduct: {
    label: 'reduct',
    title: '$S$-Reduct',
    content: ['The reduct of $F$ with respect to $S$ is the argumentation framework $F^S = (A \\setminus (S \\cup S^+), R \\cap (A\' \\times A\'))$.'],
    reference: BBU20,
  },

  semantics: {
    label: 'semantics',
    title: 'Extension-based Semantics',
    content: ['A semantics $\\sigma$ is a function that assigns to each ', { ref: 'AF' }, ' $F$ a set of extensions $\\sigma(F) \\subseteq 2^A$.'],
    reference: D95,
  },

  unattackedInitial: {
    label: 'unattacked',
    title: 'Unattacked Initial Sets',
    content: ['An ', { ref: 'IS', label: 'initial' }, ' set $S$ is called unattacked iff there is no argument $a \\in A$ such that $a$ attacks some argument in $S$.'],
    reference: T22,
  },

  unchallengedInitial: {
    label: 'unchallenged',
    title: 'Unchallenged Initial Sets',
    content: ['An ', { ref: 'IS', label: 'initial' }, ' set $S$ is called unchallenged iff ', { ref: 'attackersSet' } , '$\\neq \\emptyset$ and there is no other initial set $S\'$ that attacks $S$.'],
    reference: T22,
  },

  challengedInitial: {
    label: 'challenged',
    title: 'Challenged Initial Sets',
    content: ['An ', { ref: 'IS', label: 'initial' }, ' set $S$ is called challenged iff there is some other initial set $S\'$ that attacks $S$.'],
    reference: T22,
  },

  extension: {
    label: 'extension',
    title: 'Extension',
    content: ['An extension $E$ of an AF $F$ under a semantics $\\sigma$ is a set of arguments $E \\in \\sigma(F)$.'],
    reference: D95,
  },

  skepticalAcceptance: {
    label: 'skeptical',
    title: 'Skeptical Acceptance',
    content: ['An argument is skeptically accepted under a ', { ref: 'semantics' }, ' $\\sigma$ if it is contained in every ', { ref: 'extension', label: '$\\sigma$-extension' }, ' of $F$.'],
    reference: DD17,
  },

  credulousAcceptance: {
    label: 'credulous',
    title: 'Credulous Acceptance',
    content: ['An argument is credulously accepted under a ', { ref: 'semantics' }, ' $\\sigma$ if it is contained in at least one ', { ref: 'extension', label: '$\\sigma$-extension' }, ' of $F$.'],
    reference: DD17,
  },

  // Extension semantics
  CF: {
    label: 'conflict-free',
    title: 'Conflict-Freeness',
    content: ['A set of arguments $E$ is conflict-free iff for all arguments $a,b \\in E$ we have that $(a,b) \\notin R$.'],
    reference: D95,
  },
  ADM: {
    label: 'admissible',
    title: 'Admissibility',
    content: ['A set of arguments $E$ is admissible iff $E$ is ', { ref: 'CF' }, ' and ', { ref: 'defends' }, ' every argument $a \\in E$.'],
    reference: D95,
  },
  CO: {
      label: 'complete',
    title: 'Complete Semantics',
    content: ['A set of arguments $E$ is a complete extension iff $E$ is ', { ref: 'ADM' }, ' and for every argument $a \\in A$ ', { ref: 'defends', label: 'defended' }, ' by $E$, we have that $a \\in E$.'],
    reference: D95,
  },
  GR: {
    label: 'grounded',
    title: 'Grounded Semantics',
    content: ['A set of arguments $E$ is a grounded extension iff $E$ is ', { ref: 'CO' }, ' and $\\subseteq$-minimal. The unique grounded extension is the least fixpoint of the ', { ref: 'charFunction' }, ' $\\Delta_F(\\emptyset)$.'],
    reference: D95,
  },
  PR: {
    label: 'preferred',
    title: 'Preferred Semantics',
    content: ['A set of arguments $E$ is a preferred extension iff $E$ is ', { ref: 'CO' }, ' and $\\subseteq$-maximal.'],
    reference: D95,
  },
  ST: {
    label: 'stable',
    title: 'Stable Semantics',
    content: ['A set of arguments $E$ is a stable extension iff $E$ is ', { ref: 'CF' }, ' and we have that $E \\cup$ ', { ref: 'attackedSet', label: '$E^+$' }, ' $= A$.'],
    reference: D95,
  },
  SAD: {
    label: 'strongly admissible',
    title: 'Strong Admissibility',
    content: ['A set of arguments $E$ is strongly admissible iff $E=\\emptyset$ or each $a \\in E$ is ', { ref: 'defends', label: 'defended' }, ' by some strongly admissible $E\' \\subseteq E \\setminus \\{a\\}$.'],
    reference: C14,
  },
  SST: {
    label: 'semi-stable',
    title: 'Semi-Stable Semantics',
    content: ['A set of arguments $E$ is a semi-stable extension iff $E$ is ', { ref: 'CO' }, ' and $E \\cup $', { ref: 'attackedSet', label: '$E^+$' }, ' is $\\subseteq$-maximal.'],
    reference: C06,
  },
  ID: {
    label: 'ideal',
    title: 'Ideal Semantics',
    content: ['The ideal extension is the $\\subseteq$-maximal ', { ref: 'ADM' }, ' set in the intersection of all ', { ref: 'PR' }, ' extensions.'],
    reference: DMT07,
  },
  EA: {
    label: 'eager',
    title: 'Eager Semantics',
    content: ['The eager extension is the $\\subseteq$-maximal ', { ref: 'ADM' }, ' set in the intersection of all ', { ref: 'SST' }, ' extensions.'],
    reference: C07,
  },
  IS: {
    label: 'initial sets',
    title: 'Initial Sets',
    content: ['A set of arguments $E$ is initial iff $E$ is non-empty, ', { ref: 'ADM' }, ' and $\\subseteq$-minimal.'],
    reference: XC18,
  },
  UC: {
    label: 'unchallenged',
    title: 'Unchallenged Semantics',
    content: ['Unchallenged extensions are defined via ', { ref: 'serialisation' }, ' by exhaustively selecting only ', { ref: 'unattackedInitial' }, ' and ', { ref: 'unchallengedInitial' }, ' ' ,{ ref: 'IS' }, '.'],
    reference: BT22,
  },
  NA: {
    label: 'naive',
    title: 'Naive Semantics',
    content: ['A set of arguments $E$ is naive iff $E$ is a $\\subseteq$-maximal ', { ref: 'CF' }, ' set.'],
  },
  STG: {
    label: 'stage',
    title: 'Stage Semantics',
    content: ['A set of arguments $E$ is a stage extension iff $E$ is ', { ref: 'CF' }, ' and $E \\cup $', { ref: 'attackedSet', label: '$E^+$' }, ' is $\\subseteq$-maximal.'],
    reference: V96,
  },
  STG2: {
    label: 'stage2',
    title: 'Stage2 Semantics',
    content: ['The stage2 extensions are defined via the ', { ref: 'sccRecursive' }, ' with the ', { ref: 'STG' }, ' semantics as the base function.'],
    reference: DG16,
  },
  CF2: {
    label: 'CF2',
    title: 'CF2 Semantics',
    content: ['The CF2-extensions are defined via the ', { ref: 'sccRecursive' }, ' with the ', { ref: 'NA' }, ' semantics as the base function.'],
    reference: BGG05,
  },
  UD: {
    label: 'undisputed',
    title: 'Undisputed Sets',
    content: ['A set of arguments $E$ is undisputed iff $E$ is ', { ref: 'CF' }, ' in $F$ and the ', { ref: 'reduct' }, ' $F^E$ contains no non-empty ', { ref: 'ADM' }, ' set.'],
    reference: T23,
  },
  SUD: {
    label: 'strongly undisputed',
    title: 'Strongly Undisputed Sets',
    content: ['A set of arguments $E$ is strongly undisputed iff $E$ is ', { ref: 'CF' }, ' in $F$ and the ', { ref: 'reduct' }, ' $F^E$ contains no non-empty ', { ref: 'UD' }, ' set.'],
    reference: T23,
  },

  // Weak extension semantics
  WAD: {
    label: 'weakly admissible',
    title: 'Weak Admissibility',
    content: ['A set of arguments $E$ is weakly admissible iff $E$ is ', { ref: 'CF' }, ', and for any attacker $b \\in$ ', { ref: 'attackersSet', label: '$E^-$' },  ', we have that $b \\notin \\bigcup \\mathsf{wad}$', { ref: 'reduct', label: '$(F^E)$' } ,'.'],
    reference: BBU20,
  },

  WCO: {
    label: 'weakly complete',
    title: 'Weakly Complete Semantics',
    content: ['A set of arguments $E$ is a weakly complete extension iff $E$ is ', { ref: 'WAD' }, ' and for any $E\' \\subseteq A$ such that $E \\subseteq E\'$ and $E\'$ is ', { ref: 'weakDefence', label: 'weakly defended' }, ' by $E$, we have that $E\' \\subseteq E$.'],
    reference: BBU20,
  },

  weakDefence: {
    label: 'weak defence',
    title: 'Weak Defence',
    content: ['A set of arguments $E$ weakly defends the set $E\'$ iff for any attacker $b$ of $E\'$ we have, $E$ attacks $b$, or $b \\notin \\bigcup \\mathsf{wad}(F^E)$, $b \\notin E$ and $E\' \\subseteq E\'\' \\in \\mathsf{wad}(F)$.'],
    reference: BBU20,
  },

  WGR: {
    label: 'weakly grounded',
    title: 'Weakly Grounded Semantics',
    content: ['A set of arguments $E$ is a weakly grounded extension iff $E$ is a $\\subseteq$-minimal ', { ref: 'WCO' }, ' extension.'],
    reference: BBU20,
  },
  WPR: {
    label: 'weakly preferred',
    title: 'Weakly Preferred Semantics',
    content: ['A set of arguments $E$ is a weakly preferred extension iff $E$ is a $\\subseteq$-maximal ', { ref: 'WAD' }, ' set.'],
    reference: BBU20,
  },
}

export const abstractArgumentationRankingGlossary: TooltipRegistry = {
   rankingSemantics: {
    label: 'ranking semantics',
    title: 'Argument-ranking Semantics',
    content: ['An argument-ranking semantics $\\Theta$ is a function that associates to any ', { ref: 'AF' }, ' $F$ a ranking $\\succeq_F^\\Theta$ on $A$, where $\\succeq_F^\\Theta$ is a ', { ref: 'preorder' }, ' on $A$. $a \\succeq_F^\\Theta b$ means that $a$ is at least as acceptable as $b$.'],
    reference: AB13,
  },

  preorder: {
    label: 'preorder',
    title: 'Preorder',
    content: ['A preorder is a binary relation that is ', { ref: 'reflexive' }, ' and ', { ref: 'transitive' }, '.'],
  },

  reflexive: {
    label: 'reflexive',
    title: 'Reflexivity',
    content: ['A binary relation $\\succeq$ is reflexive iff for all $a$ we have that $a \\succeq a$.'],
  },

  transitive: {
    label: 'transitive',
    title: 'Transitivity',
    content: ['A binary relation $\\succeq$ is transitive iff for all $a,b,c$ we have that if $a \\succeq b$ and $b \\succeq c$, then $a \\succeq c$.'],
  },

  CAT: {
    label: 'categorizer',
    title: 'Categorizer Ranking',
    content: ['The categorizer ranking associates to any AF $F$ a ranking $\\succeq_F^\\mathrm{Cat}$ on $A$ such that $\\forall a,b \\in A: a \\succeq_F^\\mathrm{Cat} b$ iff $\\mathrm{Cat}_F(a) \\geq \\mathrm{Cat}_F(b)$, where $\\mathrm{Cat}_F$ is the ', { ref: 'categorizerFunction' }, '.'],
    reference: PLZL14,
  },

  categorizerFunction: {
    label: 'categorizer function',
    title: 'Categorizer Function',
    content: ['The categorizer function $\\mathrm{Cat}_F: A \\mapsto [0,1]$ is defined as $\\mathrm{Cat}_F(a) = 1$ if $a^-=\\emptyset$ and $\\mathrm{Cat}_F(a) = \\frac{1}{1 + \\sum_{b \\in a^-} \\mathrm{Cat}_F(b)}$ otherwise.'],
    reference: BH01,
  },

  BB: {
    label: 'burden-based',
    title: 'Burden-Based Ranking',
    content: ['The burden-based ranking associates to any AF $F$ a ranking $\\succeq_F^\\mathrm{BB}$ on $A$ such that $\\forall a,b \\in A: a \\succeq_F^\\mathrm{BB} b$ iff $\\mathrm{Bur}(b) \\succeq_{lex} \\mathrm{Bur}(a)$, where $\\mathrm{Bur}$ is the ', { ref: 'BurdenNumber' }, '.'],
    reference: AB13,
  },

  BurdenNumber: {
    label: 'burden number',
    title: 'Burden Number',
    content: ['The Burden number of $a$ is denoted $\\mathrm{Bur}(a) = \\langle \\mathrm{Bur}_0(a), \\mathrm{Bur}_1(a), \\ldots \\rangle$, where $\\mathrm{Bur}_0(a) = 1$ and $\\mathrm{Bur}_{i}(a) = 1 + \\sum_{b \\in a^-} \\frac{1}{\\mathrm{Bur}_{i-1}(b)}$ otherwise.'],
    reference: AB13,
  },

  SER: {
    label: 'serialisability-based',
    title: 'Serialisability-based Ranking',
    content: ['The Serialisability-based ranking associates to any AF $F$ a ranking $\\succeq_F^\\mathrm{Ser}$ on $A$ such that $\\forall a,b \\in A: a \\succeq_F^\\mathrm{Ser} b$ iff $\\mathrm{ser}_F(a) \\leq \\mathrm{ser}_F(b)$, where $\\mathrm{ser}_F(a)$ is the ', { ref: 'serialisationIndex' }, '.'],
    reference: BT22b,
  },

  serialisationIndex: {
    label: 'serialisation index',
    title: 'Serialisation Index',
    content: ['The serialisation index $\\mathrm{ser}_F(a)$ of an argument $a$ is defined as $\\mathrm{ser}_F(a) = \\mathrm{min}\\{ n \\mid (S_1, \\ldots, S_n)$ is a ', { ref: 'serialisationSequence' }, ' and $a \\in S_n \\}$.'],
    reference: BT22b,
  },

  CO: {
    label: 'counting',
    title: 'Counting Ranking',
    content: ['TODO'],
  },

  DB: {
    label: 'discussion-based',
    title: 'Discussion-Based Ranking',
    content: ['The discussion-based ranking associates to any AF $F$ a ranking $\\succeq_F^\\mathrm{DB}$ on $A$ such that $\\forall a,b \\in A: a \\succeq_F^\\mathrm{DB} b$ iff $\\mathrm{Dis}(b) \\succeq_{lex} \\mathrm{Dis}(a)$, where $\\mathrm{Dis}$ is the ', { ref: 'discussionCount' }, '.'],
    reference: AB13,
  },

  discussionCount: {
    label: 'discussion count',
    title: 'Discussion Count',
    content: ['The discussion count of an argument $a$ is the tuple $\\mathrm{Dis}(a) = \\langle -|\\mathrm{P}^F_1(a)|, |\\mathrm{P}^F_2(a)|, -|\\mathrm{P}^F_3(a)|, |\\mathrm{P}^F_4(a)|, \\ldots \\rangle$, where $\\mathrm{P}^F_i(a)$ is the set of all paths of length $i$ that end in $a$.'],
    reference: AB13,
  },

  IGD: {
    label: 'iterated graded defense',
    title: 'Iterated Graded Defense Ranking',
    content: ['TODO'],
    reference: GM15,
  },

  SAF: {
    label: 'social argumentation',
    title: 'Social Argumentation Ranking',
    content: ['The social argumentation ranking associates to any AF $F$ a ranking $\\succeq_F^\\mathrm{SA}$ on $A$ such that $\\forall a,b \\in A: a \\succeq_F^\\mathrm{SA} b$ iff $M_S(a) \\geq M_S(b)$, where $M_S$ is a ', { ref: 'socialModel' }, ' based on the ', { ref: 'simpleProductSemantics' }, ' $S$.'],
    reference: LM11,

  },

  socialModel: {
    label: 'social model',
    title: 'Social Model',
    content: ['A social model of an AF $F$ is a mapping $M_S : A \\mapsto L$ with $M_S(a) = \\tau(a) \\curlywedge \\neg \\{ M_S(b) \\mid b \\in a^- \\}$, where $\\langle L, \\tau, \\curlywedge, \\curlyvee, \\neg \\rangle$ is a ', { ref: 'saSemantics' }, '.'],
    reference: LM11,
  },

  saSemantics: {
    label: 'SA-semantics',
    title: 'Social Argumentation Semantics',
    content: ['A social argumentation semantics is defined by the tuple $\\langle L, \\tau, \\curlywedge, \\curlyvee, \\neg \\rangle$, where $L$ is a totally ordered set of labels, $\\tau$ is an attenuation factor, $\\curlywedge$ is a T-norm, $\\curlyvee$ is a T-CoNorm and $\\neg$ is a negation operator.'],
    reference: LM11,
  },

  simpleProductSemantics: {
    label: 'simple product semantics',
    title: 'Simple Product Semantics',
    content: ['The simple product semantics is defined by the tuple $SP_\\epsilon = \\langle [0,1], \\tau_\\epsilon, \\curlywedge, \\curlyvee, \\neg \\rangle$, where $\\tau_\\epsilon = \\frac{1}{1 + \\epsilon}$ and $\\epsilon > 0$ ensure the uniqueness, $x \\curlywedge y$ is the ', { ref: 'productTNorm' }, ' and $x \\curlyvee y$ is the ', { ref: 'probabilisticSumTCoNorm' }, '.'],
    reference: LM11,
  },

  productTNorm: {
    label: 'Product T-Norm',
    title: 'Product T-Norm',
    content: ['The product T-norm is defined as $x \\curlywedge y = x \\times y$ .'],
    reference: LM11,
  },

  probabilisticSumTCoNorm: {
    label: 'Probabilistic Sum T-CoNorm',
    title: 'Probabilistic Sum T-CoNorm',
    content: ['The probabilistic sum T-CoNorm is defined as $x \\curlyvee y = x + y - x \\times y$ .'],
    reference: LM11,
  },

  SB: {
    label: 'strategy-based',
    title: 'Strategy-Based Ranking',
    content: ['The strategy-based ranking associates to any AF $F$ a ranking $\\succeq_F^\\mathrm{SB}$ on $A$ such that $\\forall a,b \\in A: a \\succeq_F^\\mathrm{SB} b$ iff $\\mathrm{s}(a) \\geq \\mathrm{s}(b)$ where $\\mathrm{s}(a)$ is the strength of $a$ based on a ', { ref: 'strategyGame', label: 'two-person zero-sum game' }, '.'],
    reference: MT08,
  },

  strategyGame: {
    label: 'strategic game',
    title: 'Two-person zero-sum Strategic Game',
    content: ['TODO'],
    reference: MT08,
  },

  TU: {
    label: 'tuples',
    title: 'Tuples Ranking',
    content: ['The tuples ranking compares arguments based on the lengths of the attack and defense branches in the argumentation framework. Note that this ranking is only implemented for acyclic AFs.'],
    reference: CL05b,
  },
}
