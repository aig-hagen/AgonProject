<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

import { availableExports } from '@/modules/bipolar-argumentation/export'
import type { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import { saveAsString } from '@/modules/bipolar-argumentation/save/saveFormat'
import WindowExtensions from '@/modules/bipolar-argumentation/WindowExtensions.vue'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'
import WindowExport from '@/modules/common/export/WindowExport.vue'
import {
  type GraphEditorStateLink,
  type GraphEditorStateNode,
  LinkType,
  type NodeId,
} from '@/modules/common/graph-editor/graphEditor'
import GraphEditor from '@/modules/common/graph-editor/GraphEditor.vue'
import { type DocumentState, modifyDocument } from '@/modules/common/state'

const { state } = defineProps<{
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
    displayName: 'Attack',
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
    :get-save-string="() => saveAsString(state.current.content)"
    @undo="emit('undo')"
    :can-undo="canUndo"
    @redo="emit('redo')"
    :can-redo="canRedo"
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
      />
    </template>
  </GraphEditor>
</template>
