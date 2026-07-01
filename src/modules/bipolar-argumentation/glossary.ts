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
import { CL05, CL10 } from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const bipolarArgumentationGlossary: TooltipRegistry = {
  BAF: {
    label: 'BAF',
    title: 'Bipolar Argumentation Framework (BAF)',
    content: ['A bipolar argumentation framework $B = (A, R, S)$ extends the classical ', { ref: 'AF' }, ' with a support relation $S \\subseteq A \\times A$.'],
    reference: CL05,
  },

  deductiveSupport: {
    label: 'deductive support',
    title: 'Deductive Support',
    content: ['Under the deductive support interpretation, an argument $a$ supports an argument $b$ if the acceptance of $a$ logically implies the acceptance of $b$.'],
  },

  necessarySupport: {
    label: 'necessary support',
    title: 'Necessary Support',
    content: ['Under the necessary support interpretation, an argument $a$ supports an argument $b$ if the acceptance of $a$ is a necessary condition for the acceptance of $b$.'],
  },

  coalition: {
    label: 'coalition',
    title: 'Coalition of Arguments',
    content: ['A coalition of arguments $S$ is a ', { ref: 'CF' }, ' set of arguments, connected via the support relation and $\\subseteq$-maximal with this property.'],
    reference: CL10,
  },

  coalitionGraph: {
    label: 'coalition graph',
    title: 'Coalition Graph',
    content: ['The coalition graph $F_B^{\\mathsf{Coal}}$ for some ', { ref: 'BAF' }, ' B is defined as the ', { ref: 'AF'}, ' $F^{\\mathsf{Coal}}_B = (\\mathsf{Coal}(B), R\')$, where $\\mathsf{Coal}(B)$ is the ', { ref: 'coalition', label: 'set of coalitions'},' of $B$ and we have $(S_1, S_2) \\in R\'$ iff there are $a \\in S_1$ and $b\\in S_2$ with $(a,b)\\in R$, for all $S_1,S_2 \\in \\mathsf{Coal}(B)$.'],
    reference: CL10,
  },

  // ── None Interpretation ──────────────────────────────────────────────────────

  'b-cf': {
    label: 'conflict-free',
    title: 'Conflict-Free (BAF)',
    content: ['TODO'],
  },

  'b-coh': {
    label: 'coherent',
    title: 'Coherent',
    content: ['TODO'],
  },

  'b-ad': {
    label: 'coherent admissible',
    title: 'Coherent Admissible',
    content: ['TODO'],
  },

  'b-coal-ad': {
    label: 'coalition-admissible',
    title: 'Coalition-Admissible Semantics',
    content: ['A set of arguments $E$ is coalition-admissible in $B$ iff there is an ', { ref: 'ADM', label: 'admissible set' }, ' $S$ of the ', { ref: 'coalitionGraph' } ,' $F_B^{\\mathsf{Coal}}$ with $E = \\bigcup S$.'],
    reference: CL10,
  },

  'b-coal-co': {
    label: 'coalition-complete',
    title: 'Coalition-Complete Semantics',
    content: ['A set of arguments $E$ is coalition-complete in $B$ iff there is an ', { ref: 'CO', label: 'complete extension' }, ' $S$ of the ', { ref: 'coalitionGraph' } ,' $F_B^{\\mathsf{Coal}}$ with $E = \\bigcup S$.'],
    reference: CL10,
  },

  'b-coal-gr': {
    label: 'coalition-grounded',
    title: 'Coalition-Grounded Semantics',
    content: ['A set of arguments $E$ is coalition-grounded in $B$ iff there is an ', { ref: 'GR', label: 'grounded extension' }, ' $S$ of the ', { ref: 'coalitionGraph' } ,' $F_B^{\\mathsf{Coal}}$ with $E = \\bigcup S$.'],
    reference: CL10,
  },

  'b-coal-pr': {
    label: 'coalition-preferred',
    title: 'Coalition-Preferred Semantics',
    content: ['A set of arguments $E$ is coalition-preferred in $B$ iff there is an ', { ref: 'PR', label: 'preferred extension' }, ' $S$ of the ', { ref: 'coalitionGraph' } ,' $F_B^{\\mathsf{Coal}}$ with $E = \\bigcup S$.'],
    reference: CL10,
  },

  'b-coal-st': {
    label: 'coalition-stable',
    title: 'Coalition-Stable Semantics',
    content: ['A set of arguments $E$ is coalition-stable in $B$ iff there is an ', { ref: 'ST', label: 'stable extension' }, ' $S$ of the ', { ref: 'coalitionGraph' } ,' $F_B^{\\mathsf{Coal}}$ with $E = \\bigcup S$.'],
    reference: CL10,
  },

}
