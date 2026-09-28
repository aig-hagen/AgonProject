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
import { NODE_GREEN, NODE_LIGHT_GREEN, NODE_RED } from '@/modules/common/colors'
import type { Highlight, NodeId } from '@/modules/common/graph-editor/graphEditor'
import type { UUID } from '@/modules/common/ids'

// `undec` paints the default node color; unlabeled nodes do too.
export type NodeLabel = 'in' | 'out' | 'undec' | 'derived'

export type Labels = ReadonlyMap<NodeId, NodeLabel>

// A binary attack has a one-element tail; a collective attack a larger one.
export interface AttackEdge {
  tail: readonly NodeId[]
  head: NodeId
}

export function binaryAttacks(pairs: Iterable<readonly [NodeId, NodeId]>): AttackEdge[] {
  return [...pairs].map(([source, target]) => ({ tail: [source], head: target }))
}

// Extension members are in; whatever the extension attacks, collectively or not, is out.
export function extensionLabels(
  extension: ReadonlySet<NodeId>,
  attacks: Iterable<AttackEdge>,
): Map<NodeId, NodeLabel> {
  const labels = new Map<NodeId, NodeLabel>()
  for (const id of extension) labels.set(id, 'in')
  for (const { tail, head } of attacks) {
    if (!labels.has(head) && tail.every((id) => extension.has(id))) labels.set(head, 'out')
  }
  return labels
}

const LABEL_ORDER: NodeLabel[] = ['in', 'derived', 'out', 'undec']

const LABEL_STYLE: Record<NodeLabel, { legendKey: string; color?: string }> = {
  in: { legendKey: 'evaluation.legend.accepted', color: NODE_GREEN },
  derived: { legendKey: 'evaluation.legend.derived', color: NODE_LIGHT_GREEN },
  out: { legendKey: 'evaluation.legend.rejected', color: NODE_RED },
  undec: { legendKey: 'evaluation.legend.undecided' },
}

// The legend always lists accepted/rejected; `undecided` when the caller says the rest of the
// graph is undecided (an enumerated extension) rather than just unmentioned.
export function labelsToHighlight(
  stateId: UUID,
  labels: Labels,
  t: (key: string) => string,
  { undecided = false }: { undecided?: boolean } = {},
): Highlight {
  const present = new Set<NodeLabel>(['in', 'out', ...labels.values()])
  if (undecided) present.add('undec')
  const groups = []
  for (const label of LABEL_ORDER) {
    const color = LABEL_STYLE[label].color
    if (color === undefined) continue
    const nodes = new Set([...labels].filter(([, l]) => l === label).map(([id]) => id))
    if (nodes.size > 0) groups.push({ nodes, color })
  }
  return {
    stateId,
    groups,
    legend: LABEL_ORDER.filter((l) => present.has(l)).map((l) => ({
      label: t(LABEL_STYLE[l].legendKey),
      color: LABEL_STYLE[l].color,
    })),
  }
}
