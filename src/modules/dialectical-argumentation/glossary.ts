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
import { BESWW13, BESWW18, BW10, SW15 } from '@/modules/common/tooltip/publications'
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
      'A three-valued interpretation $v$ of an ',
      { ref: 'ADF' },
      ' is an admissible model iff $v \\leq_i \\Gamma_D(v)$, where $\\Gamma_D(v)$ is the ',
      { ref: 'operator', label: 'characteristic operator' },
      ' for ADFs.',
    ],
    reference: BW10,
  },

  adfCO: {
    label: 'complete',
    title: 'Complete Semantics (ADF)',
    content: [
      'A three-valued interpretation $v$ of an ',
      { ref: 'ADF' },
      ' is a complete model iff $v = \\Gamma_D(v)$, where $\\Gamma_D(v)$ is the ',
      { ref: 'operator', label: 'characteristic operator' },
      ' for ADFs.',
    ],
    reference: BW10,
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
    reference: BW10,
  },

  adfPR: {
    label: 'preferred',
    title: 'Preferred Semantics (ADF)',
    content: [
      'A three-valued interpretation $v$ of an ',
      { ref: 'ADF' },
      ' is a preferred model iff $v$ is ',
      { ref: 'adfCO', label: 'complete' },
      " and there is no complete model $v'$ such that $v <_i v'$.",
    ],
    reference: BW10,
  },

  adfST: {
    label: 'stable',
    title: 'Stable Semantics (ADF)',
    content: [
      'A three-valued interpretation $v$ of an ',
      { ref: 'ADF' },
      ' is a stable model iff $v^{-1}(\\mathbf{t}) = v_{gr}^{-1}(\\mathbf{t})$, where $v_{gr}$ is the ',
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
      " $D$ under $v$ is defined as $D_{\\downarrow v} = (v^{-1}(\\mathbf{t}), L', C')$, where in each $C'_a$ the occurences of arguments $b$ with $v(b) = \\mathbf{f}$ are substituted by $\\bot$.",
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
      " the two-valued completions are defined as $[v]_2 = \\{ v' \\mid v \\leq_i v'$ and $(v')^{-1}(\\textbf{u}=\\emptyset\\}$.",
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
      'A three-valued interpretation $v$ of an ',
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
      'A three-valued interpretation $v$ of an ',
      { ref: 'ADF' },
      ' is a naive model iff $v$ is ',
      { ref: 'adfCF', label: 'conflict-free' },
      " and there is no conflict-free model $v'$ such that $v <_i v'$.",
    ],
    reference: SW15,
  },
}
