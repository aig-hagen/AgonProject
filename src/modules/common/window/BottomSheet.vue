<!--
  AgonProject - The platform to explore different approaches to formal argumentation.

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
import { XMarkIcon } from '@heroicons/vue/24/solid'
import { computed, nextTick, ref, useId, useTemplateRef, watch } from 'vue'

import { useVisualViewport } from '@/modules/common/layout/useVisualViewport'

const open = defineModel<boolean>('open', { required: true })

const {
  title,
  fullHeight = false,
  modal = true,
  peekHeight,
} = defineProps<{
  title: string
  /** Start expanded to the full snap point instead of sizing to content. */
  fullHeight?: boolean
  /** Modal (default): a backdrop blocks and dismisses. Non-modal: no backdrop, so
      the content behind the sheet stays visible and interactive. */
  modal?: boolean
  /** When set, the sheet gets a low "peek" snap at this CSS height (e.g. '48dvh')
      as its default, draggable up to full — for a docked, non-modal sheet. */
  peekHeight?: string
}>()

const emit = defineEmits<{ close: [] }>()

const sheet = useTemplateRef<HTMLElement>('sheet')
const titleId = useId()

const { keyboardInset } = useVisualViewport()

// Snap points: content-driven, the low peek height, or full.
type Snap = 'content' | 'peek' | 'full'
function initialSnap(): Snap {
  if (fullHeight) return 'full'
  if (peekHeight !== undefined) return 'peek'
  return 'content'
}
const snap = ref<Snap>(initialSnap())
const panelHeight = computed(() =>
  snap.value === 'full'
    ? 'var(--sheet-max-height)'
    : snap.value === 'peek'
      ? peekHeight
      : undefined,
)
// Downward drag offset in px while a drag is in progress; 0 when settled.
const dragOffset = ref(0)
const dragging = ref(false)

// Beyond this downward drag on release, the sheet is dismissed.
const CLOSE_THRESHOLD = 120
// Dragging the handle up past this expands to the full snap point.
const EXPAND_THRESHOLD = 60

let restoreFocus: HTMLElement | null = null
let dragStartY = 0
let pointerId: number | null = null

const bottomInset = computed(() => `max(env(safe-area-inset-bottom), ${keyboardInset.value}px)`)

function close() {
  open.value = false
}

watch(open, async (isOpen, wasOpen) => {
  if (isOpen && !wasOpen) {
    restoreFocus = document.activeElement as HTMLElement | null
    snap.value = initialSnap()
    dragOffset.value = 0
    // A non-modal sheet must not steal focus from the content behind it.
    if (modal) {
      await nextTick()
      focusFirst()
    }
  } else if (!isOpen && wasOpen) {
    emit('close')
    restoreFocus?.focus?.()
    restoreFocus = null
  }
})

function focusableElements(): HTMLElement[] {
  const root = sheet.value
  if (!root) return []
  return [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => el.offsetParent !== null || el === document.activeElement)
}

function focusFirst() {
  const [first] = focusableElements()
  ;(first ?? sheet.value)?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    close()
    return
  }
  // Only a modal sheet traps Tab; a docked sheet lets focus reach the canvas behind.
  if (event.key !== 'Tab' || !modal) return
  const focusable = focusableElements()
  if (focusable.length === 0) {
    event.preventDefault()
    return
  }
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === sheet.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

function onHandlePointerDown(event: PointerEvent) {
  dragging.value = true
  dragStartY = event.clientY
  pointerId = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onHandlePointerMove(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== pointerId) return
  const delta = event.clientY - dragStartY
  dragOffset.value = Math.max(0, delta)
  if (delta < -EXPAND_THRESHOLD) snap.value = 'full'
}

function onHandlePointerUp(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== pointerId) return
  dragging.value = false
  pointerId = null
  // From full, a downward drag settles to the peek snap (never straight to closed)
  // when the sheet has one; otherwise a far enough drag dismisses it.
  if (snap.value === 'full' && peekHeight !== undefined) {
    if (dragOffset.value > EXPAND_THRESHOLD) snap.value = 'peek'
  } else if (dragOffset.value > CLOSE_THRESHOLD) {
    close()
  }
  dragOffset.value = 0
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet-fade">
      <div
        v-if="open && modal"
        class="sheet-backdrop fixed inset-0 z-50 bg-black/40"
        @click="close"
        aria-hidden="true"
      ></div>
    </Transition>
    <Transition name="sheet-slide">
      <div
        v-if="open"
        ref="sheet"
        role="dialog"
        :aria-modal="modal"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="sheet-panel fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-base-100 shadow-lg/30 outline-none"
        :class="{ 'sheet-panel--dragging': dragging }"
        :style="{
          transform: `translateY(${dragOffset}px)`,
          height: panelHeight,
          paddingBottom: bottomInset,
          '--sheet-max-height': '90dvh',
        }"
        @keydown="onKeydown"
      >
        <div
          class="sheet-grab shrink-0 flex justify-center pt-2 pb-1 cursor-grab touch-none"
          @pointerdown="onHandlePointerDown"
          @pointermove="onHandlePointerMove"
          @pointerup="onHandlePointerUp"
          @pointercancel="onHandlePointerUp"
        >
          <span class="block h-1 w-9 rounded-full bg-base-content/25" aria-hidden="true"></span>
        </div>
        <header class="shrink-0 flex items-center gap-2 px-4 pb-2">
          <h2 :id="titleId" class="flex-1 min-w-0 truncate text-base font-medium">{{ title }}</h2>
          <slot name="header-actions" />
          <button
            type="button"
            class="btn btn-square btn-sm btn-ghost shrink-0"
            aria-label="Close"
            @click="close"
          >
            <XMarkIcon class="size-5" />
          </button>
        </header>
        <div class="sheet-body flex-1 overflow-y-auto overscroll-contain px-4">
          <slot :expanded="snap === 'full'" />
        </div>
        <footer v-if="$slots.footer" class="shrink-0 border-t border-base-300 px-4 pt-3">
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-panel {
  max-height: var(--sheet-max-height);
  touch-action: none;
}

.sheet-body {
  touch-action: pan-y;
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.2s ease;
}

.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}

.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

/* Not while dragging: the pointer drives the transform directly. */
.sheet-panel:not(.sheet-panel--dragging) {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%) !important;
}

@media (prefers-reduced-motion: reduce) {
  .sheet-fade-enter-active,
  .sheet-fade-leave-active,
  .sheet-slide-enter-active,
  .sheet-slide-leave-active,
  .sheet-panel:not(.sheet-panel--dragging) {
    transition: none;
  }
}
</style>
