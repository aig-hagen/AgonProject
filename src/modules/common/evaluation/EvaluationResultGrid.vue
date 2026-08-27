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
<script setup lang="ts">
import { computed, inject, nextTick, useTemplateRef, watchEffect } from 'vue'

import { EVALUATION_STICKY_FOOTER_KEY } from '@/modules/common/evaluation/hostContext'
import ButtonCopy from '@/modules/common/export/ButtonCopy.vue'
import { useNotifications } from '@/modules/common/notifications/useNotifications'

// Mobile host pins the status/copy line to the sheet bottom; desktop leaves it in flow.
const stickyFooter = inject(EVALUATION_STICKY_FOOTER_KEY, false)

const selected = defineModel<string | undefined>('selected')
const props = withDefaults(
  defineProps<{
    items: { key: string; label: string; texLabel: string }[]
    emptyMessage?: string
    selectionHint?: string
    evaluationDurationInMs?: number
    /** Plural noun for the copy notification, e.g. "extensions". */
    resultNoun?: string
  }>(),
  { emptyMessage: 'No results.', resultNoun: 'results' },
)

const statusLine = computed(() => {
  const parts: string[] = []
  if (props.evaluationDurationInMs !== undefined) parts.push(props.evaluationDurationInMs + 'ms')
  if (props.selectionHint) parts.push(props.selectionHint)
  return parts.join(' · ')
})

const copyText = computed(() => props.items.map((item) => item.label).join(', '))
const copyTextTex = computed(() => props.items.map((item) => item.texLabel).join(', '))

const { addSuccessNotification } = useNotifications()

function notifyCopied(format: 'plain' | 'tex') {
  const suffix = format === 'tex' ? ' (LaTeX)' : ''
  addSuccessNotification(`Copied ${props.resultNoun} to clipboard${suffix}`)
}

const containerRef = useTemplateRef('container')
const itemRefs = useTemplateRef('item-refs')

const FALLBACK_WIDTH = 192
const MIN_WIDTH_VAR = '--evaluation-item-min-width'

watchEffect(async () => {
  const container = containerRef.value
  if (container === null) return
  if (props.items.length === 0) {
    container.style.setProperty(MIN_WIDTH_VAR, `${FALLBACK_WIDTH}px`)
    return
  }
  container.style.removeProperty(MIN_WIDTH_VAR)
  await nextTick()
  const elements = itemRefs.value as HTMLElement[] | null
  if (elements === null || elements.length === 0) return
  const maxWidth = Math.max(...elements.map((el) => el.getBoundingClientRect().width))
  container.style.setProperty(MIN_WIDTH_VAR, `${maxWidth}px`)
})
</script>

<template>
  <div v-if="props.items.length === 0" role="alert" class="alert alert-info alert-soft">
    <span>{{ props.emptyMessage }}</span>
  </div>
  <div v-else class="evaluation-result-grid gap-2" ref="container">
    <button
      v-for="item of props.items"
      :key="item.key"
      type="button"
      class="btn btn-sm gap-2 justify-start outline-none focus:outline-none text-base"
      :class="{
        'btn-soft': selected === item.key,
        'btn-ghost': selected !== item.key,
      }"
      @click="selected = selected === item.key ? undefined : item.key"
      ref="item-refs"
    >
      {{ item.label }}
    </button>
  </div>
  <div
    v-if="statusLine || props.items.length > 0"
    class="flex items-center justify-between gap-2"
    :class="
      stickyFooter &&
      'sticky bottom-0 z-10 -mx-3 mt-auto border-t border-base-200 bg-base-100 px-3 py-1.5'
    "
  >
    <p v-if="statusLine" class="label min-w-0 truncate">{{ statusLine }}</p>
    <div v-if="props.items.length > 0" class="join ml-auto shrink-0">
      <ButtonCopy
        class="btn join-item btn-square btn-xs btn-ghost"
        :text="copyText"
        icon-only
        title="Copy as plain text"
        @copied="notifyCopied('plain')"
      />
      <ButtonCopy
        class="btn join-item btn-square btn-xs btn-ghost"
        :text="copyTextTex"
        icon-only
        tex
        title="Copy as TeX"
        @copied="notifyCopied('tex')"
      />
    </div>
  </div>
</template>

<style scoped>
.evaluation-result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--evaluation-item-min-width), auto));
  justify-content: start;
}
</style>
