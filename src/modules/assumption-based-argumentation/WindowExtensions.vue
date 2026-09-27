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
import { useI18n } from 'vue-i18n'

import type { ExtensionWindowInstanceState } from '@/modules/assumption-based-argumentation/evaluation/extensionWindowState'
import {
  KNOWN_SEMANTIC_GROUPS,
  useAbaEvaluationQuery,
} from '@/modules/assumption-based-argumentation/evaluation/tweetyProject'
import { assumptionBasedArgumentationGlossary } from '@/modules/assumption-based-argumentation/glossary'
import type { ABAF } from '@/modules/assumption-based-argumentation/model'
import type { DocumentId } from '@/modules/common/documents/db'
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import ModeHint from '@/modules/common/evaluation/ModeHint.vue'
import type { Semantics } from '@/modules/common/evaluation/tweety-project/semantics'
import type { Input } from '@/modules/common/evaluation/types'
import { useExtensionWindowBase } from '@/modules/common/evaluation/useExtensionWindowBase'
import GroupedSelect, { type GroupedSelectGroup } from '@/modules/common/forms/GroupedSelect.vue'
import ParameterField from '@/modules/common/forms/ParameterField.vue'
import PickerSelect from '@/modules/common/forms/PickerSelect.vue'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const {
  input,
  instanceState,
  instanceOffset = 0,
  documentId,
  stateKey,
  hosted = false,
} = defineProps<{
  input: Input<ABAF>
  instanceState: ExtensionWindowInstanceState
  instanceOffset?: number
  documentId?: DocumentId
  stateKey?: string
  hosted?: boolean
}>()

const emit = defineEmits<{
  'update:instanceState': [state: ExtensionWindowInstanceState]
  title: [title: string]
  close: []
  evaluate: []
}>()

provide(TOOLTIP_REGISTRY_KEY, assumptionBasedArgumentationGlossary)

const { t } = useI18n({ useScope: 'global' })

const allSemantics = KNOWN_SEMANTIC_GROUPS.flatMap((g) => g.semantics)

// Flat-only semantics stay visible but disabled for non-flat theories.
const isFlat = computed(() => input.content.isFlat())
const semanticsSelectGroups = computed<GroupedSelectGroup<Semantics & { disabled: boolean }>[]>(
  () =>
    KNOWN_SEMANTIC_GROUPS.map((g) => ({
      key: g.key,
      displayName: g.displayName,
      options: g.semantics.map((s) => ({ ...s, disabled: g.flatOnly && !isFlat.value })),
    })),
)

function resolveSemanticFromKey(key: string): Semantics {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

const selectedSemantic = shallowRef<Semantics>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedMode = ref<string>(instanceState.mode)

watch([selectedSemantic, selectedMode], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    mode: selectedMode.value,
  })
})

const query = useAbaEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  selectedMode,
  true,
)

const { emptyMessage, dataExtensionsFormatedAndSorted, resultItems } = useExtensionWindowBase(
  selectedMode,
  query,
)

const windowTitle = computed(() => {
  const modeLabel =
    selectedMode.value === 'enumerate'
      ? t('evaluation.modes.enumerate')
      : selectedMode.value === 'credulous'
        ? t('evaluation.modes.credulous')
        : t('evaluation.modes.skeptical')
  return `${selectedSemantic.value.displayName} · ${modeLabel}`
})

// The compact host labels its switcher pill with this title (not the raw key).
watch(windowTitle, (title) => emit('title', title), { immediate: true })
</script>

<template>
  <BaseEvaluationWindow
    :title="windowTitle"
    :hosted="hosted"
    :instance-offset="instanceOffset"
    :initial-size="{ width: 400, height: 360 }"
    :query="query"
    :document-id="documentId"
    :state-key="stateKey"
    @close="emit('close')"
    @evaluate="emit('evaluate')"
  >
    <template #parameters>
      <ParameterField :label="t('evaluation.fields.semantics')" min-width="10rem">
        <GroupedSelect v-model="selectedSemantic" :groups="semanticsSelectGroups" full-width />
      </ParameterField>
      <ParameterField :label="t('evaluation.fields.mode')" max-width="8rem">
        <template #label-suffix>
          <ModeHint :mode="selectedMode" />
        </template>
        <PickerSelect
          v-model="selectedMode"
          :options="[
            { value: 'enumerate', label: t('evaluation.modes.enumerate') },
            { value: 'credulous', label: t('evaluation.modes.credulous') },
            { value: 'skeptical', label: t('evaluation.modes.skeptical') },
          ]"
        />
      </ParameterField>
    </template>
    <template #parameters-footer>
      <TermDefinitionBlock v-if="selectedSemantic.tooltipId" :id="selectedSemantic.tooltipId" />
    </template>
    <template #results>
      <template v-if="dataExtensionsFormatedAndSorted !== undefined">
        <EvaluationResultGrid
          :result-noun="t('evaluation.nouns.extensions')"
          :items="resultItems"
          :empty-message="emptyMessage"
          :evaluation-duration-in-ms="dataExtensionsFormatedAndSorted.evaluationDurationInMs"
        />
      </template>
    </template>
  </BaseEvaluationWindow>
</template>
