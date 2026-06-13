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
<script setup lang="ts">
import '@interactjs/auto-start'
import '@interactjs/actions/drag'
import '@interactjs/actions/resize'
import '@interactjs/modifiers'

import { AdjustmentsHorizontalIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import interact from '@interactjs/interact'
import { useEventListener } from '@vueuse/core'
import { nextTick, onMounted, ref, useTemplateRef, watchEffect } from 'vue'

import { POINTER_SHIELD_Z_INDEX, useZIndex } from '@/modules/common/window/useZIndex'

const floating = useTemplateRef('floating')
const content = useTemplateRef('content')
const header = useTemplateRef('header')
const pointerShield = useTemplateRef('pointerShield')
const open = defineModel('open', { required: true })
const compact = defineModel('compact', { default: false })
const emit = defineEmits<{ focus: [] }>()
const { title, initialPosition, intitalSize, compactable = false } = defineProps<{
  title: string
  initialPosition: { x: number; y: number }
  intitalSize: { width: number; height: number }
  compactable?: boolean
}>()

const position = { ...initialPosition }
const minimized = ref(false)
let savedMinimizeHeight = ''
let savedCompactHeight = ''
let interactable: ReturnType<typeof interact> | null = null

function toggleMinimize() {
  if (!minimized.value) {
    savedMinimizeHeight = floating.value!.style.height
    floating.value!.style.height = ''
    minimized.value = true
    interactable?.resizable({ enabled: false })
  } else {
    floating.value!.style.height = savedMinimizeHeight
    minimized.value = false
    interactable?.resizable({ enabled: true })
  }
}

function toggleCompact() {
  if (!compact.value) {
    savedCompactHeight = floating.value!.style.height
    compact.value = true
    nextTick(() => {
      floating.value!.style.height = ''
      floating.value!.style.height = floating.value!.offsetHeight + 'px'
    })
  } else {
    compact.value = false
    floating.value!.style.height = savedCompactHeight
  }
}

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
  floating.value.style.width = intitalSize.width + 'px'
  floating.value.style.height = intitalSize.height + 'px'
  pointerShield.value!.style.display = 'none'
  interactable = interact(floating.value)
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

const { zIndex: zIndexValue, focusIn, focusOut } = useZIndex()

useEventListener(floating, 'focus', () => {
  const style = floating.value?.style
  if (style === undefined) {
    return
  }
  focusIn()
  emit('focus')
})

useEventListener(floating, 'focusout', (event) => {
  const style = floating.value?.style
  if (style === undefined) {
    return
  }

  const relatedTarget = event.relatedTarget as Node | null
  if (floating.value?.contains(relatedTarget)) return
  focusOut()
})

watchEffect(() => {
  const style = floating.value?.style
  if (style === undefined) {
    return
  }
  style.zIndex = zIndexValue.value
})

watchEffect(async () => {
  if (open.value) {
    await nextTick()
    floating.value?.focus()
  }
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
      class="floating-window-header bg-base-200 flex justify-between py-1 pl-4 pr-2"
      :class="{ 'border-b border-base-300': !minimized }"
    >
      <div class="flex-1 truncate mr-2 self-center">{{ title }}</div>
      <div class="flex gap-0.5">
        <button
          v-if="compactable"
          @click="toggleCompact"
          class="btn btn-square btn-xs btn-ghost"
          :class="{ 'opacity-40': compact }"
          :title="compact ? 'Show parameters' : 'Hide parameters'"
        >
          <AdjustmentsHorizontalIcon class="size-4" />
        </button>
        <button @click="toggleMinimize" class="btn btn-square btn-xs btn-ghost">
          <ChevronUpIcon v-if="minimized" class="size-4" />
          <ChevronDownIcon v-else class="size-4" />
        </button>
        <button @click="open = false" class="btn btn-square btn-xs btn-ghost">
          <XMarkIcon class="size-4" />
        </button>
      </div>
    </div>
    <div v-show="!minimized" ref="content" class="floating-window-content bg-base-100 overflow-x-auto flex-1">
      <slot :compact="compact" />
    </div>
  </div>
  <div
    ref="pointerShield"
    class="pointer-shield"
    :style="{
      zIndex: POINTER_SHIELD_Z_INDEX,
    }"
  ></div>
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
  cursor: inherit;
  opacity: 1;
}
</style>
