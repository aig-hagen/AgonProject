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
import type { ExtensionWindowInstanceState } from '@/modules/bipolar-argumentation/evaluation/extensionWindowState'
import {
  KNOWN_SEMANTIC_GROUPS,
  type Semantics,
  useExtensionEvaluationQuery,
} from '@/modules/bipolar-argumentation/evaluation/tweetyProject'
import { bipolarArgumentationGlossary } from '@/modules/bipolar-argumentation/glossary'
import type { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { DocumentId } from '@/modules/common/documents/db'
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Input, ResultsHeaderPart } from '@/modules/common/evaluation/types'
import { useExtensionWindowBase } from '@/modules/common/evaluation/useExtensionWindowBase'
import GroupedSelect, { type GroupedSelectGroup } from '@/modules/common/forms/GroupedSelect.vue'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const {
  input,
  instanceState,
  instanceOffset = 0,
  documentId,
  stateKey,
} = defineProps<{
  input: Input<BipoloarArgumentation<ArgumentData>>
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

provide(TOOLTIP_REGISTRY_KEY, { ...abstractArgumentationGlossary, ...bipolarArgumentationGlossary })

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const semanticsSelectGroups: GroupedSelectGroup<Semantics>[] = semanticGroups.map((g) => ({
  key: g.key,
  displayName: g.displayName,
  options: g.semantics,
}))

function resolveSemanticFromKey(key: string): Semantics {
  const found = semanticGroups.flatMap((g) => g.semantics).find((s) => s.key === key)
  return found ?? semanticGroups[0]!.semantics[0]!
}

const selectedSupportType = ref<string>(instanceState.supportTypeKey)
const selectedSemantics = shallowRef<Semantics>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedMode = ref<string>(instanceState.mode)
const evaluateContinuously = ref(instanceState.evaluateContinuously)

watch([selectedSemantics, selectedSupportType, selectedMode, evaluateContinuously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantics.value.key,
    supportTypeKey: selectedSupportType.value,
    mode: selectedMode.value,
    evaluateContinuously: evaluateContinuously.value,
  })
})

const query = useExtensionEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantics.value.key),
  selectedSupportType,
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
  computed(() => selectedSemantics.value.displayName),
)

watch(currentHighlight, (h) => emit('highlight', h))
function onWindowFocus() {
  emit('highlight', currentHighlight.value)
}

const supportTypeTooltipId = computed(() => {
  const support = selectedSupportType.value
  return support === 'ded'
    ? 'deductiveSupport'
    : support === 'nec'
      ? 'necessarySupport'
      : 'coalitionSemantics'
})

const resultsHeader = computed((): ResultsHeaderPart[] => {
  const support = selectedSupportType.value
  const label = support === 'ded' ? 'deductive' : support === 'nec' ? 'necessary' : 'coalition'
  return [
    ...baseResultsHeader.value,
    ' under ',
    { text: `${label} support`, tooltipId: supportTypeTooltipId.value },
  ]
})

const windowTitle = computed(() => {
  const modeLabel =
    selectedMode.value === 'enumerate'
      ? 'Enumerate'
      : selectedMode.value === 'credulous'
        ? 'Credulous'
        : 'Skeptical'
  const supportLabel =
    selectedSupportType.value === 'ded'
      ? 'Deductive'
      : selectedSupportType.value === 'nec'
        ? 'Necessary'
        : 'Coalition'
  return `Extensions: ${supportLabel} · ${selectedSemantics.value.displayName} · ${modeLabel}`
})
</script>

<template>
  <BaseEvaluationWindow
    v-model:evaluate-continuously="evaluateContinuously"
    :title="windowTitle"
    :instance-offset="instanceOffset"
    :query="query"
    :results-header="resultsHeader"
    :document-id="documentId"
    :state-key="stateKey"
    @close="emit('close')"
    @focus="onWindowFocus"
    @evaluate="emit('evaluate')"
  >
    <template #parameters>
      <label class="select select-sm w-fit">
        <span class="label">Support</span>
        <select v-model="selectedSupportType">
          <option value="coalition">Coalition</option>
          <option value="ded">Deductive</option>
          <option value="nec">Necessary</option>
        </select>
      </label>
      <GroupedSelect v-model="selectedSemantics" label="Semantics" :groups="semanticsSelectGroups" />
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
      <TermDefinitionBlock :id="supportTypeTooltipId" />
      <TermDefinitionBlock :id="selectedSemantics.tooltipId ?? selectedSemantics.key" />
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
