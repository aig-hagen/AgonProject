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
import { SetAF, type SetAfArgumentData } from '@/modules/collective-attacks-argumentation/model'
import {
  failLine,
  iccmaIndex,
  iccmaName,
  makeIccmaImport,
} from '@/modules/common/argumentation/save/iccmaFormat'

export const iccmaImport = makeIccmaImport('setaf', 'setaf', (n, lines) => {
  const setaf = new SetAF<SetAfArgumentData>()
  for (let id = 0; id < n; id++) setaf.addArgument(id, { name: iccmaName(id), x: 0, y: 0 })
  for (const line of lines) {
    if (line.tokens.length < 2)
      failLine(line, 'an attack needs at least one attacker and a target.')
    const ids = line.tokens.map((token) => iccmaIndex(line, token, n))
    const target = ids.pop()!
    setaf.addCollectiveAttack([...new Set(ids)], target)
  }
  return setaf
})
