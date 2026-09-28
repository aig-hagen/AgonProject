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
  type LayoutGraph,
  layoutGraph,
  layoutGraphToDot,
} from '@/modules/common/graph-editor/layouting'
import { Layout } from '@/modules/common/main-menu/layouting'

const node = (id: number, extra = {}) => ({ id, label: String.fromCharCode(97 + id), ...extra })

// Tandem: every attack is collective, {b, c} → a and so on.
const tandem: LayoutGraph = {
  nodes: [node(0), node(1), node(2)],
  edges: [
    { sources: [1, 2], target: 0 },
    { sources: [0, 2], target: 1 },
    { sources: [0, 1], target: 2 },
  ],
}

const distance = (p: { x: number; y: number }, q: { x: number; y: number }) =>
  Math.hypot(p.x - q.x, p.y - q.y)

describe('layoutGraphToDot', () => {
  test('hyperedges get a junction, except in circular engines', () => {
    const dot = layoutGraphToDot(tandem, Layout.TopToBottom)
    expect(dot).toContain('"j0"[shape=point')
    expect(dot).toContain('"1" -> "j0"')
    expect(dot).toContain('"j0" -> "0"')
    const circo = layoutGraphToDot(tandem, Layout.Circular)
    expect(circo).not.toContain('"j0"')
    expect(circo).toContain('"1" -> "0"')
  })

  test('drops self-loops and duplicates; force engines merge mutual pairs', () => {
    const graph: LayoutGraph = {
      nodes: [node(0), node(1)],
      edges: [
        { sources: [0], target: 0 },
        { sources: [0], target: 1 },
        { sources: [0], target: 1 },
        { sources: [1], target: 0 },
      ],
    }
    const edgeLines = (dot: string) => dot.split('\n').filter((line) => line.includes('->'))
    expect(edgeLines(layoutGraphToDot(graph, Layout.TopToBottom))).toHaveLength(2)
    expect(edgeLines(layoutGraphToDot(graph, Layout.Neato))).toHaveLength(1)
  })

  test('boxes fit shape, label and annotation', () => {
    const dot = layoutGraphToDot(
      {
        nodes: [
          node(0, { shape: 'diamond' }),
          node(1, { shape: 'rect', label: 'x'.repeat(40) }),
          node(2, { annotation: 'a ∧ b ∨ c ∧ d ∨ e' }),
        ],
        edges: [],
      },
      Layout.Neato,
    )
    const size = (id: number) => {
      const match = new RegExp(`"${id.toString()}"\\[width=([\\d.]+) height=([\\d.]+)`).exec(dot)!
      return { width: Number(match[1]), height: Number(match[2]) }
    }
    expect(size(0).width).toBeGreaterThan(size(0).height)
    expect(size(1).width).toBeGreaterThan(4)
    expect(size(2).height).toBeGreaterThan(size(2).width / 2)
  })

  test('pins only for neato, flipped to Graphviz y-up', () => {
    const graph: LayoutGraph = { nodes: [node(0, { pinned: { x: 10, y: 20 } })], edges: [] }
    expect(layoutGraphToDot(graph, Layout.Neato)).toContain('pos="10,-20!"')
    expect(layoutGraphToDot(graph, Layout.ForceDirected)).not.toContain('pos=')
  })
})

describe('layoutGraph', () => {
  test('spreads a collective-attack triangle instead of lining it up', async () => {
    const positions = await layoutGraph(tandem, Layout.Neato)
    const [a, b, c] = [0, 1, 2].map((id) => positions.get(id)!)
    const sides = [distance(a!, b!), distance(a!, c!), distance(b!, c!)]
    expect(Math.min(...sides)).toBeGreaterThan(100)
    expect(Math.max(...sides) / Math.min(...sides)).toBeLessThan(1.5)
  })

  test('keeps pinned nodes in place', async () => {
    const graph: LayoutGraph = {
      nodes: [
        node(0, { pinned: { x: 300, y: -40 } }),
        node(1, { pinned: { x: 0, y: 0 } }),
        node(2),
      ],
      edges: [
        { sources: [0], target: 2 },
        { sources: [1], target: 2 },
      ],
    }
    const positions = await layoutGraph(graph, Layout.Neato)
    expect(positions.get(0)).toEqual({ x: 300, y: -40 })
    expect(distance(positions.get(1)!, { x: 0, y: 0 })).toBeLessThan(1)
  })

  test('annotated nodes keep room for their annotation below', async () => {
    const graph: LayoutGraph = {
      nodes: [node(0, { annotation: 'a long acceptance condition ∧ more' }), node(1)],
      edges: [{ sources: [0], target: 1 }],
    }
    const positions = await layoutGraph(graph, Layout.TopToBottom)
    // Two stacked circles would sit about ranksep + 56px apart; the annotation adds its line.
    expect(positions.get(1)!.y - positions.get(0)!.y).toBeGreaterThan(56 + 72 + 18)
  })
})
