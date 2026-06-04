/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
 *
 * Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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

function renderWithEngine(dotSource: string, layout: Layout): string {
  switch (layout) {
    case Layout.ForceDirected:
      return graphviz.fdp(dotSource, 'json')
    case Layout.Neato:
      return graphviz.neato(dotSource, 'json')
    case Layout.Circular:
      return graphviz.circo(dotSource, 'json')
    case Layout.Radial:
      return graphviz.twopi(dotSource, 'json')
    default:
      return graphviz.dot(dotSource, 'json')
  }
}

export function getNodePositions(
  nodes: number[],
  links: [sourceId: number, targetId: number][],
  layout: Layout,
): Map<number, Position> {
  const dotSource = argumentationFrameworkToDotSource(nodes, links, layout)
  const dotJsonString = renderWithEngine(dotSource, layout)
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
  switch (layout) {
    case Layout.TopToBottom:
    case Layout.BottomToTop:
    case Layout.LeftToRight:
    case Layout.RightToLeft: {
      const rankdirMap = {
        [Layout.TopToBottom]: 'TB',
        [Layout.BottomToTop]: 'BT',
        [Layout.LeftToRight]: 'LR',
        [Layout.RightToLeft]: 'RL',
      }
      dotSourceLines.push(`  rankdir="${rankdirMap[layout]}"`)
      dotSourceLines.push('  ranksep=1')
      dotSourceLines.push(`  nodesep=${MIN_HORIZONTAL_ARGUMENT_DISTANCE.toString()}`)
      break
    }
    case Layout.ForceDirected:
      dotSourceLines.push('  overlap=false')
      dotSourceLines.push('  K=1.5')
      dotSourceLines.push('  sep="+10"')
      break
    case Layout.Neato:
      dotSourceLines.push('  overlap=false')
      dotSourceLines.push('  sep="+30"')
      break
    case Layout.Circular:
      break
    case Layout.Radial:
      dotSourceLines.push('  ranksep=2')
      break
  }
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
