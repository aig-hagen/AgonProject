<script setup lang="ts" generic="DocumentT extends Objectish">
import {
  Bars3Icon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  VariableIcon,
  FolderOpenIcon,
  AdjustmentsVerticalIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  ArrowLongRightIcon,
  PlusCircleIcon,
} from '@heroicons/vue/24/outline'
import ArrowDoubleLongRightIcon from '../ArrowDoubleLongRightIcon.vue'
import WindowExtensions from '../WindowExtensions.vue'
import WindowSource from '../WindowSource.vue'
import WindowHelp from '../WindowHelp.vue'
import { ref } from 'vue'
import { useSelectedDocumentId, useDocumentMetadata, useDocumentContent } from './useDocuments'
import LayoutTabs from '../app/view/EditorTabs.vue'
import BlankDocumentCanvas from './view/BlankDocumentCanvas.vue'
import type { IDBPDatabase } from 'idb'
import type { ModuleConfig } from '@/main'
import GraphEditor from '@/modules/bipolar-argumentation/GraphEditor.vue'
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
const { documentState, updateDocument } = useDocumentContent(db, modules, selectedDocumentId)
const isExtensionsOpened = ref<boolean>(false)
const isSourceOpened = ref<boolean>(false)
const isHelpOpened = ref<boolean>(false)
const selectedExtension = ref<string>('s1')
const arrowType = ref<'attack' | 'support'>('attack')

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
        <GraphEditor
          v-else
          @change="updateDocument"
          :saved-state="documentState"
          tabindex="0"
          @keydown="hanleEditorShortcut"
          :defaultArrowType="arrowType"
        />
        <div class="absolute top-4 left-4 right-4 flex flex-row justify-between">
          <div class="flex flex-row gap-2"></div>
          <div class="flex flex-row gap-2"></div>
          <div class="flex flex-col gap-2"></div>
        </div>
        <div class="absolute top-4 bottom-4 left-4 flex flex-col justify-between">
          <div class="flex grow-0 flex-col gap-2">
            <!-- TODO Revisit how to properly make dropdowns in dropdowns with daisyUI-->
            <div class="dropdown">
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
          </div>
          <div class="flex flex-1 justify-end flex-col gap-2">
            <div class="join join-vertical mb-8">
              <label class="join-item btn btn-toggle btn-square btn-sm" title="Attack">
                <input v-model="arrowType" value="attack" type="radio" name="arrow" />
                <ArrowLongRightIcon class="size-5 opacity-70" />
              </label>
              <label class="join-item btn btn-toggle checked btn-square btn-sm" title="Support">
                <input v-model="arrowType" value="support" type="radio" name="arrow" />
                <ArrowDoubleLongRightIcon class="size-5 opacity-70" />
              </label>
            </div>
            <button
              class="btn btn-square btn-sm"
              @click="isSourceOpened = true"
              title="Show source"
            >
              <DocumentTextIcon class="size-6 opacity-70" />
            </button>
            <button
              class="btn btn-square btn-sm"
              popovertarget="popover-2"
              style="anchor-name: --anchor-2"
              title="Evaluate"
            >
              <VariableIcon class="size-6 opacity-70" />
            </button>
            <ul
              class="dropdown dropdown-right menu rounded-box bg-base-100 shadow-md/30"
              popover
              id="popover-2"
              style="position-anchor: --anchor-2"
            >
              <li @click="isExtensionsOpened = true">
                <a>Extensions</a>
              </li>
              <li>
                <a>Rankings</a>
              </li>
            </ul>
            <button class="btn btn-square btn-sm" title="Generate">
              <AdjustmentsVerticalIcon class="size-6 opacity-70" />
            </button>
          </div>
          <div class="flex flex-1"></div>
          <div class="flex grow-0 justify-end flex-col gap-2">
            <button @click="isHelpOpened = true" class="btn btn-square btn-sm" title="Help">
              <QuestionMarkCircleIcon class="size-6 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
  <WindowExtensions v-model:open="isExtensionsOpened" v-model:extension="selectedExtension" />
  <WindowSource v-model:open="isSourceOpened" />
  <WindowHelp v-model:open="isHelpOpened" />
</template>

<style scoped>
/**
Toggle button idea and implementation from https://github.com/saadeghi/daisyui/discussions/4249-
 */
.btn-toggle {
  position: relative;

  & > input:is([type='checkbox'], [type='radio']) {
    display: none;
  }

  &::after {
    content: '';
    position: absolute;
    max-width: calc(100% - (var(--size) / 2));
    width: 1rem;
    height: 0.2rem;
    background-color: color-mix(in oklab, var(--color-base-content) 30%, #ddd);
    bottom: calc(var(--size) / 8);
    border-radius: var(--radius-field);
  }

  &:has(input:checked)::after {
    background: var(--color-base-content);
  }
}
</style>
