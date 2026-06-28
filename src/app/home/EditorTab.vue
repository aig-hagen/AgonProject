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
<script setup lang="ts" generic="DocumentT extends Objectish">
import { ArrowDownTrayIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useDebounceFn } from '@vueuse/core'
import type { IDBPDatabase } from 'idb'
import type { Objectish } from 'immer'
import { nextTick, useTemplateRef } from 'vue'

import type { ModuleConfig } from '@/app/home/moduleConfig'
import type { DocumentsDB } from '@/modules/common/documents/db'
import { loadDocumentState } from '@/modules/common/documents/useDocuments'

const PLACEHOLDER = 'new'

const { active, documentId, value, db, modules } = defineProps<{
  active: boolean
  value: string
  documentId: number
  db: IDBPDatabase<DocumentsDB>
  modules: ModuleConfig<DocumentT>[]
}>()

const emit = defineEmits<{
  rename: [name: string]
  delete: []
  select: []
  save: []
}>()

const debouncedRename = useDebounceFn((name) => {
  emit('rename', name)
}, 300)

function getInputSizerValue(value: string) {
  if (value !== '') {
    return value
  }
  return PLACEHOLDER
}

function handleInput(e: InputEvent) {
  const target = e.target as HTMLInputElement
  inputSizerRef.value!.dataset.value = getInputSizerValue(target.value)
  debouncedRename(target.value)
}

async function doRequestClose() {
  const [state] = await loadDocumentState(db, modules, documentId)
  if (state === undefined) {
    emit('delete')
  }
  closeModal.value?.showModal()
  nextTick(() => deleteButtonRef.value?.focus())
}

const inputSizerRef = useTemplateRef('input-sizer')
const closeModal = useTemplateRef('closeModal')
const deleteButtonRef = useTemplateRef('deleteButton')

</script>
<template>
  <div
    ref="tab"
    @click="emit('select')"
    role="tab"
    class="tab shrink-0"
    :class="{ 'tab-active': active }"
  >
    <!--
      Input sizer to make input dynamically grow.
      See https://css-tricks.com/auto-growing-inputs-textareas/#aa-other-ideas
    -->
    <label ref="input-sizer" class="input-sizer min-w-14" :data-value="getInputSizerValue(value)">
      <input
        spellcheck="false"
        class="focus:outline-none"
        :value="value"
        :placeholder="PLACEHOLDER"
        @input="handleInput"
      />
    </label>
    <button
      class="btn btn-square btn-xs ml-2 btn-ghost"
      @click.stop="doRequestClose()"
      title="Close"
    >
      <XMarkIcon class="size-4"></XMarkIcon>
    </button>
  </div>
  <dialog class="modal" ref="closeModal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-square btn-ghost absolute right-2 top-2">
          <XMarkIcon class="size-4"></XMarkIcon>
        </button>
      </form>
      <h3 class="text-lg font-bold">
        Delete <span v-if="value" class="underline">{{ value }}</span
        ><template v-else>unnamed document</template>
      </h3>
      <p class="py-4">
        All unsaved data will be <span class="font-bold">permanently deleted</span>.
        <br />
        Save your data before closing if you want to keep it.
      </p>
      <div class="modal-action">
        <button class="btn btn-sm" @click="emit('save')">
          <ArrowDownTrayIcon class="size-4"></ArrowDownTrayIcon>Save
        </button>
        <button ref="deleteButton" class="btn btn-error btn-sm" @click="emit('delete')">
          <TrashIcon class="size-4"></TrashIcon>Delete
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>Dismiss</button>
    </form>
  </dialog>
</template>

<style scoped>
input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.input-sizer {
  display: inline-block;
  position: relative;
  width: fit-content;
}

.input-sizer::after {
  content: attr(data-value) ' ';
  visibility: hidden;
}
</style>
