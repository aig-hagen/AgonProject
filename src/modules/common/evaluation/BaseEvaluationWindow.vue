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
import { computed, nextTick, onUnmounted, type Ref, ref, useTemplateRef, watch } from 'vue'

import type { ResultsHeaderPart } from '@/modules/common/evaluation/types'
import { TWEETY_TIMEOUT_IN_MS } from '@/modules/common/evaluation/tweety-project/fetch'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

export interface EvaluationWindowQuery {
  status: Readonly<Ref<string>>
  error: Readonly<Ref<Error | null | undefined>>
  isPending: Readonly<Ref<boolean>>
  isLoading: Readonly<Ref<boolean>>
  isError: Readonly<Ref<boolean>>
  refetch: () => void
}

const props = defineProps<{
  title: string
  instanceOffset?: number
  initialPositionBase?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  resultsHeader?: ResultsHeaderPart[]
  query: EvaluationWindowQuery
  storageKey?: string
}>()

const emit = defineEmits<{
  close: []
  focus: []
  evaluate: []
}>()

const evaluateContinuously = defineModel<boolean>('evaluateContinuously', { required: true })

const internalOpen = ref(true)
watch(internalOpen, (v) => { if (!v) emit('close') })

const isCompact = ref(false)
watch(isCompact, (v) => { if (v) evaluateContinuously.value = true })

const { status, error, isPending, isLoading, isError, refetch } = props.query

watch(isLoading, (loading, wasLoading) => {
  if (loading && !wasLoading) emit('evaluate')
})

const isTimeout = computed(() => error.value?.name === 'EvaluationTimeoutError')

const floatingWindow = useTemplateRef<InstanceType<typeof FloatingWindow>>('floatingWindow')

watch(isLoading, (loading) => {
  if (!loading && status.value === 'success') {
    nextTick(() => floatingWindow.value?.resizeToFitContent())
  }
})

const userCanTriggerFetch = computed(
  () => !evaluateContinuously.value && status.value !== 'success',
)

const TIMEOUT_S = Math.round(TWEETY_TIMEOUT_IN_MS / 1000)
const remainingSeconds = ref(TIMEOUT_S)
let countdownInterval: ReturnType<typeof setInterval> | null = null

watch(isLoading, (loading) => {
  if (loading) {
    remainingSeconds.value = TIMEOUT_S
    countdownInterval = setInterval(() => {
      remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)
    }, 1000)
  } else {
    if (countdownInterval !== null) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }
})

onUnmounted(() => {
  if (countdownInterval !== null) clearInterval(countdownInterval)
})

const offset = computed(() => props.instanceOffset ?? 0)
const basePos = computed(() => props.initialPositionBase ?? { x: 128, y: 64 })
const size = computed(() => props.initialSize ?? { width: 576, height: 448 })
</script>

<template>
  <FloatingWindow
    ref="floatingWindow"
    v-model:open="internalOpen"
    v-model:compact="isCompact"
    :title="title"
    :initial-position="{ x: basePos.x + offset * 24, y: basePos.y + offset * 24 }"
    :intitalSize="size"
    :instance-offset="offset"
    :storage-key="props.storageKey"
    compactable
    :minimizable="false"
    @focus="emit('focus')"
  >
    <template #default="{ compact }">
      <div class="p-4">
        <fieldset v-if="!compact" class="fieldset">
          <div class="flex gap-2 flex-wrap">
            <slot name="parameters" :compact="compact" />
          </div>
          <slot name="parameters-footer" :compact="compact" />
        </fieldset>

        <fieldset v-if="!compact" class="fieldset">
          <div class="flex gap-2 flex-wrap">
            <button
              class="btn btn-sm btn-soft mt-2"
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
          <legend v-if="!compact && resultsHeader" class="fieldset-legend">
            <span>
              <template v-for="(part, i) in resultsHeader" :key="i">
                <TermTooltip v-if="typeof part === 'object'" :id="part.tooltipId">{{ part.text }}</TermTooltip>
                <template v-else>{{ part }}</template>
              </template>
            </span>
          </legend>
          <div v-if="isTimeout" role="alert" class="alert alert-warning alert-soft">
            <span>Evaluation timed out</span>
          </div>
          <div v-else-if="isError" role="alert" class="alert alert-error alert-soft">
            <span>Evaluation failed</span>
          </div>
          <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
            <span>Evaluating... ({{ remainingSeconds }}s remaining)</span>
          </div>
          <slot name="results" :compact="compact" />
        </fieldset>
      </div>
    </template>
  </FloatingWindow>
</template>
