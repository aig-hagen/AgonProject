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
import {
  cleanupAfterArgumentDeletion,
  type FormulaNode,
  getReferencedArgumentIds,
} from '@/modules/dialectical-argumentation/condition/formula'

type ArgumentId = number

export interface AdfArgumentData {
  name: string
  x: number
  y: number
  condition: FormulaNode
}

export class DialecticalArgumentation<ArgumentDataT extends AdfArgumentData> {
  [immerable] = true

  constructor(private g = new DirectedGraph<ArgumentDataT, undefined>()) {}

  addArgument(id: ArgumentId, data: ArgumentDataT) {
    this.g.setNode(id, data)
  }

  deleteArgument(id: ArgumentId) {
    this.g.deleteNode(id)
    // Clean up any conditions in remaining arguments that reference the deleted one
    for (const [, data] of this.g.nodes()) {
      data.condition = cleanupAfterArgumentDeletion(data.condition, id)
    }
  }

  setCondition(id: ArgumentId, formula: FormulaNode) {
    this.g.getNode(id).condition = formula
    // Clear existing parent links for this argument and re-derive from the new formula
    for (const [sourceId] of this.g.nodes()) {
      if (this.g.hasEdge(sourceId, id)) {
        this.g.deleteEdge(sourceId, id)
      }
    }
    for (const parentId of getReferencedArgumentIds(formula)) {
      if (this.g.hasNode(parentId)) {
        this.g.setEdge(parentId, id, undefined)
      }
    }
  }

  getArgument(id: ArgumentId): ArgumentDataT {
    return this.g.getNode(id)
  }

  arguments() {
    return this.g.nodes()
  }

  *links(): IterableIterator<[parentId: ArgumentId, childId: ArgumentId]> {
    for (const [sourceId, targetId] of this.g.edges()) {
      yield [sourceId, targetId]
    }
  }
}
