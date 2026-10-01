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
import {
  expectArity,
  iccmaIndex,
  iccmaName,
  makeIccmaImport,
} from '@/modules/common/argumentation/save/iccmaFormat'
import {
  type IafArgumentData,
  IncompleteArgumentation,
} from '@/modules/incomplete-argumentation/model'

export const iccmaImport = makeIccmaImport('iaf', 'iaf', (n, lines) => {
  const iaf = new IncompleteArgumentation<IafArgumentData>()
  for (let id = 0; id < n; id++) {
    iaf.addArgument(id, { name: iccmaName(id), x: 0, y: 0, uncertain: false })
  }
  for (const line of lines) {
    if (line.tokens[0] === 'u') {
      expectArity(line, 2, 3)
      const [, first, second] = line.tokens
      if (second === undefined) {
        iaf.getArgument(iccmaIndex(line, first, n)).uncertain = true
      } else {
        iaf.addUncertainAttack(iccmaIndex(line, first, n), iccmaIndex(line, second, n))
      }
    } else {
      expectArity(line, 2)
      const [source, target] = line.tokens
      iaf.addDefiniteAttack(iccmaIndex(line, source, n), iccmaIndex(line, target, n))
    }
  }
  return iaf
})
