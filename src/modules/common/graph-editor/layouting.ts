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
import type { Graphviz } from '@hpcc-js/wasm-graphviz'

import { ARGUMENT_RADIUS_IN_PX } from '@/modules/common/argumentation/model'
import type {
  GraphEditorNodeShape,
  GraphEditorState,
} from '@/modules/common/graph-editor/graphEditor'
import { Layout } from '@/modules/common/main-menu/layouting'

const NUMERIC_ID_TO_STRING_RADIX = 16

// Graphviz ships an ~820 kB WASM blob only needed for auto-layout, so load it on
// first use (memoized) and keep it off the initial bundle. `prefetchGraphviz`
// lets the editor warm it in the background so the first relayout stays snappy.
let graphvizPromise: Promise<Graphviz> | null = null
function loadGraphviz(): Promise<Graphviz> {
  graphvizPromise ??= import('@hpcc-js/wasm-graphviz').then((module) => module.Graphviz.load())
  return graphvizPromise
}

export function prefetchGraphviz(): void {
  void loadGraphviz()
}

interface DotJson {
  // Objects is unset, when the graph has no nodes.
  objects?: {
    name: string
    pos: string
  }[]
}

interface Position {
  x: number
  y: number
}

export type LayoutNodeShape = GraphEditorNodeShape

export interface LayoutNode {
  id: number
  label: string
  shape?: LayoutNodeShape
  // Text drawn below the node; the layout reserves room for it.
  annotation?: string
  // Kept in place by `neato`; other engines ignore it.
  pinned?: Position
}

// A plain edge has one source; a hyperedge (collective attack, multi-premise rule) several.
export interface LayoutEdge {
  sources: number[]
  target: number
}

export interface LayoutGraph {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
}

const PIXEL_PER_INCH = 72
const inch = (px: number) => (px / PIXEL_PER_INCH).toFixed(3)
const dotId = (id: number) => `"${id.toString(NUMERIC_ID_TO_STRING_RADIX)}"`
const ANNOTATION_GAP = 6

// Mirrors the node props in GraphEditor.vue; rect labels are 0.8rem monospace and autogrow.
function nodeSize({ shape = 'circle', label }: LayoutNode) {
  const r = ARGUMENT_RADIUS_IN_PX
  if (shape === 'diamond') return { width: r * 2.7, height: r * 2 }
  if (shape === 'rect') return { width: Math.max(r * 2, label.length * 7.7 + 24), height: r * 1.4 }
  return { width: r * 2, height: r * 2 }
}

function annotationSize(text: string) {
  const lines = text.split('\n')
  return {
    width: Math.max(...lines.map((line) => line.length)) * 7.5 + 8,
    height: lines.length * 18,
  }
}

// The box Graphviz places: the node plus its annotation below it. `offset` is how far the node
// centre sits above the box centre.
function layoutBox(node: LayoutNode) {
  const size = nodeSize(node)
  if (!node.annotation) return { ...size, offset: 0 }
  const note = annotationSize(node.annotation)
  const extra = note.height + ANNOTATION_GAP
  return {
    width: Math.max(size.width, note.width),
    height: size.height + extra,
    offset: extra / 2,
  }
}

const engineOf = (layout: Layout): 'dot' | 'fdp' | 'neato' | 'circo' | 'twopi' =>
  layout === Layout.ForceDirected
    ? 'fdp'
    : layout === Layout.Neato
      ? 'neato'
      : layout === Layout.Circular
        ? 'circo'
        : layout === Layout.Radial
          ? 'twopi'
          : 'dot'

function graphAttributes(layout: Layout, packed: boolean): string[] {
  const pack = packed ? ['  pack=true'] : []
  switch (layout) {
    case Layout.TopToBottom:
    case Layout.BottomToTop:
    case Layout.LeftToRight:
    case Layout.RightToLeft: {
      const rankdir = { TopToBottom: 'TB', BottomToTop: 'BT', LeftToRight: 'LR', RightToLeft: 'RL' }
      return [
        `  rankdir="${rankdir[layout]}"`,
        '  ranksep=1',
        `  nodesep=${inch(ARGUMENT_RADIUS_IN_PX / 2)}`,
      ]
    }
    case Layout.ForceDirected:
      return ['  overlap=false', '  K=1.5', '  sep="+10"', ...pack]
    case Layout.Neato:
      return ['  inputscale=72', '  overlap=false', '  sep="+16"', '  edge[len=2]', ...pack]
    case Layout.Radial:
      return ['  ranksep=2']
    default:
      return []
  }
}

// Stable order and no redundant springs: exact duplicates and self-loops go, and force
// engines also merge a mutual pair into one edge.
function normalizeEdges(edges: LayoutEdge[], directed: boolean): LayoutEdge[] {
  const seen = new Set<string>()
  const result: LayoutEdge[] = []
  for (const edge of edges) {
    const sources = [...new Set(edge.sources)].sort((a, b) => a - b)
    if (sources.length === 0) continue
    if (sources.length === 1 && sources[0] === edge.target) continue
    const key =
      sources.length === 1 && !directed
        ? [sources[0]!, edge.target].sort((a, b) => a - b).join('-')
        : `${sources.join(',')}>${edge.target.toString()}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({ sources, target: edge.target })
  }
  return result.sort(
    (a, b) => a.target - b.target || a.sources.join(',').localeCompare(b.sources.join(',')),
  )
}

// What the editor draws: its shapes, labels, annotations, links and hyperlinks.
export function editorStateToLayoutGraph(
  state: Pick<GraphEditorState, 'nodes' | 'links' | 'hyperLinks'>,
  shapes?: Map<number, LayoutNodeShape>,
  annotations?: Map<number, { content: string }>,
): LayoutGraph {
  return {
    nodes: state.nodes.map(({ id, label }) => ({
      id,
      label,
      shape: shapes?.get(id),
      annotation: annotations?.get(id)?.content,
    })),
    edges: [
      ...state.links.map((link) => ({ sources: [link.sourceId], target: link.targetId })),
      ...(state.hyperLinks ?? []).map((link) => ({
        sources: link.sourceIds,
        target: link.targetId,
      })),
    ],
  }
}

export function layoutGraphToDot(graph: LayoutGraph, layout: Layout): string {
  const engine = engineOf(layout)
  const pins = engine === 'neato' && graph.nodes.some((node) => node.pinned)
  // Circular engines would put a junction on the circle like any node, so they get plain edges.
  const junctions = engine !== 'circo' && engine !== 'twopi'
  const nodes = [...graph.nodes].sort((a, b) => a.label.localeCompare(b.label) || a.id - b.id)
  const lines = ['digraph {', ...graphAttributes(layout, !pins), '  node[fixedsize=true shape=box]']
  for (const node of nodes) {
    const { width, height } = layoutBox(node)
    // Graphviz' y axis points up, the editor's down.
    const pos =
      pins && node.pinned
        ? ` pos="${node.pinned.x.toString()},${(-node.pinned.y - layoutBox(node).offset).toString()}!"`
        : ''
    lines.push(`  ${dotId(node.id)}[width=${inch(width)} height=${inch(height)}${pos}]`)
  }
  const edges = normalizeEdges(graph.edges, engine === 'dot')
  edges.forEach(({ sources, target }, index) => {
    if (sources.length === 1) {
      lines.push(`  ${dotId(sources[0]!)} -> ${dotId(target)}`)
    } else if (!junctions) {
      for (const source of sources) lines.push(`  ${dotId(source)} -> ${dotId(target)}`)
    } else {
      // Short source legs keep a set together without collapsing the junction onto it.
      const junction = `"j${index.toString()}"`
      const [sourceLen, targetLen] = engine === 'neato' ? ['[len=1]', '[len=1.5]'] : ['', '']
      lines.push(`  ${junction}[shape=point width=0.05]`)
      for (const source of sources) lines.push(`  ${dotId(source)} -> ${junction}${sourceLen}`)
      lines.push(`  ${junction} -> ${dotId(target)}${targetLen}`)
    }
  })
  lines.push('}')
  return lines.join('\n')
}

// Positions in editor coordinates. With pins, the drawing is realigned on a pinned node, since
// Graphviz may translate it.
export async function layoutGraph(
  graph: LayoutGraph,
  layout: Layout,
): Promise<Map<number, Position>> {
  if (graph.nodes.length === 0) return new Map()
  const graphviz = await loadGraphviz()
  const dotJson = JSON.parse(
    graphviz[engineOf(layout)](layoutGraphToDot(graph, layout), 'json'),
  ) as DotJson
  const byId = new Map(graph.nodes.map((node) => [node.id, node]))
  const positions = new Map<number, Position>()
  for (const { name, pos } of dotJson.objects ?? []) {
    const id = parseInt(name, NUMERIC_ID_TO_STRING_RADIX)
    const node = byId.get(id)
    const [x, y] = pos.split(',').map(Number.parseFloat)
    if (!node || !Number.isFinite(x) || !Number.isFinite(y)) continue
    positions.set(id, { x: x!, y: -y! - layoutBox(node).offset })
  }
  const anchor =
    engineOf(layout) === 'neato'
      ? graph.nodes.find((n) => n.pinned && positions.has(n.id))
      : undefined
  if (anchor) {
    const laidOut = positions.get(anchor.id)!
    const dx = anchor.pinned!.x - laidOut.x
    const dy = anchor.pinned!.y - laidOut.y
    for (const [id, p] of positions) positions.set(id, { x: p.x + dx, y: p.y + dy })
  }
  return positions
}

// Lays out a document in place; `place` writes one node's position back into it.
export async function applyGraphLayout(
  graph: LayoutGraph,
  layout: Layout,
  place: (id: number, position: Position) => void,
): Promise<void> {
  for (const [id, position] of await layoutGraph(graph, layout)) place(id, position)
}
