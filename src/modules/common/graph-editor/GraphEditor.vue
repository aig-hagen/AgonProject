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
  type jsonHyperLink,
  type jsonLink,
  type jsonNode,
  NodeShape,
  type PositionSnapshot,
} from '@aig-hagen/graph-component/lib'
import {
  ArrowLongRightIcon,
  PhotoIcon,
  QueueListIcon,
} from '@heroicons/vue/24/outline'
import ExtensionSetIcon from '@/modules/common/graph-editor/ExtensionSetIcon.vue'
import PreceqIcon from '@/modules/common/graph-editor/PreceqIcon.vue'
import { useElementVisibility, useMediaQuery } from '@vueuse/core'
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

import { ARGUMENT_RADIUS_IN_PX } from '@/modules/common/argumentation/model'
import ArrowDoubleLongRightIcon from '@/modules/common/graph-editor/ArrowDoubleLongRightIcon.vue'
import {
  type GraphEditorState,
  type Highlight,
  type HistoryState,
  type LinkConfigs,
  LinkType,
  type NodeId,
} from '@/modules/common/graph-editor/graphEditor'
import {
  GRAPH_STYLE_DARK,
  GRAPH_STYLE_DEFAULT,
  type GraphStyle,
} from '@/modules/common/graph-editor/graphStyle'
import { getNodePositions } from '@/modules/common/graph-editor/layouting'
import ArrowSwitcher from '@/modules/common/graph-editor/LinkTypeSwitch.vue'
import HelpControls from '@/modules/common/help/HelpControls.vue'
import WindowHelp from '@/modules/common/help/WindowHelp.vue'
import FloatingHintBottom from '@/modules/common/hints/FloatingHintBottom.vue'
import FloatingHintRight from '@/modules/common/hints/FloatingHintRight.vue'
import { IdGenerator, IdMapping } from '@/modules/common/ids'
import { Layout } from '@/modules/common/main-menu/layouting'
import MainMenu from '@/modules/common/main-menu/MainMenu.vue'
import { EntryState, type PhysicsMode } from '@/modules/common/main-menu/types'
import { getNextName } from '@/modules/common/nextName'
import { REDO_SHORTCUT, UNDO_SHORTCUT } from '@/modules/common/shortcuts'
import { useTheme } from '@/modules/common/theme/useTheme'

// The `GraphComponent` is implemented in away,
// that each instance needs an ID
// if multiple instances are used on the same site.
const graphComponentId = useId()
const graphComponentRef = useTemplateRef('graph-component')

const { state, linkConfigs, historyState, nodeWeights, graphStyle, allowLinkCreation = true, allowLinkDeletion = true, allowHyperLinkCreation = false } = defineProps<{
  state: GraphEditorState
  linkConfigs: LinkConfigs
  historyState: HistoryState
  nodeWeights?: Map<NodeId, number>
  graphStyle?: GraphStyle
  allowLinkCreation?: boolean
  allowLinkDeletion?: boolean
  allowHyperLinkCreation?: boolean
}>()

const { isDark } = useTheme()
const effectiveStyle = computed<GraphStyle>(() => {
  if (graphStyle !== undefined) return graphStyle
  return isDark.value ? GRAPH_STYLE_DARK : GRAPH_STYLE_DEFAULT
})

const linkNames = computed(() =>
  Object.values(linkConfigs).map((config) => config.displayName.toLocaleLowerCase()),
)
const linkNamesEnumeration = computed(
  () =>
    linkNames.value.slice(0, -1).join(', ') + ' and ' + linkNames.value[linkNames.value.length - 1],
)
const isExportOpened = ref<boolean>(false)
const isHelpOpened = ref<boolean>(false)
const showGrid = ref<boolean>(false)
const physicsMode = ref<PhysicsMode>('off')
let settleTimerId: ReturnType<typeof setTimeout> | null = null
let settlePointerCleanup: (() => void) | undefined

const slots = useSlots()
const hasRankingSlot = computed(() => !!slots.evaluationRanking)
const hasSerialisationSlot = computed(() => !!slots.evaluationSerialisation)

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

watch(isDark, () => {
  setGraph(state, false)
})

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
  hyperLinkCreated: [
    data: {
      sourceIds: NodeId[]
      targetId: NodeId
      type: LinkType
    },
  ]
  hyperLinkDeleted: [
    data: {
      sourceIds: NodeId[]
      targetId: NodeId
    },
  ]
  undo: []
  redo: []
  save: []
  share: []
  'open-extension-window': []
  'open-ranking-window': []
  'open-serialisation-window': []
}>()

let idGenerator = new IdGenerator()
let idMapping = new IdMapping<number, number>()

function computeLabelFontSize(label: string): string {
  const len = label.length
  if (len <= 3) return '1rem'
  if (len <= 5) return '0.8rem'
  if (len <= 8) return '0.65rem'
  if (len <= 12) return '0.55rem'
  return '0.45rem'
}

function adjustNodeLabelFontSize(internalId: number, label: string) {
  const el = graphComponentRef.value?.$el as Element | undefined
  if (!el) return
  const nodeEl = el.querySelector(`#${CSS.escape(`${graphComponentId}-node-${internalId}`)}`)
  const labelDiv = nodeEl
    ?.closest('.graph-controller__node-container')
    ?.querySelector<HTMLElement>('.graph-controller__node-label, .graph-controller__node-label-placeholder')
  if (labelDiv) {
    labelDiv.style.fontSize = computeLabelFontSize(label)
  }
}

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

function parseHyperLinkId(hyperLinkId: string) {
  const dashIdx = hyperLinkId.lastIndexOf('-')
  const sourcesPart = hyperLinkId.slice(0, dashIdx)
  const targetPart = hyperLinkId.slice(dashIdx + 1)
  const sourceIds = sourcesPart.split(',').map(Number)
  const targetId = parseInt(targetPart)
  if (sourceIds.some((id) => !Number.isSafeInteger(id)))
    throw new Error(`HyperLink with ID \`${hyperLinkId}\` has invalid source IDs.`)
  if (!Number.isSafeInteger(targetId))
    throw new Error(`HyperLink with ID \`${hyperLinkId}\` has invalid target ID ${targetId}.`)
  return { sourceIds, targetId }
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
  triggerSettle()
  nextTick(() => {
    graphComponentRef.value!.setLabel(name, node.id)
    graphComponentRef.value!.setColor(effectiveStyle.value.nodeColor, node.id)
    adjustNodeLabelFontSize(node.id, name)
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
  triggerSettle()
}

function onHyperLinkCreated(
  link: { id: string; label?: string },
  cause: EVENT_CAUSE,
) {
  if (cause === EVENT_CAUSE.PROGRAMMATIC_ACTION) return
  const { sourceIds: internalSourceIds, targetId: internalTargetId } = parseHyperLinkId(link.id)
  const publicSourceIds = internalSourceIds.map((id) => idMapping.getOrFail(id))
  const publicTargetId = idMapping.getOrFail(internalTargetId)
  emit('hyperLinkCreated', { sourceIds: publicSourceIds, targetId: publicTargetId, type: selectedLinkType.value })
  triggerSettle()
  void nextTick(() => {
    const linkColor = linkConfigs[selectedLinkType.value]?.color ?? effectiveStyle.value.linkColor
    graphComponentRef.value!.setColor(linkColor, link.id)
    applyHyperLinkSourceColor(link.id, linkColor)
  })
}

function onHyperLinkDeleted(
  link: { id: string; label?: string },
  cause: EVENT_CAUSE,
) {
  if (cause === EVENT_CAUSE.PROGRAMMATIC_ACTION) return
  const { sourceIds: internalSourceIds, targetId: internalTargetId } = parseHyperLinkId(link.id)
  if (!internalSourceIds.every((id) => idMapping.has(id)) || !idMapping.has(internalTargetId)) return
  const publicSourceIds = internalSourceIds.map((id) => idMapping.getOrFail(id))
  const publicTargetId = idMapping.getOrFail(internalTargetId)
  emit('hyperLinkDeleted', { sourceIds: publicSourceIds, targetId: publicTargetId })
  triggerSettle()
}

function openLinkTypeSwitch(
  link: { id: string; label?: string },
  event: PointerEvent,
) {
  if (event.button !== 0) return
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
  triggerSettle()
  void nextTick(() => {
    const linkColor = linkConfigs[selectedLinkType.value]?.color ?? effectiveStyle.value.linkColor
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
  triggerSettle()
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

function setupZoomAndDragObservers() {
  zoomObserver?.disconnect()
  dragObserver?.disconnect()

  const zoomGroup = containerRef.value?.querySelector(
    '.graph-controller__graph-canvas > g',
  ) as SVGGElement | null
  if (!zoomGroup || !overlayGroupRef.value) return

  removeGrid()
  if (showGrid.value) injectGrid(zoomGroup)

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
    if (changed) {
      liveNodePositions.value = updated
    }
  })
  dragObserver.observe(zoomGroup, { attributes: true, attributeFilter: ['transform'], subtree: true })
}

onMounted(() => {
  const graphComponent = graphComponentRef.value
  if (graphComponent === null) {
    throw new Error('Graph component is not rendered.')
  }
  graphComponent.toggleZoom(true)
  graphComponent.toggleNodePhysics(false)
  graphComponent.toggleCollisionDetection(false)
  graphComponent.toggleHyperLinkCreationViaGUI(allowHyperLinkCreation)
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

  setupZoomAndDragObservers()

  // The graph-component host has `touch-action: none` which prevents the browser
  // from generating synthetic dblclick events from double-tap. We detect double-tap
  // in the capture phase (before d3's stopImmediatePropagation can block it) and
  // dispatch a synthetic MouseEvent so the graph's dblclick → createNode path fires.
  const graphHost = containerRef.value?.querySelector<HTMLElement>('.graph-controller__graph-host')
  const svgCanvas = containerRef.value?.querySelector('.graph-controller__graph-canvas')
  if (graphHost && svgCanvas) {
    let lastTap: { time: number; x: number; y: number } | null = null
    const handleDoubleTap = (event: TouchEvent) => {
      if (event.touches.length !== 1) { lastTap = null; return }
      const touch = event.changedTouches[0]!
      const now = Date.now()
      if (
        lastTap !== null &&
        now - lastTap.time < 300 &&
        Math.hypot(touch.clientX - lastTap.x, touch.clientY - lastTap.y) < 30
      ) {
        // Query fresh — setGraph recreates the SVG element so a captured reference goes stale.
        const currentSvgCanvas = containerRef.value?.querySelector('.graph-controller__graph-canvas')
        currentSvgCanvas?.dispatchEvent(new MouseEvent('dblclick', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
          cancelable: true,
        }))
        lastTap = null
      } else {
        lastTap = { time: now, x: touch.clientX, y: touch.clientY }
      }
    }
    graphHost.addEventListener('touchstart', handleDoubleTap, { capture: true })
    doubleTapCleanup = () => graphHost.removeEventListener('touchstart', handleDoubleTap, { capture: true })

    const handleMiddleClick = (event: MouseEvent) => {
      if (event.button !== 1) return
      if ((event.target as Element)?.closest('.graph-controller__node-container, .graph-controller__link')) return
      event.preventDefault()
      if (state.nodes.length === 0) return

      // The graph-component library caches canvas dimensions (R, F) at mount time and
      // never updates them on resize when zoom is enabled. We bypass centerView() and
      // compute + apply the transform directly so the centering respects the actual
      // window size at the time of the click.
      const margin = ARGUMENT_RADIUS_IN_PX * 2
      const radius = ARGUMENT_RADIUS_IN_PX

      // Compute node bounding box including node radius (mirrors library's Ih function)
      let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
      for (const node of state.nodes) {
        xMin = Math.min(xMin, node.x - radius)
        xMax = Math.max(xMax, node.x + radius)
        yMin = Math.min(yMin, node.y - radius)
        yMax = Math.max(yMax, node.y + radius)
      }
      xMin -= margin; xMax += margin; yMin -= margin; yMax += margin

      const contentW = xMax - xMin
      const contentH = yMax - yMin

      const canvasW = containerRef.value?.clientWidth ?? 400
      const canvasH = containerRef.value?.clientHeight ?? 400

      // Fit content in canvas; cap scale at 1 (mirrors library's maxScale param = 1)
      const scale = Math.min(canvasH / contentH, canvasW / contentW, 1)

      // Center content in canvas
      const tx = canvasW / 2 - scale * (xMin + contentW / 2)
      const ty = canvasH / 2 - scale * (yMin + contentH / 2)

      const svgEl = containerRef.value?.querySelector('.graph-controller__graph-canvas') as
        | (SVGElement & { __zoom?: { k: number; x: number; y: number } })
        | null
      const g = svgEl?.firstElementChild
      if (!svgEl || !g) return

      // Keep D3's internal zoom state consistent so subsequent pan/zoom works correctly
      const currentZoom = svgEl.__zoom
      if (currentZoom != null) {
        const newZoom = Object.create(Object.getPrototypeOf(currentZoom))
        newZoom.k = scale
        newZoom.x = tx
        newZoom.y = ty
        svgEl.__zoom = newZoom
      }

      // Updating the transform attribute triggers the MutationObserver that syncs the SVG overlay
      g.setAttribute('transform', `translate(${tx},${ty}) scale(${scale})`)
    }
    // Attach to graphHost (not svgCanvas) — setGraph recreates the SVG element so a
    // listener on svgCanvas would be on a detached element after the first redraw.
    graphHost.addEventListener('auxclick', handleMiddleClick)
    middleClickCleanup = () => graphHost.removeEventListener('auxclick', handleMiddleClick)

    let nodePointerDown = false
    const handleSettlePointerDown = (event: PointerEvent) => {
      if (physicsMode.value !== 'settle') return
      if (!(event.target as Element).closest('.graph-controller__node-container')) return
      nodePointerDown = true
      alignNodesToSimulationCenter()
      graphComponentRef.value?.toggleNodePhysics(true)
      if (settleTimerId !== null) { clearTimeout(settleTimerId); settleTimerId = null }
    }
    const handleSettlePointerUp = () => {
      if (!nodePointerDown) return
      nodePointerDown = false
      if (physicsMode.value === 'settle') triggerSettle()
    }
    graphHost.addEventListener('pointerdown', handleSettlePointerDown, true)
    graphHost.addEventListener('pointerup', handleSettlePointerUp, true)
    graphHost.addEventListener('pointercancel', handleSettlePointerUp, true)
    settlePointerCleanup = () => {
      graphHost.removeEventListener('pointerdown', handleSettlePointerDown, true)
      graphHost.removeEventListener('pointerup', handleSettlePointerUp, true)
      graphHost.removeEventListener('pointercancel', handleSettlePointerUp, true)
    }
  }
})

// Shifts all nodes so their centroid sits at the simulation's centering-force target
// (clientWidth/2, clientHeight/2), then compensates the zoom/pan transform so that
// no visual jump occurs. Must be called before enabling physics to prevent the
// centering force from pulling the entire graph across the canvas.
function alignNodesToSimulationCenter() {
  const gc = graphComponentRef.value
  if (!gc) return
  const el = gc.$el as HTMLElement
  const graphHost = (el.querySelector('.graph-controller__graph-host') ?? el) as HTMLElement
  const svgCenterX = graphHost.clientWidth / 2
  const svgCenterY = graphHost.clientHeight / 2
  // Iterate idMapping directly so newly created nodes (added to idMapping before
  // triggerSettle fires but not yet reflected in the state prop) are included.
  let sumX = 0, sumY = 0, count = 0
  for (const internalId of idMapping.inputIds()) {
    const pos = gc.getNodePosition(internalId)
    sumX += pos.x
    sumY += pos.y
    count++
  }
  if (count === 0) return
  const dx = svgCenterX - sumX / count
  const dy = svgCenterY - sumY / count
  for (const internalId of idMapping.inputIds()) {
    const pos = gc.getNodePosition(internalId)
    gc.setNodePosition({ x: pos.x + dx, y: pos.y + dy }, undefined, internalId)
  }
  // Compensate the zoom/pan so nodes remain at the same visual positions.
  const svgEl = containerRef.value?.querySelector('.graph-controller__graph-canvas') as
    | (SVGElement & { __zoom?: { k: number; x: number; y: number } })
    | null
  const g = svgEl?.firstElementChild
  const currentZoom = svgEl?.__zoom
  if (svgEl && g && currentZoom != null) {
    const k = currentZoom.k
    const newTx = currentZoom.x - dx * k
    const newTy = currentZoom.y - dy * k
    const newZoom = Object.create(Object.getPrototypeOf(currentZoom))
    newZoom.k = k
    newZoom.x = newTx
    newZoom.y = newTy
    svgEl.__zoom = newZoom
    g.setAttribute('transform', `translate(${newTx},${newTy}) scale(${k})`)
  }
}

function enablePhysics() {
  const gc = graphComponentRef.value!
  alignNodesToSimulationCenter()
  gc.toggleNodePhysics(true)
  const margin = ARGUMENT_RADIUS_IN_PX * 2
  gc.centerView({ top: margin, right: margin, bottom: margin, left: margin }, undefined, 1)
}

function disablePhysics() {
  graphComponentRef.value?.toggleNodePhysics(false)
}

function triggerSettle() {
  if (physicsMode.value !== 'settle') return
  alignNodesToSimulationCenter()
  graphComponentRef.value?.toggleNodePhysics(true)
  if (settleTimerId !== null) clearTimeout(settleTimerId)
  settleTimerId = setTimeout(() => {
    settleTimerId = null
    if (physicsMode.value === 'settle') disablePhysics()
  }, 500)
}

function toggleNodePhysics() {
  if (physicsMode.value === 'off') {
    physicsMode.value = 'settle'
  } else if (physicsMode.value === 'settle') {
    if (settleTimerId !== null) {
      clearTimeout(settleTimerId)
      settleTimerId = null
    }
    disablePhysics()
    physicsMode.value = 'on'
    enablePhysics()
  } else {
    physicsMode.value = 'off'
    disablePhysics()
  }
}

function toArrowType(linkType: LinkType): ArrowType {
  const override = linkConfigs[linkType]?.arrowType
  if (override !== undefined) return ArrowType[override]
  if (linkType === LinkType.SINGLE) return ArrowType.SINGLE
  if (linkType === LinkType.DOUBLE) return ArrowType.DOUBLE
  throw new Error('Encountered unsupported linkType')
}

function applyHyperLinkSourceColor(hyperLinkId: string, color: string): void {
  const el = graphComponentRef.value?.$el as Element | undefined
  if (!el) return
  const targetPath = el.querySelector(`#${CSS.escape(`${graphComponentId}-hyperlink-${hyperLinkId}`)}`)
  const container = targetPath?.closest('.graph-controller__hyperlink-container')
  if (!container) return
  container.querySelectorAll<SVGPathElement>('.graph-controller__hyperlink-source-path').forEach((path) => {
    path.style.stroke = color
  })
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
  // When physics is active, nodes may have drifted from their stored model positions.
  // Capture current visual positions before resetting so nodes don't snap back.
  const preservedPositions = new Map<number, { x: number; y: number }>()
  if (physicsMode.value !== 'off') {
    for (const internalId of idMapping.inputIds()) {
      preservedPositions.set(idMapping.getOrFail(internalId), graphComponent.getNodePosition(internalId))
    }
  }
  // Capture the D3 zoom state before setGraph destroys and recreates the SVG canvas.
  // setGraph resets D3 zoom to identity; restoring it keeps the graph visually stable.
  // Only for in-place redraws (center=false) — initial renders should use the library defaults.
  const savedZoom = center ? null : (() => {
    const z = (containerRef.value?.querySelector('.graph-controller__graph-canvas') as (SVGElement & { __zoom?: { k: number; x: number; y: number } }) | null)?.__zoom
    return z != null ? { k: z.k, x: z.x, y: z.y } : null
  })()
  idGenerator = new IdGenerator()
  idMapping = new IdMapping()
  liveNodePositions.value = new Map()
  const nodes: jsonNode[] = state.nodes.map((node) => {
    const preserved = preservedPositions.get(node.id)
    return {
      id: node.id,
      label: node.label,
      x: preserved?.x ?? node.x,
      y: preserved?.y ?? node.y,
      color: effectiveStyle.value.nodeColor,
    }
  })
  const links: jsonLink[] = state.links.map((link) => ({
    sourceId: link.sourceId,
    targetId: link.targetId,
    color: linkConfigs[link.type]?.color ?? effectiveStyle.value.linkColor,
    arrowType: toArrowType(link.type),
  }))
  const hyperLinks: jsonHyperLink[] = (state.hyperLinks ?? []).map((hyperLink) => ({
    sourceIds: hyperLink.sourceIds,
    targetId: hyperLink.targetId,
    color: linkConfigs[hyperLink.type]?.color ?? effectiveStyle.value.linkColor,
  }))

  graphComponent.setGraph({ nodes, links, hyperLinks }, true)
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
      const internalSourceId = idMapping.getOrFailReverse(link.sourceId)
      const internalTargetId = idMapping.getOrFailReverse(link.targetId)
      applyLinkDash(`${internalSourceId}-${internalTargetId}`, linkConfigs[link.type]?.dashArray)
    }
    for (const hyperLink of (state.hyperLinks ?? [])) {
      const internalSourceIds = hyperLink.sourceIds
        .map((id) => idMapping.getOrFailReverse(id))
        .sort((a, b) => a - b)
      const internalTargetId = idMapping.getOrFailReverse(hyperLink.targetId)
      const internalHyperLinkId = `${internalSourceIds.join(',')}-${internalTargetId}`
      const color = linkConfigs[hyperLink.type]?.color ?? effectiveStyle.value.linkColor
      applyHyperLinkSourceColor(internalHyperLinkId, color)
    }
    for (const importedNode of importedNodes) {
      const node = state.nodes.find((n) => n.id === importedNode.idImported)
      if (node?.label) adjustNodeLabelFontSize(importedNode.id, node.label)
    }
    // setGraph recreates the SVG canvas and resets D3 zoom to identity. Restore the
    // captured zoom so node visual positions don't jump after an in-place redraw.
    if (savedZoom !== null) {
      const newSvgEl = containerRef.value?.querySelector('.graph-controller__graph-canvas') as
        (SVGElement & { __zoom?: { k: number; x: number; y: number } }) | null
      const newG = newSvgEl?.querySelector(':scope > g') as SVGGElement | null
      if (newSvgEl && newG && newSvgEl.__zoom != null) {
        const newZoom = Object.create(Object.getPrototypeOf(newSvgEl.__zoom))
        newZoom.k = savedZoom.k
        newZoom.x = savedZoom.x
        newZoom.y = savedZoom.y
        newSvgEl.__zoom = newZoom
        newG.setAttribute('transform', `translate(${savedZoom.x},${savedZoom.y}) scale(${savedZoom.k})`)
      }
    }
    // setGraph rebuilds the graph DOM, potentially replacing the zoom group element that
    // zoomObserver and dragObserver are watching. Reconnect them to the current element
    // so that the overlay transform sync and live drag positions keep working.
    setupZoomAndDragObservers()
    if (physicsMode.value === 'on') {
      graphComponentRef.value?.toggleNodePhysics(true)
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
  const linkColor = linkConfigs[linkType]?.color ?? effectiveStyle.value.linkColor
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
  nextTick(() => adjustNodeLabelFontSize(privateId, label))
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

const isTabVisible = useElementVisibility(containerRef)
watch(isTabVisible, (visible) => {
  if (!visible) {
    if (settleTimerId !== null) {
      clearTimeout(settleTimerId)
      settleTimerId = null
    }
    disablePhysics()
    physicsMode.value = 'off'
  }
})
const nodesWithWeights = computed(() =>
  nodeWeights
    ? state.nodes.filter((n) => nodeWeights.has(n.id))
    : []
)

function formatWeight(w: number): string {
  return Number.isInteger(w) ? String(w) : w.toFixed(2)
}

function formatWeightFontSize(w: number): number {
  return Number.isInteger(w) ? 10 : 8
}

let zoomObserver: MutationObserver | undefined
let dragObserver: MutationObserver | undefined
let doubleTapCleanup: (() => void) | undefined
let middleClickCleanup: (() => void) | undefined
let gridRectEl: SVGRectElement | null = null
let gridDefsEl: SVGDefsElement | null = null

function injectGrid(zoomGroup: SVGGElement) {
  const ns = 'http://www.w3.org/2000/svg'
  const cellSize = ARGUMENT_RADIUS_IN_PX * 2

  const defs = document.createElementNS(ns, 'defs')
  const pattern = document.createElementNS(ns, 'pattern')
  pattern.setAttribute('id', `${graphComponentId}-grid`)
  pattern.setAttribute('width', String(cellSize))
  pattern.setAttribute('height', String(cellSize))
  pattern.setAttribute('patternUnits', 'userSpaceOnUse')
  const path = document.createElementNS(ns, 'path')
  path.setAttribute('d', `M ${cellSize} 0 L 0 0 0 ${cellSize}`)
  path.setAttribute('fill', 'none')
  path.setAttribute('vector-effect', 'non-scaling-stroke')
  path.style.stroke = 'var(--color-base-300)'
  path.style.strokeWidth = '1'
  pattern.appendChild(path)
  defs.appendChild(pattern)

  const rect = document.createElementNS(ns, 'rect')
  rect.setAttribute('x', '-10000')
  rect.setAttribute('y', '-10000')
  rect.setAttribute('width', '20000')
  rect.setAttribute('height', '20000')
  rect.setAttribute('fill', `url(#${graphComponentId}-grid)`)

  // Inject inside the zoom group so the grid is transformed by D3 automatically.
  // This means no patternTransform tracking is needed.
  zoomGroup.insertBefore(rect, zoomGroup.firstChild)
  zoomGroup.insertBefore(defs, rect)
  gridDefsEl = defs
  gridRectEl = rect
}

function removeGrid() {
  gridDefsEl?.remove()
  gridRectEl?.remove()
  gridDefsEl = null
  gridRectEl = null
}

watch(showGrid, (show) => {
  const zoomGroup = containerRef.value?.querySelector(
    '.graph-controller__graph-canvas > g',
  ) as SVGGElement | null
  if (!zoomGroup) return
  if (show) injectGrid(zoomGroup)
  else removeGrid()
})

// Live node positions updated on every D3 tick during drag, so the overlay
// doesn't lag behind until nodes-moved fires on mouseup.
const liveNodePositions = shallowRef<Map<NodeId, { x: number; y: number }>>(new Map())

// Clear live positions whenever state is committed (physics tick, undo, document load, etc.)
// so stale drag coords can't override the freshly committed state.nodes.
// During an active drag no state is committed, so the stateId is stable and
// the dragObserver continues to populate liveNodePositions normally.
watch(
  () => state.stateId,
  () => { liveNodePositions.value = new Map() },
)

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
  doubleTapCleanup?.()
  middleClickCleanup?.()
  settlePointerCleanup?.()
  if (settleTimerId !== null) clearTimeout(settleTimerId)
  removeGrid()
})

const extensionHighlightRef = ref<Highlight | undefined>(undefined)
const serialisationHighlightRef = ref<Highlight | undefined>(undefined)
const highlightToShow = computed(() => extensionHighlightRef.value ?? serialisationHighlightRef.value)

watchEffect(() => {
  const graphComponent = graphComponentRef.value
  if (graphComponent === null) {
    return
  }

  const highlight = highlightToShow.value
  const groups = highlight?.groups ?? []

  // Collect all nodes explicitly covered by a group
  const coveredNodes = new Set<NodeId>()
  for (const group of groups) {
    for (const id of group.nodes) coveredNodes.add(id)
  }

  // Compute nodes attacked by the first group (if requested)
  const attackedNodes = new Set<NodeId>()
  if (highlight?.attackedByFirst !== undefined && groups.length > 0) {
    const firstNodes = groups[0]!.nodes
    for (const link of state.links) {
      if (firstNodes.has(link.sourceId) && !coveredNodes.has(link.targetId)) {
        attackedNodes.add(link.targetId)
      }
    }
  }

  // Categorize all graph nodes into their output buckets
  const groupBuckets: number[][] = groups.map(() => [])
  const attackedBucket: number[] = []
  const defaultBucket: number[] = []
  for (const { id } of state.nodes) {
    if (!idMapping.hasReverse(id)) continue
    const internalId = idMapping.getOrFailReverse(id)
    let placed = false
    for (let i = 0; i < groups.length; i++) {
      if (groups[i]!.nodes.has(id)) {
        groupBuckets[i]!.push(internalId)
        placed = true
        break
      }
    }
    if (!placed) {
      if (attackedNodes.has(id)) attackedBucket.push(internalId)
      else defaultBucket.push(internalId)
    }
  }

  // Apply colors
  for (let i = 0; i < groups.length; i++) {
    graphComponent.setColor(groups[i]!.color, groupBuckets[i]!)
  }
  if (highlight?.attackedByFirst !== undefined) {
    graphComponent.setColor(highlight.attackedByFirst, attackedBucket)
  }
  graphComponent.setColor(effectiveStyle.value.nodeColor, defaultBucket)
})

function doLayout(layout: Layout) {
  if (graphComponentRef.value === null) {
    return
  }
  const wasPhysicsOn = physicsMode.value === 'on'
  if (wasPhysicsOn) disablePhysics()

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

  if (wasPhysicsOn) {
    enablePhysics()
  } else {
    const margin = ARGUMENT_RADIUS_IN_PX * 2
    graphComponentRef.value.centerView(
      { top: margin, right: margin, bottom: margin, left: margin },
      undefined,
      1,
    )
  }
}

const linkSwitchButtonRef = useTemplateRef('linkSwitchButton')
const evaluationButtonsRef = useTemplateRef<HTMLDivElement>('evaluationButtons')
const exportButtonRef = useTemplateRef('exportButton')
const mainMenuBottomRef = useTemplateRef<HTMLDivElement>('mainMenuBottom')

const isTouchDevice = useMediaQuery('(pointer: coarse)')
</script>
<template>
  <div
    class="h-full w-full"
    ref="container"
    :style="{
      '--graph-node-color': effectiveStyle.nodeColor,
      '--graph-node-stroke-color': effectiveStyle.nodeStrokeColor,
      '--graph-node-stroke-width': `${effectiveStyle.nodeStrokeWidth}px`,
      '--graph-link-stroke-width': `${effectiveStyle.linkStrokeWidth}px`,
    }"
  >
    <GraphComponent
      @node-created="onNodeCreated"
      @node-deleted="onNodeDeleted"
      @link-clicked="onLinkClicked"
      @link-created="onLinkCreated"
      @link-deleted="onLinkDeleted"
      @hyper-link-created="onHyperLinkCreated"
      @hyper-link-deleted="onHyperLinkDeleted"
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
            fill="var(--color-base-100)"
            :stroke="effectiveStyle.nodeColor"
            stroke-width="1.5"
          />
          <text
            :x="node.x + ARGUMENT_RADIUS_IN_PX * 0.7"
            :y="node.y - ARGUMENT_RADIUS_IN_PX * 0.7"
            text-anchor="middle"
            dominant-baseline="central"
            :font-size="formatWeightFontSize(nodeWeights!.get(node.id)!)"
            fill="var(--color-base-content)"
          >{{ formatWeight(nodeWeights!.get(node.id)!) }}</text>
        </g>
        <slot name="nodeOverlay" :nodes="overlayNodes" />
      </g>
    </svg>
    <div
      class="pointer-events-none w-full opacity-50 absolute inset-0 flex items-center"
      v-if="state.nodes.length === 0"
    >
      <div class="m-auto w-fit">
        <HelpControls :link-names="linkNames" :allow-hyper-link-creation="allowHyperLinkCreation" />
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
        <div class="w-fit">
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
          :show-share="EntryState.ENABLE"
          @share="emit('share')"
          @layout="doLayout($event)"
          :show-undo="historyState.canUndo ? EntryState.ENABLE : EntryState.DISABLE"
          @undo="emit('undo')"
          :show-redo="historyState.canRedo ? EntryState.ENABLE : EntryState.DISABLE"
          @redo="emit('redo')"
          :show-physics="EntryState.ENABLE"
          :physics-mode="physicsMode"
          @toggle-physics="toggleNodePhysics"
          :show-grid="showGrid"
          @toggle-grid="showGrid = !showGrid"
          @help="isHelpOpened = !isHelpOpened"
          />
          <div ref="mainMenuBottom" class="h-0"></div>
        </div>

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
          <div ref="evaluationButtons" class="flex flex-col gap-2">
            <button
              class="btn btn-square btn-sm"
              @click="emit('open-extension-window')"
              title="Extension Semantics"
            >
              <ExtensionSetIcon class="size-6 opacity-70" />
            </button>
            <button
              v-if="hasRankingSlot"
              class="btn btn-square btn-sm"
              @click="emit('open-ranking-window')"
              title="Ranking Semantics"
            >
              <PreceqIcon class="size-6 opacity-70" />
            </button>
            <button
              v-if="hasSerialisationSlot"
              class="btn btn-square btn-sm"
              @click="emit('open-serialisation-window')"
              title="Serialisation Sequences"
            >
              <QueueListIcon class="size-6 opacity-70" />
            </button>
          </div>
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
      <div class="flex flex-1 items-end pointer-events-none">
        <template v-if="!historyState.canUndo && !historyState.canRedo">
          <FloatingHintBottom :reference="mainMenuBottomRef" :offset-y="48" placement="bottom-start"
            ><ul class="list-disc">
              <li v-if="!isTouchDevice">
                <p class="mb-1">Use <kbd class="kbd kbd-sm">Left double-click</kbd> to create a new argument</p>
              </li>
              <li v-else>
                <p class="mb-1"><kbd class="kbd kbd-sm">Double-tap</kbd> on canvas to create a new argument</p>
              </li>
              <li v-if="!isTouchDevice">
                <p class="mb-1"> Press <kbd class="kbd kbd-sm">Right-click</kbd> on an argument, hold and drag towards
                  another argument to create an {{ linkNames.join('/') }} edge
                </p>
              </li>
              <li v-else>
                <p class="mb-1"><kbd class="kbd kbd-sm">Hold and drag</kbd> from an argument towards another to create an {{ linkNames.join('/') }} edge</p>
              </li>
              <li v-if="allowHyperLinkCreation && !isTouchDevice">
                <p class="mb-1">
                  <kbd class="kbd kbd-sm">Shift</kbd>+<kbd class="kbd kbd-sm">Left-click</kbd> on 2 or more arguments to select sources for a collective attack, then drag to the target
                </p>
              </li>
              <li v-if="enableLinkSwitching">
                Switch between {{ linkNamesEnumeration }} for existing links
                <p class="mb-1"><kbd class="kbd kbd-sm">{{ isTouchDevice ? 'Tap' : 'Right-click' }}</kbd> on link</p>
              </li>
              <li>Open menu to show more actions</li>
            </ul>
          </FloatingHintBottom>
          <FloatingHintRight :reference="evaluationButtonsRef" :offset-x="64" placement="right-start"
            >Semantical Evaluation
          </FloatingHintRight>
          <FloatingHintRight :reference="exportButtonRef" :offset-x="64" placement="right-start"
            >Export AF to LaTeX/TikZ or as image
          </FloatingHintRight>
        </template>
      </div>
    </div>
    <template v-if="historyState.possibleUndos === 1 && !historyState.canRedo">
      <FloatingHintRight
        v-if="linkSwitchButtonRef !== null && enableLinkSwitching"
        :reference="linkSwitchButtonRef"
        :offset-x="64"
        placement="right-start"
        >Switch between {{ linkNamesEnumeration }} for new links
      </FloatingHintRight>
      <FloatingHintBottom :reference="mainMenuBottomRef" :offset-y="48" placement="bottom-start">
        <ul class="list-disc">
          <template v-if="!isTouchDevice">
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
          </template>
          <li v-else>Undo/redo via the menu</li>
          <li>Open help to see more controls</li>
        </ul>
      </FloatingHintBottom>
    </template>
    <slot
      name="evaluationExtensions"
      :on-highlight="(h: Highlight | undefined) => { extensionHighlightRef = h }"
    ></slot>
    <slot name="export" :isOpen="isExportOpened" @isOpen="isExportOpened = $event"></slot>
    <slot name="evaluationRanking"></slot>
    <slot
      name="evaluationSerialisation"
      :on-highlight="(h: Highlight | undefined) => { serialisationHighlightRef = h }"
    ></slot>
    <WindowHelp :link-names="linkNames" :allow-hyper-link-creation="allowHyperLinkCreation" v-model:open="isHelpOpened" />
  </div>
</template>
<style>
.graph-controller__controls-overview {
  display: none !important;
}
</style>
