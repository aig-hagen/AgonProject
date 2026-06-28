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
import BaseEvaluationWindow from '@/modules/common/evaluation/BaseEvaluationWindow.vue'
import type { Input } from '@/modules/common/evaluation/types'
import TermDefinitionBlock from '@/modules/common/tooltip/TermDefinitionBlock.vue'
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'

provide(TOOLTIP_REGISTRY_KEY, { ...abstractArgumentationGlossary, ...abstractArgumentationRankingGlossary })

const { input, instanceState, instanceOffset = 0, storageKey } = defineProps<{
  input: Input<AbstractArgumentation<ArgumentData>>
  instanceState: RankingWindowInstanceState
  instanceOffset?: number
  storageKey?: string
}>()

const emit = defineEmits<{
  'update:instanceState': [state: RankingWindowInstanceState]
  setWeights: [weights: Array<{ id: ArgumentId; weight: number }>]
  close: []
}>()

function resolveSemanticFromKey(key: string): RankingSemantic {
  return KNOWN_RANKING_SEMANTICS.find((s) => s.key === key) ?? KNOWN_RANKING_SEMANTICS[0]!
}

const selectedSemantic = shallowRef<RankingSemantic>(resolveSemanticFromKey(instanceState.semanticKey))
const evaluateContinuously = ref(instanceState.evaluateContinuously)

watch([selectedSemantic, evaluateContinuously], () => {
  emit('update:instanceState', {
    id: instanceState.id,
    semanticKey: selectedSemantic.value.key,
    evaluateContinuously: evaluateContinuously.value,
  })
})

const query = useRankingEvaluationQuery(
  toRef(() => input),
  computed(() => selectedSemantic.value.key),
  evaluateContinuously,
)

const { data } = query

const rankGroups = computed(() => {
  if (data.value === undefined || data.value.rankingType !== 'lattice') return undefined
  const byScore = new Map<number, typeof data.value.ranking>()
  for (const entry of data.value.ranking) {
    const group = byScore.get(entry.score)
    if (group) group.push(entry)
    else byScore.set(entry.score, [entry])
  }
  return [...byScore.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, entries]) => ({
      entries: [...entries].sort((a, b) => a.name.localeCompare(b.name)),
    }))
})

const numericalDisplayData = computed(() => {
  if (data.value === undefined || data.value.rankingType !== 'numerical') return undefined
  const scores = data.value.ranking.map((e) => e.score)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  const range = maxScore - minScore
  return data.value.ranking.map((entry) => {
    const t = range === 0 ? 0.5 : (entry.score - minScore) / range
    const hue = Math.round(30 + t * 90)
    return {
      ...entry,
      bgColor: `hsl(${hue}, 55%, 90%)`,
      borderColor: `hsl(${hue}, 55%, 62%)`,
    }
  })
})

function formatScore(score: number): string {
  if (Number.isInteger(score)) return String(score)
  return String(parseFloat(score.toPrecision(4)))
}

function computeWeights() {
  const d = data.value
  return d === undefined ? [] : d.ranking.map((e) => ({
    id: e.id,
    weight: d.rankingType === 'lattice' ? Math.round(e.score) : e.score,
  }))
}

watch(data, () => emit('setWeights', computeWeights()), { immediate: true })

function onWindowFocus() { emit('setWeights', computeWeights()) }
</script>

<template>
  <BaseEvaluationWindow
    v-model:evaluate-continuously="evaluateContinuously"
    :title="`Ranking: ${selectedSemantic.displayName}`"
    :instance-offset="instanceOffset"
    :initial-position-base="{ x: 192, y: 96 }"
    :initial-size="{ width: 480, height: 400 }"
    :query="query"
    :results-header="[`${selectedSemantic.displayName} ranking`]"
    :storage-key="storageKey"
    @close="emit('close')"
    @focus="onWindowFocus"
  >
    <template #parameters>
      <label class="select select-sm w-fit">
        <span class="label">Semantics</span>
        <select v-model="selectedSemantic">
          <option v-for="s in KNOWN_RANKING_SEMANTICS" :key="s.key" :value="s">
            {{ s.displayName }}
          </option>
        </select>
      </label>
    </template>
    <template #parameters-footer>
      <TermDefinitionBlock :id="selectedSemantic.key" />
    </template>
    <template #results>
      <template v-if="data !== undefined">
        <template v-if="data.rankingType === 'lattice'">
          <div class="flex flex-wrap items-center gap-x-1 gap-y-1">
            <template v-for="(group, index) in rankGroups" :key="index">
              <span v-if="index > 0" class="text-sm select-none">&#x227B;</span>
              <span class="text-base">{{ group.entries.map((e) => e.name).join(', ') }}</span>
            </template>
          </div>
        </template>
        <template v-else>
          <div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr))">
            <div
              v-for="entry in numericalDisplayData"
              :key="entry.id"
              class="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 border text-sm"
              :style="{ backgroundColor: entry.bgColor, borderColor: entry.borderColor }"
            >
              <span class="font-medium">{{ entry.name }}</span>
              <span class="font-mono text-xs tabular-nums opacity-60">{{ formatScore(entry.score) }}</span>
            </div>
          </div>
        </template>
        <p class="label">
          {{ data.rankingType === 'lattice' ? 'Node labels show the ranking level.' : 'Node labels show ranking scores.' }}
          · {{ data.evaluationDurationInMs }}ms
        </p>
      </template>
    </template>
  </BaseEvaluationWindow>
</template>
