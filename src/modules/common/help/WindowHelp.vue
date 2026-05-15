<script setup lang="ts">
import { computed } from 'vue'

import HelpLinks from '@/modules/common/help/HelpLinks.vue'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

const { linkNames } = defineProps<{
  linkNames: string[]
}>()

const linkNamesSlashSeperated = computed(() => linkNames.join('/'))
const linkNamesEnumeration = computed(
  () => linkNames.slice(0, -1).join(', ') + ' and ' + linkNames[linkNames.length - 1],
)

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
      <table class="table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Control</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Create argument</td>
            <td><kbd class="kbd">Left double-click</kbd> on canvas</td>
          </tr>
          <tr>
            <td>Rename argument</td>
            <td>
              <kbd class="kbd">Left-click</kbd> on argument, enter new name and use
              <kbd class="kbd">Return</kbd> to confirm
            </td>
          </tr>
          <tr>
            <td>Move argument</td>
            <td><kbd class="kbd">Left-click</kbd> on argument, hold and drag</td>
          </tr>
          <tr>
            <td>Delete argument</td>
            <td><kbd class="kbd">Right-click</kbd> on argument and hold</td>
          </tr>
          <tr>
            <td>Create {{ linkNamesSlashSeperated }}</td>
            <td><kbd class="kbd">Right-click</kbd> on argument, hold and drag towards argument</td>
          </tr>
          <tr v-if="linkNames.length > 1">
            <td>Switch between {{ linkNamesEnumeration }}</td>
            <td>
              <kbd class="kbd">Left-click</kbd> on {{ linkNamesSlashSeperated }} and select new type
            </td>
          </tr>
          <tr>
            <td>Delete {{ linkNamesSlashSeperated }}</td>
            <td><kbd class="kbd">Right-click</kbd> on {{ linkNamesSlashSeperated }} and hold</td>
          </tr>
          <tr>
            <td>Pan</td>
            <td><kbd class="kbd">Left-click</kbd> on canvas, hold and drag</td>
          </tr>
          <tr>
            <td>Zoom in/out</td>
            <td><kbd class="kbd">Scroll wheel</kbd> on canvas</td>
          </tr>
        </tbody>
      </table>
    </div>
  </FloatingWindow>
</template>
