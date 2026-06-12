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
import mealWineJson from '@/modules/dialectical-argumentation/examples/meal_wine.json'
import murderTrialJson from '@/modules/dialectical-argumentation/examples/murder_trial.json'
import { type AdfArgumentData, DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'
import { loadExampleFromJson } from '@/modules/dialectical-argumentation/save/saveFormat'

const exampleJsons: unknown[] = [mealWineJson, murderTrialJson]

export const datasets: Example<DialecticalArgumentation<AdfArgumentData>>[] = exampleJsons.map(
  (json) => {
    const { framework: _, name, description, layoutType } = loadExampleFromJson(json)
    return {
      name: name ?? 'unknown',
      description,
      load: () => loadExampleFromJson(json).framework,
      applyLayout: (adf) => {
        const layout = layoutType ?? Layout.Circular
        const nodes = [...adf.arguments()].map(([id]) => id)
        const links = [...adf.links()]
        const positions = getNodePositions(nodes, links, layout)
        for (const [id, data] of adf.arguments()) {
          const pos = positions.get(id)!
          data.x = pos.x
          data.y = pos.y
        }
      },
    }
  },
)
