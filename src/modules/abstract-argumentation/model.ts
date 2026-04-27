import { immerable } from 'immer'
import { DirectedGraph } from '../common/graph/graph'

export type ArgumentId = number

export class AbstractArgumentation<ArgumentDataT> {
  [immerable] = true

  static id = 'abstract-argumentation-v1'

  private g = new DirectedGraph<ArgumentDataT, undefined>()

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

  arguments() {
    return this.g.nodes()
  }

  *attacks(): IterableIterator<[attackerId: ArgumentId, attackedId: ArgumentId]> {
    for (const [sourceId, targetId] of this.g.edges()) {
      yield [sourceId, targetId]
    }
  }
}
