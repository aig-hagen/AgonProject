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
import { BoltIcon, ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

import type { GenerateController } from '@/app/generate/useGenerate'

const { controller } = defineProps<{ controller: GenerateController }>()

const {
  MAX_EDGES_FOR_EDITOR,
  frameworkTypeId,
  algorithms,
  loadError,
  selectedAlgorithmId,
  selectedAlgorithm,
  selectedFrameworkType,
  shortName,
  paramValues,
  seedEnabled,
  seedValue,
  nonSeedParams,
  hasSeed,
  typeParamValues,
  isLoading,
  error,
  stats,
  tooManyEdgesForEditor,
  generate,
  openInEditor,
  downloadTGF,
  downloadICCMA,
  formatAlgorithmName,
  formatParamLabel,
} = controller

const router = useRouter()

function numberFromEvent(e: Event, type: 'int' | 'float' | 'bool' | 'string'): number {
  const raw = (e.target as HTMLInputElement).value
  return type === 'int' ? parseInt(raw) : parseFloat(raw)
}
</script>

<template>
  <div class="flex flex-col h-dvh w-screen bg-base-100 overflow-hidden">
    <!-- Top bar -->
    <header
      class="flex-none flex items-center gap-1 px-2 pr-3 border-b border-base-300 bg-base-200"
      style="padding-top: calc(env(safe-area-inset-top) + 0.5rem)"
    >
      <button
        class="btn btn-square btn-ghost btn-sm"
        aria-label="Back to editor"
        @click="router.push('/')"
      >
        <ChevronLeftIcon class="size-6 opacity-70" />
      </button>
      <span class="flex-1 text-lg font-bold py-2.5">Generate random {{ shortName }}</span>
    </header>

    <!-- Scrollable form -->
    <div class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
      <p v-if="selectedFrameworkType" class="text-sm text-base-content/60 leading-snug -mt-1">
        {{ selectedFrameworkType.description }}
      </p>

      <div v-if="loadError !== null" role="alert" class="alert alert-error">
        <span>Could not load algorithms: {{ loadError }}</span>
      </div>

      <template v-else-if="algorithms.length === 0">
        <div class="skeleton h-5 w-24"></div>
        <div class="skeleton h-11 w-full"></div>
        <div class="skeleton h-5 w-32"></div>
        <div class="skeleton h-11 w-full"></div>
      </template>

      <template v-else>
        <!-- Algorithm selector -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[13px] font-semibold">Algorithm</label>
          <select
            v-model="selectedAlgorithmId"
            class="select w-full h-12 rounded-xl bg-base-200 border-base-300"
          >
            <option v-for="algo in algorithms" :key="algo.id" :value="algo.id">
              {{ formatAlgorithmName(algo.id) }}
            </option>
          </select>
          <p v-if="selectedAlgorithm" class="text-xs text-base-content/50">
            {{ selectedAlgorithm.description }}
          </p>
        </div>

        <!-- Dynamic algorithm parameters -->
        <template v-for="p in nonSeedParams" :key="p.name">
          <label v-if="p.type === 'bool'" class="flex items-center justify-between gap-3 py-1">
            <span class="text-[13px] font-semibold">{{ p.description }}</span>
            <input
              type="checkbox"
              class="toggle"
              :checked="Boolean(paramValues[p.name])"
              @change="paramValues[p.name] = ($event.target as HTMLInputElement).checked"
            />
          </label>

          <div v-else-if="p.type === 'string'" class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold">{{ formatParamLabel(p.name) }}</label>
            <input
              type="text"
              class="input w-full h-12 rounded-xl bg-base-200 border-base-300 font-mono"
              :placeholder="p.description"
              :value="String(paramValues[p.name] ?? '')"
              @input="paramValues[p.name] = ($event.target as HTMLInputElement).value"
            />
          </div>

          <div v-else-if="p.min !== null && p.max !== null" class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-3">
              <label class="text-[13px] font-semibold">{{ formatParamLabel(p.name) }}</label>
              <input
                type="number"
                class="input input-sm w-20 text-right rounded-lg bg-base-100 border-base-300 font-mono"
                :min="p.min"
                :max="p.max"
                :step="p.step ?? (p.type === 'int' ? 1 : 0.01)"
                :value="paramValues[p.name] as number"
                @input="paramValues[p.name] = numberFromEvent($event, p.type)"
              />
            </div>
            <input
              type="range"
              class="range range-primary w-full"
              :min="p.min"
              :max="p.max"
              :step="p.step ?? (p.type === 'int' ? 1 : 0.01)"
              :value="paramValues[p.name] as number"
              @input="paramValues[p.name] = numberFromEvent($event, p.type)"
            />
          </div>

          <div v-else class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between gap-3">
              <label class="text-[13px] font-semibold">{{ formatParamLabel(p.name) }}</label>
              <input
                type="number"
                class="input input-sm w-24 text-right rounded-lg bg-base-100 border-base-300 font-mono"
                :step="p.step ?? (p.type === 'int' ? '1' : 'any')"
                :value="paramValues[p.name] as number"
                @input="paramValues[p.name] = numberFromEvent($event, p.type)"
              />
            </div>
            <p class="text-xs text-base-content/50">{{ p.description }}</p>
          </div>
        </template>

        <!-- Type-specific parameters -->
        <template v-if="selectedFrameworkType && selectedFrameworkType.params.length > 0">
          <div class="text-xs font-bold text-base-content/40 tracking-wide">TYPE OPTIONS</div>
          <template v-for="p in selectedFrameworkType.params" :key="p.name">
            <div v-if="p.min !== null && p.max !== null" class="flex flex-col gap-2">
              <div class="flex items-center justify-between gap-3">
                <label class="text-[13px] font-semibold">{{ formatParamLabel(p.name) }}</label>
                <input
                  type="number"
                  class="input input-sm w-20 text-right rounded-lg bg-base-100 border-base-300 font-mono"
                  :min="p.min"
                  :max="p.max"
                  :step="p.step ?? (p.type === 'int' ? 1 : 0.01)"
                  :value="typeParamValues[p.name] as number"
                  @input="typeParamValues[p.name] = numberFromEvent($event, p.type)"
                />
              </div>
              <input
                type="range"
                class="range range-primary w-full"
                :min="p.min"
                :max="p.max"
                :step="p.step ?? (p.type === 'int' ? 1 : 0.01)"
                :value="typeParamValues[p.name] as number"
                @input="typeParamValues[p.name] = numberFromEvent($event, p.type)"
              />
            </div>

            <div v-else class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between gap-3">
                <label class="text-[13px] font-semibold">{{ formatParamLabel(p.name) }}</label>
                <input
                  type="number"
                  class="input input-sm w-24 text-right rounded-lg bg-base-100 border-base-300 font-mono"
                  :step="p.step ?? (p.type === 'int' ? '1' : 'any')"
                  :value="typeParamValues[p.name] as number"
                  @input="typeParamValues[p.name] = numberFromEvent($event, p.type)"
                />
              </div>
              <p class="text-xs text-base-content/50">{{ p.description }}</p>
            </div>
          </template>
        </template>

        <!-- Seed -->
        <div v-if="hasSeed" class="flex items-center justify-between gap-3 py-1">
          <span class="text-[13px] font-semibold">Fixed seed</span>
          <span class="flex items-center gap-3">
            <input
              v-if="seedEnabled"
              type="number"
              class="input input-sm w-24 text-right rounded-lg bg-base-100 border-base-300 font-mono"
              step="1"
              v-model.number="seedValue"
            />
            <input type="checkbox" class="toggle" v-model="seedEnabled" />
          </span>
        </div>
      </template>

      <!-- Error -->
      <div v-if="error !== null" role="alert" class="alert alert-error alert-soft">
        <span>{{ error }}</span>
      </div>

      <!-- Result -->
      <div v-if="stats !== null" class="rounded-2xl border border-primary/25 bg-primary/5 p-4">
        <div class="text-xs font-semibold text-primary/80 tracking-wide mb-2">LAST GENERATED</div>
        <p v-if="frameworkTypeId === 'bipolar'" class="text-sm text-base-content/70">
          <strong>{{ stats.nArgs }}</strong> arguments,
          <strong>{{ stats.nAttacks }}</strong> attacks,
          <strong>{{ stats.nSupports }}</strong> supports.
        </p>
        <p v-else-if="frameworkTypeId === 'incomplete'" class="text-sm text-base-content/70">
          <strong>{{ stats.nArgs }}</strong> arguments ({{ stats.nUncertainArgs }} uncertain),
          <strong>{{ stats.nAttacks }}</strong> definite + {{ stats.nUncertainAttacks }} uncertain
          attacks.
        </p>
        <p v-else-if="frameworkTypeId === 'adf'" class="text-sm text-base-content/70">
          <strong>{{ stats.nArgs }}</strong> arguments, <strong>{{ stats.nAttacks }}</strong>
          links.
        </p>
        <p v-else-if="frameworkTypeId === 'setaf'" class="text-sm text-base-content/70">
          <strong>{{ stats.nArgs }}</strong> arguments, <strong>{{ stats.nAttacks }}</strong>
          collective attacks.
        </p>
        <p v-else class="text-sm text-base-content/70">
          <strong>{{ stats.nArgs }}</strong> arguments, <strong>{{ stats.nAttacks }}</strong>
          attacks.
        </p>
        <p v-if="tooManyEdgesForEditor" class="text-xs text-error mt-2">
          Too many edges to open in editor (maximum is {{ MAX_EDGES_FOR_EDITOR }}).
        </p>
        <div class="flex flex-wrap gap-2 mt-3">
          <button
            class="btn btn-sm btn-primary"
            :disabled="tooManyEdgesForEditor"
            @click="openInEditor"
          >
            Open in editor
          </button>
          <button
            v-if="frameworkTypeId === 'abstract'"
            class="btn btn-sm btn-soft"
            @click="downloadICCMA"
          >
            Download ICCMA
          </button>
          <button
            v-if="frameworkTypeId !== 'adf' && frameworkTypeId !== 'setaf'"
            class="btn btn-sm btn-soft"
            @click="downloadTGF"
          >
            Download TGF
          </button>
        </div>
      </div>
    </div>

    <!-- Sticky Generate -->
    <div
      class="flex-none px-4 pt-2.5 border-t border-base-200"
      style="padding-bottom: max(env(safe-area-inset-bottom), 1.25rem)"
    >
      <button
        class="btn btn-primary w-full h-13 rounded-2xl text-base"
        :disabled="isLoading || algorithms.length === 0"
        @click="generate"
      >
        <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
        <BoltIcon v-else class="size-5" />
        {{ isLoading ? 'Generating…' : 'Generate' }}
      </button>
    </div>
  </div>
</template>
