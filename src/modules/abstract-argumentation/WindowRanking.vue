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

import {
  KEY_DEFAULT_RANKING_SEMANTIC,
  KNOWN_RANKING_SEMANTICS,
  type RankingSemantic,
  useRankingEvaluationQuery,
} from '@/modules/abstract-argumentation/evaluation/tweetyProjectRanking'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'
import KatexInlineElement from '@/modules/common/KatexInlineElement.vue'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

const open = defineModel<boolean>('open', { required: true })
const { input } = defineProps<{
  input: Input<AbstractArgumentation<ArgumentData>>
}>()

const emit = defineEmits<{
  setWeights: [weights: Array<{ id: ArgumentId; weight: number }>]
}>()

const defaultSemantic = KNOWN_RANKING_SEMANTICS.find((s) => s.key === KEY_DEFAULT_RANKING_SEMANTIC)
if (defaultSemantic === undefined) {
  throw new Error('Default ranking semantic does not exist.')
}

const selectedSemantic = shallowRef<RankingSemantic>(defaultSemantic)

const { data, status, refetch, isLoading, isPending, isError } = useRankingEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  ref(false),
)

const userCanTriggerFetch = computed(() => open.value && status.value !== 'success')

function emitWeights(ranking: typeof data.value) {
  if (!open.value) return
  if (ranking === undefined) {
    emit('setWeights', [])
    return
  }
  emit('setWeights', ranking.ranking.map((entry) => ({ id: entry.id, weight: entry.score })))
}

watch(data, emitWeights)
watch(open, () => emitWeights(data.value))
</script>
<template>
  <FloatingWindow
    v-model:open="open"
    title="Ranking semantics"
    :initial-position="{ x: 192, y: 96 }"
    :intitalSize="{ width: 480, height: 320 }"
  >
    <div class="p-4">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-52">
            <span class="label">Semantics</span>
            <select v-model="selectedSemantic">
              <option v-for="s in KNOWN_RANKING_SEMANTICS" :key="s.key" :value="s">
                {{ s.displayName }}
              </option>
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
        </div>
      </fieldset>
      <fieldset class="fieldset" v-if="!isPending || isLoading">
        <legend class="fieldset-legend">Ranking</legend>
        <div v-if="isError" role="alert" class="alert alert-error alert-soft">
          <span>Failed evaluating ranking</span>
        </div>
        <div v-if="isLoading" role="alert" class="alert alert-info alert-soft">
          <span>Evaluating ranking...</span>
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
          <p class="label">{{ data.evaluationDurationInSeconds }}s</p>
        </template>
      </fieldset>
    </div>
  </FloatingWindow>
</template>
