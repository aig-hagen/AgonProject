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

type ArgumentId = number

export interface PafArgumentData {
  name: string
  x: number
  y: number
  probability: number
}

export class ProbabilisticArgumentation<ArgumentDataT extends PafArgumentData> {
  [immerable] = true

  constructor(private g = new DirectedGraph<ArgumentDataT, number>()) {}

  addArgument(id: ArgumentId, data: ArgumentDataT) {
    this.g.setNode(id, data)
  }

  deleteArgument(id: ArgumentId) {
    this.g.deleteNode(id)
  }

  addAttack(sourceId: ArgumentId, targetId: ArgumentId, probability: number = 1) {
    this.g.setEdge(sourceId, targetId, probability)
  }

  deleteAttack(sourceId: ArgumentId, targetId: ArgumentId) {
    this.g.deleteEdge(sourceId, targetId)
  }

  getArgument(id: ArgumentId): ArgumentDataT {
    return this.g.getNode(id)
  }

  hasAttack(sourceId: ArgumentId, targetId: ArgumentId): boolean {
    return this.g.hasEdge(sourceId, targetId)
  }

  getAttackProbability(sourceId: ArgumentId, targetId: ArgumentId): number {
    return this.g.getEdge(sourceId, targetId)
  }

  arguments() {
    return this.g.nodes()
  }

  *attacks(): IterableIterator<[sourceId: ArgumentId, targetId: ArgumentId, probability: number]> {
    for (const [sourceId, targetId, prob] of this.g.edges()) {
      yield [sourceId, targetId, prob]
    }
  }
}
