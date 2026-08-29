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
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'

/**
 * The floating action bar for the current graph selection. It follows the selected element
 * (via `getReferenceRect`, polled each frame so it rides along on pan / zoom / drag), flips
 * below when near the top edge and clamps inside the viewport. It stays presentational: the
 * common actions (Rename, Delete) are emitted for the shared editor to carry out; module
 * actions will slot in later.
 */
const { getReferenceRect, canRename = false } = defineProps<{
  getReferenceRect: () => DOMRect | null
  canRename?: boolean
}>()

const emit = defineEmits<{
  rename: []
  delete: []
  close: []
}>()

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
        v-if="canRename"
        class="btn join-item btn-ghost btn-sm"
        title="Rename"
        @pointerdown.prevent="emit('rename')"
      >
        <PencilSquareIcon class="size-4" />
      </button>
      <button
        class="btn join-item btn-ghost btn-sm text-error"
        title="Delete"
        @pointerdown.prevent="emit('delete')"
      >
        <TrashIcon class="size-4" />
      </button>
    </div>
  </div>
</template>
