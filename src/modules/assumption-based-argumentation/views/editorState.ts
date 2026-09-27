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
import { toAF } from '@/modules/assumption-based-argumentation/views/af'
import { toBSAF } from '@/modules/assumption-based-argumentation/views/bsaf'
import { toSETAF } from '@/modules/assumption-based-argumentation/views/setaf'
import {
  type GraphEditorNodeShape,
  type GraphEditorState,
  type GraphEditorStateHyperLink,
  type GraphEditorStateLink,
  LinkType,
} from '@/modules/common/graph-editor/graphEditor'
import type { UUID } from '@/modules/common/ids'

export type AbaView = 'theory' | 'af' | 'setaf'

// Keyed by a stable node key: the assumption id (SETAF) or the support set (AF), since AF
// argument ids shift when the theory changes.
export type ViewPositions = Record<string, { x: number; y: number }>

export interface DerivedCanvas {
  state: GraphEditorState
  annotations: Map<NodeId, { content: string }>
  shapes: Map<NodeId, GraphEditorNodeShape>
  positionKeys: Map<NodeId, string>
  // Nodes without a stored position; the editor lays them out.
  unplaced: NodeId[]
  // Shown next to the read-only chip, e.g. when the AF is capped.
  note?: string
}

// SETAF nodes are the assumptions: they start at their theory position unless moved in the view.
export function setafCanvas(aba: ABAF, stateId: UUID, positions: ViewPositions): DerivedCanvas {
  const { setaf, alwaysOut } = toSETAF(aba)
  const nodes = [...setaf.arguments()].map(([id, d]) => ({
    id,
    label: d.name,
    ...(positions[id] ?? { x: d.x, y: d.y }),
  }))
  const links: GraphEditorStateLink[] = []
  const hyperLinks: GraphEditorStateHyperLink[] = []
  for (const { attackers, target } of setaf.attacks()) {
    if (attackers.length === 1) {
      links.push({ sourceId: attackers[0]!, targetId: target, type: LinkType.SINGLE })
    } else {
      hyperLinks.push({ sourceIds: attackers, targetId: target, type: LinkType.SINGLE })
    }
  }
  return {
    state: { stateId, nodes, links, hyperLinks, redraw: true },
    annotations: new Map(alwaysOut.map((id) => [id, { content: 'always out' }])),
    shapes: new Map(),
    positionKeys: new Map(nodes.map((n) => [n.id, String(n.id)])),
    unplaced: [],
  }
}

// BSAF shares the SETAF slot and its positions; supports are double arrows, as in the BAF module.
export function bsafCanvas(aba: ABAF, stateId: UUID, positions: ViewPositions): DerivedCanvas {
  const { arguments: args, attacks, supports, alwaysOut, alwaysDerived } = toBSAF(aba)
  const nodes = args.map((id) => {
    const { name, x, y } = aba.getNode(id)
    return { id, label: name, ...(positions[id] ?? { x, y }) }
  })
  const links: GraphEditorStateLink[] = []
  const hyperLinks: GraphEditorStateHyperLink[] = []
  // The graph keeps one edge per (tail, head), so an attack sharing both with a support is
  // listed in the note instead of drawn.
  const drawn = new Set<string>()
  const hidden: string[] = []
  const add = (edges: typeof attacks, type: LinkType) => {
    for (const { tail, head } of edges) {
      const key = `${tail.join(',')}-${head}`
      if (drawn.has(key)) {
        const names = tail.map((id) => aba.getNode(id).name).sort()
        hidden.push(`{${names.join(', ')}} attacks ${aba.getNode(head).name}`)
        continue
      }
      drawn.add(key)
      if (tail.length === 1) links.push({ sourceId: tail[0]!, targetId: head, type })
      else hyperLinks.push({ sourceIds: tail, targetId: head, type })
    }
  }
  add(supports, LinkType.DOUBLE)
  add(attacks, LinkType.SINGLE)
  const annotations = new Map<NodeId, { content: string }>()
  for (const id of alwaysDerived) annotations.set(id, { content: 'always derived' })
  for (const id of alwaysOut) annotations.set(id, { content: 'always out' })
  return {
    state: { stateId, nodes, links, hyperLinks, redraw: true },
    annotations,
    shapes: new Map(),
    positionKeys: new Map(nodes.map((n) => [n.id, String(n.id)])),
    unplaced: [],
    note: hidden.length > 0 ? `also: ${hidden.join('; ')}` : undefined,
  }
}

// AF nodes are support-unique arguments, labelled `(support, claims)` by atom name.
export function afCanvas(aba: ABAF, stateId: UUID, positions: ViewPositions): DerivedCanvas {
  const { af, total } = toAF(aba)
  const set = (ids: NodeId[]) =>
    `{${ids
      .map((id) => aba.getNode(id).name)
      .sort()
      .join(', ')}}`
  const positionKeys = new Map<NodeId, string>()
  const unplaced: NodeId[] = []
  const nodes = [...af.arguments()].map(([id, d]) => {
    const key = d.support.join(',')
    positionKeys.set(id, key)
    const position = positions[key]
    if (!position) unplaced.push(id)
    return { id, label: `(${set(d.support)}, ${set(d.claims)})`, ...(position ?? { x: 0, y: 0 }) }
  })
  const links = [...af.attacks()].map(([sourceId, targetId]) => ({
    sourceId,
    targetId,
    type: LinkType.SINGLE,
  }))
  return {
    state: { stateId, nodes, links, hyperLinks: [], redraw: true },
    annotations: new Map(),
    shapes: new Map(nodes.map((n) => [n.id, 'rect' as const])),
    positionKeys,
    unplaced,
    note: total > nodes.length ? `showing ${nodes.length} of ${total} arguments` : undefined,
  }
}
