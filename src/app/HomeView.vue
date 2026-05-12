<script setup lang="ts" generic="DocumentT extends Objectish">
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import type { IDBPDatabase } from 'idb'
import type { Objectish } from 'immer'
import { computed, ref } from 'vue'

import type { DocumentsDB } from '@/app/db'
import type { ModuleConfig } from '@/app/moduleConfig'
import { useDocumentContent, useDocumentMetadata, useSelectedDocumentId } from '@/app/useDocuments'
import BlankDocumentCanvas from '@/app/view/BlankDocumentCanvas.vue'
import LayoutTabs from '@/app/view/EditorTabs.vue'
import WindowHelp from '@/app/WindowHelp.vue'
import { redoContent, setNewContent, undoContent } from '@/modules/common/state'

const { db, modules } = defineProps<{
  db: IDBPDatabase<DocumentsDB>
  modules: ModuleConfig<DocumentT>[]
}>()

const { documents, createDocument, deleteDocument, renameDocument } = useDocumentMetadata(
  db,
  modules,
)
const { selectedDocumentId, selectDocument } = useSelectedDocumentId(documents)
const { documentState, updateDocument } = useDocumentContent<DocumentT>(
  db,
  modules,
  selectedDocumentId,
)
const isHelpOpened = ref<boolean>(false)

function overrideWithContent(content: DocumentT, newNamePrefix: string) {
  if (selectedDocumentId.value === undefined) {
    return
  }
  const selectedDocumentMetadata = documents.value.find(
    (document) => document.id === selectedDocumentId.value,
  )
  if (selectedDocumentMetadata === undefined) {
    return
  }
  if (selectedDocumentMetadata.name.trim() === '') {
    const name = getNextName(newNamePrefix)
    renameDocument(selectedDocumentId.value, name)
  }
  const nextDocumentState = setNewContent(content)
  if (nextDocumentState !== undefined) {
    updateDocument(nextDocumentState)
  }
}

async function createAndSelectBlankDocument() {
  const id = await createDocument('', undefined)
  selectDocument(id)
}

async function createDocumentWithContent(content: DocumentT, newNamePrefix: string) {
  const name = getNextName(newNamePrefix)
  const id = await createDocument(name, content)
  selectDocument(id)
}

function getNextName(newNamePrefix: string) {
  const allNames = new Set(documents.value.map((document) => document.name))
  if (!allNames.has(newNamePrefix)) {
    return newNamePrefix
  }
  for (let i = 1; ; i++) {
    const newName = newNamePrefix + i.toString(10)
    if (!allNames.has(newName)) {
      return newName
    }
  }
}

function undo() {
  const currentState = documentState.value
  if (currentState === undefined) {
    throw new Error('Document state does not exit.')
  }
  const nextDocumentState = undoContent(currentState)
  if (nextDocumentState !== undefined) {
    updateDocument(nextDocumentState)
  }
}

function redo() {
  const currentState = documentState.value
  if (currentState === undefined) {
    throw new Error('Document state does not exit.')
  }
  const nextDocumentState = redoContent(currentState)
  if (nextDocumentState !== undefined) {
    updateDocument(nextDocumentState)
  }
}

function hanleEditorShortcut(event: KeyboardEvent) {
  const isMac = navigator.platform.indexOf('Mac') >= 0
  const ctrl = isMac ? event.metaKey : event.ctrlKey
  if (!ctrl) {
    return
  }
  if (event.shiftKey && event.key === 'z') {
    event.preventDefault()
    redo()
  } else if (event.key === 'z') {
    event.preventDefault()
    undo()
  }
}

const responsibleModule = computed(() => {
  const content = documentState.value?.current.content
  if (content === undefined) {
    return
  }
  const module = modules.find((module) => module.is(content))
  if (module === undefined) {
    return undefined
  }
  return module
})
</script>

<template>
  <div class="screen flex flex-col h-screen w-screen m-0 bg-base-100">
    <LayoutTabs
      class="flex-none"
      :data="documents.map((document) => ({ id: document.id, name: document.name }))"
      :selected="selectedDocumentId"
      @select="selectDocument($event)"
      @create="createAndSelectBlankDocument"
      @delete="deleteDocument($event)"
      @rename="(id, name) => renameDocument(id, name)"
    />
    <main class="border-t -mt-px border-base-300 editor flex-1">
      <div class="relative h-full w-full">
        <BlankDocumentCanvas
          v-if="selectedDocumentId === undefined"
          :example-groups="modules"
          @open="createDocumentWithContent"
          @new="createAndSelectBlankDocument"
        ></BlankDocumentCanvas>
        <BlankDocumentCanvas
          v-else-if="documentState === undefined"
          :example-groups="modules"
          @open="overrideWithContent"
          @new="createAndSelectBlankDocument"
        ></BlankDocumentCanvas>
        <component
          v-else-if="documentState !== undefined"
          :is="responsibleModule?.editorComponent"
          @change="updateDocument"
          @new="createAndSelectBlankDocument"
          :state="documentState"
          tabindex="0"
          @keydown="hanleEditorShortcut"
        />
        <div class="absolute top-4 bottom-4 left-4 flex flex-col justify-end pointer-events-none">
          <button
            @click="isHelpOpened = true"
            class="btn btn-square btn-sm pointer-events-auto"
            title="Help"
          >
            <QuestionMarkCircleIcon class="size-6 opacity-70" />
          </button>
        </div>
      </div>
    </main>
  </div>
  <WindowHelp v-model:open="isHelpOpened" />
</template>
