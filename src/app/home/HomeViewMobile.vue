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
import type { Objectish } from 'immer'
import { computed, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'

import BlankDocumentCanvas from '@/app/home/BlankDocumentCanvas.vue'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import type { HomeController } from '@/app/home/useHomeController'
import { useHomeSurface } from '@/app/home/useHomeSurface'
import NotificationsDisplay from '@/modules/common/notifications/NotificationsDisplay.vue'
import ShareModal from '@/modules/common/share/ShareModal.vue'

const { modules, controller } = defineProps<{
  modules: ModuleConfig<DocumentT>[]
  controller: HomeController<DocumentT>
}>()

const {
  notifications,
  documents,
  deleteDocument,
  selectedDocumentId,
  selectDocument,
  documentModule,
  updateDocument,
  createDocumentWithContent,
  undo,
  redo,
  historyState,
  handleEditorShortcut,
  loadFromFileInput,
  loadedDocuments,
  shareUrl,
  shareDocument,
  saveAsFile,
  exportAsFile,
} = controller

const router = useRouter()

const { surface, goTo } = useHomeSurface(() =>
  selectedDocumentId.value !== undefined
    ? 'editor'
    : documents.value.length > 0
      ? 'documents'
      : 'new',
)

const selectedName = computed(
  () => documents.value.find((d) => d.id === selectedDocumentId.value)?.name ?? '',
)

function openDocument(id: number) {
  selectDocument(id)
  goTo('editor')
}

async function createFromNew(content: DocumentT, newNamePrefix: string) {
  await createDocumentWithContent(content, newNamePrefix)
  goTo('editor')
}

const fileInput = useTemplateRef<HTMLInputElement>('file-input')

function loadFile() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="flex flex-col h-screen w-screen m-0 bg-base-100 overflow-hidden">
    <!-- Header for the Documents/New surfaces; the editor surface uses GraphEditor's own top bar. -->
    <header
      v-if="surface !== 'editor'"
      class="flex-none flex items-center gap-2 px-3 h-12 border-b border-base-300"
    >
      <button v-if="selectedDocumentId !== undefined" class="btn btn-sm" @click="goTo('editor')">
        ← Editor
      </button>
      <h1 class="text-lg font-semibold">{{ surface === 'new' ? 'New document' : 'Documents' }}</h1>
    </header>

    <main class="flex-1 relative overflow-hidden">
      <!-- Documents surface -->
      <div v-show="surface === 'documents'" class="absolute inset-0 overflow-y-auto p-3">
        <button class="btn btn-primary btn-block mb-3" @click="goTo('new')">+ New document</button>
        <ul class="flex flex-col gap-2">
          <li v-for="document of documents" :key="document.id">
            <div
              class="flex items-center gap-2 rounded-lg border border-base-300 px-3 py-2"
              :class="{ 'border-primary': document.id === selectedDocumentId }"
            >
              <button class="flex-1 text-left truncate" @click="openDocument(document.id)">
                {{ document.name || 'Untitled' }}
              </button>
              <button class="btn btn-ghost btn-xs" @click="saveAsFile(document.id)">Save</button>
              <button class="btn btn-ghost btn-xs text-error" @click="deleteDocument(document.id)">
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- New surface -->
      <div v-show="surface === 'new'" class="absolute inset-0 overflow-y-auto">
        <BlankDocumentCanvas :module-cards="modules" @open="createFromNew" />
      </div>

      <!-- Editor surface: kept mounted across surface switches -->
      <div v-show="surface === 'editor'" class="absolute inset-0">
        <component
          tabindex="0"
          v-for="loadedDocument of loadedDocuments"
          v-show="loadedDocument.id === selectedDocumentId"
          :key="loadedDocument.id"
          :is="loadedDocument.module.editorComponent"
          @change="
            (state) => {
              if (loadedDocument.id === selectedDocumentId) updateDocument(state)
            }
          "
          @new="goTo('new')"
          @load="loadFile"
          @generate="router.push(documentModule?.generateHref ?? '/generate')"
          @home="goTo('documents')"
          :state="loadedDocument.state"
          :document-id="loadedDocument.id"
          :document-name="selectedName"
          :type-badge="loadedDocument.module.newNamePrefix"
          :history-state="historyState"
          @keydown="handleEditorShortcut"
          @undo="undo"
          @redo="redo"
          @save="saveAsFile(loadedDocument.id)"
          @share="shareDocument(loadedDocument.id)"
          @export="exportAsFile(loadedDocument.id, $event)"
        />
      </div>
    </main>
  </div>
  <NotificationsDisplay :notifications="notifications" />
  <ShareModal :url="shareUrl" @close="shareUrl = null" />
  <input
    ref="file-input"
    type="file"
    v-show="false"
    accept="application/json"
    @change="loadFromFileInput($event)"
  />
</template>
