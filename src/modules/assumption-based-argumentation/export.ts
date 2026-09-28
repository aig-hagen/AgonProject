/*
 * AgonProject - The platform to explore different approaches to formal argumentation.
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
import type { ABAF, NodeId } from '@/modules/assumption-based-argumentation/model'
import { buildIccmaText } from '@/modules/common/argumentation/export'
import { type ExportConfig, ExportFormatId } from '@/modules/common/export'
import { IdMapping } from '@/modules/common/ids'

const exportICCMA: ExportConfig<ABAF> = {
  id: ExportFormatId.Iccma,
  name: 'ICCMA',
  references: [
    { label: 'ICCMA 2025 Rules', url: 'https://argumentationcompetition.org/2025/rules.html' },
  ],
  extension: 'aba',
  export(document) {
    const ids = [...document.nodeEntries()].map(([id]) => id).sort((a, b) => a - b)
    const idMapping = new IdMapping<NodeId, number>()
    ids.forEach((id, i) => idMapping.add(id, i + 1))
    const index = (id: NodeId) => idMapping.getOrFail(id)

    function* lines(): IterableIterator<string> {
      const assumptions = document
        .assumptions()
        .map(index)
        .sort((x, y) => x - y)
      for (const a of assumptions) yield `a ${a}`
      const contraries = document
        .contraries()
        .map(([a, c]) => [index(a), index(c)] as const)
        .sort(([x], [y]) => x - y)
      for (const [a, c] of contraries) yield `c ${a} ${c}`
      for (const { head, body } of document.rules()) {
        yield ['r', index(head), ...body.map(index)].join(' ')
      }
      // Facts are a node flag in the model; ICCMA writes them as empty-body rules.
      for (const id of ids) if (document.getNode(id).fact) yield `r ${index(id)}`
    }

    return { text: buildIccmaText('aba', ids.length, lines()) }
  },
}

export const availableExports = [exportICCMA]
