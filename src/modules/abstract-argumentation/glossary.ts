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
import type { PopoverRegistry } from '@/modules/common/popoverRegistry'

export const abstractArgumentationGlossary: PopoverRegistry = {
  reduct: {
    label: 'reduct',
    title: 'Reduct',
    content: ['The reduct wrt S is defined as the AF where $S$ and ', { ref: 'attackedSet' }, ' are removed'],
  },
  stableSemantics: {
    label: 'stable semantics',
    title: 'Stable Semantics',
    content: ['The stable semantics can be defined via the ', { ref: 'reduct' }],
    reference: {
      label: 'Dung (1995)',
      href: 'https://doi.org/10.1016/0004-3702(94)00041-X',
    },
  },
  attackedSet: {
    label: '$S^+$',
    title: 'Attacked Set',
    content: ['The set of arguments attacked by $S$, i.e. $S^+ = \\{ a \\in A \\mid \\exists b \\in S: (b,a) \\in R \\}$'],
  }
}
