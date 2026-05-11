import { immerable } from 'immer'
import { DirectedGraph } from '@/modules/common/graph/graph'
import type { ArgumentId } from '@/modules/common/argumentation/model'

export class AbstractArgumentation<ArgumentDataT> {
  [immerable] = true

  constructor(private g = new DirectedGraph<ArgumentDataT, undefined>()) {}

  addArgument(id: ArgumentId, data: ArgumentDataT) {
    this.g.setNode(id, data)
  }

  deleteArgument(id: ArgumentId) {
    this.g.deleteNode(id)
  }

  addAttack(sourceId: ArgumentId, targetId: ArgumentId) {
    this.g.setEdge(sourceId, targetId, undefined)
  }

  deleteAttack(sourceId: ArgumentId, targetId: ArgumentId) {
    this.g.deleteEdge(sourceId, targetId)
  }

  getArgument(id: ArgumentId): ArgumentDataT {
    return this.g.getNode(id)
  }

  arguments() {
    return this.g.nodes()
  }

  *attacks(): IterableIterator<[attackerId: ArgumentId, attackedId: ArgumentId]> {
    for (const [sourceId, targetId] of this.g.edges()) {
      yield [sourceId, targetId]
    }
  }
}
