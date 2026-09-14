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
  ArrowTopRightOnSquareIcon,
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
const selectedNodeDistance = shallowRef<number>(1.5)

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
  const fresh = generateSyncedBuffer()
  if (bufferText.value !== fresh && !window.confirm(t('export.resetConfirm'))) {
    return
  }
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
const saveFiledataSvg = computed(() =>
  previewSvg.value ? { content: previewSvg.value, ending: 'svg' } : undefined,
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
    :intitalSize="{ width: 760, height: 520 }"
  >
    <ExportSheet
      v-if="layoutMode === 'compact'"
      :input="input"
      :export-configs="exportConfigs"
      @export="emit('export', $event)"
      @close="open = false"
    />
    <div v-else-if="latexConfig" class="p-4">
      <fieldset class="fieldset">
        <div class="flex items-center gap-2">
          <span class="fieldset-legend ps-0">{{ t('export.style.parameters') }}</span>
          <a
            v-if="latexConfig.references?.[0]"
            :href="latexConfig.references[0].url"
            :title="latexConfig.references[0].label"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-xs btn-ghost btn-square"
          >
            <ArrowTopRightOnSquareIcon class="size-4" />
          </a>
          <span class="grow"></span>
          <span
            v-if="mode === 'synced'"
            class="badge badge-sm badge-ghost gap-1 text-success"
            :title="t('export.badge.synced')"
          >
            <CheckCircleIcon class="size-4" />{{ t('export.badge.synced') }}
          </span>
          <template v-else>
            <span class="badge badge-sm badge-ghost gap-1 text-warning">
              <PencilSquareIcon class="size-4" />{{ t('export.badge.detached') }}
            </span>
            <button class="btn btn-xs btn-soft gap-1" @click="resetToGraph">
              <ArrowPathIcon class="size-4" />{{ t('export.resetToGraph') }}
            </button>
          </template>
        </div>
        <div class="style-grid">
          <label class="select select-sm">
            <span class="label">{{ t('export.style.argumentStyle') }}</span>
            <select v-model="selectedArgumentStyle">
              <option value="standard">standard</option>
              <option value="large">large</option>
              <option value="thick">thick</option>
              <option value="gray">gray</option>
              <option value="colored">colored</option>
            </select>
          </label>
          <label class="select select-sm">
            <span class="label">{{ t('export.style.nameStyle') }}</span>
            <select v-model="selectedNameStyle">
              <option value="math">math</option>
              <option value="bold">bold</option>
              <option value="monospace">monospace</option>
              <option value="monoemph">monoemph</option>
              <option value="none">none</option>
            </select>
          </label>
          <label class="select select-sm">
            <span class="label">{{ t('export.style.attackStyle') }}</span>
            <select v-model="selectedAttackStyle">
              <option value="standard">standard</option>
              <option value="large">large</option>
              <option value="modern">modern</option>
            </select>
          </label>
          <label v-if="isBipolarDocument" class="select select-sm">
            <span class="label">{{ t('export.style.supportStyle') }}</span>
            <select v-model="selectedSupportStyle">
              <option value="standard">standard</option>
              <option value="dashed">dashed</option>
              <option value="double">double</option>
            </select>
          </label>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-4">
          <label class="label gap-2" :class="{ 'opacity-50': mode === 'detached' }">
            <span>{{ t('export.style.nodeDistance') }}</span>
            <input
              type="range"
              class="range range-sm w-28"
              min="0.5"
              max="4"
              step="0.25"
              :disabled="mode === 'detached'"
              v-model.number="selectedNodeDistance"
            />
            <span class="text-sm w-6 text-right opacity-60">{{ selectedNodeDistance }}</span>
          </label>
        </div>
        <div v-if="validation" role="alert" class="alert alert-warning alert-soft mt-2 py-2">
          <span>{{ t(`export.validation.${validation}`) }}</span>
        </div>
        <div class="relative mt-2 w-fit max-w-md">
          <span class="label text-xs">{{ t('export.preamble') }}</span>
          <input
            type="text"
            class="input input-xs font-mono max-w-md pr-8 field-sizing-content"
            readonly
            :value="PREAMBLE_HINT"
          />
          <button
            class="absolute right-1 bottom-0 btn btn-xs btn-ghost btn-square"
            @click="copyPreamble"
          >
            <ClipboardDocumentCheckIcon v-if="preambleCopied" class="size-3.5" />
            <ClipboardDocumentIcon v-else class="size-3.5" />
          </button>
        </div>
      </fieldset>
      <div class="flex gap-2 flex-wrap">
        <div class="grow max-w-80">
          <fieldset class="fieldset">
            <div class="flex gap-2 flex-wrap mb-2">
              <ButtonSave
                class="btn btn-sm btn-soft w-28 justify-start"
                :filedata="saveFiledataText"
                @export="emit('export', $event)"
              >
                {{ t('export.formatLabels.code') }}
              </ButtonSave>
              <ButtonCopy class="btn btn-sm btn-soft w-28 justify-start" :text="bufferText">
                {{ t('export.formatLabels.code') }}
              </ButtonCopy>
            </div>
            <div class="min-w-58 bg-base-100 rounded" ref="soureView"></div>
          </fieldset>
        </div>
        <div class="grow">
          <fieldset class="fieldset">
            <div class="flex gap-2 flex-wrap mb-2">
              <ButtonSave
                class="btn btn-sm btn-soft w-28 justify-start"
                :filedata="saveFiledataSvg"
                @export="emit('export', $event)"
              >
                SVG
              </ButtonSave>
              <ButtonCopy class="btn btn-sm btn-soft w-28 justify-start" :text="previewSvg">
                SVG
              </ButtonCopy>
            </div>
            <div
              v-if="previewError"
              role="alert"
              class="alert alert-error alert-soft"
              :title="previewError"
            >
              <span>{{ t('export.previewError') }}</span>
            </div>
            <div v-else-if="previewLoading" role="alert" class="alert alert-info alert-soft">
              <span>{{ t('export.renderingSvg') }}</span>
            </div>
            <div
              v-else-if="previewSvg"
              v-html="previewSvg"
              class="svg-preview w-fit max-w-full overflow-auto bg-base-100 rounded p-1"
            ></div>
          </fieldset>
        </div>
      </div>
    </div>
  </WindowShell>
</template>
<style scoped>
.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.25rem, 1fr));
  gap: 0.5rem;
}
.svg-preview :deep(svg) {
  max-width: 100%;
  max-height: 50vh;
  width: auto;
  height: auto;
}
:deep(.cm-editor) {
  background-color: var(--color-base-100);
  color: var(--color-base-content);
}
:deep(.cm-content) {
  color: var(--color-base-content);
}
:deep(.cm-gutters) {
  background-color: var(--color-base-100);
}
:deep(.cm-tooltip) {
  display: none;
}
</style>
