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
import { computed, provide, ref, shallowRef, toRef, watch } from 'vue'

import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import type { DocumentId } from '@/modules/common/documents/db'
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Input, ResultsHeaderPart } from '@/modules/common/evaluation/types'
import { useExtensionWindowBase } from '@/modules/common/evaluation/useExtensionWindowBase'
import GroupedSelect, { type GroupedSelectGroup } from '@/modules/common/forms/GroupedSelect.vue'
import ParameterField from '@/modules/common/forms/ParameterField.vue'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'
import type { ExtensionWindowInstanceState } from '@/modules/incomplete-argumentation/evaluation/extensionWindowState'
import {
  type IafMode,
  type IafType,
  KNOWN_SEMANTIC_GROUPS,
  type Semantics,
  useExtensionEvaluationQuery,
} from '@/modules/incomplete-argumentation/evaluation/tweetyProject'
import { incompleteArgumentationGlossary } from '@/modules/incomplete-argumentation/glossary'
import type {
  IafArgumentData,
  IncompleteArgumentation,
} from '@/modules/incomplete-argumentation/model'

const {
  input,
  instanceState,
  instanceOffset = 0,
  documentId,
  stateKey,
} = defineProps<{
  input: Input<IncompleteArgumentation<IafArgumentData>>
  instanceState: ExtensionWindowInstanceState
  instanceOffset?: number
  documentId?: DocumentId
  stateKey?: string
}>()

const emit = defineEmits<{
  'update:instanceState': [state: ExtensionWindowInstanceState]
  highlight: [highlight?: Highlight]
  close: []
  evaluate: []
}>()

provide(TOOLTIP_REGISTRY_KEY, {
  ...abstractArgumentationGlossary,
  ...incompleteArgumentationGlossary,
})

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const allSemantics = semanticGroups.flatMap((g) => g.semantics)
const semanticsSelectGroups: GroupedSelectGroup<Semantics>[] = semanticGroups.map((g) => ({
  key: g.key,
  displayName: g.displayName,
  options: g.semantics,
}))

function resolveSemanticFromKey(key: string): Semantics {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

const selectedSemantic = shallowRef<Semantics>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedType = ref<IafType>(instanceState.type)
const selectedMode = ref<IafMode>(instanceState.mode)
const evaluateContinuously = ref(instanceState.evaluateContinuously)

watch([selectedSemantic, selectedType, selectedMode, evaluateContinuously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    type: selectedType.value,
    mode: selectedMode.value,
    evaluateContinuously: evaluateContinuously.value,
  })
})

const query = useExtensionEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  selectedType,
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
} = useExtensionWindowBase(
  selectedMode,
  query,
  computed(() => selectedSemantic.value.displayName),
)

watch(currentHighlight, (h) => emit('highlight', h))
function onWindowFocus() {
  emit('highlight', currentHighlight.value)
}

const resultsHeader = computed((): ResultsHeaderPart[] => {
  const typePart: ResultsHeaderPart = {
    text: selectedType.value === 'pos' ? 'Possible' : 'Necessary',
    tooltipId: selectedType.value === 'pos' ? 'possibleAcceptance' : 'necessaryAcceptance',
  }
  const [first, ...rest] = baseResultsHeader.value
  if (first === undefined) return [typePart]
  const loweredFirst: ResultsHeaderPart =
    typeof first === 'string'
      ? first.charAt(0).toLowerCase() + first.slice(1)
      : {
          text: first.text.charAt(0).toLowerCase() + first.text.slice(1),
          tooltipId: first.tooltipId,
        }
  return [typePart, ' ', loweredFirst, ...rest]
})

const windowTitle = computed(() => {
  const typeLabel = selectedType.value === 'pos' ? 'Possible' : 'Necessary'
  const modeLabel =
    selectedMode.value === 'enumerate'
      ? 'Enumerate'
      : selectedMode.value === 'credulous'
        ? 'Credulous'
        : 'Skeptical'
  return `Extensions: ${selectedSemantic.value.displayName} · ${typeLabel} · ${modeLabel}`
})
</script>

<template>
  <BaseEvaluationWindow
    v-model:evaluate-continuously="evaluateContinuously"
    :title="windowTitle"
    :instance-offset="instanceOffset"
    :initial-size="{ width: 536, height: 360 }"
    :query="query"
    :results-header="resultsHeader"
    :document-id="documentId"
    :state-key="stateKey"
    @close="emit('close')"
    @focus="onWindowFocus"
    @evaluate="emit('evaluate')"
  >
    <template #parameters>
      <ParameterField label="Type" max-width="8rem">
        <select v-model="selectedType" class="select select-sm w-full bg-base-200">
          <option value="pos">Possible</option>
          <option value="nec">Necessary</option>
        </select>
      </ParameterField>
      <ParameterField label="Semantics" min-width="10rem">
        <GroupedSelect v-model="selectedSemantic" :groups="semanticsSelectGroups" full-width />
      </ParameterField>
      <ParameterField label="Mode" max-width="8rem">
        <select v-model="selectedMode" class="select select-sm w-full bg-base-200">
          <option value="enumerate">Enumerate</option>
          <option value="credulous">Credulous</option>
          <option value="skeptical">Skeptical</option>
        </select>
      </ParameterField>
    </template>
    <template #parameters-footer>
      <TermDefinitionBlock :id="selectedSemantic.key" />
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
