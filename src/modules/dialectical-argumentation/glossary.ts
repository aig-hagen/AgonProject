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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { BESWW13, BESWW18, BW10 } from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const dialecticalArgumentationGlossary: TooltipRegistry = {
  ADF: {
    label: 'ADF',
    title: 'Abstract Dialectical Framework',
    content: ['An abstract dialectical framework $D = (A, L, C)$ consists of a set of arguments $A$, a set of links $L \\subseteq A \\times A$, and for each argument $a \\in A$ an ', { ref: 'acceptanceCondition' }, ' $C_a$ over its ', { ref: 'parents' }, ' $par(a)$.'],
    reference: BW10,
  },

  parents: {
    label: 'parents',
    title: 'Parents of an Argument',
    content: ['The parents of an argument $a$ in an ', { ref: 'ADF' }, ' are the arguments that have a link to $a$, i.e., $par(a) = \\{ b \\in A \\mid (b,a) \\in L \\}$.'],
    reference: BW10,
  },

  acceptanceCondition: {
    label: 'acceptance condition',
    title: 'Acceptance Condition',
    content: ['An acceptance condition $C_a$ for argument $a$ in an ', { ref: 'ADF' }, ' is modelled as a propositional formula over the ', { ref: 'parents' }, ' of $a$ that essentially determines when $a$ is accepted given the set of accepted parents.'],
    reference: BW10,
  },

  threeValuedInterpretation: {
    label: 'three-valued interpretation',
    title: 'Three-Valued Interpretation',
    content: ['A three-valued interpretation $v: A \\mapsto \\{\\mathbf{t}, \\mathbf{f}, \\mathbf{u}\\}$ assigns to each argument $a$ in an ', { ref: 'ADF' }, ' either the value $\\mathbf{t}$ (accepted), $\\mathbf{f}$ (rejected), or $\\mathbf{u}$ (undecided).'],
    reference: BESWW13,
  },

  adfAdmissible: {
    label: 'admissible',
    title: 'Admissibility (ADF)',
    content: ['TODO'],
    reference: BW10,
  },

  adfComplete: {
    label: 'complete',
    title: 'Complete Semantics (ADF)',
    content: ['TODO'],
    reference: BW10,
  },

  adfGrounded: {
    label: 'grounded',
    title: 'Grounded Semantics (ADF)',
    content: ['TODO'],
    reference: BW10,
  },

  adfPreferred: {
    label: 'preferred',
    title: 'Preferred Semantics (ADF)',
    content: ['TODO'],
    reference: BW10,
  },

  adfStable: {
    label: 'stable',
    title: 'Stable Semantics (ADF)',
    content: ['TODO'],
    reference: BESWW13,
  },

  operator: {
    label: 'characteristic operator',
    title: 'Characteristic Operator (ADF)',
    content: ['TODO'],
    reference: BESWW18,
  },
}
