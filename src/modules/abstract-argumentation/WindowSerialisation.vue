<!--
  Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.

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
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, provide, ref, shallowRef, toRef, watch } from 'vue'

import type { SerialisationWindowInstanceState } from '@/modules/abstract-argumentation/evaluation/serialisationWindowState'
import {
  fetchIsTerminal,
  fetchSelection,
  SELECTION_FUNCTIONS,
  type SerialisationFunction,
  TERMINATION_FUNCTIONS,
  useSerialisationEvaluationQuery,
} from '@/modules/abstract-argumentation/evaluation/tweetyProjectSerialisation'
import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
import { NODE_GREEN, NODE_RED } from '@/modules/common/colors'
import type { Input } from '@/modules/common/evaluation/types'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import { IdMapping } from '@/modules/common/ids'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

const { input, instanceState, instanceOffset = 0 } = defineProps<{
  input: Input<AbstractArgumentation<ArgumentData>>
  instanceState: SerialisationWindowInstanceState
  instanceOffset?: number
}>()

const emit = defineEmits<{
  'update:instanceState': [state: SerialisationWindowInstanceState]
  highlight: [highlight?: Highlight]
  close: []
}>()

provide(TOOLTIP_REGISTRY_KEY, abstractArgumentationGlossary)

function resolveFunction(fns: SerialisationFunction[], key: string): SerialisationFunction {
  return fns.find((f) => f.key === key) ?? fns[0]!
}

// --- Persistent window state ---
const selectedSelectionFunction = shallowRef<SerialisationFunction>(
  resolveFunction(SELECTION_FUNCTIONS, instanceState.selectionFunctionKey),
)
const selectedTerminationFunction = shallowRef<SerialisationFunction>(
  resolveFunction(TERMINATION_FUNCTIONS, instanceState.terminationFunctionKey),
)
const evaluateContinuously = ref(instanceState.evaluateContinuously)
const selectedMode = ref<'sequences' | 'interactive'>(instanceState.mode ?? 'sequences')

watch([selectedSelectionFunction, selectedTerminationFunction, evaluateContinuously, selectedMode], () => {
  const state: SerialisationWindowInstanceState = {
    id: instanceState.id,
    selectionFunctionKey: selectedSelectionFunction.value.key,
    terminationFunctionKey: selectedTerminationFunction.value.key,
    evaluateContinuously: evaluateContinuously.value,
    mode: selectedMode.value,
  }
  emit('update:instanceState', state)
})

// --- FloatingWindow state ---
const isOpen = ref(true)
watch(isOpen, (v) => { if (!v) emit('close') })
const isCompact = ref(false)
watch(isCompact, (v) => {
  if (v && selectedMode.value === 'sequences') evaluateContinuously.value = true
})

const windowTitle = computed(() => {
  const sel = selectedSelectionFunction.value.displayName
  const term = selectedTerminationFunction.value.displayName
  const modeLabel = selectedMode.value === 'interactive' ? 'Interactive' : 'Sequences'
  return `Serialisation · ${sel} / ${term} · ${modeLabel}`
})

// ──────────────────────────────────────────────────────────────
// SEQUENCES MODE
// ──────────────────────────────────────────────────────────────
const sequencesEnabled = computed(
  () => selectedMode.value === 'sequences' && evaluateContinuously.value,
)
const query = useSerialisationEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSelectionFunction.value.key),
  computed(() => selectedTerminationFunction.value.key),
  sequencesEnabled,
)
const { status, error, isPending, isLoading, isError, refetch, data } = query
const isTimeout = computed(() => error.value?.name === 'EvaluationTimeoutError')
const userCanTriggerFetch = computed(
  () => selectedMode.value === 'sequences' && !evaluateContinuously.value && status.value !== 'success',
)
const sequencesResultsHeader = computed(
  () => `Serialisation sequences (${data.value?.sequences.length ?? 0})`,
)

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
function mapReductStep(reductStep: number[], state: ReductState): { id: ArgumentId; name: string }[] {
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
  () => { if (selectedMode.value === 'interactive') resetInteractive() },
)
// Reset on function change in interactive mode
watch([selectedSelectionFunction, selectedTerminationFunction], () => {
  if (selectedMode.value === 'interactive' && reductState.value !== null) resetInteractive()
})

onMounted(() => {
  if (selectedMode.value === 'interactive') resetInteractive()
})

const currentHighlight = computed<Highlight | undefined>(() => {
  if (selectedMode.value !== 'interactive' || currentExtension.value.length === 0) return undefined
  const nodes = new Set(currentExtension.value.map((serverId) => {
    const entry = argumentIdAndData.value[serverId - 1]
    if (!entry) throw new Error('Invalid server argument ID')
    return entry[0]
  }))
  return {
    stateId: input.stateId,
    groups: [{ nodes, color: NODE_GREEN }],
    attackedByFirst: NODE_RED,
  }
})

watch(currentHighlight, (h) => emit('highlight', h))
function onWindowFocus() { emit('highlight', currentHighlight.value) }
</script>

<template>
  <FloatingWindow
    v-model:open="isOpen"
    v-model:compact="isCompact"
    :title="windowTitle"
    :initial-position="{ x: 256 + instanceOffset * 24, y: 96 + instanceOffset * 24 }"
    :intital-size="{ width: 576, height: 480 }"
    :instance-offset="instanceOffset"
    compactable
    @focus="onWindowFocus"
  >
    <template #default="{ compact }">
      <div class="p-4 flex flex-col gap-3">

        <!-- Parameters (hidden in compact) -->
        <fieldset v-if="!compact" class="fieldset">
          <legend class="fieldset-legend">Parameters</legend>
          <div class="flex gap-2 flex-wrap">
            <label class="select select-sm w-fit" hidden>
              <span class="label">Solver</span>
              <select disabled><option selected>TweetyProject</option></select>
            </label>
            <label class="select select-sm w-fit">
              <span class="label">Selection</span>
              <select v-model="selectedSelectionFunction">
                <option v-for="fn in SELECTION_FUNCTIONS" :key="fn.key" :value="fn">
                  {{ fn.displayName }}
                </option>
              </select>
            </label>
            <label class="select select-sm w-fit">
              <span class="label">Termination</span>
              <select v-model="selectedTerminationFunction">
                <option v-for="fn in TERMINATION_FUNCTIONS" :key="fn.key" :value="fn">
                  {{ fn.displayName }}
                </option>
              </select>
            </label>
            <label class="select select-sm w-fit">
              <span class="label">Mode</span>
              <select v-model="selectedMode">
                <option value="sequences">Sequences</option>
                <option value="interactive">Interactive</option>
              </select>
            </label>
          </div>
        </fieldset>

        <!-- Definitions for selected functions (hidden in compact) -->
        <div v-if="!compact" class="flex flex-col sm:flex-row gap-3">
          <TermDefinitionBlock :id="selectedSelectionFunction.tooltipId" class="flex-1" />
          <TermDefinitionBlock :id="selectedTerminationFunction.tooltipId" class="flex-1" />
        </div>

        <!-- Sequences mode: evaluate controls (hidden in compact) -->
        <fieldset v-if="!compact && selectedMode === 'sequences'" class="fieldset">
          <div class="flex gap-2 flex-wrap">
            <button
              class="btn btn-sm btn-soft btn-neutral"
              :disabled="!userCanTriggerFetch"
              @click="refetch()"
            >
              Evaluate
            </button>
            <label class="label">
              <input type="checkbox" v-model="evaluateContinuously" class="checkbox checkbox-sm" />
              Evaluate continuously
            </label>
          </div>
        </fieldset>

        <!-- Interactive mode: reset button (hidden in compact) -->
        <fieldset v-if="!compact && selectedMode === 'interactive'" class="fieldset">
          <div class="flex gap-2">
            <button class="btn btn-sm btn-soft btn-neutral" @click="resetInteractive()">
              Reset
            </button>
          </div>
        </fieldset>

        <!-- ── SEQUENCES RESULTS ── -->
        <fieldset
          v-if="selectedMode === 'sequences' && (!isPending || isLoading)"
          class="fieldset"
        >
          <legend v-if="!compact" class="fieldset-legend">{{ sequencesResultsHeader }}</legend>
          <div v-if="isTimeout" role="alert" class="alert alert-warning alert-soft">
            <span>Evaluation timed out</span>
          </div>
          <div v-else-if="isError" role="alert" class="alert alert-error alert-soft">
            <span>Evaluation failed</span>
          </div>
          <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
            <span>Evaluating…</span>
          </div>
          <template v-if="data !== undefined">
            <div v-if="data.sequences.length === 0" class="text-sm opacity-60">
              No serialisation sequences found.
            </div>
            <ol v-else class="flex flex-col gap-2">
              <li
                v-for="(sequence, seqIndex) in data.sequences"
                :key="seqIndex"
                class="flex flex-wrap items-center gap-1 text-sm"
              >
                <template v-for="(step, stepIndex) in sequence" :key="stepIndex">
                  <span v-if="stepIndex > 0" class="select-none opacity-50">&#x2192;</span>
                  <span class="rounded border px-1.5 py-0.5 font-mono">
                    <template v-if="step.length === 0">&#x2205;</template>
                    <template v-else>{{ step.map((a) => a.name).join(', ') }}</template>
                  </span>
                </template>
              </li>
            </ol>
            <p class="label mt-1">{{ data.evaluationDurationInMs }}ms</p>
          </template>
        </fieldset>

        <!-- ── INTERACTIVE RESULTS ── -->
        <fieldset v-if="selectedMode === 'interactive'" class="fieldset">
          <legend v-if="!compact" class="fieldset-legend">Interactive Serialisation</legend>

          <!-- Loading -->
          <div v-if="interactiveIsLoading" role="alert" class="alert alert-info alert-soft">
            <span>Evaluating…</span>
          </div>

          <!-- Error -->
          <div v-else-if="interactiveError" role="alert" class="alert alert-error alert-soft">
            <span>Evaluation failed</span>
          </div>

          <template v-else>
            <!-- Built sequence so far -->
            <div
              v-if="builtSequence.length > 0"
              class="flex flex-wrap items-center gap-1 text-sm mb-2"
            >
              <template v-for="(step, i) in builtSequence" :key="i">
                <span v-if="i > 0" class="select-none opacity-50">&#x2192;</span>
                <span class="rounded border px-1.5 py-0.5 font-mono">
                  <template v-if="step.length === 0">&#x2205;</template>
                  <template v-else>{{ step.map((a) => a.name).join(', ') }}</template>
                </span>
              </template>
            </div>

            <!-- Terminal status -->
            <div
              v-if="interactiveIsTerminal !== null"
              class="flex items-center gap-1.5 text-sm mb-2"
            >
              <CheckCircleIcon v-if="interactiveIsTerminal" class="size-4 text-success" />
              <XCircleIcon v-else class="size-4 text-error" />
              <span>{{ interactiveIsTerminal ? 'Terminal' : 'Not terminal' }}</span>
            </div>

            <!-- Step selection (hidden in compact) -->
            <template v-if="!compact">
              <div v-if="selectableStepsDisplay.length === 0"
                class="text-sm opacity-60">
                No initial sets available.
              </div>
              <div v-else-if="selectableStepsDisplay.length > 0" class="flex flex-col gap-1.5">
                <p class="text-xs opacity-60">Select next initial set:</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(step, i) in selectableStepsDisplay"
                    :key="i"
                    class="btn btn-sm btn-outline font-mono"
                    @click="pickStep(i)"
                  >
                    <template v-if="step.length === 0">&#x2205;</template>
                    <template v-else>{{ '{' + step.map((a) => a.name).join(', ') + '}' }}</template>
                  </button>
                </div>
              </div>
            </template>
          </template>
        </fieldset>

      </div>
    </template>
  </FloatingWindow>
</template>
