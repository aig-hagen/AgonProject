<!--
  Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.

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
import { CheckIcon, ClipboardIcon } from '@heroicons/vue/24/outline'
import copy from 'copy-to-clipboard'
import { ref, useTemplateRef, watch } from 'vue'

const { url } = defineProps<{ url: string | null }>()
const emit = defineEmits<{ close: [] }>()

const dialogRef = useTemplateRef('dialog')
const copied = ref(false)

watch(
  () => url,
  (val) => {
    if (val) {
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
    copied.value = false
  },
)

function onCopy() {
  if (!url) return
  copy(url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function onClose() {
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="modal" @close="onClose">
    <div class="modal-box">
      <h3 class="text-lg font-bold mb-4">Share Link</h3>
      <p class="text-sm text-base-content/70 mb-3">
        Anyone with this link can import a copy of this framework into their browser.
      </p>
      <div class="flex gap-2">
        <input
          type="text"
          :value="url ?? ''"
          readonly
          class="input input-bordered flex-1 font-mono text-sm"
          @click="($event.target as HTMLInputElement).select()"
        />
        <button class="btn btn-neutral" @click="onCopy" :title="copied ? 'Copied!' : 'Copy link'">
          <CheckIcon v-if="copied" class="size-4" />
          <ClipboardIcon v-else class="size-4" />
        </button>
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
