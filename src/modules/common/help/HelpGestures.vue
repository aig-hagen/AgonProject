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
import {
  AdjustmentsHorizontalIcon,
  ArrowLongRightIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  CursorArrowRaysIcon,
  PlusCircleIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { type Component, computed } from 'vue'

const {
  linkNames,
  allowHyperLinkCreation = false,
  nodeTapAction = 'Rename it',
} = defineProps<{
  linkNames: string[]
  allowHyperLinkCreation?: boolean
  /** Full primary node-tap description for this module (see the primary-action
      table), e.g. `Rename it` or `Open its acceptance condition`. */
  nodeTapAction?: string
}>()

const linkNamesSlash = computed(() => linkNames.join('/'))
const hasTypes = computed(() => linkNames.length > 1)

const nodeTapActionLower = computed(
  () => nodeTapAction.charAt(0).toLowerCase() + nodeTapAction.slice(1),
)

interface GestureRow {
  icon: Component
  title: string
  desc: string
  danger?: boolean
}

const rows = computed<GestureRow[]>(() => {
  const list: GestureRow[] = [
    { icon: PlusCircleIcon, title: 'Double-tap the canvas', desc: 'Add a new argument' },
    {
      icon: CursorArrowRaysIcon,
      title: 'Tap an argument',
      desc: `Open its action bar — ${nodeTapActionLower.value}, delete and more`,
    },
    {
      icon: ArrowLongRightIcon,
      title: 'Hold + drag to another argument',
      desc: `Create a ${linkNamesSlash.value} between them`,
    },
  ]

  if (allowHyperLinkCreation) {
    list.push({
      icon: PlusCircleIcon,
      title: 'Add to attack',
      desc: `Tap an argument and choose "Add to attack" — or long-press it — to build a source set, then hold + drag from a highlighted source to the target`,
    })
  }

  if (hasTypes.value) {
    list.push({
      icon: AdjustmentsHorizontalIcon,
      title: 'Bottom-left selector',
      desc: `Pick which ${linkNamesSlash.value} you create next`,
    })
    list.push({
      icon: CursorArrowRaysIcon,
      title: `Tap a ${linkNamesSlash.value}`,
      desc: 'Open its action bar to switch type or delete it — or long-press to delete',
    })
  } else {
    list.push({
      icon: TrashIcon,
      title: `Long-press a ${linkNamesSlash.value}`,
      desc: 'Delete it — or tap it and use the action bar',
      danger: true,
    })
  }

  list.push(
    {
      icon: ArrowsPointingOutIcon,
      title: 'Drag with one finger',
      desc: 'Pan the canvas — pinch to zoom',
    },
    { icon: ArrowsPointingInIcon, title: 'Fit-view button', desc: 'Recenter the view' },
    { icon: SparklesIcon, title: 'Relayout button', desc: 'Auto-arrange the graph' },
  )

  return list
})
</script>

<template>
  <ul class="flex flex-col">
    <li
      v-for="(row, index) in rows"
      :key="index"
      class="flex items-center gap-3.5 py-3 border-b border-base-200 last:border-b-0"
    >
      <span
        class="grid place-items-center size-10 shrink-0 rounded-xl bg-base-200"
        :class="row.danger ? 'text-error' : 'text-primary/80'"
      >
        <component :is="row.icon" class="size-[1.4rem]" />
      </span>
      <span class="min-w-0">
        <span class="block text-sm font-semibold">{{ row.title }}</span>
        <span class="block text-xs text-base-content/60 mt-0.5">{{ row.desc }}</span>
      </span>
    </li>
  </ul>
</template>
