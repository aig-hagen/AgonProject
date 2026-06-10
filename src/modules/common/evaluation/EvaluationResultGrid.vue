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
<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watchEffect } from 'vue'

const selected = defineModel<string | undefined>('selected')
const props = withDefaults(
  defineProps<{
    items: { key: string; label: string }[]
    emptyMessage?: string
    selectionHint?: string
    evaluationDurationInSeconds?: number
  }>(),
  { emptyMessage: 'No results.' },
)

const statusLine = computed(() => {
  const parts: string[] = []
  if (props.selectionHint) parts.push(props.selectionHint)
  if (props.evaluationDurationInSeconds !== undefined) parts.push(props.evaluationDurationInSeconds + 's')
  return parts.join(' · ')
})

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
      class="btn btn-sm gap-2 justify-start outline-none focus:outline-none"
      :class="{
        'btn-soft btn-neutral': selected === item.key,
        'btn-ghost': selected !== item.key,
      }"
      @click="selected = item.key"
      ref="item-refs"
    >
      {{ item.label }}
    </button>
  </div>
  <p v-if="statusLine" class="label">{{ statusLine }}</p>
</template>

<style scoped>
.evaluation-result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--evaluation-item-min-width), auto));
  justify-content: start;
}
</style>
