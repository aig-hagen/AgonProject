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
  emptyGraph,
  fingerprintAF,
  graphFromSequences,
  type IndexedAF,
  layoutGraph,
  nextPath,
  pathTo,
  reductFor,
  restoreGraph,
  ROOT_KEY,
  stateKey,
  statesAlong,
  storeGraph,
  terminalPaths,
  withExpansion,
  withSequences,
} from '@/modules/abstract-argumentation/evaluation/serialisationGraph'

// a→b→c, c↔d, d→e with a=1 … e=5
const af: IndexedAF = {
  numberOfArgs: 5,
  attacks: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 3],
    [4, 5],
  ],
}
const preferredSequences = [
  [[1], [3], [5]],
  [[4], [1]],
  [[1], [4]],
]

describe('reductFor', () => {
  test('removes the extension and what it attacks, reindexing the rest', () => {
    const reduct = reductFor(af, [1])
    expect(reduct.originalIds).toEqual([3, 4, 5])
    expect(reduct.attacks).toEqual([
      [1, 2],
      [2, 1],
      [2, 3],
    ])
  })

  test('the empty extension leaves the AF unchanged', () => {
    expect(reductFor(af, []).attacks).toEqual(af.attacks)
  })
})

describe('graph building', () => {
  test('sequences merge shared prefixes and states', () => {
    const graph = withSequences(emptyGraph(), preferredSequences)
    expect([...graph.states.keys()].sort()).toEqual(['', '1', '1,3', '1,3,5', '1,4', '4'].sort())
    expect(graph.edges).toHaveLength(6)
    expect(graph.states.get('1,4')?.terminal).toBe(true)
    expect(graph.states.get('1')?.terminal).toBeUndefined()
  })

  test('a full graph settles every state', () => {
    const graph = graphFromSequences(preferredSequences)
    expect(graph.states.get('1')).toMatchObject({ expanded: true, terminal: false })
    expect(graph.states.get('1,3,5')).toMatchObject({ expanded: true, terminal: true })
  })

  test('statesAlong accumulates the steps', () => {
    expect(statesAlong([[4], [1]])).toEqual(['', '4', '1,4'])
  })

  test('nextPath steps forward, back, or jumps', () => {
    const graph = graphFromSequences(preferredSequences)
    expect(nextPath(graph, ['', '1'], '1,3')).toEqual(['', '1', '1,3'])
    expect(nextPath(graph, ['', '1', '1,3'], '1')).toEqual(['', '1'])
    expect(nextPath(graph, ['', '1'], '1,3,5')).toEqual(['', '1', '1,3', '1,3,5'])
  })

  test('expansion marks the state and adds children once', () => {
    let graph = withExpansion(emptyGraph(), ROOT_KEY, [[1], [4]], false)
    graph = withExpansion(graph, ROOT_KEY, [[1], [4]], false)
    expect(graph.edges).toHaveLength(2)
    expect(graph.states.get(ROOT_KEY)).toMatchObject({ expanded: true, terminal: false })
    expect(graph.states.get('1')?.expanded).toBe(false)
  })

  test('layout puts states in longest-path columns', () => {
    const layout = layoutGraph(withSequences(emptyGraph(), preferredSequences))
    expect(layout.columns.map((c) => [...c].sort())).toEqual([
      [''],
      ['1', '4'],
      ['1,3', '1,4'],
      ['1,3,5'],
    ])
  })

  test('pathTo walks from the root', () => {
    const graph = withSequences(emptyGraph(), preferredSequences)
    expect(pathTo(graph, '1,3,5')).toEqual(['', '1', '1,3', '1,3,5'])
    expect(pathTo(graph, 'missing')).toEqual([''])
  })

  test('terminalPaths lists every path to a terminal state', () => {
    const { paths, truncated } = terminalPaths(withSequences(emptyGraph(), preferredSequences))
    expect(truncated).toBe(false)
    expect(paths.map((p) => p.steps)).toEqual(
      expect.arrayContaining(preferredSequences.map((s) => expect.arrayContaining(s))),
    )
    expect(paths).toHaveLength(3)
  })

  test('terminalPaths respects its limit', () => {
    expect(terminalPaths(withSequences(emptyGraph(), preferredSequences), 2).truncated).toBe(true)
  })
})

describe('persistence', () => {
  const ids = [11, 12, 13, 14, 15]
  const meta = {
    fingerprint: fingerprintAF(ids, af),
    selectionFunctionKey: 'ADM',
    terminationFunctionKey: 'PR',
  }

  test('round-trips through argument ids', () => {
    const graph = withExpansion(
      withSequences(emptyGraph(), preferredSequences),
      '1',
      [[3], [4]],
      false,
    )
    const restored = restoreGraph(storeGraph(graph, stateKey([1, 3]), ids, meta), ids)
    expect(restored?.selected).toBe('1,3')
    expect([...restored!.graph.states.values()]).toEqual(
      expect.arrayContaining([...graph.states.values()]),
    )
    expect(restored!.graph.edges).toHaveLength(graph.edges.length)
  })

  test('drops a graph referencing a deleted argument', () => {
    const stored = storeGraph(withSequences(emptyGraph(), preferredSequences), ROOT_KEY, ids, meta)
    expect(restoreGraph(stored, [11, 12, 13, 14])).toBeUndefined()
  })
})
