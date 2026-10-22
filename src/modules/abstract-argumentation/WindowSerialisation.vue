<!--
  AgonProject - The platform to explore different approaches to formal argumentation.

  Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed, provide, ref, shallowRef, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  type ArgIndex,
  childrenOf,
  emptyGraph,
  graphFromSequences,
  nextPath,
  ROOT_KEY,
  type SerialisationGraph,
  statesAlong,
  type StoredSerialisationGraph,
  terminalPaths,
} from '@/modules/abstract-argumentation/evaluation/serialisationGraph'
import type { SerialisationWindowInstanceState } from '@/modules/abstract-argumentation/evaluation/serialisationWindowState'
import {
  SELECTION_FUNCTIONS,
  SERIALISATION_TIMEOUT_IN_MS,
  type SerialisationFunction,
  TERMINATION_FUNCTIONS,
  useSerialisationSequencesQuery,
} from '@/modules/abstract-argumentation/evaluation/tweetyProjectSerialisation'
import {
  useIndexedAF,
  useSerialisationExplorer,
} from '@/modules/abstract-argumentation/evaluation/useSerialisationExplorer'
import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import SerialisationGraphView from '@/modules/abstract-argumentation/SerialisationGraphView.vue'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { DocumentId } from '@/modules/common/documents/db'
import BaseEvaluationWindow, {
  type EvaluationWindowQuery,
} from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import EvaluationStatusFooter from '@/modules/common/evaluation/EvaluationStatusFooter.vue'
import {
  binaryAttacks,
  extensionLabels,
  labelsToHighlight,
} from '@/modules/common/evaluation/labeling'
import type { Input } from '@/modules/common/evaluation/types'
import { escapeTexText } from '@/modules/common/export/texEscape'
import ParameterField from '@/modules/common/forms/ParameterField.vue'
import PickerSelect, { type PickerOption } from '@/modules/common/forms/PickerSelect.vue'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import SegmentedControl from '@/modules/common/settings/SegmentedControl.vue'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const {
  input,
  instanceState,
  instanceOffset = 0,
  documentId,
  stateKey,
  suppressed = false,
  hosted = false,
} = defineProps<{
  input: Input<AbstractArgumentation<ArgumentData>>
  instanceState: SerialisationWindowInstanceState
  instanceOffset?: number
  documentId?: DocumentId
  stateKey?: string
  suppressed?: boolean
  hosted?: boolean
}>()

const emit = defineEmits<{
  'update:instanceState': [state: SerialisationWindowInstanceState]
  highlight: [highlight?: Highlight]
  title: [title: string]
  close: []
  focus: []
}>()

provide(TOOLTIP_REGISTRY_KEY, abstractArgumentationGlossary)

const { t } = useI18n({ useScope: 'global' })

// Past this many states the graph gets hard to read, so the list takes over once.
const LIST_VIEW_THRESHOLD = 60

function resolveFunction(fns: SerialisationFunction[], key: string): SerialisationFunction {
  return fns.find((f) => f.key === key) ?? fns[0]!
}

const toPickerOptions = (fns: SerialisationFunction[]): PickerOption[] =>
  fns.map((fn) => ({ value: fn.key, label: fn.displayName }))
const selectionOptions = toPickerOptions(SELECTION_FUNCTIONS)
const terminationOptions = toPickerOptions(TERMINATION_FUNCTIONS)

// --- Persistent window state ---
const selectedSelectionFunction = shallowRef<SerialisationFunction>(
  resolveFunction(SELECTION_FUNCTIONS, instanceState.selectionFunctionKey),
)
const selectedTerminationFunction = shallowRef<SerialisationFunction>(
  resolveFunction(TERMINATION_FUNCTIONS, instanceState.terminationFunctionKey),
)
const view = ref<'graph' | 'list'>(instanceState.view ?? 'graph')
const exploring = ref(instanceState.exploring ?? false)
const explored = shallowRef<StoredSerialisationGraph | undefined>(instanceState.explored)

watch([selectedSelectionFunction, selectedTerminationFunction, view, exploring, explored], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    selectionFunctionKey: selectedSelectionFunction.value.key,
    terminationFunctionKey: selectedTerminationFunction.value.key,
    view: view.value,
    exploring: exploring.value,
    explored: explored.value,
  })
})

const windowTitle = computed(
  () =>
    `${selectedSelectionFunction.value.displayName} · ${selectedTerminationFunction.value.displayName}`,
)

// The compact host labels its switcher pill with this title (not the raw key).
watch(windowTitle, (t) => emit('title', t), { immediate: true })

const selectionKey = computed(() => selectedSelectionFunction.value.key)
// The glossary labels carry the notation, e.g. $\alpha_{\mathsf{ad}}$; returned without delimiters.
function notationOf(fn: SerialisationFunction): string {
  const label = abstractArgumentationGlossary[fn.tooltipId]?.label
  return label?.startsWith('$') && label.endsWith('$')
    ? label.slice(1, -1)
    : `\\text{${fn.displayName}}`
}
const terminationKey = computed(() => selectedTerminationFunction.value.key)
const indexed = useIndexedAF(toRef(() => input))

// Exploring only replaces the graph view; the list always shows the full result.
const isExploring = computed(() => view.value === 'graph' && exploring.value)

// --- Full result: every sequence at once ---
const query = useSerialisationSequencesQuery(
  indexed.af,
  selectionKey,
  terminationKey,
  computed(() => !isExploring.value),
)
const fullSequences = computed(() => query.data.value?.rawSequences)
const fullGraph = computed(() =>
  fullSequences.value ? graphFromSequences(fullSequences.value) : undefined,
)
const fullPath = ref<string[]>([ROOT_KEY])
watch(fullGraph, () => (fullPath.value = [ROOT_KEY]))

watch(
  () => fullGraph.value?.states.size ?? 0,
  (size, previous) => {
    if (previous <= LIST_VIEW_THRESHOLD && size > LIST_VIEW_THRESHOLD) view.value = 'list'
  },
)

// --- Step-by-step exploration ---
const explorer = useSerialisationExplorer({
  indexed,
  selectionKey,
  terminationKey,
  enabled: isExploring,
  stored: () => explored.value,
  persist: (stored) => (explored.value = stored),
})

// --- What the graph view shows ---
const shownGraph = computed<SerialisationGraph>(() =>
  isExploring.value ? explorer.graph.value : (fullGraph.value ?? emptyGraph()),
)
const shownPath = computed(() => (isExploring.value ? explorer.selectedPath.value : fullPath.value))
const selected = computed(() => shownPath.value[shownPath.value.length - 1]!)

function selectState(key: string) {
  if (isExploring.value) explorer.select(key)
  else fullPath.value = nextPath(shownGraph.value, fullPath.value, key)
}
function back() {
  if (isExploring.value) explorer.back()
  else if (fullPath.value.length > 1) fullPath.value = fullPath.value.slice(0, -1)
}

// --- Formatting ---
const argumentNames = computed(() => [...input.content.arguments()].map(([, { name }]) => name))
const extensionOf = (key: string): ArgIndex[] =>
  key === ROOT_KEY ? [] : key.split(',').map(Number)

function formatSet(indices: readonly ArgIndex[]): string {
  return indices.length === 0
    ? '∅'
    : `{${indices.map((i) => argumentNames.value[i - 1] ?? '?').join(', ')}}`
}
function formatSetTex(indices: readonly ArgIndex[]): string {
  return indices.length === 0
    ? '\\emptyset'
    : `\\{${indices.map((i) => escapeTexText(argumentNames.value[i - 1] ?? '?')).join(', ')}\\}`
}
const formatState = (key: string) => formatSet(extensionOf(key))
const formatSequence = (steps: readonly ArgIndex[][]) =>
  steps.length === 0 ? '∅' : steps.map(formatSet).join(' → ')

// --- Selected state (graph view) ---
const selectedState = computed(() => shownGraph.value.states.get(selected.value))
const selectedSteps = computed(() => {
  const path = shownPath.value
  return path.slice(1).map((key, i) => {
    const edge = shownGraph.value.edges.find((e) => e.from === path[i] && e.to === key)
    return edge?.step ?? []
  })
})
const nextSteps = computed(() => childrenOf(shownGraph.value, selected.value))

// --- List view: grouped by the extension each sequence ends in ---
const sequenceGroups = computed(() => {
  const groups = new Map<string, { states: string[]; steps: ArgIndex[][] }[]>()
  for (const steps of fullSequences.value ?? []) {
    const states = statesAlong(steps)
    const final = states[states.length - 1]!
    groups.set(final, [...(groups.get(final) ?? []), { states, steps }])
  }
  return [...groups].map(([final, paths]) => ({ final, paths }))
})
// Groups start collapsed and stay as the user left them while the result refreshes.
const expandedGroups = ref<ReadonlySet<string>>(new Set())
function toggleGroup(final: string) {
  const next = new Set(expandedGroups.value)
  if (!next.delete(final)) next.add(final)
  expandedGroups.value = next
}
const isSelectedPath = (states: readonly string[]) =>
  states.length === fullPath.value.length && states.every((key, i) => key === fullPath.value[i])

// --- Footer and copy: whatever the current view is built from ---
const exploredPaths = computed(() => terminalPaths(explorer.graph.value))
const footerSequences = computed(() =>
  isExploring.value ? exploredPaths.value.paths.map((p) => p.steps) : (fullSequences.value ?? []),
)

const copyText = computed(() =>
  footerSequences.value.length ? footerSequences.value.map(formatSequence).join('\n') : undefined,
)
const copyTextTex = computed(() =>
  footerSequences.value.length
    ? footerSequences.value.map((steps) => steps.map(formatSetTex).join(' \\to ')).join('\n')
    : undefined,
)

const selectionHint = computed(() => {
  if (view.value === 'list') return t('evaluation.serialisation.selectSequenceHint')
  return isExploring.value
    ? t('evaluation.serialisation.exploreStateHint')
    : t('evaluation.serialisation.selectStateHint')
})

// Matches the other evaluation windows: count · hint · time, counts only when there are results.
const statusLine = computed(() => {
  const graph = isExploring.value ? explorer.graph.value : fullGraph.value
  if (!graph) return undefined
  const parts: string[] = []
  const count = footerSequences.value.length
  if (count > 0) {
    // Each terminal state is one extension.
    const extensions = [...graph.states.values()].filter((s) => s.terminal).length
    parts.push(t('evaluation.counts.extensions', extensions))
    parts.push(
      isExploring.value && exploredPaths.value.truncated
        ? t('evaluation.serialisation.sequencesTruncated', { n: count })
        : t('evaluation.counts.sequences', count),
    )
  }
  // Exploring starts without results, which is exactly when the hint is needed.
  if (count > 0 || isExploring.value) parts.push(selectionHint.value)
  const ms = isExploring.value
    ? explorer.lastDurationMs.value
    : query.data.value?.evaluationDurationInMs
  if (ms !== undefined) parts.push(`${ms}ms`)
  return parts.join(' · ') || undefined
})

// --- Canvas highlight: the hovered state previews, otherwise the selected one shows ---
const hovered = ref<string | undefined>(undefined)
watch([shownGraph, view], () => (hovered.value = undefined))

const currentHighlight = computed<Highlight | undefined>(() => {
  const extension = extensionOf(hovered.value ?? selected.value)
  if (extension.length === 0) return undefined
  const ids = indexed.argumentIds.value
  const nodes = new Set(extension.map((i) => ids[i - 1]!))
  return labelsToHighlight(
    input.stateId,
    extensionLabels(nodes, binaryAttacks(input.content.attacks())),
    t,
    { undecided: true },
  )
})

// Always reported; the host's useEvaluationFocus picks which window paints the canvas.
watch(currentHighlight, (h) => emit('highlight', h), { immediate: true })
const isActive = computed(() => !suppressed && currentHighlight.value !== undefined)

const evaluationQuery: EvaluationWindowQuery = {
  status: computed(() =>
    isExploring.value ? (explorer.error.value ? 'error' : 'success') : query.status.value,
  ),
  error: computed(() => (isExploring.value ? explorer.error.value : query.error.value)),
  isPending: computed(() => {
    if (!isExploring.value) return query.isPending.value
    const root = explorer.graph.value.states.get(ROOT_KEY)
    return explorer.graph.value.edges.length === 0 && !root?.expanded
  }),
  isLoading: computed(() => (isExploring.value ? explorer.isLoading.value : query.isLoading.value)),
  isError: computed(() =>
    isExploring.value ? explorer.error.value !== null : query.isError.value,
  ),
  refetch: () => (isExploring.value ? explorer.retry() : void query.refetch()),
  timeoutMs: SERIALISATION_TIMEOUT_IN_MS,
}
</script>

<template>
  <BaseEvaluationWindow
    :title="windowTitle"
    :hosted="hosted"
    :instance-offset="instanceOffset"
    :initial-position-base="{ x: 256, y: 96 }"
    :initial-size="{ width: 576, height: 520 }"
    :query="evaluationQuery"
    :document-id="documentId"
    :state-key="stateKey"
    :active="isActive"
    @close="emit('close')"
    @focus="emit('focus')"
  >
    <template #parameters>
      <ParameterField :label="t('evaluation.fields.selection')" min-width="9rem">
        <PickerSelect
          :model-value="selectedSelectionFunction.key"
          :options="selectionOptions"
          @update:model-value="
            selectedSelectionFunction = resolveFunction(SELECTION_FUNCTIONS, $event)
          "
        />
      </ParameterField>
      <ParameterField :label="t('evaluation.fields.termination')" min-width="9rem">
        <PickerSelect
          :model-value="selectedTerminationFunction.key"
          :options="terminationOptions"
          @update:model-value="
            selectedTerminationFunction = resolveFunction(TERMINATION_FUNCTIONS, $event)
          "
        />
      </ParameterField>
    </template>
    <template #parameters-footer>
      <TermDefinitionBlock :id="selectedSelectionFunction.tooltipId" />
      <TermDefinitionBlock :id="selectedTerminationFunction.tooltipId" />
    </template>
    <template #results>
      <div class="flex flex-wrap items-center gap-2">
        <SegmentedControl
          v-model="view"
          :aria-label="t('evaluation.serialisation.view')"
          :options="[
            { value: 'graph', label: t('evaluation.serialisation.viewGraph') },
            { value: 'list', label: t('evaluation.serialisation.viewList') },
          ]"
        />
        <div v-if="view === 'graph'" class="ml-auto flex items-center gap-2">
          <button
            v-if="exploring"
            type="button"
            class="btn btn-xs btn-ghost"
            @click="explorer.reset()"
          >
            {{ t('common.actions.reset') }}
          </button>
          <label class="flex cursor-pointer items-center gap-2 text-sm">
            <input v-model="exploring" type="checkbox" class="toggle toggle-sm toggle-primary" />
            {{ t('evaluation.serialisation.explore') }}
          </label>
        </div>
      </div>

      <div
        v-if="!isExploring && fullSequences?.length === 0"
        data-evaluation-results
        role="alert"
        class="alert alert-info alert-soft"
      >
        <span>{{ t('evaluation.serialisation.noSequences') }}</span>
      </div>

      <template v-if="view === 'graph'">
        <SerialisationGraphView
          :graph="shownGraph"
          :selected-path="shownPath"
          :pending="explorer.pending.value"
          :format-state="formatState"
          :format-step="formatSet"
          @select="selectState"
          @hover="hovered = $event"
        />
        <p class="text-xs text-base-content/65">
          {{
            isExploring
              ? t('evaluation.serialisation.exploreLegend')
              : t('evaluation.serialisation.graphLegend')
          }}
        </p>
      </template>

      <template v-else>
        <div v-if="sequenceGroups.length > 0" data-evaluation-results class="flex flex-col gap-1">
          <section v-for="group in sequenceGroups" :key="group.final" class="flex flex-col gap-1">
            <h3>
              <button
                type="button"
                class="flex w-full items-center gap-1.5 rounded-field px-1 py-0.5 text-left text-sm hover:bg-base-200"
                :aria-expanded="expandedGroups.has(group.final)"
                @click="toggleGroup(group.final)"
                @mouseenter="hovered = group.final"
                @mouseleave="hovered = undefined"
              >
                <ChevronRightIcon
                  class="size-3.5 shrink-0 text-base-content/65 transition-transform"
                  :class="expandedGroups.has(group.final) && 'rotate-90'"
                />
                <span class="text-base font-(family-name:--font-graph) [word-spacing:-0.5ch]">{{
                  formatState(group.final)
                }}</span>
                <span class="text-xs text-base-content/65">
                  {{ t('evaluation.counts.sequences', group.paths.length) }}
                </span>
              </button>
            </h3>
            <ol v-if="expandedGroups.has(group.final)" class="flex flex-col gap-1">
              <li v-for="path in group.paths" :key="path.states.join('|')">
                <button
                  type="button"
                  class="btn btn-sm h-auto min-h-8 py-1 justify-start flex-wrap gap-1 font-normal"
                  :class="isSelectedPath(path.states) ? 'btn-soft' : 'btn-ghost'"
                  @click="fullPath = path.states"
                  @mouseenter="hovered = path.states[path.states.length - 1]"
                  @mouseleave="hovered = undefined"
                >
                  <span
                    v-if="path.steps.length === 0"
                    class="text-base font-(family-name:--font-graph) [word-spacing:-0.5ch]"
                    >∅</span
                  >
                  <template v-for="(step, i) in path.steps" :key="i">
                    <span v-if="i > 0" class="select-none text-base-content/65">&#x2192;</span>
                    <span
                      class="rounded-field border border-base-300 px-1.5 py-0.5 text-base font-(family-name:--font-graph) [word-spacing:-0.5ch]"
                    >
                      {{ formatSet(step) }}
                    </span>
                  </template>
                </button>
              </li>
            </ol>
          </section>
        </div>
      </template>

      <section
        v-if="view === 'graph' && selectedState"
        class="flex flex-col gap-1.5 rounded-field border border-base-300 bg-inset p-2.5"
        :aria-label="t('evaluation.serialisation.selectedState')"
      >
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-xs btn-ghost btn-square"
            :disabled="shownPath.length <= 1"
            :title="t('evaluation.serialisation.back')"
            :aria-label="t('evaluation.serialisation.back')"
            @click="back()"
          >
            <ChevronLeftIcon class="size-4" />
          </button>
          <span
            class="min-w-0 flex-1 truncate text-sm font-(family-name:--font-graph) [word-spacing:-0.5ch]"
          >
            {{ formatSequence(selectedSteps) }}
          </span>
          <span
            v-if="selectedState.terminal !== undefined"
            class="flex shrink-0 items-center gap-1 text-xs"
          >
            <KatexInlineElement
              :text="`$${notationOf(selectedTerminationFunction)} = ${selectedState.terminal ? 1 : 0}$`"
            />
          </span>
        </div>
        <div v-if="selectedState.expanded" class="flex flex-wrap items-center gap-1.5">
          <KatexInlineElement
            class="text-xs"
            :text="`$${notationOf(selectedSelectionFunction)}$:`"
          />
          <span v-if="nextSteps.length === 0" class="text-xs text-base-content/65">
            {{ t('evaluation.serialisation.noInitialSets') }}
          </span>
          <button
            v-for="edge in nextSteps"
            :key="edge.to"
            type="button"
            class="btn btn-sm btn-outline font-normal text-base font-(family-name:--font-graph) [word-spacing:-0.5ch]"
            @click="selectState(edge.to)"
            @mouseenter="hovered = edge.to"
            @mouseleave="hovered = undefined"
          >
            {{ formatSet(edge.step) }}
          </button>
        </div>
      </section>

      <EvaluationStatusFooter
        :status-line="statusLine"
        :copy-text="copyText"
        :copy-text-tex="copyTextTex"
        :result-noun="t('evaluation.nouns.sequences')"
      />
    </template>
  </BaseEvaluationWindow>
</template>
