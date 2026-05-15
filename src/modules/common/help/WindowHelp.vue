<script setup lang="ts">
import HelpControls from '@/modules/common/help/HelpControls.vue'
import HelpLinks from '@/modules/common/help/HelpLinks.vue'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

const { linkNames } = defineProps<{
  linkNames: string[]
}>()

const open = defineModel('open', { required: true })
</script>

<template>
  <FloatingWindow
    v-model:open="open"
    title="Help"
    :initial-position="{ x: 256, y: 256 }"
    :intitalSize="{ width: 576, height: 448 }"
  >
    <div class="p-4">
      <HelpLinks />
      <HelpControls :link-names="linkNames" />
    </div>
  </FloatingWindow>
</template>
