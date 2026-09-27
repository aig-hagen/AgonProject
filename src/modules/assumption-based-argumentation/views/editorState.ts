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
import { toSETAF } from '@/modules/assumption-based-argumentation/views/setaf'
import {
  type GraphEditorState,
  type GraphEditorStateHyperLink,
  type GraphEditorStateLink,
  LinkType,
} from '@/modules/common/graph-editor/graphEditor'
import type { UUID } from '@/modules/common/ids'

export type AbaView = 'theory' | 'setaf'

export type ViewPositions = Record<NodeId, { x: number; y: number }>

export interface DerivedCanvas {
  state: GraphEditorState
  annotations: Map<NodeId, { content: string }>
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
  const annotations = new Map(alwaysOut.map((id) => [id, { content: 'always out' }]))
  return { state: { stateId, nodes, links, hyperLinks, redraw: true }, annotations }
}
