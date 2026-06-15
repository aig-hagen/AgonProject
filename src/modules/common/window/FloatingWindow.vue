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
const { title, initialPosition, intitalSize, compactable = false, instanceOffset = 0, storageKey } = defineProps<{
  title: string
  initialPosition: { x: number; y: number }
  intitalSize: { width: number; height: number }
  compactable?: boolean
  instanceOffset?: number
  storageKey?: string
}>()

const position = { ...initialPosition }
const minimized = ref(false)
const isMobileLayout = ref(false)
let savedMinimizeHeight = ''
let savedMinimizeWidth = ''
let savedCompactHeight = ''
let interactable: ReturnType<typeof interact> | null = null

interface StoredWindowState {
  x: number
  y: number
  width: number
  height: number
}

function saveWindowState() {
  if (!storageKey) return
  const el = floating.value
  if (!el) return
  const w = parseFloat(el.style.width) || intitalSize.width
  const h = parseFloat(el.style.height) || intitalSize.height
  localStorage.setItem(storageKey, JSON.stringify({ x: position.x, y: position.y, width: w, height: h } satisfies StoredWindowState))
}

function loadWindowState(): StoredWindowState | null {
  if (!storageKey) return null
  const raw = localStorage.getItem(storageKey)
  if (!raw) return null
  try { return JSON.parse(raw) as StoredWindowState } catch { return null }
}

function toggleMinimize() {
  if (!minimized.value) {
    savedMinimizeHeight = floating.value!.style.height
    savedMinimizeWidth = floating.value!.style.width
    floating.value!.style.height = ''
    if (!isMobileLayout.value) {
      floating.value!.style.width = 'fit-content'
    }
    minimized.value = true
    interactable?.resizable({ enabled: false })
  } else {
    floating.value!.style.height = savedMinimizeHeight
    floating.value!.style.width = savedMinimizeWidth
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
  saveWindowState()
}

onMounted(() => {
  const el = floating.value
  if (el === null) {
    throw Error('Window ref not set.')
  }
  pointerShield.value!.style.display = 'none'

  const stored = loadWindowState()
  const mobile = window.innerWidth < 640
  isMobileLayout.value = mobile

  if (mobile) {
    const parent = el.parentElement!
    const parentW = parent.clientWidth
    const parentH = parent.clientHeight
    const mobileH = Math.min(intitalSize.height, Math.floor(parentH * 0.45))
    const mobileY = parentH - mobileH - instanceOffset * (mobileH + 4)

    position.x = 0
    position.y = stored?.y ?? mobileY

    el.style.transform = `translate(0px, ${position.y}px)`
    el.style.width = `${parentW}px`
    el.style.height = `${stored?.height ?? mobileH}px`

    interactable = interact(el)
      .draggable({
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'parent',
            elementRect: { left: 0, right: 1, top: 0, bottom: 1 },
          }),
        ],
        allowFrom: header.value!,
        listeners: {
          start: startDragOrResize,
          move(event) {
            position.y += event.dy
            event.target.style.transform = `translate(0px, ${position.y}px)`
          },
          end: endDragOrResize,
        },
      })
      .resizable({
        modifiers: [
          interact.modifiers.restrictEdges({ outer: 'parent' }),
          interact.modifiers.restrictSize({ min: { width: parentW, height: 64 } }),
        ],
        edges: { top: true, left: false, bottom: false, right: false },
        listeners: {
          start: startDragOrResize,
          move(event) {
            position.y += event.deltaRect.top
            const { height } = event.rect
            event.target.style.transform = `translate(0px, ${position.y}px)`
            event.target.style.height = `${height}px`
            event.target.style.width = `${parentW}px`
          },
          end: endDragOrResize,
        },
      })
  } else {
    position.x = stored?.x ?? initialPosition.x
    position.y = stored?.y ?? initialPosition.y
    el.style.transform = `translate(${position.x}px, ${position.y}px)`
    el.style.width = (stored?.width ?? intitalSize.width) + 'px'
    el.style.height = (stored?.height ?? intitalSize.height) + 'px'

    interactable = interact(el)
      .draggable({
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'parent',
            elementRect: { left: 0, right: 1, top: 0, bottom: 1 },
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
          interact.modifiers.restrictEdges({ outer: 'parent' }),
          interact.modifiers.restrictSize({ min: { width: 92, height: 64 } }),
        ],
        allowFrom: el,
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
  }
})

function resizeToFitContent(maxHeight = Math.min(window.innerHeight * 0.8, 700)) {
  if (minimized.value || isMobileLayout.value) return
  const el = floating.value
  if (!el) return
  el.style.height = ''
  const naturalHeight = el.offsetHeight
  el.style.height = `${Math.min(naturalHeight, maxHeight)}px`
  saveWindowState()
}

defineExpose({ resizeToFitContent })

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
      <div class="flex-1 mr-2 self-center" :class="{ truncate: !minimized }">{{ title }}</div>
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
    <div v-show="!minimized" ref="content" class="floating-window-content bg-base-100 overflow-x-auto overflow-y-auto flex-1">
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
