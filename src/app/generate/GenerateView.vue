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
import type { IDBPDatabase } from 'idb'
import type { Objectish } from 'immer'
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import type { ModuleConfig } from '@/app/home/moduleConfig'
import { availableExports as abstractExports } from '@/modules/abstract-argumentation/export'
import { layout } from '@/modules/abstract-argumentation/layout'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import { abstractArgumentationModule } from '@/modules/abstract-argumentation/moduleConfig'
import { availableExports as bipolarExports } from '@/modules/bipolar-argumentation/export'
import { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import { bipoloarArgumentationModule } from '@/modules/bipolar-argumentation/moduleConfig'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { DocumentsDB } from '@/modules/common/documents/db'
import { useDocumentMetadata } from '@/modules/common/documents/useDocuments'
import { saveToFile } from '@/modules/common/export/saveFile'
import { Layout } from '@/modules/common/main-menu/layouting'
import type { FormulaNode } from '@/modules/dialectical-argumentation/condition/formula'
import { type AdfArgumentData, DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'
import { dialecticalArgumentationModule } from '@/modules/dialectical-argumentation/moduleConfig'
import { availableExports as incompleteExports } from '@/modules/incomplete-argumentation/export'
import { type IafArgumentData, IncompleteArgumentation } from '@/modules/incomplete-argumentation/model'
import { incompleteArgumentationModule } from '@/modules/incomplete-argumentation/moduleConfig'
import { type PafArgumentData, ProbabilisticArgumentation } from '@/modules/probabilistic-argumentation/model'
import { probabilisticArgumentationModule } from '@/modules/probabilistic-argumentation/moduleConfig'

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

interface FrameworkTypeInfo {
  id: string
  description: string
  params: ParamSchema[]
}

type GeneratedFramework =
  | AbstractArgumentation<ArgumentData>
  | BipoloarArgumentation<ArgumentData>
  | IncompleteArgumentation<IafArgumentData>
  | ProbabilisticArgumentation<PafArgumentData>
  | DialecticalArgumentation<AdfArgumentData>

// Both props are passed through attr fallthrough from App (same pattern as HomeView).
// modules is declared to prevent Vue from warning about unrecognized attrs.
const { db, modules } = defineProps<{
  db: IDBPDatabase<DocumentsDB>
  modules: ModuleConfig<Objectish>[]
}>()

const route = useRoute()
const router = useRouter()

const { documents, createDocument, deleteDocument } = useDocumentMetadata(db, [
  abstractArgumentationModule,
  bipoloarArgumentationModule,
  incompleteArgumentationModule,
  probabilisticArgumentationModule,
  dialecticalArgumentationModule,
] as unknown as ModuleConfig<Objectish>[])

function getNextName(prefix: string): string {
  const allNames = new Set(documents.value.map((d) => d.name))
  if (!allNames.has(prefix)) return prefix
  for (let i = 1; ; i++) {
    const name = prefix + i.toString(10)
    if (!allNames.has(name)) return name
  }
}

const GENERATE_TIMEOUT_MS = 5_000

// --- Framework type from URL ---
const frameworkTypeId = computed<string>(() => {
  const t = route.query.type
  if (t === 'bipolar' || t === 'incomplete' || t === 'probabilistic' || t === 'adf') return t
  return 'abstract'
})

// Resolve the matching module config via generateHref so names/abbreviations
// come from a single source of truth (ModuleConfig.displayNameSingular / newNamePrefix).
const activeModule = computed(
  () => modules.find((m) => m.generateHref === `/generate?type=${frameworkTypeId.value}`) ?? null,
)

const pageTitle = computed(
  () => (activeModule.value?.displayNameSingular ?? 'Argumentation') + ' Framework',
)

// --- Algorithm list & framework type params ---
const algorithms = ref<AlgorithmInfo[]>([])
const frameworkTypes = ref<FrameworkTypeInfo[]>([])
const loadError = ref<string | null>(null)
const selectedAlgorithmId = ref<string>('')

const selectedAlgorithm = computed(
  () => algorithms.value.find((a) => a.id === selectedAlgorithmId.value) ?? null,
)

const selectedFrameworkType = computed(
  () => frameworkTypes.value.find((ft) => ft.id === frameworkTypeId.value) ?? null,
)

onMounted(async () => {
  try {
    const [algoRes, ftRes] = await Promise.all([
      fetch('/graph-gen/algorithms', { signal: AbortSignal.timeout(5_000) }),
      fetch('/graph-gen/framework-types', { signal: AbortSignal.timeout(5_000) }),
    ])
    if (!algoRes.ok) throw new Error(`HTTP ${algoRes.status}`)
    if (!ftRes.ok) throw new Error(`HTTP ${ftRes.status}`)

    const algoData = (await algoRes.json()) as AlgorithmInfo[]
    algorithms.value = algoData.filter((a) => a.available)
    const first = algorithms.value[0]
    if (first !== undefined) selectedAlgorithmId.value = first.id

    frameworkTypes.value = (await ftRes.json()) as FrameworkTypeInfo[]
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Failed to load algorithms'
  }
})

// --- Algorithm parameters ---
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

// --- Type-specific parameters ---
const typeParamValues = reactive<Record<string, unknown>>({})

watch(selectedFrameworkType, (ft) => {
  for (const key of Object.keys(typeParamValues)) delete typeParamValues[key]
  if (!ft) return
  for (const p of ft.params) {
    typeParamValues[p.name] =
      p.default !== null && p.default !== undefined
        ? p.default
        : p.type === 'bool'
          ? false
          : p.type === 'string'
            ? ''
            : 0
  }
})

// --- Generation state ---
const isLoading = ref(false)
const error = ref<string | null>(null)
const generated = shallowRef<GeneratedFramework | null>(null)
const stats = ref<{
  nArgs: number
  nAttacks: number
  nSupports?: number
  nUncertainArgs?: number
  nUncertainAttacks?: number
} | null>(null)

async function generate() {
  isLoading.value = true
  error.value = null
  generated.value = null
  stats.value = null

  const params: Record<string, unknown> = { ...paramValues, ...typeParamValues }
  if (seedEnabled.value) params.seed = seedValue.value

  try {
    const response = await fetch('/graph-gen/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        algorithm: selectedAlgorithmId.value,
        params,
        framework_type: frameworkTypeId.value,
        timeout: GENERATE_TIMEOUT_MS / 1000,
      }),
      signal: AbortSignal.timeout(GENERATE_TIMEOUT_MS),
    })
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}))
      throw new Error((detail as { detail?: string }).detail ?? `HTTP ${response.status}`)
    }

    const data = (await response.json()) as {
      framework_type: string
      nr_of_arguments: number
      attacks: [number, number][]
      supports: [number, number][]
      uncertain_arguments: number[]
      uncertain_attacks: [number, number][]
      argument_probabilities: number[]
      attack_probabilities: number[]
      conditions: FormulaNode[]
    }

    const n = data.nr_of_arguments
    const radius = Math.max(200, n * 25)

    function circularPos(i: number) {
      const angle = (2 * Math.PI * i) / n
      return { x: radius + radius * Math.cos(angle), y: radius + radius * Math.sin(angle) }
    }

    if (data.framework_type === 'bipolar') {
      const baf = new BipoloarArgumentation<ArgumentData>()
      for (let i = 0; i < n; i++) baf.addArgument(i, { name: String(i + 1), ...circularPos(i) })
      for (const [src, tgt] of data.attacks) baf.addAttack(src - 1, tgt - 1)
      for (const [src, tgt] of data.supports) baf.addSupport(src - 1, tgt - 1)
      generated.value = baf
      stats.value = { nArgs: n, nAttacks: data.attacks.length, nSupports: data.supports.length }
    } else if (data.framework_type === 'incomplete') {
      const iaf = new IncompleteArgumentation<IafArgumentData>()
      const uncertainArgSet = new Set(data.uncertain_arguments)
      for (let i = 0; i < n; i++) {
        iaf.addArgument(i, {
          name: String(i + 1),
          ...circularPos(i),
          uncertain: uncertainArgSet.has(i + 1),
        })
      }
      for (const [src, tgt] of data.attacks) iaf.addDefiniteAttack(src - 1, tgt - 1)
      for (const [src, tgt] of data.uncertain_attacks) iaf.addUncertainAttack(src - 1, tgt - 1)
      generated.value = iaf
      stats.value = {
        nArgs: n,
        nAttacks: data.attacks.length,
        nUncertainArgs: data.uncertain_arguments.length,
        nUncertainAttacks: data.uncertain_attacks.length,
      }
    } else if (data.framework_type === 'probabilistic') {
      const paf = new ProbabilisticArgumentation<PafArgumentData>()
      for (let i = 0; i < n; i++) {
        paf.addArgument(i, {
          name: String(i + 1),
          ...circularPos(i),
          probability: data.argument_probabilities[i] ?? 1,
        })
      }
      data.attacks.forEach(([src, tgt], j) => {
        paf.addAttack(src - 1, tgt - 1, data.attack_probabilities[j] ?? 1)
      })
      generated.value = paf
      stats.value = { nArgs: n, nAttacks: data.attacks.length }
    } else if (data.framework_type === 'adf') {
      const adf = new DialecticalArgumentation<AdfArgumentData>()
      for (let i = 0; i < n; i++) {
        adf.addArgument(i, { name: String(i + 1), ...circularPos(i), condition: { type: 'tautology' } })
      }
      for (let i = 0; i < n; i++) {
        adf.setCondition(i, data.conditions[i] ?? { type: 'tautology' })
      }
      generated.value = adf
      stats.value = { nArgs: n, nAttacks: data.attacks.length }
    } else {
      const af = new AbstractArgumentation<ArgumentData>()
      for (let i = 0; i < n; i++) af.addArgument(i, { name: String(i + 1), ...circularPos(i) })
      for (const [src, tgt] of data.attacks) af.addAttack(src - 1, tgt - 1)
      generated.value = af
      stats.value = { nArgs: n, nAttacks: data.attacks.length }
    }
  } catch (e) {
    error.value =
      e instanceof DOMException && e.name === 'TimeoutError'
        ? `Generation timed out after ${GENERATE_TIMEOUT_MS / 1000} s`
        : e instanceof Error
          ? e.message
          : 'Generation failed'
  } finally {
    isLoading.value = false
  }
}

const MAX_EDGES_FOR_EDITOR = 100
const totalEdges = computed(() => {
  if (stats.value === null) return 0
  return (
    stats.value.nAttacks +
    (stats.value.nSupports ?? 0) +
    (stats.value.nUncertainAttacks ?? 0)
  )
})
const tooManyEdgesForEditor = computed(() => totalEdges.value > MAX_EDGES_FOR_EDITOR)

async function openInEditor() {
  const fw = generated.value
  if (fw === null) return
  const prefix = activeModule.value?.newNamePrefix ?? 'AF'
  if (fw instanceof AbstractArgumentation) {
    layout(fw, Layout.ForceDirected)
  }
  await createDocument(getNextName(prefix), fw as Objectish)
  const sourceId = Number(route.query.source)
  if (Number.isInteger(sourceId) && sourceId > 0) {
    const sourceDoc = documents.value.find((d) => d.id === sourceId)
    if (sourceDoc?.name === '') {
      await deleteDocument(sourceId)
    }
  }
  await router.push('/')
}

const abstractTgfExport = abstractExports.find((e) => e.name === 'Trivial Graph Format (TGF)')!
const abstractIccmaExport = abstractExports.find((e) => e.name === 'ICCMA')!
const bipolarTgfExport = bipolarExports.find((e) => e.name === 'Trivial Graph Format (TGF)')!
const incompleteTgfExport = incompleteExports.find((e) => e.name === 'Trivial Graph Format (TGF)')!

function downloadTGF() {
  const fw = generated.value
  if (fw === null) return
  const prefix = activeModule.value?.newNamePrefix ?? 'AF'
  if (fw instanceof BipoloarArgumentation) {
    saveToFile(bipolarTgfExport.export(fw).text, prefix, 'tgf')
  } else if (fw instanceof IncompleteArgumentation) {
    saveToFile(incompleteTgfExport.export(fw).text, prefix, 'tgf')
  } else if (fw instanceof AbstractArgumentation) {
    saveToFile(abstractTgfExport.export(fw).text, prefix, 'tgf')
  }
}

function downloadICCMA() {
  const fw = generated.value
  if (!(fw instanceof AbstractArgumentation)) return
  saveToFile(abstractIccmaExport.export(fw).text, activeModule.value?.newNamePrefix ?? 'AF', 'af')
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

function formatParamValue(p: ParamSchema, values: Record<string, unknown>): string {
  const val = values[p.name]
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

      <h1 class="text-2xl font-bold mb-1">Generate {{ pageTitle }}</h1>
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

            <div v-else-if="p.min !== null && p.max !== null">
              <div class="flex justify-between mb-1">
                <span
                  class="text-sm font-medium tooltip tooltip-right cursor-help"
                  :data-tip="p.description"
                >{{ formatParamLabel(p.name) }}</span>
                <span class="text-sm font-mono text-base-content/60">{{ formatParamValue(p, paramValues) }}</span>
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

          <!-- Type-specific parameters -->
          <template v-if="selectedFrameworkType && selectedFrameworkType.params.length > 0">
            <div class="divider text-xs text-base-content/40 my-0">Type Options</div>
            <template v-for="p in selectedFrameworkType.params" :key="p.name">
              <div v-if="p.min !== null && p.max !== null">
                <div class="flex justify-between mb-1">
                  <span
                    class="text-sm font-medium tooltip tooltip-right cursor-help"
                    :data-tip="p.description"
                  >{{ formatParamLabel(p.name) }}</span>
                  <span class="text-sm font-mono text-base-content/60">{{ formatParamValue(p, typeParamValues) }}</span>
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
                  <span>{{ p.min }}</span><span>{{ p.max }}</span>
                </div>
              </div>

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
            Generated <strong>{{ stats.nArgs }}</strong> argument{{ stats.nArgs === 1 ? '' : 's' }}
            with <strong>{{ stats.nAttacks }}</strong> attack{{ stats.nAttacks === 1 ? '' : 's' }}.
          </p>
          <p v-else-if="frameworkTypeId === 'bipolar'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{ stats.nArgs === 1 ? '' : 's' }}
            with <strong>{{ stats.nAttacks }}</strong> attack{{ stats.nAttacks === 1 ? '' : 's' }}
            and <strong>{{ stats.nSupports }}</strong> support{{ stats.nSupports === 1 ? '' : 's' }}.
          </p>
          <p v-else-if="frameworkTypeId === 'incomplete'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{ stats.nArgs === 1 ? '' : 's' }}
            (<strong>{{ stats.nUncertainArgs }}</strong> uncertain)
            with <strong>{{ stats.nAttacks }}</strong> definite
            and <strong>{{ stats.nUncertainAttacks }}</strong> uncertain attack{{ stats.nUncertainAttacks === 1 ? '' : 's' }}.
          </p>
          <p v-else-if="frameworkTypeId === 'probabilistic'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{ stats.nArgs === 1 ? '' : 's' }}
            with <strong>{{ stats.nAttacks }}</strong> attack{{ stats.nAttacks === 1 ? '' : 's' }}.
          </p>
          <p v-else-if="frameworkTypeId === 'adf'" class="text-sm text-base-content/70">
            Generated <strong>{{ stats.nArgs }}</strong> argument{{ stats.nArgs === 1 ? '' : 's' }}
            with <strong>{{ stats.nAttacks }}</strong> link{{ stats.nAttacks === 1 ? '' : 's' }}.
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              class="tooltip tooltip-top"
              :data-tip="tooManyEdgesForEditor ? `Too many edges to open in editor (maximum is ${MAX_EDGES_FOR_EDITOR})` : undefined"
            >
              <button
                class="btn btn-sm btn-primary"
                :disabled="tooManyEdgesForEditor"
                @click="openInEditor"
              >Open in Editor</button>
            </span>
            <button
              v-if="frameworkTypeId === 'abstract'"
              class="btn btn-sm btn-soft"
              @click="downloadICCMA"
            >
              Download ICCMA
            </button>
            <button
              v-if="frameworkTypeId !== 'adf'"
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
