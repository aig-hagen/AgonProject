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
  type AbaSemantics,
  KNOWN_SEMANTIC_GROUPS,
  useAbaEvaluationQuery,
} from '@/modules/assumption-based-argumentation/evaluation/tweetyProject'
import { assumptionBasedArgumentationGlossary } from '@/modules/assumption-based-argumentation/glossary'
import type { ABAF, NodeId } from '@/modules/assumption-based-argumentation/model'
import { collectiveAttacksArgumentationGlossary } from '@/modules/collective-attacks-argumentation/glossary'
import type { DocumentId } from '@/modules/common/documents/db'
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Labels } from '@/modules/common/evaluation/labeling'
import ModeHint from '@/modules/common/evaluation/ModeHint.vue'
import { modeLabel, modeOptions } from '@/modules/common/evaluation/modes'
import ReductionHint from '@/modules/common/evaluation/ReductionHint.vue'
import type { Input } from '@/modules/common/evaluation/types'
import { useExtensionWindowBase } from '@/modules/common/evaluation/useExtensionWindowBase'
import GroupedSelect, { type GroupedSelectGroup } from '@/modules/common/forms/GroupedSelect.vue'
import ParameterField from '@/modules/common/forms/ParameterField.vue'
import PickerSelect from '@/modules/common/forms/PickerSelect.vue'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

const {
  input,
  instanceState,
  instanceOffset = 0,
  documentId,
  stateKey,
  labelsFor,
  suppressed = false,
  hosted = false,
} = defineProps<{
  input: Input<ABAF>
  instanceState: ExtensionWindowInstanceState
  instanceOffset?: number
  documentId?: DocumentId
  stateKey?: string
  // Maps a selected assumption set onto whatever the canvas currently shows.
  labelsFor: (extension: ReadonlySet<NodeId>) => Labels
  suppressed?: boolean
  hosted?: boolean
}>()

const emit = defineEmits<{
  'update:instanceState': [state: ExtensionWindowInstanceState]
  highlight: [highlight?: Highlight]
  title: [title: string]
  focus: []
  close: []
  evaluate: []
}>()

provide(TOOLTIP_REGISTRY_KEY, {
  ...collectiveAttacksArgumentationGlossary,
  ...assumptionBasedArgumentationGlossary,
})

const { t } = useI18n({ useScope: 'global' })

const allSemantics = KNOWN_SEMANTIC_GROUPS.flatMap((g) => g.semantics)

// Flat-only semantics stay visible but disabled for non-flat theories.
const isFlat = computed(() => input.content.isFlat())
const semanticsSelectGroups = computed<
  GroupedSelectGroup<AbaSemantics & { disabled: boolean; title?: string }>[]
>(() =>
  KNOWN_SEMANTIC_GROUPS.map((g) => ({
    key: g.key,
    displayName: g.displayName,
    options: g.semantics.map((s) => {
      const disabled = !!s.flatOnly && !isFlat.value
      return { ...s, disabled, title: disabled ? t('evaluation.requiresFlat') : undefined }
    }),
  })),
)

function resolveSemanticFromKey(key: string): AbaSemantics {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

const selectedSemantic = shallowRef<AbaSemantics>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedMode = ref<string>(instanceState.mode)

watch([selectedSemantic, selectedMode], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    mode: selectedMode.value,
  })
})

// Kept selected when the theory turns non-flat, but not sent to the backend.
const needsFlat = computed(() => !!selectedSemantic.value.flatOnly && !isFlat.value)

const query = useAbaEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  selectedMode,
  computed(() => !needsFlat.value),
)

const {
  selectedExtension,
  selectionHint,
  emptyMessage,
  dataExtensionsFormatedAndSorted,
  resultItems,
  countLabel,
  currentHighlight,
} = useExtensionWindowBase(selectedMode, query, (extension) => labelsFor(extension))

// Always reported; the host's useEvaluationFocus picks which window paints the canvas.
watch(currentHighlight, (h) => emit('highlight', h), { immediate: true })
const isActive = computed(() => !suppressed && currentHighlight.value !== undefined)

const windowTitle = computed(() => {
  const modeText = modeLabel(t, selectedMode.value)
  return `${selectedSemantic.value.displayName} · ${modeText}`
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
    :active="isActive"
    @close="emit('close')"
    @focus="emit('focus')"
    @evaluate="emit('evaluate')"
  >
    <template #parameters>
      <ParameterField :label="t('evaluation.fields.semantics')" min-width="10rem">
        <GroupedSelect v-model="selectedSemantic" :groups="semanticsSelectGroups" full-width>
          <template #option-suffix="{ option }">
            <ReductionHint v-if="option.reduction" :reduction="option.reduction" />
          </template>
        </GroupedSelect>
      </ParameterField>
      <ParameterField :label="t('evaluation.fields.mode')" max-width="8rem">
        <template #label-suffix>
          <ModeHint :mode="selectedMode" />
        </template>
        <PickerSelect v-model="selectedMode" :options="modeOptions(t)" />
      </ParameterField>
    </template>
    <template #parameters-footer>
      <TermDefinitionBlock v-if="selectedSemantic.tooltipId" :id="selectedSemantic.tooltipId" />
      <ReductionHint
        v-if="selectedSemantic.reduction"
        :reduction="selectedSemantic.reduction"
        with-text
      />
    </template>
    <template #results>
      <p v-if="needsFlat" class="p-3 text-sm text-base-content/65">
        {{ t('evaluation.flatOnlySemantics') }}
      </p>
      <template v-else-if="dataExtensionsFormatedAndSorted !== undefined">
        <EvaluationResultGrid
          v-model:selected="selectedExtension"
          :result-noun="t('evaluation.nouns.extensions')"
          :items="resultItems"
          :empty-message="emptyMessage"
          :selection-hint="selectionHint"
          :count-label="countLabel"
          :evaluation-duration-in-ms="dataExtensionsFormatedAndSorted.evaluationDurationInMs"
        />
      </template>
    </template>
  </BaseEvaluationWindow>
</template>
