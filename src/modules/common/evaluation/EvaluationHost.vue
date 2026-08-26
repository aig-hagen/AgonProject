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
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { ref, watch } from 'vue'

import type { EvaluationKind } from '@/modules/common/evaluation/types'
import BottomSheet from '@/modules/common/window/BottomSheet.vue'

export interface EvaluationChip {
  id: string
  label: string
  kind: EvaluationKind
}

// Compact-only host: one sheet over all saved evaluation configs. Owns navigation
// (the chip row), add/remove, and which config is active; each kind's parameter and
// result body is rendered by the module through the default slot.
const { chips, addKinds = ['extension'] } = defineProps<{
  chips: EvaluationChip[]
  /** Kinds the module lets you add; more than one shows a picker on the add button. */
  addKinds?: EvaluationKind[]
}>()

const open = defineModel<boolean>('open', { required: true })
const activeId = defineModel<string | undefined>('activeId', { default: undefined })

const emit = defineEmits<{ add: [kind: EvaluationKind]; remove: [id: string] }>()

// Icon-free kind marker; on the chip row and the add picker.
const KIND_GLYPH: Record<EvaluationKind, string> = {
  extension: '{ }',
  ranking: '≻',
  serialisation: '→',
}
const KIND_LABEL: Record<EvaluationKind, string> = {
  extension: 'Extension semantics',
  ranking: 'Ranking semantics',
  serialisation: 'Serialisation',
}

// With a single addable kind the add button adds it directly; with several it toggles
// an inline picker (a dropdown would clip against the sheet's scroll container).
const addMenuOpen = ref(false)

function onAddClick() {
  if (addKinds.length <= 1) emit('add', addKinds[0] ?? 'extension')
  else addMenuOpen.value = !addMenuOpen.value
}

function chooseKind(kind: EvaluationKind) {
  addMenuOpen.value = false
  emit('add', kind)
}

watch(open, (isOpen) => {
  if (!isOpen) addMenuOpen.value = false
})

function selectLast() {
  activeId.value = chips.length > 0 ? chips[chips.length - 1]!.id : undefined
}

// A config highlights the canvas only while the sheet is open (mirrors desktop's
// active-window behaviour); closing the sheet clears the active selection.
watch(open, (isOpen) => {
  if (!isOpen) activeId.value = undefined
  else if (!chips.some((c) => c.id === activeId.value)) selectLast()
})

// While open, keep a valid config selected as chips are added or removed; a newly
// added config becomes active.
watch(
  () => chips.map((c) => c.id).join('|'),
  () => {
    if (open.value && !chips.some((c) => c.id === activeId.value)) selectLast()
  },
)
</script>

<template>
  <!-- Non-modal docked sheet: the graph stays visible and interactive above it, and
       tapping the canvas does not dismiss it. Starts at a low peek, drag up for full. -->
  <BottomSheet v-model:open="open" title="Evaluate" :modal="false" peek-height="50dvh">
    <div class="flex flex-col gap-3 pb-4">
      <div class="flex items-center gap-2 -mx-1 px-1 overflow-x-auto">
        <div class="flex-1 min-w-0 flex gap-2 py-1">
          <button
            v-for="chip in chips"
            :key="chip.id"
            class="flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-medium whitespace-nowrap shrink-0 transition-colors"
            :class="
              chip.id === activeId
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-base-300 bg-base-100 text-base-content/70'
            "
            :aria-pressed="chip.id === activeId"
            @click="activeId = chip.id"
          >
            <span class="font-mono text-xs opacity-70">{{ KIND_GLYPH[chip.kind] }}</span>
            {{ chip.label }}
          </button>
        </div>
        <button
          v-if="activeId"
          class="grid place-items-center size-9 rounded-full border border-base-300 bg-base-100 text-error/80 shrink-0"
          aria-label="Remove evaluation"
          @click="emit('remove', activeId)"
        >
          <TrashIcon class="size-5" />
        </button>
        <button
          class="grid place-items-center size-9 rounded-full border shrink-0 transition-colors"
          :class="addMenuOpen ? 'border-primary bg-primary/10 text-primary' : 'border-base-300 bg-base-100'"
          aria-label="Add evaluation"
          :aria-expanded="addKinds.length > 1 ? addMenuOpen : undefined"
          @click="onAddClick"
        >
          <PlusIcon class="size-5" />
        </button>
      </div>

      <!-- Inline kind picker (multi-kind modules only). -->
      <div v-if="addMenuOpen" class="flex flex-col gap-1 rounded-field bg-base-200/60 p-1">
        <button
          v-for="kind in addKinds"
          :key="kind"
          class="btn btn-sm btn-ghost justify-start gap-2"
          @click="chooseKind(kind)"
        >
          <span class="font-mono text-[0.7rem] opacity-70 w-4 text-center">{{
            KIND_GLYPH[kind]
          }}</span>
          {{ KIND_LABEL[kind] }}
        </button>
      </div>

      <div v-if="chips.length === 0 && !addMenuOpen" class="flex flex-col items-center gap-3 py-10 text-center">
        <p class="opacity-60 text-sm">No evaluation yet.</p>
        <button class="btn btn-primary gap-2" @click="onAddClick">
          <PlusIcon class="size-5" /> Add evaluation
        </button>
      </div>

      <slot v-if="chips.length > 0" :active-id="activeId" />
    </div>
  </BottomSheet>
</template>
