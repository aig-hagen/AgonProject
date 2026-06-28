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

import type { ArgumentId } from '@/modules/common/argumentation/model'
import { DirectedGraph } from '@/modules/common/graph/graph'

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
