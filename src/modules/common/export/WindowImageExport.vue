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
import { useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ImageExportPanel from '@/modules/common/export/ImageExportPanel.vue'
import WindowShell from '@/modules/common/window/WindowShell.vue'

import type { ExportFileData } from '.'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ export: [filedata: ExportFileData] }>()

const { t } = useI18n({ useScope: 'global' })

// Fit the height to the first preview of each opening; later live updates keep the size.
const shell = useTemplateRef('shell')
let fitted = false
watch(open, () => (fitted = false))
function fitToPreview() {
  if (fitted) return
  fitted = true
  shell.value?.resizeToFitContent()
}
</script>

<template>
  <WindowShell
    ref="shell"
    v-model:open="open"
    :title="t('export.exportImage')"
    :initial-position="{ x: 96, y: 96 }"
    :intitalSize="{ width: 560, height: 600 }"
  >
    <!-- Mounted only while open, so the canvas isn't observed in the background. -->
    <div v-if="open" class="h-full p-4">
      <ImageExportPanel fill @export="emit('export', $event)" @preview-loaded="fitToPreview" />
    </div>
  </WindowShell>
</template>
