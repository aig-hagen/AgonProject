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

// A support-unique argument (Lehtonen, 2026): one per ⊆-minimal assumption set, carrying every claim
// it minimally derives. Mirrors TweetyProject's `AfReductionReasoner.getArguments`.
export interface SupportArgument {
  support: NodeId[]
  claims: NodeId[]
}

const keyOf = (set: NodeId[]) => set.join(',')

const isSubset = (a: NodeId[], b: NodeId[]) => {
  const s = new Set(b)
  return a.every((x) => s.has(x))
}

const union = (a: NodeId[], b: NodeId[]) => [...new Set([...a, ...b])].sort((x, y) => x - y)

// Adds `set` to the antichain unless a subset is already there; drops supersets it replaces.
function insertMinimal(antichain: NodeId[][], set: NodeId[]): boolean {
  if (antichain.some((s) => isSubset(s, set))) return false
  for (let i = antichain.length - 1; i >= 0; i--) {
    if (isSubset(set, antichain[i]!)) antichain.splice(i, 1)
  }
  antichain.push(set)
  return true
}

// ⊆-minimal assumption sets deriving each node (flat theories; absent = underivable).
export function minimalSupports(abaf: ABAF): Map<NodeId, NodeId[][]> {
  const supports = new Map<NodeId, NodeId[][]>()
  const get = (id: NodeId) => {
    let s = supports.get(id)
    if (!s) supports.set(id, (s = []))
    return s
  }
  for (const [id, data] of abaf.nodeEntries()) {
    if (data.kind === 'assumption') get(id).push([id])
    if (data.fact) insertMinimal(get(id), [])
  }
  const rules = abaf.rules()
  let changed = true
  while (changed) {
    changed = false
    for (const rule of rules) {
      let combos: NodeId[][] = [[]]
      for (const b of new Set(rule.body)) {
        const bs = supports.get(b)
        if (!bs?.length) {
          combos = []
          break
        }
        combos = combos.flatMap((c) => bs.map((s) => union(c, s)))
      }
      for (const c of combos) if (insertMinimal(get(rule.head), c)) changed = true
    }
  }
  for (const [id, s] of supports) if (s.length === 0) supports.delete(id)
  return supports
}

export function supportArguments(abaf: ABAF, supports = minimalSupports(abaf)): SupportArgument[] {
  const bySupport = new Map<string, SupportArgument>()
  for (const [claim, sets] of supports) {
    for (const support of sets) {
      const key = keyOf(support)
      let arg = bySupport.get(key)
      if (!arg) bySupport.set(key, (arg = { support, claims: [] }))
      arg.claims.push(claim)
    }
  }
  const args = [...bySupport.values()]
  for (const a of args) a.claims.sort((x, y) => x - y)
  return args.sort(
    (a, b) =>
      a.support.length - b.support.length || keyOf(a.support).localeCompare(keyOf(b.support)),
  )
}
