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
import type { ExtensionWindowInstanceState } from '@/modules/collective-attacks-argumentation/evaluation/extensionWindowState'
import {
  KNOWN_SEMANTIC_GROUPS,
  type Semantics,
  useSetAfEvaluationQuery,
} from '@/modules/collective-attacks-argumentation/evaluation/tweetyProject'
import { collectiveAttacksArgumentationGlossary } from '@/modules/collective-attacks-argumentation/glossary'
import { type SetAF, type SetAfArgumentData } from '@/modules/collective-attacks-argumentation/model'
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Input } from '@/modules/common/evaluation/types'
import { useExtensionWindowBase } from '@/modules/common/evaluation/useExtensionWindowBase'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const { input, instanceState, instanceOffset = 0, storageKey } = defineProps<{
  input: Input<SetAF<SetAfArgumentData>>
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

provide(TOOLTIP_REGISTRY_KEY, { ...abstractArgumentationGlossary, ...collectiveAttacksArgumentationGlossary })

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const allSemantics = semanticGroups.flatMap((g) => g.semantics)

function resolveSemanticFromKey(key: string): Semantics {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

const selectedSemantic = shallowRef<Semantics>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedMode = ref<string>(instanceState.mode)
const evaluateContinuously = ref(instanceState.evaluateContinuously)

watch([selectedSemantic, selectedMode, evaluateContinuously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    mode: selectedMode.value,
    evaluateContinuously: evaluateContinuously.value,
  })
})

const query = useSetAfEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  selectedMode,
  evaluateContinuously,
)

const {
  selectedExtension,
  resultsHeader,
  selectionHint,
  emptyMessage,
  dataExtensionsFormatedAndSorted,
  resultItems,
  currentHighlight,
} = useExtensionWindowBase(selectedMode, query, computed(() => selectedSemantic.value.displayName))

watch(currentHighlight, (h) => emit('highlight', h))
function onWindowFocus() { emit('highlight', currentHighlight.value) }

const windowTitle = computed(() => {
  const modeLabel =
    selectedMode.value === 'enumerate' ? 'Enumerate'
    : selectedMode.value === 'credulous' ? 'Credulous' : 'Skeptical'
  return `Extensions: ${selectedSemantic.value.displayName} · ${modeLabel}`
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
    @evaluate="emit('evaluate')"
  >
    <template #parameters>
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
