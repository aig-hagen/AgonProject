<script setup lang="ts">
import '@aig-hagen/graph-component/lib/graph-component.css'

import {
  ArrowType,
  EVENT_CAUSE,
  GraphComponent,
  type jsonLink,
  type jsonNode,
  NodeShape,
  type PositionSnapshot,
} from '@aig-hagen/graph-component/lib'
import { ArrowLongRightIcon, PhotoIcon, VariableIcon } from '@heroicons/vue/24/outline'
import {
  computed,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  useId,
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
  type LinkConfigs,
  LinkType,
  type NodeId,
} from '@/modules/common/graph-editor/graphEditor'
import ArrowSwitcher from '@/modules/common/graph-editor/LinkTypeSwitch.vue'
import { IdGenerator, IdMapping } from '@/modules/common/ids'
import MainMenu from '@/modules/common/main-menu/MainMenu.vue'
import { EntryState } from '@/modules/common/main-menu/types'
import { getNextName } from '@/modules/common/nextName'

// The `GraphComponent` is implemented in away,
// that each instance needs an ID
// if multiple instances are used on the same site.
const graphComponentId = useId()
const graphComponentRef = useTemplateRef('graph-component')

const { state, linkConfigs } = defineProps<{
  state: GraphEditorState
  linkConfigs: LinkConfigs
}>()

const isExtensionsOpened = ref<boolean>(false)
const isExportOpened = ref<boolean>(false)
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
  const arrowType = selectedLinkType.value === LinkType.SINGLE ? ArrowType.SINGLE : ArrowType.DOUBLE
  void nextTick(() => {
    graphComponentRef.value!.setColor(ATTACK_COLOR, link.id)
    graphComponentRef.value!.setLinkArrowType(arrowType, link.id)
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
      allowIncomingLinks: true,
      allowOutgoingLinks: true,
    },
    linkGUIEditability: {
      deletable: true,
      labelEditable: false,
    },
  })

  renderNewState(state, true)
})

function toArrowType(linkType: LinkType): ArrowType {
  if (linkType === LinkType.SINGLE) {
    return ArrowType.SINGLE
  }
  if (linkType === LinkType.DOUBLE) {
    return ArrowType.DOUBLE
  }
  throw new Error('Encountered unsupported linkType')
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
    color: ATTACK_COLOR,
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
  graphComponentRef.value!.setLinkArrowType(arrowType, linkId)
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

const extensionHighlightRef = ref<Highlight | undefined>(undefined)
const highlightToShow = computed(() => {
  if (!isExtensionsOpened.value) {
    return undefined
  }
  return extensionHighlightRef.value
})

watchEffect(() => {
  const graphComponent = graphComponentRef.value
  if (graphComponent === null) {
    return
  }
  const nodes = highlightToShow.value?.nodes ?? new Set()

  const hightlightNodes = []
  const restNodes = []
  for (const { id } of state.nodes) {
    if (!idMapping.hasReverse(id)) {
      continue
    }
    const internalNodeId = idMapping.getOrFailReverse(id)
    if (nodes.has(id)) {
      hightlightNodes.push(internalNodeId)
    } else {
      restNodes.push(internalNodeId)
    }
  }
  const highlightColor = highlightToShow.value?.color ?? undefined
  const restColor = highlightToShow.value?.restColor ?? ARGUMENT_COLOR
  if (highlightColor !== undefined) {
    graphComponent.setColor(highlightColor, hightlightNodes)
  }
  graphComponent.setColor(restColor, restNodes)
})
</script>
<template>
  <div class="h-full w-full">
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
    <ArrowSwitcher
      v-if="arrowSwitcherTarget"
      :link-configs="linkConfigs"
      :reference="arrowSwitcherTarget.targetElement"
      @update:arrow-type="updateLinkType(arrowSwitcherTarget.linkId, $event)"
    />
    <div class="absolute top-4 bottom-4 left-4 flex flex-col justify-between">
      <div class="flex flex-1 flex-col justify-between">
        <MainMenu
          :show-evaluate="isExtensionsOpened ? EntryState.DISABLE : EntryState.ENABLE"
          @evaluate="isExtensionsOpened = !isExtensionsOpened"
          :show-export="isExportOpened ? EntryState.DISABLE : EntryState.ENABLE"
          @export="isExportOpened = !isExportOpened"
        />

        <div class="flex flex-1 justify-end flex-col gap-2">
          <div class="join join-vertical mb-8" v-if="enableLinkSwitching">
            <label
              v-for="(linkConfig, linkKey) in linkConfigs"
              :key="linkKey"
              class="join-item btn btn-toggle btn-square btn-sm"
              :title="linkConfig!.displayName"
            >
              <input v-model="selectedLinkType" :value="linkKey" type="radio" name="arrow" />
              <ArrowLongRightIcon v-if="linkKey === LinkType.SINGLE" class="size-5 opacity-70" />
              <ArrowDoubleLongRightIcon
                v-if="linkKey === LinkType.DOUBLE"
                class="size-5 opacity-70"
              />
            </label>
          </div>
          <button
            class="btn btn-square btn-sm"
            @click="isExtensionsOpened = !isExtensionsOpened"
            title="Evalution"
          >
            <VariableIcon class="size-6 opacity-70" />
          </button>
          <button
            class="btn btn-square btn-sm"
            @click="isExportOpened = !isExportOpened"
            title="Export"
          >
            <PhotoIcon class="size-6 opacity-70" />
          </button>
        </div>
      </div>
      <div class="flex flex-1"></div>
    </div>
    <slot
      name="evaluationExtensions"
      :isOpen="isExtensionsOpened"
      @isOpen="isExtensionsOpened = $event"
      @highlight="extensionHighlightRef = $event"
    ></slot>
    <slot name="export" :isOpen="isExportOpened" @isOpen="isExportOpened = $event"></slot>
  </div>
</template>
<style scoped>
/**
Toggle button idea and implementation from https://github.com/saadeghi/daisyui/discussions/4249-
 */
.btn-toggle {
  position: relative;

  & > input:is([type='checkbox'], [type='radio']) {
    display: none;
  }

  &::after {
    content: '';
    position: absolute;
    max-width: calc(100% - (var(--size) / 2));
    width: 1rem;
    height: 0.2rem;
    background-color: color-mix(in oklab, var(--color-base-content) 30%, #ddd);
    bottom: calc(var(--size) / 8);
    border-radius: var(--radius-field);
  }

  &:has(input:checked)::after {
    background: var(--color-base-content);
  }
}
</style>
