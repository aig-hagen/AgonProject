<script setup lang="ts">
import CreateGraphModal from './CreateGraphModal.vue'
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
  FolderPlusIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import ArrowDoubleLongRightIcon from './ArrowDoubleLongRightIcon.vue'
import GraphExample from './GraphExample.vue'
import WindowExtensions from './WindowExtensions.vue'
import WindowSource from './WindowSource.vue'
import WindowHelp from './WindowHelp.vue'
import { computed, ref } from 'vue'
import useDocuments, { useDocumentsDb } from './modules/document/useDocuments'
import LayoutTabs from './app/view/EditorTabs.vue'
import BlankDocument from './app/view/BlankDocument.vue'

const PRODUCTION_DATABASE_DOCUMENTS_NAME = 'documents'
type DocumentT = string
const { db } = useDocumentsDb<DocumentT>(PRODUCTION_DATABASE_DOCUMENTS_NAME)
const {
  documents,
  selectedDocument,
  createDocument,
  deleteDocument,
  renameDocument,
  selectDocument,
} = useDocuments<DocumentT>(db)

const isExtensionsOpened = ref<boolean>(false)
const isSourceOpened = ref<boolean>(false)
const isHelpOpened = ref<boolean>(false)
const selectedExtension = ref<string>('s1')
const extensionToHighlight = computed(() => {
  return isExtensionsOpened.value ? selectedExtension.value : undefined
})
</script>

<!-- Ask before deleting -->
<template>
  <div class="screen flex flex-col h-screen w-screen m-0 bg-base-100">
    <LayoutTabs
      class="grow-0"
      :data="documents.map((document) => ({ id: document.id, name: document.name }))"
      :selected="selectedDocument?.metadata.id"
      @select="selectDocument($event)"
      @create="createDocument('some avlue')"
      @delete="deleteDocument($event)"
      @rename="(id, name) => renameDocument(id, name)"
    />
    <main class="border-t -mt-px border-base-300 editor flex-1">
      <BlankDocument v-if="selectedDocument === null"></BlankDocument>
      <div v-else class="relative h-full w-full">
        <GraphExample :extension="extensionToHighlight" />
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
                  <div class="dropdown dropdown-right dropdown-start dropdown-hover pr-1">
                    <div tabindex="0" role="button" class="flex gap-2 -mx-4 px-4">
                      <FolderPlusIcon class="size-5 opacity-70" />
                      <span class="grow">New</span>
                      <ChevronRightIcon class="self-center size-4 opacity-70" />
                    </div>
                    <ul
                      tabindex="-1"
                      class="dropdown-content menu bg-base-100 rounded-box z-1 -mt-2 ml-2 w-max shadow-md/30"
                    >
                      <li><a>Argumentation</a></li>
                      <li><a>Bipolar Argumentation</a></li>
                    </ul>
                  </div>
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
                <input checked type="radio" name="arrow" />
                <ArrowLongRightIcon class="size-5 opacity-70" />
              </label>
              <label class="join-item btn btn-toggle checked btn-square btn-sm" title="Support">
                <input type="radio" name="arrow" />
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
  <CreateGraphModal />
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
