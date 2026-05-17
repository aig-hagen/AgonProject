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
import type { IDBPDatabase } from 'idb'
import type { Objectish } from 'immer'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'

import BlankDocumentCanvas from '@/app/home/BlankDocumentCanvas.vue'
import LayoutTabs from '@/app/home/EditorTabs.vue'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import type { DocumentsDB } from '@/modules/common/documents/db'
import {
  loadDocumentState,
  useDocumentContent,
  useDocumentMetadata,
  useSelectedDocumentId,
} from '@/modules/common/documents/useDocuments'
import type { ExportFileData } from '@/modules/common/export'
import { saveToFile } from '@/modules/common/export/saveFile'
import NotificationsDisplay from '@/modules/common/notifications/NotificationsDisplay.vue'
import { useNotifications } from '@/modules/common/notifications/useNotifications'
import { isShortcut, REDO_SHORTCUT, UNDO_SHORTCUT } from '@/modules/common/shortcuts'
import {
  canRedoContent,
  canUndoContent,
  type DocumentState,
  redoContent,
  setNewContent,
  undoContent,
} from '@/modules/common/state'

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
const { documentId, documentState, updateDocument, documentModule, documentLoading } =
  useDocumentContent<DocumentT>(db, modules, selectedDocumentId)

const loadedDocuments = shallowRef<
  {
    id: number
    state: DocumentState<DocumentT>
    module: ModuleConfig<DocumentT>
  }[]
>([])

watch(
  [documentId, documentState, documentModule, documentLoading],
  ([documentId, documentState, documentModule, documentLoading]) => {
    if (documentId === undefined) return
    if (documentLoading) return
    loadedDocuments.value = loadedDocuments.value.filter(
      (loadedDocument) => loadedDocument.id !== documentId,
    )

    if (documentState !== undefined && documentModule !== undefined) {
      loadedDocuments.value.push({
        id: documentId,
        state: documentState,
        module: documentModule,
      })
    }
  },
  { immediate: true },
)

watch(documents, (metadatas) => {
  loadedDocuments.value = loadedDocuments.value.filter((loadedDocument) =>
    metadatas.some((metadata) => metadata.id === loadedDocument.id),
  )
})

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

const canUndo = computed(() => {
  const currentState = documentState.value
  if (currentState === undefined) {
    return false
  }
  return canUndoContent(currentState)
})

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

const canRedo = computed(() => {
  const currentState = documentState.value
  if (currentState === undefined) {
    return false
  }
  return canRedoContent(currentState)
})

function hanleEditorShortcut(event: KeyboardEvent) {
  if (isShortcut(UNDO_SHORTCUT, event)) {
    undo()
  } else if (isShortcut(REDO_SHORTCUT, event)) {
    redo()
  }
}

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
    let documentName = fileName
    if (documentName.endsWith('.json')) {
      documentName = documentName.slice(0, -5)
    }
    createDocumentWithContent(result.data, documentName)
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

async function saveAsFile(documentId: number) {
  const metadata = documents.value.find((document) => document.id === documentId)
  if (metadata === undefined) {
    return
  }
  const [state, module] = await loadDocumentState(db, modules, documentId)
  if (state === undefined) {
    return
  }
  const fileName = getFileName(metadata.name, module)
  const saveString = module.getSaveString(state.current.content)
  saveToFile(saveString, fileName, 'json')
}

async function exportAsFile(documentId: number, fileData: ExportFileData) {
  const metadata = documents.value.find((document) => document.id === documentId)
  if (metadata === undefined) {
    return
  }
  const [_, module] = await loadDocumentState(db, modules, documentId)
  if (module === undefined) {
    return
  }
  const fileName = getFileName(metadata.name, module)
  saveToFile(fileData.content, fileName, fileData.ending)
}

function getFileName(name: string, module: ModuleConfig<DocumentT>) {
  const nameEscaped = name.replace(/[^a-zA-Z0-9 _\\-]/g, '')
  let fileName = module.newNamePrefix
  if (nameEscaped.trim() !== '') {
    fileName = nameEscaped
  }
  return fileName
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
      :db="db"
      :modules="modules"
      @save="saveAsFile($event)"
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
          v-if="!documentLoading && documentState === undefined"
          :example-groups="modules"
          @open="overrideWithContent"
          @load="loadFile"
          @new="createAndSelectBlankDocument"
        ></BlankDocumentCanvas>
        <component
          v-for="loadedDocument of loadedDocuments"
          v-show="loadedDocument.id === selectedDocumentId"
          :key="loadedDocument.id"
          :is="loadedDocument.module.editorComponent"
          @change="updateDocument"
          @new="createAndSelectBlankDocument"
          @load="loadFile"
          :state="loadedDocument.state"
          tabindex="0"
          @keydown="hanleEditorShortcut"
          @undo="undo"
          :can-undo="canUndo"
          @redo="redo"
          :can-redo="canRedo"
          @save="saveAsFile(loadedDocument.id)"
          @export="exportAsFile(loadedDocument.id, $event)"
        />
      </div>
    </main>
  </div>
  <NotificationsDisplay :notifications="notifications" />
  <input
    ref="file-input"
    type="file"
    v-show="false"
    accept="application/json"
    @change="loadFromFileInput($event)"
  />
</template>
