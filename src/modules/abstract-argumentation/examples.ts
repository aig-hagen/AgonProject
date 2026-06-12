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
import mealWineJson from '@/modules/abstract-argumentation/examples/meal_wine.json'
import uniqueStableJson from '@/modules/abstract-argumentation/examples/unique_stable.json'
import { layout } from '@/modules/abstract-argumentation/layout'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import { loadExampleFromJson } from '@/modules/abstract-argumentation/save/saveFormat'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { Example } from '@/modules/common/examples'

const exampleJsons: unknown[] = [mealWineJson, uniqueStableJson]

export const datasets: Example<AbstractArgumentation<ArgumentData>>[] = exampleJsons.map((json) => {
  const { framework: _, name, description, layoutType } = loadExampleFromJson(json)
  return {
    name: name ?? 'unknown',
    description,
    load: () => loadExampleFromJson(json).framework,
    applyLayout: (af) => layout(af, layoutType),
  }
})
