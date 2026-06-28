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

type ArgumentId = number

export interface SetAfArgumentData {
  name: string
  x: number
  y: number
}

export interface CollectiveAttack {
  id: number
  attackers: ArgumentId[]
  target: ArgumentId
}

export class SetAF<ArgumentDataT extends SetAfArgumentData> {
  [immerable] = true

  private args = new Map<ArgumentId, ArgumentDataT>()
  private collectiveAttacks: CollectiveAttack[] = []
  private nextAttackId = 0

  addArgument(id: ArgumentId, data: ArgumentDataT) {
    this.args.set(id, data)
  }

  deleteArgument(id: ArgumentId) {
    this.args.delete(id)
    this.collectiveAttacks = this.collectiveAttacks.filter(
      (a) => a.target !== id && !a.attackers.includes(id),
    )
  }

  getArgument(id: ArgumentId): ArgumentDataT {
    return this.args.get(id)!
  }

  arguments(): IterableIterator<[ArgumentId, ArgumentDataT]> {
    return this.args.entries()
  }

  addCollectiveAttack(attackers: ArgumentId[], target: ArgumentId): number {
    const id = this.nextAttackId++
    this.collectiveAttacks.push({ id, attackers, target })
    return id
  }

  deleteCollectiveAttack(id: number) {
    this.collectiveAttacks = this.collectiveAttacks.filter((a) => a.id !== id)
  }

  attacks(): CollectiveAttack[] {
    return [...this.collectiveAttacks]
  }
}
