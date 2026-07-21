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
import { expect, test } from 'vitest'

import { escapeTexText } from '@/modules/common/export/texEscape'

const cases: [string, string][] = [
  ['a', 'a'],
  ['{a, b}', '\\{a, b\\}'],
  ['a_1', 'a\\_1'],
  ['100%', '100\\%'],
  ['a & b', 'a \\& b'],
  ['a\\b', 'a\\textbackslash{}b'],
  ['a^b~c#d$e', 'a\\textasciicircum{}b\\textasciitilde{}c\\#d\\$e'],
]

test.for(cases)(`${escapeTexText.name}(%o) -> %s`, ([input, expected]) => {
  expect(escapeTexText(input)).toBe(expected)
})
