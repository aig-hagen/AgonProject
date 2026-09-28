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

import { NODE_GREEN, NODE_LIGHT_GREEN, NODE_RED } from '@/modules/common/colors'
import {
  binaryAttacks,
  extensionLabels,
  labelsToHighlight,
  type NodeLabel,
} from '@/modules/common/evaluation/labeling'
import { generateUUID } from '@/modules/common/ids'

describe('extensionLabels', () => {
  test('binary attacks from the extension mark their targets out', () => {
    const labels = extensionLabels(
      new Set([1]),
      binaryAttacks([
        [1, 2],
        [3, 1],
        [2, 3],
      ]),
    )
    expect([...labels]).toEqual([
      [1, 'in'],
      [2, 'out'],
    ])
  })

  test('a collective attack needs its whole tail in the extension', () => {
    const attacks = [{ tail: [1, 2], head: 3 }]
    expect(extensionLabels(new Set([1]), attacks).has(3)).toBe(false)
    expect(extensionLabels(new Set([1, 2]), attacks).get(3)).toBe('out')
  })

  test('members stay in even if attacked from inside', () => {
    expect(extensionLabels(new Set([1]), binaryAttacks([[1, 1]])).get(1)).toBe('in')
  })
})

describe('labelsToHighlight', () => {
  const t = (key: string) => key.split('.').pop()!

  test('groups by label and paints undecided with the default color', () => {
    const labels = new Map<number, NodeLabel>([
      [1, 'in'],
      [2, 'derived'],
      [3, 'out'],
      [4, 'undec'],
    ])
    const h = labelsToHighlight(generateUUID(), labels, t)
    expect(h.groups.map((g) => [[...g.nodes], g.color])).toEqual([
      [[1], NODE_GREEN],
      [[2], NODE_LIGHT_GREEN],
      [[3], NODE_RED],
    ])
    expect(h.legend?.map((l) => l.label)).toEqual(['accepted', 'derived', 'rejected', 'undecided'])
  })

  test('legend lists undecided only when asked or present', () => {
    const labels = new Map<number, NodeLabel>([[1, 'in']])
    const legend = (undecided: boolean) =>
      labelsToHighlight(generateUUID(), labels, t, { undecided }).legend?.map((l) => l.label)
    expect(legend(false)).toEqual(['accepted', 'rejected'])
    expect(legend(true)).toEqual(['accepted', 'rejected', 'undecided'])
  })
})
