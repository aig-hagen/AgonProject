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
<script setup lang="ts" generic="DocumentT">
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  PhotoIcon,
  ShareIcon,
} from '@heroicons/vue/24/outline'
import { computedAsync } from '@vueuse/core'
import { computed, inject, ref, shallowRef } from 'vue'

import ButtonCopy from '@/modules/common/export/ButtonCopy.vue'
import ButtonSave from '@/modules/common/export/ButtonSave.vue'
import { useSettings } from '@/modules/common/settings/useSettings'
import { supportsNativeShare } from '@/modules/common/share/nativeShare'
import { QUICK_SHARE_KEY } from '@/modules/common/share/quickShareKey'

import type { ExportConfig, ExportFileData, ExportStyleOptions } from '.'

const { input, exportConfigs } = defineProps<{
  input: DocumentT
  exportConfigs: ExportConfig<DocumentT>[]
}>()

const emit = defineEmits<{ export: [filedata: ExportFileData] }>()

const { gridCellScale } = useSettings()
const quickShare = inject(QUICK_SHARE_KEY, undefined)
const canShareNatively = supportsNativeShare()

type Screen = 'picker' | 'svg' | 'code'
const screen = ref<Screen>('picker')

// Appearance options change the package line and rendered SVG but not the TikZ body;
// structure options change TikZ coordinates as well as the SVG.
const argumentStyle = shallowRef('standard')
const nameStyle = shallowRef('math')
const attackStyle = shallowRef('standard')
const supportStyle = shallowRef('double')
const nodeDistance = shallowRef(1.5)

const isBipolarDocument = computed(
  () => typeof (input as unknown as { supports?: unknown }).supports === 'function',
)

const styleOptions = computed<ExportStyleOptions>(() => ({
  argumentStyle: argumentStyle.value,
  nameStyle: nameStyle.value,
  attackStyle: attackStyle.value,
  supportStyle: supportStyle.value,
  nodeDistance: nodeDistance.value,
  gridCellScale: gridCellScale.value,
}))

// The config with a code editor (LaTeX) is both the code view and the SVG source;
// the rest (ICCMA, TGF) are plain data downloads.
const codeConfig = computed(() => exportConfigs.find((c) => c.codemirrorOptions !== undefined))
const dataConfigs = computed(() => exportConfigs.filter((c) => c.codemirrorOptions === undefined))

const codeResult = computed(() =>
  codeConfig.value === undefined ? undefined : codeConfig.value.export(input, styleOptions.value),
)

const packageLine = computed(() => {
  if (codeConfig.value?.name !== 'LaTeX (argumentation)') return undefined
  const opts = [
    ...(argumentStyle.value !== 'standard' ? [`argumentstyle=${argumentStyle.value}`] : []),
    `namestyle=${nameStyle.value}`,
    ...(attackStyle.value !== 'standard' ? [`attackstyle=${attackStyle.value}`] : []),
  ]
  if (isBipolarDocument.value) opts.push(`supportstyle=${supportStyle.value}`)
  return `\\usepackage[${opts.join(',')}]{argumentation}`
})

// Only render the SVG on the preview screen, so opening Export doesn't run TikZ.
const svgLoading = shallowRef(false)
const svgTextMaybe = computedAsync(
  async () => {
    if (screen.value !== 'svg') return null
    const svg = codeResult.value?.svg
    return svg === undefined ? null : await svg
  },
  null,
  svgLoading,
)
const svgText = computed(() =>
  svgLoading.value || svgTextMaybe.value === null ? undefined : svgTextMaybe.value,
)

const svgFiledata = computed<ExportFileData | undefined>(() =>
  svgText.value === undefined ? undefined : { content: svgText.value, ending: 'svg' },
)
const codeFiledata = computed<ExportFileData | undefined>(() =>
  codeResult.value === undefined
    ? undefined
    : { content: codeResult.value.text, ending: codeConfig.value?.extension ?? 'tex' },
)

function download(config: ExportConfig<DocumentT>) {
  emit('export', {
    content: config.export(input, styleOptions.value).text,
    ending: config.extension ?? 'txt',
  })
}
</script>

<template>
  <div class="pb-4">
    <!-- Format picker -->
    <div v-if="screen === 'picker'" class="flex flex-col gap-5">
      <!-- One-tap share, kept apart from the format flow. -->
      <button
        v-if="quickShare"
        class="flex items-center gap-3 h-14 px-4 rounded-2xl bg-primary text-primary-content shadow-md shadow-primary/30"
        @click="quickShare()"
      >
        <ShareIcon class="size-5" />
        <span class="flex-1 text-left font-semibold">{{
          canShareNatively ? 'Share link' : 'Copy share link'
        }}</span>
      </button>

      <section v-if="codeConfig" class="flex flex-col gap-2">
        <h3 class="text-[0.7rem] font-semibold uppercase tracking-wide text-base-content/50 px-1">
          Image
        </h3>
        <button
          class="w-full flex items-center gap-3 min-h-14 px-3.5 py-2 rounded-2xl border border-base-300 bg-base-100 text-left"
          @click="screen = 'svg'"
        >
          <span class="grid place-items-center size-9 shrink-0 rounded-lg bg-base-200">
            <PhotoIcon class="size-5 text-primary" />
          </span>
          <span class="flex-1 min-w-0 flex flex-col leading-tight">
            <b class="text-sm font-semibold">SVG image</b>
            <span class="text-xs text-base-content/60 truncate"
              >Rendered diagram — with style options</span
            >
          </span>
          <span class="badge badge-sm badge-ghost text-primary/80 shrink-0">Preview</span>
          <ChevronRightIcon class="size-4 shrink-0 opacity-30" />
        </button>
      </section>

      <section class="flex flex-col gap-2">
        <h3 class="text-[0.7rem] font-semibold uppercase tracking-wide text-base-content/50 px-1">
          Code &amp; data
        </h3>
        <button
          v-if="codeConfig"
          class="w-full flex items-center gap-3 min-h-14 px-3.5 py-2 rounded-2xl border border-base-300 bg-base-100 text-left"
          @click="screen = 'code'"
        >
          <span class="grid place-items-center size-9 shrink-0 rounded-lg bg-base-200">
            <CodeBracketIcon class="size-5 text-primary" />
          </span>
          <span class="flex-1 min-w-0 flex flex-col leading-tight">
            <b class="text-sm font-semibold">{{ codeConfig.name }}</b>
            <span class="text-xs text-base-content/60 truncate">{{
              codeConfig.description ?? 'Copy code & \\usepackage line'
            }}</span>
          </span>
          <ChevronRightIcon class="size-4 shrink-0 opacity-30" />
        </button>
        <button
          v-for="config in dataConfigs"
          :key="config.name"
          class="w-full flex items-center gap-3 min-h-14 px-3.5 py-2 rounded-2xl border border-base-300 bg-base-100 text-left"
          @click="download(config)"
        >
          <span class="grid place-items-center size-9 shrink-0 rounded-lg bg-base-200">
            <DocumentTextIcon class="size-5 text-primary" />
          </span>
          <span class="flex-1 min-w-0 flex flex-col leading-tight">
            <b class="text-sm font-semibold">{{ config.name }}</b>
            <span class="text-xs text-base-content/60 truncate">{{
              config.description ?? `.${config.extension} file`
            }}</span>
          </span>
          <ArrowDownTrayIcon class="size-5 shrink-0 opacity-40" />
        </button>
      </section>
    </div>

    <!-- SVG preview -->
    <div v-else-if="screen === 'svg'" class="flex flex-col gap-3">
      <button class="btn btn-sm btn-ghost self-start gap-1 -ml-1" @click="screen = 'picker'">
        <ChevronLeftIcon class="size-4" /> Formats
      </button>

      <div class="overflow-auto rounded bg-white p-2">
        <div v-if="svgText === undefined" role="alert" class="alert alert-info alert-soft">
          <span>Rendering SVG…</span>
        </div>
        <div v-else v-html="svgText" class="w-fit"></div>
      </div>

      <div class="flex gap-2">
        <ButtonSave
          class="btn btn-sm btn-soft flex-1"
          :filedata="svgFiledata"
          @export="emit('export', $event)"
        />
        <ButtonCopy class="btn btn-sm btn-soft flex-1" :text="svgText">SVG</ButtonCopy>
      </div>

      <details class="collapse collapse-arrow bg-base-200/60 rounded-field">
        <summary class="collapse-title text-sm font-medium">Style options</summary>
        <div class="collapse-content flex flex-col gap-3">
          <div class="flex flex-col gap-2">
            <span class="text-[0.65rem] uppercase tracking-wide opacity-50"
              >Appearance · image only</span
            >
            <div class="grid grid-cols-2 gap-2">
              <label class="select select-sm">
                <span class="label">Argument</span>
                <select v-model="argumentStyle">
                  <option>standard</option>
                  <option>large</option>
                  <option>thick</option>
                  <option>gray</option>
                  <option>colored</option>
                </select>
              </label>
              <label class="select select-sm">
                <span class="label">Name</span>
                <select v-model="nameStyle">
                  <option>math</option>
                  <option>bold</option>
                  <option>monospace</option>
                  <option>monoemph</option>
                  <option>none</option>
                </select>
              </label>
              <label class="select select-sm">
                <span class="label">Attack</span>
                <select v-model="attackStyle">
                  <option>standard</option>
                  <option>large</option>
                  <option>modern</option>
                </select>
              </label>
              <label v-if="isBipolarDocument" class="select select-sm">
                <span class="label">Support</span>
                <select v-model="supportStyle">
                  <option>standard</option>
                  <option>dashed</option>
                  <option>double</option>
                </select>
              </label>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-[0.65rem] uppercase tracking-wide opacity-50"
              >Structure · image + TikZ</span
            >
            <label class="label gap-2">
              <span>Node distance</span>
              <input
                type="range"
                class="range range-sm flex-1"
                min="0.5"
                max="4"
                step="0.25"
                v-model.number="nodeDistance"
              />
              <span class="text-sm w-6 text-right opacity-60">{{ nodeDistance }}</span>
            </label>
          </div>
        </div>
      </details>
    </div>

    <!-- LaTeX code -->
    <div v-else class="flex flex-col gap-3">
      <button class="btn btn-sm btn-ghost self-start gap-1 -ml-1" @click="screen = 'picker'">
        <ChevronLeftIcon class="size-4" /> Formats
      </button>

      <div class="flex items-center gap-2">
        <a
          v-if="codeConfig?.references?.[0]"
          :href="codeConfig.references[0].url"
          :title="codeConfig.references[0].label"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-sm btn-ghost btn-square"
        >
          <ArrowTopRightOnSquareIcon class="size-4" />
        </a>
        <ButtonSave
          class="btn btn-sm btn-soft flex-1"
          :filedata="codeFiledata"
          @export="emit('export', $event)"
        />
        <ButtonCopy class="btn btn-sm btn-soft flex-1" :text="codeResult?.text">code</ButtonCopy>
      </div>

      <div v-if="packageLine" class="flex items-center gap-2">
        <code class="flex-1 min-w-0 truncate rounded bg-base-200 px-2 py-1.5 text-[0.7rem]">{{
          packageLine
        }}</code>
        <ButtonCopy class="btn btn-xs btn-ghost btn-square" :text="packageLine" icon-only />
      </div>

      <pre
        class="overflow-auto rounded bg-base-200 p-2 text-[0.7rem] leading-relaxed max-h-64"
      ><code>{{ codeResult?.text }}</code></pre>

      <details class="collapse collapse-arrow bg-base-200/60 rounded-field">
        <summary class="collapse-title text-sm font-medium">Structure options</summary>
        <div class="collapse-content">
          <label class="label gap-2">
            <span>Node distance</span>
            <input
              type="range"
              class="range range-sm flex-1"
              min="0.5"
              max="4"
              step="0.25"
              v-model.number="nodeDistance"
            />
            <span class="text-sm w-6 text-right opacity-60">{{ nodeDistance }}</span>
          </label>
        </div>
      </details>
    </div>
  </div>
</template>
