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
import type { GraphEditorNodeShape } from '@/modules/common/graph-editor/graphEditor'
import { applyGraphLayout, type LayoutGraph } from '@/modules/common/graph-editor/layouting'
import { Layout } from '@/modules/common/main-menu/layouting'

export function theoryShapes(aba: ABAF): Map<NodeId, GraphEditorNodeShape> {
  const shapes = new Map<NodeId, GraphEditorNodeShape>()
  for (const [id, d] of aba.nodeEntries())
    shapes.set(id, d.kind === 'assumption' ? 'circle' : 'diamond')
  return shapes
}

// Facts show as node annotations; contraries are drawn as edges (see `theoryContraries`).
export function theoryAnnotations(aba: ABAF): Map<NodeId, { content: string }> {
  const annotations = new Map<NodeId, { content: string }>()
  for (const [id, d] of aba.nodeEntries()) {
    if (d.fact) annotations.set(id, { content: '⊤' })
  }
  return annotations
}

// Each contrary `‾a = x` as an edge from the contrary `x` to the assumption `a` it attacks.
export function theoryContraries(aba: ABAF): { contrary: NodeId; assumption: NodeId }[] {
  return aba
    .contraries()
    .filter(([assumption, contrary]) => aba.hasNode(assumption) && aba.hasNode(contrary))
    .map(([assumption, contrary]) => ({ contrary, assumption }))
}

// The theory view: rules are edges from their body to their head, contraries from the
// contrary to its assumption.
export function toLayoutGraph(aba: ABAF): LayoutGraph {
  const shapes = theoryShapes(aba)
  const annotations = theoryAnnotations(aba)
  return {
    nodes: [...aba.nodeEntries()].map(([id, { name }]) => ({
      id,
      label: name,
      shape: shapes.get(id),
      annotation: annotations.get(id)?.content,
    })),
    edges: [
      ...aba
        .rules()
        .filter((rule) => rule.body.length > 0)
        .map((rule) => ({ sources: rule.body, target: rule.head })),
      ...theoryContraries(aba).map(({ contrary, assumption }) => ({
        sources: [contrary],
        target: assumption,
      })),
    ],
  }
}

export function layout(aba: ABAF, layoutType: Layout = Layout.TopToBottom): Promise<void> {
  return applyGraphLayout(toLayoutGraph(aba), layoutType, (id, { x, y }) =>
    aba.setPosition(id, x, y),
  )
}
