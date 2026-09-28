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
import { toBSAF } from '@/modules/assumption-based-argumentation/views/bsaf'
import {
  afCanvas,
  bsafCanvas,
  setafCanvas,
} from '@/modules/assumption-based-argumentation/views/editorState'
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
    const { state, unplaced } = setafCanvas(aba, generateUUID(), { [id('b')]: { x: 5, y: 7 } })
    expect(state.links).toEqual([{ sourceId: id('a'), targetId: id('b'), type: LinkType.SINGLE }])
    expect(state.hyperLinks).toEqual([
      { sourceIds: [id('a'), id('b')], targetId: id('a'), type: LinkType.SINGLE },
    ])
    expect(state.nodes.find((n) => n.id === id('b'))).toMatchObject({ x: 5, y: 7 })
    expect(unplaced).toEqual([id('a')])
  })
})

// Berthold et al. (KR 2024), Ex. 2.4: non-flat, since e ← a,b derives an assumption.
const paperExample = () =>
  build({
    assumptions: { a: '~a', b: '~b', c: '~c', d: '~d', e: '~e' },
    rules: [
      ['~e', ['e']],
      ['e', ['a', 'b']],
      ['~a', ['d']],
      ['~c', ['d']],
      ['~e', ['b', 'c']],
      ['~d', ['a']],
      ['~d', ['c']],
    ],
  })

describe('BSAF view', () => {
  const edges = (list: { tail: NodeId[]; head: NodeId }[], names: (ids: NodeId[]) => string[]) =>
    list.map((e) => `{${names(e.tail)}}->${names([e.head])}`).sort()

  test('attacks and supports follow Def. 3.5, including derivations through assumptions', () => {
    const { aba, names } = paperExample()
    const view = toBSAF(aba)
    expect(edges(view.attacks, names)).toEqual([
      '{a,b}->e',
      '{a}->d',
      '{b,c}->e',
      '{c}->d',
      '{d}->a',
      '{d}->c',
      '{e}->e',
    ])
    expect(edges(view.supports, names)).toEqual(['{a,b}->e'])
  })

  test('a flat theory has no supports and the SETAF attacks', () => {
    const { aba, names } = seed()
    const view = toBSAF(aba)
    expect(view.supports).toEqual([])
    expect(edges(view.attacks, names)).toEqual(['{a,b}->a', '{a}->b'])
  })

  test('empty tails become annotations', () => {
    const { aba, id } = build({
      assumptions: { a: 'f', b: 'p' },
      rules: [['p', ['a']]],
      facts: ['f', 'b'],
    })
    const view = toBSAF(aba)
    expect(view.alwaysOut).toEqual([id('a')])
    expect(view.alwaysDerived).toEqual([id('b')])
    const canvas = bsafCanvas(aba, generateUUID(), {})
    expect(canvas.annotations.get(id('a'))).toEqual({ content: 'always out' })
    expect(canvas.annotations.get(id('b'))).toEqual({ content: 'always derived' })
  })

  test('canvas: supports are DOUBLE links and win over an attack with the same ends', () => {
    const { aba, id } = paperExample()
    const { state, note } = bsafCanvas(aba, generateUUID(), {})
    const onE = state.hyperLinks!.filter((l) => l.targetId === id('e'))
    expect(onE).toContainEqual({
      sourceIds: [id('a'), id('b')],
      targetId: id('e'),
      type: LinkType.DOUBLE,
    })
    expect(onE.filter((l) => l.sourceIds.join() === [id('a'), id('b')].join())).toHaveLength(1)
    expect(note).toBe('also: {a, b} attacks e')
    expect(state.links).toContainEqual({
      sourceId: id('e'),
      targetId: id('e'),
      type: LinkType.SINGLE,
    })
  })
})

describe('AF canvas', () => {
  test('rect nodes labelled support ⊢ claims; positions keyed by support', () => {
    const { aba, id } = seed()
    const key = [id('a'), id('b')].join(',')
    const canvas = afCanvas(aba, generateUUID(), { [key]: { x: 3, y: 4 } })
    expect(canvas.state.nodes.map((n) => n.label)).toEqual([
      '{a} ⊢ {a, p}',
      '{b} ⊢ b',
      '{a, b} ⊢ q',
    ])
    expect([...canvas.shapes.values()]).toEqual(['rect', 'rect', 'rect'])
    expect(canvas.state.nodes[2]).toMatchObject({ x: 3, y: 4 })
    expect(canvas.unplaced).toEqual([0, 1])
    expect(canvas.note).toBeUndefined()
  })

  test('empty support shown as ∅', () => {
    const { aba } = build({ assumptions: { a: 'p' }, facts: ['p'] })
    const labels = afCanvas(aba, generateUUID(), {}).state.nodes.map((n) => n.label)
    expect(labels).toContain('∅ ⊢ p')
  })
})
