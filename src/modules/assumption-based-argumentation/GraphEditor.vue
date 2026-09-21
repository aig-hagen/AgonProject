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

import type { ABAF } from '@/modules/assumption-based-argumentation/model'
import type { HistoryState } from '@/modules/common/graph-editor/graphEditor'
import type { DocumentState } from '@/modules/common/state'

const { state } = defineProps<{
  state: DocumentState<ABAF>
  historyState: HistoryState
  documentId: number
}>()

defineEmits<{
  load: []
  new: []
  change: [state: DocumentState<ABAF>]
  undo: []
  redo: []
  save: []
  share: []
}>()

const summary = computed(() => {
  const aba = state.current.content
  const nodes = [...aba.nodeEntries()]
  return {
    atoms: nodes.filter(([, d]) => d.kind === 'atom').length,
    assumptions: nodes.filter(([, d]) => d.kind === 'assumption').length,
    rules: aba.rules().length,
    flat: aba.isFlat(),
  }
})
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center">
    <h2 class="text-lg font-semibold">Assumption-Based Argumentation</h2>
    <p class="opacity-70">The graph editor is under construction.</p>
    <p class="text-sm opacity-60">
      {{ summary.assumptions }} assumptions · {{ summary.atoms }} atoms · {{ summary.rules }} rules
      ·
      {{ summary.flat ? 'flat' : 'non-flat' }}
    </p>
  </div>
</template>
