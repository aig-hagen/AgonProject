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
import {
  ArrowType,
  EVENT_CAUSE,
  GraphComponent,
  type jsonLink,
  type jsonNode,
  NodeShape,
  type PositionSnapshot,
} from '@aig-hagen/graph-component/lib'
import {
  ArrowLongRightIcon,
  BarsArrowUpIcon,
  PhotoIcon,
  VariableIcon,
} from '@heroicons/vue/24/outline'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  useId,
  useSlots,
  useTemplateRef,
  watch,
  watchEffect,
} from 'vue'

import {
  ARGUMENT_COLOR,
  ARGUMENT_RADIUS_IN_PX,
  ATTACK_COLOR,
} from '@/modules/common/argumentation/model'
import ArrowDoubleLongRightIcon from '@/modules/common/graph-editor/ArrowDoubleLongRightIcon.vue'
import {
  type GraphEditorState,
  type Highlight,
  type HistoryState,
  type LinkConfigs,
  LinkType,
  type NodeId,
} from '@/modules/common/graph-editor/graphEditor'
import { getNodePositions } from '@/modules/common/graph-editor/layouting'
import ArrowSwitcher from '@/modules/common/graph-editor/LinkTypeSwitch.vue'
import HelpControls from '@/modules/common/help/HelpControls.vue'
import WindowHelp from '@/modules/common/help/WindowHelp.vue'
import FloatingHintRight from '@/modules/common/hints/FloatingHintRight.vue'
import { IdGenerator, IdMapping } from '@/modules/common/ids'
import { Layout } from '@/modules/common/main-menu/layouting'
import MainMenu from '@/modules/common/main-menu/MainMenu.vue'
import { EntryState } from '@/modules/common/main-menu/types'
import { getNextName } from '@/modules/common/nextName'
import { REDO_SHORTCUT, UNDO_SHORTCUT } from '@/modules/common/shortcuts'

// The `GraphComponent` is implemented in away,
// that each instance needs an ID
// if multiple instances are used on the same site.
const graphComponentId = useId()
const graphComponentRef = useTemplateRef('graph-component')

const { state, linkConfigs, historyState, nodeWeights, allowLinkCreation = true, allowLinkDeletion = true } = defineProps<{
  state: GraphEditorState
  linkConfigs: LinkConfigs
  historyState: HistoryState
  nodeWeights?: Map<NodeId, number>
  allowLinkCreation?: boolean
  allowLinkDeletion?: boolean
}>()

const linkNames = computed(() =>
  Object.values(linkConfigs).map((config) => config.displayName.toLocaleLowerCase()),
)
const linkNamesEnumeration = computed(
  () =>
    linkNames.value.slice(0, -1).join(', ') + ' and ' + linkNames.value[linkNames.value.length - 1],
)
const isExportOpened = ref<boolean>(false)
const isHelpOpened = ref<boolean>(false)
const nodePhysicsEnabled = ref<boolean>(false)

const slots = useSlots()
const hasRankingSlot = computed(() => !!slots.evaluationRanking)

const enableLinkSwitching = Object.keys(linkConfigs).length > 1
const defaultLinkType = (Object.keys(linkConfigs) as LinkType[])[0]
if (defaultLinkType === undefined) {
  throw Error('At least one link type must be defined.')
}
const selectedLinkType = ref<LinkType>(defaultLinkType)

function renderNewState(state: GraphEditorState, center: boolean) {
  setGraph(state, center)
}

watch(
  () => state,
  () => {
    if (state.redraw) {
      setGraph(state, false)
    }
  },
)

const emit = defineEmits<{
  load: []
  new: []
  generate: []
  nodeCreated: [
    data: {
      id: NodeId
      label: string
      x: number
      y: number
    },
  ]
  nodeDeleted: [
    data: {
      id: NodeId
    },
  ]
  nodeLabelEdited: [
    data: {
      id: NodeId
      label: string
    },
  ]
  nodesMoved: [
    data: {
      id: NodeId
      x: number
      y: number
    }[],
  ]
  linkCreated: [
    data: {
      sourceId: NodeId
      targetId: NodeId
      type: LinkType
    },
  ]
  linkChanged: [
    data: {
      sourceId: NodeId
      targetId: NodeId
      type: LinkType
    },
  ]
  linkDeleted: [
    data: {
      sourceId: NodeId
      targetId: NodeId
    },
  ]
  undo: []
  redo: []
  save: []
  'open-extension-window': []
  'open-ranking-window': []
}>()

let idGenerator = new IdGenerator()
let idMapping = new IdMapping<number, number>()

function* argumentNames() {
  for (const { label } of state.nodes) {
    yield label
  }
}

function getNextArgumentName() {
  return getNextName(argumentNames())
}

function hasMoreThenOneEntry<T>(array: T[]): array is [T, T, ...T[]] & [...T[], T, T] {
  return array.length > 1
}

function parseLinkId(linkId: string) {
  const linkParts = linkId.split('-')
  if (!hasMoreThenOneEntry(linkParts)) {
    throw new Error(`Link with ID \`${linkId}\` is not valid: Seperator \`-\` is not contained.`)
  }
  if (linkParts.length > 2) {
    throw new Error(
      `Link with ID \`${linkId}\` is not valid: Seperator \`-\` is contained more then once.`,
    )
  }
  const sourceId = parseInt(linkParts[0])
  const tragetId = parseInt(linkParts[1])
  if (!Number.isSafeInteger(sourceId))
    throw new Error(`Link with ID \`${linkId}\` is not valid: Invalid source node ID ${sourceId}.`)
  if (!Number.isSafeInteger(tragetId))
    throw new Error(`Link with ID \`${linkId}\` is not valid: Invalid target node ID ${tragetId}.`)
  return {
    sourceId: sourceId,
    targetId: tragetId,
  }
}

function onNodeCreated(
  node: {
    id: number
    label?: string
    x?: number
    y?: number
  },
  cause: EVENT_CAUSE,
) {
  if (cause === EVENT_CAUSE.PROGRAMMATIC_ACTION) {
    return
  }

  if (node.x === undefined) {
    throw Error('X position is not defined.')
  }

  if (node.y === undefined) {
    throw Error('Y position is not defined.')
  }

  const name = getNextArgumentName()

  const publicId = idGenerator.generate()
  idMapping.add(node.id, publicId)
  const nodeData = {
    id: publicId,
    label: name,
    x: node.x,
    y: node.y,
  }
  emit('nodeCreated', nodeData)
  nextTick(() => {
    graphComponentRef.value!.setLabel(name, node.id)
    graphComponentRef.value!.setColor(ARGUMENT_COLOR, node.id)
  })
}
function onNodeDeleted(
  node: {
    id: number
    label?: string
    x?: number
    y?: number
  },
  cause: EVENT_CAUSE,
) {
  if (cause === EVENT_CAUSE.PROGRAMMATIC_ACTION) {
    return
  }

  const publicId = idMapping.delete(node.id)
  emit('nodeDeleted', { id: publicId })
}

function openLinkTypeSwitch(
  link: {
    id: string
    label?: string
  },
  event: PointerEvent,
) {
  if (event.button !== 0) {
    return
  }
  arrowSwitcherTarget.value = {
    linkId: link.id,
    targetElement: event.currentTarget as SVGElement,
  }
}

function noOp() {}

const onLinkClicked = enableLinkSwitching ? openLinkTypeSwitch : noOp

function onLinkCreated(
  link: {
    id: string
    label?: string
  },
  cause: EVENT_CAUSE,
) {
  if (cause === EVENT_CAUSE.PROGRAMMATIC_ACTION) {
    return
  }
  const { sourceId: internalSourceId, targetId: internalTargetId } = parseLinkId(link.id)
  const publicSourceId = idMapping.getOrFail(internalSourceId)
  const publicTargetId = idMapping.getOrFail(internalTargetId)
  emit('linkCreated', {
    sourceId: publicSourceId,
    targetId: publicTargetId,
    type: selectedLinkType.value,
  })
  void nextTick(() => {
    const linkColor = linkConfigs[selectedLinkType.value]?.color ?? ATTACK_COLOR
    graphComponentRef.value!.setColor(linkColor, link.id)
    graphComponentRef.value!.setLinkArrowType(toArrowType(selectedLinkType.value), link.id)
    applyLinkDash(link.id, linkConfigs[selectedLinkType.value]?.dashArray)
  })
}

function onLinkDeleted(
  link: {
    id: string
    label?: string
  },
  cause: EVENT_CAUSE,
) {
  if (arrowSwitcherTarget.value?.linkId === link.id) {
    arrowSwitcherTarget.value = undefined
  }
  if (cause === EVENT_CAUSE.PROGRAMMATIC_ACTION) {
    return
  }
  const { sourceId: internalSourceId, targetId: internalTargetId } = parseLinkId(link.id)
  // If mapping does not exist,
  // the link deletion is a cascading result of a node deletion..
  if (!idMapping.has(internalSourceId) || !idMapping.has(internalTargetId)) {
    return
  }
  const publicSourceId = idMapping.getOrFail(internalSourceId)
  const publicTargetId = idMapping.getOrFail(internalTargetId)
  emit('linkDeleted', { sourceId: publicSourceId, targetId: publicTargetId })
}

function onNodesMoved(positions: PositionSnapshot[]) {
  const data = positions.map((position) => {
    const internalId = position.nodeId
    const publicId = idMapping.getOrFail(internalId)
    return {
      id: publicId,
      x: position.x,
      y: position.y,
    }
  })
  emit('nodesMoved', data)
}

onMounted(() => {
  const graphComponent = graphComponentRef.value
  if (graphComponent === null) {
    throw new Error('Graph component is not rendered.')
  }
  graphComponent.toggleZoom(true)
  graphComponent.toggleNodePhysics(false)
  graphComponent.toggleCollisionDetection(false)
  graphComponent.setDefaults({
    nodeAutoGrowToLabelSize: false,
    nodeProps: {
      shape: NodeShape.CIRCLE,
      radius: ARGUMENT_RADIUS_IN_PX,
    },
    allowNodeCreationViaGUI: true,
    nodeGUIEditability: {
      fixedPosition: { x: false, y: false },
      deletable: true,
      labelEditable: true,
      allowIncomingLinks: allowLinkCreation,
      allowOutgoingLinks: allowLinkCreation,
    },
    linkGUIEditability: {
      deletable: allowLinkDeletion,
      labelEditable: false,
    },
  })

  renderNewState(state, true)

  const zoomGroup = containerRef.value?.querySelector(
    '.graph-controller__graph-canvas > g',
  ) as SVGGElement | null
  if (zoomGroup && overlayGroupRef.value) {
    const syncTransform = () => {
      const transform = zoomGroup.getAttribute('transform')
      if (overlayGroupRef.value) {
        overlayGroupRef.value.setAttribute('transform', transform ?? '')
      }
    }
    syncTransform()
    zoomObserver = new MutationObserver(syncTransform)
    zoomObserver.observe(zoomGroup, { attributes: true, attributeFilter: ['transform'] })

    const nodeIdPrefix = `${graphComponentId}-node-`
    dragObserver = new MutationObserver((mutations) => {
      const updated = new Map(liveNodePositions.value)
      let changed = false
      for (const mutation of mutations) {
        if (mutation.attributeName !== 'transform') continue
        const container = mutation.target as Element
        if (!container.classList.contains('graph-controller__node-container')) continue
        const circle = container.querySelector(`[id^="${nodeIdPrefix}"]`)
        if (!circle) continue
        const domId = circle.getAttribute('id')
        if (!domId) continue
        const internalId = parseInt(domId.slice(nodeIdPrefix.length))
        if (!Number.isFinite(internalId) || !idMapping.has(internalId)) continue
        const publicId = idMapping.getOrFail(internalId)
        const transform = (container as SVGGElement).getAttribute('transform')
        if (!transform) continue
        const match = /translate\(([^,]+),([^)]+)\)/.exec(transform)
        if (!match) continue
        const x = parseFloat(match[1]!)
        const y = parseFloat(match[2]!)
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue
        updated.set(publicId, { x, y })
        changed = true
      }
      if (changed) liveNodePositions.value = updated
    })
    dragObserver.observe(zoomGroup, { attributes: true, attributeFilter: ['transform'], subtree: true })
  }
})

function toggleNodePhysics() {
  nodePhysicsEnabled.value = !nodePhysicsEnabled.value
  const gc = graphComponentRef.value!
  if (nodePhysicsEnabled.value) {
    // Before enabling physics, center nodes at the SVG element's midpoint so the
    // simulation's centering forces don't cause the cluster to drift on screen.
    const el = gc.$el as HTMLElement
    const graphHost = (el.querySelector('.graph-controller__graph-host') ?? el) as HTMLElement
    const svgCenterX = graphHost.clientWidth / 2
    const svgCenterY = graphHost.clientHeight / 2
    let sumX = 0, sumY = 0, count = 0
    for (const node of state.nodes) {
      if (!idMapping.hasReverse(node.id)) continue
      const pos = gc.getNodePosition(idMapping.getOrFailReverse(node.id))
      sumX += pos.x
      sumY += pos.y
      count++
    }
    if (count > 0) {
      const dx = svgCenterX - sumX / count
      const dy = svgCenterY - sumY / count
      for (const node of state.nodes) {
        if (!idMapping.hasReverse(node.id)) continue
        const internalId = idMapping.getOrFailReverse(node.id)
        const pos = gc.getNodePosition(internalId)
        gc.setNodePosition({ x: pos.x + dx, y: pos.y + dy }, undefined, internalId)
      }
    }
  }
  gc.toggleNodePhysics(nodePhysicsEnabled.value)
  const margin = ARGUMENT_RADIUS_IN_PX * 2
  gc.centerView({ top: margin, right: margin, bottom: margin, left: margin }, undefined, 1)
}

function toArrowType(linkType: LinkType): ArrowType {
  const override = linkConfigs[linkType]?.arrowType
  if (override !== undefined) return ArrowType[override]
  if (linkType === LinkType.SINGLE) return ArrowType.SINGLE
  if (linkType === LinkType.DOUBLE) return ArrowType.DOUBLE
  throw new Error('Encountered unsupported linkType')
}

function applyLinkDash(linkId: string, dashArray?: string): void {
  const el = graphComponentRef.value?.$el?.querySelector(
    `.graph-controller__link[id$="-link-${linkId}"]`,
  )
  if (el instanceof SVGPathElement) {
    el.style.strokeDasharray = dashArray ?? ''
  }
}

function setGraph(state: GraphEditorState, center: boolean): void {
  const graphComponent = graphComponentRef.value
  if (graphComponent === null) {
    throw new Error('Graph component is not rendered.')
  }
  idGenerator = new IdGenerator()
  idMapping = new IdMapping()
  const nodes: jsonNode[] = state.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    x: node.x,
    y: node.y,
    color: ARGUMENT_COLOR,
  }))
  const links: jsonLink[] = state.links.map((link) => ({
    sourceId: link.sourceId,
    targetId: link.targetId,
    color: linkConfigs[link.type]?.color ?? ATTACK_COLOR,
    arrowType: toArrowType(link.type),
  }))

  graphComponent.setGraph({ nodes, links }, true)
  const { nodes: importedNodes } = graphComponent.getGraph(
    'json',
    false,
    false,
    false,
    false,
    true,
  ) as { nodes: { id: number; idImported: number }[] }

  for (const importedNode of importedNodes) {
    idGenerator.forward(importedNode.idImported)
    idMapping.add(importedNode.id, importedNode.idImported)
  }

  void nextTick(() => {
    for (const link of state.links) {
      const internalSourceId = idMapping.getOrFail(link.sourceId)
      const internalTargetId = idMapping.getOrFail(link.targetId)
      applyLinkDash(`${internalSourceId}-${internalTargetId}`, linkConfigs[link.type]?.dashArray)
    }
  })

  if (center) {
    const margin = ARGUMENT_RADIUS_IN_PX * 2
    graphComponent.centerView(
      {
        top: margin,
        right: margin,
        bottom: margin,
        left: margin,
      },
      undefined,
      1,
    )
  }
}

function updateLinkType(linkId: string, linkType: LinkType) {
  arrowSwitcherTarget.value = undefined
  const { sourceId: internalSourceId, targetId: internalTargetId } = parseLinkId(linkId)
  const publicSourceId = idMapping.getOrFail(internalSourceId)
  const publicTargetId = idMapping.getOrFail(internalTargetId)
  emit('linkChanged', { sourceId: publicSourceId, targetId: publicTargetId, type: linkType })
  const arrowType = toArrowType(linkType)
  const linkColor = linkConfigs[linkType]?.color ?? ATTACK_COLOR
  graphComponentRef.value!.setColor(linkColor, linkId)
  graphComponentRef.value!.setLinkArrowType(arrowType, linkId)
  applyLinkDash(linkId, linkConfigs[linkType]?.dashArray)
}

function onLabelEdited(
  parent: {
    id: string | number
  },
  label: string,
) {
  const privateId = parent.id
  if (typeof privateId !== 'number') {
    return
  }
  if (!idMapping.has(privateId)) {
    return
  }
  const publicId = idMapping.getOrFail(privateId)
  emit('nodeLabelEdited', { id: publicId, label: label })
}

const arrowSwitcherTarget = shallowRef<
  | {
      targetElement: SVGElement
      linkId: string
    }
  | undefined
>(undefined)

const containerRef = useTemplateRef<HTMLDivElement>('container')
const overlayGroupRef = useTemplateRef<SVGGElement>('overlay-group')
const nodesWithWeights = computed(() =>
  nodeWeights
    ? state.nodes.filter((n) => nodeWeights.has(n.id))
    : []
)

let zoomObserver: MutationObserver | undefined
let dragObserver: MutationObserver | undefined

// Live node positions updated on every D3 tick during drag, so the overlay
// doesn't lag behind until nodes-moved fires on mouseup.
const liveNodePositions = shallowRef<Map<NodeId, { x: number; y: number }>>(new Map())

const overlayNodes = computed(() => {
  const live = liveNodePositions.value
  if (live.size === 0) return state.nodes
  return state.nodes.map((node) => {
    const livePos = live.get(node.id)
    return livePos !== undefined ? { ...node, ...livePos } : node
  })
})

onUnmounted(() => {
  zoomObserver?.disconnect()
  dragObserver?.disconnect()
})

const extensionHighlightRef = ref<Highlight | undefined>(undefined)
const highlightToShow = computed(() => extensionHighlightRef.value)

watchEffect(() => {
  const graphComponent = graphComponentRef.value
  if (graphComponent === null) {
    return
  }
  const highlightNodes = highlightToShow.value?.nodes ?? new Set()

  // Compute restNodes: nodes with incoming links from highlight nodes
  const restNodes = new Set<NodeId>()
  for (const link of state.links) {
    if (highlightNodes.has(link.sourceId)) {
      restNodes.add(link.targetId)
    }
  }

  // Compute all nodes in internal representation
  const highlightNodesInternal = []
  const restNodesInternal = []
  const defaultNodesInternal = []
  for (const { id } of state.nodes) {
    if (!idMapping.hasReverse(id)) {
      continue
    }
    const internalNodeId = idMapping.getOrFailReverse(id)
    if (highlightNodes.has(id)) {
      highlightNodesInternal.push(internalNodeId)
    } else if (restNodes.has(id)) {
      restNodesInternal.push(internalNodeId)
    } else {
      defaultNodesInternal.push(internalNodeId)
    }
  }

  // Apply coloring
  const highlightColor = highlightToShow.value?.color ?? undefined
  const restColor = highlightToShow.value?.restColor ?? ARGUMENT_COLOR
  if (highlightColor !== undefined) {
    graphComponent.setColor(highlightColor, highlightNodesInternal)
  }
  graphComponent.setColor(restColor, restNodesInternal)
  graphComponent.setColor(ARGUMENT_COLOR, defaultNodesInternal)
})

function doLayout(layout: Layout) {
  if (graphComponentRef.value === null) {
    return
  }
  const nodes = [...state.nodes]
    .sort((nodeA, nodeB) => nodeA.label.localeCompare(nodeB.label))
    .map((node) => node.id)
  const links: [number, number][] = state.links.map((link) => [link.sourceId, link.targetId])
  const positions = getNodePositions(nodes, links, layout)
  const newPositions = []
  for (const nodeId of nodes) {
    const position = positions.get(nodeId)!
    graphComponentRef.value.setNodePosition(position, undefined, nodeId)
    newPositions.push({
      id: nodeId,
      x: position.x,
      y: position.y,
    })
  }
  emit('nodesMoved', newPositions)

  const margin = ARGUMENT_RADIUS_IN_PX * 2
  graphComponentRef.value.centerView(
    { top: margin, right: margin, bottom: margin, left: margin },
    undefined,
    1,
  )
}

const linkSwitchButtonRef = useTemplateRef('linkSwitchButton')
const extensionsButtonRef = useTemplateRef('extensionsButton')
const exportButtonRef = useTemplateRef('exportButton')
const helpButtonRef = useTemplateRef<HTMLDivElement>('helpAnchor')
</script>
<template>
  <div class="h-full w-full" ref="container">
    <GraphComponent
      @node-created="onNodeCreated"
      @node-deleted="onNodeDeleted"
      @link-clicked="onLinkClicked"
      @link-created="onLinkCreated"
      @link-deleted="onLinkDeleted"
      @nodes-moved="onNodesMoved"
      @label-edited="onLabelEdited"
      :id="graphComponentId"
      ref="graph-component"
    />
    <svg
      v-show="nodesWithWeights.length > 0 || !!slots.nodeOverlay"
      class="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g ref="overlay-group">
        <g v-for="node in nodesWithWeights" :key="node.id">
          <circle
            :cx="node.x + ARGUMENT_RADIUS_IN_PX * 0.7"
            :cy="node.y - ARGUMENT_RADIUS_IN_PX * 0.7"
            r="12"
            fill="white"
            :stroke="ARGUMENT_COLOR"
            stroke-width="1.5"
          />
          <text
            :x="node.x + ARGUMENT_RADIUS_IN_PX * 0.7"
            :y="node.y - ARGUMENT_RADIUS_IN_PX * 0.7"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="8"
            fill="#333"
          >{{ nodeWeights!.get(node.id)!.toFixed(2) }}</text>
        </g>
        <slot name="nodeOverlay" :nodes="overlayNodes" />
      </g>
    </svg>
    <div
      class="pointer-events-none w-full opacity-50 absolute inset-0 flex items-center"
      v-if="state.nodes.length === 0"
    >
      <div class="m-auto w-fit">
        <HelpControls :link-names="linkNames" />
      </div>
    </div>
    <ArrowSwitcher
      v-if="arrowSwitcherTarget"
      :link-configs="linkConfigs"
      :reference="arrowSwitcherTarget.targetElement"
      @update:arrow-type="updateLinkType(arrowSwitcherTarget.linkId, $event)"
      @close="arrowSwitcherTarget = undefined"
    />
    <div class="absolute top-4 bottom-4 left-4 flex flex-col justify-between">
      <div class="flex flex-1 flex-col justify-between">
        <MainMenu
          @new="emit('new')"
          @load="emit('load')"
          @generate="emit('generate')"
          :show-save="EntryState.ENABLE"
          :layouts-to-show="[
            Layout.TopToBottom,
            Layout.BottomToTop,
            Layout.LeftToRight,
            Layout.RightToLeft,
            Layout.ForceDirected,
            Layout.Neato,
            Layout.Circular,
            Layout.Radial,
          ]"
          @save="emit('save')"
          :show-evaluate="EntryState.ENABLE"
          @evaluate="emit('open-extension-window')"
          :show-export="isExportOpened ? EntryState.DISABLE : EntryState.ENABLE"
          @export="isExportOpened = !isExportOpened"
          @layout="doLayout($event)"
          :show-undo="historyState.canUndo ? EntryState.ENABLE : EntryState.DISABLE"
          @undo="emit('undo')"
          :show-redo="historyState.canRedo ? EntryState.ENABLE : EntryState.DISABLE"
          @redo="emit('redo')"
          :show-physics="EntryState.ENABLE"
          :physics-enabled="nodePhysicsEnabled"
          @toggle-physics="toggleNodePhysics"
          @help="isHelpOpened = !isHelpOpened"
        />

        <div class="flex flex-1 justify-end flex-col gap-2">
          <slot name="toolbar" />
          <div ref="linkSwitchButton" class="join join-vertical mb-8" v-if="enableLinkSwitching">
            <button
              v-for="(linkConfig, linkKey) in linkConfigs"
              :key="linkKey"
              class="join-item btn btn-square btn-sm"
              :class="{ 'btn-active': selectedLinkType === linkKey }"
              :title="linkConfig!.displayName"
              @click="selectedLinkType = linkKey"
            >
              <component :is="linkConfig!.icon" v-if="linkConfig!.icon" class="size-5 opacity-70" />
              <ArrowLongRightIcon v-else-if="linkKey === LinkType.SINGLE" class="size-5 opacity-70" />
              <ArrowDoubleLongRightIcon v-else class="size-5 opacity-70" />
            </button>
          </div>
          <button
            ref="extensionsButton"
            class="btn btn-square btn-sm"
            @click="emit('open-extension-window')"
            title="Extension Semantics"
          >
            <VariableIcon class="size-6 opacity-70" />
          </button>
          <button
            v-if="hasRankingSlot"
            class="btn btn-square btn-sm"
            @click="emit('open-ranking-window')"
            title="Ranking Semantics"
          >
            <BarsArrowUpIcon class="size-6 opacity-70" />
          </button>
          <button
            ref="exportButton"
            class="btn btn-square btn-sm"
            @click="isExportOpened = !isExportOpened"
            title="Export"
          >
            <PhotoIcon class="size-6 opacity-70" />
          </button>
        </div>
      </div>
      <div ref="helpAnchor" class="flex flex-1 items-end pointer-events-none">
        <template v-if="!historyState.canUndo && !historyState.canRedo">
          <FloatingHintRight :reference="helpButtonRef" :offset-x="64" placement="right-end"
            ><ul class="list-disc">
              <li>
                Create argument
                <p class="mb-1"><kbd class="kbd kbd-sm">Left double-click</kbd> on canvas</p>
              </li>
              <li>
                Create {{ linkNames.join('/') }} link
                <p class="mb-1">
                  <kbd class="kbd kbd-sm">Right-click</kbd> on an argument, hold and drag towards
                  another argument
                </p>
              </li>
              <li v-if="enableLinkSwitching">
                Switch between {{ linkNamesEnumeration }} for existing links
                <p class="mb-1"><kbd class="kbd kbd-sm">Right-click</kbd> on link</p>
              </li>
              <li>Open help to see more controls</li>
            </ul>
          </FloatingHintRight>
          <FloatingHintRight
            v-if="linkSwitchButtonRef !== null"
            :reference="linkSwitchButtonRef"
            :offset-x="64"
            placement="right-start"
            >Switch between {{ linkNamesEnumeration }} for new links
          </FloatingHintRight>
          <FloatingHintRight :reference="extensionsButtonRef" :offset-x="64" placement="right-end"
            >Extension Semantics
          </FloatingHintRight>
          <FloatingHintRight :reference="exportButtonRef" :offset-x="64" placement="right-start"
            >Create exports
          </FloatingHintRight>
        </template>
      </div>
    </div>
    <template v-if="historyState.possibleUndos === 1 && !historyState.canRedo">
      <FloatingHintRight :reference="helpButtonRef" :offset-x="64" placement="right-end">
        <ul class="list-disc">
          <li>
            <div class="flex justify-between">
              <div class="mr-2">Redo</div>
              <div>
                <kbd class="kbd kbd-sm mr-1" v-if="UNDO_SHORTCUT.modifiers.ctrl">Ctrl</kbd>
                <kbd class="kbd kbd-sm mr-1" v-if="UNDO_SHORTCUT.modifiers.meta">⌘</kbd>
                <kbd class="kbd kbd-sm mr-1" v-if="UNDO_SHORTCUT.modifiers.shift">Shift</kbd>
                <kbd class="kbd kbd-sm">{{ UNDO_SHORTCUT.key.toUpperCase() }}</kbd>
              </div>
            </div>
          </li>
          <li>
            <div class="flex justify-between">
              <div class="mr-2">Undo</div>
              <div>
                <kbd class="kbd kbd-sm mr-1" v-if="REDO_SHORTCUT.modifiers.ctrl">Ctrl</kbd>
                <kbd class="kbd kbd-sm mr-1" v-if="REDO_SHORTCUT.modifiers.meta">⌘</kbd>
                <kbd class="kbd kbd-sm mr-1" v-if="REDO_SHORTCUT.modifiers.shift">Shift</kbd>
                <kbd class="kbd kbd-sm">{{ REDO_SHORTCUT.key.toUpperCase() }}</kbd>
              </div>
            </div>
          </li>
          <li>Open help to see more controls</li>
        </ul>
      </FloatingHintRight>
    </template>
    <slot
      name="evaluationExtensions"
      :on-highlight="(h: Highlight | undefined) => { extensionHighlightRef = h }"
    ></slot>
    <slot name="export" :isOpen="isExportOpened" @isOpen="isExportOpened = $event"></slot>
    <slot name="evaluationRanking"></slot>
    <WindowHelp :link-names="linkNames" v-model:open="isHelpOpened" />
  </div>
</template>
<style>
.graph-controller__controls-overview {
  display: none !important;
}
</style>
