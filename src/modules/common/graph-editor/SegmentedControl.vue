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
<script setup lang="ts" generic="K extends string">
import { useResizeObserver } from '@vueuse/core'
import { type Component, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

export interface SegmentedOption<K extends string> {
  key: K
  icon?: Component
  label?: string
  // Accessible name and hover title; defaults to the label.
  title?: string
  disabled?: boolean
  // Tooltip bubble, e.g. why an option is disabled.
  tip?: string
}

const { options, vertical = false } = defineProps<{
  options: SegmentedOption<K>[]
  vertical?: boolean
  ariaLabel?: string
}>()
const selected = defineModel<K>({ required: true })

const group = useTemplateRef<HTMLElement>('group')
const items = ref<Partial<Record<string, HTMLElement>>>({})
const thumb = ref<{ x: number; y: number; width: number; height: number } | undefined>()
// Only user clicks slide the thumb; programmatic changes and re-layouts snap.
const animate = ref(false)

// Layout offsets, not screen rects: immune to ancestor transforms (e.g. tab transitions).
function placeThumb() {
  const item = items.value[selected.value]
  if (!item || item.offsetParent === null) return
  thumb.value = {
    x: item.offsetLeft,
    y: item.offsetTop,
    width: item.offsetWidth,
    height: item.offsetHeight,
  }
}

function snapThumb() {
  animate.value = false
  placeThumb()
}

function choose(key: K) {
  if (key === selected.value) return
  animate.value = true
  selected.value = key
}

onMounted(placeThumb)
useResizeObserver(group, snapThumb)
watch(selected, async () => {
  await nextTick()
  placeThumb()
})
watch(
  () => options.map((option) => option.key).join(),
  async () => {
    await nextTick()
    snapThumb()
  },
)
</script>

<template>
  <div
    ref="group"
    class="relative flex w-fit gap-0.5 rounded-full border border-base-300 bg-base-100/80 shadow-lg backdrop-blur-md"
    :class="[
      vertical ? 'flex-col' : 'items-center',
      options.some((o) => o.label) ? 'p-1' : 'p-0.5',
    ]"
    role="radiogroup"
    :aria-label="ariaLabel"
  >
    <span
      v-if="thumb"
      class="absolute top-0 left-0 rounded-full bg-primary"
      :class="{ 'transition-[translate,width,height] duration-300 ease-out': animate }"
      :style="{
        translate: `${thumb.x}px ${thumb.y}px`,
        width: `${thumb.width}px`,
        height: `${thumb.height}px`,
      }"
      aria-hidden="true"
      @transitionend="animate = false"
    />
    <span
      v-for="option in options"
      :key="option.key"
      :ref="(el) => (items[option.key] = (el as HTMLElement | null) ?? undefined)"
      class="flex"
      :class="{ 'tooltip tooltip-top': option.tip }"
      :data-tip="option.tip"
    >
      <button
        class="relative flex cursor-pointer items-center justify-center gap-1.5 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        :class="[
          option.label ? 'h-8 px-3.5 text-[0.8125rem]' : 'size-7',
          selected === option.key
            ? 'text-primary-content'
            : 'text-base-content/60 enabled:hover:text-base-content',
        ]"
        role="radio"
        :aria-checked="selected === option.key"
        :aria-label="option.label ? undefined : (option.title ?? option.key)"
        :title="option.tip ? undefined : option.title"
        :disabled="option.disabled && selected !== option.key"
        @click="choose(option.key)"
      >
        <component
          :is="option.icon"
          v-if="option.icon"
          :class="option.label ? 'size-4' : 'size-[1.125rem]'"
        />
        {{ option.label }}
      </button>
    </span>
  </div>
</template>
