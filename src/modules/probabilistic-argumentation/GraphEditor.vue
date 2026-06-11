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
import { AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
import { computed, ref, shallowRef, watch } from 'vue'

import { ARGUMENT_RADIUS_IN_PX, ATTACK_COLOR } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'
import type { ExportFileData } from '@/modules/common/export'
import WindowExport from '@/modules/common/export/WindowExport.vue'
import {
  type GraphEditorStateLink,
  type GraphEditorStateNode,
  type HistoryState,
  LinkType,
  type NodeId,
} from '@/modules/common/graph-editor/graphEditor'
import GraphEditor from '@/modules/common/graph-editor/GraphEditor.vue'
import { type DocumentState, modifyDocument } from '@/modules/common/state'
import { availableExports } from '@/modules/probabilistic-argumentation/export'
import type { PafArgumentData, ProbabilisticArgumentation } from '@/modules/probabilistic-argumentation/model'
import WindowExtensions from '@/modules/probabilistic-argumentation/WindowExtensions.vue'

const { state, historyState } = defineProps<{
  state: DocumentState<ProbabilisticArgumentation<PafArgumentData>>
  historyState: HistoryState
}>()

const emit = defineEmits<{
  load: []
  new: []
  change: [state: DocumentState<ProbabilisticArgumentation<PafArgumentData>>]
  undo: []
  redo: []
  save: []
  export: [filedata: ExportFileData]
}>()

const evaluationInput = computed<Input<ProbabilisticArgumentation<PafArgumentData>>>(() => ({
  stateId: state.stateId,
  content: state.current.content,
}))

const renderedState = shallowRef(state)
const editorState = shallowRef(transformToEditorState(state, true))
const isProbabilitiesOpen = ref(false)

watch(
  () => state,
  () => {
    if (state.stateId === renderedState.value.stateId) return
    renderedState.value = state
    editorState.value = transformToEditorState(state, true)
  },
)

function transformToEditorState(
  state: DocumentState<ProbabilisticArgumentation<PafArgumentData>>,
  redraw: boolean,
) {
  const argumentation = state.current.content
  const nodes: GraphEditorStateNode[] = [...argumentation.arguments()].map(([id, data]) => ({
    id,
    label: data.name,
    x: data.x,
    y: data.y,
  }))
  const links: GraphEditorStateLink[] = [...argumentation.attacks()].map(
    ([sourceId, targetId]) => ({ sourceId, targetId, type: LinkType.SINGLE }),
  )
  return { stateId: state.stateId, nodes, links, redraw }
}

const linkConfig = {
  SINGLE: { displayName: 'Attack', color: ATTACK_COLOR },
}

function createNewState(recipe: (draft: ProbabilisticArgumentation<PafArgumentData>) => void) {
  const nextState = modifyDocument(renderedState.value, recipe)
  if (nextState !== undefined) {
    renderedState.value = nextState
    editorState.value = transformToEditorState(nextState, false)
    emit('change', nextState)
  }
}

function onNodeDeleted(data: { id: NodeId }) {
  createNewState((draft) => draft.deleteArgument(data.id))
}

function onNodeCreated(data: { id: NodeId; label: string; x: number; y: number }) {
  const argumentData: PafArgumentData = {
    name: data.label,
    x: data.x,
    y: data.y,
    probability: 1,
  }
  createNewState((draft) => draft.addArgument(data.id, argumentData))
}

function onNodeLabelEdited(data: { id: NodeId; label: string }) {
  createNewState((draft) => {
    draft.getArgument(data.id).name = data.label
  })
}

function onNodesMoved(data: { id: NodeId; x: number; y: number }[]) {
  createNewState((draft) => {
    data.forEach((node) => {
      const argumentData = draft.getArgument(node.id)
      argumentData.x = node.x
      argumentData.y = node.y
    })
  })
}

function onLinkCreated(data: { sourceId: NodeId; targetId: NodeId }) {
  createNewState((draft) => draft.addAttack(data.sourceId, data.targetId, 1))
}

function onLinkDeleted(data: { sourceId: NodeId; targetId: NodeId }) {
  createNewState((draft) => draft.deleteAttack(data.sourceId, data.targetId))
}

function onChangeArgumentProbability(id: number, probability: number) {
  createNewState((draft) => {
    draft.getArgument(id).probability = probability
  })
}

function onChangeAttackProbability(sourceId: number, targetId: number, probability: number) {
  createNewState((draft) => draft.addAttack(sourceId, targetId, probability))
}

// ── Probability overlay labels ──────────────────────────────────────────────

interface ProbabilityLabel {
  key: string
  x: number
  y: number
  value: number
  type: 'argument' | 'attack'
  id?: number
  sourceId?: number
  targetId?: number
}

function getProbabilityLabels(nodes: GraphEditorStateNode[]): ProbabilityLabel[] {
  const positions = new Map(nodes.map((n) => [n.id, { x: n.x, y: n.y }]))
  const labels: ProbabilityLabel[] = []

  for (const [id, data] of renderedState.value.current.content.arguments()) {
    const pos = positions.get(id)
    if (pos === undefined) continue
    labels.push({
      key: `arg-${id}`,
      x: pos.x,
      y: pos.y + ARGUMENT_RADIUS_IN_PX + 12,
      value: data.probability,
      type: 'argument',
      id,
    })
  }

  for (const [sourceId, targetId, prob] of renderedState.value.current.content.attacks()) {
    if (sourceId === targetId) continue
    const source = positions.get(sourceId)
    const target = positions.get(targetId)
    if (source === undefined || target === undefined) continue
    labels.push({
      key: `atk-${sourceId}-${targetId}`,
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2,
      value: prob,
      type: 'attack',
      sourceId,
      targetId,
    })
  }

  return labels
}

// ── Inline editing popup ────────────────────────────────────────────────────

const editingLabel = shallowRef<(ProbabilityLabel & { screenX: number; screenY: number }) | null>(null)
const editingValue = ref(0)

function openEditor(event: MouseEvent, label: ProbabilityLabel) {
  event.stopPropagation()
  editingLabel.value = { ...label, screenX: event.clientX, screenY: event.clientY }
  editingValue.value = label.value
}

function applyEdit(value: number) {
  const clamped = Math.max(0, Math.min(1, value))
  editingValue.value = clamped
  const lbl = editingLabel.value
  if (lbl === undefined || lbl === null) return
  if (lbl.type === 'argument' && lbl.id !== undefined) {
    onChangeArgumentProbability(lbl.id, clamped)
  } else if (lbl.type === 'attack' && lbl.sourceId !== undefined && lbl.targetId !== undefined) {
    onChangeAttackProbability(lbl.sourceId, lbl.targetId, clamped)
  }
}

function closeEditor() {
  editingLabel.value = null
}

function onPopupKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeEditor()
}
</script>

<template>
  <div class="h-full w-full relative">
    <GraphEditor
      v-if="editorState"
      @new="emit('new')"
      @load="emit('load')"
      @node-created="onNodeCreated"
      @node-deleted="onNodeDeleted"
      @node-label-edited="onNodeLabelEdited"
      @nodes-moved="onNodesMoved"
      @link-created="onLinkCreated"
      @link-deleted="onLinkDeleted"
      :link-configs="linkConfig"
      :state="editorState"
      :history-state="historyState"
      @undo="emit('undo')"
      @redo="emit('redo')"
      @save="emit('save')"
    >
      <template #toolbar>
        <button
          class="btn btn-square btn-sm"
          :class="{ 'btn-active': isProbabilitiesOpen }"
          title="Probabilities"
          @click="isProbabilitiesOpen = !isProbabilitiesOpen"
        >
          <AdjustmentsHorizontalIcon class="size-6 opacity-70" />
        </button>
      </template>

      <template #nodeOverlay="{ nodes }">
        <g
          v-for="label in getProbabilityLabels(nodes)"
          :key="label.key"
          style="pointer-events: all; cursor: pointer"
          @click="openEditor($event, label)"
        >
          <rect
            :x="label.x - 13"
            :y="label.y - 7"
            width="26"
            height="14"
            rx="7"
            fill="white"
          />
          <text
            :x="label.x"
            :y="label.y"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="9"
            font-family="monospace"
            :fill="ATTACK_COLOR"
          >{{ label.value.toFixed(2) }}</text>
        </g>
      </template>

      <template #export="{ isOpen, onIsOpen }">
        <WindowExport
          :input="state.current.content"
          :open="isOpen"
          @update:open="onIsOpen"
          :export-configs="availableExports"
          @export="emit('export', $event)"
        />
      </template>
    </GraphEditor>

    <WindowExtensions
      v-model:open="isProbabilitiesOpen"
      :input="evaluationInput"
      @change-argument-probability="onChangeArgumentProbability"
      @change-attack-probability="onChangeAttackProbability"
    />

    <Teleport to="body">
      <template v-if="editingLabel !== null">
        <div
          class="fixed inset-0 z-40"
          @click="closeEditor"
          @keydown="onPopupKeydown"
        />
        <div
          class="fixed z-50 bg-base-100 border border-base-300 rounded-lg shadow-xl p-3 flex flex-col gap-2 w-48"
          :style="{ left: `${editingLabel.screenX + 8}px`, top: `${editingLabel.screenY + 8}px` }"
          @click.stop
          @keydown="onPopupKeydown"
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="range range-xs"
            :value="editingValue"
            @input="applyEdit(parseFloat(($event.target as HTMLInputElement).value))"
          />
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            class="input input-xs w-full text-right font-mono"
            :value="editingValue"
            @change="applyEdit(parseFloat(($event.target as HTMLInputElement).value))"
          />
        </div>
      </template>
    </Teleport>
  </div>
</template>
