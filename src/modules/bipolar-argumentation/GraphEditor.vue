<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { ArgumentData } from '../common/argumentation/model'
import {
  LinkType,
  type GraphEditorState,
  type GraphEditorStateLink,
  type GraphEditorStateNode,
  type NodeId,
} from '../common/graph-editor/graphEditor'
import GraphEditor from '../common/graph-editor/GraphEditor.vue'
import { modifyDocument, type DocumentState } from '../common/state'
import type { BipoloarArgumentation } from './model'

const { state } = defineProps<{
  state: DocumentState<BipoloarArgumentation<ArgumentData>>
}>()

const emit = defineEmits<{
  change: [state: DocumentState<BipoloarArgumentation<ArgumentData>>]
}>()

const workingState = shallowRef(state)
watch(
  () => state,
  async (newState, oldState) => {
    if (newState.stateId === oldState.stateId) {
      return
    }
    if (newState.stateId === workingState.value.stateId) {
      return
    }
    workingState.value = newState
  },
)

const editorState = computed<GraphEditorState | undefined>(() => {
  if (workingState.value === undefined) {
    return undefined
  }
  const argumentation = workingState.value.current.content
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
    stateId: workingState.value.stateId,
    nodes,
    links,
  }
})

const linkConfig = {
  SINGLE: {
    displayName: 'Attack',
  },
  DOUBLE: {
    displayName: 'Support',
  },
}

function createNewState(recipe: (draft: BipoloarArgumentation<ArgumentData>) => void) {
  if (workingState.value === undefined) {
    throw new Error('Cannot create new state from undefined state.')
  }
  const nextState = modifyDocument(workingState.value, recipe)
  if (nextState !== undefined) {
    workingState.value = nextState
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
    @node-created="onNodeCreated"
    @node-deleted="onNodeDeleted"
    @node-label-edited="onNodeLabelEdited"
    @nodes-moved="onNodesMoved"
    @link-created="onLinkCreated"
    @link-changed="onLinkChanged"
    @link-deleted="onLinkDeleted"
    :link-configs="linkConfig"
    :state="editorState"
  ></GraphEditor>
</template>
