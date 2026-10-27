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
import { computed, provide, ref, shallowRef, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { abstractArgumentationTooltips } from '@/modules/abstract-argumentation/glossary'
import type { DocumentId } from '@/modules/common/documents/db'
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import { labelsToHighlight } from '@/modules/common/evaluation/labeling'
import ModeHint from '@/modules/common/evaluation/ModeHint.vue'
import { modeLabel, modeOptions } from '@/modules/common/evaluation/modes'
import type { Input } from '@/modules/common/evaluation/types'
import { useEvaluationTutorialRefs } from '@/modules/common/evaluation/useEvaluationTutorialRefs'
import { escapeTexText } from '@/modules/common/export/texEscape'
import GroupedSelect, { type GroupedSelectGroup } from '@/modules/common/forms/GroupedSelect.vue'
import ParameterField from '@/modules/common/forms/ParameterField.vue'
import PickerSelect from '@/modules/common/forms/PickerSelect.vue'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'
import type { ExtensionWindowInstanceState } from '@/modules/dialectical-argumentation/evaluation/extensionWindowState'
import {
  type Interpretation,
  KNOWN_SEMANTIC_GROUPS,
  type Semantics,
  useInterpretationEvaluationQuery,
} from '@/modules/dialectical-argumentation/evaluation/tweetyProject'
import { dialecticalArgumentationGlossary } from '@/modules/dialectical-argumentation/glossary'
import type {
  AdfArgumentData,
  DialecticalArgumentation,
} from '@/modules/dialectical-argumentation/model'

const {
  input,
  instanceState,
  instanceOffset = 0,
  documentId,
  stateKey,
  suppressed = false,
  hosted = false,
} = defineProps<{
  input: Input<DialecticalArgumentation<AdfArgumentData>>
  instanceState: ExtensionWindowInstanceState
  instanceOffset?: number
  documentId?: DocumentId
  stateKey?: string
  suppressed?: boolean
  hosted?: boolean
}>()

const emit = defineEmits<{
  'update:instanceState': [state: ExtensionWindowInstanceState]
  highlight: [highlight?: Highlight]
  focus: []
  title: [title: string]
  close: []
  evaluate: []
}>()

provide(TOOLTIP_REGISTRY_KEY, {
  ...abstractArgumentationTooltips,
  ...dialecticalArgumentationGlossary,
})

const { t } = useI18n({ useScope: 'global' })

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
const selectedMode = ref<string>(instanceState.mode)

watch([selectedSemantic, selectedMode], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    mode: selectedMode.value,
  })
})

const query = useInterpretationEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  computed(() => selectedMode.value),
  true,
)
const { data } = query

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

function formatInterpretationTex(interp: Interpretation): string {
  return interp
    .map(({ name, label }) => {
      const nameEscaped = escapeTexText(name)
      if (label === 'in') return nameEscaped
      if (label === 'out') return `\\neg ${nameEscaped}`
      return `?${nameEscaped}`
    })
    .join(', ')
}

const selectionHint = computed(() =>
  selectedMode.value === 'enumerate'
    ? t('evaluation.interpretationWindow.selectModelHint')
    : t('evaluation.extensionWindow.selectArgumentHint'),
)
const emptyMessage = computed(() =>
  selectedMode.value === 'enumerate'
    ? t('evaluation.interpretationWindow.noModels')
    : t('evaluation.extensionWindow.noAcceptableArguments'),
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
        formattedTex: escapeTexText(arg.name),
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
      formattedTex: formatInterpretationTex(interp),
    })),
  }
})

const resultItems = computed(
  () =>
    formattedData.value?.items.map((i) => {
      if (selectedMode.value !== 'enumerate') {
        return { key: i.key, label: i.formatted, texLabel: i.formattedTex }
      }
      if (i.interpretation.length === 0) return { key: i.key, label: '∅', texLabel: '\\emptyset' }
      return { key: i.key, label: `{${i.formatted}}`, texLabel: `\\{${i.formattedTex}\\}` }
    }) ?? [],
)

const countLabel = computed(() =>
  selectedMode.value === 'enumerate'
    ? t('evaluation.counts.models', resultItems.value.length)
    : t('evaluation.counts.arguments', resultItems.value.length),
)

const windowTitle = computed(() => {
  const modeText = modeLabel(t, selectedMode.value)
  return `${selectedSemantic.value.displayName} · ${modeText}`
})

const selectedKey = ref<string | undefined>(undefined)
const currentHighlight = computed<Highlight | undefined>(() => {
  if (selectedKey.value === undefined || formattedData.value === undefined) return undefined
  const item = formattedData.value.items.find((i) => i.key === selectedKey.value)
  if (item === undefined) return undefined
  return labelsToHighlight(
    formattedData.value.stateId,
    new Map(item.interpretation.map((a) => [a.id, a.label] as const)),
    t,
  )
})
const semanticsSelectRef = useTemplateRef<{ $el: HTMLElement }>('semanticsSelect')
const resultsAreaRef = useTemplateRef<HTMLElement>('resultsArea')
useEvaluationTutorialRefs({
  selectors: { semanticsSelector: semanticsSelectRef },
  resultsArea: resultsAreaRef,
  resultsVersion: () => resultItems.value.length,
  suppressed: () => suppressed,
  grid: true,
})

// Always reported; the host's useEvaluationFocus picks which window paints the canvas.
watch(currentHighlight, (h) => emit('highlight', h), { immediate: true })
const isActive = computed(() => !suppressed && currentHighlight.value !== undefined)

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
    :active="isActive"
    @focus="emit('focus')"
    @evaluate="emit('evaluate')"
  >
    <template #parameters>
      <ParameterField :label="t('evaluation.fields.semantics')" min-width="10rem">
        <GroupedSelect
          ref="semanticsSelect"
          v-model="selectedSemantic"
          :groups="semanticsSelectGroups"
          full-width
        />
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
    </template>
    <template #results>
      <div v-if="formattedData !== undefined" ref="resultsArea" class="contents">
        <EvaluationResultGrid
          v-model:selected="selectedKey"
          :result-noun="t('evaluation.nouns.interpretations')"
          :items="resultItems"
          :empty-message="emptyMessage"
          :selection-hint="selectionHint"
          :count-label="countLabel"
          :evaluation-duration-in-ms="formattedData.evaluationDurationInMs"
        />
      </div>
    </template>
  </BaseEvaluationWindow>
</template>
