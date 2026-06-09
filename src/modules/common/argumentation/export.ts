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
import { type Extension } from '@codemirror/state'
import { latex } from 'codemirror-lang-latex'

import { ARGUMENT_RADIUS_IN_PX, type ArgumentData } from '@/modules/common/argumentation/model'
import type { ExportResult, ExportStyleOptions } from '@/modules/common/export'
import { renderSvg } from '@/modules/common/export/renderSvg'

export function latexExportCommonConfig(): {
  name: string
  codemirrorOptions?: {
    extensions: Extension[]
  }
} {
  return {
    name: 'LaTeX (argumentation)',
    codemirrorOptions: {
      extensions: [
        latex({
          linter: {
            checkMissingDocumentEnv: false,
          },
        }),
      ],
    },
  }
}
interface NodeExportInfo {
  name: string
  x: number
  y: number
}

type CoordinateNormalizer = (nodes: Map<number, NodeExportInfo>) => void

function clampDistancesNormalizer(): CoordinateNormalizer {
  return (nodes) => {
    const limitAxis = (coordinate: 'x' | 'y') => {
      const sorted = [...nodes.entries()].sort(([, a], [, b]) => a[coordinate] - b[coordinate])
      let prev: number | null = null
      for (const [, node] of sorted) {
        if (prev === null) {
          prev = node[coordinate]
          continue
        }
        const delta = node[coordinate] - prev
        if (Math.abs(delta) > 2) {
          node[coordinate] = prev + Math.sign(delta) * 2
        }
        prev = node[coordinate]
      }
    }
    limitAxis('x')
    limitAxis('y')
  }
}

function rankCompressionNormalizer(epsilon: number = 0.75, step: number = 1): CoordinateNormalizer {
  return (nodes) => {
    for (const axis of ['x', 'y'] as const) {
      const sorted = [...nodes.entries()].sort(([, a], [, b]) => a[axis] - b[axis])
      let rank = 0
      let prev = sorted[0]?.[1][axis] ?? 0
      for (const [, node] of sorted) {
        if (node[axis] - prev > epsilon) rank++
        prev = node[axis]
        node[axis] = rank * step
      }
    }
  }
}

type ArgumentPlacementGenerator = (nodeMap: Map<number, NodeExportInfo>, snapToGrid: boolean) => string

function absolutePlacementGenerator(): ArgumentPlacementGenerator {
  return (nodeMap, snapToGrid) => {
    let text = ''
    for (const [id, node] of nodeMap.entries()) {
      const x = snapToGrid ? Math.round(node.x).toFixed(1) : node.x.toFixed(1)
      const y = snapToGrid ? Math.round(node.y).toFixed(1) : node.y.toFixed(1)
      text += `  \\argument(a${id}){${node.name}} at (${x},${y})\r\n`
    }
    return text
  }
}

function relativePlacementGenerator(): ArgumentPlacementGenerator {
  return (nodeMap) => {
    // Process bottom-to-top, left-to-right so earlier nodes serve as anchors
    const sorted = [...nodeMap.entries()].sort(([, a], [, b]) => a.y !== b.y ? a.y - b.y : a.x - b.x)
    let text = ''
    const placed = new Map<number, NodeExportInfo>()

    for (const [id, node] of sorted) {
      if (placed.size === 0) {
        text += `  \\argument(a${id}){${node.name}} at (0,0)\r\n`
        placed.set(id, node)
        continue
      }

      // Prefer axis-aligned references; among those, pick the closest
      let bestRef: [number, NodeExportInfo] | null = null
      let bestScore = Infinity
      for (const ref of placed.entries()) {
        const dx = node.x - ref[1].x
        const dy = node.y - ref[1].y
        const score = (dx === 0 || dy === 0 ? 0 : 1e6) + Math.abs(dx) + Math.abs(dy)
        if (score < bestScore) {
          bestScore = score
          bestRef = ref
        }
      }

      if (bestRef !== null) {
        const [refId, refNode] = bestRef
        const dx = node.x - refNode.x
        const dy = node.y - refNode.y
        if (dy === 0 && dx > 0) {
          text += `  \\argument[right=${dx.toFixed(1)} of a${refId}](a${id}){${node.name}}\r\n`
        } else if (dy === 0 && dx < 0) {
          text += `  \\argument[left=${(-dx).toFixed(1)} of a${refId}](a${id}){${node.name}}\r\n`
        } else if (dx === 0 && dy > 0) {
          text += `  \\argument[above=${dy.toFixed(1)} of a${refId}](a${id}){${node.name}}\r\n`
        } else if (dx === 0 && dy < 0) {
          text += `  \\argument[below=${(-dy).toFixed(1)} of a${refId}](a${id}){${node.name}}\r\n`
        } else if (dx > 0 && dy > 0) {
          text += `  \\argument[above right=${dy.toFixed(1)} and ${dx.toFixed(1)} of a${refId}](a${id}){${node.name}}\r\n`
        } else if (dx < 0 && dy > 0) {
          text += `  \\argument[above left=${dy.toFixed(1)} and ${(-dx).toFixed(1)} of a${refId}](a${id}){${node.name}}\r\n`
        } else if (dx > 0 && dy < 0) {
          text += `  \\argument[below right=${(-dy).toFixed(1)} and ${dx.toFixed(1)} of a${refId}](a${id}){${node.name}}\r\n`
        } else {
          text += `  \\argument[below left=${(-dy).toFixed(1)} and ${(-dx).toFixed(1)} of a${refId}](a${id}){${node.name}}\r\n`
        }
      }
      placed.set(id, node)
    }

    return text
  }
}

export function exportLatexArgumentationCommon(
  args: IterableIterator<[id: number, data: ArgumentData]>,
  attacks: IterableIterator<[attackerId: number, attackedId: number]>,
  supports: IterableIterator<[attackerId: number, attackedId: number]>,
  styleOptions?: ExportStyleOptions,
): ExportResult {
  const inverseScaleFactor = ARGUMENT_RADIUS_IN_PX * 2
  const argumentStyle = styleOptions?.argumentStyle ?? 'colored'
  const nameStyle = styleOptions?.nameStyle ?? 'math'
  const attackStyle = styleOptions?.attackStyle ?? 'standard'
  const supportStyle = styleOptions?.supportStyle ?? 'double'
  const snapToGrid = styleOptions?.snapToGrid ?? false
  const coordinateNormalization = styleOptions?.coordinateNormalization ?? 'clamp'
  const normalizer: CoordinateNormalizer =
    coordinateNormalization === 'rank' ? rankCompressionNormalizer() : clampDistancesNormalizer()
  const placementGenerator: ArgumentPlacementGenerator =
    coordinateNormalization === 'rank' ? relativePlacementGenerator() : absolutePlacementGenerator()

  let text = ''
  text += `\\begin{af}[argumentstyle=${argumentStyle},namestyle=${nameStyle},attackstyle=${attackStyle},supportstyle=${supportStyle}]\r\n`
  // Step 1: Collect all nodes and their coordinates in a mapping
  const nodeMap = new Map<number, NodeExportInfo>()
  for (const [argumentId, argumentData] of args) {
    const nameEscaped = argumentData.name.replace(/[^a-zA-Z0-9 ]/g, '')
    const rawX = argumentData.x / inverseScaleFactor
    const rawY = (argumentData.y / inverseScaleFactor) * -1
    nodeMap.set(argumentId, { name: nameEscaped, x: rawX, y: rawY })
  }

  normalizer(nodeMap)

  // Step 2: Process nodes for output
  text += placementGenerator(nodeMap, snapToGrid)
  const processedLinks = processLinks(attacks, supports)
  for (const { type, self, reverseType, sourceId, targetId } of processedLinks) {
    if (self) {
      switch (type) {
        case ProcessedLinkType.None:
          break
        case ProcessedLinkType.Attack:
          text += `  \\selfattack{a${sourceId}}{a${targetId}}\r\n`
          break
        case ProcessedLinkType.Support:
          text += `  \\support[selfattack]{a${sourceId}}{a${targetId}}\r\n`
          break
      }
    } else if (type == ProcessedLinkType.Attack && reverseType === ProcessedLinkType.None) {
      text += `  \\attack{a${sourceId}}{a${targetId}}\r\n`
    } else if (type == ProcessedLinkType.Support && reverseType === ProcessedLinkType.None) {
      text += `  \\support{a${sourceId}}{a${targetId}}\r\n`
    } else if (type === ProcessedLinkType.None && reverseType == ProcessedLinkType.Attack) {
      text += `  \\attack{a${targetId}}{a${sourceId}}\r\n`
    } else if (type === ProcessedLinkType.None && reverseType == ProcessedLinkType.Support) {
      text += `  \\support{a${targetId}}{a${sourceId}}\r\n`
    } else if (type === ProcessedLinkType.Attack && reverseType == ProcessedLinkType.Attack) {
      text += `  \\dualattack{a${sourceId}}{a${targetId}}\r\n`
    } else if (type === ProcessedLinkType.Attack && reverseType == ProcessedLinkType.Support) {
      text += `  \\attack[bend right]{a${sourceId}}{a${targetId}}\r\n`
      text += `  \\support[bend right]{a${targetId}}{a${sourceId}}\r\n`
    } else if (type === ProcessedLinkType.Support && reverseType == ProcessedLinkType.Attack) {
      text += `  \\support[bend right]{a${sourceId}}{a${targetId}}\r\n`
      text += `  \\attack[bend right]{a${targetId}}{a${sourceId}}\r\n`
    } else if (type === ProcessedLinkType.Support && reverseType == ProcessedLinkType.Support) {
      text += `  \\support[bend right]{a${sourceId}}{a${targetId}}\r\n`
      text += `  \\support[bend right]{a${targetId}}{a${sourceId}}\r\n`
    }
  }
  text += `\\end{af}`
  return {
    text: text,
    svg: renderSvg(text),
  }
}

interface ProcessedLink {
  type: ProcessedLinkType
  self: boolean
  reverseType: ProcessedLinkType
  sourceId: number
  targetId: number
}

enum ProcessedLinkType {
  None,
  Attack,
  Support,
}

function processLinks(
  attacks: IterableIterator<[attackerId: number, attackedId: number]>,
  supports: IterableIterator<[attackerId: number, attackedId: number]>,
): ProcessedLink[] {
  const linksProcessed = new Map<string, ProcessedLink>()

  function processLinkType(
    links: IterableIterator<[sourceId: number, targetId: number]>,
    linkType: ProcessedLinkType,
  ) {
    for (const [sourceId, targetId] of links) {
      const key = sourceId < targetId ? sourceId + '|' + targetId : targetId + '|' + sourceId
      const link = linksProcessed.get(key)
      if (link === undefined) {
        let newLink
        if (sourceId === targetId) {
          newLink = {
            type: linkType,
            self: true,
            reverseType: ProcessedLinkType.None,
            sourceId: sourceId,
            targetId: targetId,
          }
        } else if (sourceId < targetId) {
          newLink = {
            type: linkType,
            self: false,
            reverseType: ProcessedLinkType.None,
            sourceId: sourceId,
            targetId: targetId,
          }
        } else {
          newLink = {
            type: ProcessedLinkType.None,
            self: false,
            reverseType: linkType,
            sourceId: targetId,
            targetId: sourceId,
          }
        }
        linksProcessed.set(key, newLink)
        continue
      }
      if (!link.self) {
        if (sourceId < targetId) {
          link.type = linkType
        } else {
          link.reverseType = linkType
        }
      }
    }
  }
  processLinkType(attacks, ProcessedLinkType.Attack)
  processLinkType(supports, ProcessedLinkType.Support)
  return [...linksProcessed.values()]
}
