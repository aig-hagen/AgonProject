<script setup lang="ts">
import FloatingWindow from '../modules/common/window/FloatingWindow.vue'
import {
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from '@heroicons/vue/24/outline'

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
      <div class="my-4 gap-2 flex flex-wrap">
        <a class="btn btn-xs btn-soft"><BookOpenIcon class="size-3" />User Guide</a>
        <a class="btn btn-xs btn-soft"><CodeBracketIcon class="size-3" />Source v0.12.0</a>
        <a class="btn btn-xs btn-soft"><AcademicCapIcon class="size-3" />AIG Hagen</a>
        <a class="btn btn-xs btn-soft"><ArrowTopRightOnSquareIcon class="size-3" />Attributions</a>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Control</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Create atom</td>
            <td><kbd class="kbd">Left double-click</kbd> on canvas</td>
          </tr>
          <tr>
            <td>Delete atom</td>
            <td><kbd class="kbd">Right-click</kbd> on atom and hold</td>
          </tr>
          <tr>
            <td>Move atom</td>
            <td><kbd class="kbd">Left-click</kbd> on atom hold and drag</td>
          </tr>
          <tr>
            <td>Create attack</td>
            <td><kbd class="kbd">Right-click</kbd> on atom, hold and drag towards atom</td>
          </tr>
          <tr>
            <td>Delete attack</td>
            <td><kbd class="kbd">Right-click</kbd> on attack and hold</td>
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
