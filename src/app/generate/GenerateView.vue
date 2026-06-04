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
import { ref, shallowRef } from 'vue'
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

// Both props are passed through attr fallthrough from App (same pattern as HomeView).
// modules is declared to prevent Vue from warning about unrecognized attrs.
const { db } = defineProps<{
  db: IDBPDatabase<DocumentsDB>
  modules: ModuleConfig<Objectish>[]
}>()

const router = useRouter()
const { createDocument } = useDocumentMetadata(db, [abstractArgumentationModule])

// --- Parameters ---
const numArguments = ref(10)
const attackProbability = ref(0.3)
const allowSelfLoops = ref(false)
const seedEnabled = ref(false)
const seed = ref(42)

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

  const params: Record<string, unknown> = {
    numArguments: numArguments.value,
    attackProbability: attackProbability.value,
    allowSelfLoops: allowSelfLoops.value,
  }
  if (seedEnabled.value) {
    params.seed = seed.value
  }

  try {
    const response = await fetch('/graph-gen/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm: 'random-af', params }),
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
  await createDocument('AF', af)
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
        Randomly generate an abstract argumentation framework using the Erdős–Rényi model.
      </p>

      <div class="card bg-base-200 shadow-sm">
        <div class="card-body gap-5">
          <!-- Number of arguments -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium">Number of Arguments</span>
              <span class="text-sm font-mono">{{ numArguments }}</span>
            </div>
            <input
              type="range"
              class="range range-sm w-full"
              min="1"
              max="100"
              step="1"
              v-model.number="numArguments"
            />
            <div class="flex justify-between text-xs text-base-content/40 mt-0.5">
              <span>1</span><span>100</span>
            </div>
          </div>

          <!-- Attack probability -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium">Attack Probability</span>
              <span class="text-sm font-mono">{{ attackProbability.toFixed(2) }}</span>
            </div>
            <input
              type="range"
              class="range range-sm w-full"
              min="0"
              max="1"
              step="0.01"
              v-model.number="attackProbability"
            />
            <div class="flex justify-between text-xs text-base-content/40 mt-0.5">
              <span>0.00</span><span>1.00</span>
            </div>
          </div>

          <!-- Allow self-attacks -->
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" class="toggle toggle-sm" v-model="allowSelfLoops" />
            <span class="text-sm">Allow self-attacks</span>
          </label>

          <!-- Seed -->
          <div class="flex flex-col gap-2">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" class="toggle toggle-sm" v-model="seedEnabled" />
              <span class="text-sm">Fix random seed</span>
            </label>
            <input
              v-if="seedEnabled"
              type="number"
              class="input input-sm w-32"
              v-model.number="seed"
              placeholder="Seed"
            />
          </div>

          <button
            class="btn btn-primary w-full mt-1"
            :disabled="isLoading"
            @click="generate"
          >
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
