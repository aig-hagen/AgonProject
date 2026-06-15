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
import { useLocalStorage } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'

import { ARGUMENT_RADIUS_IN_PX } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'
import type { ExportFileData } from '@/modules/common/export'
import WindowExport from '@/modules/common/export/WindowExport.vue'
import {
  type GraphEditorStateLink,
  type GraphEditorStateNode,
  type Highlight,
  type HistoryState,
  LinkType,
  type NodeId,
} from '@/modules/common/graph-editor/graphEditor'
import GraphEditor from '@/modules/common/graph-editor/GraphEditor.vue'
import { type DocumentState, modifyDocument } from '@/modules/common/state'
import { type FormulaNode,formulaToString } from '@/modules/dialectical-argumentation/condition/formula'
import ConditionEditorBar from '@/modules/dialectical-argumentation/ConditionEditorBar.vue'
import {
  createDefaultExtensionWindowInstance,
  type ExtensionWindowInstanceState,
} from '@/modules/dialectical-argumentation/evaluation/extensionWindowState'
import { availableExports } from '@/modules/dialectical-argumentation/export'
import type { AdfArgumentData, DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'
import WindowInterpretations from '@/modules/dialectical-argumentation/WindowInterpretations.vue'

const { state, historyState, documentId } = defineProps<{
  state: DocumentState<DialecticalArgumentation<AdfArgumentData>>
  historyState: HistoryState
  documentId: number
}>()

const emit = defineEmits<{
  load: []
  new: []
  change: [state: DocumentState<DialecticalArgumentation<AdfArgumentData>>]
  undo: []
  redo: []
  save: []
  share: []
  export: [filedata: ExportFileData]
}>()

const renderedState = shallowRef(state)
const editorState = shallowRef(transformToEditorState(state, true))

const evaluationInput = computed<Input<DialecticalArgumentation<AdfArgumentData>>>(() => ({
  stateId: renderedState.value.stateId,
  content: renderedState.value.current.content,
}))

watch(
  () => state,
  () => {
    if (state.stateId === renderedState.value.stateId) {
      return
    }
    renderedState.value = state
    editorState.value = transformToEditorState(state, true)
  },
)

function transformToEditorState(
  state: DocumentState<DialecticalArgumentation<AdfArgumentData>>,
  redraw: boolean,
) {
  const adf = state.current.content
  const nodes: GraphEditorStateNode[] = [...adf.arguments()].map(([id, data]) => ({
    id,
    label: data.name,
    x: data.x,
    y: data.y,
  }))
  const links: GraphEditorStateLink[] = [...adf.links()].map(([source, target]) => ({
    sourceId: source,
    targetId: target,
    type: LinkType.SINGLE,
  }))
  return { stateId: state.stateId, nodes, links, redraw }
}

const linkConfig = {
  SINGLE: {
    displayName: 'Link',
  },
}

function createNewState(
  recipe: (draft: DialecticalArgumentation<AdfArgumentData>) => void,
  redraw = false,
) {
  const nextState = modifyDocument(renderedState.value, recipe)
  if (nextState !== undefined) {
    renderedState.value = nextState
    editorState.value = transformToEditorState(nextState, redraw)
    emit('change', nextState)
  }
}

function onNodeDeleted(data: { id: NodeId }) {
  if (selectedNodeId.value === data.id) {
    selectedNodeId.value = null
  }
  createNewState((draft) => draft.deleteArgument(data.id))
}

function onNodeCreated(data: { id: NodeId; label: string; x: number; y: number }) {
  createNewState((draft) =>
    draft.addArgument(data.id, {
      name: data.label,
      x: data.x,
      y: data.y,
      condition: { type: 'tautology' },
    }),
  )
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

// Condition editor
const selectedNodeId = ref<NodeId | null>(null)
const editorAnchor = ref<{ x: number; y: number }>({ x: 0, y: 0 })

const argNameMap = computed(() => {
  const map = new Map<number, string>()
  for (const [id, data] of renderedState.value.current.content.arguments()) {
    map.set(id, data.name)
  }
  return map
})

function getConditionString(nodeId: NodeId): string {
  const condition = renderedState.value.current.content.getArgument(nodeId).condition
  return formulaToString(condition, argNameMap.value)
}


function openConditionEditor(nodeId: NodeId, event: MouseEvent) {
  selectedNodeId.value = nodeId
  const svgEl = (event.currentTarget as SVGElement).ownerSVGElement!
  const rect = svgEl.getBoundingClientRect()
  editorAnchor.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function onConditionChanged(formula: FormulaNode) {
  if (selectedNodeId.value === null) return
  const id = selectedNodeId.value
  createNewState((draft) => draft.setCondition(id, formula), true)
}

// --- Multi-instance window management ---

const extensionInstances = useLocalStorage<ExtensionWindowInstanceState[]>(
  computed(() => `dialectical-argumentation:${documentId}:extension-instances`),
  [],
)

function addExtensionInstance() {
  extensionInstances.value = [...extensionInstances.value, createDefaultExtensionWindowInstance()]
}

function removeExtensionInstance(id: string, onHighlight: (h?: Highlight) => void) {
  if (extensionInstances.value.length === 1) onHighlight(undefined)
  extensionInstances.value = extensionInstances.value.filter((i) => i.id !== id)
}

function updateExtensionInstance(updated: ExtensionWindowInstanceState) {
  extensionInstances.value = extensionInstances.value.map((i) =>
    i.id === updated.id ? updated : i,
  )
}
</script>
<template>
  <GraphEditor
    v-if="editorState"
    @new="emit('new')"
    @load="emit('load')"
    @node-created="onNodeCreated"
    @node-deleted="onNodeDeleted"
    @node-label-edited="onNodeLabelEdited"
    @nodes-moved="onNodesMoved"
    :link-configs="linkConfig"
    :allow-link-creation="false"
    :allow-link-deletion="false"
    :state="editorState"
    :history-state="historyState"
    @undo="emit('undo')"
    @redo="emit('redo')"
    @save="emit('save')"
    @share="emit('share')"
    @open-extension-window="addExtensionInstance()"
  >
    <template #nodeOverlay="{ nodes }">
      <template v-for="node in nodes" :key="node.id">
        <text
          :x="node.x + ARGUMENT_RADIUS_IN_PX + 6"
          :y="node.y - ARGUMENT_RADIUS_IN_PX + 9"
          font-size="13"
          font-family="monospace"
          stroke="white"
          stroke-width="3"
          paint-order="stroke fill"
          pointer-events="auto"
          style="cursor: pointer; user-select: none"
          @click.stop="openConditionEditor(node.id, $event)"
        >{{ getConditionString(node.id) }}</text>
      </template>
    </template>
    <template #evaluationExtensions="{ onHighlight }">
      <WindowInterpretations
        v-for="(instance, index) in extensionInstances"
        :key="instance.id"
        :input="evaluationInput"
        :instance-state="instance"
        :instance-offset="index"
        :storage-key="`dialectical-argumentation:${documentId}:${instance.id}:window`"
        @update:instance-state="updateExtensionInstance($event)"
        @highlight="onHighlight"
        @close="removeExtensionInstance(instance.id, onHighlight)"
      />
      <ConditionEditorBar
        v-if="selectedNodeId !== null"
        :argument-id="selectedNodeId"
        :adf="renderedState.current.content"
        :x="editorAnchor.x"
        :y="editorAnchor.y"
        @update:formula="onConditionChanged"
        @close="selectedNodeId = null"
      />
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
</template>
