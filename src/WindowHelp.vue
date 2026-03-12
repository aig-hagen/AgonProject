<script setup lang="ts">
import '@interactjs/auto-start'
import '@interactjs/actions/drag'
import '@interactjs/actions/resize'
import interact from '@interactjs/interact'
import { onMounted, useTemplateRef } from 'vue'
import { MinusIcon } from '@heroicons/vue/24/solid'

import {
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from '@heroicons/vue/24/outline'

const position = { x: 100, y: 100 }
const floating = useTemplateRef('floating')

const open = defineModel('open', { required: true })

onMounted(() => {
  if (floating.value === null) {
    throw Error('Window ref not set.')
  }
  floating.value.style.transform = `translate(${position.x}px, ${position.y}px)`

  interact(floating.value)
    .draggable({
      // TODO https://interactjs.io/docs/restriction/

      ignoreFrom: '.content', // TODO Add ignore and
      listeners: {
        move(event) {
          position.x += event.dx
          position.y += event.dy
          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`
        },
      },
    })
    .resizable({
      invert: 'none',
      edges: { top: true, left: true, bottom: true, right: true },
      listeners: {
        move: function (event) {
          position.x += event.deltaRect.left
          position.y += event.deltaRect.top

          const { width, height } = event.rect

          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`
          event.target.style.width = `${width}px`
          event.target.style.height = `${height}px`
        },
      },
    })
})
</script>

<template>
  <div
    v-show="open"
    ref="floating"
    class="absolute top-0 left-0 rounded-box bg-base-200 flex flex-col shadow-lg/30 border border-base-300 min-w-3xs"
    :style="{
      transform: `translate(${position.x}px, ${position.y}px)`,
    }"
  >
    <div class="border-b border-base-300 flex justify-between py-1 pl-4 pr-2">
      <div>Help</div>
      <button @click="open = false" class="btn btn-square btn-xs btn-ghost">
        <MinusIcon class="size-4"></MinusIcon>
      </button>
    </div>
    <div class="flex-1 bg-base-100 overflow-x-auto p-4">
      <div class="my-4 gap-2 flex flex-wrap">
        <a class="btn btn-xs btn-soft"><BookOpenIcon class="size-3" />User Guide</a>
        <a class="btn btn-xs btn-soft"><CodeBracketIcon class="size-3" />Source v0.12.0</a>
        <a class="btn btn-xs btn-soft"><AcademicCapIcon class="size-3" />AIG Hagen</a>
        <a class="btn btn-xs btn-soft"><ArrowTopRightOnSquareIcon class="size-3" />Attributions</a>
      </div>
      <table class="table">
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
</template>

<style>
/* TODO Revisit this quick and dirty solution */
.cm-editor:focus,
.cm-editor.cm-focused,
.cm-editor .cm-editor:focus-within {
  outline: none !important;
}
.cm-editor {
  height: 100%;
}
</style>
