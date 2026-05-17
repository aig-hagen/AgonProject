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
import type { ExportResult } from '@/modules/common/export'
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
): ExportResult {
  const inverseScaleFactor = ARGUMENT_RADIUS_IN_PX * 2
  let text = ''
  text += `\\begin{af}\r\n`
  for (const [argumentId, argumentData] of args) {
    const nameEscaped = argumentData.name.replace(/[^a-zA-Z0-9 ]/g, '')
    const x = (argumentData.x / inverseScaleFactor).toFixed(2)
    const y = ((argumentData.y / inverseScaleFactor) * -1).toFixed(2)
    text += `  \\argument(a${argumentId}){${nameEscaped}} at (${x},${y})\r\n`
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
            sourceId: sourceId,
            targetId: targetId,
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
