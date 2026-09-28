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
import type {
  DerivedCanvas,
  ViewPositions,
} from '@/modules/assumption-based-argumentation/views/editorState'
import { editorStateToLayoutGraph, layoutGraph } from '@/modules/common/graph-editor/layouting'
import { Layout } from '@/modules/common/main-menu/layouting'

// Positions for the canvas' unplaced nodes, keyed like `ViewPositions`; placed nodes stay pinned.
export async function layoutUnplaced(canvas: DerivedCanvas): Promise<ViewPositions> {
  const unplaced = new Set(canvas.unplaced)
  const graph = editorStateToLayoutGraph(canvas.state, canvas.shapes, canvas.annotations)
  for (const node of graph.nodes) {
    const { x, y } = canvas.state.nodes.find((n) => n.id === node.id)!
    if (!unplaced.has(node.id)) node.pinned = { x, y }
  }
  let laidOut = new Map<number, { x: number; y: number }>()
  try {
    laidOut = await layoutGraph(graph, Layout.Neato)
  } catch (error) {
    console.error('View layout failed', error)
  }
  // Every unplaced node gets a position, even if the layout failed, so it never reruns forever.
  const positions: ViewPositions = {}
  canvas.unplaced.forEach((id, index) => {
    const key = canvas.positionKeys.get(id)
    if (key !== undefined) positions[key] = laidOut.get(id) ?? { x: index * 120, y: 0 }
  })
  return positions
}
