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

import type { ArgumentId } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'
import type { PafWindowInstanceState } from '@/modules/probabilistic-argumentation/evaluation/extensionWindowState'
import {
  KNOWN_SEMANTIC_GROUPS,
  type PafSemantic,
  usePafEvaluationQuery,
} from '@/modules/probabilistic-argumentation/evaluation/tweetyProject'
import type { PafArgumentData, ProbabilisticArgumentation } from '@/modules/probabilistic-argumentation/model'

const { input, instanceState, instanceOffset = 0 } = defineProps<{
  input: Input<ProbabilisticArgumentation<PafArgumentData>>
  instanceState: PafWindowInstanceState
  instanceOffset?: number
}>()

const emit = defineEmits<{
  'update:instanceState': [state: PafWindowInstanceState]
  setWeights: [weights: Array<{ id: ArgumentId; weight: number }>]
  close: []
}>()

const internalOpen = ref(true)
watch(internalOpen, (v) => { if (!v) emit('close') })

const allSemantics = KNOWN_SEMANTIC_GROUPS.flatMap((g) => g.semantics)

function resolveSemanticFromKey(key: string): PafSemantic {
  return allSemantics.find((s) => s.key === key) ?? allSemantics[0]!
}

const selectedSemantic = shallowRef<PafSemantic>(resolveSemanticFromKey(instanceState.semanticKey))
const selectedMode = ref(instanceState.mode)
const selectedSolver = ref(instanceState.solver)
const evaluateContinuously = ref(instanceState.evaluateContinuously)

watch([selectedSemantic, selectedMode, selectedSolver, evaluateContinuously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    mode: selectedMode.value,
    solver: selectedSolver.value,
    evaluateContinuously: evaluateContinuously.value,
  })
})

const enabled = computed(() => evaluateContinuously.value)
const { data, status, refetch, isLoading, isPending, isError } = usePafEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  computed(() => selectedMode.value),
  computed(() => selectedSolver.value),
  enabled,
)

const userCanTriggerFetch = computed(() => !evaluateContinuously.value && status.value !== 'success')

watch(data, (d) => {
  if (d === undefined) {
    emit('setWeights', [])
    return
  }
  emit('setWeights', d.entries.map((e) => ({ id: e.id, weight: e.probability })))
})

const windowTitle = computed(() => {
  const modeLabel = selectedMode.value === 'skeptical' ? 'Skeptical' : 'Credulous'
  return `Probabilistic: ${selectedSemantic.value.displayName} · ${modeLabel}`
})
</script>

<template>
  <FloatingWindow
    v-model:open="internalOpen"
    :title="windowTitle"
    :initial-position="{ x: 192 + instanceOffset * 24, y: 96 + instanceOffset * 24 }"
    :intitalSize="{ width: 480, height: 320 }"
    compactable
  >
    <template #default="{ compact }">
    <div class="p-4">
      <fieldset v-if="!compact" class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-52">
            <span class="label">Semantics</span>
            <select v-model="selectedSemantic">
              <optgroup v-for="group in KNOWN_SEMANTIC_GROUPS" :key="group.key" :label="group.displayName">
                <option v-for="s in group.semantics" :key="s.key" :value="s">
                  {{ s.displayName }}
                </option>
              </optgroup>
            </select>
          </label>
          <label class="select select-sm w-36">
            <span class="label">Mode</span>
            <select v-model="selectedMode">
              <option value="credulous">Credulous</option>
              <option value="skeptical">Skeptical</option>
            </select>
          </label>
          <label class="select select-sm w-40">
            <span class="label">Solver</span>
            <select v-model="selectedSolver">
              <option value="simple">Exact</option>
              <option value="montecarlo">Approximate</option>
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
            <input type="checkbox" v-model="evaluateContinuously" class="checkbox checkbox-sm" />
            Evaluate continuously
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset" v-if="!isPending || isLoading">
        <legend v-if="!compact" class="fieldset-legend">Acceptance Probabilities</legend>
        <div v-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Failed evaluating</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating...</span>
        </div>
        <template v-if="data !== undefined">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="entry in data.entries"
              :key="entry.id"
              class="btn btn-sm btn-ghost pointer-events-none"
            >
              {{ entry.name }}: {{ entry.probability.toFixed(4) }}
            </span>
          </div>
          <p class="label">{{ data.evaluationDurationInMs }}ms</p>
        </template>
      </fieldset>
    </div>
    </template>
  </FloatingWindow>
</template>
