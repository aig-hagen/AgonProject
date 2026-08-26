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
<script setup lang="ts" generic="T extends { key: string; displayName: string }">
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { computed, nextTick, ref, useId, useTemplateRef, watch } from 'vue'

export interface GroupedSelectGroup<T> {
  key: string
  displayName: string
  options: T[]
}

const {
  modelValue,
  groups,
  label,
  fullWidth = false,
} = defineProps<{
  modelValue: T
  groups: GroupedSelectGroup<T>[]
  label?: string
  fullWidth?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const instanceId = useId()
const isOpen = ref(false)
const activeKey = ref<string | null>(null)

const triggerEl = useTemplateRef('trigger')
const wrapperEl = useTemplateRef('wrapper')
const panelEl = useTemplateRef('panel')

const { floatingStyles } = useFloating(triggerEl, panelEl, {
  placement: 'bottom-start',
  middleware: [offset(4), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
})

const flatOptions = computed(() => groups.flatMap((g) => g.options))
const activeOptionId = computed(() =>
  activeKey.value === null ? undefined : optionId(activeKey.value),
)

function optionId(key: string): string {
  return `grouped-select-${instanceId}-${key}`
}

function open() {
  if (isOpen.value) return
  isOpen.value = true
  activeKey.value = modelValue.key
  nextTick(() => {
    panelEl.value?.focus()
    panelEl.value
      ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(modelValue.key))}`)
      ?.scrollIntoView({ block: 'nearest' })
  })
}

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  triggerEl.value?.focus()
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function select(option: T) {
  emit('update:modelValue', option)
  close()
}

function moveActive(delta: number) {
  const options = flatOptions.value
  if (options.length === 0) return
  const currentIndex = options.findIndex((o) => o.key === activeKey.value)
  const nextIndex = (currentIndex + delta + options.length) % options.length
  activeKey.value = options[nextIndex]!.key
  scrollActiveIntoView()
}

function scrollActiveIntoView() {
  nextTick(() => {
    if (activeKey.value === null) return
    panelEl.value
      ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(activeKey.value))}`)
      ?.scrollIntoView({ block: 'nearest' })
  })
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
    e.preventDefault()
    open()
  }
}

let typeaheadBuffer = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | null = null

function onTypeahead(e: KeyboardEvent) {
  if (e.key.length !== 1 || e.altKey || e.ctrlKey || e.metaKey) return
  typeaheadBuffer += e.key.toLowerCase()
  if (typeaheadTimer !== null) clearTimeout(typeaheadTimer)
  typeaheadTimer = setTimeout(() => {
    typeaheadBuffer = ''
  }, 500)
  const match = flatOptions.value.find((o) =>
    o.displayName.toLowerCase().startsWith(typeaheadBuffer),
  )
  if (match !== undefined) {
    activeKey.value = match.key
    scrollActiveIntoView()
  }
}

function onListboxKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      moveActive(1)
      break
    case 'ArrowUp':
      e.preventDefault()
      moveActive(-1)
      break
    case 'Home':
      e.preventDefault()
      activeKey.value = flatOptions.value[0]?.key ?? null
      scrollActiveIntoView()
      break
    case 'End':
      e.preventDefault()
      activeKey.value = flatOptions.value[flatOptions.value.length - 1]?.key ?? null
      scrollActiveIntoView()
      break
    case 'Enter':
    case ' ': {
      e.preventDefault()
      const option = flatOptions.value.find((o) => o.key === activeKey.value)
      if (option !== undefined) select(option)
      break
    }
    case 'Escape':
      e.preventDefault()
      close()
      break
    case 'Tab':
      close()
      break
    default:
      onTypeahead(e)
  }
}

function onDocumentMousedown(e: MouseEvent) {
  const target = e.target as Node
  if (wrapperEl.value?.contains(target) || panelEl.value?.contains(target)) return
  close()
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', onDocumentMousedown)
  } else {
    document.removeEventListener('mousedown', onDocumentMousedown)
  }
})
</script>

<template>
  <div ref="wrapper" :class="fullWidth ? 'block w-full' : 'inline-block'">
    <label
      ref="trigger"
      class="select select-sm gap-1 bg-base-200"
      :class="[
        fullWidth ? 'w-full justify-between' : 'w-fit',
        { 'outline-2 outline-primary/50': isOpen },
      ]"
      tabindex="0"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="`grouped-select-${instanceId}-listbox`"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span v-if="label" class="label">{{ label }}</span>
      <span class="truncate">{{ modelValue.displayName }}</span>
    </label>
    <Teleport to="body">
      <div
        v-if="isOpen"
        :id="`grouped-select-${instanceId}-listbox`"
        ref="panel"
        :style="[floatingStyles, { zIndex: 9000 }]"
        class="min-w-48 max-h-80 overflow-y-auto rounded-box bg-base-100 border border-base-300 shadow-lg py-1 focus:outline-none"
        role="listbox"
        tabindex="-1"
        :aria-activedescendant="activeOptionId"
        @keydown="onListboxKeydown"
      >
        <template v-for="(group, groupIndex) in groups" :key="group.key">
          <div
            v-if="group.options.length"
            class="px-3 pt-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-primary/70"
            :class="{ 'mt-1 border-t border-base-200': groupIndex > 0 }"
          >
            {{ group.displayName }}
          </div>
          <div
            v-for="option in group.options"
            :id="optionId(option.key)"
            :key="option.key"
            role="option"
            :aria-selected="option.key === modelValue.key"
            class="px-3 py-1 text-sm cursor-pointer"
            :class="{
              'bg-primary text-primary-content': option.key === activeKey,
              'font-semibold': option.key === modelValue.key && option.key !== activeKey,
            }"
            @click="select(option)"
            @mousemove="activeKey = option.key"
          >
            {{ option.displayName }}
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>
