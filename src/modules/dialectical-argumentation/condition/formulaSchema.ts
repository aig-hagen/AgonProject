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
import * as z from 'zod'

import type { FormulaNode } from '@/modules/dialectical-argumentation/condition/formula'

export const FormulaNodeSchema: z.ZodType<FormulaNode> = z.lazy(() =>
  z.union([
    z.object({ type: z.literal('tautology') }),
    z.object({ type: z.literal('contradiction') }),
    z.object({ type: z.literal('atom'), argumentId: z.number().int().nonnegative() }),
    z.object({ type: z.literal('negation'), child: FormulaNodeSchema }),
    z.object({ type: z.literal('conjunction'), children: z.array(FormulaNodeSchema).min(2) }),
    z.object({ type: z.literal('disjunction'), children: z.array(FormulaNodeSchema).min(2) }),
  ]),
)
