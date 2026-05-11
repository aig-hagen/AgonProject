import { immerable } from 'immer'
import { DirectedGraph } from '@/modules/common/graph/graph'

const Edge = {
  ATTACK: 'a',
  SUPPORT: 's',
} as const

export type Edge = (typeof Edge)[keyof typeof Edge]
type ArgumentId = number

export class BipoloarArgumentation<ArgumentDataT> {
  [immerable] = true

  constructor(private g = new DirectedGraph<ArgumentDataT, Edge>()) {}

  addArgument(id: ArgumentId, data: ArgumentDataT) {
    this.g.setNode(id, data)
  }

  deleteArgument(id: ArgumentId) {
    this.g.deleteNode(id)
  }

  addAttack(sourceId: ArgumentId, targetId: ArgumentId) {
    this.g.setEdge(sourceId, targetId, Edge.ATTACK)
  }

  addSupport(sourceId: ArgumentId, targetId: ArgumentId) {
    this.g.setEdge(sourceId, targetId, Edge.SUPPORT)
  }

  deleteAttackOrSupport(sourceId: ArgumentId, targetId: ArgumentId) {
    this.g.deleteEdge(sourceId, targetId)
  }

  getArgument(id: ArgumentId): ArgumentDataT {
    return this.g.getNode(id)
  }

  hasAttack(attackerId: ArgumentId, attackedId: ArgumentId) {
    return (
      this.g.hasEdge(attackerId, attackedId) &&
      this.g.getEdge(attackerId, attackedId) === Edge.ATTACK
    )
  }

  hasSupport(attackerId: ArgumentId, attackedId: ArgumentId) {
    return (
      this.g.hasEdge(attackerId, attackedId) &&
      this.g.getEdge(attackerId, attackedId) === Edge.SUPPORT
    )
  }

  arguments() {
    return this.g.nodes()
  }

  *attacks(): IterableIterator<[attackerId: ArgumentId, attackedId: ArgumentId]> {
    for (const [sourceId, targetId, data] of this.g.edges()) {
      if (data === Edge.ATTACK) {
        yield [sourceId, targetId]
      }
    }
  }

  *supports(): IterableIterator<[attackerId: ArgumentId, attackedId: ArgumentId]> {
    for (const [sourceId, targetId, data] of this.g.edges()) {
      if (data === Edge.SUPPORT) {
        yield [sourceId, targetId]
      }
    }
  }
}
