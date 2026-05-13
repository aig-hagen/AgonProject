import { Graphviz } from '@hpcc-js/wasm-graphviz'

import { ARGUMENT_RADIUS_IN_PX } from '@/modules/common/argumentation/model'
import { Layout } from '@/modules/common/main-menu/layouting'

const NUMERIC_ID_TO_STRING_RADIX = 16

const graphviz = await Graphviz.load()

interface DotJson {
  // Objects is unset, when the graph has no nodes.
  objects?: {
    name: string
    pos: string
  }[]
}

interface Position {
  x: number
  y: number
}

export function getNodePositions(
  nodes: number[],
  links: [sourceId: number, targetId: number][],
  layout: Layout,
): Map<number, Position> {
  const dotSource = argumentationFrameworkToDotSource(nodes, links, layout)
  const dotJsonString = graphviz.dot(dotSource, 'json')
  const dotJson = JSON.parse(dotJsonString) as DotJson

  const nodePositions = new Map()
  for (const object of dotJson.objects ?? []) {
    const stringId = object.name
    const [xString, yString] = object.pos.split(',')
    if (xString === undefined || yString === undefined) {
      throw new Error('Invalid object position: ' + object.pos)
    }
    const x = Number.parseFloat(xString)
    const y = Number.parseFloat(yString)
    if (!Number.isFinite(x)) {
      throw new Error('Invalid x value in object position: ' + object.pos)
    }
    if (!Number.isFinite(y)) {
      throw new Error('Invalid y value in object position: ' + object.pos)
    }
    const id = parseInt(stringId, NUMERIC_ID_TO_STRING_RADIX)
    nodePositions.set(id, {
      x: x,
      y: y,
    })
  }

  return convertPositionsForArgumentEditor(nodePositions)
}

export function argumentationFrameworkToDotSource(
  nodes: number[],
  links: [sourceId: number, targetId: number][],
  layout: Layout,
) {
  let rankdir: string
  switch (layout) {
    case Layout.TopToBottom:
      rankdir = 'TB'
      break
    case Layout.BottomToTop:
      rankdir = 'BT'
      break
    case Layout.LeftToRight:
      rankdir = 'LR'
      break
    case Layout.RightToLeft:
      rankdir = 'RL'
      break
  }
  // The final dot will look like:
  //
  // ```
  // digraph {
  //   rankdir="BT"
  //   ranksep=1
  //    node [shape=circle, fixedsize=true, width=1.72, height=0.56]
  //
  //     1[shape=circle, fixedsize=true, width=0.56, height=0.56]
  //     2[shape=circle, fixedsize=true, width=0.56, height=0.56]
  //     3[shape=circle, fixedsize=true, width=0.56, height=0.56]
  //
  //     2 -> 1
  //     3 -> 1
  //     3 -> 2
  //     2 -> 3
  // }
  // ```
  // 72 is the default scale used by Graphviz.
  // See https://graphviz.org/doc/info/command.html#-s
  const PIXEL_PER_IN = 72
  function toInch(px: number) {
    return px / PIXEL_PER_IN
  }

  const ARGUMENT_RADIUS_IN_IN = toInch(ARGUMENT_RADIUS_IN_PX)
  const ARGUMENT_DIAMETER_IN_IN = ARGUMENT_RADIUS_IN_IN * 2
  const MIN_HORIZONTAL_ARGUMENT_DISTANCE = ARGUMENT_RADIUS_IN_IN / 2

  const dotSourceLines = []
  dotSourceLines.push('digraph {')
  // NOTE Can be made configurable in the future
  dotSourceLines.push(`  rankdir="${rankdir}"`)
  dotSourceLines.push('  ranksep=1')
  dotSourceLines.push(`  nodesep=${MIN_HORIZONTAL_ARGUMENT_DISTANCE.toString()}`)
  dotSourceLines.push(`  node[fixedsize=true]`)
  dotSourceLines.push('')
  for (const nodeId of nodes) {
    const shapeProps = `shape=circle width=${ARGUMENT_DIAMETER_IN_IN.toString()} height=${ARGUMENT_DIAMETER_IN_IN.toString()}`
    dotSourceLines.push(
      `  "${nodeId.toString(NUMERIC_ID_TO_STRING_RADIX)}"[margin="0,0" ${shapeProps}]`,
    )
  }
  for (const [sourceId, targetId] of links) {
    dotSourceLines.push(
      `  "${sourceId.toString(NUMERIC_ID_TO_STRING_RADIX)}" -> "${targetId.toString(NUMERIC_ID_TO_STRING_RADIX)}"`,
    )
  }
  dotSourceLines.push('')
  dotSourceLines.push('}')
  return dotSourceLines.join('\n')
}

function convertPositionsForArgumentEditor(
  byIdPositions: Map<number, { x: number; y: number }>,
): Map<number, Position> {
  if (byIdPositions.size === 0) {
    return byIdPositions
  }
  const positions = [...byIdPositions.values()]
  const ys = positions.map((position) => position.y)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const height = yMax - yMin

  return new Map(
    [...byIdPositions.entries()].map(([id, position]) => [
      id,
      {
        x: position.x,
        y: height - position.y,
      },
    ]),
  )
}
