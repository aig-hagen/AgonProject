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
import * as z from 'zod'

import meal_wine from '@/../third-party/xai-ca/xray/7a83aa5/examples/meal_wine.json'
import min_uniq_stb from '@/../third-party/xai-ca/xray/7a83aa5/examples/min_uniq_stb.json'

const afXrayExampleSources = [
  meal_wine,
  { ...min_uniq_stb, name: 'unique_stable' },
]

import { layout } from '@/modules/abstract-argumentation/layout'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { Example } from '@/modules/common/examples'
import { IdMapping } from '@/modules/common/ids'

const AfXrayExampleId = z.string()

const AfXrayExample = z.object({
  name: z.string(),
  arguments: z.array(
    z.object({
      id: AfXrayExampleId,
      annotation: z.optional(z.string()),
      name: z.optional(z.string()),
    }),
  ),
  defeats: z.array(
    z.object({
      from: AfXrayExampleId,
      to: AfXrayExampleId,
    }),
  ),
})

type AfXrayExample = z.infer<typeof AfXrayExample>

export const datasets: Example<AbstractArgumentation<ArgumentData>>[] = afXrayExampleSources.map(
  (unverfiedSource) => {
    return {
      name: unverfiedSource.name,
      load: () => {
        const idMapping = new IdMapping<string, number>()
        const source = AfXrayExample.parse(unverfiedSource)
        const argumentation = new AbstractArgumentation<ArgumentData>()
        source.arguments.forEach((argument, idx) => {
          idMapping.add(argument.id, idx)
          argumentation.addArgument(idx, {
            name: argument.id,
            x: 0,
            y: 0,
          })
        })
        for (const defeat of source.defeats) {
          const attackerId = idMapping.getOrFail(defeat.from)
          const attackedId = idMapping.getOrFail(defeat.to)
          argumentation.addAttack(attackerId, attackedId)
        }
        layout(argumentation)
        return argumentation
      },
    }
  },
)
