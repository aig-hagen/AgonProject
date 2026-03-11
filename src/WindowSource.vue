<script setup lang="ts">
import '@interactjs/auto-start'
import '@interactjs/actions/drag'
import '@interactjs/actions/resize'
import interact from '@interactjs/interact'
import { onMounted, useTemplateRef } from 'vue'
import { MinusIcon } from '@heroicons/vue/24/solid'

import { basicSetup, EditorView } from 'codemirror'

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

  new EditorView({
    doc: `X
Y
Z
#
E L
L K
N M
M L
M N
B A support
F D
H E
M E
D E
C A
G D
D C
E C
D G
E D
E M
I H
J I
O A
H D
`,
    extensions: [basicSetup],
    parent: floating.value!.lastElementChild!,
  })
})
</script>

<template>
  <div
    v-show="open"
    ref="floating"
    class="absolute top-0 left-0 rounded-box bg-base-200 flex flex-col shadow-lg border border-base-300 min-w-3xs"
    :style="{
      transform: `translate(${position.x}px, ${position.y}px)`,
    }"
  >
    <div class="border-b border-base-300 flex justify-between py-1 px-2">
      <div>Graph Source</div>
      <button @click="open = false" class="btn btn-square btn-xs btn-ghost">
        <MinusIcon class="size-4"></MinusIcon>
      </button>
    </div>
    <div class="flex-1 bg-base-100 overflow-x-auto"></div>
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
