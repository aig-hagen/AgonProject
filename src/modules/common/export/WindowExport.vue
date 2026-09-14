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
import { Annotation, type Extension, Transaction } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  PencilSquareIcon,
} from '@heroicons/vue/24/outline'
import { basicSetup } from 'codemirror'
import copy from 'copy-to-clipboard'
import { computed, onBeforeUnmount, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { buildAfOptionList, spliceAfOptions } from '@/modules/common/argumentation/export'
import ButtonCopy from '@/modules/common/export/ButtonCopy.vue'
import ButtonSave from '@/modules/common/export/ButtonSave.vue'
import ExportSheet from '@/modules/common/export/ExportSheet.vue'
import ParameterField from '@/modules/common/forms/ParameterField.vue'
import PickerSelect, { type PickerOption } from '@/modules/common/forms/PickerSelect.vue'
import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import { useSettings } from '@/modules/common/settings/useSettings'
import WindowShell from '@/modules/common/window/WindowShell.vue'

import type { ExportConfig, ExportFileData } from '.'
import { ExportFormatId } from '.'

// Marks CodeMirror transactions the studio dispatches itself (graph/style regeneration). Any
// doc change WITHOUT this annotation is a user edit and detaches the buffer from the graph.
const internalChange = Annotation.define<boolean>()

const PREAMBLE_HINT = '\\usepackage{argumentation}'

const { t } = useI18n({ useScope: 'global' })

const open = defineModel<boolean>('open', { required: true })
const { input, exportConfigs } = defineProps<{
  input: DocumentT
  exportConfigs: ExportConfig<DocumentT>[]
}>()

const emit = defineEmits<{
  export: [filedata: ExportFileData]
}>()

const soureViewRef = useTemplateRef('soureView')
const editorView = shallowRef<EditorView | undefined>(undefined)

const { gridCellScale } = useSettings()
const { layoutMode } = useLayoutMode()

// The studio only ever handles the LaTeX config; the trivial formats moved to the Export menu.
const latexConfig = computed<ExportConfig<DocumentT> | undefined>(() =>
  exportConfigs.find((config) => config.id === ExportFormatId.Latex),
)

const selectedArgumentStyle = shallowRef<string>('standard')
const selectedNameStyle = shallowRef<string>('math')
const selectedAttackStyle = shallowRef<string>('standard')
const selectedSupportStyle = shallowRef<string>('double')
const selectedNodeDistance = shallowRef<number>(2)

// The style values are the package's own (untranslated) keywords, so label == value.
const toOptions = (values: string[]): PickerOption[] => values.map((v) => ({ value: v, label: v }))
const argumentStyleOptions = toOptions(['standard', 'large', 'thick', 'gray', 'colored'])
const nameStyleOptions = toOptions(['math', 'bold', 'monospace', 'monoemph', 'none'])
const attackStyleOptions = toOptions(['standard', 'large', 'modern'])
const supportStyleOptions = toOptions(['standard', 'dashed', 'double'])

const isBipolarDocument = computed(() => {
  const maybeSupports = (input as unknown as { supports?: unknown }).supports
  return typeof maybeSupports === 'function'
})

// 'synced': the buffer is a pure function of the graph. 'detached': the user has edited the code,
// so graph edits no longer touch it. A detached buffer with a broken \begin{af} marker sets
// `validation`, blocking style-option splicing until Reset to graph.
const mode = shallowRef<'synced' | 'detached'>('synced')
const validation = shallowRef<'missing' | 'ambiguous' | undefined>(undefined)
const bufferText = shallowRef('')

function currentOptionList(): string {
  return buildAfOptionList(
    {
      argumentStyle: selectedArgumentStyle.value,
      nameStyle: selectedNameStyle.value,
      attackStyle: selectedAttackStyle.value,
      supportStyle: selectedSupportStyle.value,
    },
    isBipolarDocument.value,
  )
}

function generateSyncedBuffer(): string {
  const config = latexConfig.value
  if (config === undefined) return ''
  const body = config.export(input, {
    argumentStyle: selectedArgumentStyle.value,
    nameStyle: selectedNameStyle.value,
    attackStyle: selectedAttackStyle.value,
    supportStyle: selectedSupportStyle.value,
    nodeDistance: selectedNodeDistance.value,
    gridCellScale: gridCellScale.value,
  }).text
  return spliceAfOptions(body, currentOptionList()).text
}

// Replaces the whole document with our own transaction, kept out of undo history so
// regeneration never pollutes the user's undo stack.
function setBuffer(text: string) {
  const view = editorView.value
  if (view === undefined) return
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: text },
    annotations: [internalChange.of(true), Transaction.addToHistory.of(false)],
  })
}

function applySynced() {
  mode.value = 'synced'
  validation.value = undefined
  setBuffer(generateSyncedBuffer())
}

function resetToGraph() {
  applySynced()
}

// SYNCED: graph, node distance and grid scale regenerate the whole body.
watch([() => input, selectedNodeDistance, () => gridCellScale.value], () => {
  if (!open.value || editorView.value === undefined) return
  if (mode.value === 'synced') setBuffer(generateSyncedBuffer())
})

// Appearance knobs re-splice the \begin{af}[…] options in both states (body preserved when detached).
watch([selectedArgumentStyle, selectedNameStyle, selectedAttackStyle, selectedSupportStyle], () => {
  if (!open.value || editorView.value === undefined) return
  if (mode.value === 'synced') {
    setBuffer(generateSyncedBuffer())
    return
  }
  const result = spliceAfOptions(bufferText.value, currentOptionList())
  if (result.ok) {
    validation.value = undefined
    setBuffer(result.text)
  } else {
    validation.value = result.reason
  }
})

// ── Live preview ────────────────────────────────────────────────────────────
const previewSvg = shallowRef<string | undefined>(undefined)
const previewLoading = shallowRef(false)
const previewError = shallowRef<string | undefined>(undefined)
// Monotonic generation so a slow render can never overwrite a newer one's result.
let renderGeneration = 0
let debounceTimer: ReturnType<typeof setTimeout> | undefined

async function runRender() {
  const generation = ++renderGeneration
  const text = bufferText.value
  if (!text) {
    previewSvg.value = undefined
    previewLoading.value = false
    return
  }
  previewLoading.value = true
  previewError.value = undefined
  try {
    const { renderSvg } = await import('@/modules/common/export/renderSvg')
    const svg = await renderSvg(text)
    if (generation !== renderGeneration) return
    previewSvg.value = svg
  } catch (error) {
    if (generation !== renderGeneration) return
    previewSvg.value = undefined
    previewError.value = error instanceof Error ? error.message : String(error)
  } finally {
    if (generation === renderGeneration) previewLoading.value = false
  }
}

function scheduleRender(immediate: boolean) {
  clearTimeout(debounceTimer)
  if (immediate) {
    void runRender()
  } else {
    debounceTimer = setTimeout(() => void runRender(), 500)
  }
}

const saveFiledataText = computed(() =>
  bufferText.value
    ? { content: bufferText.value, ending: latexConfig.value?.extension ?? 'tex' }
    : undefined,
)
const preambleCopied = ref(false)
let preambleCopyTimeout: ReturnType<typeof setTimeout>
function copyPreamble() {
  copy(PREAMBLE_HINT)
  preambleCopied.value = true
  clearTimeout(preambleCopyTimeout)
  preambleCopyTimeout = setTimeout(() => (preambleCopied.value = false), 500)
}

// ── Editor lifecycle ──────────────────────────────────────────────────────────
watch(
  [soureViewRef, latexConfig],
  async ([sourceView, config], _prev, onCleanup) => {
    editorView.value?.destroy()
    editorView.value = undefined
    if (sourceView == null || config === undefined) {
      return
    }
    let stale = false
    onCleanup(() => {
      stale = true
    })
    const additionalExtensions: Extension[] =
      (await config.codemirrorOptions?.loadExtensions()) ?? []
    if (stale) {
      return
    }
    editorView.value = new EditorView({
      parent: sourceView,
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return
          bufferText.value = update.state.doc.toString()
          const isInternal = update.transactions.some((tr) => tr.annotation(internalChange))
          if (isInternal) {
            scheduleRender(true)
            return
          }
          // A user edit detaches the buffer from the graph.
          if (mode.value === 'synced') mode.value = 'detached'
          const result = spliceAfOptions(bufferText.value, currentOptionList())
          validation.value = result.ok ? undefined : result.reason
          scheduleRender(false)
        }),
        ...additionalExtensions,
      ],
    })
    if (open.value) applySynced()
  },
  { immediate: true },
)

// WindowExport stays mounted after its first open, so the lifecycle is explicit: a fresh SYNCED
// export on open, and cancelled preview work + discarded buffer state on close.
watch(open, (isOpen) => {
  if (isOpen) {
    if (layoutMode.value !== 'compact') applySynced()
  } else {
    clearTimeout(debounceTimer)
    renderGeneration++
    previewLoading.value = false
    previewError.value = undefined
    previewSvg.value = undefined
    mode.value = 'synced'
    validation.value = undefined
  }
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  clearTimeout(preambleCopyTimeout)
  editorView.value?.destroy()
})
</script>

<template>
  <WindowShell
    v-model:open="open"
    :title="t('menu.latexStudio')"
    :initial-position="{ x: 64, y: 128 }"
    :intitalSize="{ width: 720, height: 500 }"
  >
    <ExportSheet
      v-if="layoutMode === 'compact'"
      :input="input"
      :export-configs="exportConfigs"
      @export="emit('export', $event)"
      @close="open = false"
    />
    <div v-else-if="latexConfig" class="flex flex-col gap-4 p-4">
      <!-- Style -->
      <section class="flex flex-col gap-3">
        <div class="flex flex-wrap gap-3">
          <ParameterField :label="t('export.style.argumentStyle')" min-width="8.5rem">
            <PickerSelect v-model="selectedArgumentStyle" :options="argumentStyleOptions" />
          </ParameterField>
          <ParameterField :label="t('export.style.nameStyle')" min-width="8.5rem">
            <PickerSelect v-model="selectedNameStyle" :options="nameStyleOptions" />
          </ParameterField>
          <ParameterField :label="t('export.style.attackStyle')" min-width="8.5rem">
            <PickerSelect v-model="selectedAttackStyle" :options="attackStyleOptions" />
          </ParameterField>
          <ParameterField
            v-if="isBipolarDocument"
            :label="t('export.style.supportStyle')"
            min-width="8.5rem"
          >
            <PickerSelect v-model="selectedSupportStyle" :options="supportStyleOptions" />
          </ParameterField>
        </div>
        <div class="flex items-center gap-3 text-sm" :class="{ 'opacity-40': mode === 'detached' }">
          <span class="text-base-content/70">{{ t('export.style.nodeDistance') }}</span>
          <input
            type="range"
            class="range range-xs range-primary grow max-w-xs"
            min="0.5"
            max="4"
            step="0.25"
            :disabled="mode === 'detached'"
            v-model.number="selectedNodeDistance"
          />
          <span class="w-8 text-right font-mono text-xs opacity-70">{{
            selectedNodeDistance
          }}</span>
        </div>
      </section>

      <!-- Code + live preview -->
      <div class="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
        <section class="flex min-w-0 flex-col gap-1.5">
          <div class="flex items-center gap-2">
            <span class="section-cap">{{ t('export.formatLabels.code') }}</span>
            <span class="hairline"></span>
            <span v-if="mode === 'synced'" class="badge badge-xs badge-ghost gap-1 text-success">
              <CheckCircleIcon class="size-3.5" />{{ t('export.badge.synced') }}
            </span>
            <span v-else class="badge badge-xs badge-warning badge-soft gap-1">
              <PencilSquareIcon class="size-3.5" />{{ t('export.badge.detached') }}
            </span>
          </div>
          <div
            ref="soureView"
            class="cm-host overflow-hidden rounded-box border border-base-300 bg-base-100"
          ></div>
        </section>
        <section class="flex min-w-0 flex-col gap-1.5">
          <div class="flex items-center gap-2">
            <span class="section-cap">{{ t('export.preview') }}</span>
            <span class="hairline"></span>
            <span class="badge badge-xs badge-primary badge-soft gap-1">
              <ArrowPathIcon class="size-3.5" :class="{ 'animate-spin': previewLoading }" />{{
                previewLoading ? t('export.badge.rendering') : t('export.badge.live')
              }}
            </span>
          </div>
          <div class="preview-host rounded-box border border-base-300 bg-base-200">
            <div
              v-if="previewError"
              class="px-3 text-center text-sm text-error"
              :title="previewError"
            >
              {{ t('export.previewError') }}
            </div>
            <div
              v-else-if="previewSvg"
              v-html="previewSvg"
              class="svg-preview transition-opacity"
              :class="{ 'opacity-40': previewLoading }"
            ></div>
            <span
              v-else-if="previewLoading"
              class="loading loading-spinner loading-sm text-base-content/50"
            ></span>
            <span v-else class="text-sm text-base-content/40">{{ t('export.noGraph') }}</span>
          </div>
        </section>
      </div>

      <div v-if="validation" role="alert" class="alert alert-warning alert-soft py-2 text-sm">
        <span>{{ t(`export.validation.${validation}`) }}</span>
      </div>

      <!-- Preamble hint -->
      <div class="preamble-bar">
        <span class="preamble-tag">{{ t('export.preamble') }}</span>
        <code class="grow truncate font-mono text-xs">{{ PREAMBLE_HINT }}</code>
        <button
          class="btn btn-xs btn-ghost btn-square"
          :title="t('export.button.copyBare')"
          @click="copyPreamble"
        >
          <ClipboardDocumentCheckIcon v-if="preambleCopied" class="size-4" />
          <ClipboardDocumentIcon v-else class="size-4" />
        </button>
      </div>
      <i18n-t
        keypath="export.packageNote"
        tag="p"
        scope="global"
        class="-mt-1.5 text-xs text-base-content/50"
      >
        <template #package>
          <a
            v-if="latexConfig.references?.[0]"
            :href="latexConfig.references[0].url"
            :title="latexConfig.references[0].label"
            target="_blank"
            rel="noopener noreferrer"
            class="link link-primary"
            >argumentation</a
          >
          <template v-else>argumentation</template>
        </template>
      </i18n-t>

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button
          v-if="mode === 'detached'"
          class="btn btn-sm btn-ghost gap-1.5"
          @click="resetToGraph"
        >
          <ArrowPathIcon class="size-4" />{{ t('export.resetToGraph') }}
        </button>
        <span v-else></span>
        <div class="flex gap-2">
          <ButtonCopy tex class="btn btn-sm btn-soft" :text="bufferText || undefined">
            {{ t('export.formatLabels.code') }}
          </ButtonCopy>
          <ButtonSave
            class="btn btn-sm btn-primary"
            :filedata="saveFiledataText"
            @export="emit('export', $event)"
          >
            .tex
          </ButtonSave>
        </div>
      </div>
    </div>
  </WindowShell>
</template>
<style scoped>
/* Small uppercase section cap with a hairline rule filling the rest of the row. */
.section-cap {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-base-content);
  opacity: 0.55;
  white-space: nowrap;
}
.hairline {
  flex: 1 1 auto;
  height: 1px;
  background: var(--color-base-300);
}

/* Code editor and preview share one fixed height so the two columns line up. */
.cm-host {
  height: 12.5rem;
}
.cm-host :deep(.cm-editor) {
  height: 100%;
  background-color: var(--color-base-100);
  color: var(--color-base-content);
}
.cm-host :deep(.cm-scroller) {
  overflow: auto;
}
.cm-host :deep(.cm-content) {
  color: var(--color-base-content);
}
.cm-host :deep(.cm-gutters) {
  background-color: var(--color-base-100);
}
.cm-host :deep(.cm-tooltip) {
  display: none;
}

.preview-host {
  height: 12.5rem;
  display: grid;
  place-items: center;
  overflow: auto;
  padding: 0.5rem;
}
.svg-preview {
  display: grid;
  place-items: center;
}
.svg-preview :deep(svg) {
  max-width: 100%;
  max-height: 11.5rem;
  width: auto;
  height: auto;
}

.preamble-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.375rem 0.375rem 0.625rem;
  background: var(--color-base-200);
  border: 1px solid var(--color-base-300);
  border-radius: var(--radius-field);
}
.preamble-tag {
  flex-shrink: 0;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in oklch, var(--color-base-content) 55%, transparent);
  background: var(--color-base-100);
  border: 1px solid var(--color-base-300);
  padding: 0.05rem 0.375rem;
  border-radius: var(--radius-selector);
}
</style>
