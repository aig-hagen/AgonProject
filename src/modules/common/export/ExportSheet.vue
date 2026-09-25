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
import { computed, inject, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  LATEX_PREAMBLE,
  LATEX_STYLE_CHOICES,
  LATEX_STYLE_DEFAULTS,
} from '@/modules/common/argumentation/export'
import ButtonCopy from '@/modules/common/export/ButtonCopy.vue'
import ButtonSave from '@/modules/common/export/ButtonSave.vue'
import ParameterField from '@/modules/common/forms/ParameterField.vue'
import PickerSelect, { type PickerOption } from '@/modules/common/forms/PickerSelect.vue'
import { GRAPH_SVG_RENDERER_KEY } from '@/modules/common/graph-editor/graphEditor'
import { useSettings } from '@/modules/common/settings/useSettings'
import { supportsNativeShare } from '@/modules/common/share/nativeShare'
import { QUICK_SHARE_KEY } from '@/modules/common/share/quickShareKey'

import type { ExportConfig, ExportFileData, ExportStyleOptions, NodeLabelMode } from '.'
import { ExportFormatId } from '.'

const { input, exportConfigs } = defineProps<{
  input: DocumentT
  exportConfigs: ExportConfig<DocumentT>[]
}>()

const emit = defineEmits<{ export: [filedata: ExportFileData]; close: [] }>()

const { t } = useI18n({ useScope: 'global' })

function shareAndClose() {
  quickShare?.()
  emit('close')
}

const { gridCellScale } = useSettings()
const quickShare = inject(QUICK_SHARE_KEY, undefined)
const graphSvgRenderer = inject(GRAPH_SVG_RENDERER_KEY, undefined)
const canShareNatively = supportsNativeShare()

type Screen = 'picker' | 'svg' | 'code'
const screen = ref<Screen>('picker')

// Same defaults and output as the desktop LaTeX studio.
const argumentStyle = shallowRef<string>(LATEX_STYLE_DEFAULTS.argumentStyle)
const nameStyle = shallowRef<string>(LATEX_STYLE_DEFAULTS.nameStyle)
const attackStyle = shallowRef<string>(LATEX_STYLE_DEFAULTS.attackStyle)
const supportStyle = shallowRef<string>(LATEX_STYLE_DEFAULTS.supportStyle)
const nodeDistance = shallowRef<number>(LATEX_STYLE_DEFAULTS.nodeDistance)
const nodeLabels = shallowRef<NodeLabelMode>(LATEX_STYLE_DEFAULTS.nodeLabels)

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
  nodeLabels: nodeLabels.value,
}))

// The config with a code editor (LaTeX) is both the code view and the SVG source;
// the rest (ICCMA, TGF) are plain data downloads.
const codeConfig = computed(() => exportConfigs.find((c) => c.codemirrorOptions !== undefined))
const dataConfigs = computed(() => exportConfigs.filter((c) => c.codemirrorOptions === undefined))

const codeResult = computed(() =>
  codeConfig.value === undefined ? undefined : codeConfig.value.export(input, styleOptions.value),
)

const toOptions = (values: readonly string[]): PickerOption[] =>
  values.map((v) => ({ value: v, label: v }))
const argumentStyleOptions = toOptions(LATEX_STYLE_CHOICES.argumentStyle)
const nameStyleOptions = toOptions(LATEX_STYLE_CHOICES.nameStyle)
const attackStyleOptions = toOptions(LATEX_STYLE_CHOICES.attackStyle)
const supportStyleOptions = toOptions(LATEX_STYLE_CHOICES.supportStyle)
const nodeLabelOptions = computed<PickerOption[]>(() =>
  LATEX_STYLE_CHOICES.nodeLabels.map((value) => ({
    value,
    label: t(`export.style.nodeLabelOptions.${value}`),
  })),
)

const isLatex = computed(() => codeConfig.value?.id === ExportFormatId.Latex)

// WYSIWYG SVG snapshot of the live graph. Serialized only on the preview screen, and only when
// a renderer is provided (i.e. inside a graph editor). No TikZ/WebAssembly, so it works on any
// phone — unlike the old rendered preview, which could hang on mobile. Re-serialized on document
// changes via a post-flush watch so the snapshot reflects edits (e.g. moved nodes), reading the
// canvas after it has re-rendered rather than the pre-edit positions.
const svgText = shallowRef<string | undefined>(undefined)
watch(
  [screen, () => input],
  ([currentScreen]) => {
    svgText.value = currentScreen === 'svg' ? (graphSvgRenderer?.() ?? undefined) : undefined
  },
  { immediate: true, flush: 'post' },
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
        @click="shareAndClose()"
      >
        <ShareIcon class="size-5" />
        <span class="flex-1 text-left font-semibold">{{
          canShareNatively ? t('menu.shareLink') : t('home.tabs.copyShareLink')
        }}</span>
      </button>

      <section v-if="graphSvgRenderer" class="flex flex-col gap-2">
        <h3 class="text-[0.7rem] font-semibold uppercase tracking-wide text-base-content/50 px-1">
          {{ t('export.sections.image') }}
        </h3>
        <button
          class="w-full flex items-center gap-3 min-h-14 px-3.5 py-2 rounded-2xl border border-base-300 bg-base-100 text-left"
          @click="screen = 'svg'"
        >
          <span class="grid place-items-center size-9 shrink-0 rounded-lg bg-base-200">
            <PhotoIcon class="size-5 text-primary" />
          </span>
          <span class="flex-1 min-w-0 flex flex-col leading-tight">
            <b class="text-sm font-semibold">{{ t('export.svg.title') }}</b>
            <span class="text-xs text-base-content/60 truncate">{{
              t('export.svg.description')
            }}</span>
          </span>
          <ChevronRightIcon class="size-4 shrink-0 opacity-30" />
        </button>
      </section>

      <section class="flex flex-col gap-2">
        <h3 class="text-[0.7rem] font-semibold uppercase tracking-wide text-base-content/50 px-1">
          {{ t('export.sections.text') }}
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
              codeConfig.description ?? t('export.latexFallbackDescription')
            }}</span>
          </span>
          <ChevronRightIcon class="size-4 shrink-0 opacity-30" />
        </button>
        <button
          v-for="config in dataConfigs"
          :key="config.id"
          class="w-full flex items-center gap-3 min-h-14 px-3.5 py-2 rounded-2xl border border-base-300 bg-base-100 text-left"
          @click="download(config)"
        >
          <span class="grid place-items-center size-9 shrink-0 rounded-lg bg-base-200">
            <DocumentTextIcon class="size-5 text-primary" />
          </span>
          <span class="flex-1 min-w-0 flex flex-col leading-tight">
            <b class="text-sm font-semibold">{{ config.name }}</b>
            <span class="text-xs text-base-content/60 truncate">{{
              config.description ?? t('export.fileFallbackDescription', { ext: config.extension })
            }}</span>
          </span>
          <ArrowDownTrayIcon class="size-5 shrink-0 opacity-40" />
        </button>
      </section>
    </div>

    <!-- SVG preview -->
    <div v-else-if="screen === 'svg'" class="flex flex-col gap-3">
      <button class="btn btn-sm btn-ghost self-start gap-1 -ml-1" @click="screen = 'picker'">
        <ChevronLeftIcon class="size-4" /> {{ t('export.formats') }}
      </button>

      <div class="overflow-auto rounded border border-base-300 p-2">
        <div v-if="svgText" v-html="svgText" class="wysiwyg-svg-preview w-fit"></div>
        <div v-else role="alert" class="alert alert-warning alert-soft">
          <span>{{ t('export.noGraph') }}</span>
        </div>
      </div>

      <div class="flex gap-2">
        <ButtonSave
          class="btn btn-primary h-12 flex-1 rounded-2xl"
          :filedata="svgFiledata"
          @export="emit('export', $event)"
        />
        <ButtonCopy class="btn btn-soft h-12 flex-1 rounded-2xl" :text="svgText">SVG</ButtonCopy>
      </div>
    </div>

    <!-- LaTeX code -->
    <div v-else class="flex flex-col gap-3">
      <button class="btn btn-sm btn-ghost self-start gap-1 -ml-1" @click="screen = 'picker'">
        <ChevronLeftIcon class="size-4" /> {{ t('export.formats') }}
      </button>

      <div class="flex items-center gap-2">
        <a
          v-if="codeConfig?.references?.[0]"
          :href="codeConfig.references[0].url"
          :title="codeConfig.references[0].label"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-ghost btn-square size-12 rounded-2xl"
        >
          <ArrowTopRightOnSquareIcon class="size-5" />
        </a>
        <ButtonSave
          class="btn btn-primary h-12 flex-1 rounded-2xl"
          :filedata="codeFiledata"
          @export="emit('export', $event)"
        />
        <ButtonCopy tex class="btn btn-soft h-12 flex-1 rounded-2xl" :text="codeResult?.text">{{
          t('export.formatLabels.code')
        }}</ButtonCopy>
      </div>

      <div v-if="isLatex" class="flex items-center gap-2">
        <code class="flex-1 min-w-0 truncate rounded bg-base-200 px-2 py-1.5 text-[0.7rem]">{{
          LATEX_PREAMBLE
        }}</code>
        <ButtonCopy
          class="btn btn-xs btn-ghost btn-square"
          :text="LATEX_PREAMBLE"
          :title="t('export.button.copyBare')"
          icon-only
        />
      </div>

      <pre
        class="overflow-auto rounded bg-base-200 p-2 text-[0.7rem] leading-relaxed max-h-64"
      ><code>{{ codeResult?.text }}</code></pre>

      <details v-if="isLatex" class="collapse collapse-arrow bg-base-200/60 rounded-field">
        <summary class="collapse-title text-sm font-medium">
          {{ t('export.style.options') }}
        </summary>
        <div class="collapse-content flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-3">
            <ParameterField :label="t('export.style.argument')" min-width="0" max-width="none">
              <PickerSelect v-model="argumentStyle" :options="argumentStyleOptions" />
            </ParameterField>
            <ParameterField :label="t('export.style.name')" min-width="0" max-width="none">
              <PickerSelect v-model="nameStyle" :options="nameStyleOptions" />
            </ParameterField>
            <ParameterField :label="t('export.style.attack')" min-width="0" max-width="none">
              <PickerSelect v-model="attackStyle" :options="attackStyleOptions" />
            </ParameterField>
            <ParameterField
              v-if="isBipolarDocument"
              :label="t('export.style.support')"
              min-width="0"
              max-width="none"
            >
              <PickerSelect v-model="supportStyle" :options="supportStyleOptions" />
            </ParameterField>
            <ParameterField :label="t('export.style.nodeLabels')" min-width="0" max-width="none">
              <PickerSelect
                :model-value="nodeLabels"
                :options="nodeLabelOptions"
                @update:model-value="nodeLabels = $event as NodeLabelMode"
              />
            </ParameterField>
          </div>
          <ParameterField :label="t('export.style.nodeDistance')" min-width="0" max-width="none">
            <div class="flex items-center gap-3">
              <input
                type="range"
                class="range range-xs range-primary flex-1"
                min="0.5"
                max="4"
                step="0.25"
                v-model.number="nodeDistance"
              />
              <span class="w-8 text-right font-mono text-xs opacity-70">{{ nodeDistance }}</span>
            </div>
          </ParameterField>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
/* Cap the WYSIWYG SVG preview: the serialized svg has intrinsic px dimensions that grow with
   the graph, so clamp it (its viewBox keeps the aspect ratio) instead of letting it scale up. */
.wysiwyg-svg-preview :deep(svg) {
  max-width: 100%;
  max-height: 60vh;
  width: auto;
  height: auto;
}
</style>
