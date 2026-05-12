<script setup lang="ts" generic="DocumentT extends Objectish">
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import type { IDBPDatabase } from 'idb'
import type { Objectish } from 'immer'
import { computed, ref, useTemplateRef } from 'vue'

import type { DocumentsDB } from '@/app/db'
import type { ModuleConfig } from '@/app/moduleConfig'
import { useDocumentContent, useDocumentMetadata, useSelectedDocumentId } from '@/app/useDocuments'
import BlankDocumentCanvas from '@/app/view/BlankDocumentCanvas.vue'
import LayoutTabs from '@/app/view/EditorTabs.vue'
import WindowHelp from '@/app/WindowHelp.vue'
import NotificationsDisplay from '@/modules/common/notifications/NotificationsDisplay.vue'
import { useNotifications } from '@/modules/common/notifications/useNotifications'
import { redoContent, setNewContent, undoContent } from '@/modules/common/state'

const { db, modules } = defineProps<{
  db: IDBPDatabase<DocumentsDB>
  modules: ModuleConfig<DocumentT>[]
}>()

const { notifications, addSuccessNotification, addErrorNotification } = useNotifications()

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

const fileInput = useTemplateRef<HTMLInputElement>('file-input')

function loadFile() {
  fileInput.value?.click()
}

async function loadFromFileInput(inputEvent: Event) {
  let fileName: string
  let dataStr: string
  try {
    const input = inputEvent.target as HTMLInputElement
    const files = [...(input.files ?? [])]
    if (files.length === 0) return
    if (files.length !== 1) throw new Error('Only one file can be loaded at a time')
    const file = files[0]!
    fileName = file.name
    dataStr = await loadTextData(file)
  } catch (_) {
    addErrorNotification('Failed to upload file')
    return
  }

  let unvalidatedData: unknown
  try {
    unvalidatedData = JSON.parse(dataStr)
  } catch (_) {
    addErrorNotification('Uploaded file is not JSON')
    return
  }

  if (typeof unvalidatedData !== 'object' || unvalidatedData === null) {
    addErrorNotification('Uploaded file contains unsupported JSON')
    return
  }

  const importModule = modules.find((module) =>
    module.canLoadFromObject(unvalidatedData as Record<string, unknown>),
  )

  if (importModule === undefined) {
    addErrorNotification('Uploaded file contains unsupported JSON')
    return
  }

  const result = importModule.load(dataStr, fileName)

  if (result.errors !== undefined) {
    for (const error of result.errors) {
      addErrorNotification('Failed loading', error.message)
    }
  }
  if (result.data !== undefined) {
    createDocumentWithContent(result.data, importModule.newNamePrefix)
    addSuccessNotification('Data loaded')
  }
}

async function loadTextData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result as string)
    })
    reader.addEventListener('error', () => {
      const error = reader.error
      if (error === null) {
        throw new Error('Error callback called but reader provided no error.')
      }
      reject(error)
    })
    reader.readAsText(file)
  })
}
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
          @load="loadFile"
          @new="createAndSelectBlankDocument"
        ></BlankDocumentCanvas>
        <BlankDocumentCanvas
          v-else-if="documentState === undefined"
          :example-groups="modules"
          @open="overrideWithContent"
          @load="loadFile"
          @new="createAndSelectBlankDocument"
        ></BlankDocumentCanvas>
        <component
          v-else-if="documentState !== undefined"
          :is="responsibleModule?.editorComponent"
          @change="updateDocument"
          @new="createAndSelectBlankDocument"
          @load="loadFile"
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
  <NotificationsDisplay :notifications="notifications" />
  <WindowHelp v-model:open="isHelpOpened" />
  <input
    ref="file-input"
    type="file"
    v-show="false"
    accept="application/json"
    @change="loadFromFileInput($event)"
  />
</template>
