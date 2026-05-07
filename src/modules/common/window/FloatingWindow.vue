0
<script setup lang="ts">
import '@interactjs/auto-start'
import '@interactjs/actions/drag'
import '@interactjs/actions/resize'
import '@interactjs/modifiers'
import interact from '@interactjs/interact'
import { onMounted, useTemplateRef } from 'vue'
import { MinusIcon } from '@heroicons/vue/24/solid'
import { useEventListener } from '@vueuse/core'

const floating = useTemplateRef('floating')
const content = useTemplateRef('content')
const header = useTemplateRef('header')
const pointerShield = useTemplateRef('pointerShield')
const open = defineModel('open', { required: true })
const { title, initialPosition } = defineProps<{
  title: string
  initialPosition: { x: number; y: number }
}>()

const position = { ...initialPosition }

function startDragOrResize() {
  // Avoid pointer being captured by content on any other element during resizing.
  content.value!.style.pointerEvents = 'none'
  header.value!.style.pointerEvents = 'none'
  pointerShield.value!.style.display = ''
  // Disable accidental user select during drag
  header.value!.style.userSelect = 'none'
  content.value!.style.userSelect = 'none'
}

function endDragOrResize() {
  content.value!.style.pointerEvents = ''
  header.value!.style.pointerEvents = ''
  pointerShield.value!.style.display = 'none'
  content.value!.style.userSelect = 'text'
  header.value!.style.userSelect = 'text'
}

onMounted(() => {
  if (floating.value === null) {
    throw Error('Window ref not set.')
  }
  floating.value.style.transform = `translate(${position.x}px, ${position.y}px)`
  floating.value.style.width = '576px'
  floating.value.style.height = '448px'
  pointerShield.value!.style.display = 'none'
  interact(floating.value)
    .draggable({
      modifiers: [
        interact.modifiers.restrict({
          restriction: 'parent',
          elementRect: {
            left: 0,
            right: 1,
            top: 0,
            bottom: 1,
          },
        }),
      ],
      allowFrom: header.value!,
      listeners: {
        start: startDragOrResize,
        move(event) {
          position.x += event.dx
          position.y += event.dy
          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`
        },
        end: endDragOrResize,
      },
    })
    .resizable({
      modifiers: [
        interact.modifiers.restrictEdges({
          outer: 'parent',
        }),
        interact.modifiers.restrictSize({
          min: { width: 92, height: 64 },
        }),
      ],
      allowFrom: floating.value!,
      ignoreFrom: header.value!,
      invert: 'none',
      edges: { top: false, left: true, bottom: true, right: true },
      listeners: {
        start: startDragOrResize,
        move(event) {
          position.x += event.deltaRect.left
          position.y += event.deltaRect.top

          const { width, height } = event.rect

          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`
          event.target.style.width = `${width}px`
          event.target.style.height = `${height}px`
        },
        end: endDragOrResize,
      },
    })
})

const Z_INDEX_FORGROUND = '1001'
const Z_INDEX_BACKGROUND = '999'
useEventListener(floating, 'focus', () => {
  const style = floating.value?.style
  if (style === undefined) {
    return
  }
  style.zIndex = Z_INDEX_FORGROUND
})
useEventListener(floating, 'blur', () => {
  const style = floating.value?.style
  if (style === undefined) {
    return
  }
  style.zIndex = Z_INDEX_BACKGROUND
})
</script>

<template>
  <div
    v-show="open"
    ref="floating"
    tabindex="0"
    class="absolute top-0 left-0 rounded-box bg-base-100 flex flex-col shadow-lg/30 border border-base-300 min-w-3xs floating-window"
    :style="{
      transform: `translate(${position.x}px, ${position.y}px)`,
    }"
  >
    <div
      ref="header"
      class="floating-window-header bg-base-200 border-b border-base-300 flex justify-between py-1 pl-4 pr-2"
    >
      <div>{{ title }}</div>
      <button @click="open = false" class="btn btn-square btn-xs btn-ghost">
        <MinusIcon class="size-4"></MinusIcon>
      </button>
    </div>
    <div ref="content" class="floating-window-content bg-base-100 overflow-x-auto flex-1">
      <slot> </slot>
    </div>
  </div>
  <div ref="pointerShield" class="pointer-shield"></div>
</template>
<style scoped>
.floating-window {
  touch-action: none;
  user-select: none;
}

.floating-window-content,
.floating-window-header {
  user-select: text;
}

.pointer-shield {
  position: fixed;
  inset: 0;
  /* It is smaller then Z_INDEX_FORGROUND and higher then Z_INDEX_BACKGROUND */
  z-index: 1000;
  cursor: inherit;
  opacity: 1;
}
</style>
