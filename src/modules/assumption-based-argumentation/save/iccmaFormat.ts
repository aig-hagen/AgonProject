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
import { ABAF } from '@/modules/assumption-based-argumentation/model'
import {
  expectArity,
  failLine,
  iccmaIndex,
  type IccmaLine,
  iccmaName,
  makeIccmaImport,
} from '@/modules/common/argumentation/save/iccmaFormat'

export const iccmaImport = makeIccmaImport('aba', 'aba', (n, lines) => {
  const aba = new ABAF()
  for (let id = 0; id < n; id++) {
    aba.addNode(id, { name: iccmaName(id), kind: 'atom', x: 0, y: 0, fact: false })
  }
  const assumptionLines = new Map<number, IccmaLine>()
  const contraryLines: { line: IccmaLine; assumption: number; contrary: number }[] = []
  for (const line of lines) {
    const [kind, ...rest] = line.tokens
    const ids = rest.map((token) => iccmaIndex(line, token, n))
    if (kind === 'a') {
      expectArity(line, 2)
      aba.getNode(ids[0]!).kind = 'assumption'
      assumptionLines.set(ids[0]!, line)
    } else if (kind === 'c') {
      expectArity(line, 3)
      contraryLines.push({ line, assumption: ids[0]!, contrary: ids[1]! })
    } else if (kind === 'r') {
      if (ids.length === 0) failLine(line, 'a rule needs a head.')
      const [head, ...body] = ids
      if (body.length === 0) aba.setFact(head!, true)
      else aba.addRule(head!, [...new Set(body)])
    } else {
      failLine(line, `unknown line type "${kind}", expected "a", "c" or "r".`)
    }
  }
  // Contraries may precede their `a` line, so they are checked once all assumptions are known.
  for (const { line, assumption, contrary } of contraryLines) {
    if (aba.getNode(assumption).kind !== 'assumption') {
      failLine(line, `${assumption + 1} is not declared as an assumption.`)
    }
    if (aba.getContrary(assumption) !== undefined) {
      failLine(line, `assumption ${assumption + 1} already has a contrary.`)
    }
    aba.setContrary(assumption, contrary)
  }
  for (const [assumption, line] of assumptionLines) {
    if (aba.getContrary(assumption) === undefined) {
      failLine(line, `assumption ${assumption + 1} has no contrary.`)
    }
  }
  return aba
})
