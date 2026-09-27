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
import { computed, inject, provide, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  createDefaultExtensionWindowInstance,
  type ExtensionWindowInstanceState,
} from '@/modules/assumption-based-argumentation/evaluation/extensionWindowState'
import { assumptionBasedArgumentationGlossary } from '@/modules/assumption-based-argumentation/glossary'
import type { ABAF, NodeId } from '@/modules/assumption-based-argumentation/model'
import TheoryPanel from '@/modules/assumption-based-argumentation/TheoryPanel.vue'
import {
  type AbaView,
  type DerivedCanvas,
  setafCanvas,
  type ViewPositions,
} from '@/modules/assumption-based-argumentation/views/editorState'
import ViewSwitcher from '@/modules/assumption-based-argumentation/views/ViewSwitcher.vue'
import WindowExtensions from '@/modules/assumption-based-argumentation/WindowExtensions.vue'
import { DOCUMENTS_DB_INJECTION_KEY } from '@/modules/common/documents/db'
import { useDocumentUIState } from '@/modules/common/documents/uiState'
import EvaluationHost, { type EvaluationChip } from '@/modules/common/evaluation/EvaluationHost.vue'
import type { Input } from '@/modules/common/evaluation/types'
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
import { TOOLTIP_REGISTRY_KEY } from '@/modules/common/tooltip/tooltipRegistry'
import BottomSheet from '@/modules/common/window/BottomSheet.vue'

const { state, historyState, documentId } = defineProps<{
  state: DocumentState<ABAF>
  historyState: HistoryState
  documentId: number
}>()

const db = inject(DOCUMENTS_DB_INJECTION_KEY)
if (db === undefined) {
  throw new Error('Documents database not provided.')
}

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
const theoryState = shallowRef(transformToEditorState(state, true))
const content = computed(() => renderedState.value.current.content)

watch(
  () => state,
  () => {
    if (state.stateId === renderedState.value.stateId) return
    renderedState.value = state
    theoryState.value = transformToEditorState(state, true)
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
    theoryState.value = transformToEditorState(nextState, redraw)
    emit('change', nextState)
  } else if (redraw) {
    theoryState.value = transformToEditorState(renderedState.value, true)
  }
}

const activeView = useDocumentUIState<AbaView>(db, documentId, 'canvas-view', 'theory')
const viewPositions = useDocumentUIState<Partial<Record<AbaView, ViewPositions>>>(
  db,
  documentId,
  'view-positions',
  {},
)
const isFlat = computed(() => content.value.isFlat())
const isDerivedView = computed(() => activeView.value !== 'theory')
// A derived view stays selected when the theory stops qualifying; the canvas then shows an
// empty state until it qualifies again.
const isViewUnavailable = computed(() => isDerivedView.value && !isFlat.value)

const derivedCanvas = computed<DerivedCanvas | undefined>(() => {
  if (!isDerivedView.value) return undefined
  const stateId = renderedState.value.stateId
  if (isViewUnavailable.value) {
    return {
      state: { stateId, nodes: [], links: [], hyperLinks: [], redraw: true },
      annotations: new Map(),
    }
  }
  return setafCanvas(content.value, stateId, viewPositions.value.setaf ?? {})
})

const editorState = computed(() => derivedCanvas.value?.state ?? theoryState.value)

const linkConfig = computed(() => ({
  SINGLE: { displayName: isDerivedView.value ? t('editor.links.attack') : t('editor.links.rule') },
}))

const nodeShapes = computed(() => {
  const shapes = new Map<NodeId, GraphEditorNodeShape>()
  if (isDerivedView.value) return shapes
  for (const [id, d] of content.value.nodeEntries()) {
    shapes.set(id, d.kind === 'assumption' ? 'circle' : 'diamond')
  }
  return shapes
})

const nodeAnnotations = computed(() => {
  if (derivedCanvas.value) return derivedCanvas.value.annotations
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
  const view = activeView.value
  if (view !== 'theory') {
    const positions = { ...viewPositions.value[view] }
    for (const { id, x, y } of data) positions[id] = { x, y }
    viewPositions.value = { ...viewPositions.value, [view]: positions }
    return
  }
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

provide(TOOLTIP_REGISTRY_KEY, assumptionBasedArgumentationGlossary)

const isTheoryOpen = ref(false)

const evaluationInput = computed<Input<ABAF>>(() => ({
  stateId: state.stateId,
  content: state.current.content,
}))

const extensionInstances = useDocumentUIState<ExtensionWindowInstanceState[]>(
  db,
  documentId,
  'extension-instances',
  [],
)

function addExtensionInstance() {
  extensionInstances.value = [...extensionInstances.value, createDefaultExtensionWindowInstance()]
}

function removeExtensionInstance(id: string) {
  extensionInstances.value = extensionInstances.value.filter((i) => i.id !== id)
}

function updateExtensionInstance(updated: ExtensionWindowInstanceState) {
  extensionInstances.value = extensionInstances.value.map((i) =>
    i.id === updated.id ? updated : i,
  )
}

const evaluationHostOpen = ref(false)
const activeExtensionId = ref<string | undefined>(undefined)
const evaluationTitles = ref<Record<string, string>>({})
function setEvaluationTitle(id: string, title: string) {
  evaluationTitles.value[id] = title
}

const extensionChips = computed<EvaluationChip[]>(() =>
  extensionInstances.value.map((i) => ({
    id: i.id,
    label: evaluationTitles.value[i.id] ?? i.semanticKey,
    kind: 'extension',
  })),
)
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
    :allow-link-creation="true"
    :allow-link-deletion="true"
    :allow-hyper-link-creation="true"
    :read-only="isDerivedView"
    :canvas-key="isDerivedView ? activeView : undefined"
    @undo="emit('undo')"
    @redo="emit('redo')"
    @save="emit('save')"
    @share="emit('share')"
    @export-file="emit('export', $event)"
    :history-state="historyState"
    v-model:evaluation-open="evaluationHostOpen"
    @open-extension-window="addExtensionInstance"
  >
    <template #sidePanel>
      <TheoryPanel :aba="content" @edit="createNewState($event)" />
    </template>
    <template #canvasOverlay>
      <div
        v-if="isDerivedView && !isViewUnavailable && layoutMode === 'regular'"
        class="absolute top-4 left-1/2 -translate-x-1/2 badge badge-neutral badge-sm opacity-80"
      >
        read-only · derived from theory
      </div>
      <div v-if="isViewUnavailable" class="absolute inset-0 flex items-center justify-center p-6">
        <div
          class="card card-sm bg-base-100 border border-base-300 shadow-md max-w-xs pointer-events-auto"
        >
          <div class="card-body items-center text-center">
            <p>This view is only exact for flat theories, and this theory derives an assumption.</p>
            <button class="btn btn-sm btn-primary" @click="activeView = 'theory'">
              Back to Theory
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="layoutMode === 'regular'"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto"
      >
        <ViewSwitcher v-model="activeView" :flat="isFlat" />
      </div>
    </template>
    <template #canvasSelector>
      <ViewSwitcher v-model="activeView" :flat="isFlat" />
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
    <template #evaluationExtensions>
      <EvaluationHost
        v-if="layoutMode === 'compact'"
        v-model:open="evaluationHostOpen"
        v-model:active-id="activeExtensionId"
        :chips="extensionChips"
        @add="addExtensionInstance()"
        @remove="removeExtensionInstance($event)"
      >
        <template #default="{ activeId }">
          <WindowExtensions
            v-for="instance in extensionInstances"
            v-show="instance.id === activeId"
            :key="instance.id"
            hosted
            :input="evaluationInput"
            :instance-state="instance"
            :document-id="documentId"
            :state-key="`${instance.id}:window`"
            @update:instance-state="updateExtensionInstance($event)"
            @title="setEvaluationTitle(instance.id, $event)"
          />
        </template>
      </EvaluationHost>

      <WindowExtensions
        v-for="(instance, index) in extensionInstances"
        v-else
        :key="instance.id"
        :input="evaluationInput"
        :instance-state="instance"
        :instance-offset="index"
        :document-id="documentId"
        :state-key="`${instance.id}:window`"
        @update:instance-state="updateExtensionInstance($event)"
        @close="removeExtensionInstance(instance.id)"
      />
    </template>
  </GraphEditor>
</template>
