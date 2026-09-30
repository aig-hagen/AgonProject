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
  argumentLabels,
  theoryLabels,
} from '@/modules/assumption-based-argumentation/evaluation/labeling'
import { ABAF, type NodeId } from '@/modules/assumption-based-argumentation/model'
import { afCanvas } from '@/modules/assumption-based-argumentation/views/editorState'
import type { Labels } from '@/modules/common/evaluation/labeling'
import { generateUUID } from '@/modules/common/ids'

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
  return { aba, id }
}

// Names grouped by label, for readable assertions.
function byLabel(labels: Labels, name: (id: NodeId) => string) {
  const out: Record<string, string[]> = {}
  for (const [id, l] of labels) (out[l] ??= []).push(name(id))
  for (const k in out) out[k]!.sort()
  return out
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

describe('theoryLabels', () => {
  test('E is in, what its derivations attack is out, the rest of Th(E) is derived', () => {
    const { aba, id } = seed()
    const labels = theoryLabels(aba, new Set([id('a')]))
    expect(byLabel(labels, (i) => aba.getNode(i).name)).toEqual({
      in: ['a'],
      out: ['b'],
      derived: ['p'],
    })
  })

  test('an assumption attacked by a fact is out even for the empty set', () => {
    const { aba, id } = build({ assumptions: { c: 'x' }, facts: ['x'] })
    const labels = theoryLabels(aba, new Set())
    expect(labels.get(id('c'))).toBe('out')
    expect(labels.get(id('x'))).toBe('derived')
  })

  test('self-attacking members stay in', () => {
    const { aba, id } = build({ assumptions: { a: 'x' }, rules: [['x', ['a']]] })
    expect(theoryLabels(aba, new Set([id('a')])).get(id('a'))).toBe('in')
  })

  test('non-flat: an assumption derived from E is derived', () => {
    const { aba, id } = build({ assumptions: { a: 'x', b: 'y' }, rules: [['a', ['b']]] })
    expect(theoryLabels(aba, new Set([id('b')])).get(id('a'))).toBe('derived')
  })
})

describe('argumentLabels', () => {
  test('AF arguments follow their support', () => {
    const { aba, id } = seed()
    const canvas = afCanvas(aba, generateUUID(), {})
    const labels = argumentLabels(theoryLabels(aba, new Set([id('a')])), canvas.supports!)
    const label = (i: NodeId) => canvas.state.nodes.find((n) => n.id === i)!.label
    expect(byLabel(labels, label)).toEqual({
      in: ['{a} ⊢ {a, p}'],
      out: ['{a, b} ⊢ q', '{b} ⊢ b'],
    })
  })
})
