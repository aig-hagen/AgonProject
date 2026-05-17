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
const { input, exportConfigs, saveFileName } = defineProps<{
  input: DocumentT
  exportConfigs: ExportConfig<DocumentT>[]
  saveFileName: string
}>()

const emit = defineEmits<{
  export: [filedata: ExportFileData]
}>()

const soureViewRef = useTemplateRef('soureView')
const editorView = shallowRef<EditorView | undefined>(undefined)

const selectedExportConfig = shallowRef<ExportConfig<DocumentT> | undefined>(exportConfigs[0])

const exportResult = computed(() => {
  if (!open.value) {
    return undefined
  }
  if (selectedExportConfig.value === undefined) {
    return undefined
  }
  return selectedExportConfig.value.export(input)
})

const saveFiledataText = computed(() => {
  if (exportResult.value === undefined) {
    return
  }
  return {
    content: exportResult.value.text,
    name: saveFileName,
    ending: 'tex',
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
    name: saveFileName,
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
