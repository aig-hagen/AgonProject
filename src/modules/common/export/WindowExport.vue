<script setup lang="ts" generic="DocumentT">
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { computedAsync } from '@vueuse/core'
import { basicSetup } from 'codemirror'
import { computed, shallowRef, useTemplateRef, watchEffect } from 'vue'

import ButtonCopy from '@/modules/common/export/ButtonCopy.vue'
import ButtonSave from '@/modules/common/export/ButtonSave.vue'
import FloatingWindow from '@/modules/common/window/FloatingWindow.vue'

import type { ExportConfig } from '.'

const open = defineModel<boolean>('open', { required: true })
const { input, exportConfigs } = defineProps<{
  input: DocumentT
  exportConfigs: ExportConfig<DocumentT>[]
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

const FILE_NAME = 'argumentation'

const saveFiledataText = computed(() => {
  if (exportResult.value === undefined) {
    return
  }
  return {
    content: exportResult.value.text,
    name: FILE_NAME,
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
    name: FILE_NAME,
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
