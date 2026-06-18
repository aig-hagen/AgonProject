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
import { computed, shallowRef, watch } from 'vue'

import {
  createDefaultExtensionWindowInstance,
  type ExtensionWindowInstanceState,
} from '@/modules/collective-attacks-argumentation/evaluation/extensionWindowState'
import { type SetAF, type SetAfArgumentData } from '@/modules/collective-attacks-argumentation/model'
import WindowExtensions from '@/modules/collective-attacks-argumentation/WindowExtensions.vue'
import type { Input } from '@/modules/common/evaluation/types'
import type { ExportFileData } from '@/modules/common/export'
import {
  type GraphEditorStateHyperLink,
  type GraphEditorStateLink,
  type GraphEditorStateNode,
  type Highlight,
  type HistoryState,
  LinkType,
  type NodeId,
} from '@/modules/common/graph-editor/graphEditor'
import GraphEditor from '@/modules/common/graph-editor/GraphEditor.vue'
import { type DocumentState, modifyDocument } from '@/modules/common/state'

const { state, historyState, documentId } = defineProps<{
  state: DocumentState<SetAF<SetAfArgumentData>>
  historyState: HistoryState
  documentId: number
}>()

const emit = defineEmits<{
  load: []
  new: []
  change: [state: DocumentState<SetAF<SetAfArgumentData>>]
  undo: []
  redo: []
  save: []
  share: []
  export: [filedata: ExportFileData]
}>()

const renderedState = shallowRef(state)
const editorState = shallowRef(transformToEditorState(state, true))

watch(
  () => state,
  () => {
    if (state.stateId === renderedState.value.stateId) return
    renderedState.value = state
    editorState.value = transformToEditorState(state, true)
  },
)

function transformToEditorState(
  state: DocumentState<SetAF<SetAfArgumentData>>,
  redraw: boolean,
) {
  const af = state.current.content
  const nodes: GraphEditorStateNode[] = [...af.arguments()].map(([id, data]) => ({
    id,
    label: data.name,
    x: data.x,
    y: data.y,
  }))
  const links: GraphEditorStateLink[] = []
  const hyperLinks: GraphEditorStateHyperLink[] = af.attacks().map((attack) => ({
    sourceIds: attack.attackers,
    targetId: attack.target,
    type: LinkType.SINGLE,
  }))
  return { stateId: state.stateId, nodes, links, hyperLinks, redraw }
}

const linkConfig = {
  SINGLE: { displayName: 'Collective Attack' },
}

function createNewState(recipe: (draft: SetAF<SetAfArgumentData>) => void) {
  const nextState = modifyDocument(renderedState.value, recipe)
  if (nextState !== undefined) {
    renderedState.value = nextState
    editorState.value = transformToEditorState(nextState, false)
    emit('change', nextState)
  }
}

function onNodeCreated(data: { id: NodeId; label: string; x: number; y: number }) {
  createNewState((draft) => draft.addArgument(data.id, { name: data.label, x: data.x, y: data.y }))
}

function onNodeDeleted(data: { id: NodeId }) {
  createNewState((draft) => draft.deleteArgument(data.id))
}

function onNodeLabelEdited(data: { id: NodeId; label: string }) {
  createNewState((draft) => {
    draft.getArgument(data.id).name = data.label
  })
}

function onNodesMoved(data: { id: NodeId; x: number; y: number }[]) {
  createNewState((draft) => {
    for (const node of data) {
      const arg = draft.getArgument(node.id)
      arg.x = node.x
      arg.y = node.y
    }
  })
}

function onHyperLinkCreated(data: { sourceIds: NodeId[]; targetId: NodeId }) {
  createNewState((draft) => draft.addCollectiveAttack(data.sourceIds, data.targetId))
}

function onHyperLinkDeleted(data: { sourceIds: NodeId[]; targetId: NodeId }) {
  const sortedSourceIds = [...data.sourceIds].sort((a, b) => a - b)
  createNewState((draft) => {
    const attack = draft.attacks().find((a) => {
      const sortedAttackers = [...a.attackers].sort((a, b) => a - b)
      return (
        a.target === data.targetId &&
        sortedAttackers.length === sortedSourceIds.length &&
        sortedAttackers.every((id, i) => id === sortedSourceIds[i])
      )
    })
    if (attack !== undefined) {
      draft.deleteCollectiveAttack(attack.id)
    }
  })
}

const evaluationInput = computed<Input<SetAF<SetAfArgumentData>>>(() => ({
  stateId: state.stateId,
  content: state.current.content,
}))

const extensionInstances = useLocalStorage<ExtensionWindowInstanceState[]>(
  computed(() => `collective-attacks-argumentation:${documentId}:extension-instances`),
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
  extensionInstances.value = extensionInstances.value.map((i) => (i.id === updated.id ? updated : i))
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
    @hyper-link-created="onHyperLinkCreated"
    @hyper-link-deleted="onHyperLinkDeleted"
    :link-configs="linkConfig"
    :state="editorState"
    :allow-link-creation="false"
    :allow-link-deletion="false"
    :allow-hyper-link-creation="true"
    @undo="emit('undo')"
    @redo="emit('redo')"
    @save="emit('save')"
    @share="emit('share')"
    :history-state="historyState"
    @open-extension-window="addExtensionInstance"
  >
    <template #evaluationExtensions="{ onHighlight }">
      <WindowExtensions
        v-for="(instance, index) in extensionInstances"
        :key="instance.id"
        :input="evaluationInput"
        :instance-state="instance"
        :instance-offset="index"
        :storage-key="`collective-attacks-argumentation:${documentId}:${instance.id}:window`"
        @update:instance-state="updateExtensionInstance($event)"
        @highlight="onHighlight"
        @close="removeExtensionInstance(instance.id, onHighlight)"
      />
    </template>
  </GraphEditor>
</template>
