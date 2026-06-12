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

import type { ExtensionWindowInstanceState } from '@/modules/abstract-argumentation/evaluation/extensionWindowState'
import {
  type Extension,
  KNOWN_SEMANTIC_GROUPS,
  type Semantic,
  useExtensionEvaluationQuery,
} from '@/modules/abstract-argumentation/evaluation/tweetyProject'
import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import { NODE_GREEN, NODE_RED } from '@/modules/common/colors'
import EvaluationResultGrid from '@/modules/common/evaluation/EvaluationResultGrid.vue'
import type { Input } from '@/modules/common/evaluation/types'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import KatexInlineElement from '@/modules/common/KatexInlineElement.vue'
import { POPOVER_REGISTRY_KEY } from '@/modules/common/popoverRegistry'
import PublicationsPopover from '@/modules/common/PublicationsPopover.vue'
import TermPopover from '@/modules/common/TermPopover.vue'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

const { input, instanceState, instanceOffset = 0 } = defineProps<{
  input: Input<AbstractArgumentation<ArgumentData>>
  instanceState: ExtensionWindowInstanceState
  instanceOffset?: number
}>()

const emit = defineEmits<{
  'update:instanceState': [state: ExtensionWindowInstanceState]
  highlight: [highlight?: Highlight]
  close: []
}>()

provide(POPOVER_REGISTRY_KEY, abstractArgumentationGlossary)

const internalOpen = ref(true)
watch(internalOpen, (v) => { if (!v) emit('close') })

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const allSemantics = semanticGroups.flatMap((group) => group.semantics)

function resolveSemanticFromKey(key: string): Semantic {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

const selectedSemantic = shallowRef<Semantic>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedMode = ref<string>(instanceState.mode)
const evaluateContiously = ref(instanceState.evaluateContinuously)

watch([selectedSemantic, selectedMode, evaluateContiously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    mode: selectedMode.value,
    evaluateContinuously: evaluateContiously.value,
  })
})

const enabled = computed(() => evaluateContiously.value)
const { data, status, refetch, isLoading, isPending, isError } = useExtensionEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  computed(() => selectedMode.value),
  enabled,
)
const userCanTriggerFetch = computed(
  () => !evaluateContiously.value && status.value !== 'success',
)
const extensionsHeader = computed(() =>
  selectedMode.value === 'enumerate' ? 'Extensions' : 'Acceptable Arguments',
)
const extensionSelectionLabel = computed(() =>
  selectedMode.value === 'enumerate'
    ? 'Select extension to highlight.'
    : 'Select acceptable argument to highlight.',
)
function formatExtension(extension: Extension) {
  const namesSorted = extension.map((extension) => extension.name).sort()
  return `${namesSorted.join(', ')}`
}

const dataExtensionsFormatedAndSorted = computed(() => {
  if (data.value === undefined) {
    return undefined
  }

  const extensions = data.value.extensions
  const formated =
    selectedMode.value === 'enumerate'
      ? extensions.map((extension) => {
          const nameFormated = formatExtension(extension)
          const extensionIdsSorted = extension.map((argument) => argument.id).sort()
          return {
            key: JSON.stringify(extensionIdsSorted),
            extension: extension,
            nameFormated: nameFormated,
          }
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
      label:
        selectedMode.value === 'enumerate' ? `{${e.nameFormated}}` : e.nameFormated,
    })) ?? [],
)

const windowTitle = computed(() => {
  const modeLabel = selectedMode.value === 'enumerate' ? 'Enumerate'
    : selectedMode.value === 'credulous' ? 'Credulous' : 'Skeptical'
  return `Extensions: ${selectedSemantic.value.displayName} · ${modeLabel}`
})

const selectedExtension = ref<string | undefined>(undefined)
watchEffect(() => {
  if (selectedExtension.value === undefined) {
    return
  }
  if (dataExtensionsFormatedAndSorted.value === undefined) {
    emit('highlight', undefined)
    return
  }
  for (const extension of dataExtensionsFormatedAndSorted.value.formatedAndSorted) {
    if (extension.key === selectedExtension.value) {
      const stateId = dataExtensionsFormatedAndSorted.value.stateId
      const nodeIds = new Set(extension.extension.map((argument) => argument.id))
      emit('highlight', {
        stateId: stateId,
        nodes: nodeIds,
        color: NODE_GREEN,
        restColor: NODE_RED,
      })
      return
    }
  }
  emit('highlight', undefined)
})
</script>

<template>
  <FloatingWindow
    v-model:open="internalOpen"
    :title="windowTitle"
    :initial-position="{ x: 128 + instanceOffset * 24, y: 64 + instanceOffset * 24 }"
    :intitalSize="{ width: 576, height: 448 }"
    compactable
  >
    <template #default="{ compact }">
    <div class="p-4">
      <fieldset v-if="!compact" class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-52" hidden>
            <span class="label">Solver</span>
            <select disabled>
              <option selected>TweetyProject</option>
            </select>
          </label>
          <label class="select select-sm w-52">
            <span class="label">Semantics</span>
            <select v-model="selectedSemantic">
              <optgroup v-for="group in semanticGroups" :key="group.key" :label="group.displayName">
                <option v-for="semantic in group.semantics" :key="semantic.key" :value="semantic">
                  {{ semantic.displayName }}
                </option>
              </optgroup>
            </select>
          </label>
          <label class="select select-sm w-52">
            <span class="label">Mode</span>
            <select v-model="selectedMode">
              <option value="enumerate">Enumerate</option>
              <option value="credulous">Credulous</option>
              <option value="skeptical">Skeptical</option>
            </select>
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset" v-if="!compact && selectedSemantic.info !== undefined">
        <details class="collapse collapse-arrow">
          <summary class="collapse-title fieldset-legend ps-0 max-w-max">Definition</summary>
          <div class="collapse-content text-sm p-0">
            <div class="flex items-start gap-1 mb-1">
              <p><KatexInlineElement :text="selectedSemantic.info.description" /></p>
              <PublicationsPopover :publications="[{ label: selectedSemantic.info.reference.name, href: selectedSemantic.info.reference.url }]" />
            </div>
          </div>
        </details>
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
        <legend v-if="!compact" class="fieldset-legend">{{ extensionsHeader }}</legend>
        <div v-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Failed evaluating extensions</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating extensions...</span>
        </div>
        <template v-if="dataExtensionsFormatedAndSorted !== undefined">
          <EvaluationResultGrid
            v-model:selected="selectedExtension"
            :items="resultItems"
            empty-message="No extensions exist."
            :selection-hint="extensionSelectionLabel"
            :evaluation-duration-in-ms="dataExtensionsFormatedAndSorted.evaluationDurationInMs"
          />
        </template>
      </fieldset>
    </div>
    </template>
  </FloatingWindow>
</template>
