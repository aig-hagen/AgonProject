import type { Objectish } from 'immer'

import type { ModuleConfig } from '@/app/home/moduleConfig'
import { datasets } from '@/modules/abstract-argumentation/examples'
import GraphEditor from '@/modules/abstract-argumentation/GraphEditor.vue'
import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import {
  canLoadFromObject,
  loadFromString,
  saveAsString,
} from '@/modules/abstract-argumentation/save/saveFormat'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import { DirectedGraph } from '@/modules/common/graph/graph'

const initialAbstractArgumentation = new AbstractArgumentation<ArgumentData>()
initialAbstractArgumentation.addArgument(0, {
  name: 'a',
  x: 0,
  y: 0,
})
initialAbstractArgumentation.addArgument(1, {
  name: 'b',
  x: 0,
  y: 200,
})
initialAbstractArgumentation.addArgument(2, {
  name: 'c',
  x: 100,
  y: 100,
})
initialAbstractArgumentation.addAttack(0, 2)
initialAbstractArgumentation.addAttack(1, 2)

const TYPE_KEY = 'type'
const ABSTRACT_ARGUMENTATION_V1_TYPE = 'abstract-argumentation-v1'
export const abstractArgumentationModule: ModuleConfig<AbstractArgumentation<ArgumentData>> = {
  newNamePrefix: 'AF',
  displayNameSingular: 'Abstract Argumentation',
  is(model: unknown) {
    return model instanceof AbstractArgumentation
  },
  deserialize(modelSerialized: unknown): AbstractArgumentation<ArgumentData> | undefined {
    if (typeof modelSerialized !== 'object' || modelSerialized === null) {
      return undefined
    }
    // @ts-expect-error TS7053: ignore because we deserilize
    if (modelSerialized[TYPE_KEY] !== ABSTRACT_ARGUMENTATION_V1_TYPE) {
      return undefined
    }
    const content: AbstractArgumentation<ArgumentData> = new AbstractArgumentation(
      // @ts-expect-error TS7053: ignore because we deserilize
      new DirectedGraph(modelSerialized['g']['v'], modelSerialized['g']['e']),
    )

    return content
  },
  serialize(model: Objectish) {
    if (!this.is(model)) {
      return undefined
    }
    return {
      [TYPE_KEY]: ABSTRACT_ARGUMENTATION_V1_TYPE,
      // @ts-expect-error TS2341: intentional private access for serialization
      g: model.g,
    }
  },
  examples: datasets,
  initialCotent: initialAbstractArgumentation,
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
}
