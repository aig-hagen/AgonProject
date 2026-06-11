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

import type { Example } from '@/modules/common/examples'
import HelpLinks from '@/modules/common/help/HelpLinks.vue'

export interface ExampleGroup<DocumentT> {
  newNamePrefix: string
  displayNameSingular: string
  description?: string
  examples: Example<DocumentT>[]
  initialCotent: DocumentT
  generateHref?: string
}
const { exampleGroups } = defineProps<{
  exampleGroups: ExampleGroup<DocumentT>[]
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
  <div class="h-full w-full flex items-center justify-center">
    <div class="max-w-5xl w-full p-8">
      <h2 class="text-4xl font-bold mb-2">
        Argumentation Toolbox
        <div class="text-lg font-normal text-base-content/70">
          Create, Analyse and Visualise Different Approaches to Formal Argumentation
        </div>
      </h2>
      <HelpLinks />
      <div class="divider"></div>
      <div class="grid grid-cols-3 gap-4">
        <div
          class="card bg-base-200 shadow-sm"
          v-for="(exampleGroup, index) in exampleGroups"
          :key="index"
        >
          <div class="card-body">
            <h3 class="card-title">{{ exampleGroup.displayNameSingular }}</h3>
            <p v-if="exampleGroup.description" class="text-sm text-base-content/60">{{ exampleGroup.description }}</p>
            <button
              class="btn btn-sm btn-soft btn-neutral w-fit"
              @click="openContent(exampleGroup.initialCotent, exampleGroup.newNamePrefix)"
            >
              Create new
            </button>
            <template v-if="exampleGroup.examples.length !== 0">
              <h4 class="text-xs font-semibold text-base-content/50 uppercase tracking-wide mt-2">
                Open Example
              </h4>
              <ul class="menu menu-sm p-0 -mx-2">
                <li v-for="(example, index) in exampleGroup.examples" :key="index">
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
            <template v-if="exampleGroup.generateHref !== undefined">
              <h4 class="text-xs font-semibold text-base-content/50 uppercase tracking-wide mt-2">
                Generate
              </h4>
              <RouterLink
                :to="exampleGroup.generateHref"
                class="btn btn-sm btn-soft btn-neutral w-fit"
              >
                Generate random {{ exampleGroup.newNamePrefix }}
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
