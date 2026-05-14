<script setup lang="ts">
import {
  ArrowDownTrayIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3Icon,
  ChevronRightIcon,
  FolderOpenIcon,
  PhotoIcon,
  PlusCircleIcon,
  SparklesIcon,
  VariableIcon,
} from '@heroicons/vue/24/outline'
import { computed } from 'vue'

import { Layout, type LayoutData, layoutDatas } from '@/modules/common/main-menu/layouting'
import { EntryState } from '@/modules/common/main-menu/types'
import { REDO_SHORTCUT, UNDO_SHORTCUT } from '@/modules/common/shortcuts'

const {
  showSave = EntryState.HIDE,
  showUndo = EntryState.HIDE,
  showRedo = EntryState.HIDE,
  showExport = EntryState.HIDE,
  showEvaluate = EntryState.HIDE,
  layoutsToShow = [],
} = defineProps<{
  showSave?: EntryState
  showUndo?: EntryState
  showRedo?: EntryState
  showExport?: EntryState
  showEvaluate?: EntryState
  layoutsToShow?: Layout[]
}>()

const emit = defineEmits<{
  new: []
  load: []
  save: []
  undo: []
  layout: [layout: Layout]
  redo: []
  export: []
  evaluate: []
}>()

function onClickLayout(layout: Layout) {
  emit('layout', layout)
  const activeElement = document.activeElement
  if (activeElement instanceof HTMLElement) {
    activeElement.blur()
  }
}

const layoutDatasToShow = computed<Record<Layout, LayoutData>>(() => {
  const layoutDatasToShow: Record<Layout, LayoutData> = Object.create(null)
  for (const layout of layoutsToShow) {
    layoutDatasToShow[layout] = layoutDatas[layout]
  }
  return layoutDatasToShow
})
</script>
<template>
  <div class="dropdown pointer-events-auto">
    <div tabindex="0" role="button" class="btn btn-square btn-sm" title="Menu">
      <Bars3Icon class="size-6 opacity-70" />
    </div>
    <ul tabindex="-1" class="dropdown-content w-max menu bg-base-100 rounded-box z-1 shadow-md/30">
      <li>
        <a @click="emit('new')"><PlusCircleIcon class="size-5 opacity-70" />New</a>
      </li>
      <li>
        <a @click="emit('load')"><FolderOpenIcon class="size-5 opacity-70" />Open...</a>
      </li>
      <li v-if="showSave !== EntryState.HIDE">
        <a
          :class="{
            'opacity-50 pointer-events-none': showSave === EntryState.DISABLE,
          }"
          @click="emit('save')"
          ><ArrowDownTrayIcon class="size-5 opacity-70" />Save</a
        >
      </li>
      <template v-if="layoutsToShow.length > 0">
        <li class="disabled"><hr class="mt-2 border-base-300" /></li>
        <li>
          <div class="dropdown dropdown-hover dropdown-right">
            <a class="flex flex-row justify-between">
              <div>
                <SparklesIcon class="inline size-5 opacity-70 mr-2" />
                <span>Relayout</span>
              </div>
              <ChevronRightIcon class="size-5 opacity-40" />
            </a>
            <div tabindex="-1" class="dropdown-content p-0">
              <ul class="menu bg-base-100 rounded-box z-1 mt-0 ml-0 w-max shadow-sm/30">
                <li v-for="(layoutData, layoutType) in layoutDatasToShow" :key="layoutType">
                  <a @click="onClickLayout(layoutType)"
                    ><component :is="layoutData.icon" class="size-5 opacity-70" />{{
                      layoutData.name
                    }}</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </li>
      </template>
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
              <kbd class="text-xs opacity-40 font-mono" v-if="REDO_SHORTCUT.modifiers.ctrl"
                >Ctrl</kbd
              >
              <kbd class="text-xs opacity-40 font-mono" v-if="UNDO_SHORTCUT.modifiers.meta">⌘</kbd>
              <kbd class="text-xs opacity-40 font-mono" v-if="UNDO_SHORTCUT.modifiers.shift"
                >Shift</kbd
              >

              <kbd class="text-xs opacity-40 font-mono">{{ UNDO_SHORTCUT.key.toUpperCase() }}</kbd>
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
              <kbd class="text-xs opacity-40 font-mono" v-if="REDO_SHORTCUT.modifiers.ctrl"
                >Ctrl</kbd
              >
              <kbd class="text-xs opacity-40 font-mono" v-if="REDO_SHORTCUT.modifiers.meta">⌘</kbd>
              <kbd class="text-xs opacity-40 font-mono" v-if="REDO_SHORTCUT.modifiers.shift"
                >Shift</kbd
              >
              <kbd class="text-xs opacity-40 font-mono">{{ REDO_SHORTCUT.key.toUpperCase() }}</kbd>
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
            @click="emit('evaluate')"
            ><VariableIcon class="size-5 opacity-70" />Evaluate...</a
          >
        </li>
        <li>
          <a
            :class="{
              'opacity-50 pointer-events-none': showExport === EntryState.DISABLE,
            }"
            @click="emit('export')"
            ><PhotoIcon class="size-5 opacity-70" />Export...</a
          >
        </li>
      </template>
    </ul>
  </div>
</template>
