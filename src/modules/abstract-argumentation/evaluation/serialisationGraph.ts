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
// Arguments are 1-based indices into the AF's argument order, as the backend numbers them.
export type ArgIndex = number

export interface IndexedAF {
  numberOfArgs: number
  attacks: [ArgIndex, ArgIndex][]
}

export interface Reduct extends IndexedAF {
  /** originalIds[i] is the original index of reduct argument i + 1. */
  originalIds: ArgIndex[]
}

export interface SerialisationState {
  key: string
  extension: ArgIndex[]
  /** Undefined until `is_terminal` has been asked or a sequence ended here. */
  terminal?: boolean
  /** Whether all selectable successors are known. */
  expanded: boolean
}

export interface SerialisationEdge {
  from: string
  to: string
  step: ArgIndex[]
}

export interface SerialisationGraph {
  states: ReadonlyMap<string, SerialisationState>
  edges: readonly SerialisationEdge[]
}

export const ROOT_KEY = ''

export function stateKey(extension: Iterable<ArgIndex>): string {
  return [...extension].sort((a, b) => a - b).join(',')
}

export function emptyGraph(): SerialisationGraph {
  return {
    states: new Map([[ROOT_KEY, { key: ROOT_KEY, extension: [], expanded: false }]]),
    edges: [],
  }
}

// Reducing by E in one go equals reducing step by step, so a state alone fixes its reduct.
export function reductFor(af: IndexedAF, extension: readonly ArgIndex[]): Reduct {
  const inE = new Set(extension)
  const removed = new Set(extension)
  for (const [src, tgt] of af.attacks) if (inE.has(src)) removed.add(tgt)
  const originalIds: ArgIndex[] = []
  for (let i = 1; i <= af.numberOfArgs; i++) if (!removed.has(i)) originalIds.push(i)
  const reindex = new Map(originalIds.map((id, idx) => [id, idx + 1]))
  const attacks = af.attacks
    .filter(([src, tgt]) => !removed.has(src) && !removed.has(tgt))
    .map(([src, tgt]) => [reindex.get(src)!, reindex.get(tgt)!] as [ArgIndex, ArgIndex])
  return { numberOfArgs: originalIds.length, attacks, originalIds }
}

class GraphBuilder {
  states: Map<string, SerialisationState>
  edges: SerialisationEdge[]
  private edgeKeys: Set<string>

  constructor(graph: SerialisationGraph) {
    this.states = new Map([...graph.states].map(([k, s]) => [k, { ...s }]))
    this.edges = [...graph.edges]
    this.edgeKeys = new Set(this.edges.map((e) => `${e.from}>${e.to}`))
  }

  state(extension: readonly ArgIndex[]): SerialisationState {
    const key = stateKey(extension)
    let state = this.states.get(key)
    if (!state) {
      state = { key, extension: [...extension].sort((a, b) => a - b), expanded: false }
      this.states.set(key, state)
    }
    return state
  }

  step(from: SerialisationState, step: readonly ArgIndex[]): SerialisationState {
    const to = this.state([...from.extension, ...step])
    const edgeKey = `${from.key}>${to.key}`
    if (!this.edgeKeys.has(edgeKey)) {
      this.edgeKeys.add(edgeKey)
      this.edges.push({ from: from.key, to: to.key, step: [...step].sort((a, b) => a - b) })
    }
    return to
  }

  build(): SerialisationGraph {
    return { states: this.states, edges: this.edges }
  }
}

/** Adds the successors of `key`, given as steps in original indices. */
export function withExpansion(
  graph: SerialisationGraph,
  key: string,
  steps: readonly ArgIndex[][],
  terminal: boolean,
): SerialisationGraph {
  const builder = new GraphBuilder(graph)
  const from = builder.states.get(key)
  if (!from) return graph
  from.expanded = true
  from.terminal = terminal
  for (const step of steps) builder.step(from, step)
  return builder.build()
}

/** Merges complete sequences; each one ends in a terminal state. */
export function withSequences(
  graph: SerialisationGraph,
  sequences: readonly (readonly ArgIndex[][])[],
): SerialisationGraph {
  const builder = new GraphBuilder(graph)
  for (const sequence of sequences) {
    let state = builder.state([])
    for (const step of sequence) state = builder.step(state, step)
    state.terminal = true
  }
  return builder.build()
}

/** The graph of a complete `get_sequences` answer: every state is settled, terminal iff a sequence ends there. */
export function graphFromSequences(
  sequences: readonly (readonly ArgIndex[][])[],
): SerialisationGraph {
  const graph = withSequences(emptyGraph(), sequences)
  const states = new Map(
    [...graph.states].map(([key, s]) => [
      key,
      { ...s, expanded: true, terminal: s.terminal ?? false },
    ]),
  )
  return { states, edges: graph.edges }
}

/** State keys a sequence passes through, root first. */
export function statesAlong(sequence: readonly ArgIndex[][]): string[] {
  const keys = [ROOT_KEY]
  const extension: ArgIndex[] = []
  for (const step of sequence) {
    extension.push(...step)
    keys.push(stateKey(extension))
  }
  return keys
}

export function childrenOf(graph: SerialisationGraph, key: string): SerialisationEdge[] {
  return graph.edges.filter((e) => e.from === key)
}

/** A path of state keys from the root to `key`, preferring the first-discovered parents. */
export function pathTo(graph: SerialisationGraph, key: string): string[] {
  const parent = new Map<string, string>()
  const queue = [ROOT_KEY]
  const seen = new Set(queue)
  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === key) break
    for (const edge of childrenOf(graph, current)) {
      if (seen.has(edge.to)) continue
      seen.add(edge.to)
      parent.set(edge.to, current)
      queue.push(edge.to)
    }
  }
  if (key !== ROOT_KEY && !parent.has(key)) return [ROOT_KEY]
  const path = [key]
  while (path[0] !== ROOT_KEY) path.unshift(parent.get(path[0]!)!)
  return path
}

/** The path after selecting `key`: back along the path, one step forward, or a fresh root path. */
export function nextPath(
  graph: SerialisationGraph,
  path: readonly string[],
  key: string,
): string[] {
  const at = path.indexOf(key)
  if (at >= 0) return path.slice(0, at + 1)
  const last = path[path.length - 1]
  if (graph.edges.some((e) => e.from === last && e.to === key)) return [...path, key]
  return pathTo(graph, key)
}

export interface GraphLayout {
  /** columns[c] lists state keys top to bottom. */
  columns: string[][]
  position: ReadonlyMap<string, { column: number; row: number }>
}

// Edges only go to strict supersets, so sorting by extension size is a topological order.
export function layoutGraph(graph: SerialisationGraph): GraphLayout {
  const order = [...graph.states.values()].sort((a, b) => a.extension.length - b.extension.length)
  const parents = new Map<string, string[]>()
  for (const edge of graph.edges) parents.set(edge.to, [...(parents.get(edge.to) ?? []), edge.from])

  const depth = new Map<string, number>()
  for (const state of order) {
    const ps = parents.get(state.key) ?? []
    depth.set(state.key, ps.length === 0 ? 0 : Math.max(...ps.map((p) => depth.get(p)! + 1)))
  }

  const columns: string[][] = []
  for (const state of graph.states.values()) {
    const d = depth.get(state.key)!
    ;(columns[d] ??= []).push(state.key)
  }

  const position = new Map<string, { column: number; row: number }>()
  columns.forEach((column, c) => {
    const discovery = new Map(column.map((key, i) => [key, i]))
    const barycenter = (key: string) => {
      const rows = (parents.get(key) ?? []).map((p) => position.get(p)?.row ?? 0)
      return rows.length === 0 ? 0 : rows.reduce((a, b) => a + b, 0) / rows.length
    }
    column.sort((a, b) => barycenter(a) - barycenter(b) || discovery.get(a)! - discovery.get(b)!)
    column.forEach((key, row) => position.set(key, { column: c, row }))
  })
  return { columns, position }
}

export interface TerminalPaths {
  /** Each sequence lists its steps and the state keys it passes, root first. */
  paths: { steps: ArgIndex[][]; states: string[] }[]
  truncated: boolean
}

/** Every root path ending in a known terminal state, up to `limit`. */
export function terminalPaths(graph: SerialisationGraph, limit = 500): TerminalPaths {
  const paths: TerminalPaths['paths'] = []
  let truncated = false
  // Bounds the walk too: a DAG can have exponentially many paths without terminal states.
  let budget = limit * 50
  const walk = (key: string, steps: ArgIndex[][], states: string[]) => {
    if (truncated) return
    if (--budget < 0) {
      truncated = true
      return
    }
    if (graph.states.get(key)?.terminal) {
      if (paths.length >= limit) {
        truncated = true
        return
      }
      paths.push({ steps, states })
    }
    for (const edge of childrenOf(graph, key))
      walk(edge.to, [...steps, edge.step], [...states, edge.to])
  }
  walk(ROOT_KEY, [], [ROOT_KEY])
  return { paths, truncated }
}

// --- Persistence: arguments are stored by id so a reordered AF can't remap them silently. ---

export interface StoredSerialisationGraph {
  fingerprint: string
  selectionFunctionKey: string
  terminationFunctionKey: string
  states: { extension: number[]; terminal?: boolean; expanded: boolean }[]
  edges: { from: number[]; step: number[] }[]
  selected: number[]
}

export function fingerprintAF(argumentIds: readonly number[], af: IndexedAF): string {
  const attacks = af.attacks.map(([s, t]) => `${s}>${t}`).sort()
  return `${argumentIds.join(',')}|${attacks.join(',')}`
}

export function storeGraph(
  graph: SerialisationGraph,
  selected: string,
  argumentIds: readonly number[],
  meta: Pick<
    StoredSerialisationGraph,
    'fingerprint' | 'selectionFunctionKey' | 'terminationFunctionKey'
  >,
): StoredSerialisationGraph {
  const ids = (indices: readonly ArgIndex[]) => indices.map((i) => argumentIds[i - 1]!)
  const extensionOf = (key: string) => graph.states.get(key)?.extension ?? []
  return {
    ...meta,
    states: [...graph.states.values()].map(({ extension, terminal, expanded }) => ({
      extension: ids(extension),
      ...(terminal === undefined ? {} : { terminal }),
      expanded,
    })),
    edges: graph.edges.map((e) => ({ from: ids(extensionOf(e.from)), step: ids(e.step) })),
    selected: ids(extensionOf(selected)),
  }
}

export function restoreGraph(
  stored: StoredSerialisationGraph,
  argumentIds: readonly number[],
): { graph: SerialisationGraph; selected: string } | undefined {
  const index = new Map(argumentIds.map((id, i) => [id, i + 1]))
  const indices = (ids: readonly number[]) => {
    const out = ids.map((id) => index.get(id))
    return out.every((i) => i !== undefined) ? (out as ArgIndex[]) : undefined
  }
  const builder = new GraphBuilder(emptyGraph())
  for (const s of stored.states) {
    const extension = indices(s.extension)
    if (!extension) return undefined
    const state = builder.state(extension)
    state.expanded = s.expanded
    if (s.terminal !== undefined) state.terminal = s.terminal
  }
  for (const e of stored.edges) {
    const from = indices(e.from)
    const step = indices(e.step)
    if (!from || !step) return undefined
    builder.step(builder.state(from), step)
  }
  const selected = indices(stored.selected)
  return { graph: builder.build(), selected: selected ? stateKey(selected) : ROOT_KEY }
}
