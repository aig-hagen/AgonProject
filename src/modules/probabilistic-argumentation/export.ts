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
import { exportLatexArgumentationCommon, latexExportCommonConfig } from '@/modules/common/argumentation/export'
import type { ExportConfig, ExportStyleOptions } from '@/modules/common/export'
import { IdMapping } from '@/modules/common/ids'
import type { PafArgumentData, ProbabilisticArgumentation } from '@/modules/probabilistic-argumentation/model'

function* emptyIterator(): IterableIterator<[number, number]> {}

const exportLatexPaf: ExportConfig<ProbabilisticArgumentation<PafArgumentData>> = {
  ...latexExportCommonConfig(),
  export(document, styleOptions?: ExportStyleOptions) {
    function* attackIds(): IterableIterator<[number, number]> {
      for (const [s, t] of document.attacks()) yield [s, t]
    }

    return exportLatexArgumentationCommon(
      document.arguments(),
      attackIds(),
      emptyIterator(),
      styleOptions,
      {
        argumentAnnotation: (id) => {
          const prob = document.getArgument(id).probability
          return prob < 1 ? `{\\scriptsize $${prob}$}` : undefined
        },
        attackSuffix: (s, t) => {
          const prob = document.getAttackProbability(s, t)
          return prob < 1 ? `({\\scriptsize $${prob}$})` : ''
        },
      },
    )
  },
}

const exportTGFPaf: ExportConfig<ProbabilisticArgumentation<PafArgumentData>> = {
  name: 'Trivial Graph Format (TGF)',
  references: [
    { label: 'TGF Format', url: 'https://en.wikipedia.org/wiki/Trivial_Graph_Format' },
  ],
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
