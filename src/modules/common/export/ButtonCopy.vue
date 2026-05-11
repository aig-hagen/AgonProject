<script setup lang="ts">
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'
import copy from 'copy-to-clipboard'
import { ref } from 'vue'

const { text } = defineProps<{
  text: string | undefined
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
  <button @click="copyToClipboard" :disabled="text === undefined">
    <template v-if="showCopied">
      <ClipboardDocumentCheckIcon class="size-4"></ClipboardDocumentCheckIcon>Copied
    </template>
    <template v-else>
      <ClipboardDocumentIcon class="size-4"></ClipboardDocumentIcon>Copy <slot></slot>
    </template>
  </button>
</template>
