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
import { useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'

import type { Example } from '@/modules/common/examples'
import HelpLinks from '@/modules/common/help/HelpLinks.vue'
import FloatingHintBottom from '@/modules/common/hints/FloatingHintBottom.vue'
import MainMenu from '@/modules/common/main-menu/MainMenu.vue'

export interface ExampleGroup<DocumentT> {
  newNamePrefix: string
  displayNameSingular: string
  examples: Example<DocumentT>[]
  initialCotent: DocumentT
  generateHref?: string
}
const { exampleGroups, showLoadHint } = defineProps<{
  exampleGroups: ExampleGroup<DocumentT>[]
  showLoadHint: boolean
}>()

const emit = defineEmits<{
  open: [content: DocumentT, newNamePrefix: string]
  new: []
  load: []
  generate: []
}>()

function openExample(example: Example<DocumentT>, newNamePrefix: string) {
  emit('open', example.load(), newNamePrefix)
}

function openContent(content: DocumentT, newNamePrefix: string) {
  emit('open', content, newNamePrefix)
}

const mainMenuRef = useTemplateRef('mainMenu')
</script>
<template>
  <div class="h-full w-full flex items-center justify-center">
    <div class="max-w-5xl w-full p-8">
      <h2 class="text-4xl font-bold mb-2">
        Argumentation Toolbox
        <div class="text-lg font-normal text-base-content/70">
          Create and Inspect Argumentation Frameworks
        </div>
      </h2>
      <HelpLinks />
      <div class="divider"></div>
      <div class="flex flex-row flex-wrap gap-4">
        <div
          class="card bg-base-200 shadow-sm flex-1 min-w-48"
          v-for="(exampleGroup, index) in exampleGroups"
          :key="index"
        >
          <div class="card-body">
            <h3 class="card-title">{{ exampleGroup.displayNameSingular }}</h3>
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
                  <a @click="openExample(example, example.name)">{{ example.name }}</a>
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
                Generate random AF
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute top-4 bottom-4 left-4 flex flex-col justify-start pointer-events-none">
      <div ref="mainMenu">
        <MainMenu @new="emit('new')" @load="emit('load')" @generate="emit('generate')" />
      </div>
    </div>
    <FloatingHintBottom
      v-if="showLoadHint"
      :reference="mainMenuRef"
      :offset-y="64"
      placement="bottom-start"
      >Load saved argumentations
    </FloatingHintBottom>
  </div>
</template>
