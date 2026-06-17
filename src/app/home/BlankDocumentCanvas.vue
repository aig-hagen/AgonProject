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
<script setup lang="ts" generic="DocumentT">
import { RouterLink } from 'vue-router'

import type { Publication } from '@/app/home/moduleConfig'
import type { Example } from '@/modules/common/examples'
import HelpLinks from '@/modules/common/help/HelpLinks.vue'
import PublicationsTooltip from '@/modules/common/tooltip/PublicationsTooltip.vue'

export interface ModuleCard<DocumentT> {
  newNamePrefix: string
  displayNameSingular: string
  description?: string
  examples: Example<DocumentT>[]
  initialCotent: DocumentT
  generateHref?: string
  underConstruction?: boolean
  publications?: Publication[]
}
const { moduleCards } = defineProps<{
  moduleCards: ModuleCard<DocumentT>[]
}>()

const emit = defineEmits<{
  open: [content: DocumentT, newNamePrefix: string]
}>()

function openExample(example: Example<DocumentT>, newNamePrefix: string) {
  const content = example.load()
  example.applyLayout?.(content)
  emit('open', content, newNamePrefix)
}

function openContent(content: DocumentT, newNamePrefix: string) {
  emit('open', content, newNamePrefix)
}


</script>
<template>
  <div class="h-full w-full overflow-y-auto">
    <div class="min-h-full flex items-center justify-center">
    <div class="max-w-5xl w-full p-4 sm:p-8">
      <h2 class="text-2xl sm:text-4xl font-bold mb-2">
        Argumentation Toolbox
        <div class="text-lg font-normal text-base-content/70">
          Create, Analyse and Visualise Different Approaches to Formal Argumentation
        </div>
      </h2>
      <HelpLinks />
      <div class="divider"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          class="card bg-base-200 shadow-sm"
          :class="{ 'opacity-50': moduleCard.underConstruction }"
          v-for="(moduleCard, index) in moduleCards"
          :key="index"
        >
          <div class="card-body flex flex-col">
            <div class="flex items-start justify-between gap-2">
              <h3 class="card-title">{{ moduleCard.displayNameSingular }}</h3>
              <PublicationsTooltip
                v-if="moduleCard.publications?.length"
                :publications="moduleCard.publications"
              />
            </div>
            <p v-if="moduleCard.description" class="text-sm text-base-content/60">{{ moduleCard.description }}</p>
            <template v-if="moduleCard.underConstruction">
              <div class="flex-1"></div>
              <p class="text-sm text-base-content/50 italic">Under Construction</p>
            </template>
            <template v-else>
              <div class="flex-1">
                <template v-if="moduleCard.examples.length !== 0">
                  <h4 class="text-xs font-semibold text-base-content/50 uppercase tracking-wide mt-2">
                    Open Example
                  </h4>
                  <ul class="menu menu-sm p-0 -mx-2 pl-2 grid grid-cols-2 gap-x-8">
                    <li v-for="(example, index) in moduleCard.examples" :key="index">
                      <span
                        v-if="example.description"
                        class="tooltip tooltip-right"
                        :data-tip="example.description"
                      >
                        <a @click="openExample(example, example.name)">{{ example.name }}</a>
                      </span>
                      <a v-else @click="openExample(example, example.name)">{{ example.name }}</a>
                    </li>
                  </ul>
                </template>
              </div>
              <h4 class="text-xs font-semibold text-base-content/50 uppercase tracking-wide mt-2">
                New
              </h4>
              <div class="flex flex-row gap-4 pl-2">
                <button
                  class="btn btn-sm btn-soft btn-neutral w-fit"
                  @click="openContent(moduleCard.initialCotent, moduleCard.newNamePrefix)"
                >
                  Create new
                </button>
                <RouterLink
                  v-if="moduleCard.generateHref !== undefined"
                  :to="moduleCard.generateHref"
                  class="btn btn-sm btn-soft btn-neutral w-fit"
                >
                  Generate random {{ moduleCard.newNamePrefix }}
                </RouterLink>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
