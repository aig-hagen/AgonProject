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

import { ABAF, type NodeId } from '@/modules/assumption-based-argumentation/model'
import { toAF } from '@/modules/assumption-based-argumentation/views/af'
import { setafCanvas } from '@/modules/assumption-based-argumentation/views/editorState'
import { toSETAF } from '@/modules/assumption-based-argumentation/views/setaf'
import {
  minimalSupports,
  supportArguments,
} from '@/modules/assumption-based-argumentation/views/supports'
import { LinkType } from '@/modules/common/graph-editor/graphEditor'
import { generateUUID } from '@/modules/common/ids'

// Builds an ABAF from names: assumptions map to their contrary, facts are empty-body heads.
function build(spec: {
  assumptions: Record<string, string>
  rules?: [string, string[]][]
  facts?: string[]
}) {
  const aba = new ABAF()
  const id = (name: string): NodeId => {
    const existing = aba.findByName(name)
    if (existing !== undefined) return existing
    const next = aba.nextNodeId()
    aba.addNode(next, { name, kind: 'atom', x: 0, y: 0, fact: false })
    return next
  }
  for (const [a, contrary] of Object.entries(spec.assumptions)) {
    aba.setKind(id(a), 'assumption')
    aba.setContrary(id(a), id(contrary))
  }
  for (const [head, body] of spec.rules ?? []) aba.addRule(id(head), body.map(id))
  for (const f of spec.facts ?? []) aba.setFact(id(f), true)
  const names = (ids: NodeId[]) => ids.map((i) => aba.getNode(i).name).sort()
  return { aba, id, names }
}

// The module's initial theory: p ← a, q ← a,b, ‾a = q, ‾b = p.
const seed = () =>
  build({
    assumptions: { a: 'q', b: 'p' },
    rules: [
      ['p', ['a']],
      ['q', ['a', 'b']],
    ],
  })

function afEdges(view: ReturnType<typeof toAF>) {
  const label = (i: number) => view.af.getArgument(i).name
  return [...view.af.attacks()].map(([s, t]) => `${label(s)}->${label(t)}`).sort()
}

describe('minimal supports', () => {
  test('groups claims by support', () => {
    const { aba, names } = seed()
    const args = supportArguments(aba).map((a) => [names(a.support), names(a.claims)])
    expect(args).toEqual([
      [['a'], ['a', 'p']],
      [['b'], ['b']],
      [['a', 'b'], ['q']],
    ])
  })

  test('drops non-minimal supports (x ← a,b; x ← a; y ← a)', () => {
    const { aba, names } = build({
      assumptions: { a: 'na', b: 'nb' },
      rules: [
        ['x', ['a', 'b']],
        ['x', ['a']],
        ['y', ['a']],
      ],
    })
    const args = supportArguments(aba).map((a) => [names(a.support), names(a.claims)])
    expect(args).toEqual([
      [['a'], ['a', 'x', 'y']],
      [['b'], ['b']],
    ])
  })

  test('underivable atoms have no support; cycles terminate', () => {
    const { aba, id } = build({
      assumptions: { a: 'na' },
      rules: [
        ['r', ['z']],
        ['p', ['q']],
        ['q', ['p']],
        ['q', ['a']],
      ],
    })
    const s = minimalSupports(aba)
    expect(s.has(id('r'))).toBe(false)
    expect(s.get(id('p'))).toEqual([[id('a')]])
  })
})

describe('AF view', () => {
  test('support-unique arguments with contrary attacks', () => {
    const view = toAF(seed().aba)
    // A1 = ({a}, {a, p}), A2 = ({b}, {b}), A3 = ({a, b}, {q})
    expect(view.total).toBe(3)
    expect(afEdges(view)).toEqual(['A1->A2', 'A1->A3', 'A3->A1', 'A3->A3'])
  })

  test('caps the number of arguments', () => {
    const view = toAF(seed().aba, 2)
    expect(view.total).toBe(3)
    expect([...view.af.arguments()]).toHaveLength(2)
    expect(afEdges(view)).toEqual(['A1->A2'])
  })
})

describe('SETAF view', () => {
  test('collective attacks from minimal supports of contraries', () => {
    const { aba, names } = seed()
    const { setaf, alwaysOut } = toSETAF(aba)
    const edges = setaf
      .attacks()
      .map((a) => `{${names(a.attackers)}}->${names([a.target])}`)
      .sort()
    expect(edges).toEqual(['{a,b}->a', '{a}->b'])
    expect(alwaysOut).toEqual([])
  })

  test('a contrary derivable from ∅ marks the assumption always out', () => {
    const { aba, id } = build({
      assumptions: { a: 'f', b: 'p' },
      rules: [['p', ['a']]],
      facts: ['f'],
    })
    const { setaf, alwaysOut } = toSETAF(aba)
    expect(alwaysOut).toEqual([id('a')])
    expect([...setaf.arguments()].map(([i]) => i).sort()).toEqual([id('a'), id('b')].sort())
    expect(setaf.attacks()).toEqual([])
  })

  test('canvas: singleton attacks are links, collective ones hyperlinks', () => {
    const { aba, id } = seed()
    const { state } = setafCanvas(aba, generateUUID(), { [id('b')]: { x: 5, y: 7 } })
    expect(state.links).toEqual([{ sourceId: id('a'), targetId: id('b'), type: LinkType.SINGLE }])
    expect(state.hyperLinks).toEqual([
      { sourceIds: [id('a'), id('b')], targetId: id('a'), type: LinkType.SINGLE },
    ])
    expect(state.nodes.find((n) => n.id === id('b'))).toMatchObject({ x: 5, y: 7 })
  })
})
