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
import { CheckIcon, ChevronUpIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import { onClickOutside } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'

import type { AbaView } from '@/modules/assumption-based-argumentation/views/editorState'
import {
  FLAT_ONLY_REASON,
  viewOptions,
} from '@/modules/assumption-based-argumentation/views/viewOptions'

const { flat } = defineProps<{ flat: boolean }>()
const view = defineModel<AbaView>({ required: true })

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')
onClickOutside(root, () => (open.value = false))

const options = computed(() => viewOptions(flat))
const active = computed(() => options.value.find((option) => option.key === view.value)!)

function select(key: AbaView) {
  view.value = key
  open.value = false
}
</script>

<template>
  <div ref="root" class="relative">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      leave-active-class="transition duration-100 ease-in"
      enter-from-class="opacity-0 translate-y-1"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="open"
        class="absolute bottom-full left-0 mb-1.5 w-52 rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
        role="radiogroup"
        aria-label="Canvas view"
      >
        <template v-for="(option, index) in options" :key="option.key">
          <div v-if="index === 1" class="mx-2 my-0.5 h-px bg-base-300" />
          <button
            class="grid w-full cursor-pointer grid-cols-[1rem_1fr_auto] items-center gap-x-2 rounded-lg px-2 py-1.5 text-left text-[0.8125rem] font-medium disabled:cursor-not-allowed disabled:opacity-45"
            :class="view === option.key ? 'bg-primary/10' : 'enabled:hover:bg-base-200'"
            role="radio"
            :aria-checked="view === option.key"
            :disabled="option.flatOnly && !flat && view !== option.key"
            @click="select(option.key)"
          >
            <component
              :is="option.icon"
              class="row-span-2 size-4"
              :class="view === option.key ? 'text-primary' : 'text-base-content/60'"
            />
            {{ option.label }}
            <CheckIcon
              class="row-span-2 size-3.5 text-primary"
              :class="{ invisible: view !== option.key }"
            />
            <small
              class="col-start-2 text-[0.6875rem] leading-tight font-normal text-base-content/60"
            >
              {{ option.flatOnly && !flat ? FLAT_ONLY_REASON : option.description }}
            </small>
          </button>
        </template>
      </div>
    </Transition>
    <button
      class="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-base-300 bg-base-100/85 pr-2.5 pl-3 text-sm font-medium shadow-md backdrop-blur-md"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="`Canvas view: ${active.label}`"
      @click="open = !open"
    >
      <component :is="active.icon" class="size-4 text-primary" />
      {{ active.label }}
      <LockClosedIcon v-if="view !== 'theory'" class="size-3.5 text-base-content/60" />
      <ChevronUpIcon
        class="size-3.5 text-base-content/60 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>
  </div>
</template>
