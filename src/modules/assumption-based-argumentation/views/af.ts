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
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ABAF, NodeId } from '@/modules/assumption-based-argumentation/model'
import {
  type SupportArgument,
  supportArguments,
} from '@/modules/assumption-based-argumentation/views/supports'
import type { ArgumentData } from '@/modules/common/argumentation/model'

export interface AbaArgumentData extends ArgumentData, SupportArgument {}

export interface AFView {
  af: AbstractArgumentation<AbaArgumentData>
  // Number of arguments before the cap; `af` holds at most `limit` of them.
  total: number
}

export const AF_VIEW_LIMIT = 200

// Flat ABA → Dung AF over support-unique arguments, as in TweetyProject's AF reduction.
export function toAF(abaf: ABAF, limit = AF_VIEW_LIMIT): AFView {
  const all = supportArguments(abaf)
  const args = all.slice(0, limit)
  const af = new AbstractArgumentation<AbaArgumentData>()
  const byClaim = new Map<NodeId, number[]>()
  args.forEach((arg, id) => {
    af.addArgument(id, { name: `A${id + 1}`, x: 0, y: 0, ...arg })
    for (const c of arg.claims) byClaim.set(c, [...(byClaim.get(c) ?? []), id])
  })
  args.forEach((attacked, target) => {
    for (const a of attacked.support) {
      const contrary = abaf.getContrary(a)
      if (contrary === undefined) continue
      for (const source of byClaim.get(contrary) ?? []) af.addAttack(source, target)
    }
  })
  return { af, total: all.length }
}
