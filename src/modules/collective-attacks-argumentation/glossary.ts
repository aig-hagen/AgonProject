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
import { NP06 } from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const collectiveAttacksArgumentationGlossary: TooltipRegistry = {
  SetAF: {
    label: 'SetAF',
    title: 'Argumentation Framework with Collective Attacks (SetAF)',
    content: ['An argumentation framework with collective attacks $S$ is a tuple $(A, R)$, where $A$ is a finite set of arguments and $R \\subseteq 2^A \\times A$ is the attack relation.'],
    reference: NP06,
  },

  collectiveAttack: {
    label: 'collective attack',
    title: 'Collective Attack',
    content: ['A collective attack $(S, b) \\in R$ in a ', { ref: 'SetAF' }, ' means that the set of arguments $S$ jointly attacks argument $b$. Hence, the attack is only successful if all members of $S$ are accepted.'],
    reference: NP06,
  },
}
