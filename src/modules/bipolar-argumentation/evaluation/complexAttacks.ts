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
import type { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import { type AttackEdge, binaryAttacks } from '@/modules/common/evaluation/labeling'

type ArgumentId = number

// The attacks the reasoner evaluates, per support type (see TweetyProject's
// SimpleDeductiveReasoner / SimpleNecessityReasoner):
// - deductive: mediated attacks — `a` attacks `c` if it attacks `c` or anything `c` transitively
//   supports;
// - necessity: the same with supports reversed, so attacking a transitive supporter of `c`
//   attacks `c`;
// - coalition: direct attacks only.
export function effectiveAttacks<T>(
  baf: BipoloarArgumentation<T>,
  supportType: string,
): AttackEdge[] {
  const attacks = [...baf.attacks()]
  if (supportType !== 'ded' && supportType !== 'nec') return binaryAttacks(attacks)

  const next = new Map<ArgumentId, ArgumentId[]>()
  for (const [supporter, supported] of baf.supports()) {
    const [from, to] = supportType === 'ded' ? [supporter, supported] : [supported, supporter]
    next.set(from, [...(next.get(from) ?? []), to])
  }
  const attackers = new Map<ArgumentId, ArgumentId[]>()
  for (const [source, target] of attacks) {
    attackers.set(target, [...(attackers.get(target) ?? []), source])
  }

  const result = new Map<string, [ArgumentId, ArgumentId]>()
  const add = (a: ArgumentId, c: ArgumentId) => result.set(`${a}-${c}`, [a, c])
  for (const [source, target] of attacks) add(source, target)
  for (const [c] of baf.arguments()) {
    const reached = new Set<ArgumentId>()
    const stack = [...(next.get(c) ?? [])]
    while (stack.length > 0) {
      const b = stack.pop()!
      if (reached.has(b)) continue
      reached.add(b)
      stack.push(...(next.get(b) ?? []))
    }
    for (const b of reached) for (const a of attackers.get(b) ?? []) add(a, c)
  }
  return binaryAttacks(result.values())
}
