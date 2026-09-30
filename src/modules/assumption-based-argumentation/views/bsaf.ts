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

export interface BSAFEdge {
  tail: NodeId[]
  head: NodeId
}

export interface BSAFView {
  arguments: NodeId[]
  attacks: BSAFEdge[]
  supports: BSAFEdge[]
  // Heads of edges with an empty tail: ∅ ⊢ ‾a and ∅ ⊢ a.
  alwaysOut: NodeId[]
  alwaysDerived: NodeId[]
}

// ABA → BSAF over the assumptions (Berthold et al., KR 2024, Def. 3.5), ⊆-minimal tails only.
export function toBSAF(abaf: ABAF): BSAFView {
  const supports = minimalSupports(abaf)
  const view: BSAFView = {
    arguments: abaf.assumptions(),
    attacks: [],
    supports: [],
    alwaysOut: [],
    alwaysDerived: [],
  }
  for (const head of view.arguments) {
    const contrary = abaf.getContrary(head)
    for (const tail of contrary === undefined ? [] : (supports.get(contrary) ?? [])) {
      if (tail.length === 0) view.alwaysOut.push(head)
      else view.attacks.push({ tail, head })
    }
    for (const tail of supports.get(head) ?? []) {
      // `{a} ⊢ a` holds trivially.
      if (tail.length === 1 && tail[0] === head) continue
      if (tail.length === 0) view.alwaysDerived.push(head)
      else view.supports.push({ tail, head })
    }
  }
  return view
}
