import { expect, test } from 'vitest'

import { DirectedGraph } from '@/modules/common/graph/graph'

test('addEdge', () => {
  const graph = new DirectedGraph<undefined, undefined>()
  graph.setNode(1, undefined)
  graph.setNode(2, undefined)
  graph.setEdge(1, 2, undefined)

  expect(graph.hasEdge(1, 2)).toBeTruthy()
})
