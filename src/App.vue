<script setup lang="ts">
import CreateGraphModal from './CreateGraphModal.vue'
import {
  Bars3Icon,
  QuestionMarkCircleIcon,
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  VariableIcon,
  FolderOpenIcon,
  AdjustmentsVerticalIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  ArrowLongRightIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from '@heroicons/vue/24/outline'
import ArrowDoubleLongRightIcon from './ArrowDoubleLongRightIcon.vue'
import { XMarkIcon, PlusIcon } from '@heroicons/vue/24/solid'
import GraphExample from './GraphExample.vue'
import WindowExtensions from './WindowExtensions.vue'
import { computed, ref } from 'vue'

const isExtensionsOpened = ref<boolean>(false)
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
        >AF Aufgabe 1 SS2026
        <button class="btn btn-square btn-xs ml-2 btn-ghost">
          <XMarkIcon class="size-4"></XMarkIcon></button
      ></a>
      <a
        role="tab"
        class="tab tab-active focus:outline-none"
        contenteditable="plaintext-only"
        spellcheck="false"
        >Demo Bipolar
        <button class="btn btn-square btn-xs ml-2 btn-ghost">
          <XMarkIcon class="size-4"></XMarkIcon></button
      ></a>
      <a
        role="tab"
        class="tab focus:outline-none"
        contenteditable="plaintext-only"
        spellcheck="false"
        >ABA Test
        <button class="btn btn-square btn-xs ml-2 btn-ghost">
          <XMarkIcon class="size-4"></XMarkIcon></button
      ></a>
      <a role="tab" class="tab" onclick="my_modal_1.showModal()"
        ><button class="btn btn-square btn-xs btn-ghost">
          <PlusIcon class="size-4"></PlusIcon></button
      ></a>
    </div>
    <main class="border-t -mt-px border-base-300 editor flex-1">
      <div class="relative h-full w-full">
        <GraphExample :extension="extensionToHighlight" />
        <div class="absolute top-4 left-4 right-4 flex flex-row justify-between">
          <div class="flex flex-row gap-2"></div>
          <div class="flex flex-row gap-2">
            <div class="join">
              <div class="tooltip tooltip-bottom" data-tip="Attack">
                <label class="join-item btn btn-toggle btn-square btn-sm">
                  <input checked type="radio" name="arrow" />
                  <ArrowLongRightIcon class="size-5 opacity-70" />
                </label>
              </div>
              <div class="tooltip tooltip-bottom" data-tip="Support">
                <label class="join-item btn btn-toggle checked btn-square btn-sm">
                  <input type="radio" name="arrow" />
                  <ArrowDoubleLongRightIcon class="size-5 opacity-70" />
                </label>
              </div>
            </div>
          </div>
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
            <div class="tooltip tooltip-right" data-tip="Edit">
              <button class="btn btn-square btn-sm">
                <PencilSquareIcon class="size-6 opacity-70" />
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
              <button class="btn btn-square btn-sm" onclick="my_modal_2.showModal()">
                <QuestionMarkCircleIcon class="size-6 opacity-70" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <CreateGraphModal />
  <dialog id="my_modal_2" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Help</h3>
      <div class="my-4 gap-2 flex flex-wrap">
        <a class="btn btn-xs btn-soft"><BookOpenIcon class="size-3" />User Guide</a>
        <a class="btn btn-xs btn-soft"><CodeBracketIcon class="size-3" />Source v0.12.0</a>
        <a class="btn btn-xs btn-soft"><AcademicCapIcon class="size-3" />AIG Hagen</a>
        <a class="btn btn-xs btn-soft"><ArrowTopRightOnSquareIcon class="size-3" />Attributions</a>
      </div>
      <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table class="table table table-zebra">
          <thead>
            <tr>
              <th>Action</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Create atom</td>
              <td><kbd class="kbd">Left double-click</kbd> on canvas</td>
            </tr>
            <tr>
              <td>Delete atom</td>
              <td><kbd class="kbd">Right-click</kbd> on atom and hold</td>
            </tr>
            <tr>
              <td>Move atom</td>
              <td><kbd class="kbd">Left-click</kbd> on atom hold and drag</td>
            </tr>
            <tr>
              <td>Create attack</td>
              <td><kbd class="kbd">Right-click</kbd> on atom, hold and drag towards atom</td>
            </tr>
            <tr>
              <td>Delete attack</td>
              <td><kbd class="kbd">Right-click</kbd> on attack and hold</td>
            </tr>
            <tr>
              <td>Pan</td>
              <td><kbd class="kbd">Left-click</kbd> on canvas, hold and drag</td>
            </tr>
            <tr>
              <td>Zoom in/out</td>
              <td><kbd class="kbd">Scroll wheel</kbd> on canvas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </dialog>
  <WindowExtensions v-model:open="isExtensionsOpened" v-model:extension="selectedExtension" />
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
