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
import type { Objectish } from 'immer'

import type { ModuleConfig } from '@/app/home/moduleConfig'
import { DirectedGraph } from '@/modules/common/graph/graph'
import { datasets } from '@/modules/incomplete-argumentation/examples'
import GraphEditor from '@/modules/incomplete-argumentation/GraphEditor.vue'
import { type IafArgumentData, IncompleteArgumentation } from '@/modules/incomplete-argumentation/model'
import {
  canLoadFromObject,
  loadFromString,
  saveAsString,
} from '@/modules/incomplete-argumentation/save/saveFormat'

const IAF_V1_TYPE = 'incomplete-argumentation-v1'
const TYPE_KEY = 'type'

const initialIncompleteArgumentation = new IncompleteArgumentation<IafArgumentData>()
initialIncompleteArgumentation.addArgument(0, { name: 'a', x: 0, y: 0, uncertain: false })
initialIncompleteArgumentation.addArgument(1, { name: 'b', x: 0, y: 200, uncertain: false })
initialIncompleteArgumentation.addArgument(2, { name: 'c', x: 100, y: 100, uncertain: true })
initialIncompleteArgumentation.addDefiniteAttack(0, 1)
initialIncompleteArgumentation.addUncertainAttack(1, 2)

export const incompleteArgumentationModule: ModuleConfig<IncompleteArgumentation<IafArgumentData>> =
  {
    newNamePrefix: 'iAF',
    displayNameSingular: 'Incomplete Argumentation',
    is(model: unknown) {
      return model instanceof IncompleteArgumentation
    },
    deserialize(modelSerialized: unknown): IncompleteArgumentation<IafArgumentData> | undefined {
      if (typeof modelSerialized !== 'object' || modelSerialized === null) return undefined
      // @ts-expect-error TS7053: ignore because we deserialize
      if (modelSerialized[TYPE_KEY] !== IAF_V1_TYPE) return undefined

      const content = new IncompleteArgumentation<IafArgumentData>(
        // @ts-expect-error TS7053: ignore because we deserialize
        new DirectedGraph(modelSerialized['g']['v'], modelSerialized['g']['e']),
      )
      return content
    },
    serialize(model: Objectish) {
      if (!this.is(model)) return undefined
      return {
        [TYPE_KEY]: IAF_V1_TYPE,
        // @ts-expect-error TS2341: intentional private access for serialization
        g: model.g,
      }
    },
    examples: datasets,
    initialCotent: initialIncompleteArgumentation,
    editorComponent: GraphEditor,
    canLoadFromObject(dataObject: Record<string, unknown>): boolean {
      return canLoadFromObject(dataObject)
    },
    load(dataString, fileName) {
      return loadFromString(dataString, fileName)
    },
    getSaveString(document) {
      return saveAsString(document)
    },
    generateHref: '/generate?type=incomplete',
  description: 'Distinguish between certain and uncertain arguments and attacks to represent incomplete information.',
  publications: [
    {
      label: 'Coste-Marquis, S., Devred, C., Konieczny, S., Lagasquie-Schiex, M.-C. & Marquis, P. (2007). On the Merging of Dung\'s Argumentation Systems. Artificial Intelligence, 171(10–15), 730–753.',
      href: 'https://doi.org/10.1016/j.artint.2007.04.012',
    },
    {
      label: 'Baumeister, D., Järvisalo, M., Neugebauer, D., Niskanen, A. & Rothe, J. (2021). Acceptance in Incomplete Argumentation Frameworks. Artificial Intelligence, 295, 103470.',
      href: 'https://doi.org/10.1016/j.artint.2021.103470',
    },
  ],
  }
