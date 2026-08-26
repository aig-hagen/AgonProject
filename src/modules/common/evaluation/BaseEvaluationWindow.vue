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
import { computed, onUnmounted, type Ref, ref, watch } from 'vue'

import type { DocumentId } from '@/modules/common/documents/db'
import { TWEETY_TIMEOUT_IN_MS } from '@/modules/common/evaluation/tweety-project/fetch'
import WindowShell from '@/modules/common/window/WindowShell.vue'

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
  query: EvaluationWindowQuery
  documentId?: DocumentId
  stateKey?: string
  active?: boolean
}>()

const emit = defineEmits<{
  close: []
  focus: []
  evaluate: []
}>()

const internalOpen = ref(true)
watch(internalOpen, (v) => {
  if (!v) emit('close')
})

// Persisted by FloatingWindow alongside position/width; new cards start open so
// the semantics can be picked first.
const paramsOpen = ref(true)

const { error, isPending, isLoading, isError, refetch } = props.query

watch(isLoading, (loading, wasLoading) => {
  if (loading && !wasLoading) emit('evaluate')
})

// All failure modes share one status strip; only wording and tone differ.
const statusStrip = computed(() => {
  if (!isError.value) return undefined
  switch (error.value?.name) {
    case 'ServiceUnavailableError':
      return { kind: 'warning', message: 'Server temporarily unavailable — retrying may help' }
    case 'RateLimitError':
      return { kind: 'warning', message: 'Too many requests — please wait a moment' }
    case 'EvaluationTimeoutError':
      return { kind: 'warning', message: `Timed out after ${TIMEOUT_S}s` }
    default:
      return { kind: 'error', message: 'Evaluation failed' }
  }
})

// True only on the very first evaluation, before any result exists — the slot
// where skeleton chips render. Re-evaluations keep the previous results visible.
const isInitialLoad = computed(() => isLoading.value && isPending.value)

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
const size = computed(() => props.initialSize ?? { width: 400, height: 360 })
</script>

<template>
  <WindowShell
    v-model:open="internalOpen"
    v-model:params-open="paramsOpen"
    card
    :title="title"
    :loading="isLoading"
    :initial-position="{ x: basePos.x + offset * 24, y: basePos.y + offset * 24 }"
    :intitalSize="size"
    :instance-offset="offset"
    :document-id="props.documentId"
    :state-key="props.stateKey"
    :active="props.active"
    :minimizable="false"
    @focus="emit('focus')"
  >
    <div class="px-3 pb-3 pt-1 flex flex-col gap-2.5 text-xs">
      <div
        v-show="paramsOpen"
        class="rounded-field bg-base-200/60 border border-base-300 p-2.5 flex flex-col gap-2"
      >
        <div class="flex flex-wrap gap-3">
          <slot name="parameters" />
        </div>
        <slot name="parameters-footer" />
      </div>

      <div
        v-if="statusStrip"
        role="alert"
        class="alert alert-soft py-1.5"
        :class="statusStrip.kind === 'error' ? 'alert-error' : 'alert-warning'"
      >
        <span>{{ statusStrip.message }}</span>
        <button class="btn btn-xs btn-ghost ml-auto" @click="() => refetch()">Retry</button>
      </div>

      <div v-if="isInitialLoad" aria-hidden="true" class="flex flex-wrap gap-2">
        <span class="skeleton h-6 w-24 rounded-full"></span>
        <span class="skeleton h-6 w-16 rounded-full"></span>
      </div>

      <slot v-if="!isPending || isLoading" name="results" />

      <p v-if="isLoading" class="text-base-content/50">Evaluating… {{ remainingSeconds }}s</p>
    </div>
  </WindowShell>
</template>
