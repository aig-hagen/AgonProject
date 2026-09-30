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
  failLine,
  iccmaIndex,
  type IccmaLine,
  iccmaName,
  makeIccmaImport,
} from '@/modules/common/argumentation/save/iccmaFormat'
import {
  type PafArgumentData,
  ProbabilisticArgumentation,
} from '@/modules/probabilistic-argumentation/model'

function probability(line: IccmaLine, token: string | undefined): number {
  const value = Number(token)
  if (token === undefined || !Number.isFinite(value) || value < 0 || value > 1) {
    failLine(line, `"${token ?? ''}" is not a probability between 0 and 1.`)
  }
  return value
}

export const iccmaImport = makeIccmaImport('paf', 'paf', (n, lines) => {
  const paf = new ProbabilisticArgumentation<PafArgumentData>()
  for (let id = 0; id < n; id++) {
    paf.addArgument(id, { name: iccmaName(id), x: 0, y: 0, probability: 1 })
  }
  for (const line of lines) {
    if (line.tokens[0] === 'w') {
      expectArity(line, 3, 4)
      const [, first, second, third] = line.tokens
      if (third === undefined) {
        paf.getArgument(iccmaIndex(line, first, n)).probability = probability(line, second)
      } else {
        const source = iccmaIndex(line, first, n)
        paf.addAttack(source, iccmaIndex(line, second, n), probability(line, third))
      }
    } else {
      expectArity(line, 2)
      const [source, target] = line.tokens
      paf.addAttack(iccmaIndex(line, source, n), iccmaIndex(line, target, n))
    }
  }
  return paf
})
