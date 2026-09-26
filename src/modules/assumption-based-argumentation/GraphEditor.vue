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
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { computed, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ABAF, NodeId } from '@/modules/assumption-based-argumentation/model'
import TheoryPanel from '@/modules/assumption-based-argumentation/TheoryPanel.vue'
import type { ExportFileData } from '@/modules/common/export'
import {
  type GraphEditorNodeShape,
  type GraphEditorState,
  type GraphEditorStateHyperLink,
  type GraphEditorStateLink,
  type HistoryState,
  LinkType,
  type SelectionAction,
} from '@/modules/common/graph-editor/graphEditor'
import GraphEditor from '@/modules/common/graph-editor/GraphEditor.vue'
import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import { useNotifications } from '@/modules/common/notifications/useNotifications'
import { type DocumentState, modifyDocument } from '@/modules/common/state'
import BottomSheet from '@/modules/common/window/BottomSheet.vue'

const { state, historyState, documentId } = defineProps<{
  state: DocumentState<ABAF>
  historyState: HistoryState
  documentId: number
}>()

const emit = defineEmits<{
  load: []
  new: []
  change: [state: DocumentState<ABAF>]
  undo: []
  redo: []
  save: []
  share: []
  export: [filedata: ExportFileData]
}>()

const { t } = useI18n({ useScope: 'global' })
const { layoutMode } = useLayoutMode()
const { addErrorNotification } = useNotifications()

const renderedState = shallowRef(state)
const editorState = shallowRef(transformToEditorState(state, true))
const content = computed(() => renderedState.value.current.content)

watch(
  () => state,
  () => {
    if (state.stateId === renderedState.value.stateId) return
    renderedState.value = state
    editorState.value = transformToEditorState(state, true)
  },
)

// Rules are the only drawn edges: single-body rules become links, collective ones hyperlinks.
// Contraries are not drawn yet; they show as node annotations.
function transformToEditorState(state: DocumentState<ABAF>, redraw: boolean): GraphEditorState {
  const aba = state.current.content
  const nodes = [...aba.nodeEntries()].map(([id, d]) => ({ id, label: d.name, x: d.x, y: d.y }))
  const links: GraphEditorStateLink[] = []
  const hyperLinks: GraphEditorStateHyperLink[] = []
  for (const rule of aba.rules()) {
    if (rule.body.length === 1) {
      links.push({ sourceId: rule.body[0]!, targetId: rule.head, type: LinkType.SINGLE })
    } else {
      hyperLinks.push({ sourceIds: rule.body, targetId: rule.head, type: LinkType.SINGLE })
    }
  }
  return { stateId: state.stateId, nodes, links, hyperLinks, redraw }
}

// Canvas-originated edits are already on screen, so they skip the redraw. Edits that cascade
// or come from the panel redraw, which also restores the canvas after a rejected edit.
function createNewState(recipe: (draft: ABAF) => void, redraw = true) {
  const nextState = modifyDocument(renderedState.value, (draft) => {
    recipe(draft)
  })
  if (nextState !== undefined) {
    renderedState.value = nextState
    editorState.value = transformToEditorState(nextState, redraw)
    emit('change', nextState)
  } else if (redraw) {
    editorState.value = transformToEditorState(renderedState.value, true)
  }
}

const linkConfig = computed(() => ({
  SINGLE: { displayName: t('editor.links.rule') },
}))

const nodeShapes = computed(() => {
  const shapes = new Map<NodeId, GraphEditorNodeShape>()
  for (const [id, d] of content.value.nodeEntries()) {
    shapes.set(id, d.kind === 'assumption' ? 'circle' : 'diamond')
  }
  return shapes
})

const nodeAnnotations = computed(() => {
  const aba = content.value
  const annotations = new Map<NodeId, { content: string }>()
  for (const [id, d] of aba.nodeEntries()) {
    const parts: string[] = []
    if (d.fact) parts.push('⊤')
    const contrary = aba.getContrary(id)
    if (contrary !== undefined && aba.hasNode(contrary)) {
      parts.push(`‾${d.name} = ${aba.getNode(contrary).name}`)
    }
    if (parts.length) annotations.set(id, { content: parts.join(' · ') })
  }
  return annotations
})

function onNodeCreated(data: { id: NodeId; label: string; x: number; y: number }) {
  createNewState(
    (draft) =>
      draft.addNode(data.id, { name: data.label, kind: 'atom', x: data.x, y: data.y, fact: false }),
    false,
  )
}

function onNodeDeleted(data: { id: NodeId }) {
  createNewState((draft) => draft.deleteNode(data.id))
}

function onNodeLabelEdited(data: { id: NodeId; label: string }) {
  const name = data.label.trim()
  const clash = content.value.findByName(name)
  if (clash !== undefined && clash !== data.id) {
    addErrorNotification(`Name “${name}” is already used`)
    createNewState(() => {})
    return
  }
  createNewState((draft) => draft.setName(data.id, name))
}

function onNodesMoved(data: { id: NodeId; x: number; y: number }[]) {
  createNewState((draft) => {
    for (const node of data) draft.setPosition(node.id, node.x, node.y)
  }, false)
}

function onLinkCreated(data: { sourceId: NodeId; targetId: NodeId }) {
  createNewState((draft) => {
    draft.addRule(data.targetId, [data.sourceId])
  }, false)
}

function onLinkDeleted(data: { sourceId: NodeId; targetId: NodeId }) {
  createNewState((draft) => {
    const rule = draft.findRule(data.targetId, [data.sourceId])
    if (rule !== undefined) draft.deleteRule(rule.id)
  }, false)
}

function onHyperLinkCreated(data: { sourceIds: NodeId[]; targetId: NodeId }) {
  createNewState((draft) => {
    draft.addRule(data.targetId, data.sourceIds)
  })
}

function onHyperLinkDeleted(data: { sourceIds: NodeId[]; targetId: NodeId }) {
  createNewState((draft) => {
    const rule = draft.findRule(data.targetId, data.sourceIds)
    if (rule !== undefined) draft.deleteRule(rule.id)
  }, false)
}

function onHyperLinkSourceRemoved(data: {
  sourceIds: NodeId[]
  targetId: NodeId
  removedSourceId: NodeId
}) {
  createNewState((draft) => {
    const rule = draft.findRule(data.targetId, data.sourceIds)
    if (rule === undefined) return
    draft.deleteRule(rule.id)
    draft.addRule(
      data.targetId,
      data.sourceIds.filter((id) => id !== data.removedSourceId),
    )
  })
}

function abaNodeSelectionActions(id: NodeId): SelectionAction[] {
  if (!content.value.hasNode(id)) return []
  const d = content.value.getNode(id)
  return [
    {
      key: 'kind',
      label: d.kind === 'assumption' ? 'Make atom' : 'Make assumption',
      keepOpen: true,
      run: () =>
        createNewState((draft) => {
          if (d.kind === 'assumption') draft.setKind(id, 'atom')
          else draft.promoteToAssumption(id)
        }),
    },
    {
      key: 'fact',
      label: d.fact ? 'Unset fact' : 'Set fact',
      keepOpen: true,
      run: () => createNewState((draft) => draft.setFact(id, !d.fact)),
    },
  ]
}

const isTheoryOpen = ref(false)
</script>

<template>
  <GraphEditor
    v-if="editorState"
    :document-id="documentId"
    @new="emit('new')"
    @load="emit('load')"
    @node-created="onNodeCreated"
    @node-deleted="onNodeDeleted"
    @node-label-edited="onNodeLabelEdited"
    @nodes-moved="onNodesMoved"
    @link-created="onLinkCreated"
    @link-deleted="onLinkDeleted"
    @hyper-link-created="onHyperLinkCreated"
    @hyper-link-deleted="onHyperLinkDeleted"
    @hyper-link-source-removed="onHyperLinkSourceRemoved"
    :link-configs="linkConfig"
    :state="editorState"
    :node-shapes="nodeShapes"
    :node-annotations="nodeAnnotations"
    :node-selection-actions="abaNodeSelectionActions"
    :show-evaluation="false"
    :allow-link-creation="true"
    :allow-link-deletion="true"
    :allow-hyper-link-creation="true"
    @undo="emit('undo')"
    @redo="emit('redo')"
    @save="emit('save')"
    @share="emit('share')"
    @export-file="emit('export', $event)"
    :history-state="historyState"
  >
    <template #sidePanel>
      <TheoryPanel :aba="content" @edit="createNewState($event)" />
    </template>
    <template #canvasSelector>
      <button class="btn btn-sm btn-neutral shadow-md gap-1.5" @click="isTheoryOpen = true">
        <BookOpenIcon class="size-4" /> Theory
      </button>
      <BottomSheet
        v-if="layoutMode === 'compact'"
        v-model:open="isTheoryOpen"
        title="Theory"
        :snap-points="[0.5, 0.9]"
      >
        <TheoryPanel :aba="content" compact @edit="createNewState($event)" />
      </BottomSheet>
    </template>
  </GraphEditor>
</template>
