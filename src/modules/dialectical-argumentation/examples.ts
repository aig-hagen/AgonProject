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
import type { Example } from '@/modules/common/examples'
import { getNodePositions } from '@/modules/common/graph-editor/layouting'
import { Layout } from '@/modules/common/main-menu/layouting'
import { type AdfArgumentData, DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'
import { loadFromString } from '@/modules/dialectical-argumentation/save/saveFormat'

import mealWineJson from './examples/meal_wine.json'

const exampleSources: { name: string; description: string; layoutType: Layout; json: unknown }[] =
  [
    {
      name: 'meal_wine',
      description:
        'An ADF version of the meal/wine example: meals conflict via acceptance conditions, White is accepted when Fish or Pasta is chosen, Red when Meat is chosen.',
      layoutType: Layout.Circular,
      json: mealWineJson,
    },
  ]

export const datasets: Example<DialecticalArgumentation<AdfArgumentData>>[] = exampleSources.map(
  ({ name, description, layoutType, json }) => ({
    name,
    description,
    load: () => {
      const result = loadFromString(JSON.stringify(json), name)
      if (!result.success) throw new Error(`Failed to load example "${name}"`)
      return result.data
    },
    applyLayout: (adf) => {
      const nodes = [...adf.arguments()].map(([id]) => id)
      const links = [...adf.links()]
      const positions = getNodePositions(nodes, links, layoutType)
      for (const [id, data] of adf.arguments()) {
        const pos = positions.get(id)!
        data.x = pos.x
        data.y = pos.y
      }
    },
  }),
)
