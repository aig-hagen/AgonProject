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
import { computed, nextTick, onMounted, ref, useId, useTemplateRef, watch } from 'vue'

import {
  layoutGraph,
  type SerialisationGraph,
} from '@/modules/abstract-argumentation/evaluation/serialisationGraph'

const { graph, selectedPath, pending, formatState, formatStep } = defineProps<{
  graph: SerialisationGraph
  selectedPath: readonly string[]
  pending: ReadonlySet<string>
  formatState: (key: string) => string
  formatStep: (step: readonly number[]) => string
}>()

const emit = defineEmits<{
  select: [key: string]
  hover: [key: string | undefined]
}>()

const NODE_HEIGHT = 28
const ROW_PITCH = 44
const NODE_PADDING = 22
const MIN_GAP = 56
const MARGIN = 8

// Labels are mono, so one measured character width sizes every box.
const probe = useTemplateRef<HTMLSpanElement>('probe')
const charWidth = ref(8.4)
function measure() {
  if (probe.value) charWidth.value = probe.value.getBoundingClientRect().width / 10 || 8.4
}
onMounted(() => {
  measure()
  void document.fonts?.ready.then(measure)
})

const markerId = `serialisation-arrow-${useId()}`

// The terminal ring sits 3px outside the box; edges stop short of it.
const ringGap = (key: string) => (graph.states.get(key)?.terminal ? 3 : 0)

const layout = computed(() => {
  const { columns, position } = layoutGraph(graph)
  const cw = charWidth.value
  // Labels set word spacing to -0.5ch, so each space is half as wide.
  const textWidth = (text: string) => (text.length - (text.split(' ').length - 1) / 2) * cw
  const nodeWidth = new Map(
    [...graph.states.keys()].map((key) => [key, textWidth(formatState(key)) + NODE_PADDING]),
  )
  const columnWidth = columns.map((col) => Math.max(...col.map((key) => nodeWidth.get(key)!)))
  const gaps = columns.map((_, c) => {
    const labels = graph.edges
      .filter((e) => position.get(e.to)!.column === c && position.get(e.from)!.column === c - 1)
      .map((e) => textWidth(formatStep(e.step)) + 32)
    return Math.max(MIN_GAP, ...labels)
  })
  const columnX: number[] = []
  let x = MARGIN
  columns.forEach((_, c) => {
    if (c > 0) x += gaps[c]!
    columnX.push(x)
    x += columnWidth[c]!
  })
  const maxRows = Math.max(...columns.map((col) => col.length))

  const boxes = new Map(
    [...position].map(([key, { column, row }]) => {
      const width = nodeWidth.get(key)!
      const offset = (maxRows - columns[column]!.length) / 2
      return [
        key,
        {
          x: columnX[column]! + (columnWidth[column]! - width) / 2,
          y: MARGIN + (offset + row) * ROW_PITCH,
          width,
        },
      ]
    }),
  )

  const current = selectedPath[selectedPath.length - 1]
  const onPath = new Set<string>()
  for (let i = 1; i < selectedPath.length; i++)
    onPath.add(`${selectedPath[i - 1]}>${selectedPath[i]}`)

  const edges = graph.edges.map((e) => {
    const from = boxes.get(e.from)!
    const to = boxes.get(e.to)!
    const key = `${e.from}>${e.to}`
    const x1 = from.x + from.width + ringGap(e.from)
    const y1 = from.y + NODE_HEIGHT / 2
    const x2 = to.x - 2 - ringGap(e.to)
    const y2 = to.y + NODE_HEIGHT / 2
    const dx = (x2 - x1) / 2
    return {
      key,
      d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`,
      label: formatStep(e.step),
      // Three quarters along the curve, where edges leaving one state have spread out.
      labelX: 0.15625 * x1 + 0.84375 * x2,
      labelY: 0.15625 * y1 + 0.84375 * y2 - 8,
      onPath: onPath.has(key),
      // Only the path and the next steps are labelled; the rest would pile up.
      labelled: onPath.has(key) || e.from === current,
    }
  })

  return {
    boxes,
    edges,
    width: x + MARGIN,
    height: MARGIN * 2 + (maxRows - 1) * ROW_PITCH + NODE_HEIGHT,
  }
})

const selected = computed(() => selectedPath[selectedPath.length - 1])

// Keep the selected state on screen, e.g. after picking a next step below the fold.
const container = useTemplateRef<HTMLDivElement>('container')
watch(selected, async (key) => {
  await nextTick()
  container.value
    ?.querySelector(`[data-state-key="${CSS.escape(key ?? '')}"]`)
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
})

// Nodes the path passes through get a blue border; the root counts only once a step is taken.
const passedThrough = computed(() => new Set(selectedPath.slice(0, -1)))

function nodeClass(key: string) {
  const state = graph.states.get(key)!
  const isSelected = key === selected.value
  const onPath = passedThrough.value.has(key)
  const tone = isSelected || onPath ? 'primary' : state.terminal ? 'muted' : 'plain'
  const classes = isSelected
    ? ['border-primary bg-primary text-primary-content']
    : [
        { primary: 'border-primary', muted: 'border-base-content/65', plain: 'border-base-300' }[
          tone
        ],
        'bg-base-100 hover:bg-base-200',
      ]
  // Terminal states get a second border, the automata convention for final states.
  if (state.terminal)
    classes.push(
      'ring-1 ring-offset-2 ring-offset-base-100',
      tone === 'primary' ? 'ring-primary' : 'ring-base-content/65',
    )
  if (!state.expanded && state.terminal === undefined) classes.push('border-dashed')
  if (pending.has(key)) classes.push('animate-pulse')
  return classes
}
</script>

<template>
  <div ref="container" class="overflow-auto" data-evaluation-results>
    <!-- eslint-disable vue/no-bare-strings-in-template -->
    <span
      ref="probe"
      aria-hidden="true"
      class="invisible absolute font-(family-name:--font-graph) text-sm"
      >0000000000</span
    >
    <!-- eslint-enable vue/no-bare-strings-in-template -->
    <div class="relative" :style="{ width: `${layout.width}px`, height: `${layout.height}px` }">
      <svg
        class="absolute inset-0 overflow-visible"
        :width="layout.width"
        :height="layout.height"
        aria-hidden="true"
      >
        <defs>
          <marker
            v-for="variant in ['muted', 'path']"
            :id="`${markerId}-${variant}`"
            :key="variant"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerUnits="userSpaceOnUse"
            :markerWidth="variant === 'path' ? 8 : 7"
            :markerHeight="variant === 'path' ? 8 : 7"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 8 4 L 0 8 z"
              :class="variant === 'path' ? 'fill-primary' : 'fill-base-content/65'"
            />
          </marker>
        </defs>
        <g v-for="edge in layout.edges" :key="edge.key">
          <path
            :d="edge.d"
            fill="none"
            stroke="currentColor"
            :stroke-width="edge.onPath ? 2 : 1"
            :class="edge.onPath ? 'text-primary' : 'text-base-content/65'"
            :marker-end="`url(#${markerId}-${edge.onPath ? 'path' : 'muted'})`"
          />
          <text
            v-if="edge.labelled"
            :x="edge.labelX"
            :y="edge.labelY"
            text-anchor="middle"
            dominant-baseline="central"
            class="serialisation-edge-label font-(family-name:--font-graph) text-sm [word-spacing:-0.5ch]"
            :class="edge.onPath ? 'fill-primary font-semibold' : 'fill-base-content/65'"
          >
            {{ edge.label }}
          </text>
        </g>
      </svg>
      <button
        v-for="[key, box] in layout.boxes"
        :key="key"
        :data-state-key="key"
        type="button"
        class="absolute flex items-center justify-center rounded-field border font-(family-name:--font-graph) text-sm [word-spacing:-0.5ch] transition-colors"
        :class="nodeClass(key)"
        :style="{
          left: `${box.x}px`,
          top: `${box.y}px`,
          width: `${box.width}px`,
          height: `${NODE_HEIGHT}px`,
        }"
        :aria-pressed="key === selected"
        @click="emit('select', key)"
        @mouseenter="emit('hover', key)"
        @mouseleave="emit('hover', undefined)"
        @focus="emit('hover', key)"
        @blur="emit('hover', undefined)"
      >
        {{ formatState(key) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* A paper halo keeps edge labels readable where they cross other edges. */
.serialisation-edge-label {
  paint-order: stroke;
  stroke: var(--color-base-100);
  stroke-width: 4px;
  stroke-linejoin: round;
}
</style>
