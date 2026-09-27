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
import { describe, expect, test } from 'vitest'

import { toKb } from '@/modules/assumption-based-argumentation/evaluation/tweetyProject'
import { ABAF } from '@/modules/assumption-based-argumentation/model'
import { buildArgumentIdMapping } from '@/modules/common/evaluation/tweety-project/argumentMapping'

function kbOf(aba: ABAF): string {
  return toKb(aba, buildArgumentIdMapping(aba.nodeEntries()).idMapping)
}

describe('toKb', () => {
  test('writes assumptions, rules, facts and contraries with 1-based ids', () => {
    const aba = new ABAF()
    aba.addNode(10, { name: 'a', kind: 'assumption', x: 0, y: 0, fact: false })
    aba.addNode(20, { name: 'b', kind: 'assumption', x: 0, y: 0, fact: false })
    aba.addNode(30, { name: 'p', kind: 'atom', x: 0, y: 0, fact: false })
    aba.addNode(40, { name: 'q', kind: 'atom', x: 0, y: 0, fact: true })
    aba.addRule(30, [10])
    aba.addRule(40, [10, 20])
    aba.setContrary(10, 40)
    aba.setContrary(20, 30)
    expect(kbOf(aba)).toBe(
      ['{1,2}', '3 <- 1', '4 <- 1,2', '4 <-', 'not 1 = 4', 'not 2 = 3'].join('\n'),
    )
  })

  test('omits the assumption line when there are no assumptions', () => {
    const aba = new ABAF()
    aba.addNode(0, { name: 'p', kind: 'atom', x: 0, y: 0, fact: true })
    expect(kbOf(aba)).toBe('1 <-')
  })

  test('skips contraries of non-assumptions', () => {
    const aba = new ABAF()
    aba.addNode(0, { name: 'a', kind: 'atom', x: 0, y: 0, fact: false })
    aba.addNode(1, { name: 'p', kind: 'atom', x: 0, y: 0, fact: false })
    aba.setContrary(0, 1)
    expect(kbOf(aba)).toBe('')
  })
})
