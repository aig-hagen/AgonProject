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
import { ArrowLeftIcon, BoltIcon } from '@heroicons/vue/24/outline'
import { RouterLink } from 'vue-router'

import type { GenerateController } from '@/app/generate/useGenerate'

const { controller } = defineProps<{ controller: GenerateController }>()

const {
  MAX_EDGES_FOR_EDITOR,
  frameworkTypeId,
  shortName,
  algorithms,
  loadError,
  selectedAlgorithmId,
  selectedAlgorithm,
  selectedFrameworkType,
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
  formatParamValue,
} = controller
</script>

<template>
  <div class="min-h-screen bg-base-100 p-8">
    <div class="max-w-lg mx-auto">
      <div class="mb-6">
        <RouterLink to="/" class="btn btn-sm btn-ghost gap-1">
          <ArrowLeftIcon class="size-4" />
          Back to Editor
        </RouterLink>
      </div>

      <h1 class="text-2xl font-bold mb-1">Generate random {{ shortName }}</h1>
      <p v-if="selectedFrameworkType" class="text-base-content/60 mb-6 text-sm">
        {{ selectedFrameworkType.description }}
      </p>

      <!-- Load error -->
      <div v-if="loadError !== null" role="alert" class="alert alert-error mb-4">
        <span>Could not load algorithms: {{ loadError }}</span>
      </div>

      <!-- Loading skeleton -->
      <div v-else-if="algorithms.length === 0" class="card bg-base-200 shadow-sm">
        <div class="card-body gap-4">
          <div class="skeleton h-5 w-24"></div>
          <div class="skeleton h-9 w-full"></div>
          <div class="skeleton h-5 w-32"></div>
          <div class="skeleton h-9 w-full"></div>
          <div class="skeleton h-5 w-28"></div>
          <div class="skeleton h-9 w-full"></div>
          <div class="skeleton h-10 w-full mt-1"></div>
        </div>
      </div>

      <div v-else class="card bg-base-200 shadow-sm">
        <div class="card-body gap-5">
          <!-- Algorithm selector -->
          <div>
            <label class="text-sm font-medium block mb-1">Algorithm</label>
            <select class="select select-sm w-full" v-model="selectedAlgorithmId">
              <option v-for="algo in algorithms" :key="algo.id" :value="algo.id">
                {{ formatAlgorithmName(algo.id) }}
              </option>
            </select>
            <p v-if="selectedAlgorithm" class="text-xs text-base-content/50 mt-1">
              {{ selectedAlgorithm.description }}
            </p>
          </div>

          <!-- Dynamic algorithm parameters -->
          <template v-for="p in nonSeedParams" :key="p.name">
            <label v-if="p.type === 'bool'" class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                class="toggle toggle-sm"
                :checked="Boolean(paramValues[p.name])"
                @change="paramValues[p.name] = ($event.target as HTMLInputElement).checked"
              />
              <span class="text-sm tooltip tooltip-right cursor-help" :data-tip="p.description">
                {{ p.description }}
              </span>
            </label>

            <div v-else-if="p.type === 'string'">
              <div class="flex justify-between mb-1">
                <span
                  class="text-sm font-medium tooltip tooltip-right cursor-help"
                  :data-tip="p.description"
                  >{{ formatParamLabel(p.name) }}</span
                >
              </div>
              <input
                type="text"
                class="input input-sm w-full font-mono"
                :placeholder="p.description"
                :value="String(paramValues[p.name] ?? '')"
                @input="paramValues[p.name] = ($event.target as HTMLInputElement).value"
              />
            </div>

            <div v-else-if="p.min !== null && p.max !== null">
              <div class="flex justify-between mb-1">
                <span
                  class="text-sm font-medium tooltip tooltip-right cursor-help"
                  :data-tip="p.description"
                  >{{ formatParamLabel(p.name) }}</span
                >
                <span class="text-sm font-mono text-base-content/60">{{
                  formatParamValue(p, paramValues)
                }}</span>
              </div>
              <input
                type="range"
                class="range range-sm w-full"
                :min="p.min"
                :max="p.max"
                :step="p.step ?? (p.type === 'int' ? 1 : 0.01)"
                :value="paramValues[p.name] as number"
                @input="
                  paramValues[p.name] =
                    p.type === 'int'
                      ? parseInt(($event.target as HTMLInputElement).value)
                      : parseFloat(($event.target as HTMLInputElement).value)
                "
              />
              <div class="flex justify-between text-xs text-base-content/40 mt-0.5">
                <span>{{ p.min }}</span
                ><span>{{ p.max }}</span>
              </div>
            </div>

            <div v-else>
              <div class="flex justify-between mb-1">
                <span
                  class="text-sm font-medium tooltip tooltip-right cursor-help"
                  :data-tip="p.description"
                  >{{ formatParamLabel(p.name) }}</span
                >
              </div>
              <input
                type="number"
                class="input input-sm w-full"
                :step="p.step ?? (p.type === 'int' ? '1' : 'any')"
                :value="paramValues[p.name] as number"
                @input="
                  paramValues[p.name] =
                    p.type === 'int'
                      ? parseInt(($event.target as HTMLInputElement).value)
                      : parseFloat(($event.target as HTMLInputElement).value)
                "
              />
              <p class="text-xs text-base-content/50 mt-0.5">{{ p.description }}</p>
            </div>
          </template>

          <!-- Type-specific parameters -->
          <template v-if="selectedFrameworkType && selectedFrameworkType.params.length > 0">
            <div class="divider text-xs text-base-content/40 my-0">Type Options</div>
            <template v-for="p in selectedFrameworkType.params" :key="p.name">
              <div v-if="p.min !== null && p.max !== null">
                <div class="flex justify-between mb-1">
                  <span
                    class="text-sm font-medium tooltip tooltip-right cursor-help"
                    :data-tip="p.description"
                    >{{ formatParamLabel(p.name) }}</span
                  >
                  <span class="text-sm font-mono text-base-content/60">{{
                    formatParamValue(p, typeParamValues)
                  }}</span>
                </div>
                <input
                  type="range"
                  class="range range-sm w-full"
                  :min="p.min"
                  :max="p.max"
                  :step="p.step ?? (p.type === 'int' ? 1 : 0.01)"
                  :value="typeParamValues[p.name] as number"
                  @input="
                    typeParamValues[p.name] =
                      p.type === 'int'
                        ? parseInt(($event.target as HTMLInputElement).value)
                        : parseFloat(($event.target as HTMLInputElement).value)
                  "
                />
                <div class="flex justify-between text-xs text-base-content/40 mt-0.5">
                  <span>{{ p.min }}</span
                  ><span>{{ p.max }}</span>
                </div>
              </div>

              <div v-else>
                <div class="flex justify-between mb-1">
                  <span
                    class="text-sm font-medium tooltip tooltip-right cursor-help"
                    :data-tip="p.description"
                    >{{ formatParamLabel(p.name) }}</span
                  >
                </div>
                <input
                  type="number"
                  class="input input-sm w-full"
                  :step="p.step ?? (p.type === 'int' ? '1' : 'any')"
                  :value="typeParamValues[p.name] as number"
                  @input="
                    typeParamValues[p.name] =
                      p.type === 'int'
                        ? parseInt(($event.target as HTMLInputElement).value)
                        : parseFloat(($event.target as HTMLInputElement).value)
                  "
                />
                <p class="text-xs text-base-content/50 mt-0.5">{{ p.description }}</p>
              </div>
            </template>
          </template>

          <!-- Seed -->
          <div v-if="hasSeed" class="flex flex-col gap-2">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" class="toggle toggle-sm" v-model="seedEnabled" />
              <span class="text-sm">Fix random seed</span>
            </label>
            <input
              v-if="seedEnabled"
              type="number"
              class="input input-sm w-32"
              step="1"
              v-model.number="seedValue"
              placeholder="Seed"
            />
          </div>

          <button class="btn btn-primary w-full mt-1" :disabled="isLoading" @click="generate">
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            <BoltIcon v-else class="size-5" />
            {{ isLoading ? 'Generating…' : 'Generate' }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error !== null" role="alert" class="alert alert-error alert-soft mt-4">
        <span>{{ error }}</span>
      </div>

      <!-- Result -->
      <div v-if="stats !== null" class="card bg-base-200 shadow-sm mt-4">
        <div class="card-body gap-3">
          <p v-if="frameworkTypeId === 'abstract'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{
              stats.nArgs === 1 ? '' : 's'
            }}
            with <strong>{{ stats.nAttacks }}</strong> attack{{ stats.nAttacks === 1 ? '' : 's' }}.
          </p>
          <p v-else-if="frameworkTypeId === 'bipolar'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{
              stats.nArgs === 1 ? '' : 's'
            }}
            with <strong>{{ stats.nAttacks }}</strong> attack{{
              stats.nAttacks === 1 ? '' : 's'
            }}
            and <strong>{{ stats.nSupports }}</strong> support{{
              stats.nSupports === 1 ? '' : 's'
            }}.
          </p>
          <p v-else-if="frameworkTypeId === 'incomplete'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{
              stats.nArgs === 1 ? '' : 's'
            }}
            (<strong>{{ stats.nUncertainArgs }}</strong> uncertain) with
            <strong>{{ stats.nAttacks }}</strong> definite and
            <strong>{{ stats.nUncertainAttacks }}</strong> uncertain attack{{
              stats.nUncertainAttacks === 1 ? '' : 's'
            }}.
          </p>
          <p v-else-if="frameworkTypeId === 'probabilistic'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{
              stats.nArgs === 1 ? '' : 's'
            }}
            with <strong>{{ stats.nAttacks }}</strong> attack{{ stats.nAttacks === 1 ? '' : 's' }}.
          </p>
          <p v-else-if="frameworkTypeId === 'adf'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{
              stats.nArgs === 1 ? '' : 's'
            }}
            with <strong>{{ stats.nAttacks }}</strong> link{{ stats.nAttacks === 1 ? '' : 's' }}.
          </p>
          <p v-else-if="frameworkTypeId === 'setaf'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{
              stats.nArgs === 1 ? '' : 's'
            }}
            with <strong>{{ stats.nAttacks }}</strong> collective attack{{
              stats.nAttacks === 1 ? '' : 's'
            }}.
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              class="tooltip tooltip-top"
              :data-tip="
                tooManyEdgesForEditor
                  ? `Too many edges to open in editor (maximum is ${MAX_EDGES_FOR_EDITOR})`
                  : undefined
              "
            >
              <button
                class="btn btn-sm btn-primary"
                :disabled="tooManyEdgesForEditor"
                @click="openInEditor"
              >
                Open in Editor
              </button>
            </span>
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
    </div>
  </div>
</template>
