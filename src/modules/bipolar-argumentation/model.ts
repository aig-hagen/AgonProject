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
