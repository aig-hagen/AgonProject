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
export function exportLatexArgumentationCommon(
  args: IterableIterator<[id: number, data: ArgumentData]>,
  attacks: IterableIterator<[attackerId: number, attackedId: number]>,
  supports: IterableIterator<[attackerId: number, attackedId: number]>,
  styleOptions?: ExportStyleOptions,
): ExportResult {
  const inverseScaleFactor = ARGUMENT_RADIUS_IN_PX * 2.4
  const argumentStyle = styleOptions?.argumentStyle ?? 'colored'
  const nameStyle = styleOptions?.nameStyle ?? 'math'
  const attackStyle = styleOptions?.attackStyle ?? 'standard'
  const supportStyle = styleOptions?.supportStyle ?? 'double'
  const snapToGrid = styleOptions?.snapToGrid ?? false
  const scaleFactor = 1
  const snapToGridValue = (value: number) => (Math.round(value / scaleFactor) * scaleFactor).toFixed(1)

  let text = ''
  text += `\\begin{af}[argumentstyle=${argumentStyle},namestyle=${nameStyle},attackstyle=${attackStyle},supportstyle=${supportStyle}]\r\n`
  // Step 1: Collect all nodes and their coordinates in a mapping
  type NodeExportInfo = { name: string; x: number; y: number }
  const nodeMap = new Map<number, NodeExportInfo>()
  for (const [argumentId, argumentData] of args) {
    const nameEscaped = argumentData.name.replace(/[^a-zA-Z0-9 ]/g, '')
    const rawX = argumentData.x / inverseScaleFactor
    const rawY = (argumentData.y / inverseScaleFactor) * -1
    nodeMap.set(argumentId, { name: nameEscaped, x: rawX, y: rawY })
  }

  const firstNode = nodeMap.values().next().value
  if (firstNode !== undefined) {
    const offsetX = firstNode.x
    const offsetY = firstNode.y
    for (const node of nodeMap.values()) {
      node.x -= offsetX
      node.y -= offsetY
    }
  }

  // Step 2: Process nodes for output
  if (snapToGrid) {
    for (const [argumentId, node] of nodeMap.entries()) {
      const x = snapToGridValue(node.x)
      const y = snapToGridValue(node.y)
      text += `  \\argument(a${argumentId}){${node.name}} at (${x},${y})\r\n`
    }
  } else {
    for (const [argumentId, node] of nodeMap.entries()) {
      const x = node.x.toFixed(1)
      const y = node.y.toFixed(1)
      text += `  \\argument(a${argumentId}){${node.name}} at (${x},${y})\r\n`
    }
  }
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
