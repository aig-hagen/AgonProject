/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
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
import { LINK_BLACK, NODE_BLUE } from '@/modules/common/colors'

export interface GraphStyle {
  nodeColor: string
  nodeStrokeColor: string
  nodeStrokeWidth: number
  linkColor: string
  linkStrokeWidth: number
}

export const GRAPH_STYLE_DEFAULT: GraphStyle = {
  nodeColor: NODE_BLUE,
  nodeStrokeColor: '#5a87a8',
  nodeStrokeWidth: 1.5,
  linkColor: LINK_BLACK,
  linkStrokeWidth: 2.5,
}

export const GRAPH_STYLE_HIGH_CONTRAST: GraphStyle = {
  nodeColor: '#5a87a8',
  nodeStrokeColor: '#2c5470',
  nodeStrokeWidth: 2.5,
  linkColor: '#000000',
  linkStrokeWidth: 3.5,
}

export const GRAPH_STYLE_MINIMAL: GraphStyle = {
  nodeColor: '#e8f0f7',
  nodeStrokeColor: '#8aa0b4',
  nodeStrokeWidth: 1,
  linkColor: '#444444',
  linkStrokeWidth: 1.5,
}

// Matches the graph-component library's built-in defaults:
// orange nodes (#eb9850), navy edges (#004c97), no node border.
export const GRAPH_STYLE_LIBRARY: GraphStyle = {
  nodeColor: '#eb9850',
  nodeStrokeColor: 'transparent',
  nodeStrokeWidth: 0,
  linkColor: '#004c97',
  linkStrokeWidth: 2.5,
}
