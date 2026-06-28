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
import { BJNNR21, CDKLM07 } from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const incompleteArgumentationGlossary: TooltipRegistry = {
  IAF: {
    label: 'iAF',
    title: 'Incomplete Argumentation Framework',
    content: ['An incomplete argumentation framework $I = (A, A^?, R, R^?)$ splits both the set of arguments and the set of attacks into two disjoint parts, the definite part ($A$ and $R$) and the uncertain part ($A^?$ and $R^?$), where both $R$ and $R^?$ are subsets of $(A \\cup A^?) \\times (A \\cup A^?)$'],
    reference: BJNNR21,
  },

  completion: {
    label: 'completion',
    title: 'Completion',
    content: ['A completion of an ', { ref: 'IAF' }, ' is a classical ', { ref: 'AF' }, ' $F^* = (A^* , R^*)$ such that $A \\subseteq A^* \\subseteq A \\cup A^?$ and $R|_{A^*} \\subseteq R^* \\subseteq (R \\cup R^?)|_{A^*}$.'],
    reference: BJNNR21,
  },

  necessaryAcceptance: {
    label: 'necessary',
    title: 'Necessary Acceptance',
    content: ['An argument is necessarily accepted under a ', { ref: 'semantics' }, ' $\\sigma$ if it is accepted in every ', { ref: 'completion' }, ' of the ', { ref: 'IAF' }, '.'],
    reference: BJNNR21,
  },

  possibleAcceptance: {
    label: 'possible',
    title: 'Possible Acceptance',
    content: ['An argument is possibly accepted under a ', { ref: 'semantics' }, ' $\\sigma$ if it is accepted in at least one ', { ref: 'completion' }, ' of the ', { ref: 'IAF' }, '.'],
    reference: CDKLM07,
  },
}
