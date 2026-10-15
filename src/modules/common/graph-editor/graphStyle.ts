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
import type { GraphPresetId } from '@/modules/common/theme/palette'

export interface GraphStyle {
  nodeColor: string
  nodeStrokeColor: string
  nodeStrokeWidth: number
  linkColor: string
  linkStrokeWidth: number
  nodeLabelColor: string
}

// Colors are palette tokens (see palette.ts), resolved per theme by the graph editor.
function presetStyle(
  id: GraphPresetId,
  widths: Pick<GraphStyle, 'nodeStrokeWidth' | 'linkStrokeWidth'>,
): GraphStyle {
  return {
    nodeColor: `var(--graph-${id}-node)`,
    nodeStrokeColor: `var(--graph-${id}-stroke)`,
    linkColor: `var(--graph-${id}-link)`,
    nodeLabelColor: `var(--graph-${id}-label)`,
    ...widths,
  }
}

export const GRAPH_STYLES: Record<GraphPresetId, GraphStyle> = {
  default: presetStyle('default', { nodeStrokeWidth: 1.5, linkStrokeWidth: 2.5 }),
  'high-contrast': presetStyle('high-contrast', { nodeStrokeWidth: 2.5, linkStrokeWidth: 3.5 }),
  minimal: presetStyle('minimal', { nodeStrokeWidth: 1, linkStrokeWidth: 1.5 }),
  // AIG yellow nodes and AIG blue links, without a node border.
  library: presetStyle('library', { nodeStrokeWidth: 0, linkStrokeWidth: 2.5 }),
  // The ABA assumption-node scheme: identity in the amber border, so the fill stays free for
  // evaluation shading.
  outline: presetStyle('outline', { nodeStrokeWidth: 2, linkStrokeWidth: 2.5 }),
}
