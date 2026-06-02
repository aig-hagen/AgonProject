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
import type { Input } from '@/modules/common/evaluation/types'
import type { Highlight } from '@/modules/common/graph-editor/graphEditor'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'
import {
  type Interpretation,
  KEY_DEFAULT_SEMANTIC,
  KNOWN_SEMANTIC_GROUPS,
  type Semantic,
  useInterpretationEvaluationQuery,
} from '@/modules/dialectical-argumentation/evaluation/tweetyProject'
import type { AdfArgumentData, DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'

const open = defineModel<boolean>('open', { required: true })
const { input } = defineProps<{
  input: Input<DialecticalArgumentation<AdfArgumentData>>
}>()

const emit = defineEmits<{
  highlight: [highlight?: Highlight]
}>()

const semanticGroups = KNOWN_SEMANTIC_GROUPS
const defaultSemantic = semanticGroups.flatMap((g) => g.semantics).find((s) => s.key === KEY_DEFAULT_SEMANTIC)
if (defaultSemantic === undefined) throw new Error('Default semantic does not exist.')
const selectedSemantic = shallowRef<Semantic>(defaultSemantic)

const evaluateContinuously = ref(false)
const enabled = computed(() => evaluateContinuously.value && open.value)

const { data, status, refetch, isLoading, isPending, isError } = useInterpretationEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  enabled,
)

const userCanTriggerFetch = computed(
  () => open.value && !evaluateContinuously.value && status.value !== 'success',
)

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

const formattedData = computed(() => {
  if (data.value === undefined) return undefined
  return {
    stateId: data.value.stateId,
    evaluationDurationInSeconds: data.value.evaluationDurationInSeconds,
    items: data.value.interpretations.map((interp) => ({
      key: interpretationKey(interp),
      interpretation: interp,
      formatted: formatInterpretation(interp),
    })),
  }
})

const selectedKey = ref<string | undefined>(undefined)

watchEffect(() => {
  if (selectedKey.value === undefined || formattedData.value === undefined) {
    emit('highlight', undefined)
    return
  }
  const item = formattedData.value.items.find((i) => i.key === selectedKey.value)
  if (item === undefined) {
    emit('highlight', undefined)
    return
  }
  const inNodes = new Set(item.interpretation.filter((a) => a.label === 'in').map((a) => a.id))
  emit('highlight', {
    stateId: formattedData.value.stateId,
    nodes: inNodes,
    color: NODE_GREEN,
    restColor: NODE_RED,
  })
})
</script>

<template>
  <FloatingWindow
    v-model:open="open"
    title="Interpretation evaluation"
    :initial-position="{ x: 128, y: 64 }"
    :intitalSize="{ width: 512, height: 400 }"
  >
    <div class="p-4">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
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
            <input type="checkbox" v-model="evaluateContinuously" class="checkbox checkbox-sm" />
            Evaluate continuously
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset" v-if="!isPending || isLoading">
        <legend class="fieldset-legend">Interpretations</legend>
        <div v-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Failed evaluating interpretations</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating interpretations...</span>
        </div>
        <template v-if="formattedData !== undefined">
          <div
            v-if="formattedData.items.length === 0"
            role="alert"
            class="alert alert-info alert-soft"
          >
            <span>No interpretations exist.</span>
          </div>
          <div v-else class="flex flex-row flex-wrap gap-1">
            <button
              v-for="item of formattedData.items"
              :key="item.key"
              type="button"
              class="btn btn-sm justify-start font-mono font-normal outline-none focus:outline-none"
              :class="{
                'btn-soft btn-neutral': selectedKey === item.key,
                'btn-ghost': selectedKey !== item.key,
              }"
              @click="selectedKey = item.key"
            >
              {{ '{' + item.formatted + '}' }}
            </button>
          </div>
          <p v-if="formattedData.evaluationDurationInSeconds !== 0" class="label mt-2">
            Evaluation took {{ formattedData.evaluationDurationInSeconds }} seconds.
          </p>
        </template>
      </fieldset>
    </div>
  </FloatingWindow>
</template>
