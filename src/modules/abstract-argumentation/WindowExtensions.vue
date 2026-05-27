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
import { computed, nextTick, ref, shallowRef, toRef, useTemplateRef, watchEffect } from 'vue'

import {
  type Extension,
  KEY_DEFAULT_SEMANTIC,
  KNOWN_SEMANTIC_GROUPS,
  type Semantic,
  useExtensionEvaluationQuery,
} from '@/modules/abstract-argumentation/evaluation/tweetyProject'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import { NODE_GREEN, NODE_RED } from '@/modules/common/colors'
import type { Input } from '@/modules/common/evaluation/types'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import KatexInlineElement from '@/modules/common/KatexInlineElement.vue'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

const open = defineModel<boolean>('open', { required: true })
const { input } = defineProps<{
  input: Input<AbstractArgumentation<ArgumentData>>
}>()

const emit = defineEmits<{
  highlight: [highlight?: Highlight]
}>()

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const stableSemantic = semanticGroups
  .flatMap((group) => group.semantics)
  .find((semantics) => semantics.key === KEY_DEFAULT_SEMANTIC)
if (stableSemantic === undefined) {
  throw new Error('Default semantic does not exist.')
}
const selectedSemantic = shallowRef<Semantic>(stableSemantic)
const selectedMode = shallowRef<string>('enumerate')
const evaluateContiously = ref(false)
const enabled = computed(() => evaluateContiously.value && open.value)
const { data, status, refetch, isLoading, isPending, isError } = useExtensionEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  computed(() => selectedMode.value),
  enabled,
)
const userCanTriggerFetch = computed(
  () => open.value && !evaluateContiously.value && status.value !== 'success',
)
const extensionsElementRef = useTemplateRef('extensions')
const extensionsElementItemRefs = useTemplateRef('extension-itme')

const EXTENSIONS_FALLBACK_WIDTH = 192
const EXTENSIONS_MIN_WIDTH_VAR = '--extension-item-min-width'

watchEffect(async () => {
  const extensionsElement = extensionsElementRef.value
  if (extensionsElement === null) {
    return
  }
  const extensionsElementItems = extensionsElementItemRefs.value
  if (extensionsElementItems === null) {
    return
  }
  const extensions = data.value?.extensions ?? []
  if (extensions.length === 0) {
    extensionsElement.style.setProperty(EXTENSIONS_MIN_WIDTH_VAR, `${EXTENSIONS_FALLBACK_WIDTH}px`)
    return
  }
  extensionsElement.style.removeProperty(EXTENSIONS_MIN_WIDTH_VAR)
  await nextTick() // wait to finish rendering
  const maxWidht = recalcMaxWidthExtension(extensionsElementItems)
  extensionsElement.style.setProperty(EXTENSIONS_MIN_WIDTH_VAR, `${maxWidht}px`)
})

function recalcMaxWidthExtension(extensionsElementItems: HTMLElement[]) {
  return Math.max(...extensionsElementItems.map((element) => element.getBoundingClientRect().width))
}

function formatExtension(extension: Extension) {
  const namesSorted = extension.map((extension) => extension.name).sort()
  return `${namesSorted.join(', ')}`
}

const dataExtensionsFormatedAndSorted = computed(() => {
  if (data.value === undefined) {
    return undefined
  }

  const formated = data.value.extensions.map((extension) => {
    const nameFormated = formatExtension(extension)
    const extensionIdsSorted = extension.map((argument) => argument.id).sort()
    return {
      key: JSON.stringify(extensionIdsSorted),
      extension: extension,
      nameFormated: nameFormated,
    }
  })

  formated.sort((a, b) => a.nameFormated.localeCompare(b.nameFormated))

  return {
    stateId: data.value.stateId,
    formatedAndSorted: formated,
    evaluationDurationInSeconds: data.value.evaluationDurationInSeconds,
  }
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
    v-model:open="open"
    title="Extension evaluation"
    :initial-position="{ x: 128, y: 64 }"
    :intitalSize="{ width: 576, height: 448 }"
  >
    <div class="p-4">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-52">
            <span class="label">Solver</span>
            <select disabled>
              <option selected>TweetyProject</option>
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
        <legend class="fieldset-legend">Extensions</legend>
        <div v-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Failed evaluating extensions</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating extensions...</span>
        </div>
        <template v-if="dataExtensionsFormatedAndSorted !== undefined">
          <div
            v-if="dataExtensionsFormatedAndSorted.formatedAndSorted.length === 0"
            role="alert"
            class="alert alert-info alert-soft"
          >
            <span>No extensions exist.</span>
          </div>
          <div v-else class="extensions gap-2" ref="extensions">
            <label
              v-for="extension of dataExtensionsFormatedAndSorted.formatedAndSorted"
              :key="extension.key"
              class="label grow-2"
              ref="extension-itme"
            >
              <button
                type="button"
                class="btn btn-sm gap-2 justify-start outline-none focus:outline-none"
                :class="{
                  'btn-primary': selectedExtension === extension.key,
                  'btn-ghost': selectedExtension !== extension.key,
                }"
                @click="selectedExtension = extension.key"
              >
                {{ '{' + extension.nameFormated + '}' }}
              </button>
            </label>
          </div>
          <p class="label">Select extension to highlight.</p>
          <p v-if="dataExtensionsFormatedAndSorted.evaluationDurationInSeconds !== 0" class="label">
            Evaluation took
            {{ dataExtensionsFormatedAndSorted.evaluationDurationInSeconds }} seconds.
          </p>
        </template>
      </fieldset>
    </div>
  </FloatingWindow>
</template>
<style style="scoped">
.extensions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--extension-item-min-width), auto));
  justify-content: start;
}
</style>
