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
} from '@heroicons/vue/24/outline'
import ArrowDoubleLongRightIcon from './ArrowDoubleLongRightIcon.vue'
import { XMarkIcon, PlusIcon } from '@heroicons/vue/24/solid'
import GraphExample from './GraphExample.vue'
import WindowExtensions from './WindowExtensions.vue'
import WindowSource from './WindowSource.vue'
import WindowHelp from './WindowHelp.vue'
import { computed, ref } from 'vue'

const isExtensionsOpened = ref<boolean>(false)
const isSourceOpened = ref<boolean>(false)
const isHelpOpened = ref<boolean>(false)
const selectedExtension = ref<string>('s1')
const extensionToHighlight = computed(() => {
  return isExtensionsOpened.value ? selectedExtension.value : undefined
})
</script>

<template>
  <div class="screen flex flex-col h-screen w-screen m-0 bg-base-100">
    <!-- TODO test with scroll -->
    <div role="tablist" class="tabs tabs-lift min-w-full bg-base-300">
      <!-- replace content editable with https://css-tricks.com/auto-growing-inputs-textareas/#aa-other-ideas -->
      <a
        role="tab"
        class="tab focus:outline-none"
        contenteditable="plaintext-only"
        spellcheck="false"
        >AF Aufgabe 1 SS2026<button class="btn btn-square btn-xs ml-2 btn-ghost">
          <XMarkIcon class="size-4"></XMarkIcon></button
      ></a>
      <a
        role="tab"
        class="tab tab-active focus:outline-none"
        contenteditable="plaintext-only"
        spellcheck="false"
        >Demo Bipolar<button class="btn btn-square btn-xs ml-2 btn-ghost">
          <XMarkIcon class="size-4"></XMarkIcon></button
      ></a>
      <a
        role="tab"
        class="tab focus:outline-none"
        contenteditable="plaintext-only"
        spellcheck="false"
        >ABA Test<button class="btn btn-square btn-xs ml-2 btn-ghost">
          <XMarkIcon class="size-4"></XMarkIcon></button
      ></a>
      <a role="tab" class="tab" onclick="my_modal_1.showModal()">
        <div class="tooltip tooltip-bottom" data-tip="New Graph">
          <button class="btn btn-square btn-xs btn-ghost">
            <PlusIcon class="size-4"></PlusIcon>
          </button></div
      ></a>
    </div>
    <main class="border-t -mt-px border-base-300 editor flex-1">
      <div class="relative h-full w-full">
        <GraphExample :extension="extensionToHighlight" />
        <div class="absolute top-4 left-4 right-4 flex flex-row justify-between">
          <div class="flex flex-row gap-2"></div>
          <div class="flex flex-row gap-2"></div>
          <div class="flex flex-col gap-2"></div>
        </div>
        <div class="absolute top-4 bottom-4 left-4 flex flex-col justify-between">
          <div class="flex flex-col gap-2">
            <div class="tooltip tooltip-right" data-tip="Menu">
              <button
                class="btn btn-square btn-sm"
                popovertarget="popover-1"
                style="anchor-name: --anchor-1"
              >
                <Bars3Icon class="size-6 opacity-70" />
              </button>
            </div>
            <ul
              class="dropdown menu rounded-box bg-base-100 shadow-md"
              popover
              id="popover-1"
              style="position-anchor: --anchor-1"
            >
              <li>
                <a><FolderOpenIcon class="size-5 opacity-70" />Open...</a>
              </li>
              <li>
                <a><ArrowDownTrayIcon class="size-5 opacity-70" />Save to...</a>
              </li>
              <li>
                <a><PhotoIcon class="size-5 opacity-70" />Export as...</a>
              </li>
            </ul>
          </div>
          <div class="flex flex-col gap-2">
            <div class="join join-vertical mb-8">
              <div class="tooltip tooltip-right" data-tip="Attack">
                <label class="join-item btn btn-toggle btn-square btn-sm">
                  <input checked type="radio" name="arrow" />
                  <ArrowLongRightIcon class="size-5 opacity-70" />
                </label>
              </div>
              <div class="tooltip tooltip-right" data-tip="Support">
                <label class="join-item btn btn-toggle checked btn-square btn-sm">
                  <input type="radio" name="arrow" />
                  <ArrowDoubleLongRightIcon class="size-5 opacity-70" />
                </label>
              </div>
            </div>
            <div class="tooltip tooltip-right" data-tip="Show source">
              <button class="btn btn-square btn-sm" @click="isSourceOpened = true">
                <DocumentTextIcon class="size-6 opacity-70" />
              </button>
            </div>
            <div class="tooltip tooltip-right" data-tip="Evaluate">
              <button
                class="btn btn-square btn-sm"
                popovertarget="popover-2"
                style="anchor-name: --anchor-2"
              >
                <VariableIcon class="size-6 opacity-70" />
              </button>
            </div>
            <ul
              class="dropdown dropdown-right menu rounded-box bg-base-100 shadow-md"
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
            <div class="tooltip tooltip-right" data-tip="Generate">
              <button class="btn btn-square btn-sm">
                <AdjustmentsVerticalIcon class="size-6 opacity-70" />
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="tooltip tooltip-right" data-tip="Help">
              <button @click="isHelpOpened = true" class="btn btn-square btn-sm">
                <QuestionMarkCircleIcon class="size-6 opacity-70" />
              </button>
            </div>
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
/* .screen {
  background: green;
}

.editor {
  background-color: red;
}

.graph {
  background-color: blue;
} */

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
