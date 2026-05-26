<!--
  Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.

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
import { computedAsync } from '@vueuse/core'
import { basicSetup } from 'codemirror'
import { computed, shallowRef, useTemplateRef, watchEffect } from 'vue'

import ButtonCopy from '@/modules/common/export/ButtonCopy.vue'
import ButtonSave from '@/modules/common/export/ButtonSave.vue'
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

const selectedExportConfig = shallowRef<ExportConfig<DocumentT> | undefined>(exportConfigs[0])
const selectedArgumentStyle = shallowRef<string>('colored')
const selectedNameStyle = shallowRef<string>('math')
const selectedAttackStyle = shallowRef<string>('standard')
const selectedSupportStyle = shallowRef<string>('standard')
const selectedSnapToGrid = shallowRef<boolean>(false)

const isBipolarDocument = computed(() => {
  const maybeSupports = (input as unknown as { supports?: unknown }).supports
  return typeof maybeSupports === 'function'
})

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
    snapToGrid: selectedSnapToGrid.value,
  })
})

const saveFiledataText = computed(() => {
  if (exportResult.value === undefined) {
    return
  }
  let extension = 'tex'
  if (selectedExportConfig.value?.name === 'ICCMA') {
    extension = 'af'
  } else if (selectedExportConfig.value?.name === 'TGF') {
    extension = 'tgf'
  }
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
    :intitalSize="{ width: 768, height: 512 }"
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
                  <option value="large">large</option>
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
              <label
                v-if="isBipolarDocument"
                class="select select-sm w-66"
              >
                <span class="label">Support Style</span>
                <select v-model="selectedSupportStyle">
                  <option value="standard">standard</option>
                  <option value="dashed">dashed</option>
                  <option value="double">double</option>
                </select>
              </label>
            </div>
            <div class="mt-4">
              <label class="label cursor-pointer">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm mr-2"
                  v-model="selectedSnapToGrid"
                />
                <span>Snap to Grid</span>
              </label>
            </div>
          </div>
        </details>
      </fieldset>
      <div class="flex gap-2 flex-wrap">
        <div class="grow max-w-92">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Text</legend>
            <div class="flex gap-2 flex-wrap mb-2">
              <ButtonSave
                class="btn btn-sm btn-soft btn-neutral w-28 justify-start"
                :filedata="saveFiledataText"
                @export="emit('export', $event)"
              >
                text
              </ButtonSave>
              <ButtonCopy
                class="btn btn-sm btn-soft btn-neutral w-28 justify-start"
                :text="exportResult?.text"
              >
                text
              </ButtonCopy>
            </div>
            <div class="min-w-58" ref="soureView"></div>
          </fieldset>
        </div>
        <div v-if="exportResult?.svg !== undefined">
          <fieldset class="fieldset" v-show="exportResult !== undefined">
            <legend class="fieldset-legend">SVG</legend>
            <div class="flex gap-2 flex-wrap mb-2">
              <ButtonSave
                class="btn btn-sm btn-soft btn-neutral w-28 justify-start"
                :filedata="saveFiledataSvg"
                @export="emit('export', $event)"
              >
                SVG
              </ButtonSave>
              <ButtonCopy
                class="btn btn-sm btn-soft btn-neutral w-28 justify-start"
                :text="svgText"
              >
                SVG
              </ButtonCopy>
            </div>
            <div>
              <div v-if="svgText === undefined" role="alert" class="alert alert-info alert-soft">
                <span>Rendering SVG</span>
              </div>
              <div v-else v-html="svgText" class="w-58 min-h-58"></div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  </FloatingWindow>
</template>
