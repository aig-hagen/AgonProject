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
import type { ABAF, NodeId } from '@/modules/assumption-based-argumentation/model'
import { minimalSupports } from '@/modules/assumption-based-argumentation/views/supports'
import { SetAF, type SetAfArgumentData } from '@/modules/collective-attacks-argumentation/model'

export interface SETAFView {
  setaf: SetAF<SetAfArgumentData>
  // Assumptions whose contrary follows from ∅, i.e. attacked by the empty set.
  alwaysOut: NodeId[]
}

// Flat ABA → SETAF over the assumptions (König et al., Def. 3.13). Node ids are the ABA ids.
export function toSETAF(abaf: ABAF): SETAFView {
  const supports = minimalSupports(abaf)
  const assumptions = abaf.assumptions()
  const attackers = new Map<NodeId, NodeId[][]>()
  for (const a of assumptions) {
    const contrary = abaf.getContrary(a)
    attackers.set(a, contrary === undefined ? [] : (supports.get(contrary) ?? []))
  }
  const alwaysOut = assumptions.filter((a) => attackers.get(a)!.some((t) => t.length === 0))

  const setaf = new SetAF<SetAfArgumentData>()
  for (const a of assumptions) {
    const { name, x, y } = abaf.getNode(a)
    setaf.addArgument(a, { name, x, y })
  }
  for (const a of assumptions) {
    for (const tail of attackers.get(a)!) if (tail.length > 0) setaf.addCollectiveAttack(tail, a)
  }
  return { setaf, alwaysOut }
}
