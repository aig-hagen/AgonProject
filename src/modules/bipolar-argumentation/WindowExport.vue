<script setup lang="ts">
import { BipoloarArgumentation } from './model'
import { ARGUMENT_RADIUS_IN_PX, type ArgumentData } from '../common/argumentation/model'
import FloatingWindow from '../../modules/common/window/FloatingWindow.vue'
import { computed, useTemplateRef, watchEffect } from 'vue'

const open = defineModel<boolean>('open', { required: true })
const { input } = defineProps<{
  input: BipoloarArgumentation<ArgumentData>
}>()

const inverseScaleFactor = ARGUMENT_RADIUS_IN_PX * 2
const text = computed(() => {
  if (!open.value) {
    return undefined
  }
  // See https://github.com/aig-hagen/tikz_argumentation for spec
  let text = ''
  text += `\\begin{af}\n`
  for (const [argumentId, argumentData] of input.arguments()) {
    // TODO warning about escaped charachters
    // TODO Note that this escaping is conservaite and might be carfully extended
    const nameEscaped = argumentData.name.replace(/[^a-zA-Z0-9 ]/g, '')
    text += `  \\argument(${argumentId}){${nameEscaped}} at (${argumentData.x / inverseScaleFactor},${(argumentData.y / inverseScaleFactor) * -1})\n`
  }
  for (const [attackerId, attackedId] of input.attacks()) {
    text += `  \\attack{${attackerId}}{${attackedId}}\n`
  }
  for (const [supporerId, supportedId] of input.supports()) {
    text += `  \\support{${supporerId}}{${supportedId}}\n`
  }
  text += `\\end{af}\n`
  return text
})

const tikzSvgContainer = useTemplateRef('tikzSvgContainer')
watchEffect(() => {
  if (tikzSvgContainer.value === null) {
    return
  }
  if (text.value === undefined) {
    tikzSvgContainer.value.replaceChildren()
  } else {
    const script = document.createElement('script')
    script.type = 'text/tikz'
    script.dataset.disableCache = 'true'
    script.dataset.showConsole = 'true'
    script.dataset.texPackages = JSON.stringify({ argumentation: '' })
    script.text = text.value
    tikzSvgContainer.value.replaceChildren(script)
  }
})
</script>

<template>
  <FloatingWindow v-model:open="open" title="Export" :initial-position="{ x: 128, y: 256 }">
    <div class="p-4">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Parameters</legend>
        <div class="flex gap-2 flex-wrap">
          <label class="select select-sm w-52">
            <span class="label">Format</span>
            <select disabled>
              <option selected>LaTeX</option>
            </select>
          </label>
        </div>
      </fieldset>
      <fieldset class="fieldset" v-show="text !== undefined">
        <details class="collapse collapse-arrow">
          <summary class="collapse-title fieldset-legend ps-0 max-w-max">Source</summary>
          <div class="collapse-content text-sm p-0">
            <div class="mb-1">
              <pre><code>{{ text }}</code></pre>
            </div>
          </div>
        </details>
      </fieldset>
      <fieldset class="fieldset" v-show="text !== undefined">
        <details class="collapse collapse-arrow">
          <summary class="collapse-title fieldset-legend ps-0 max-w-max">Image</summary>
          <div class="mb-1">
            <div class="rendered-tikz-container" ref="tikzSvgContainer"></div>
          </div>
        </details>
      </fieldset>
    </div>
  </FloatingWindow>
</template>
<style style="scoped">
.rendered-tikz-container svg {
  max-width: 100%;
}
</style>
