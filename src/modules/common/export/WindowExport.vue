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
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from '@heroicons/vue/24/outline'
import { computedAsync } from '@vueuse/core'
import { basicSetup } from 'codemirror'
import copy from 'copy-to-clipboard'
import { computed, ref, shallowRef, useTemplateRef, watchEffect } from 'vue'

import ButtonCopy from '@/modules/common/export/ButtonCopy.vue'
import ButtonSave from '@/modules/common/export/ButtonSave.vue'
import { useSettings } from '@/modules/common/settings/useSettings'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

import type { ExportConfig, ExportFileData } from '.'

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

const selectedExportConfig = shallowRef<ExportConfig<DocumentT> | undefined>(exportConfigs[0])
const selectedArgumentStyle = shallowRef<string>('standard')
const selectedNameStyle = shallowRef<string>('math')
const selectedAttackStyle = shallowRef<string>('standard')
const selectedSupportStyle = shallowRef<string>('double')
const selectedNodeDistance = shallowRef<number>(1.5)

const isBipolarDocument = computed(() => {
  const maybeSupports = (input as unknown as { supports?: unknown }).supports
  return typeof maybeSupports === 'function'
})

const usePackageLine = computed(() => {
  if (selectedExportConfig.value?.name !== 'LaTeX (argumentation)') return undefined
  const opts = [
    ...(selectedArgumentStyle.value !== 'standard'
      ? [`argumentstyle=${selectedArgumentStyle.value}`]
      : []),
    `namestyle=${selectedNameStyle.value}`,
    ...(selectedAttackStyle.value !== 'standard'
      ? [`attackstyle=${selectedAttackStyle.value}`]
      : []),
  ]
  if (isBipolarDocument.value) opts.push(`supportstyle=${selectedSupportStyle.value}`)
  return `\\usepackage[${opts.join(',')}]{argumentation}`
})

const packageLineCopied = ref(false)
let packageLineCopyTimeout: ReturnType<typeof setTimeout>
function copyPackageLine() {
  if (usePackageLine.value === undefined) return
  copy(usePackageLine.value)
  packageLineCopied.value = true
  clearTimeout(packageLineCopyTimeout)
  packageLineCopyTimeout = setTimeout(() => (packageLineCopied.value = false), 500)
}

const exportResult = computed(() => {
  if (!open.value) {
    return undefined
  }
  if (selectedExportConfig.value === undefined) {
    return undefined
  }
  return selectedExportConfig.value.export(input, {
    argumentStyle: selectedArgumentStyle.value,
    nameStyle: selectedNameStyle.value,
    attackStyle: selectedAttackStyle.value,
    supportStyle: selectedSupportStyle.value,
    nodeDistance: selectedNodeDistance.value,
    gridCellScale: gridCellScale.value,
  })
})

const saveFiledataText = computed(() => {
  if (exportResult.value === undefined) {
    return
  }
  const extension = selectedExportConfig.value?.extension ?? 'tex'
  return {
    content: exportResult.value.text,
    ending: extension,
  }
})

const svgTextEvaluating = shallowRef(false)
const svgTextMaybeLoading = computedAsync(
  async () => {
    const svgPromise = exportResult.value?.svg
    if (svgPromise === undefined) {
      return null
    }
    return await svgPromise
  },
  null,
  svgTextEvaluating,
)

const svgText = computed(() => {
  if (svgTextEvaluating.value || svgTextMaybeLoading.value === null) {
    return undefined
  }
  return svgTextMaybeLoading.value
})

const saveFiledataSvg = computed(() => {
  if (svgText.value === undefined) {
    return
  }
  return {
    content: svgText.value,
    ending: 'svg',
  }
})

watchEffect(() => {
  if (soureViewRef.value === null) {
    return
  }
  editorView.value?.destroy()
  if (selectedExportConfig.value === undefined) {
    return
  }
  const codemirrorOptions = selectedExportConfig.value.codemirrorOptions

  const additionalExtensions: Extension[] = codemirrorOptions?.extensions ?? []
  editorView.value = new EditorView({
    doc: undefined,
    parent: soureViewRef.value!,
    // See https://codemirror.net/examples/readonly/
    extensions: [
      basicSetup,
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      EditorView.contentAttributes.of({ tabindex: '0' }),
      ...additionalExtensions,
    ],
  })
})

watchEffect(() => {
  if (editorView.value === undefined) {
    return
  }
  if (selectedExportConfig.value === undefined) {
    return
  }
  if (exportResult.value === undefined) {
    return
  }
  editorView.value.dispatch({
    changes: { from: 0, insert: exportResult.value.text, to: editorView.value.state.doc.length },
  })
})
</script>

<template>
  <FloatingWindow
    v-model:open="open"
    title="Export"
    :initial-position="{ x: 64, y: 128 }"
    :intitalSize="{ width: 700, height: 480 }"
  >
    <div class="p-4">
      <fieldset class="fieldset">
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-66">
            <span class="label">Format</span>
            <select v-model="selectedExportConfig">
              <option
                v-for="exportConfig in exportConfigs"
                :key="exportConfig.name"
                :value="exportConfig"
              >
                {{ exportConfig.name }}
              </option>
            </select>
          </label>
          <a
            v-if="selectedExportConfig?.references?.[0]"
            :href="selectedExportConfig.references[0].url"
            :title="selectedExportConfig.references[0].label"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm btn-ghost btn-square self-end"
          >
            <ArrowTopRightOnSquareIcon class="size-4" />
          </a>
        </div>
      </fieldset>
      <fieldset v-if="selectedExportConfig?.name === 'LaTeX (argumentation)'" class="fieldset">
        <details class="collapse collapse-arrow">
          <summary class="collapse-title fieldset-legend ps-0 max-w-max">Style Parameters</summary>
          <div class="collapse-content px-4 pb-4 pt-2">
            <div class="flex gap-2 flex-wrap">
              <label class="select select-sm w-66">
                <span class="label">Argument Style</span>
                <select v-model="selectedArgumentStyle">
                  <option value="standard">standard</option>
                  <option value="large">large</option>
                  <option value="thick">thick</option>
                  <option value="gray">gray</option>
                  <option value="colored">colored</option>
                </select>
              </label>
              <label class="select select-sm w-66">
                <span class="label">Name Style</span>
                <select v-model="selectedNameStyle">
                  <option value="math">math</option>
                  <option value="bold">bold</option>
                  <option value="monospace">monospace</option>
                  <option value="monoemph">monoemph</option>
                  <option value="none">none</option>
                </select>
              </label>
              <label class="select select-sm w-66">
                <span class="label">Attack Style</span>
                <select v-model="selectedAttackStyle">
                  <option value="standard">standard</option>
                  <option value="large">large</option>
                  <option value="modern">modern</option>
                </select>
              </label>
              <label v-if="isBipolarDocument" class="select select-sm w-66">
                <span class="label">Support Style</span>
                <select v-model="selectedSupportStyle">
                  <option value="standard">standard</option>
                  <option value="dashed">dashed</option>
                  <option value="double">double</option>
                </select>
              </label>
            </div>
            <div class="mt-4 flex flex-wrap gap-4 items-center">
              <label class="label gap-2">
                <span>Node Distance</span>
                <input
                  type="range"
                  class="range range-sm w-28"
                  min="0.5"
                  max="4"
                  step="0.25"
                  v-model.number="selectedNodeDistance"
                />
                <span class="text-sm w-6 text-right opacity-60">{{ selectedNodeDistance }}</span>
              </label>
            </div>
          </div>
        </details>
        <div class="relative mt-2 w-fit max-w-md">
          <input
            type="text"
            class="input input-xs font-mono max-w-md pr-8 field-sizing-content"
            readonly
            :value="usePackageLine"
          />
          <button
            class="absolute right-1 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost btn-square"
            :disabled="usePackageLine === undefined"
            @click="copyPackageLine"
          >
            <ClipboardDocumentCheckIcon v-if="packageLineCopied" class="size-3.5" />
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
                text
              </ButtonSave>
              <ButtonCopy class="btn btn-sm btn-soft w-28 justify-start" :text="exportResult?.text">
                text
              </ButtonCopy>
            </div>
            <div class="min-w-58 bg-white rounded" ref="soureView"></div>
          </fieldset>
        </div>
        <div v-if="exportResult?.svg !== undefined" v-show="exportResult !== undefined">
          <fieldset class="fieldset">
            <div class="flex gap-2 flex-wrap mb-2">
              <ButtonSave
                class="btn btn-sm btn-soft w-28 justify-start"
                :filedata="saveFiledataSvg"
                @export="emit('export', $event)"
              >
                SVG
              </ButtonSave>
              <ButtonCopy class="btn btn-sm btn-soft w-28 justify-start" :text="svgText">
                SVG
              </ButtonCopy>
            </div>
            <div>
              <div v-if="svgText === undefined" role="alert" class="alert alert-info alert-soft">
                <span>Rendering SVG</span>
              </div>
              <div v-else v-html="svgText" class="w-fit bg-white rounded p-1"></div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  </FloatingWindow>
</template>
<style scoped>
:deep(.cm-editor) {
  background-color: white;
  color: black;
}
:deep(.cm-content) {
  color: black;
}
:deep(.cm-gutters) {
  background-color: white;
}
:deep(.cm-tooltip) {
  display: none;
}
</style>
