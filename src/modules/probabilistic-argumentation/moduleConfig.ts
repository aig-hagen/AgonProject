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
import { datasets } from '@/modules/probabilistic-argumentation/examples'
import GraphEditor from '@/modules/probabilistic-argumentation/GraphEditor.vue'
import {
  type PafArgumentData,
  ProbabilisticArgumentation,
} from '@/modules/probabilistic-argumentation/model'
import {
  canLoadFromObject,
  loadFromString,
  saveAsString,
} from '@/modules/probabilistic-argumentation/save/saveFormat'

const PAF_V1_TYPE = 'probabilistic-argumentation-v1'
const TYPE_KEY = 'type'

const initialProbabilisticArgumentation = new ProbabilisticArgumentation<PafArgumentData>()
initialProbabilisticArgumentation.addArgument(0, { name: 'a', x: 0, y: 0, probability: 1 })
initialProbabilisticArgumentation.addArgument(1, { name: 'b', x: 0, y: 200, probability: 0.8 })
initialProbabilisticArgumentation.addArgument(2, { name: 'c', x: 100, y: 100, probability: 1 })
initialProbabilisticArgumentation.addAttack(0, 2, 1)
initialProbabilisticArgumentation.addAttack(1, 2, 0.6)

export const probabilisticArgumentationModule: ModuleConfig<
  ProbabilisticArgumentation<PafArgumentData>
> = {
  newNamePrefix: 'PAF',
  displayNameSingular: 'Probabilistic Argumentation',
  is(model: unknown) {
    return model instanceof ProbabilisticArgumentation
  },
  deserialize(
    modelSerialized: unknown,
  ): ProbabilisticArgumentation<PafArgumentData> | undefined {
    if (typeof modelSerialized !== 'object' || modelSerialized === null) return undefined
    // @ts-expect-error TS7053: ignore because we deserialize
    if (modelSerialized[TYPE_KEY] !== PAF_V1_TYPE) return undefined

    const content = new ProbabilisticArgumentation<PafArgumentData>(
      // @ts-expect-error TS7053: ignore because we deserialize
      new DirectedGraph(modelSerialized['g']['v'], modelSerialized['g']['e']),
    )
    return content
  },
  serialize(model: Objectish) {
    if (!this.is(model)) return undefined
    return {
      [TYPE_KEY]: PAF_V1_TYPE,
      // @ts-expect-error TS2341: intentional private access for serialization
      g: model.g,
    }
  },
  examples: datasets,
  initialCotent: initialProbabilisticArgumentation,
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
  generateHref: '/generate?type=probabilistic',
  description: 'Arguments and attacks can be assigned a probability value between 0 and 1 to quantify uncertainty.',
  publications: [
    {
      label: 'Li, H., Oren, N. & Norman, T.J. (2011). Probabilistic Argumentation Frameworks. TAFA 2011, LNAI 7132.',
      href: 'https://link.springer.com/chapter/10.1007/978-3-642-29184-5_1',
    },
    {
      label: 'Hunter, A. (2014). Probabilistic Qualification of Attack in Abstract Argumentation. International Journal of Approximate Reasoning, 55(2).',
      href: 'https://doi.org/10.1016/j.ijar.2013.09.002',
    },
    {
      label: 'Hunter, A., Polberg, S., Potyka, N., Rienstra, T. & Thimm, M. (2021). Probabilistic Argumentation: A Survey. In: Handbook of Formal Argumentation, Vol. 2, Chapter 7. College Publications.',
      href: 'https://www.collegepublications.co.uk/downloads/handbooks00006.pdf',
    },
  ],
}
