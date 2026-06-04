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
import { ArrowLeftIcon, BoltIcon } from '@heroicons/vue/24/outline'
import type { IDBPDatabase } from 'idb'
import type { Objectish } from 'immer'
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import type { ModuleConfig } from '@/app/home/moduleConfig'
import { availableExports } from '@/modules/abstract-argumentation/export'
import { layout } from '@/modules/abstract-argumentation/layout'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import { abstractArgumentationModule } from '@/modules/abstract-argumentation/moduleConfig'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { DocumentsDB } from '@/modules/common/documents/db'
import { useDocumentMetadata } from '@/modules/common/documents/useDocuments'
import { saveToFile } from '@/modules/common/export/saveFile'

interface ParamSchema {
  name: string
  type: 'int' | 'float' | 'bool' | 'string'
  description: string
  required: boolean
  default: unknown
  min: number | null
  max: number | null
  step: number | null
}

interface AlgorithmInfo {
  id: string
  description: string
  params: ParamSchema[]
  available: boolean
}

// Both props are passed through attr fallthrough from App (same pattern as HomeView).
// modules is declared to prevent Vue from warning about unrecognized attrs.
const { db } = defineProps<{
  db: IDBPDatabase<DocumentsDB>
  modules: ModuleConfig<Objectish>[]
}>()

const router = useRouter()
const { documents, createDocument } = useDocumentMetadata(db, [abstractArgumentationModule])

function getNextName(prefix: string): string {
  const allNames = new Set(documents.value.map((d) => d.name))
  if (!allNames.has(prefix)) return prefix
  for (let i = 1; ; i++) {
    const name = prefix + i.toString(10)
    if (!allNames.has(name)) return name
  }
}

// --- Algorithm list ---
const algorithms = ref<AlgorithmInfo[]>([])
const loadError = ref<string | null>(null)
const selectedAlgorithmId = ref<string>('')

const selectedAlgorithm = computed(
  () => algorithms.value.find((a) => a.id === selectedAlgorithmId.value) ?? null,
)

onMounted(async () => {
  try {
    const res = await fetch('/graph-gen/algorithms')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as AlgorithmInfo[]
    algorithms.value = data.filter((a) => a.available)
    const first = algorithms.value[0]
    if (first !== undefined) {
      selectedAlgorithmId.value = first.id
    }
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Failed to load algorithms'
  }
})

// --- Parameters ---
const paramValues = reactive<Record<string, unknown>>({})
const seedEnabled = ref(false)
const seedValue = ref(42)

const nonSeedParams = computed(
  () => selectedAlgorithm.value?.params.filter((p) => p.name !== 'seed') ?? [],
)
const hasSeed = computed(
  () => selectedAlgorithm.value?.params.some((p) => p.name === 'seed') ?? false,
)

watch(selectedAlgorithm, (algo) => {
  for (const key of Object.keys(paramValues)) delete paramValues[key]
  if (!algo) return
  for (const p of algo.params) {
    if (p.name === 'seed') continue
    paramValues[p.name] =
      p.default !== null && p.default !== undefined
        ? p.default
        : p.type === 'bool'
          ? false
          : p.type === 'string'
            ? ''
            : 0
  }
  seedEnabled.value = false
})

// --- State ---
const isLoading = ref(false)
const error = ref<string | null>(null)
const generated = shallowRef<AbstractArgumentation<ArgumentData> | null>(null)
const stats = ref<{ nArgs: number; nAttacks: number } | null>(null)

async function generate() {
  isLoading.value = true
  error.value = null
  generated.value = null
  stats.value = null

  const params: Record<string, unknown> = { ...paramValues }
  if (seedEnabled.value) params.seed = seedValue.value

  try {
    const response = await fetch('/graph-gen/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm: selectedAlgorithmId.value, params }),
    })
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}))
      throw new Error((detail as { detail?: string }).detail ?? `HTTP ${response.status}`)
    }

    const data = (await response.json()) as {
      nr_of_arguments: number
      attacks: [number, number][]
    }

    const af = new AbstractArgumentation<ArgumentData>()
    for (let i = 1; i <= data.nr_of_arguments; i++) {
      af.addArgument(i - 1, { name: String(i), x: 0, y: 0 })
    }
    for (const [src, tgt] of data.attacks) {
      af.addAttack(src - 1, tgt - 1)
    }
    layout(af)

    generated.value = af
    stats.value = { nArgs: data.nr_of_arguments, nAttacks: data.attacks.length }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Generation failed'
  } finally {
    isLoading.value = false
  }
}

async function openInEditor() {
  const af = generated.value
  if (af === null) return
  await createDocument(getNextName('AF'), af)
  await router.push('/')
}

const iccmaExport = availableExports.find((e) => e.name === 'ICCMA')!
const tgfExport = availableExports.find((e) => e.name === 'TGF')!

function downloadICCMA() {
  const af = generated.value
  if (af === null) return
  saveToFile(iccmaExport.export(af).text, 'AF', 'af')
}

function downloadTGF() {
  const af = generated.value
  if (af === null) return
  saveToFile(tgfExport.export(af).text, 'AF', 'tgf')
}

function formatAlgorithmName(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatParamLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

function formatParamValue(p: ParamSchema): string {
  const val = paramValues[p.name]
  if (typeof val !== 'number' || isNaN(val)) return String(val ?? '')
  if (p.type === 'float') {
    const decimals = p.step != null ? Math.max(0, -Math.floor(Math.log10(p.step))) : 2
    return val.toFixed(decimals)
  }
  return String(val)
}
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

      <h1 class="text-2xl font-bold mb-1">Generate Argumentation Framework</h1>
      <p class="text-base-content/60 mb-6 text-sm">
        Randomly generate an abstract argumentation framework.
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

          <!-- Dynamic parameters -->
          <template v-for="p in nonSeedParams" :key="p.name">
            <!-- Bool: toggle -->
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

            <!-- String: text input -->
            <div v-else-if="p.type === 'string'">
              <div class="flex justify-between mb-1">
                <span
                  class="text-sm font-medium tooltip tooltip-right cursor-help"
                  :data-tip="p.description"
                >{{ formatParamLabel(p.name) }}</span>
              </div>
              <input
                type="text"
                class="input input-sm w-full font-mono"
                :placeholder="p.description"
                :value="String(paramValues[p.name] ?? '')"
                @input="paramValues[p.name] = ($event.target as HTMLInputElement).value"
              />
            </div>

            <!-- Int / float with known range: slider -->
            <div v-else-if="p.min !== null && p.max !== null">
              <div class="flex justify-between mb-1">
                <span
                  class="text-sm font-medium tooltip tooltip-right cursor-help"
                  :data-tip="p.description"
                >{{ formatParamLabel(p.name) }}</span>
                <span class="text-sm font-mono text-base-content/60">{{ formatParamValue(p) }}</span>
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
                <span>{{ p.min }}</span><span>{{ p.max }}</span>
              </div>
            </div>

            <!-- Int / float without range: plain number input -->
            <div v-else>
              <div class="flex justify-between mb-1">
                <span
                  class="text-sm font-medium tooltip tooltip-right cursor-help"
                  :data-tip="p.description"
                >{{ formatParamLabel(p.name) }}</span>
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
          <p class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{
              stats.nArgs === 1 ? '' : 's'
            }}
            with <strong>{{ stats.nAttacks }}</strong> attack{{
              stats.nAttacks === 1 ? '' : 's'
            }}.
          </p>
          <div class="flex flex-wrap gap-2">
            <button class="btn btn-sm btn-primary" @click="openInEditor">Open in Editor</button>
            <button class="btn btn-sm btn-soft btn-neutral" @click="downloadICCMA">
              Download ICCMA
            </button>
            <button class="btn btn-sm btn-soft btn-neutral" @click="downloadTGF">
              Download TGF
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
