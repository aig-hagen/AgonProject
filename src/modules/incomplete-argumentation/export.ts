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
import type { IafArgumentData, IncompleteArgumentation } from '@/modules/incomplete-argumentation/model'

type Certainty = 'definite' | 'uncertain' | 'none'

interface IafLink {
  forward: Certainty
  reverse: Certainty
  self: boolean
  sourceId: number
  targetId: number
}

function processIafLinks(
  definiteAttacks: IterableIterator<[number, number]>,
  uncertainAttacks: IterableIterator<[number, number]>,
): IafLink[] {
  const map = new Map<string, IafLink>()

  function process(attacks: IterableIterator<[number, number]>, certainty: 'definite' | 'uncertain') {
    for (const [s, t] of attacks) {
      if (s === t) {
        map.set(`${s}|${t}`, { forward: certainty, reverse: 'none', self: true, sourceId: s, targetId: t })
        continue
      }
      const [lo, hi] = s < t ? [s, t] : [t, s]
      const key = `${lo}|${hi}`
      const existing = map.get(key)
      if (existing === undefined) {
        map.set(
          key,
          s < t
            ? { forward: certainty, reverse: 'none', self: false, sourceId: lo, targetId: hi }
            : { forward: 'none', reverse: certainty, self: false, sourceId: lo, targetId: hi },
        )
      } else {
        if (s < t) existing.forward = certainty
        else existing.reverse = certainty
      }
    }
  }

  process(definiteAttacks, 'definite')
  process(uncertainAttacks, 'uncertain')
  return [...map.values()]
}

function attackLine(certainty: Certainty, sourceId: number, targetId: number, extra?: string): string {
  const parts = [certainty === 'uncertain' ? 'incomplete' : '', extra ?? ''].filter(Boolean)
  const opts = parts.length > 0 ? `[${parts.join(',')}]` : ''
  return `  \\attack${opts}{a${sourceId}}{a${targetId}}\r\n`
}

const exportLatexIncompleteArgumentation: ExportConfig<IncompleteArgumentation<IafArgumentData>> = {
  ...latexExportCommonConfig(),
  export(document: IncompleteArgumentation<IafArgumentData>, styleOptions?: ExportStyleOptions) {
    const inverseScaleFactor = ARGUMENT_RADIUS_IN_PX * 2.4
    const argumentStyle = styleOptions?.argumentStyle ?? 'colored'
    const nameStyle = styleOptions?.nameStyle ?? 'math'
    const attackStyle = styleOptions?.attackStyle ?? 'standard'
    const supportStyle = styleOptions?.supportStyle ?? 'double'

    let text = `\\begin{af}[argumentstyle=${argumentStyle},namestyle=${nameStyle},attackstyle=${attackStyle},supportstyle=${supportStyle}]\r\n`

    type NodeInfo = { name: string; x: number; y: number }
    const nodeMap = new Map<number, NodeInfo>()
    const uncertainArgumentIds = new Set<number>()

    for (const [id, data] of document.arguments()) {
      const name = data.name.replace(/[^a-zA-Z0-9 ]/g, '')
      nodeMap.set(id, { name, x: data.x / inverseScaleFactor, y: (data.y / inverseScaleFactor) * -1 })
      if (data.uncertain) uncertainArgumentIds.add(id)
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
      const opts = uncertainArgumentIds.has(id) ? '[incomplete]' : ''
      text += `  \\argument${opts}(a${id}){${node.name}} at (${node.x.toFixed(1)},${node.y.toFixed(1)})\r\n`
    }

    for (const { forward, reverse, self, sourceId, targetId } of processIafLinks(
      document.definiteAttacks(),
      document.uncertainAttacks(),
    )) {
      if (self) {
        const opts = forward === 'uncertain' ? '[incomplete]' : ''
        text += `  \\selfattack${opts}{a${sourceId}}{a${targetId}}\r\n`
      } else if (forward !== 'none' && reverse === 'none') {
        text += attackLine(forward, sourceId, targetId)
      } else if (forward === 'none' && reverse !== 'none') {
        text += attackLine(reverse, targetId, sourceId)
      } else if (forward === 'definite' && reverse === 'definite') {
        text += `  \\dualattack{a${sourceId}}{a${targetId}}\r\n`
      } else {
        if (forward !== 'none') text += attackLine(forward, sourceId, targetId, 'bend right')
        if (reverse !== 'none') text += attackLine(reverse, targetId, sourceId, 'bend right')
      }
    }

    text += `\\end{af}`
    return { text, svg: renderSvg(text) }
  },
}

export const availableExports: ExportConfig<IncompleteArgumentation<IafArgumentData>>[] = [
  exportLatexIncompleteArgumentation,
]
