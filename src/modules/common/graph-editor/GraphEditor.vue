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
  BarsArrowUpIcon,
  PhotoIcon,
  QueueListIcon,
  VariableIcon,
} from '@heroicons/vue/24/outline'
import { useMediaQuery } from '@vueuse/core'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  toRef,
  useId,
  useSlots,
  useTemplateRef,
  watch,
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
import { adjustNodeLabelFontSize, parseHyperLinkId, parseLinkId } from '@/modules/common/graph-editor/graphEditorUtils'
import {
  GRAPH_STYLE_DARK,
  GRAPH_STYLE_DEFAULT,
  GRAPH_STYLE_HIGH_CONTRAST,
  GRAPH_STYLE_LIBRARY,
  GRAPH_STYLE_MINIMAL,
  type GraphStyle,
} from '@/modules/common/graph-editor/graphStyle'
import { getNodePositions } from '@/modules/common/graph-editor/layouting'
import ArrowSwitcher from '@/modules/common/graph-editor/LinkTypeSwitch.vue'
import { useHighlight } from '@/modules/common/graph-editor/useHighlight'
import { usePhysics } from '@/modules/common/graph-editor/usePhysics'
import HelpControls from '@/modules/common/help/HelpControls.vue'
import WindowHelp from '@/modules/common/help/WindowHelp.vue'
import { IdGenerator, IdMapping } from '@/modules/common/ids'
import { Layout } from '@/modules/common/main-menu/layouting'
import MainMenu from '@/modules/common/main-menu/MainMenu.vue'
import { EntryState, type GridVisibility } from '@/modules/common/main-menu/types'
import { getNextName } from '@/modules/common/nextName'
import { useSettings } from '@/modules/common/settings/useSettings'
import WindowSettings from '@/modules/common/settings/WindowSettings.vue'
import { useTheme } from '@/modules/common/theme/useTheme'
import TutorialOverlay from '@/modules/common/tutorial/TutorialOverlay.vue'
import type { Tutorial, TutorialContext } from '@/modules/common/tutorial/types'
import WindowTutorials from '@/modules/common/tutorial/WindowTutorials.vue'

// The `GraphComponent` is implemented in away,
// that each instance needs an ID
// if multiple instances are used on the same site.
const graphComponentId = useId()
const graphComponentRef = useTemplateRef('graph-component')
const containerRef = useTemplateRef<HTMLDivElement>('container')
const overlayGroupRef = useTemplateRef<SVGGElement>('overlay-group')

const { state, linkConfigs, historyState, nodeWeights, graphStyle, allowLinkCreation = true, allowLinkDeletion = true, allowHyperLinkCreation = false, tutorials, defaultTutorialId, tutorialContextExtra } = defineProps<{
  state: GraphEditorState
  linkConfigs: LinkConfigs
  historyState: HistoryState
  nodeWeights?: Map<NodeId, number>
  graphStyle?: GraphStyle
  allowLinkCreation?: boolean
  allowLinkDeletion?: boolean
  allowHyperLinkCreation?: boolean
  tutorials?: Tutorial[]
  defaultTutorialId?: string
  tutorialContextExtra?: Partial<TutorialContext>
}>()

const { isDark } = useTheme()
const { graphStyle: graphStyleSetting, defaultShowGrid, defaultGridType, gridCellScale, snapMode, showHints } = useSettings()
const effectiveStyle = computed<GraphStyle>(() => {
  if (graphStyle !== undefined) return graphStyle
  switch (graphStyleSetting.value) {
    case 'high-contrast': return GRAPH_STYLE_HIGH_CONTRAST
    case 'minimal': return GRAPH_STYLE_MINIMAL
    case 'library': return GRAPH_STYLE_LIBRARY
    default: return isDark.value ? GRAPH_STYLE_DARK : GRAPH_STYLE_DEFAULT
  }
})

const linkNames = computed(() =>
  Object.values(linkConfigs).map((config) => config.displayName.toLocaleLowerCase()),
)
const isExportOpened = ref<boolean>(false)
const isHelpOpened = ref<boolean>(false)
const isTutorialWindowOpen = ref<boolean>(false)

const tutorialContext = computed<TutorialContext>(() => ({
  nodeCount: state.nodes.length,
  linkCount: state.links.length,
  canUndo: historyState.canUndo,
  canRedo: historyState.canRedo,
  isExtensionWindowOpen: tutorialContextExtra?.isExtensionWindowOpen ?? false,
  evaluationCount: tutorialContextExtra?.evaluationCount ?? 0,
  highlightCount: tutorialContextExtra?.highlightCount ?? 0,
}))

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

const stateRef = toRef(() => state)

const { physicsMode, triggerSettle, disablePhysics, enablePhysics, alignNodesToSimulationCenter } = usePhysics({
  graphComponentRef: graphComponentRef as any,
  getIdMapping: () => idMapping,
  containerRef,
})
const showGrid = ref<GridVisibility>(defaultShowGrid.value)
const settingsDialog = useTemplateRef<InstanceType<typeof WindowSettings>>('settings-dialog')

function applyGridVisibility(visibility: GridVisibility) {
  const effective = snapMode.value && visibility === 'off' ? 'auto' : visibility
  graphComponentRef.value?.setShowGrid(effective === 'on')
  graphComponentRef.value?.setAutoShowGrid(effective === 'auto')
}
watch(showGrid, applyGridVisibility)
watch(defaultGridType, (type) => { graphComponentRef.value?.setGridType(type) })
watch(gridCellScale, (scale) => { graphComponentRef.value?.setGridCellSize(ARGUMENT_RADIUS_IN_PX * scale) })
watch(snapMode, (enabled) => {
  graphComponentRef.value?.setSnapToGrid(enabled)
  applyGridVisibility(showGrid.value)
})
const { extensionHighlightRef, serialisationHighlightRef } = useHighlight({
  graphComponentRef: graphComponentRef as any,
  getIdMapping: () => idMapping,
  stateRef,
  effectiveStyle,
})

function* argumentNames() {
  for (const { label } of state.nodes) {
    yield label
  }
}

function getNextArgumentName() {
  return getNextName(argumentNames())
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
    adjustNodeLabelFontSize(graphComponentRef.value?.$el as Element | undefined, graphComponentId, node.id, name)
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
  graphComponent.setGridCellSize(ARGUMENT_RADIUS_IN_PX * gridCellScale.value)
  graphComponent.setSnapToGrid(snapMode.value)
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
  }

  const ctrlSnapGraphHost = containerRef.value?.querySelector<HTMLElement>('.graph-controller__graph-host')
  if (ctrlSnapGraphHost) {
    const nodeIdPrefix = `${graphComponentId}-node-`
    let draggingNodeId: number | null = null

    const enableSnap = (internalId: number) => {
      ctrlSnapNodeId = internalId
      graphComponentRef.value?.setNodeSnapToGrid(!snapMode.value, internalId)
      graphComponentRef.value?.setShowGrid(true)
      disablePhysics()
    }
    const disableSnap = () => {
      if (ctrlSnapNodeId === null) return
      graphComponentRef.value?.setNodeSnapToGrid(undefined, ctrlSnapNodeId)
      ctrlSnapNodeId = null
      applyGridVisibility(showGrid.value)
      if (physicsMode.value === 'on') enablePhysics()
      else if (physicsMode.value === 'settle') triggerSettle()
    }

    const handleCtrlSnapPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      const nodeContainer = (event.target as Element).closest('.graph-controller__node-container')
      if (!nodeContainer) return
      const circle = nodeContainer.querySelector(`[id^="${nodeIdPrefix}"]`)
      if (!circle) return
      const domId = circle.getAttribute('id')
      if (!domId) return
      const internalId = parseInt(domId.slice(nodeIdPrefix.length))
      if (!Number.isFinite(internalId)) return
      draggingNodeId = internalId
      if (event.ctrlKey) enableSnap(internalId)
    }
    const handleCtrlSnapPointerUp = () => {
      disableSnap()
      draggingNodeId = null
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Control' || draggingNodeId === null) return
      enableSnap(draggingNodeId)
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'Control') return
      disableSnap()
    }

    ctrlSnapGraphHost.addEventListener('pointerdown', handleCtrlSnapPointerDown, true)
    ctrlSnapGraphHost.addEventListener('pointerup', handleCtrlSnapPointerUp, true)
    ctrlSnapGraphHost.addEventListener('pointercancel', handleCtrlSnapPointerUp, true)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    ctrlSnapCleanup = () => {
      ctrlSnapGraphHost.removeEventListener('pointerdown', handleCtrlSnapPointerDown, true)
      ctrlSnapGraphHost.removeEventListener('pointerup', handleCtrlSnapPointerUp, true)
      ctrlSnapGraphHost.removeEventListener('pointercancel', handleCtrlSnapPointerUp, true)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }
})

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
      if (node?.label) adjustNodeLabelFontSize(graphComponentRef.value?.$el as Element | undefined, graphComponentId, importedNode.id, node.label)
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
    applyGridVisibility(showGrid.value)
    graphComponentRef.value?.setGridType(defaultGridType.value)
    graphComponentRef.value?.setGridCellSize(ARGUMENT_RADIUS_IN_PX * gridCellScale.value)
    graphComponentRef.value?.setSnapToGrid(snapMode.value)
    if (physicsMode.value === 'on') {
      if (center) alignNodesToSimulationCenter()
      graphComponentRef.value?.toggleNodePhysics(true)
    } else if (physicsMode.value === 'settle' && center) {
      triggerSettle()
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
  nextTick(() => adjustNodeLabelFontSize(graphComponentRef.value?.$el as Element | undefined, graphComponentId, privateId, label))
}

const arrowSwitcherTarget = shallowRef<
  | {
      targetElement: SVGElement
      linkId: string
    }
  | undefined
>(undefined)

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
let ctrlSnapCleanup: (() => void) | undefined
let ctrlSnapNodeId: number | null = null
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
  ctrlSnapCleanup?.()
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
      v-if="state.nodes.length === 0 && showHints"
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
          @help="isHelpOpened = !isHelpOpened"
          @settings="settingsDialog?.open()"
          @tutorial="isTutorialWindowOpen = !isTutorialWindowOpen"
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
      <div class="flex flex-1 items-end pointer-events-none"></div>
    </div>
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
    <TutorialOverlay
      v-if="tutorials && showHints"
      :tutorials="tutorials"
      :default-tutorial-id="defaultTutorialId"
      :is-touch-device="isTouchDevice"
      :refs="{
        mainMenuBottom: mainMenuBottomRef,
        evaluationButtons: evaluationButtonsRef,
        exportButton: exportButtonRef,
        linkSwitchButton: linkSwitchButtonRef,
      }"
      :context="tutorialContext"
    />
    <WindowTutorials
      v-if="tutorials"
      :tutorials="tutorials"
      :context="tutorialContext"
      v-model:open="isTutorialWindowOpen"
    />
    <WindowHelp :link-names="linkNames" :allow-hyper-link-creation="allowHyperLinkCreation" v-model:open="isHelpOpened" />
    <WindowSettings ref="settings-dialog" />
  </div>
</template>
<style>
.graph-controller__controls-overview {
  display: none !important;
}
</style>
