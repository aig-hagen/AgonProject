<script setup lang="ts">
import {
  ArrowDownTrayIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3Icon,
  FolderOpenIcon,
  PhotoIcon,
  PlusCircleIcon,
  VariableIcon,
} from '@heroicons/vue/24/outline'

import { EntryState } from '@/modules/common/main-menu/types'

const {
  showUndo = EntryState.HIDE,
  showRedo = EntryState.HIDE,
  showExport = EntryState.HIDE,
  showEvaluate = EntryState.HIDE,
} = defineProps<{
  showUndo?: EntryState
  showRedo?: EntryState
  showExport?: EntryState
  showEvaluate?: EntryState
}>()

const emit = defineEmits<{
  new: []
  load: []
  save: []
  undo: []
  redo: []
  export: []
  evaluate: []
}>()
</script>
<template>
  <!-- TODO Revisit how to properly make dropdowns in dropdowns with daisyUI-->
  <div class="dropdown pointer-events-auto">
    <div tabindex="0" role="button" class="btn btn-square btn-sm" title="Menu">
      <Bars3Icon class="size-6 opacity-70" />
    </div>
    <ul tabindex="-1" class="dropdown-content w-max menu bg-base-100 rounded-box z-1 shadow-md/30">
      <li>
        <a @click="emit('new')"><PlusCircleIcon class="size-5 opacity-70" />New</a>
      </li>
      <li>
        <a><FolderOpenIcon @click="emit('load')" class="size-5 opacity-70" />Open...</a>
      </li>
      <li>
        <a><ArrowDownTrayIcon @click="emit('save')" class="size-5 opacity-70" />Save</a>
      </li>
      <template v-if="showUndo !== EntryState.HIDE || showRedo !== EntryState.HIDE">
        <li class="disabled"><hr class="mt-2 border-base-300" /></li>
        <li v-if="showUndo !== EntryState.HIDE">
          <a
            :class="{
              'opacity-50 pointer-events-none': showUndo === EntryState.DISABLE,
            }"
            @click="emit('undo')"
            class="flex justify-between gap-8"
          >
            <span class="flex items-center gap-2">
              <ArrowUturnLeftIcon class="size-5 opacity-70" />Undo
            </span>
            <span class="flex gap-1 items-center">
              <kbd class="text-xs opacity-40 font-mono">Ctrl</kbd>
              <kbd class="text-xs opacity-40 font-mono">Z</kbd>
            </span>
          </a>
        </li>
        <li v-if="showRedo !== EntryState.HIDE">
          <a
            :class="{
              'opacity-50 pointer-events-none': showRedo === EntryState.DISABLE,
            }"
            @click="emit('redo')"
            class="flex justify-between gap-8"
          >
            <span class="flex items-center gap-2">
              <ArrowUturnRightIcon class="size-5 opacity-70" />Redo
            </span>
            <span class="flex gap-1 items-center">
              <kbd class="text-xs opacity-40 font-mono">Ctrl</kbd>
              <kbd class="text-xs opacity-40 font-mono">Shift</kbd>
              <kbd class="text-xs opacity-40 font-mono">Z</kbd>
            </span>
          </a>
        </li>
      </template>
      <template v-if="showEvaluate !== EntryState.HIDE || showExport !== EntryState.HIDE">
        <li class="disabled"><hr class="mt-2 border-base-300" /></li>
        <li>
          <a
            :class="{
              'opacity-50 pointer-events-none': showEvaluate === EntryState.DISABLE,
            }"
            @click="emit('export')"
            ><PhotoIcon class="size-5 opacity-70" />Evaluate...</a
          >
        </li>
        <li>
          <a
            :class="{
              'opacity-50 pointer-events-none': showExport === EntryState.DISABLE,
            }"
            @click="emit('evaluate')"
            ><VariableIcon class="size-5 opacity-70" />Export...</a
          >
        </li>
      </template>
    </ul>
  </div>
</template>
