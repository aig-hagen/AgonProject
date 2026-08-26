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
import { computed } from 'vue'

import type { DocumentId } from '@/modules/common/documents/db'
import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import BottomSheet from '@/modules/common/window/BottomSheet.vue'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

// Chrome seam: a window renders as a draggable FloatingWindow in the regular layout
// and as a BottomSheet in the compact layout. The body stays the same slot content;
// only the surrounding chrome swaps. Props mirror FloatingWindow so a consumer swaps
// the tag name and nothing else.
const open = defineModel('open', { required: true })
const compact = defineModel<boolean>('compact', { default: false })
const paramsOpen = defineModel<boolean>('paramsOpen', { default: true })

const {
  title,
  initialPosition,
  intitalSize,
  compactable = false,
  minimizable = true,
  card = false,
  loading = false,
  instanceOffset = 0,
  documentId,
  stateKey,
  active = false,
  fullHeight = false,
} = defineProps<{
  title: string
  initialPosition: { x: number; y: number }
  intitalSize: { width: number; height: number }
  compactable?: boolean
  minimizable?: boolean
  card?: boolean
  loading?: boolean
  instanceOffset?: number
  documentId?: DocumentId
  stateKey?: string
  active?: boolean
  /** Sheet-only: start expanded to the full snap point instead of sizing to content. */
  fullHeight?: boolean
}>()

const emit = defineEmits<{ focus: [] }>()

const { layoutMode } = useLayoutMode()

// BottomSheet's open model is typed boolean; the shared model mirrors FloatingWindow's
// untyped one, so bridge the two through a boolean view.
const openSheet = computed<boolean>({
  get: () => !!open.value,
  set: (value) => {
    open.value = value
  },
})
</script>

<template>
  <FloatingWindow
    v-if="layoutMode === 'regular'"
    v-model:open="open"
    v-model:compact="compact"
    v-model:params-open="paramsOpen"
    :title="title"
    :initial-position="initialPosition"
    :intitalSize="intitalSize"
    :compactable="compactable"
    :minimizable="minimizable"
    :card="card"
    :loading="loading"
    :instance-offset="instanceOffset"
    :document-id="documentId"
    :state-key="stateKey"
    :active="active"
    @focus="emit('focus')"
  >
    <template #default="{ compact: isCompact }">
      <slot :compact="isCompact" />
    </template>
  </FloatingWindow>
  <BottomSheet v-else v-model:open="openSheet" :title="title" :full-height="fullHeight">
    <slot :compact="false" />
  </BottomSheet>
</template>
