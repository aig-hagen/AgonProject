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
import { produce } from 'immer'
import { describe, expect, test } from 'vitest'

import { ABAF } from '@/modules/assumption-based-argumentation/model'
import {
  loadFromString,
  saveAsString,
} from '@/modules/assumption-based-argumentation/save/saveFormat'

function seed(): ABAF {
  const aba = new ABAF()
  aba.addNode(0, { name: 'a', kind: 'assumption', x: 0, y: 0, fact: false })
  aba.addNode(1, { name: 'b', kind: 'assumption', x: 0, y: 100, fact: false })
  aba.addNode(2, { name: 'p', kind: 'atom', x: 200, y: 0, fact: false })
  aba.addNode(3, { name: 'q', kind: 'atom', x: 200, y: 100, fact: false })
  aba.addRule(2, [0])
  aba.addRule(3, [0, 1])
  aba.setContrary(0, 3)
  aba.setContrary(1, 2)
  return aba
}

describe('ABAF model', () => {
  test('works with immer', () => {
    const aba = seed()
    const next = produce(aba, (draft) => {
      draft.setName(2, 'renamed')
    })
    expect(next).not.toBe(aba)
    expect(next.getNode(2).name).toBe('renamed')
    expect(aba.getNode(2).name).toBe('p')
  })

  test('flat detection: assumption head makes it non-flat', () => {
    const aba = seed()
    expect(aba.isFlat()).toBe(true)
    aba.addRule(0, [2]) // a <- p : derives an assumption
    expect(aba.isFlat()).toBe(false)
  })

  test('flat detection: assumption marked as fact makes it non-flat', () => {
    const aba = seed()
    aba.setFact(0, true)
    expect(aba.isFlat()).toBe(false)
  })

  test('deleting a node cascades into rules and contraries', () => {
    const aba = seed()
    aba.deleteNode(3) // q: head of a rule, and contrary of a
    expect(aba.hasNode(3)).toBe(false)
    // rule `q <- a,b` is gone (its head was removed)
    expect(aba.rules().some((r) => r.head === 3)).toBe(false)
    // `a` lost its contrary and falls back to an atom
    expect(aba.getContrary(0)).toBeUndefined()
    expect(aba.getNode(0).kind).toBe('atom')
  })

  test('removing the last body atom removes the rule', () => {
    const aba = seed()
    const ruleId = aba.addRule(2, [1])
    aba.removeBodyAtom(ruleId, 1)
    expect(aba.rules().some((r) => r.id === ruleId)).toBe(false)
  })

  test('demoting an assumption to atom drops its contrary', () => {
    const aba = seed()
    aba.setKind(0, 'atom')
    expect(aba.getContrary(0)).toBeUndefined()
  })
})

describe('ABAF save format', () => {
  test('round-trips through save and load', () => {
    const aba = seed()
    const result = loadFromString(saveAsString(aba, 'seed'), 'seed.json')
    expect(result.success).toBe(true)
    const loaded = result.data!
    expect([...loaded.nodeEntries()].length).toBe(4)
    expect(loaded.rules().length).toBe(2)
    expect(loaded.getContrary(0)).toBe(3)
    expect(loaded.getContrary(1)).toBe(2)
    expect(loaded.isFlat()).toBe(true)
  })

  test('rejects a rule referencing an unknown node', () => {
    const broken = JSON.stringify({
      apiVersion: 'aba/v1',
      nodes: { '0': { name: 'a', kind: 'assumption', x: 0, y: 0, fact: false } },
      rules: [{ id: 0, head: 99, body: [0] }],
      contraries: {},
    })
    const result = loadFromString(broken, 'broken.json')
    expect(result.success).toBe(false)
  })
})
