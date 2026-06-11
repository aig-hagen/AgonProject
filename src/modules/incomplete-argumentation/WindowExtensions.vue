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
import { computed, ref, shallowRef, toRef, watchEffect } from 'vue'

import { NODE_GREEN, NODE_RED } from '@/modules/common/colors'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Input } from '@/modules/common/evaluation/types'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import KatexInlineElement from '@/modules/common/KatexInlineElement.vue'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'
import {
  type Extension,
  type IafMode,
  type IafType,
  KEY_DEFAULT_SEMANTIC,
  KNOWN_SEMANTIC_GROUPS,
  type Semantic,
  useExtensionEvaluationQuery,
} from '@/modules/incomplete-argumentation/evaluation/tweetyProject'
import type { IafArgumentData, IncompleteArgumentation } from '@/modules/incomplete-argumentation/model'

const open = defineModel<boolean>('open', { required: true })
const { input } = defineProps<{
  input: Input<IncompleteArgumentation<IafArgumentData>>
}>()

const emit = defineEmits<{
  highlight: [highlight?: Highlight]
}>()

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const allSemantics = semanticGroups.flatMap((g) => g.semantics)

const defaultSemantic = allSemantics.find((s) => s.key === KEY_DEFAULT_SEMANTIC)
if (defaultSemantic === undefined) throw new Error('Default semantic does not exist.')

const selectedSemantic = shallowRef<Semantic>(defaultSemantic)
const selectedType = ref<IafType>('pos')
const selectedMode = ref<IafMode>('enumerate')
const evaluateContiously = ref(false)
const enabled = computed(() => evaluateContiously.value && open.value)

const { data, status, refetch, isLoading, isPending, isError } = useExtensionEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  selectedType,
  selectedMode,
  enabled,
)

const userCanTriggerFetch = computed(
  () => open.value && !evaluateContiously.value && status.value !== 'success',
)

const resultsHeader = computed(() =>
  selectedMode.value === 'enumerate' ? 'Extensions' : 'Acceptable Arguments',
)
const selectionHint = computed(() =>
  selectedMode.value === 'enumerate'
    ? 'Select extension to highlight.'
    : 'Select acceptable argument to highlight.',
)

function formatExtension(extension: Extension) {
  return extension.map((e) => e.name).sort().join(', ')
}

const dataExtensionsFormatedAndSorted = computed(() => {
  if (data.value === undefined) return undefined
  const extensions = data.value.extensions
  const formated =
    selectedMode.value === 'enumerate'
      ? extensions.map((extension) => {
          const nameFormated = formatExtension(extension)
          const extensionIdsSorted = extension.map((a) => a.id).sort()
          return { key: JSON.stringify(extensionIdsSorted), extension, nameFormated }
        })
      : extensions.flatMap((extension) =>
          extension.map((argument) => ({
            key: String(argument.id),
            extension: [argument],
            nameFormated: argument.name,
          })),
        )
  formated.sort((a, b) => a.nameFormated.localeCompare(b.nameFormated))
  return {
    stateId: data.value.stateId,
    formatedAndSorted: formated,
    evaluationDurationInSeconds: data.value.evaluationDurationInSeconds,
  }
})

const resultItems = computed(
  () =>
    dataExtensionsFormatedAndSorted.value?.formatedAndSorted.map((e) => ({
      key: e.key,
      label: selectedMode.value === 'enumerate' ? `{${e.nameFormated}}` : e.nameFormated,
    })) ?? [],
)

const selectedExtension = ref<string | undefined>(undefined)
watchEffect(() => {
  if (selectedExtension.value === undefined) return
  if (dataExtensionsFormatedAndSorted.value === undefined) {
    emit('highlight', undefined)
    return
  }
  for (const extension of dataExtensionsFormatedAndSorted.value.formatedAndSorted) {
    if (extension.key === selectedExtension.value) {
      const stateId = dataExtensionsFormatedAndSorted.value.stateId
      const nodeIds = new Set(extension.extension.map((argument) => argument.id))
      emit('highlight', { stateId, nodes: nodeIds, color: NODE_GREEN, restColor: NODE_RED })
      return
    }
  }
  emit('highlight', undefined)
})
</script>

<template>
  <FloatingWindow
    v-model:open="open"
    title="Extension Semantics"
    :initial-position="{ x: 128, y: 64 }"
    :intitalSize="{ width: 576, height: 448 }"
  >
    <div class="p-4">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-54">
            <span class="label min-w-24">Type</span>
            <select v-model="selectedType">
              <option value="pos">Possible</option>
              <option value="nec">Necessary</option>
            </select>
          </label>
          <label class="select select-sm w-54">
            <span class="label min-w-24">Mode</span>
            <select v-model="selectedMode">
              <option value="enumerate">Enumerate</option>
              <option value="credulous">Credulous</option>
              <option value="skeptical">Skeptical</option>
            </select>
          </label>
          <label class="select select-sm w-54">
            <span class="label min-w-24">Semantics</span>
            <select v-model="selectedSemantic">
              <optgroup
                v-for="group in semanticGroups"
                :key="group.key"
                :label="group.displayName"
              >
                <option
                  v-for="semantic in group.semantics"
                  :key="semantic.key"
                  :value="semantic"
                >
                  {{ semantic.displayName }}
                </option>
              </optgroup>
            </select>
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset" v-if="selectedSemantic.info !== undefined">
        <details class="collapse collapse-arrow">
          <summary class="collapse-title fieldset-legend ps-0 max-w-max">Definition</summary>
          <div class="collapse-content text-sm p-0">
            <p class="mb-1">
              <KatexInlineElement :text="selectedSemantic.info.description" /><sup
                :title="selectedSemantic.info.reference.name"
                ><a
                  class="link link-primary"
                  :href="selectedSemantic.info.reference.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >[1] ↗</a
                ></sup
              >
            </p>
          </div>
        </details>
      </fieldset>
      <fieldset class="fieldset">
        <div class="flex gap-2 flex-wrap">
          <button
            class="btn btn-sm btn-soft btn-neutral mt-2"
            :disabled="!userCanTriggerFetch"
            @click="() => refetch()"
          >
            Evaluate
          </button>
          <label class="label mt-2">
            <input type="checkbox" v-model="evaluateContiously" class="checkbox checkbox-sm" />
            Evaluate continuously
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset" v-if="!isPending || isLoading">
        <legend class="fieldset-legend">{{ resultsHeader }}</legend>
        <div v-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Failed evaluating extensions</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating extensions</span>
        </div>
        <template v-if="dataExtensionsFormatedAndSorted !== undefined">
          <EvaluationResultGrid
            v-model:selected="selectedExtension"
            :items="resultItems"
            :empty-message="selectedMode === 'enumerate' ? 'No extensions exist.' : 'No acceptable arguments exist.'"
            :selection-hint="selectionHint"
            :evaluation-duration-in-seconds="dataExtensionsFormatedAndSorted.evaluationDurationInSeconds"
          />
        </template>
      </fieldset>
    </div>
  </FloatingWindow>
</template>
