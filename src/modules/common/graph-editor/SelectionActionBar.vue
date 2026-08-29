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
import { flip, offset, shift, useFloating } from '@floating-ui/vue'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'

import type { SelectionAction } from '@/modules/common/graph-editor/graphEditor'

/**
 * The floating action bar for the current graph selection. It follows the selected element
 * (via `getReferenceRect`, polled each frame so it rides along on pan / zoom / drag), flips
 * below when near the top edge and clamps inside the viewport. It stays presentational: the
 * shared editor composes the `actions` descriptors (common Rename/Delete + module actions) and
 * this bar just renders them, danger actions (Delete) pushed to the far right.
 */
const { getReferenceRect, actions } = defineProps<{
  getReferenceRect: () => DOMRect | null
  actions: SelectionAction[]
}>()

const emit = defineEmits<{
  close: []
}>()

const safeActions = computed(() => [...actions].filter((a) => !a.danger))
const dangerActions = computed(() => actions.filter((a) => a.danger))

// A virtual reference: floating-ui reads its rect on every `update()`, so re-reading the
// live element box keeps the bar glued to a moving element.
const reference = shallowRef({
  getBoundingClientRect: () => getReferenceRect() ?? new DOMRect(),
})
const floating = useTemplateRef('floating')
const { floatingStyles, update } = useFloating(reference, floating, {
  placement: 'top',
  middleware: [offset(10), flip({ fallbackPlacements: ['bottom'] }), shift({ padding: 8 })],
})

let frame = 0
function follow() {
  if (getReferenceRect() === null) {
    emit('close')
    return
  }
  update()
  frame = requestAnimationFrame(follow)
}
onMounted(() => {
  frame = requestAnimationFrame(follow)
})
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <div ref="floating" :style="floatingStyles" class="z-30">
    <div class="join rounded-box border border-base-300 bg-base-100 shadow-md">
      <!-- pointerdown, not click: the tap that selects mounts this bar; a trailing synthetic
           click would otherwise immediately trigger the button under the finger. -->
      <button
        v-for="action in safeActions"
        :key="action.key"
        class="btn join-item btn-ghost btn-sm"
        :title="action.label"
        :aria-label="action.label"
        @pointerdown.prevent="action.run()"
      >
        <component :is="action.icon" v-if="action.icon" class="size-4" />
        <span v-else>{{ action.label }}</span>
      </button>
      <button
        v-for="action in dangerActions"
        :key="action.key"
        class="btn join-item btn-ghost btn-sm text-error"
        :title="action.label"
        :aria-label="action.label"
        @pointerdown.prevent="action.run()"
      >
        <component :is="action.icon" v-if="action.icon" class="size-4" />
        <span v-else>{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>
