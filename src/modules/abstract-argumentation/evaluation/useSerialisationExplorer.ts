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
import { computed, type Ref, ref, shallowRef, watch } from 'vue'

import {
  emptyGraph,
  fingerprintAF,
  type IndexedAF,
  nextPath,
  pathTo,
  reductFor,
  restoreGraph,
  ROOT_KEY,
  type SerialisationGraph,
  type StoredSerialisationGraph,
  storeGraph,
  withExpansion,
} from '@/modules/abstract-argumentation/evaluation/serialisationGraph'
import {
  fetchIsTerminal,
  fetchSelection,
} from '@/modules/abstract-argumentation/evaluation/tweetyProjectSerialisation'
import type { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'

/** The AF numbered the way the backend expects, plus a fingerprint of its structure. */
export function useIndexedAF(input: Ref<Input<AbstractArgumentation<ArgumentData>>>) {
  const argumentIds = computed<ArgumentId[]>(() =>
    [...input.value.content.arguments()].map(([id]) => id),
  )
  const af = computed<IndexedAF>(() => {
    const index = new Map(argumentIds.value.map((id, i) => [id, i + 1]))
    const attacks: [number, number][] = []
    for (const [src, tgt] of input.value.content.attacks())
      attacks.push([index.get(src)!, index.get(tgt)!])
    return { numberOfArgs: argumentIds.value.length, attacks }
  })
  const fingerprint = computed(() => fingerprintAF(argumentIds.value, af.value))
  return { argumentIds, af, fingerprint }
}

export function useSerialisationExplorer(options: {
  indexed: ReturnType<typeof useIndexedAF>
  selectionKey: Ref<string>
  terminationKey: Ref<string>
  /** Nothing is fetched until exploring is switched on. */
  enabled: Ref<boolean>
  stored: () => StoredSerialisationGraph | undefined
  persist: (stored: StoredSerialisationGraph) => void
}) {
  const { selectionKey, terminationKey, enabled } = options
  const { argumentIds, af, fingerprint } = options.indexed

  const graph = shallowRef<SerialisationGraph>(emptyGraph())
  const selectedPath = ref<string[]>([ROOT_KEY])
  const selected = computed(() => selectedPath.value[selectedPath.value.length - 1]!)
  const pending = shallowRef<ReadonlySet<string>>(new Set())
  const error = ref<Error | null>(null)
  const lastDurationMs = ref<number | undefined>(undefined)
  let lastAction: () => void = () => {}

  // Bumped on every reset so answers for a stale AF or stale α/β are dropped.
  let generation = 0
  let started = false

  async function expand(key: string) {
    const state = graph.value.states.get(key)
    if (!state || state.expanded || pending.value.has(key)) return
    const gen = generation
    pending.value = new Set([...pending.value, key])
    error.value = null
    try {
      const reduct = reductFor(af.value, state.extension)
      const [selection, terminal] = await Promise.all([
        fetchSelection(reduct.numberOfArgs, reduct.attacks, selectionKey.value),
        fetchIsTerminal(reduct.numberOfArgs, reduct.attacks, state.extension, terminationKey.value),
      ])
      if (gen !== generation) return
      const steps = selection.steps.map((step) => step.map((i) => reduct.originalIds[i - 1]!))
      graph.value = withExpansion(graph.value, key, steps, terminal.terminal)
      lastDurationMs.value = selection.evaluationDurationInMs + terminal.evaluationDurationInMs
    } catch (e) {
      if (gen !== generation) return
      error.value = e instanceof Error ? e : new Error(String(e))
      lastAction = () => void expand(key)
    } finally {
      if (gen === generation) pending.value = new Set([...pending.value].filter((k) => k !== key))
    }
  }

  function select(key: string) {
    selectedPath.value = nextPath(graph.value, selectedPath.value, key)
    void expand(key)
  }

  function back() {
    if (selectedPath.value.length > 1) selectedPath.value = selectedPath.value.slice(0, -1)
  }

  function reset() {
    generation++
    graph.value = emptyGraph()
    selectedPath.value = [ROOT_KEY]
    pending.value = new Set()
    error.value = null
    lastDurationMs.value = undefined
    void expand(ROOT_KEY)
  }

  function restore(): boolean {
    const stored = options.stored()
    if (
      !stored ||
      stored.fingerprint !== fingerprint.value ||
      stored.selectionFunctionKey !== selectionKey.value ||
      stored.terminationFunctionKey !== terminationKey.value
    )
      return false
    const restored = restoreGraph(stored, argumentIds.value)
    if (!restored) return false
    generation++
    graph.value = restored.graph
    selectedPath.value = pathTo(restored.graph, restored.selected)
    void expand(selected.value)
    return true
  }

  function start() {
    if (started || !enabled.value) return
    started = true
    if (!restore()) reset()
  }

  watch(enabled, start, { immediate: true })
  watch([fingerprint, selectionKey, terminationKey], () => {
    started = false
    start()
  })

  watch([graph, selectedPath], () => {
    if (!started) return
    options.persist(
      storeGraph(graph.value, selected.value, argumentIds.value, {
        fingerprint: fingerprint.value,
        selectionFunctionKey: selectionKey.value,
        terminationFunctionKey: terminationKey.value,
      }),
    )
  })

  return {
    graph,
    selectedPath,
    selected,
    pending,
    error,
    isLoading: computed(() => pending.value.size > 0),
    lastDurationMs,
    select,
    back,
    reset,
    retry: () => lastAction(),
  }
}
