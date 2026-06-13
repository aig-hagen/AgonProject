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
import { InformationCircleIcon } from '@heroicons/vue/24/outline'
import { computed, provide, ref, shallowRef, toRef, watch } from 'vue'

import type { RankingWindowInstanceState } from '@/modules/abstract-argumentation/evaluation/rankingWindowState'
import {
  KNOWN_RANKING_SEMANTICS,
  type RankingSemantic,
  useRankingEvaluationQuery,
} from '@/modules/abstract-argumentation/evaluation/tweetyProjectRanking'
import { abstractArgumentationGlossary, abstractArgumentationRankingGlossary } from '@/modules/abstract-argumentation/glossary'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'
import TermTooltip from '@/modules/common/tooltip/TermTooltip.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

provide(TOOLTIP_REGISTRY_KEY, { ...abstractArgumentationGlossary, ...abstractArgumentationRankingGlossary })

const { input, instanceState, instanceOffset = 0 } = defineProps<{
  input: Input<AbstractArgumentation<ArgumentData>>
  instanceState: RankingWindowInstanceState
  instanceOffset?: number
}>()

const emit = defineEmits<{
  'update:instanceState': [state: RankingWindowInstanceState]
  setWeights: [weights: Array<{ id: ArgumentId; weight: number }>]
  close: []
}>()

const internalOpen = ref(true)
watch(internalOpen, (v) => { if (!v) emit('close') })

function resolveSemanticFromKey(key: string): RankingSemantic {
  return KNOWN_RANKING_SEMANTICS.find((s) => s.key === key) ?? KNOWN_RANKING_SEMANTICS[0]!
}

const selectedSemantic = shallowRef<RankingSemantic>(resolveSemanticFromKey(instanceState.semanticKey))
const evaluateContinuously = ref(instanceState.evaluateContinuously)
const isCompact = ref(false)
watch(isCompact, (v) => { if (v) evaluateContinuously.value = true })

watch([selectedSemantic, evaluateContinuously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    evaluateContinuously: evaluateContinuously.value,
  })
})

const enabled = computed(() => evaluateContinuously.value)
const { data, status, refetch, isLoading, isPending, isError } = useRankingEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  enabled,
)

const userCanTriggerFetch = computed(
  () => !evaluateContinuously.value && status.value !== 'success',
)

function emitWeights(ranking: typeof data.value) {
  if (ranking === undefined) {
    emit('setWeights', [])
    return
  }
  emit('setWeights', ranking.ranking.map((entry) => ({ id: entry.id, weight: entry.score })))
}

watch(data, emitWeights)
</script>
<template>
  <FloatingWindow
    v-model:open="internalOpen"
    v-model:compact="isCompact"
    :title="`Ranking: ${selectedSemantic.displayName}`"
    :initial-position="{ x: 192 + instanceOffset * 24, y: 96 + instanceOffset * 24 }"
    :intitalSize="{ width: 480, height: 320 }"
    compactable
  >
    <template #default="{ compact }">
    <div class="p-4">
      <fieldset v-if="!compact" class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <div class="flex items-center gap-1">
            <label class="select select-sm w-fit">
              <span class="label">Semantics</span>
              <select v-model="selectedSemantic">
                <option v-for="s in KNOWN_RANKING_SEMANTICS" :key="s.key" :value="s">
                  {{ s.displayName }}
                </option>
              </select>
            </label>
            <TermTooltip :id="selectedSemantic.key">
              <InformationCircleIcon class="size-4 text-base-content/40 hover:text-base-content/70 cursor-help" />
            </TermTooltip>
          </div>
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
        <legend v-if="!compact" class="fieldset-legend">Ranking</legend>
        <div v-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Evaluation failed</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating...</span>
        </div>
        <template v-if="data !== undefined">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="entry in data.ranking"
              :key="entry.id"
              class="btn btn-sm btn-ghost pointer-events-none"
            >
              {{ entry.name }}: {{ entry.score }}
            </span>
          </div>
          <p class="label">{{ data.evaluationDurationInMs }}ms</p>
        </template>
      </fieldset>
    </div>
    </template>
  </FloatingWindow>
</template>
