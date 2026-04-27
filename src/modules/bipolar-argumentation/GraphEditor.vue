<script setup lang="ts">
import { BipoloarArgumentation } from './model'
import {
  GraphComponent,
  EVENT_CAUSE,
  NodeShape,
  type jsonNode,
  type jsonLink,
  type PositionSnapshot,
  ArrowType,
} from '@aig-hagen/graph-component/lib'
import '@aig-hagen/graph-component/lib/graph-component.css'
import { nextTick, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { generateUUID, IdGenerator, IdMapping } from '../common/ids'
import { getNextName } from '../common/nextName'
import { ARGUMENT_COLOR, ARGUMENT_RADIUS_IN_PX, ATTACK_COLOR } from '../common/argumentation/model'
import ArrowSwitcher from './ArrowSwitcher.vue'
import { modifyDocument, type DocumentState } from '../common/state'

// The `GraphComponent` is implemented in away,
// that each instance needs an ID
// if multiple instances are used on the same site.
const graphComponentId = generateUUID()
const graphComponentRef = useTemplateRef('graph-component')

interface ArgumentData {
  name: string
  x: number
  y: number
}

const { savedState, defaultArrowType } = defineProps<{
  savedState: DocumentState<BipoloarArgumentation<ArgumentData>>
  defaultArrowType: 'attack' | 'support'
}>()

let renderedState: DocumentState<BipoloarArgumentation<ArgumentData>> | undefined

function renderNewState(
  state: DocumentState<BipoloarArgumentation<ArgumentData>>,
  center: boolean,
) {
  renderedState = state
  setGraph(renderedState, center)
}

watch(
  () => savedState,
  async (newSavedState, oldSavedState) => {
    if (newSavedState.stateId !== oldSavedState.stateId) {
      if (renderedState !== undefined && newSavedState.stateId !== renderedState.stateId) {
        renderNewState(newSavedState, false)
      }
    }
  },
)

const emit = defineEmits<{
  change: [state: DocumentState<BipoloarArgumentation<ArgumentData>>]
}>()

let idGenerator = new IdGenerator()
let idMapping = new IdMapping<number, number>()

function* argumentNames() {
  for (const [_id, { name }] of renderedState!.current.content.arguments()) {
    yield name
  }
}

function getNextArgumentName() {
  return getNextName(argumentNames())
}

function createNewState(recipe: (draft: BipoloarArgumentation<ArgumentData>) => void) {
  if (renderedState === undefined) {
    throw new Error('Cannot create new state from undefined state.')
  }
  const nextState = modifyDocument(renderedState, recipe)
  if (nextState !== undefined) {
    renderedState = nextState
    emit('change', renderedState)
  }
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
  const argumentData = {
    name: name,
    x: node.x,
    y: node.y,
  }
  createNewState((draft) => draft.addArgument(publicId, argumentData))
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
  createNewState((draft) => draft.deleteArgument(publicId))
}

function onLinkClicked(
  link: {
    id: string
    label?: string
  },
  event: PointerEvent,
) {
  if (event.button !== 0) {
    return
  }
  const { sourceId: internalSourceId, targetId: internalTargetId } = parseLinkId(link.id)
  // If mapping does not exist, the link was already deleted when a node was deleted.
  if (!idMapping.has(internalSourceId) || !idMapping.has(internalTargetId)) {
    return
  }
  const publicSourceId = idMapping.getOrFail(internalSourceId)
  const publicTargetId = idMapping.getOrFail(internalTargetId)
  let arrowType: 'attack' | 'support' | undefined
  if (renderedState?.current?.content.hasAttack(publicSourceId, publicTargetId)) {
    arrowType = 'attack'
  }
  if (renderedState?.current?.content.hasSupport(publicSourceId, publicTargetId)) {
    arrowType = 'support'
  }
  arrowSwitcherTarget.value = {
    linkId: link.id,
    targetElement: event.currentTarget as SVGElement,
    arrowType: arrowType!,
  }
}

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
  if (defaultArrowType === 'support') {
    createNewState((draft) => draft.addSupport(publicSourceId, publicTargetId))
  } else {
    createNewState((draft) => draft.addAttack(publicSourceId, publicTargetId))
  }
  const arrowType = defaultArrowType === 'support' ? ArrowType.DOUBLE : ArrowType.SINGLE
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
  // If mapping does not exist, the link was already deleted when a node was deleted.
  if (!idMapping.has(internalSourceId) || !idMapping.has(internalTargetId)) {
    return
  }
  const publicSourceId = idMapping.getOrFail(internalSourceId)
  const publicTargetId = idMapping.getOrFail(internalTargetId)
  // TODO pull out
  createNewState((draft) => draft.deleteAttackOrSupport(publicSourceId, publicTargetId))
}

function onNodesMoved(positions: PositionSnapshot[]) {
  createNewState((argumentation) => {
    positions.forEach((position) => {
      const internalId = position.nodeId
      const publicId = idMapping.getOrFail(internalId)
      const argumentData = argumentation.getArgument(publicId)
      argumentData.x = position.x
      argumentData.y = position.y
    })
  })
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

  renderNewState(savedState, true)
})

function setGraph(
  state: DocumentState<BipoloarArgumentation<ArgumentData>>,
  center: boolean,
): void {
  const graphComponent = graphComponentRef.value
  if (graphComponent === null) {
    throw new Error('Graph component is not rendered.')
  }
  idGenerator = new IdGenerator()
  idMapping = new IdMapping()
  const arg = state.current.content
  const nodes: jsonNode[] = [...arg.arguments()].map(([id, data]) => {
    return {
      id: id,
      label: data.name,
      x: data.x,
      y: data.y,
      color: ARGUMENT_COLOR,
    }
  })
  // TODO Pull out
  const attackLinks: jsonLink[] = [...arg.attacks()].map(([source, target]) => ({
    sourceId: source,
    targetId: target,
    color: ATTACK_COLOR,
    arrowType: ArrowType.SINGLE,
  }))
  const supportLinks: jsonLink[] = [...arg.supports()].map(([source, target]) => ({
    sourceId: source,
    targetId: target,
    color: ATTACK_COLOR,
    arrowType: ArrowType.DOUBLE,
  }))
  const links = [...attackLinks, ...supportLinks]

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

function updateLinkType(linkId: string, linkType: 'attack' | 'support') {
  arrowSwitcherTarget.value = undefined
  const { sourceId: internalSourceId, targetId: internalTargetId } = parseLinkId(linkId)
  const publicSourceId = idMapping.getOrFail(internalSourceId)
  const publicTargetId = idMapping.getOrFail(internalTargetId)
  createNewState((draft) => {
    if (linkType === 'attack' && draft.hasSupport(publicSourceId, publicTargetId)) {
      draft.addAttack(publicSourceId, publicTargetId)
    } else if (linkType === 'support' && draft.hasAttack(publicSourceId, publicTargetId)) {
      draft.addSupport(publicSourceId, publicTargetId)
    }
  })
  const arrowType = linkType === 'attack' ? ArrowType.SINGLE : ArrowType.DOUBLE
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
  createNewState((draft) => {
    draft.getArgument(publicId).name = label
  })
}

const arrowSwitcherTarget = shallowRef<
  | {
      targetElement: SVGElement
      linkId: string
      arrowType: 'support' | 'attack'
    }
  | undefined
>(undefined)
</script>
<template>
  <div>
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
      :reference="arrowSwitcherTarget.targetElement"
      :arrow-type="arrowSwitcherTarget.arrowType"
      @update:arrow-type="updateLinkType(arrowSwitcherTarget.linkId, $event)"
    />
  </div>
</template>
