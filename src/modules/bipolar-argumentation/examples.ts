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
import { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import { loadFromString } from '@/modules/bipolar-argumentation/save/saveFormat'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { Example } from '@/modules/common/examples'
import { getNodePositions } from '@/modules/common/graph-editor/layouting'
import { Layout } from '@/modules/common/main-menu/layouting'

import mealWineJson from './examples/meal_wine.json'

const exampleSources: { name: string; description: string; layoutType: Layout; json: unknown }[] =
  [
    {
      name: 'meal_wine',
      description:
        'A bipolar version of the meal/wine example: meals attack each other, and each meal supports its matching wine.',
      layoutType: Layout.Circular,
      json: mealWineJson,
    },
  ]

export const datasets: Example<BipoloarArgumentation<ArgumentData>>[] = exampleSources.map(
  ({ name, description, layoutType, json }) => ({
    name,
    description,
    load: () => {
      const result = loadFromString(JSON.stringify(json), name)
      if (!result.success) throw new Error(`Failed to load example "${name}"`)
      return result.data
    },
    applyLayout: (af) => {
      const nodes = [...af.arguments()].map(([id]) => id)
      const links = [...af.attacks(), ...af.supports()]
      const positions = getNodePositions(nodes, links, layoutType)
      for (const [id, data] of af.arguments()) {
        const pos = positions.get(id)!
        data.x = pos.x
        data.y = pos.y
      }
    },
  }),
)
