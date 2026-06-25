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
  references: { label: string; url: string }[]
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
    references: [
      { label: 'CTAN Package', url: 'https://ctan.org/pkg/argumentation' },
    ],
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

export interface SetAttack {
  attackers: number[]
  target: number
}

export interface ExportHooks {
  argumentOptions?: (id: number) => string
  attackOptions?: (sourceId: number, targetId: number) => string
  attackSuffix?: (sourceId: number, targetId: number) => string
  argumentAnnotation?: (id: number) => string | undefined
  setAttacks?: Iterable<SetAttack>
}

function buildOpts(...parts: string[]): string {
  const joined = parts.filter(Boolean).join(',')
  return joined ? `[${joined}]` : ''
}

type ArgumentPlacementGenerator = (
  nodeMap: Map<number, NodeExportInfo>,
  snapToGrid: boolean,
  argumentOptions?: (id: number) => string,
) => string

function absolutePlacementGenerator(): ArgumentPlacementGenerator {
  return (nodeMap, snapToGrid, argumentOptions) => {
    let text = ''
    for (const [id, node] of nodeMap.entries()) {
      const x = snapToGrid ? Math.round(node.x).toFixed(1) : node.x.toFixed(1)
      const y = snapToGrid ? Math.round(node.y).toFixed(1) : node.y.toFixed(1)
      text += `  \\argument${buildOpts(argumentOptions?.(id) ?? '')}(a${id}){${node.name}} at (${x},${y})\r\n`
    }
    return text
  }
}

function relativePlacementGenerator(): ArgumentPlacementGenerator {
  return (nodeMap, _snapToGrid, argumentOptions) => {
    // Process bottom-to-top, left-to-right so earlier nodes serve as anchors
    const sorted = [...nodeMap.entries()].sort(([, a], [, b]) => a.y !== b.y ? a.y - b.y : a.x - b.x)
    let text = ''
    const placed = new Map<number, NodeExportInfo>()

    for (const [id, node] of sorted) {
      const extraOpts = argumentOptions?.(id) ?? ''
      if (placed.size === 0) {
        text += `  \\argument${buildOpts(extraOpts)}(a${id}){${node.name}} at (0,0)\r\n`
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
          text += `  \\argument${buildOpts(`right=${dx.toFixed(1)} of a${refId}`, extraOpts)}(a${id}){${node.name}}\r\n`
        } else if (dy === 0 && dx < 0) {
          text += `  \\argument${buildOpts(`left=${(-dx).toFixed(1)} of a${refId}`, extraOpts)}(a${id}){${node.name}}\r\n`
        } else if (dx === 0 && dy > 0) {
          text += `  \\argument${buildOpts(`above=${dy.toFixed(1)} of a${refId}`, extraOpts)}(a${id}){${node.name}}\r\n`
        } else if (dx === 0 && dy < 0) {
          text += `  \\argument${buildOpts(`below=${(-dy).toFixed(1)} of a${refId}`, extraOpts)}(a${id}){${node.name}}\r\n`
        } else if (dx > 0 && dy > 0) {
          text += `  \\argument${buildOpts(`above right=${dy.toFixed(1)} and ${dx.toFixed(1)} of a${refId}`, extraOpts)}(a${id}){${node.name}}\r\n`
        } else if (dx < 0 && dy > 0) {
          text += `  \\argument${buildOpts(`above left=${dy.toFixed(1)} and ${(-dx).toFixed(1)} of a${refId}`, extraOpts)}(a${id}){${node.name}}\r\n`
        } else if (dx > 0 && dy < 0) {
          text += `  \\argument${buildOpts(`below right=${(-dy).toFixed(1)} and ${dx.toFixed(1)} of a${refId}`, extraOpts)}(a${id}){${node.name}}\r\n`
        } else {
          text += `  \\argument${buildOpts(`below left=${(-dy).toFixed(1)} and ${(-dx).toFixed(1)} of a${refId}`, extraOpts)}(a${id}){${node.name}}\r\n`
        }
      }
      placed.set(id, node)
    }

    return text
  }
}

function shortenNameToLetter(name: string): string {
  const match = name.match(/[a-zA-Z0-9]/)
  return match ? match[0] : name
}

export function buildArgumentPlacementText(
  args: IterableIterator<[id: number, data: ArgumentData]>,
  styleOptions?: ExportStyleOptions,
  argumentOptions?: (id: number) => string,
  argumentAnnotation?: (id: number) => string | undefined,
): string {
  const inverseScaleFactor = ARGUMENT_RADIUS_IN_PX * 2.4
  const snapToGrid = styleOptions?.snapToGrid ?? false
  const shortenNames = styleOptions?.shortenNames ?? true
  const coordinateNormalization = styleOptions?.coordinateNormalization ?? 'clamp'
  const normalizer: CoordinateNormalizer =
    coordinateNormalization === 'rank' ? rankCompressionNormalizer() : clampDistancesNormalizer()
  const placementGenerator: ArgumentPlacementGenerator =
    coordinateNormalization === 'rank' ? relativePlacementGenerator() : absolutePlacementGenerator()

  const nodeMap = new Map<number, NodeExportInfo>()
  for (const [argumentId, argumentData] of args) {
    const nameEscaped = argumentData.name.replace(/[^a-zA-Z0-9 ]/g, '')
    const displayName = shortenNames ? shortenNameToLetter(nameEscaped) : nameEscaped
    const rawX = argumentData.x / inverseScaleFactor
    const rawY = (argumentData.y / inverseScaleFactor) * -1
    nodeMap.set(argumentId, { name: displayName, x: rawX, y: rawY })
  }

  offsetNodesToOrigin(nodeMap)
  normalizer(nodeMap)

  let text = placementGenerator(nodeMap, snapToGrid, argumentOptions)
  text += emitAnnotations(nodeMap, argumentAnnotation)
  return text
}

export function exportLatexArgumentationCommon(
  args: IterableIterator<[id: number, data: ArgumentData]>,
  attacks: IterableIterator<[attackerId: number, attackedId: number]>,
  supports: IterableIterator<[attackerId: number, attackedId: number]>,
  styleOptions?: ExportStyleOptions,
  hooks?: ExportHooks,
): ExportResult {
  const inverseScaleFactor = ARGUMENT_RADIUS_IN_PX * 2.4
  const argumentStyle = styleOptions?.argumentStyle ?? 'colored'
  const nameStyle = styleOptions?.nameStyle ?? 'math'
  const attackStyle = styleOptions?.attackStyle ?? 'standard'
  const supportStyle = styleOptions?.supportStyle ?? 'double'
  const snapToGrid = styleOptions?.snapToGrid ?? false
  const shortenNames = styleOptions?.shortenNames ?? true
  const coordinateNormalization = styleOptions?.coordinateNormalization ?? 'clamp'
  const normalizer: CoordinateNormalizer =
    coordinateNormalization === 'rank' ? rankCompressionNormalizer() : clampDistancesNormalizer()
  const placementGenerator: ArgumentPlacementGenerator =
    coordinateNormalization === 'rank' ? relativePlacementGenerator() : absolutePlacementGenerator()

  const afOptions = `[argumentstyle=${argumentStyle},namestyle=${nameStyle},attackstyle=${attackStyle},supportstyle=${supportStyle}]`
  let text = '\\begin{af}\r\n'
  // Step 1: Collect all nodes and their coordinates in a mapping
  const nodeMap = new Map<number, NodeExportInfo>()
  for (const [argumentId, argumentData] of args) {
    const nameEscaped = argumentData.name.replace(/[^a-zA-Z0-9 ]/g, '')
    const displayName = shortenNames ? shortenNameToLetter(nameEscaped) : nameEscaped
    const rawX = argumentData.x / inverseScaleFactor
    const rawY = (argumentData.y / inverseScaleFactor) * -1
    nodeMap.set(argumentId, { name: displayName, x: rawX, y: rawY })
  }

  // Step 2: Normalize coordinates to fit within LaTeX's limitations and optionally snap to grid
  offsetNodesToOrigin(nodeMap)
  normalizer(nodeMap)

  // Step 3: Emit argument, link placements and annotations
  text += placementGenerator(nodeMap, snapToGrid, hooks?.argumentOptions)
  text += emitLinks(processLinks(attacks, supports), hooks?.attackOptions, hooks?.attackSuffix)
  if (hooks?.setAttacks) {
    for (const { attackers, target } of hooks.setAttacks) {
      if (attackers.length === 1) {
        text += `  \\attack{a${attackers[0]}}{a${target}}\r\n`
      } else {
        text += `  \\setattack{${attackers.map((id) => `a${id}`).join(',')}}{a${target}}\r\n`
      }
    }
  }
  text += emitAnnotations(nodeMap, hooks?.argumentAnnotation)
  text += `\\end{af}`
  return {
    text,
    svg: renderSvg(text.replace('\\begin{af}', `\\begin{af}${afOptions}`)),
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

function offsetNodesToOrigin(nodes: Map<number, NodeExportInfo>): void {
  const firstNode = nodes.values().next().value
  if (firstNode === undefined) return
  const offsetX = firstNode.x
  const offsetY = firstNode.y
  for (const node of nodes.values()) {
    node.x -= offsetX
    node.y -= offsetY
  }
}

function emitAnnotations(
  nodeMap: Map<number, NodeExportInfo>,
  argumentAnnotation?: (id: number) => string | undefined,
): string {
  if (!argumentAnnotation) return ''
  let text = ''
  for (const id of nodeMap.keys()) {
    const annotation = argumentAnnotation(id)
    if (annotation !== undefined) {
      text += `  \\annotation[yshift=-10pt]{a${id}}{${annotation}}\r\n`
    }
  }
  return text
}

function emitLinks(
  processedLinks: ProcessedLink[],
  attackOptions?: (sourceId: number, targetId: number) => string,
  attackSuffix?: (sourceId: number, targetId: number) => string,
): string {
  const attack = (s: number, t: number, ...extra: string[]) =>
    `  \\attack${buildOpts(attackOptions?.(s, t) ?? '', ...extra)}{a${s}}{a${t}}${attackSuffix?.(s, t) ?? ''}\r\n`
  const support = (s: number, t: number, ...extra: string[]) =>
    `  \\support${buildOpts(...extra)}{a${s}}{a${t}}\r\n`

  let text = ''
  for (const { type, self, reverseType, sourceId, targetId } of processedLinks) {
    if (self) {
      switch (type) {
        case ProcessedLinkType.None:
          break
        case ProcessedLinkType.Attack:
          text += `  \\selfattack${buildOpts(attackOptions?.(sourceId, targetId) ?? '')}{a${sourceId}}{a${targetId}}\r\n`
          break
        case ProcessedLinkType.Support:
          text += `  \\support[selfattack]{a${sourceId}}{a${targetId}}\r\n`
          break
      }
    } else if (type == ProcessedLinkType.Attack && reverseType === ProcessedLinkType.None) {
      text += attack(sourceId, targetId)
    } else if (type == ProcessedLinkType.Support && reverseType === ProcessedLinkType.None) {
      text += support(sourceId, targetId)
    } else if (type === ProcessedLinkType.None && reverseType == ProcessedLinkType.Attack) {
      text += attack(targetId, sourceId)
    } else if (type === ProcessedLinkType.None && reverseType == ProcessedLinkType.Support) {
      text += support(targetId, sourceId)
    } else if (type === ProcessedLinkType.Attack && reverseType == ProcessedLinkType.Attack) {
      const fwdOpts = attackOptions?.(sourceId, targetId) ?? ''
      const revOpts = attackOptions?.(targetId, sourceId) ?? ''
      if (fwdOpts || revOpts) {
        text += attack(sourceId, targetId)
        text += attack(targetId, sourceId)
      } else {
        text += `  \\dualattack{a${sourceId}}{a${targetId}}\r\n`
      }
    } else if (type === ProcessedLinkType.Attack && reverseType == ProcessedLinkType.Support) {
      text += attack(sourceId, targetId, 'bend right')
      text += support(targetId, sourceId, 'bend right')
    } else if (type === ProcessedLinkType.Support && reverseType == ProcessedLinkType.Attack) {
      text += support(sourceId, targetId, 'bend right')
      text += attack(targetId, sourceId, 'bend right')
    } else if (type === ProcessedLinkType.Support && reverseType == ProcessedLinkType.Support) {
      text += support(sourceId, targetId, 'bend right')
      text += support(targetId, sourceId, 'bend right')
    }
  }
  return text
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
