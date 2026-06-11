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
import { latexExportCommonConfig } from '@/modules/common/argumentation/export'
import { ARGUMENT_RADIUS_IN_PX } from '@/modules/common/argumentation/model'
import type { ExportConfig, ExportStyleOptions } from '@/modules/common/export'
import { renderSvg } from '@/modules/common/export/renderSvg'
import { IdMapping } from '@/modules/common/ids'
import type { PafArgumentData } from '@/modules/probabilistic-argumentation/model'
import type { ProbabilisticArgumentation } from '@/modules/probabilistic-argumentation/model'

const exportLatexPaf: ExportConfig<ProbabilisticArgumentation<PafArgumentData>> = {
  ...latexExportCommonConfig(),
  export(document, styleOptions?: ExportStyleOptions) {
    const inverseScaleFactor = ARGUMENT_RADIUS_IN_PX * 2.4
    const argumentStyle = styleOptions?.argumentStyle ?? 'colored'
    const nameStyle = styleOptions?.nameStyle ?? 'math'
    const attackStyle = styleOptions?.attackStyle ?? 'standard'

    let text = `\\begin{af}[argumentstyle=${argumentStyle},namestyle=${nameStyle},attackstyle=${attackStyle}]\r\n`

    type NodeInfo = { name: string; x: number; y: number; probability: number }
    const nodeMap = new Map<number, NodeInfo>()

    for (const [id, data] of document.arguments()) {
      const name = data.name.replace(/[^a-zA-Z0-9 ]/g, '')
      nodeMap.set(id, {
        name,
        x: data.x / inverseScaleFactor,
        y: (data.y / inverseScaleFactor) * -1,
        probability: data.probability,
      })
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

    for (const [id, node] of nodeMap.entries()) {
      const probOpt = node.probability < 1 ? `,weight=${node.probability}` : ''
      text += `  \\argument[${probOpt.slice(1)}](a${id}){${node.name}} at (${node.x.toFixed(1)},${node.y.toFixed(1)})\r\n`
    }

    for (const [sourceId, targetId, prob] of document.attacks()) {
      const probOpt = prob < 1 ? `[weight=${prob}]` : ''
      text += `  \\attack${probOpt}{a${sourceId}}{a${targetId}}\r\n`
    }

    text += `\\end{af}`
    return { text, svg: renderSvg(text) }
  },
}

const exportTGFPaf: ExportConfig<ProbabilisticArgumentation<PafArgumentData>> = {
  name: 'TGF',
  export(document) {
    let numberOfArguments = 0
    const idMapping = new IdMapping<number, number>()

    for (const [id] of document.arguments()) {
      idMapping.add(id, ++numberOfArguments)
    }

    let text = ''
    for (const [id, data] of document.arguments()) {
      const numberId = idMapping.getOrFail(id)
      text += data.probability < 1 ? `${numberId} ${data.probability}\r\n` : `${numberId}\r\n`
    }
    text += '#\r\n'
    for (const [sourceId, targetId, prob] of document.attacks()) {
      const s = idMapping.getOrFail(sourceId)
      const t = idMapping.getOrFail(targetId)
      text += prob < 1 ? `${s} ${t} ${prob}\r\n` : `${s} ${t}\r\n`
    }
    text = text.trimEnd()
    return { text }
  },
}

export const availableExports: ExportConfig<ProbabilisticArgumentation<PafArgumentData>>[] = [
  exportLatexPaf,
  exportTGFPaf,
]
