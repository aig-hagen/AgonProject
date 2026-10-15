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
import { ArrowRightCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, provide, ref, shallowRef, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SerialisationWindowInstanceState } from '@/modules/abstract-argumentation/evaluation/serialisationWindowState'
import {
  fetchIsTerminal,
  fetchSelection,
  SELECTION_FUNCTIONS,
  type SequenceStep,
  SERIALISATION_TIMEOUT_IN_MS,
  type SerialisationFunction,
  TERMINATION_FUNCTIONS,
  useSerialisationEvaluationQuery,
} from '@/modules/abstract-argumentation/evaluation/tweetyProjectSerialisation'
import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
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
import { IdMapping, type UUID } from '@/modules/common/ids'
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
const selectedMode = ref<'sequences' | 'interactive'>(instanceState.mode ?? 'sequences')

watch([selectedSelectionFunction, selectedTerminationFunction, selectedMode], () => {
  const state: SerialisationWindowInstanceState = {
    id: instanceState.id,
    selectionFunctionKey: selectedSelectionFunction.value.key,
    terminationFunctionKey: selectedTerminationFunction.value.key,
    mode: selectedMode.value,
  }
  emit('update:instanceState', state)
})

const windowTitle = computed(() => {
  const sel = selectedSelectionFunction.value.displayName
  const term = selectedTerminationFunction.value.displayName
  const modeLabel =
    selectedMode.value === 'interactive'
      ? t('evaluation.serialisation.modeInteractive')
      : t('evaluation.serialisation.modeSequences')
  return `${sel} · ${term} · ${modeLabel}`
})

// The compact host labels its switcher pill with this title (not the raw key).
watch(windowTitle, (t) => emit('title', t), { immediate: true })

// ──────────────────────────────────────────────────────────────
// SEQUENCES MODE
// ──────────────────────────────────────────────────────────────
const sequencesEnabled = computed(() => selectedMode.value === 'sequences')
const query = useSerialisationEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSelectionFunction.value.key),
  computed(() => selectedTerminationFunction.value.key),
  sequencesEnabled,
)
const { data } = query

const selectedSequence = ref<number | undefined>(undefined)
watch(data, () => (selectedSequence.value = undefined))

function formatStep(step: SequenceStep): string {
  return step.length === 0 ? '∅' : `{${step.map((a) => a.name).join(', ')}}`
}
function formatStepTex(step: SequenceStep): string {
  return step.length === 0
    ? '\\emptyset'
    : `\\{${step.map((a) => escapeTexText(a.name)).join(', ')}\\}`
}

const copyText = computed(() =>
  data.value?.sequences.length
    ? data.value.sequences.map((seq) => seq.map(formatStep).join(' → ')).join('\n')
    : undefined,
)
const copyTextTex = computed(() =>
  data.value?.sequences.length
    ? data.value.sequences.map((seq) => seq.map(formatStepTex).join(' \\to ')).join('\n')
    : undefined,
)

const sequencesStatusLine = computed(() => {
  if (data.value === undefined) return undefined
  const parts: string[] = []
  const count = data.value.sequences.length
  if (count > 0) {
    parts.push(t('evaluation.counts.sequences', count))
    parts.push(t('evaluation.serialisation.selectSequenceHint'))
  }
  parts.push(`${data.value.evaluationDurationInMs}ms`)
  return parts.join(' · ')
})

// ──────────────────────────────────────────────────────────────
// INTERACTIVE MODE
// ──────────────────────────────────────────────────────────────

interface ReductState {
  numberOfArgs: number
  attacks: [number, number][]
  /** originalIds[i] = original server ID (1-indexed) of reduct argument i+1 */
  originalIds: number[]
}

// Current reduct (built from original AF reduced by extension so far)
const reductState = ref<ReductState | null>(null)
// Extension accumulated so far, as original server IDs
const currentExtension = ref<number[]>([])
// Steps the user has picked, for display (named args)
const builtSequence = ref<{ id: ArgumentId; name: string }[][]>([])
// Selectable sets returned by get_selection, in reduct IDs
const selectableStepsRaw = ref<number[][]>([])
// Terminal status from is_terminal
const interactiveIsTerminal = ref<boolean | null>(null)
const interactiveIsLoading = ref(false)
const interactiveError = ref<Error | null>(null)

// Maps original server ID → {id, name}
const argumentIdAndData = computed(() => [...input.content.arguments()])
function getArgByServerId(originalServerId: number): { id: ArgumentId; name: string } {
  const entry = argumentIdAndData.value[originalServerId - 1]
  if (!entry) throw new Error('Invalid server argument ID')
  const [id, { name }] = entry
  return { id, name }
}
function mapReductStep(
  reductStep: number[],
  state: ReductState,
): { id: ArgumentId; name: string }[] {
  return reductStep.map((reductId) => getArgByServerId(state.originalIds[reductId - 1]!))
}

// Named args for each selectable step (for display/buttons)
const selectableStepsDisplay = computed(() =>
  reductState.value
    ? selectableStepsRaw.value.map((step) => mapReductStep(step, reductState.value!))
    : [],
)

function buildOriginalAFFromInput(): { numberOfArgs: number; attacks: [number, number][] } {
  const content = input.content
  let n = 0
  const idMapping = new IdMapping<ArgumentId, number>()
  for (const [id] of content.arguments()) {
    idMapping.add(id, ++n)
  }
  const attacks: [number, number][] = []
  for (const [src, tgt] of content.attacks()) {
    attacks.push([idMapping.getOrFail(src), idMapping.getOrFail(tgt)])
  }
  return { numberOfArgs: n, attacks }
}

function computeReduct(state: ReductState, selectedSet: number[]): ReductState {
  const S = new Set(selectedSet)
  const attacked = new Set<number>()
  for (const pair of state.attacks) {
    if (S.has(pair[0])) attacked.add(pair[1])
  }
  const removed = new Set([...S, ...attacked])
  const remaining: number[] = []
  for (let i = 1; i <= state.numberOfArgs; i++) {
    if (!removed.has(i)) remaining.push(i)
  }
  const reindex = new Map(remaining.map((id, idx) => [id, idx + 1]))
  const newAttacks: [number, number][] = state.attacks
    .filter((pair) => !removed.has(pair[0]) && !removed.has(pair[1]))
    .map((pair) => [reindex.get(pair[0])!, reindex.get(pair[1])!] as [number, number])
  return {
    numberOfArgs: remaining.length,
    attacks: newAttacks,
    originalIds: remaining.map((id) => state.originalIds[id - 1]!),
  }
}

async function fetchInteractiveStep() {
  if (!reductState.value) return
  interactiveIsLoading.value = true
  interactiveError.value = null
  try {
    const [selectionResult, terminalResult] = await Promise.all([
      fetchSelection(
        reductState.value.numberOfArgs,
        reductState.value.attacks,
        selectedSelectionFunction.value.key,
      ),
      fetchIsTerminal(
        reductState.value.numberOfArgs,
        reductState.value.attacks,
        currentExtension.value,
        selectedTerminationFunction.value.key,
      ),
    ])
    selectableStepsRaw.value = selectionResult.steps
    interactiveIsTerminal.value = terminalResult.terminal
  } catch (e) {
    interactiveError.value = e instanceof Error ? e : new Error(String(e))
  } finally {
    interactiveIsLoading.value = false
  }
}

function resetInteractive() {
  const af = buildOriginalAFFromInput()
  reductState.value = {
    numberOfArgs: af.numberOfArgs,
    attacks: af.attacks,
    originalIds: Array.from({ length: af.numberOfArgs }, (_, i) => i + 1),
  }
  currentExtension.value = []
  builtSequence.value = []
  selectableStepsRaw.value = []
  interactiveIsTerminal.value = null
  interactiveError.value = null
  fetchInteractiveStep()
}

function pickStep(stepIndex: number) {
  const raw = selectableStepsRaw.value[stepIndex]
  if (!raw || !reductState.value) return
  builtSequence.value = [...builtSequence.value, mapReductStep(raw, reductState.value)]
  const originalIds = raw.map((reductId) => reductState.value!.originalIds[reductId - 1]!)
  currentExtension.value = [...currentExtension.value, ...originalIds]
  reductState.value = computeReduct(reductState.value, raw)
  fetchInteractiveStep()
}

// Start interactive session when switching to that mode or on mount
watch(selectedMode, (newMode) => {
  if (newMode === 'interactive') resetInteractive()
})
// Reset when the AF changes while in interactive mode
watch(
  () => input.stateId,
  () => {
    if (selectedMode.value === 'interactive') resetInteractive()
  },
)
// Reset on function change in interactive mode
watch([selectedSelectionFunction, selectedTerminationFunction], () => {
  if (selectedMode.value === 'interactive' && reductState.value !== null) resetInteractive()
})

onMounted(() => {
  if (selectedMode.value === 'interactive') resetInteractive()
})

// Both modes feed the shared card's status strip, skeleton and loading timer.
const isSequences = computed(() => selectedMode.value === 'sequences')
const evaluationQuery: EvaluationWindowQuery = {
  status: computed(() => (isSequences.value ? query.status.value : 'success')),
  error: computed(() => (isSequences.value ? query.error.value : interactiveError.value)),
  isPending: computed(() =>
    isSequences.value ? query.isPending.value : interactiveIsTerminal.value === null,
  ),
  isLoading: computed(() =>
    isSequences.value ? query.isLoading.value : interactiveIsLoading.value,
  ),
  isError: computed(() =>
    isSequences.value ? query.isError.value : interactiveError.value !== null,
  ),
  refetch: () => (isSequences.value ? void query.refetch() : void fetchInteractiveStep()),
  timeoutMs: SERIALISATION_TIMEOUT_IN_MS,
}

function highlightFor(nodes: Set<ArgumentId>, stateId: UUID): Highlight {
  return labelsToHighlight(
    stateId,
    extensionLabels(nodes, binaryAttacks(input.content.attacks())),
    t,
    {
      undecided: true,
    },
  )
}

const currentHighlight = computed<Highlight | undefined>(() => {
  if (isSequences.value) {
    const sequence =
      selectedSequence.value === undefined
        ? undefined
        : data.value?.sequences[selectedSequence.value]
    if (sequence === undefined || data.value === undefined) return undefined
    return highlightFor(new Set(sequence.flat().map((a) => a.id)), data.value.stateId)
  }
  if (currentExtension.value.length === 0) return undefined
  const nodes = new Set(
    currentExtension.value.map((serverId) => {
      const entry = argumentIdAndData.value[serverId - 1]
      if (!entry) throw new Error('Invalid server argument ID')
      return entry[0]
    }),
  )
  return highlightFor(nodes, input.stateId)
})

// Always reported; the host's useEvaluationFocus picks which window paints the canvas.
watch(currentHighlight, (h) => emit('highlight', h), { immediate: true })
const isActive = computed(() => !suppressed && currentHighlight.value !== undefined)
</script>

<template>
  <BaseEvaluationWindow
    :title="windowTitle"
    :hosted="hosted"
    :instance-offset="instanceOffset"
    :initial-position-base="{ x: 256, y: 96 }"
    :initial-size="{ width: 576, height: 480 }"
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
      <ParameterField :label="t('evaluation.fields.mode')" max-width="8rem">
        <PickerSelect
          :model-value="selectedMode"
          :options="[
            { value: 'sequences', label: t('evaluation.serialisation.modeSequences') },
            { value: 'interactive', label: t('evaluation.serialisation.modeInteractive') },
          ]"
          @update:model-value="selectedMode = $event as 'sequences' | 'interactive'"
        />
      </ParameterField>
    </template>
    <template #parameters-footer>
      <TermDefinitionBlock :id="selectedSelectionFunction.tooltipId" />
      <TermDefinitionBlock :id="selectedTerminationFunction.tooltipId" />
    </template>
    <template #results>
      <template v-if="isSequences">
        <template v-if="data !== undefined">
          <div
            v-if="data.sequences.length === 0"
            data-evaluation-results
            role="alert"
            class="alert alert-info alert-soft"
          >
            <span>{{ t('evaluation.serialisation.noSequences') }}</span>
          </div>
          <ol v-else data-evaluation-results class="flex flex-col gap-1">
            <li v-for="(sequence, seqIndex) in data.sequences" :key="seqIndex">
              <button
                type="button"
                class="btn btn-sm h-auto min-h-8 py-1 justify-start flex-wrap gap-1 font-normal text-sm outline-none focus:outline-none"
                :class="selectedSequence === seqIndex ? 'btn-soft' : 'btn-ghost'"
                @click="selectedSequence = selectedSequence === seqIndex ? undefined : seqIndex"
              >
                <template v-for="(step, stepIndex) in sequence" :key="stepIndex">
                  <span v-if="stepIndex > 0" class="select-none opacity-50">&#x2192;</span>
                  <span class="rounded border px-1.5 py-0.5 font-mono">{{ formatStep(step) }}</span>
                </template>
              </button>
            </li>
          </ol>
          <EvaluationStatusFooter
            :status-line="sequencesStatusLine"
            :copy-text="copyText"
            :copy-text-tex="copyTextTex"
            :result-noun="t('evaluation.nouns.sequences')"
          />
        </template>
      </template>

      <template v-else>
        <div v-if="builtSequence.length > 0" class="flex flex-wrap items-center gap-1 text-sm">
          <template v-for="(step, i) in builtSequence" :key="i">
            <span v-if="i > 0" class="select-none opacity-50">&#x2192;</span>
            <span class="rounded border px-1.5 py-0.5 font-mono">{{ formatStep(step) }}</span>
          </template>
        </div>

        <div v-if="interactiveIsTerminal !== null" class="flex items-center gap-1.5 text-sm">
          <CheckCircleIcon v-if="interactiveIsTerminal" class="size-4 text-success" />
          <ArrowRightCircleIcon v-else class="size-4 text-base-content/65" />
          <span>{{
            interactiveIsTerminal
              ? t('evaluation.serialisation.terminal')
              : t('evaluation.serialisation.notTerminal')
          }}</span>
        </div>

        <div
          v-if="selectableStepsDisplay.length === 0 && !interactiveIsLoading"
          class="text-sm text-base-content/65"
        >
          {{ t('evaluation.serialisation.noInitialSets') }}
        </div>
        <div v-else-if="selectableStepsDisplay.length > 0" class="flex flex-col gap-1.5">
          <p class="text-base-content/65">
            {{ t('evaluation.serialisation.selectNextInitialSet') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(step, i) in selectableStepsDisplay"
              :key="i"
              class="btn btn-sm btn-outline font-mono"
              :disabled="interactiveIsLoading"
              @click="pickStep(i)"
            >
              {{ formatStep(step) }}
            </button>
          </div>
        </div>

        <div v-if="builtSequence.length > 0" class="flex">
          <button class="btn btn-xs btn-soft" @click="resetInteractive()">
            {{ t('common.actions.reset') }}
          </button>
        </div>
      </template>
    </template>
  </BaseEvaluationWindow>
</template>
