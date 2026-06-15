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

import { ARGUMENT_RADIUS_IN_PX, ATTACK_COLOR } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'
import type { ExportFileData } from '@/modules/common/export'
import WindowExport from '@/modules/common/export/WindowExport.vue'
import ArrowLongRightDashedIcon from '@/modules/common/graph-editor/ArrowLongRightDashedIcon.vue'
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
import {
  createDefaultExtensionWindowInstance,
  type ExtensionWindowInstanceState,
} from '@/modules/incomplete-argumentation/evaluation/extensionWindowState'
import { availableExports } from '@/modules/incomplete-argumentation/export'
import type { IafArgumentData, IncompleteArgumentation } from '@/modules/incomplete-argumentation/model'
import WindowExtensions from '@/modules/incomplete-argumentation/WindowExtensions.vue'

const { state, historyState, documentId } = defineProps<{
  state: DocumentState<IncompleteArgumentation<IafArgumentData>>
  historyState: HistoryState
  documentId: number
}>()

const emit = defineEmits<{
  load: []
  new: []
  change: [state: DocumentState<IncompleteArgumentation<IafArgumentData>>]
  undo: []
  redo: []
  save: []
  share: []
  export: [filedata: ExportFileData]
}>()

const evaluationInput = computed<Input<IncompleteArgumentation<IafArgumentData>>>(() => ({
  stateId: state.stateId,
  content: state.current.content,
}))

const isDefiniteArgumentMode = ref(true)

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
  state: DocumentState<IncompleteArgumentation<IafArgumentData>>,
  redraw: boolean,
) {
  const argumentation = state.current.content
  const nodes: GraphEditorStateNode[] = [...argumentation.arguments()].map(([id, data]) => ({
    id,
    label: data.name,
    x: data.x,
    y: data.y,
  }))
  const definiteAttackLinks: GraphEditorStateLink[] = [...argumentation.definiteAttacks()].map(
    ([sourceId, targetId]) => ({ sourceId, targetId, type: LinkType.SINGLE }),
  )
  const uncertainAttackLinks: GraphEditorStateLink[] = [...argumentation.uncertainAttacks()].map(
    ([sourceId, targetId]) => ({ sourceId, targetId, type: LinkType.DOUBLE }),
  )
  return {
    stateId: state.stateId,
    nodes,
    links: [...definiteAttackLinks, ...uncertainAttackLinks],
    redraw,
  }
}

const linkConfig = {
  SINGLE: { displayName: 'Definite Attack', color: ATTACK_COLOR },
  DOUBLE: { displayName: 'Uncertain Attack', color: ATTACK_COLOR, arrowType: 'SINGLE' as const, dashArray: '8 4', icon: ArrowLongRightDashedIcon },
}

const uncertainArgumentIds = computed(() => {
  const ids = new Set<number>()
  for (const [id] of renderedState.value.current.content.uncertainArguments()) {
    ids.add(id)
  }
  return ids
})

function createNewState(recipe: (draft: IncompleteArgumentation<IafArgumentData>) => void) {
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
  const argumentData: IafArgumentData = {
    name: data.label,
    x: data.x,
    y: data.y,
    uncertain: !isDefiniteArgumentMode.value,
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

function onLinkCreated(data: { sourceId: NodeId; targetId: NodeId; type: LinkType }) {
  onLinkCreatedOrChanged(data)
}

function onLinkDeleted(data: { sourceId: NodeId; targetId: NodeId }) {
  createNewState((draft) => draft.deleteAttack(data.sourceId, data.targetId))
}

function onLinkChanged(data: { sourceId: NodeId; targetId: NodeId; type: LinkType }) {
  onLinkCreatedOrChanged(data)
}

function onLinkCreatedOrChanged(data: { sourceId: NodeId; targetId: NodeId; type: LinkType }) {
  if (data.type === LinkType.SINGLE) {
    createNewState((draft) => draft.addDefiniteAttack(data.sourceId, data.targetId))
  } else {
    createNewState((draft) => draft.addUncertainAttack(data.sourceId, data.targetId))
  }
}

// --- Multi-instance window management ---

const extensionInstances = useLocalStorage<ExtensionWindowInstanceState[]>(
  computed(() => `incomplete-argumentation:${documentId}:extension-instances`),
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
    @link-created="onLinkCreated"
    @link-changed="onLinkChanged"
    @link-deleted="onLinkDeleted"
    :link-configs="linkConfig"
    :state="editorState"
    :history-state="historyState"
    @undo="emit('undo')"
    @redo="emit('redo')"
    @save="emit('save')"
    @share="emit('share')"
    @open-extension-window="addExtensionInstance()"
  >
    <template #toolbar>
      <div class="join join-vertical mb-2" title="Argument type">
        <button
          class="join-item btn btn-square btn-sm"
          :class="{ 'btn-active': isDefiniteArgumentMode }"
          title="Definite argument"
          @click="isDefiniteArgumentMode = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
        </button>
        <button
          class="join-item btn btn-square btn-sm"
          :class="{ 'btn-active': !isDefiniteArgumentMode }"
          title="Uncertain argument"
          @click="isDefiniteArgumentMode = false"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-dasharray="3 2"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
        </button>
      </div>
    </template>
    <template #nodeOverlay="{ nodes }">
      <circle
        v-for="node in nodes.filter((n) => uncertainArgumentIds.has(n.id))"
        :key="node.id"
        :cx="node.x"
        :cy="node.y"
        :r="ARGUMENT_RADIUS_IN_PX"
        fill="none"
        :stroke="ATTACK_COLOR"
        stroke-dasharray="5,4"
        stroke-width="2.5"
      />
    </template>
    <template #evaluationExtensions="{ onHighlight }">
      <WindowExtensions
        v-for="(instance, index) in extensionInstances"
        :key="instance.id"
        :input="evaluationInput"
        :instance-state="instance"
        :instance-offset="index"
        :storage-key="`incomplete-argumentation:${documentId}:${instance.id}:window`"
        @update:instance-state="updateExtensionInstance($event)"
        @highlight="onHighlight"
        @close="removeExtensionInstance(instance.id, onHighlight)"
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
