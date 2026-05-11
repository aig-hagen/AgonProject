<script setup lang="ts">
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import { saveToFile } from '@/modules/common/export/saveFile'

const { filedata } = defineProps<{
  filedata?: {
    content: string
    name: string
    ending: string
  }
}>()

const showSaved = ref(false)
let timeoutId: ReturnType<typeof setTimeout>

async function saveFile() {
  if (filedata === undefined) {
    return
  }

  saveToFile(filedata.content, filedata.name, filedata.ending)

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
