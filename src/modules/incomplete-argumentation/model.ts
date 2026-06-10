/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
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
  DEFINITE: 'd',
  UNCERTAIN: 'u',
} as const

export type Edge = (typeof Edge)[keyof typeof Edge]

type ArgumentId = number

export interface IafArgumentData {
  name: string
  x: number
  y: number
  uncertain: boolean
}

export class IncompleteArgumentation<ArgumentDataT extends IafArgumentData> {
  [immerable] = true

  constructor(private g = new DirectedGraph<ArgumentDataT, Edge>()) {}

  addArgument(id: ArgumentId, data: ArgumentDataT) {
    this.g.setNode(id, data)
  }

  deleteArgument(id: ArgumentId) {
    this.g.deleteNode(id)
  }

  addDefiniteAttack(sourceId: ArgumentId, targetId: ArgumentId) {
    this.g.setEdge(sourceId, targetId, Edge.DEFINITE)
  }

  addUncertainAttack(sourceId: ArgumentId, targetId: ArgumentId) {
    this.g.setEdge(sourceId, targetId, Edge.UNCERTAIN)
  }

  deleteAttack(sourceId: ArgumentId, targetId: ArgumentId) {
    this.g.deleteEdge(sourceId, targetId)
  }

  getArgument(id: ArgumentId): ArgumentDataT {
    return this.g.getNode(id)
  }

  hasDefiniteAttack(sourceId: ArgumentId, targetId: ArgumentId): boolean {
    return (
      this.g.hasEdge(sourceId, targetId) &&
      this.g.getEdge(sourceId, targetId) === Edge.DEFINITE
    )
  }

  hasUncertainAttack(sourceId: ArgumentId, targetId: ArgumentId): boolean {
    return (
      this.g.hasEdge(sourceId, targetId) &&
      this.g.getEdge(sourceId, targetId) === Edge.UNCERTAIN
    )
  }

  arguments() {
    return this.g.nodes()
  }

  *definiteAttacks(): IterableIterator<[sourceId: ArgumentId, targetId: ArgumentId]> {
    for (const [sourceId, targetId, data] of this.g.edges()) {
      if (data === Edge.DEFINITE) yield [sourceId, targetId]
    }
  }

  *uncertainAttacks(): IterableIterator<[sourceId: ArgumentId, targetId: ArgumentId]> {
    for (const [sourceId, targetId, data] of this.g.edges()) {
      if (data === Edge.UNCERTAIN) yield [sourceId, targetId]
    }
  }

  *uncertainArguments(): IterableIterator<[id: ArgumentId, data: ArgumentDataT]> {
    for (const [id, data] of this.g.nodes()) {
      if (data.uncertain) yield [id, data]
    }
  }
}
