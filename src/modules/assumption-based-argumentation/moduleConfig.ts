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
import type { Objectish } from 'immer'

import type { ModuleConfig } from '@/app/home/moduleConfig'
import { datasets } from '@/modules/assumption-based-argumentation/examples'
import GraphEditor from '@/modules/assumption-based-argumentation/GraphEditor.vue'
import { ABAF, type ABANodeData } from '@/modules/assumption-based-argumentation/model'
import {
  canLoadFromObject,
  loadFromString,
  saveAsString,
} from '@/modules/assumption-based-argumentation/save/saveFormat'
import {
  TAG_ATTACK,
  TAG_AUGMENTED,
  TAG_COLLECTIVE_RELATIONS,
  TAG_SUPPORT,
} from '@/modules/common/tags'

const TYPE_KEY = 'type'
const ABAF_V1_TYPE = 'aba-v1'

const initialABAF = new ABAF()
initialABAF.addNode(0, { name: 'a', kind: 'assumption', x: -170, y: -90, fact: false })
initialABAF.addNode(1, { name: 'b', kind: 'assumption', x: -170, y: 90, fact: false })
initialABAF.addNode(2, { name: 'p', kind: 'atom', x: 150, y: -90, fact: false })
initialABAF.addNode(3, { name: 'q', kind: 'atom', x: 150, y: 90, fact: false })
initialABAF.addRule(2, [0])
initialABAF.addRule(3, [0, 1])
initialABAF.setContrary(0, 3)
initialABAF.setContrary(1, 2)

export const assumptionBasedArgumentationModule: ModuleConfig<ABAF> = {
  newNamePrefix: 'ABA',
  id: 'assumptionBased',
  is(model: unknown) {
    return model instanceof ABAF
  },
  deserialize(modelSerialized: unknown): ABAF | undefined {
    if (typeof modelSerialized !== 'object' || modelSerialized === null) return undefined
    // @ts-expect-error TS7053: ignore because we deserialize
    if (modelSerialized[TYPE_KEY] !== ABAF_V1_TYPE) return undefined
    const aba = new ABAF()
    // @ts-expect-error TS7053: ignore because we deserialize
    const nodesMap = modelSerialized['nodes'] as Record<string, ABANodeData>
    for (const [id, data] of Object.entries(nodesMap)) {
      aba.addNode(parseInt(id, 10), data)
    }
    // @ts-expect-error TS7053: ignore because we deserialize
    const rules = modelSerialized['rules'] as Array<{ head: number; body: number[] }>
    for (const { head, body } of rules) {
      aba.addRule(head, body)
    }
    // @ts-expect-error TS7053: ignore because we deserialize
    const contraries = modelSerialized['contraries'] as Record<string, number>
    for (const [assumption, target] of Object.entries(contraries)) {
      aba.setContrary(parseInt(assumption, 10), target)
    }
    return aba
  },
  serialize(model: Objectish) {
    if (!this.is(model)) return undefined
    const nodesMap: Record<number, ABANodeData> = {}
    for (const [id, data] of model.nodeEntries()) {
      nodesMap[id] = data
    }
    const contrariesMap: Record<number, number> = {}
    for (const [assumption, target] of model.contraries()) {
      contrariesMap[assumption] = target
    }
    return {
      [TYPE_KEY]: ABAF_V1_TYPE,
      nodes: nodesMap,
      rules: model.rules(),
      contraries: contrariesMap,
    }
  },
  examples: datasets,
  initialCotent: initialABAF,
  editorComponent: GraphEditor,
  evaluationKinds: [],
  canLoadFromObject(dataObject: Record<string, unknown>): boolean {
    return canLoadFromObject(dataObject)
  },
  load(dataString, fileName) {
    return loadFromString(dataString, fileName)
  },
  getSaveString(document, name) {
    return saveAsString(document, name)
  },
  // TODO: restore `underConstruction: true` before merging to dev.
  underConstruction: false,
  tags: [TAG_AUGMENTED, TAG_ATTACK, TAG_SUPPORT, TAG_COLLECTIVE_RELATIONS],
}
