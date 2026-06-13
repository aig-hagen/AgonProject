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
import { CL05, CL10 } from '@/modules/common/tooltip/publications'
import type { TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

export const bipolarArgumentationGlossary: TooltipRegistry = {
  BAF: {
    label: 'bipolar argumentation framework',
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
}
