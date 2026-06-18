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
import tandemTripJson from '@/modules/collective-attacks-argumentation/examples/tandem_trip.json'
import type { SetAF, SetAfArgumentData } from '@/modules/collective-attacks-argumentation/model'
import { loadExampleFromJson } from '@/modules/collective-attacks-argumentation/save/saveFormat'
import type { Example } from '@/modules/common/examples'

const exampleJsons: unknown[] = [tandemTripJson]

export const datasets: Example<SetAF<SetAfArgumentData>>[] = exampleJsons.map((json) => {
  const { name, description } = loadExampleFromJson(json)
  return {
    name: name ?? 'unknown',
    description,
    load: () => loadExampleFromJson(json).framework,
  }
})
