<script setup lang="ts" generic="DocumentT extends Objectish">
import {
  Bars3Icon,
  QuestionMarkCircleIcon,
  FolderOpenIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  PlusCircleIcon,
} from '@heroicons/vue/24/outline'
import WindowHelp from '../WindowHelp.vue'
import { computed, ref } from 'vue'
import { useSelectedDocumentId, useDocumentMetadata, useDocumentContent } from './useDocuments'
import LayoutTabs from '../app/view/EditorTabs.vue'
import BlankDocumentCanvas from './view/BlankDocumentCanvas.vue'
import type { IDBPDatabase } from 'idb'
import type { ModuleConfig } from '@/main'
import type { DocumentsDB } from './db'
import { redoContent, setNewContent, undoContent } from '@/modules/common/state'
import type { Objectish } from 'immer'

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

function overrideWithContent(content: DocumentT) {
  const currentState = documentState.value
  if (currentState === undefined) {
    throw new Error('Document state does not exit.')
  }
  const nextDocumentState = setNewContent(currentState, content)
  if (nextDocumentState !== undefined) {
    updateDocument(nextDocumentState)
  }
}

async function createAndSelectBlankDocument() {
  const id = await createDocument()
  selectDocument(id)
}

async function createDocumentWithContent(content: DocumentT) {
  const id = await createDocument(content)
  selectDocument(id)
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

const editorComponent = computed(() => {
  const content = documentState.value?.current.content
  if (content === undefined) {
    return
  }
  const module = modules.find((module) => module.is(content))
  if (module === undefined) {
    return undefined
  }
  return module.editorComponent
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
          v-if="documentState === undefined"
          :example-groups="modules"
          @open="createDocumentWithContent"
        ></BlankDocumentCanvas>
        <BlankDocumentCanvas
          v-else-if="documentState.current.content === undefined"
          :example-groups="modules"
          @open="overrideWithContent"
        ></BlankDocumentCanvas>
        <component
          v-else-if="documentState !== undefined"
          :is="editorComponent"
          @change="updateDocument"
          :state="documentState"
          tabindex="0"
          @keydown="hanleEditorShortcut"
        />
        <div
          class="absolute top-4 bottom-4 left-4 flex flex-col justify-between pointer-events-none"
        >
          <!-- TODO Revisit how to properly make dropdowns in dropdowns with daisyUI-->
          <div class="dropdown pointer-events-auto">
            <div tabindex="0" role="button" class="btn btn-square btn-sm" title="Menu">
              <Bars3Icon class="size-6 opacity-70" />
            </div>
            <ul
              tabindex="-1"
              class="dropdown-content w-max menu bg-base-100 rounded-box z-1 shadow-md/30"
            >
              <li>
                <a @click="createAndSelectBlankDocument"
                  ><PlusCircleIcon class="size-5 opacity-70" />New</a
                >
              </li>
              <li>
                <a><FolderOpenIcon class="size-5 opacity-70" />Open...</a>
              </li>
              <li>
                <a><ArrowDownTrayIcon class="size-5 opacity-70" />Save As...</a>
              </li>
              <li>
                <a><PhotoIcon class="size-5 opacity-70" />Export As...</a>
              </li>
            </ul>
          </div>
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
