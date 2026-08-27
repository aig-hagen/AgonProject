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
import { CheckIcon, ChevronDownIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { XMarkIcon } from '@heroicons/vue/24/solid'
import { computed, inject, nextTick, provide, ref, watch } from 'vue'

import {
  EVALUATION_DETENT_KEY,
  type EvaluationDetentLayout,
} from '@/modules/common/evaluation/hostContext'
import KindIcon from '@/modules/common/evaluation/KindIcon.vue'
import type { EvaluationKind } from '@/modules/common/evaluation/types'
import { SHEET_REFIT_KEY } from '@/modules/common/graph-editor/graphEditor'
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

const KIND_LABEL: Record<EvaluationKind, string> = {
  extension: 'Extension semantics',
  ranking: 'Ranking semantics',
  serialisation: 'Serialisation',
}

// Snap detents as fractions of the viewport height (compact / standard / full).
const SNAP_POINTS = [0.28, 0.48, 0.9]

// Detent index (0/1/2) from the sheet → layout the mobile body reads to fold the
// selector row / glossary away at the compact detent.
const detentIndex = ref(0)
const detentLayout = computed<EvaluationDetentLayout>(() =>
  detentIndex.value <= 0 ? 'compact' : detentIndex.value === 1 ? 'standard' : 'full',
)
provide(EVALUATION_DETENT_KEY, detentLayout)

// Fit the graph into the band above the sheet only when it reaches the standard (half)
// detent — the everyday view where the graph would otherwise sit under the sheet. Compact
// leaves the graph alone (it's mostly visible), and closing / collapsing does not re-fit,
// so the user's view is only nudged when expanding to half.
const refitAboveSheet = inject(SHEET_REFIT_KEY, null)
watch([open, detentIndex], () => {
  if (!refitAboveSheet || !open.value || detentLayout.value !== 'standard') return
  nextTick(() => refitAboveSheet(SNAP_POINTS[1]!))
})

// The active config, surfaced as the header pill (kind glyph + name + chevron).
const activeChip = computed(() => chips.find((c) => c.id === activeId.value))

// The header pill drops the saved-config list (switch / delete / add). With a single
// addable kind the add row adds directly; with several it toggles an inline picker.
const listOpen = ref(false)
const addMenuOpen = ref(false)

// A newly created eval needs its selectors, so lift a compact sheet to standard.
function ensureStandardDetent() {
  if (detentIndex.value < 1) detentIndex.value = 1
}

function onAddClick() {
  if (addKinds.length <= 1) {
    emit('add', addKinds[0] ?? 'extension')
    listOpen.value = false
    ensureStandardDetent()
  } else {
    // Multi-kind: the picker lives in the dropped list, so open it to reveal the choices.
    listOpen.value = true
    addMenuOpen.value = true
  }
}

function chooseKind(kind: EvaluationKind) {
  addMenuOpen.value = false
  listOpen.value = false
  emit('add', kind)
  ensureStandardDetent()
}

function selectChip(id: string) {
  activeId.value = id
  listOpen.value = false
}

watch(open, (isOpen) => {
  if (!isOpen) {
    addMenuOpen.value = false
    listOpen.value = false
  }
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
       tapping the canvas does not dismiss it. Three detents — compact / standard / full. -->
  <BottomSheet
    v-model:open="open"
    v-model:detent-index="detentIndex"
    title="Evaluate"
    :modal="false"
    :snap-points="SNAP_POINTS"
  >
    <!-- Header-as-switcher: the active config IS the header; the chevron drops the
         full saved-config list. One control does what the pill strip + title did. -->
    <template #header="{ close }">
      <button
        type="button"
        class="flex-1 min-w-0 flex items-center gap-2 h-10 px-3 rounded-xl border text-left transition-colors"
        :class="listOpen ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-200/60'"
        :aria-expanded="listOpen"
        @click="listOpen = !listOpen"
      >
        <KindIcon
          v-if="activeChip"
          :kind="activeChip.kind"
          class="size-[1.05rem] shrink-0 text-primary"
        />
        <span class="flex-1 min-w-0 truncate text-sm font-semibold">{{
          activeChip?.label ?? 'Evaluate'
        }}</span>
        <ChevronDownIcon
          class="size-4 shrink-0 opacity-60 transition-transform"
          :class="listOpen && 'rotate-180'"
        />
      </button>
      <button
        v-if="!listOpen"
        type="button"
        class="btn btn-square size-11 btn-ghost shrink-0"
        aria-label="Add evaluation"
        @click="onAddClick"
      >
        <PlusIcon class="size-5" />
      </button>
      <button
        type="button"
        class="btn btn-square size-11 btn-ghost shrink-0"
        aria-label="Close"
        @click="close"
      >
        <XMarkIcon class="size-5" />
      </button>
    </template>

    <div class="relative flex flex-col gap-3 min-h-full">
      <!-- Dropped saved-config list: switch (tap), per-row delete, add row. Overlays
           the dimmed body; tapping outside closes it. -->
      <button
        v-if="listOpen"
        class="fixed inset-0 z-10 cursor-default"
        aria-label="Close list"
        @click="listOpen = false"
      ></button>
      <div
        v-if="listOpen"
        class="absolute inset-x-0 top-0 z-20 rounded-2xl border border-base-300 bg-base-100 shadow-lg overflow-hidden"
      >
        <template v-for="(chip, index) in chips" :key="chip.id">
          <div v-if="index > 0" class="h-px bg-base-200 mx-3"></div>
          <div
            class="flex items-center gap-3 pl-3 pr-1 h-12"
            :class="chip.id === activeId && 'bg-primary/5'"
          >
            <button
              type="button"
              class="flex-1 min-w-0 flex items-center gap-3 h-full text-left"
              @click="selectChip(chip.id)"
            >
              <KindIcon
                :kind="chip.kind"
                class="size-[1.05rem] shrink-0"
                :class="chip.id === activeId ? 'text-primary' : 'opacity-60'"
              />
              <span
                class="flex-1 min-w-0 truncate text-sm"
                :class="chip.id === activeId ? 'font-semibold text-primary' : 'font-medium'"
                >{{ chip.label }}</span
              >
              <CheckIcon v-if="chip.id === activeId" class="size-4 text-success shrink-0" />
            </button>
            <button
              type="button"
              class="btn btn-square btn-sm btn-ghost text-error/70 shrink-0"
              aria-label="Remove evaluation"
              @click="emit('remove', chip.id)"
            >
              <TrashIcon class="size-4" />
            </button>
          </div>
        </template>
        <div v-if="chips.length > 0" class="h-px bg-base-200 mx-3"></div>
        <button
          type="button"
          class="flex items-center gap-3 px-3 h-12 w-full text-left text-primary"
          :aria-expanded="addKinds.length > 1 ? addMenuOpen : undefined"
          @click="onAddClick"
        >
          <PlusIcon class="size-5 shrink-0" />
          <span class="text-sm font-medium">Add evaluation…</span>
        </button>
        <!-- Kind picker (multi-kind modules only). -->
        <div v-if="addMenuOpen" class="flex flex-col gap-1 border-t border-base-200 p-1">
          <button
            v-for="kind in addKinds"
            :key="kind"
            class="btn btn-sm btn-ghost justify-start gap-2"
            @click="chooseKind(kind)"
          >
            <KindIcon :kind="kind" class="size-4 shrink-0 opacity-70" />
            {{ KIND_LABEL[kind] }}
          </button>
        </div>
      </div>

      <div
        class="flex-1 min-h-0 flex flex-col gap-3 transition-opacity"
        :class="listOpen && 'opacity-30 pointer-events-none'"
      >
        <div v-if="chips.length === 0" class="flex flex-col items-center gap-3 py-10 text-center">
          <p class="opacity-60 text-sm">No evaluation yet.</p>
          <button class="btn btn-primary gap-2" @click="onAddClick">
            <PlusIcon class="size-5" /> Add evaluation
          </button>
        </div>

        <slot v-if="chips.length > 0" :active-id="activeId" />
      </div>
    </div>
  </BottomSheet>
</template>
