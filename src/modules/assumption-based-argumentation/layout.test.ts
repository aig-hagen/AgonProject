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

import {
  theoryAnnotations,
  theoryContraries,
  toLayoutGraph,
} from '@/modules/assumption-based-argumentation/layout'
import { ABAF } from '@/modules/assumption-based-argumentation/model'

// a, b assumptions with ‾a = q and ‾b = p; p ← a; q is a fact.
function seed(): ABAF {
  const aba = new ABAF()
  aba.addNode(0, { name: 'a', kind: 'assumption', x: 0, y: 0, fact: false })
  aba.addNode(1, { name: 'b', kind: 'assumption', x: 0, y: 100, fact: false })
  aba.addNode(2, { name: 'p', kind: 'atom', x: 200, y: 0, fact: false })
  aba.addNode(3, { name: 'q', kind: 'atom', x: 200, y: 100, fact: true })
  aba.addRule(2, [0])
  aba.setContrary(0, 3)
  aba.setContrary(1, 2)
  return aba
}

describe('theory view', () => {
  test('contraries are edges from the contrary to its assumption', () => {
    expect(theoryContraries(seed())).toStrictEqual([
      { contrary: 3, assumption: 0 },
      { contrary: 2, assumption: 1 },
    ])
  })

  test('only facts are annotated', () => {
    expect([...theoryAnnotations(seed())]).toStrictEqual([[3, { content: '⊤' }]])
  })

  test('the layout graph includes rules and contraries', () => {
    expect(toLayoutGraph(seed()).edges).toStrictEqual([
      { sources: [0], target: 2 },
      { sources: [3], target: 0 },
      { sources: [2], target: 1 },
    ])
  })
})
