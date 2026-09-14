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
import { computed, ref, shallowRef, useTemplateRef, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonCopy from '@/modules/common/export/ButtonCopy.vue'
import ButtonSave from '@/modules/common/export/ButtonSave.vue'
import ExportSheet from '@/modules/common/export/ExportSheet.vue'
import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import { useSettings } from '@/modules/common/settings/useSettings'
import WindowShell from '@/modules/common/window/WindowShell.vue'

import type { ExportConfig, ExportFileData } from '.'
import { ExportFormatId } from '.'

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

const usePackageLine = computed(() => {
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
  copy(usePackageLine.value)
  packageLineCopied.value = true
  clearTimeout(packageLineCopyTimeout)
  packageLineCopyTimeout = setTimeout(() => (packageLineCopied.value = false), 500)
}

const exportResult = computed(() => {
  if (!open.value) {
    return undefined
  }
  // The compact layout renders ExportSheet, which owns its own export computation.
  if (layoutMode.value === 'compact') {
    return undefined
  }
  if (latexConfig.value === undefined) {
    return undefined
  }
  return latexConfig.value.export(input, {
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
  return {
    content: exportResult.value.text,
    ending: latexConfig.value?.extension ?? 'tex',
  }
})

const svgTextEvaluating = shallowRef(false)
const svgTextMaybeLoading = computedAsync(
  async () => {
    const svgFactory = exportResult.value?.svg
    if (svgFactory === undefined) {
      return null
    }
    return await svgFactory()
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

// An explicit `watch` (not `watchEffect`) so assigning `editorView` below doesn't feed back
// as a dependency — with the async body that would re-trigger endlessly and thrash the editor.
watch(
  [soureViewRef, latexConfig],
  async ([sourceView, config], _prev, onCleanup) => {
    editorView.value?.destroy()
    editorView.value = undefined
    if (sourceView == null || config === undefined) {
      return
    }
    // The loader awaits a dynamic import; bail if the watch re-ran meanwhile.
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
      doc: undefined,
      parent: sourceView,
      // See https://codemirror.net/examples/readonly/
      extensions: [
        basicSetup,
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        EditorView.contentAttributes.of({ tabindex: '0' }),
        ...additionalExtensions,
      ],
    })
  },
  { immediate: true },
)

watchEffect(() => {
  if (editorView.value === undefined) {
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
  <WindowShell
    v-model:open="open"
    :title="t('menu.latexStudio')"
    :initial-position="{ x: 64, y: 128 }"
    :intitalSize="{ width: 700, height: 480 }"
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
          <label class="label gap-2">
            <span>{{ t('export.style.nodeDistance') }}</span>
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
        <div class="relative mt-2 w-fit max-w-md">
          <input
            type="text"
            class="input input-xs font-mono max-w-md pr-8 field-sizing-content"
            readonly
            :value="usePackageLine"
          />
          <button
            class="absolute right-1 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost btn-square"
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
                {{ t('export.formatLabels.code') }}
              </ButtonSave>
              <ButtonCopy class="btn btn-sm btn-soft w-28 justify-start" :text="exportResult?.text">
                {{ t('export.formatLabels.code') }}
              </ButtonCopy>
            </div>
            <div class="min-w-58 bg-base-100 rounded" ref="soureView"></div>
          </fieldset>
        </div>
        <div v-if="exportResult?.svg !== undefined">
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
                <span>{{ t('export.renderingSvg') }}</span>
              </div>
              <div v-else v-html="svgText" class="w-fit bg-base-100 rounded p-1"></div>
            </div>
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
