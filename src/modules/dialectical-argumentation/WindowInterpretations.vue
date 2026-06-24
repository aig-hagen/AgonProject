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
import { computed, provide, ref, shallowRef, toRef, watch } from 'vue'

import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import { NODE_BLUE, NODE_GREEN, NODE_RED } from '@/modules/common/colors'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Input, ResultsHeaderPart } from '@/modules/common/evaluation/types'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'
import type { ExtensionWindowInstanceState } from '@/modules/dialectical-argumentation/evaluation/extensionWindowState'
import {
  type Interpretation,
  KNOWN_SEMANTIC_GROUPS,
  type Semantics,
  useInterpretationEvaluationQuery,
} from '@/modules/dialectical-argumentation/evaluation/tweetyProject'
import { dialecticalArgumentationGlossary } from '@/modules/dialectical-argumentation/glossary'
import type { AdfArgumentData, DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'

const { input, instanceState, instanceOffset = 0, storageKey } = defineProps<{
  input: Input<DialecticalArgumentation<AdfArgumentData>>
  instanceState: ExtensionWindowInstanceState
  instanceOffset?: number
  storageKey?: string
}>()

const emit = defineEmits<{
  'update:instanceState': [state: ExtensionWindowInstanceState]
  highlight: [highlight?: Highlight]
  close: []
  evaluate: []
}>()

provide(TOOLTIP_REGISTRY_KEY, { ...abstractArgumentationGlossary, ...dialecticalArgumentationGlossary })

const internalOpen = ref(true)
watch(internalOpen, (v) => { if (!v) emit('close') })

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const allSemantics = semanticGroups.flatMap((g) => g.semantics)

function resolveSemanticFromKey(key: string): Semantics {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

const selectedSemantic = shallowRef<Semantics>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedMode = ref<string>(instanceState.mode)
const evaluateContinuously = ref(instanceState.evaluateContinuously)
const isCompact = ref(false)
watch(isCompact, (v) => { if (v) evaluateContinuously.value = true })

watch([selectedSemantic, selectedMode, evaluateContinuously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    mode: selectedMode.value,
    evaluateContinuously: evaluateContinuously.value,
  })
})

const enabled = computed(() => evaluateContinuously.value)

const { data, status, refetch, isLoading, isPending, isError, error } = useInterpretationEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  computed(() => selectedMode.value),
  enabled,
)

const isTimeout = computed(() => error.value?.name === 'EvaluationTimeoutError')
const userCanTriggerFetch = computed(
  () => !evaluateContinuously.value && status.value !== 'success',
)

function interpretationKey(interp: Interpretation): string {
  return JSON.stringify(interp.map(({ id, label }) => ({ id, label })))
}

function formatInterpretation(interp: Interpretation): string {
  return interp
    .map(({ name, label }) => {
      if (label === 'in') return name
      if (label === 'out') return `¬${name}`
      return `?${name}`
    })
    .join(', ')
}

const resultsHeader = computed((): ResultsHeaderPart[] => {
  const { displayName, tooltipId: semanticTooltipId } = selectedSemantic.value
  const semanticPart: ResultsHeaderPart = semanticTooltipId
    ? { text: displayName, tooltipId: semanticTooltipId }
    : displayName
  if (selectedMode.value === 'enumerate') return [semanticPart, ' models']
  const tooltipId = selectedMode.value === 'credulous' ? 'credulousAcceptance' : 'skepticalAcceptance'
  const prefix = selectedMode.value === 'credulous' ? 'Credulously accepted' : 'Skeptically accepted'
  return [{ text: prefix, tooltipId }, ' arguments wrt ', semanticPart, ' semantics']
})
const selectionHint = computed(() =>
  selectedMode.value === 'enumerate'
    ? 'Select model to highlight.'
    : 'Select acceptable argument to highlight.',
)

const formattedData = computed(() => {
  if (data.value === undefined) return undefined

  if (selectedMode.value !== 'enumerate') {
    const accepted = (data.value.interpretations[0] ?? []).filter((a) => a.label === 'in')
    return {
      stateId: data.value.stateId,
      evaluationDurationInMs: data.value.evaluationDurationInMs,
      items: accepted.map((arg) => ({
        key: String(arg.id),
        interpretation: [arg] as Interpretation,
        formatted: arg.name,
      })),
    }
  }

  return {
    stateId: data.value.stateId,
    evaluationDurationInMs: data.value.evaluationDurationInMs,
    items: data.value.interpretations.map((interp) => ({
      key: interpretationKey(interp),
      interpretation: interp,
      formatted: formatInterpretation(interp),
    })),
  }
})

const resultItems = computed(
  () =>
    formattedData.value?.items.map((i) => ({
      key: i.key,
      label: selectedMode.value === 'enumerate' ? `{${i.formatted}}` : i.formatted,
    })) ?? [],
)

const windowTitle = computed(() => {
  const modeLabel = selectedMode.value === 'enumerate' ? 'Enumerate'
    : selectedMode.value === 'credulous' ? 'Credulous' : 'Skeptical'
  return `Models: ${selectedSemantic.value.displayName} · ${modeLabel}`
})

const selectedKey = ref<string | undefined>(undefined)
const currentHighlight = computed<Highlight | undefined>(() => {
  if (selectedKey.value === undefined || formattedData.value === undefined) return undefined
  const item = formattedData.value.items.find((i) => i.key === selectedKey.value)
  if (item === undefined) return undefined
  return {
    stateId: formattedData.value.stateId,
    groups: [
      { nodes: new Set(item.interpretation.filter((a) => a.label === 'in').map((a) => a.id)), color: NODE_GREEN },
      { nodes: new Set(item.interpretation.filter((a) => a.label === 'out').map((a) => a.id)), color: NODE_RED },
      { nodes: new Set(item.interpretation.filter((a) => a.label === 'undec').map((a) => a.id)), color: NODE_BLUE },
    ],
  }
})
watch(currentHighlight, (h) => emit('highlight', h))
function onWindowFocus() { emit('highlight', currentHighlight.value) }
</script>

<template>
  <FloatingWindow
    v-model:open="internalOpen"
    v-model:compact="isCompact"
    :title="windowTitle"
    :initial-position="{ x: 128 + instanceOffset * 24, y: 64 + instanceOffset * 24 }"
    :intitalSize="{ width: 512, height: 400 }"
    :instance-offset="instanceOffset"
    :storage-key="storageKey"
    compactable
    :minimizable="false"
    @focus="onWindowFocus"
  >
    <template #default="{ compact }">
    <div class="p-4">
      <fieldset v-if="!compact" class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-fit">
            <span class="label">Semantics</span>
            <select v-model="selectedSemantic">
              <optgroup v-for="group in semanticGroups" :key="group.key" :label="group.displayName">
                <option v-for="semantic in group.semantics" :key="semantic.key" :value="semantic">
                  {{ semantic.displayName }}
                </option>
              </optgroup>
            </select>
          </label>
          <label class="select select-sm w-fit">
            <span class="label">Mode</span>
            <select v-model="selectedMode">
              <option value="enumerate">Enumerate</option>
              <option value="credulous">Credulous</option>
              <option value="skeptical">Skeptical</option>
            </select>
          </label>
        </div>
        <TermDefinitionBlock v-if="selectedSemantic.tooltipId" :id="selectedSemantic.tooltipId" />
      </fieldset>
      <fieldset v-if="!compact" class="fieldset">
        <div class="flex gap-2 flex-wrap">
          <button
            class="btn btn-sm btn-soft mt-2"
            :disabled="!userCanTriggerFetch"
            @click="() => { refetch(); emit('evaluate') }"
          >
            Evaluate
          </button>
          <label class="label mt-2">
            <input type="checkbox" v-model="evaluateContinuously" class="checkbox checkbox-sm" />
            Evaluate continuously
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset" v-if="!isPending || isLoading">
        <legend v-if="!compact" class="fieldset-legend">
          <span>
            <template v-for="(part, i) in resultsHeader" :key="i">
              <TermTooltip v-if="typeof part === 'object'" :id="part.tooltipId">{{ part.text }}</TermTooltip>
              <template v-else>{{ part }}</template>
            </template>
          </span>
        </legend>
        <div v-if="isTimeout" role="alert" class="alert alert-warning alert-soft">
          <span>Evaluation timed out</span>
        </div>
        <div v-else-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Evaluation failed</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating...</span>
        </div>
        <template v-if="formattedData !== undefined">
          <EvaluationResultGrid
            v-model:selected="selectedKey"
            :items="resultItems"
            empty-message="No interpretations exist."
            :selection-hint="selectionHint"
            :evaluation-duration-in-ms="formattedData.evaluationDurationInMs"
          />
        </template>
      </fieldset>
    </div>
    </template>
  </FloatingWindow>
</template>
