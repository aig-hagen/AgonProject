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
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'
import copy from 'copy-to-clipboard'
import { ref } from 'vue'

import TexIcon from '@/modules/common/export/TexIcon.vue'

const {
  text,
  iconOnly = false,
  title,
} = defineProps<{
  text: string | undefined
  /** Renders just the icon (e.g. as a "Copy as TeX" button next to the full copy button). */
  iconOnly?: boolean
  title?: string
}>()

const showCopied = ref(false)
let timeoutId: ReturnType<typeof setTimeout>

async function copyToClipboard() {
  if (text === undefined) {
    return
  }
  const success = await copy(text)

  if (success === false) {
    return
  }
  showCopied.value = true
  if (timeoutId !== undefined) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(() => (showCopied.value = false), 500)
}
</script>

<template>
  <button @click="copyToClipboard" :disabled="text === undefined" :title="title">
    <template v-if="showCopied">
      <ClipboardDocumentCheckIcon class="size-4"></ClipboardDocumentCheckIcon>
      <template v-if="!iconOnly">Copied</template>
    </template>
    <template v-else>
      <TexIcon v-if="iconOnly" class="size-4"></TexIcon>
      <ClipboardDocumentIcon v-else class="size-4"></ClipboardDocumentIcon>
      <template v-if="!iconOnly">Copy <slot></slot></template>
    </template>
  </button>
</template>
