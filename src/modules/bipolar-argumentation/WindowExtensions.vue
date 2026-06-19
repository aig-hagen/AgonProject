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
  KEY_NONE_INTERPRETATION_GROUP,
  KNOWN_SEMANTIC_GROUPS,
  type Semantics,
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
const noneGroups = semanticGroups.filter((g) => g.key === KEY_NONE_INTERPRETATION_GROUP)
const afGroups = semanticGroups.filter((g) => g.key !== KEY_NONE_INTERPRETATION_GROUP)

function resolveSemanticFromKey(key: string, supportType: string): Semantics {
  const groups = supportType === 'none' ? noneGroups : afGroups
  const found = groups.flatMap((g) => g.semantics).find((s) => s.key === key)
  return found ?? groups[0]!.semantics[0]!
}

const selectedSupportType = ref<string>(instanceState.supportTypeKey)
const selectedSemantics = shallowRef<Semantics>(
  resolveSemanticFromKey(instanceState.semanticKey, instanceState.supportTypeKey),
)
const selectedMode = ref<string>(instanceState.mode)
const evaluateContinuously = ref(instanceState.evaluateContinuously)

const visibleGroups = computed(() =>
  selectedSupportType.value === 'none' ? noneGroups : afGroups,
)

watchEffect(() => {
  const validSemantics = visibleGroups.value.flatMap((g) => g.semantics)
  const currentKey = selectedSemantics.value.key
  selectedSemantics.value = validSemantics.find((s) => s.key === currentKey) ?? validSemantics[0]!
})

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
} = useExtensionWindowBase(selectedMode, query, computed(() => selectedSemantics.value.displayName))

watch(currentHighlight, (h) => emit('highlight', h))
function onWindowFocus() { emit('highlight', currentHighlight.value) }

const resultsHeader = computed((): ResultsHeaderPart[] => {
  const support = selectedSupportType.value
  if (support === 'none') return baseResultsHeader.value
  const tooltipId = support === 'ded' ? 'deductiveSupport' : 'necessarySupport'
  const label = support === 'ded' ? 'deductive' : 'necessary'
  return [...baseResultsHeader.value, ' under ', { text: `${label} support`, tooltipId }]
})

const windowTitle = computed(() => {
  const modeLabel = selectedMode.value === 'enumerate' ? 'Enumerate'
    : selectedMode.value === 'credulous' ? 'Credulous' : 'Skeptical'
  const supportLabel = selectedSupportType.value === 'none' ? 'None'
    : selectedSupportType.value === 'ded' ? 'Deductive' : 'Necessary'
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
    :storage-key="storageKey"
    @close="emit('close')"
    @focus="onWindowFocus"
  >
    <template #parameters>
      <label class="select select-sm w-fit">
        <span class="label">Support</span>
        <select v-model="selectedSupportType">
          <option value="none">None</option>
          <option value="ded">Deductive</option>
          <option value="nec">Necessary</option>
        </select>
      </label>
      <label class="select select-sm w-fit">
        <span class="label">Semantics</span>
        <select v-model="selectedSemantics">
          <optgroup v-for="group in visibleGroups" :key="group.key" :label="group.displayName">
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
    </template>
    <template #parameters-footer>
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
