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
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

import type { ExportFileData } from '.'

const { filedata } = defineProps<{
  filedata?: ExportFileData
}>()

const emit = defineEmits<{
  export: [filedata: ExportFileData]
}>()

const showSaved = ref(false)
let timeoutId: ReturnType<typeof setTimeout>

async function saveFile() {
  if (filedata === undefined) {
    return
  }

  emit('export', filedata)

  showSaved.value = true
  if (timeoutId !== undefined) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(() => (showSaved.value = false), 500)
}
</script>

<template>
  <button @click="saveFile" :disabled="filedata === undefined">
    <template v-if="showSaved">
      <ArrowDownTrayIcon class="size-4"></ArrowDownTrayIcon>Saved
    </template>
    <template v-else>
      <ArrowDownTrayIcon class="size-4"></ArrowDownTrayIcon>Save <slot></slot>
    </template>
  </button>
</template>
