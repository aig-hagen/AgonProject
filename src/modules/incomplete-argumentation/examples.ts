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
import type { Example } from '@/modules/common/examples'
import { getNodePositions } from '@/modules/common/graph-editor/layouting'
import murderTrialJson from '@/modules/incomplete-argumentation/examples/murder_trial.json'
import treatmentChoiceJson from '@/modules/incomplete-argumentation/examples/treatment_choice.json'
import {
  type IafArgumentData,
  IncompleteArgumentation,
} from '@/modules/incomplete-argumentation/model'
import { loadExampleFromJson } from '@/modules/incomplete-argumentation/save/saveFormat'

const exampleJsons: unknown[] = [murderTrialJson, treatmentChoiceJson]

export const datasets: Example<IncompleteArgumentation<IafArgumentData>>[] = exampleJsons.map(
  (json) => {
    const { framework: _, name, description, layoutType } = loadExampleFromJson(json)
    return {
      name: name ?? 'unknown',
      description,
      load: () => loadExampleFromJson(json).framework,
      applyLayout: layoutType
        ? async (af) => {
            const layout = layoutType
            const nodes = [...af.arguments()].map(([id]) => id)
            const links = [...af.definiteAttacks(), ...af.uncertainAttacks()]
            const positions = await getNodePositions(nodes, links, layout)
            for (const [id, data] of af.arguments()) {
              const pos = positions.get(id)!
              data.x = pos.x
              data.y = pos.y
            }
          }
        : undefined,
    }
  },
)
