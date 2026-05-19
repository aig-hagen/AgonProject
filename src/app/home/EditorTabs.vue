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
<script setup lang="ts" generic="DocumentT extends Objectish">
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { IDBPDatabase } from 'idb'
import type { Objectish } from 'immer'

import EditorTab from '@/app/home/EditorTab.vue'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import type { DocumentsDB } from '@/modules/common/documents/db'

defineProps<{
  data: readonly { readonly name: string; readonly id: number }[]
  selected?: number
  db: IDBPDatabase<DocumentsDB>
  modules: ModuleConfig<DocumentT>[]
  showRenameHint: boolean
}>()

const emit = defineEmits<{
  rename: [id: number, name: string]
  select: [id: number]
  delete: [id: number]
  create: []
  save: [id: number]
}>()
</script>

<template>
  <div role="tablist" class="tabs bg-base-200 tabs-lift flex-nowrap overflow-x-auto">
    <EditorTab
      ref="editorTab"
      v-for="datum in data"
      :key="datum.id"
      :value="datum.name"
      :active="datum.id === selected"
      @delete="emit('delete', datum.id)"
      @rename="emit('rename', datum.id, $event)"
      @select="emit('select', datum.id)"
      :document-id="datum.id"
      :db="db"
      :modules="modules"
      @save="emit('save', datum.id)"
      :showRenameHint="showRenameHint && datum.id === selected"
    />
    <div role="tab" class="tab sticky right-0 bg-base-200">
      <button class="btn btn-square btn-xs btn-ghost" @click="emit('create')" title="Create">
        <PlusIcon class="size-4"></PlusIcon>
      </button>
    </div>
  </div>
</template>
