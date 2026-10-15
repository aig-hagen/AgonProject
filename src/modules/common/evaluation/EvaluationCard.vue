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
import { AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

import type { EvaluationWindowQuery } from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import { useEvaluationStatus } from '@/modules/common/evaluation/useEvaluationStatus'

const { t } = useI18n({ useScope: 'global' })

// The inner body of an evaluation window/sheet: parameters, status strip, and results.
// Extracted from BaseEvaluationWindow so it can render either inside a FloatingWindow /
// BottomSheet (desktop) or bare inside the compact evaluation host.
const {
  query,
  hosted = false,
  title = '',
} = defineProps<{
  query: EvaluationWindowQuery
  /** In the compact host, show a semantics·mode header with a params toggle. */
  hosted?: boolean
  title?: string
}>()

const emit = defineEmits<{ evaluate: [] }>()

const paramsOpen = defineModel<boolean>('paramsOpen', { default: true })

const { isPending, isLoading, refetch } = query

const { statusStrip, isInitialLoad, elapsedSeconds } = useEvaluationStatus(query, () =>
  emit('evaluate'),
)
</script>

<template>
  <div class="px-3 pb-3 pt-1 flex flex-col gap-2.5 text-xs">
    <!-- Compact host: a summary header so the semantics·mode stays visible while the
         parameter editor is collapsed, keeping results in view at the peek height. -->
    <button
      v-if="hosted"
      type="button"
      class="flex items-center gap-2 rounded-field bg-inset border border-base-300 px-2.5 py-2 text-left"
      :aria-expanded="paramsOpen"
      @click="paramsOpen = !paramsOpen"
    >
      <AdjustmentsHorizontalIcon class="size-4 shrink-0 text-base-content/65" />
      <span class="flex-1 min-w-0 truncate font-medium">{{ title }}</span>
      <span class="text-micro text-base-content/65">{{
        paramsOpen ? t('evaluation.status.hideParams') : t('evaluation.status.editParams')
      }}</span>
    </button>

    <div
      v-show="paramsOpen"
      class="rounded-field bg-inset border border-base-300 p-2.5 flex flex-col gap-2"
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
      <button class="btn btn-xs btn-ghost ml-auto" @click="() => refetch()">
        {{ t('evaluation.status.retry') }}
      </button>
    </div>

    <div v-if="isInitialLoad" aria-hidden="true" class="flex flex-wrap gap-2">
      <span class="skeleton h-6 w-24 rounded-full"></span>
      <span class="skeleton h-6 w-16 rounded-full"></span>
    </div>

    <slot v-if="!isPending || isLoading" name="results" />

    <p v-if="isLoading" class="text-base-content/65">
      {{ t('evaluation.status.evaluatingElapsed', { seconds: elapsedSeconds }) }}
    </p>
  </div>
</template>
