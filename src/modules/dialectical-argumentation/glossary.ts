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
  BESWW13,
  BESWW18,
  BT25,
  BW10,
  KVV21,
  KVV22,
  SW15,
} from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const dialecticalArgumentationGlossary: TooltipRegistry = {
  ADF: {
    label: 'ADF',
    title: 'Abstract Dialectical Framework',
    content: [
      'An abstract dialectical framework $D = (A, L, C)$ consists of a set of arguments $A$, a set of links $L \\subseteq A \\times A$, and for each argument $a \\in A$ an ',
      { ref: 'acceptanceCondition' },
      ' $C_a$ over its ',
      { ref: 'parents' },
      ' $par(a)$.',
    ],
    reference: BW10,
  },

  parents: {
    label: 'parents',
    title: 'Parents of an Argument',
    content: [
      'The parents of an argument $a$ in an ADF are the arguments that have a link to $a$, i.e., $par(a) = \\{ b \\in A \\mid (b,a) \\in L \\}$.',
    ],
    reference: BW10,
  },

  acceptanceCondition: {
    label: 'acceptance condition',
    title: 'Acceptance Condition',
    content: [
      'An acceptance condition $C_a$ for argument $a$ in an ADF is modelled as a propositional formula over the ',
      { ref: 'parents' },
      ' of $a$ that essentially determines when $a$ is accepted given the set of accepted parents.',
    ],
    reference: BW10,
  },

  threeValuedInterpretation: {
    label: 'three-valued interpretation',
    title: 'Three-Valued Interpretation',
    content: [
      'A three-valued interpretation $v: A \\mapsto \\{\\mathbf{t}, \\mathbf{f}, \\mathbf{u}\\}$ assigns to each argument $a$ in an ',
      { ref: 'ADF' },
      ' either the value $\\mathbf{t}$ (accepted), $\\mathbf{f}$ (rejected), or $\\mathbf{u}$ (undecided).',
    ],
    reference: BESWW13,
  },

  adfADM: {
    label: 'admissible',
    title: 'Admissibility (ADF)',
    content: [
      'A ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      ' is an admissible model iff $v \\leq_i \\Gamma_D(v)$ in the ',
      { ref: 'informationOrdering' },
      ', where $\\Gamma_D(v)$ is the ',
      { ref: 'operator', label: 'characteristic operator' },
      ' for ADFs.',
    ],
    reference: BESWW13,
  },

  adfCO: {
    label: 'complete',
    title: 'Complete Semantics (ADF)',
    content: [
      'A ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      ' is a complete model iff $v = \\Gamma_D(v)$, where $\\Gamma_D(v)$ is the ',
      { ref: 'operator', label: 'characteristic operator' },
      ' for ADFs.',
    ],
    reference: BESWW13,
  },

  adfGR: {
    label: 'grounded',
    title: 'Grounded Semantics (ADF)',
    content: [
      'The grounded model of an ',
      { ref: 'ADF' },
      ' is the least fixed point of the ',
      { ref: 'operator', label: 'characteristic operator' },
      ' $\\Gamma_D$.',
    ],
    reference: BESWW13,
  },

  adfPR: {
    label: 'preferred',
    title: 'Preferred Semantics (ADF)',
    content: [
      'A ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      ' is a preferred model iff $v$ is ',
      { ref: 'adfCO', label: 'complete' },
      " and there is no complete model $v'$ such that $v <_i v'$ in the ",
      { ref: 'informationOrdering' },
      '.',
    ],
    reference: BESWW13,
  },

  adfST: {
    label: 'stable',
    title: 'Stable Semantics (ADF)',
    content: [
      'A two-valued interpretation $v$ of an ',
      { ref: 'ADF' },
      ' is a stable model iff $v$ is a ',
      { ref: 'adfMOD2', label: 'two-valued model' },
      ' of $D$ and $v^{-1}(\\mathbf{t}) = v_{gr}^{-1}(\\mathbf{t})$, where $v_{gr}$ is the ',
      { ref: 'adfGR', label: 'grounded model' },
      ' of the ',
      { ref: 'reducedAdf', label: 'reduced ADF' },
      ' $D_{\\downarrow v}$.',
    ],
    reference: BESWW13,
  },

  reducedAdf: {
    label: 'reduced ADF',
    title: 'Reduced ADF',
    content: [
      'The reduced ADF $D_{\\downarrow v}$ of an ',
      { ref: 'ADF' },
      " $D$ under $v$ is defined as $D_{\\downarrow v} = (v^{-1}(\\mathbf{t}), L', C')$, where in each $C'_a$ the occurrences of arguments $b$ with $v(b) = \\mathbf{f}$ are substituted by $\\bot$.",
    ],
    reference: BESWW13,
  },

  operator: {
    label: 'characteristic operator',
    title: 'Characteristic Operator',
    content: [
      'The characteristic operator $\\Gamma_D$ of an ',
      { ref: 'ADF' },
      " $D$ is defined as $\\Gamma_D(v)(a) = \\sqcap \\{ v'(C_a) \\mid v' \\in [v]_2 \\}$ for all $a \\in A$. It maps $v$ to the ",
      { ref: 'consensus', label: 'consensus' },
      ' over its ',
      { ref: 'completions', label: 'two-valued completions' },
      '.',
    ],
    reference: BESWW18,
  },

  completions: {
    label: 'completions',
    title: 'Two-valued Completions',
    content: [
      'For some ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      " the two-valued completions are defined as $[v]_2 = \\{ v' \\mid v \\leq_i v'$ and $(v')^{-1}(\\textbf{u})=\\emptyset\\}$, where $\\leq_i$ is the ",
      { ref: 'informationOrdering' },
      '.',
    ],
    reference: BESWW18,
  },

  consensus: {
    label: 'consensus',
    title: 'Consensus Operator',
    content: [
      'The consensus operator $\\sqcap$ combines two ',
      { ref: 'threeValuedInterpretation', label: 'three-valued interpretations' },
      ' $v_1$ and $v_2$ into a new interpretation $v_3 = v_1 \\sqcap v_2$ such that for each $a \\in A$: $v_3(a) = \\mathbf{t}$ iff $v_1(a) = v_2(a) = \\mathbf{t}$, $v_3(a) = \\mathbf{f}$ iff $v_1(a) = v_2(a) = \\mathbf{f}$, and $v_3(a) = \\mathbf{u}$ otherwise.',
    ],
    reference: BESWW18,
  },

  adfCF: {
    label: 'conflict-free',
    title: 'Conflict-Freeness (ADF)',
    content: [
      'A ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      ' is a conflict-free model iff, for every argument $a \\in A$, $v(a) = \\mathbf{t}$ implies that $C_a$ is satisfied by at least one ',
      { ref: 'completions', label: 'two-valued completion' },
      ' of $v$, and $v(a) = \\mathbf{f}$ implies that $C_a$ is falsified by at least one two-valued completion of $v$.',
    ],
    reference: SW15,
  },

  adfNA: {
    label: 'naive',
    title: 'Naive Semantics (ADF)',
    content: [
      'A ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      ' is a naive model iff $v$ is ',
      { ref: 'adfCF', label: 'conflict-free' },
      " and there is no conflict-free model $v'$ such that $v <_i v'$ in the ",
      { ref: 'informationOrdering' },
      '.',
    ],
    reference: SW15,
  },

  informationOrdering: {
    label: 'information ordering',
    title: 'Information Ordering',
    content: [
      'The information ordering $\\leq_i$ on truth values is given by $\\mathbf{u} <_i \\mathbf{t}$ and $\\mathbf{u} <_i \\mathbf{f}$. For two ',
      { ref: 'threeValuedInterpretation', label: 'three-valued interpretations' },
      ' $v_1, v_2$ we have $v_1 \\leq_i v_2$ iff $v_1(a) \\leq_i v_2(a)$ for all $a \\in A$.',
    ],
    reference: BESWW13,
  },

  adfMOD2: {
    label: 'two-valued model',
    title: 'Two-Valued Model (ADF)',
    content: [
      'A two-valued interpretation $v: A \\mapsto \\{\\mathbf{t}, \\mathbf{f}\\}$ of an ',
      { ref: 'ADF' },
      ' is a (two-valued) model iff $v(a) = v(C_a)$ for all $a \\in A$.',
    ],
    reference: BW10,
  },

  adfMOD3: {
    label: 'three-valued model',
    title: 'Three-Valued Model (ADF)',
    content: [
      'A ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      " is a three-valued model iff $v(a) \\neq \\mathbf{u}$ implies $v(a) = v(C_a)$ for all $a \\in A$, where $v(C_a)$ is evaluated in Kleene's strong three-valued logic: negation switches $\\mathbf{t}$ and $\\mathbf{f}$ and leaves $\\mathbf{u}$ unchanged, a conjunction is $\\mathbf{t}$ if both conjuncts are $\\mathbf{t}$, $\\mathbf{f}$ if some conjunct is $\\mathbf{f}$, and $\\mathbf{u}$ otherwise; disjunction is dual.",
    ],
    reference: BESWW13,
  },

  adfSAD: {
    label: 'strongly admissible',
    title: 'Strong Admissibility (ADF)',
    content: [
      'A ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      ' is strongly admissible iff every $a$ with $v(a) \\neq \\mathbf{u}$ is strongly justified in $v$ w.r.t. $\\{a\\}$. An argument $a$ is strongly justified in $v$ w.r.t. a set $E \\subseteq A$ iff there is a set $P \\subseteq par(a) \\setminus E$ of ',
      { ref: 'parents' },
      ' such that $C_a$, with every $p \\in P$ replaced by its truth value $v(p)$, is a tautology if $v(a) = \\mathbf{t}$ or unsatisfiable if $v(a) = \\mathbf{f}$, and every $p \\in P$ is strongly justified in $v$ w.r.t. $E \\cup \\{p\\}$.',
    ],
    reference: KVV22,
  },

  adfS2V: {
    label: 'semi-two-valued',
    title: 'Semi-Two-Valued Semantics (ADF)',
    content: [
      'A ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      ' is a semi-two-valued model iff $v$ is ',
      { ref: 'adfCO', label: 'complete' },
      ' and $v^{-1}(\\mathbf{u})$ is $\\subseteq$-minimal among all $w^{-1}(\\mathbf{u})$ such that $w$ is a complete model.',
    ],
    reference: KVV21,
  },

  adfSST: {
    label: 'semi-stable',
    title: 'Semi-Stable Semantics (ADF)',
    content: [
      'A ',
      { ref: 'adfS2V', label: 'semi-two-valued model' },
      ' $v$ of an ',
      { ref: 'ADF' },
      ' is a semi-stable model iff $v^{-1}(\\mathbf{t}) = w^{-1}(\\mathbf{t})$, where $w$ is the ',
      { ref: 'adfGR', label: 'grounded model' },
      ' of the ',
      { ref: 'subReduct', label: 'sub-reduct' },
      ' $D^v$.',
    ],
    reference: KVV21,
  },

  subReduct: {
    label: 'sub-reduct',
    title: 'Sub-Reduct',
    content: [
      'The sub-reduct $D^v$ of an ',
      { ref: 'ADF' },
      ' $D$ under $v$ is defined as $D^v = (A^v, L^v, C^v)$ with $A^v = v^{-1}(\\mathbf{t}) \\cup v^{-1}(\\mathbf{u})$, $L^v = L \\cap (A^v \\times A^v)$, and where in each $C^v_a$ the occurrences of arguments $b$ with $v(b) = \\mathbf{f}$ are substituted by $\\bot$. Unlike the ',
      { ref: 'reducedAdf', label: 'reduced ADF' },
      ', it keeps the undecided arguments.',
    ],
    reference: KVV21,
  },

  adfIS: {
    label: 'initial',
    title: 'Initial Semantics (ADF)',
    content: [
      'A ',
      { ref: 'threeValuedInterpretation' },
      ' $v$ of an ',
      { ref: 'ADF' },
      ' is an initial model iff $v$ is ',
      { ref: 'adfADM', label: 'admissible' },
      " with $v \\neq v_\\mathbf{u}$ and there is no admissible model $v' \\neq v_\\mathbf{u}$ with $v' <_i v$ in the ",
      { ref: 'informationOrdering' },
      ', where $v_\\mathbf{u}$ maps every argument to $\\mathbf{u}$.',
    ],
    reference: BT25,
  },
}
