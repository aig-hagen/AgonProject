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
<script lang="ts">
import { shallowRef } from 'vue'

type ImageFormat = 'svg' | 'png'
const FORMATS: ImageFormat[] = ['svg', 'png']
const SCALES = [1, 2, 3]

// Remembered for the session so reopening the export keeps the last choices.
const format = shallowRef<ImageFormat>('svg')
const scale = shallowRef(2)
const transparent = shallowRef(true)
</script>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, inject, onScopeDispose, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonCopy from '@/modules/common/export/ButtonCopy.vue'
import ButtonSave from '@/modules/common/export/ButtonSave.vue'
import { embedFonts, rasterizeSvg } from '@/modules/common/export/exportImage'
import { GRAPH_SVG_RENDERER_KEY } from '@/modules/common/graph-editor/graphEditor'
import { useTheme } from '@/modules/common/theme/useTheme'

import type { ExportFileData } from '.'

const { fill = false } = defineProps<{
  /** Fill the parent's height: the preview flexes and the buttons stay at the bottom. */
  fill?: boolean
}>()
const emit = defineEmits<{ export: [filedata: ExportFileData]; previewLoaded: [] }>()

const { t } = useI18n({ useScope: 'global' })
const graphSvgRenderer = inject(GRAPH_SVG_RENDERER_KEY, undefined)
const { isDark } = useTheme()
const canCopyImage = typeof ClipboardItem !== 'undefined'

const hasGraph = shallowRef(true)
// An <img> rather than inline SVG, so page CSS (e.g. the library's label rules) can't leak in
// and the preview shows exactly what gets saved.
const previewSvg = shallowRef<string | undefined>(undefined)
const previewUrl = computed(() =>
  previewSvg.value === undefined
    ? undefined
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvg.value)}`,
)
const filedata = shallowRef<ExportFileData | undefined>(undefined)
const rasterError = shallowRef(false)

let generation = 0
async function refresh() {
  const run = ++generation
  const svg = graphSvgRenderer?.render({ transparent: transparent.value }) ?? undefined
  hasGraph.value = svg !== undefined
  if (svg === undefined) {
    previewSvg.value = undefined
    filedata.value = undefined
    return
  }
  const ending = format.value
  try {
    const embedded = await embedFonts(svg)
    if (run !== generation) return
    previewSvg.value = embedded
    const content = ending === 'png' ? await rasterizeSvg(embedded, scale.value) : embedded
    if (run !== generation) return
    filedata.value = { content, ending }
    rasterError.value = false
  } catch (error) {
    if (run !== generation) return
    console.error(error)
    filedata.value = undefined
    rasterError.value = true
  }
}

// Post-flush so the canvas has re-rendered (e.g. theme colors) before it is read.
watch([format, scale, transparent, isDark], refresh, { immediate: true, flush: 'post' })

// Live preview: re-export once canvas edits (moves, styles, physics) settle.
const scheduleRefresh = useDebounceFn(refresh, 250, { maxWait: 1000 })
onScopeDispose(graphSvgRenderer?.observe(() => void scheduleRefresh()) ?? (() => {}))

const copyText = computed(() =>
  typeof filedata.value?.content === 'string' ? filedata.value.content : undefined,
)
const copyBlob = computed(() =>
  filedata.value?.content instanceof Blob ? filedata.value.content : undefined,
)
</script>

<template>
  <div class="flex flex-col gap-3" :class="{ 'h-full': fill }">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div class="join" role="group" :aria-label="t('export.format')">
        <button
          v-for="option in FORMATS"
          :key="option"
          type="button"
          class="btn btn-sm join-item"
          :class="{ 'btn-primary': format === option }"
          :aria-pressed="format === option"
          @click="format = option"
        >
          {{ option.toUpperCase() }}
        </button>
      </div>
      <!-- Hidden, not removed, so toggling PNG doesn't shift the row. -->
      <div class="flex items-center gap-2" :class="{ invisible: format !== 'png' }">
        <span class="text-sm">{{ t('export.image.scale') }}</span>
        <div class="w-24">
          <input
            v-model.number="scale"
            type="range"
            :min="SCALES[0]"
            :max="SCALES[SCALES.length - 1]"
            step="1"
            class="range range-xs range-primary"
            :aria-label="t('export.image.scale')"
          />
          <div class="flex justify-between px-1 text-xs">
            <span
              v-for="option in SCALES"
              :key="option"
              :class="scale === option ? 'font-semibold' : 'text-base-content/60'"
              >{{ option }}×</span
            >
          </div>
        </div>
      </div>
      <label class="label cursor-pointer gap-2 text-sm text-base-content ml-auto">
        <input v-model="transparent" type="checkbox" class="toggle toggle-sm toggle-primary" />
        {{ t('export.image.transparent') }}
      </label>
    </div>

    <div
      class="overflow-auto rounded border border-base-300 p-2"
      :class="{ 'svg-preview-checker': transparent, 'preview-fill flex flex-1 min-h-0': fill }"
    >
      <img
        v-if="hasGraph && previewUrl"
        :src="previewUrl"
        @load="emit('previewLoaded')"
        alt=""
        class="svg-preview m-auto"
      />
      <div v-else-if="!hasGraph" role="alert" class="alert alert-warning alert-soft">
        <span>{{ t('export.noGraph') }}</span>
      </div>
    </div>

    <div v-if="rasterError" role="alert" class="alert alert-warning alert-soft">
      <span>{{ t('export.image.rasterError') }}</span>
    </div>

    <div class="flex gap-2">
      <ButtonSave
        class="btn btn-primary h-12 flex-1 rounded-2xl"
        :filedata="filedata"
        @export="emit('export', $event)"
      />
      <ButtonCopy
        v-if="format === 'svg' || canCopyImage"
        class="btn btn-soft h-12 flex-1 rounded-2xl"
        :text="copyText"
        :blob="copyBlob"
        >{{ format.toUpperCase() }}</ButtonCopy
      >
    </div>
  </div>
</template>

<style scoped>
/* The serialized svg has intrinsic px dimensions that grow with the graph, so clamp it
   (its viewBox keeps the aspect ratio) instead of letting it scale up. */
.svg-preview {
  max-width: 100%;
  max-height: 60vh;
  width: auto;
  height: auto;
}

.preview-fill .svg-preview {
  max-height: 100%;
}

.svg-preview-checker {
  background: repeating-conic-gradient(var(--color-base-300) 0 25%, transparent 0 50%) 0 0 / 16px
    16px;
}
</style>
