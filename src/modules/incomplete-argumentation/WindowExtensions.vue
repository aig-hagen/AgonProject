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
import { computed, ref, shallowRef, toRef, watch } from 'vue'

import { NODE_GREEN, NODE_RED } from '@/modules/common/colors'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Input } from '@/modules/common/evaluation/types'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'
import type { ExtensionWindowInstanceState } from '@/modules/incomplete-argumentation/evaluation/extensionWindowState'
import {
  type Extension,
  type IafMode,
  type IafType,
  KNOWN_SEMANTIC_GROUPS,
  type Semantic,
  useExtensionEvaluationQuery,
} from '@/modules/incomplete-argumentation/evaluation/tweetyProject'
import type { IafArgumentData, IncompleteArgumentation } from '@/modules/incomplete-argumentation/model'

const { input, instanceState, instanceOffset = 0 } = defineProps<{
  input: Input<IncompleteArgumentation<IafArgumentData>>
  instanceState: ExtensionWindowInstanceState
  instanceOffset?: number
}>()

const emit = defineEmits<{
  'update:instanceState': [state: ExtensionWindowInstanceState]
  highlight: [highlight?: Highlight]
  close: []
}>()

const internalOpen = ref(true)
watch(internalOpen, (v) => { if (!v) emit('close') })

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const allSemantics = semanticGroups.flatMap((g) => g.semantics)

function resolveSemanticFromKey(key: string): Semantic {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

const selectedSemantic = shallowRef<Semantic>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedType = ref<IafType>(instanceState.type)
const selectedMode = ref<IafMode>(instanceState.mode)
const evaluateContiously = ref(instanceState.evaluateContinuously)
const isCompact = ref(false)
watch(isCompact, (v) => { if (v) evaluateContiously.value = true })

watch([selectedSemantic, selectedType, selectedMode, evaluateContiously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    type: selectedType.value,
    mode: selectedMode.value,
    evaluateContinuously: evaluateContiously.value,
  })
})

const enabled = computed(() => evaluateContiously.value)

const { data, status, refetch, isLoading, isPending, isError } = useExtensionEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  selectedType,
  selectedMode,
  enabled,
)

const userCanTriggerFetch = computed(
  () => !evaluateContiously.value && status.value !== 'success',
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
    evaluationDurationInMs: data.value.evaluationDurationInMs,
  }
})

const resultItems = computed(
  () =>
    dataExtensionsFormatedAndSorted.value?.formatedAndSorted.map((e) => ({
      key: e.key,
      label: selectedMode.value === 'enumerate' ? `{${e.nameFormated}}` : e.nameFormated,
    })) ?? [],
)

const windowTitle = computed(() => {
  const typeLabel = selectedType.value === 'pos' ? 'Possible' : 'Necessary'
  const modeLabel = selectedMode.value === 'enumerate' ? 'Enumerate'
    : selectedMode.value === 'credulous' ? 'Credulous' : 'Skeptical'
  return `Extensions: ${selectedSemantic.value.displayName} · ${typeLabel} · ${modeLabel}`
})

const selectedExtension = ref<string | undefined>(undefined)
const currentHighlight = computed<Highlight | undefined>(() => {
  if (selectedExtension.value === undefined || dataExtensionsFormatedAndSorted.value === undefined) {
    return undefined
  }
  for (const extension of dataExtensionsFormatedAndSorted.value.formatedAndSorted) {
    if (extension.key === selectedExtension.value) {
      return {
        stateId: dataExtensionsFormatedAndSorted.value.stateId,
        groups: [{ nodes: new Set(extension.extension.map((a) => a.id)), color: NODE_GREEN }],
        attackedByFirst: NODE_RED,
      }
    }
  }
  return undefined
})
watch(currentHighlight, (h) => emit('highlight', h))
function onWindowFocus() { emit('highlight', currentHighlight.value) }
</script>

<template>
  <FloatingWindow
    v-model:open="internalOpen"
    v-model:compact="isCompact"
    :title="windowTitle"
    :initial-position="{ x: 128 + instanceOffset * 24, y: 64 + instanceOffset * 24 }"
    :intitalSize="{ width: 576, height: 448 }"
    compactable
    @focus="onWindowFocus"
  >
    <template #default="{ compact }">
    <div class="p-4">
      <fieldset v-if="!compact" class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-fit">
            <span class="label">Type</span>
            <select v-model="selectedType">
              <option value="pos">Possible</option>
              <option value="nec">Necessary</option>
            </select>
          </label>
          <label class="select select-sm w-fit">
            <span class="label">Semantics</span>
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
          <label class="select select-sm w-fit">
            <span class="label">Mode</span>
            <select v-model="selectedMode">
              <option value="enumerate">Enumerate</option>
              <option value="credulous">Credulous</option>
              <option value="skeptical">Skeptical</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset v-if="!compact" class="fieldset">
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
        <legend v-if="!compact" class="fieldset-legend">{{ resultsHeader }}</legend>
        <div v-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Evaluation failed</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating...</span>
        </div>
        <template v-if="dataExtensionsFormatedAndSorted !== undefined">
          <EvaluationResultGrid
            v-model:selected="selectedExtension"
            :items="resultItems"
            :empty-message="selectedMode === 'enumerate' ? 'No extensions exist.' : 'No acceptable arguments exist.'"
            :selection-hint="selectionHint"
            :evaluation-duration-in-ms="dataExtensionsFormatedAndSorted.evaluationDurationInMs"
          />
        </template>
      </fieldset>
    </div>
    </template>
  </FloatingWindow>
</template>
