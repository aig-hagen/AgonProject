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
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import {
  expectArity,
  iccmaIndex,
  iccmaName,
  makeIccmaImport,
} from '@/modules/common/argumentation/save/iccmaFormat'

export const iccmaImport = makeIccmaImport('af', 'af', (n, lines) => {
  const af = new AbstractArgumentation<ArgumentData>()
  for (let id = 0; id < n; id++) af.addArgument(id, { name: iccmaName(id), x: 0, y: 0 })
  for (const line of lines) {
    expectArity(line, 2)
    const [source, target] = line.tokens
    af.addAttack(iccmaIndex(line, source, n), iccmaIndex(line, target, n))
  }
  return af
})
