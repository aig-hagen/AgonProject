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
import type { Labels, NodeLabel } from '@/modules/common/evaluation/labeling'

// Th(E): every node derivable from the assumptions in E and the facts.
export function derivedFrom(aba: ABAF, extension: ReadonlySet<NodeId>): Set<NodeId> {
  const derived = new Set(extension)
  for (const [id, data] of aba.nodeEntries()) if (data.fact) derived.add(id)
  const rules = aba.rules()
  let changed = true
  while (changed) {
    changed = false
    for (const { head, body } of rules) {
      if (!derived.has(head) && body.every((b) => derived.has(b))) {
        derived.add(head)
        changed = true
      }
    }
  }
  return derived
}

// Theory-space labels for an assumption set E: E is in, assumptions whose contrary Th(E) derives
// are out, and the rest of Th(E) is derived. SETAF/BSAF nodes share these ids.
export function theoryLabels(aba: ABAF, extension: ReadonlySet<NodeId>): Map<NodeId, NodeLabel> {
  const derived = derivedFrom(aba, extension)
  const labels = new Map<NodeId, NodeLabel>()
  for (const id of extension) labels.set(id, 'in')
  for (const a of aba.assumptions()) {
    const contrary = aba.getContrary(a)
    if (!labels.has(a) && contrary !== undefined && derived.has(contrary)) labels.set(a, 'out')
  }
  for (const id of derived) if (!labels.has(id)) labels.set(id, 'derived')
  return labels
}

// AF view: an argument is in when its whole support is, out when any support assumption is out.
export function argumentLabels(
  theory: Labels,
  supports: ReadonlyMap<NodeId, readonly NodeId[]>,
): Map<NodeId, NodeLabel> {
  const labels = new Map<NodeId, NodeLabel>()
  for (const [arg, support] of supports) {
    if (support.every((a) => theory.get(a) === 'in')) labels.set(arg, 'in')
    else if (support.some((a) => theory.get(a) === 'out')) labels.set(arg, 'out')
  }
  return labels
}
