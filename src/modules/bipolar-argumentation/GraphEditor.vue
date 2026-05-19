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
import { computed, shallowRef, watch } from 'vue'

import { availableExports } from '@/modules/bipolar-argumentation/export'
import type { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import WindowExtensions from '@/modules/bipolar-argumentation/WindowExtensions.vue'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'
import type { ExportFileData } from '@/modules/common/export'
import WindowExport from '@/modules/common/export/WindowExport.vue'
import {
  type GraphEditorStateLink,
  type GraphEditorStateNode,
  LinkType,
  type NodeId,
} from '@/modules/common/graph-editor/graphEditor'
import GraphEditor from '@/modules/common/graph-editor/GraphEditor.vue'
import { type DocumentState, modifyDocument } from '@/modules/common/state'

const { state, canUndo, canRedo } = defineProps<{
  state: DocumentState<BipoloarArgumentation<ArgumentData>>
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  load: []
  new: []
  change: [state: DocumentState<BipoloarArgumentation<ArgumentData>>]
  undo: []
  redo: []
  save: []
  export: [filedata: ExportFileData]
}>()

const evaluationInput = computed<Input<BipoloarArgumentation<ArgumentData>>>(() => {
  return {
    stateId: state.stateId,
    content: state.current.content,
  }
})

const renderedState = shallowRef(state)
const editorState = shallowRef(transformToEditorState(state, true))
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
  state: DocumentState<BipoloarArgumentation<ArgumentData>>,
  redraw: boolean,
) {
  const argumentation = state.current.content
  const nodes: GraphEditorStateNode[] = [...argumentation.arguments()].map(([id, data]) => {
    return {
      id: id,
      label: data.name,
      x: data.x,
      y: data.y,
    }
  })
  const attackLinks: GraphEditorStateLink[] = [...argumentation.attacks()].map(
    ([source, target]) => ({
      sourceId: source,
      targetId: target,
      type: LinkType.SINGLE,
    }),
  )
  const supportLinks: GraphEditorStateLink[] = [...argumentation.supports()].map(
    ([source, target]) => ({
      sourceId: source,
      targetId: target,
      type: LinkType.DOUBLE,
    }),
  )
  const links = [...attackLinks, ...supportLinks]
  return {
    stateId: state.stateId,
    nodes,
    links,
    redraw,
  }
}

const linkConfig = {
  SINGLE: {
    displayName: 'attack',
  },
  DOUBLE: {
    displayName: 'Support',
  },
}

function createNewState(recipe: (draft: BipoloarArgumentation<ArgumentData>) => void) {
  if (renderedState.value === undefined) {
    throw new Error('Cannot create new state from undefined state.')
  }
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
  const argumentData = {
    name: data.label,
    x: data.x,
    y: data.y,
  }
  createNewState((draft) => draft.addArgument(data.id, argumentData))
}

function onNodeLabelEdited(data: { id: NodeId; label: string }) {
  createNewState((draft) => {
    draft.getArgument(data.id).name = data.label
  })
}

function onNodesMoved(
  data: {
    id: NodeId
    x: number
    y: number
  }[],
) {
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
  createNewState((draft) => draft.deleteAttackOrSupport(data.sourceId, data.targetId))
}

function onLinkChanged(data: { sourceId: NodeId; targetId: NodeId; type: LinkType }) {
  onLinkCreatedOrChanged(data)
}

function onLinkCreatedOrChanged(data: { sourceId: NodeId; targetId: NodeId; type: LinkType }) {
  if (data.type === LinkType.SINGLE) {
    createNewState((draft) => draft.addAttack(data.sourceId, data.targetId))
  } else {
    createNewState((draft) => draft.addSupport(data.sourceId, data.targetId))
  }
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
    @undo="emit('undo')"
    :can-undo="canUndo"
    @redo="emit('redo')"
    :can-redo="canRedo"
    @save="emit('save')"
  >
    <template #evaluationExtensions="{ isOpen, onIsOpen, onHighlight }">
      <WindowExtensions
        :input="evaluationInput"
        :open="isOpen"
        @update:open="onIsOpen"
        @highlight="onHighlight"
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
