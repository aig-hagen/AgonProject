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
import type { ArgumentId } from '@/modules/common/argumentation/model'
import type { DocumentId } from '@/modules/common/documents/db'
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import type { Input } from '@/modules/common/evaluation/types'
import GroupedSelect, { type GroupedSelectGroup } from '@/modules/common/forms/GroupedSelect.vue'
import ParameterField from '@/modules/common/forms/ParameterField.vue'
import PickerSelect from '@/modules/common/forms/PickerSelect.vue'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'
import type { PafWindowInstanceState } from '@/modules/probabilistic-argumentation/evaluation/extensionWindowState'
import {
  KNOWN_SEMANTIC_GROUPS,
  type Semantics,
  usePafEvaluationQuery,
} from '@/modules/probabilistic-argumentation/evaluation/tweetyProject'
import { probabilisticArgumentationGlossary } from '@/modules/probabilistic-argumentation/glossary'
import type {
  PafArgumentData,
  ProbabilisticArgumentation,
} from '@/modules/probabilistic-argumentation/model'

const {
  input,
  instanceState,
  instanceOffset = 0,
  documentId,
  stateKey,
  suppressed = false,
  hosted = false,
} = defineProps<{
  input: Input<ProbabilisticArgumentation<PafArgumentData>>
  instanceState: PafWindowInstanceState
  instanceOffset?: number
  documentId?: DocumentId
  stateKey?: string
  suppressed?: boolean
  hosted?: boolean
}>()

const emit = defineEmits<{
  'update:instanceState': [state: PafWindowInstanceState]
  setWeights: [weights: Array<{ id: ArgumentId; weight: number }>]
  title: [title: string]
  evaluate: []
  close: []
}>()

provide(TOOLTIP_REGISTRY_KEY, {
  ...abstractArgumentationGlossary,
  ...probabilisticArgumentationGlossary,
})

const allSemantics = KNOWN_SEMANTIC_GROUPS.flatMap((g) => g.semantics)
const semanticsSelectGroups: GroupedSelectGroup<Semantics>[] = KNOWN_SEMANTIC_GROUPS.map((g) => ({
  key: g.key,
  displayName: g.displayName,
  options: g.semantics,
}))

function resolveSemanticFromKey(key: string): Semantics {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

const selectedSemantic = shallowRef<Semantics>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedMode = ref(instanceState.mode)
const selectedSolver = ref(instanceState.solver)
const isApproximate = computed({
  get: () => selectedSolver.value === 'montecarlo',
  set: (v) => {
    selectedSolver.value = v ? 'montecarlo' : 'simple'
  },
})
watch([selectedSemantic, selectedMode, selectedSolver], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    mode: selectedMode.value,
    solver: selectedSolver.value,
  })
})

const query = usePafEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  computed(() => selectedMode.value),
  computed(() => selectedSolver.value),
  true,
)

const { data } = query

// Suppressed instances (all but the active one in the compact host) own no node weights.
const emittedWeights = computed(() =>
  suppressed || data.value === undefined
    ? []
    : data.value.entries.map((e) => ({ id: e.id, weight: e.probability })),
)
watch(emittedWeights, (w) => emit('setWeights', w))

const windowTitle = computed(() => {
  const modeLabel = selectedMode.value === 'skeptical' ? 'Skeptical' : 'Credulous'
  const solverLabel = isApproximate.value ? ' · Approx.' : ''
  return `${selectedSemantic.value.displayName} · ${modeLabel}${solverLabel}`
})

// The compact host labels its switcher pill with this title (not the raw key).
watch(windowTitle, (t) => emit('title', t), { immediate: true })
</script>

<template>
  <BaseEvaluationWindow
    :title="windowTitle"
    :hosted="hosted"
    :instance-offset="instanceOffset"
    :initial-position-base="{ x: 192, y: 96 }"
    :initial-size="{ width: 400, height: 420 }"
    :query="query"
    :document-id="documentId"
    :state-key="stateKey"
    @evaluate="emit('evaluate')"
    @close="emit('close')"
  >
    <template #parameters>
      <ParameterField label="Semantics" min-width="10rem">
        <GroupedSelect v-model="selectedSemantic" :groups="semanticsSelectGroups" full-width />
      </ParameterField>
      <ParameterField label="Mode" max-width="8rem">
        <PickerSelect
          v-model="selectedMode"
          :options="[
            { value: 'credulous', label: 'Credulous' },
            { value: 'skeptical', label: 'Skeptical' },
          ]"
        />
      </ParameterField>
      <ParameterField label="Inference" min-width="100%" max-width="100%">
        <div class="flex items-center gap-1.5 text-sm h-8">
          <TermTooltip id="exactInference" :class="!isApproximate ? '' : 'opacity-40'"
            >Exact</TermTooltip
          >
          <input type="checkbox" class="toggle toggle-sm" v-model="isApproximate" />
          <TermTooltip id="approximateInference" :class="isApproximate ? '' : 'opacity-40'"
            >Approximate</TermTooltip
          >
        </div>
      </ParameterField>
    </template>
    <template #parameters-footer>
      <TermDefinitionBlock :id="selectedSemantic.key" />
    </template>
    <template #results>
      <template v-if="data !== undefined">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="entry in data.entries"
            :key="entry.id"
            class="btn btn-sm btn-ghost pointer-events-none text-base"
          >
            {{ entry.name }}: {{ entry.probability.toFixed(3) }}
          </span>
        </div>
        <p class="label">{{ data.evaluationDurationInMs }}ms</p>
      </template>
    </template>
  </BaseEvaluationWindow>
</template>
