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
import { computed, provide, ref, shallowRef, toRef, watch, watchEffect } from 'vue'

import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import type { ExtensionWindowInstanceState } from '@/modules/bipolar-argumentation/evaluation/extensionWindowState'
import {
  KNOWN_SEMANTIC_GROUPS,
  type Semantic,
  useExtensionEvaluationQuery,
} from '@/modules/bipolar-argumentation/evaluation/tweetyProject'
import { bipolarArgumentationGlossary } from '@/modules/bipolar-argumentation/glossary'
import type { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Input, ResultsHeaderPart } from '@/modules/common/evaluation/types'
import { useExtensionWindowBase } from '@/modules/common/evaluation/useExtensionWindowBase'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const { input, instanceState, instanceOffset = 0, storageKey } = defineProps<{
  input: Input<BipoloarArgumentation<ArgumentData>>
  instanceState: ExtensionWindowInstanceState
  instanceOffset?: number
  storageKey?: string
}>()

const emit = defineEmits<{
  'update:instanceState': [state: ExtensionWindowInstanceState]
  highlight: [highlight?: Highlight]
  close: []
}>()

provide(TOOLTIP_REGISTRY_KEY, { ...abstractArgumentationGlossary, ...bipolarArgumentationGlossary })

const semanticGroups = KNOWN_SEMANTIC_GROUPS

const byInterpretationSemantics = computed(() => {
  const allInterpretations = new Set(semanticGroups.flatMap((g) => g.interpretations))
  const result: Record<string, Semantic[]> = {}
  for (const interpretation of allInterpretations) {
    result[interpretation] = semanticGroups
      .filter((g) => g.interpretations.includes(interpretation))
      .flatMap((g) => g.semantics)
  }
  return result
})

function resolveSemanticFromKey(key: string): Semantic {
  return semanticGroups.flatMap((g) => g.semantics).find((s) => s.key === key)
    ?? semanticGroups[0]!.semantics[0]!
}

function resolveInterpretationForSemantic(semanticKey: string, preferredInterpretation: string): string {
  for (const group of semanticGroups) {
    if (group.semantics.some((s) => s.key === semanticKey) && group.interpretations.includes(preferredInterpretation)) {
      return preferredInterpretation
    }
  }
  for (const group of semanticGroups) {
    if (group.semantics.some((s) => s.key === semanticKey)) {
      return group.interpretations[0]!
    }
  }
  return semanticGroups[0]!.interpretations[0]!
}

const selectedSemantic = shallowRef<Semantic>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedInterpretation = shallowRef<string>(
  resolveInterpretationForSemantic(instanceState.semanticKey, instanceState.interpretationKey),
)
const selectedMode = ref<string>(instanceState.mode)
const evaluateContinuously = ref(instanceState.evaluateContinuously)

watch([selectedSemantic, selectedInterpretation, selectedMode, evaluateContinuously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    interpretationKey: selectedInterpretation.value,
    mode: selectedMode.value,
    evaluateContinuously: evaluateContinuously.value,
  })
})

watchEffect(() => {
  const validSemantics = byInterpretationSemantics.value[selectedInterpretation.value]
  if (validSemantics === undefined || validSemantics.length === 0) {
    throw new Error('Encountred invalid interpretation without semantics.')
  }
  if (!validSemantics.some((s) => s.key === selectedSemantic.value.key)) {
    selectedSemantic.value = validSemantics[0]!
  }
})

const query = useExtensionEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  selectedMode,
  evaluateContinuously,
)

const {
  selectedExtension,
  resultsHeader: baseResultsHeader,
  selectionHint,
  emptyMessage,
  dataExtensionsFormatedAndSorted,
  resultItems,
  currentHighlight,
} = useExtensionWindowBase(selectedMode, query, computed(() => selectedSemantic.value.displayName))

watch(currentHighlight, (h) => emit('highlight', h))
function onWindowFocus() { emit('highlight', currentHighlight.value) }

const resultsHeader = computed((): ResultsHeaderPart[] => {
  const interpretation = selectedInterpretation.value
  if (interpretation === 'None') return baseResultsHeader.value
  const tooltipId = interpretation === 'Deductive' ? 'deductiveSupport' : 'necessarySupport'
  return [...baseResultsHeader.value, ' under ', { text: `${interpretation.toLowerCase()} support`, tooltipId }]
})

const windowTitle = computed(() => {
  const modeLabel = selectedMode.value === 'enumerate' ? 'Enumerate'
    : selectedMode.value === 'credulous' ? 'Credulous' : 'Skeptical'
  return `Extensions: ${selectedInterpretation.value} · ${selectedSemantic.value.displayName} · ${modeLabel}`
})
</script>

<template>
  <BaseEvaluationWindow
    v-model:evaluate-continuously="evaluateContinuously"
    :title="windowTitle"
    :instance-offset="instanceOffset"
    :query="query"
    :results-header="resultsHeader"
    :storage-key="storageKey"
    @close="emit('close')"
    @focus="onWindowFocus"
  >
    <template #parameters>
      <label class="select select-sm w-fit">
        <span class="label">Interpretation</span>
        <select v-model="selectedInterpretation">
          <option
            v-for="interpretation in Object.keys(byInterpretationSemantics)"
            :key="interpretation"
            :value="interpretation"
          >
            {{ interpretation }}
          </option>
        </select>
      </label>
      <label class="select select-sm w-fit">
        <span class="label">Semantics</span>
        <select v-model="selectedSemantic">
          <option
            v-for="semantic in byInterpretationSemantics[selectedInterpretation]"
            :key="semantic.key"
            :value="semantic"
          >
            {{ semantic.displayName }}
          </option>
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
    </template>
    <template #parameters-footer>
      <TermDefinitionBlock v-if="selectedSemantic.tooltipId" :id="selectedSemantic.tooltipId" />
    </template>
    <template #results>
      <template v-if="dataExtensionsFormatedAndSorted !== undefined">
        <EvaluationResultGrid
          v-model:selected="selectedExtension"
          :items="resultItems"
          :empty-message="emptyMessage"
          :selection-hint="selectionHint"
          :evaluation-duration-in-ms="dataExtensionsFormatedAndSorted.evaluationDurationInMs"
        />
      </template>
    </template>
  </BaseEvaluationWindow>
</template>
