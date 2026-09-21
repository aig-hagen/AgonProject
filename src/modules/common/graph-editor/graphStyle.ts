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
import { LINK_BLACK, NODE_BLUE } from '@/modules/common/colors'

export interface GraphStyle {
  nodeColor: string
  nodeStrokeColor: string
  nodeStrokeWidth: number
  linkColor: string
  linkStrokeWidth: number
  // Optional per-style label font. Omitted styles fall back to the global graph-label font
  // defined in style.css. Label fonts are CSS-only, so this may reference a CSS variable.
  nodeFont?: string
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

export const GRAPH_STYLE_DARK: GraphStyle = {
  nodeColor: '#4a7a9b',
  nodeStrokeColor: '#82b5d0',
  nodeStrokeWidth: 1.5,
  linkColor: '#c8dce8',
  linkStrokeWidth: 2.5,
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

// Amber outline over a faint amber-tinted fill: the ABA assumption-node scheme, with the
// identity in the border so the fill stays free for evaluation shading. The outline is the
// live `--color-secondary` token (stroke is CSS-only, so it can reference it); the fill is
// that token mixed 22% into base-100, precomputed per theme (fill goes through JS setColor).
export const GRAPH_STYLE_OUTLINE: GraphStyle = {
  nodeColor: '#f5e8d9',
  nodeStrokeColor: 'var(--color-secondary)',
  nodeStrokeWidth: 2,
  linkColor: LINK_BLACK,
  linkStrokeWidth: 2.5,
}

export const GRAPH_STYLE_OUTLINE_DARK: GraphStyle = {
  nodeColor: '#474745',
  nodeStrokeColor: 'var(--color-secondary)',
  nodeStrokeWidth: 2,
  linkColor: '#c8dce8',
  linkStrokeWidth: 2.5,
}
