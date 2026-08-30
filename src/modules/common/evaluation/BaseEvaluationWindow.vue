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
import { computed, inject, type Ref, ref, watch } from 'vue'

import type { DocumentId } from '@/modules/common/documents/db'
import EvaluationCard from '@/modules/common/evaluation/EvaluationCard.vue'
import { TUTORIAL_COLLAPSE_KEY } from '@/modules/common/graph-editor/graphEditor'
import MobileEvaluationBody from '@/modules/common/evaluation/MobileEvaluationBody.vue'
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
  /** Render the card body bare (no window chrome) for the compact evaluation host. */
  hosted?: boolean
}>()

const emit = defineEmits<{
  close: []
  focus: []
  evaluate: []
}>()

const reportCollapse = inject(TUTORIAL_COLLAPSE_KEY, null)

const internalOpen = ref(true)
watch(internalOpen, (v) => {
  if (!v) emit('close')
})

// Persisted by FloatingWindow alongside position/width; new cards start open so
// the semantics can be picked first. In the compact host the sheet is short, so
// params start collapsed to a summary header and results stay visible.
const paramsOpen = ref(!props.hosted)
watch(paramsOpen, (open, wasOpen) => {
  if (wasOpen && !open) reportCollapse?.()
})

const offset = computed(() => props.instanceOffset ?? 0)
const basePos = computed(() => props.initialPositionBase ?? { x: 128, y: 64 })
const size = computed(() => props.initialSize ?? { width: 400, height: 360 })
</script>

<template>
  <MobileEvaluationBody v-if="hosted" :query="query" @evaluate="emit('evaluate')">
    <template #parameters><slot name="parameters" /></template>
    <template #parameters-footer><slot name="parameters-footer" /></template>
    <template #results><slot name="results" /></template>
  </MobileEvaluationBody>

  <WindowShell
    v-else
    v-model:open="internalOpen"
    v-model:params-open="paramsOpen"
    card
    :title="title"
    :loading="query.isLoading.value"
    :initial-position="{ x: basePos.x + offset * 24, y: basePos.y + offset * 24 }"
    :intitalSize="size"
    :instance-offset="offset"
    :document-id="props.documentId"
    :state-key="props.stateKey"
    :active="props.active"
    :minimizable="false"
    tutorial-header-key="evalHeader"
    @focus="emit('focus')"
  >
    <EvaluationCard v-model:params-open="paramsOpen" :query="query" @evaluate="emit('evaluate')">
      <template #parameters><slot name="parameters" /></template>
      <template #parameters-footer><slot name="parameters-footer" /></template>
      <template #results><slot name="results" /></template>
    </EvaluationCard>
  </WindowShell>
</template>
