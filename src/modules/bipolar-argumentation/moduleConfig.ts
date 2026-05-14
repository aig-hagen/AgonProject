import type { Objectish } from 'immer'

import type { ModuleConfig } from '@/app/moduleConfig'
import GraphEditor from '@/modules/bipolar-argumentation/GraphEditor.vue'
import { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import {
  canLoadFromObject,
  loadFromString,
  saveAsString,
} from '@/modules/bipolar-argumentation/save/saveFormat'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import { DirectedGraph } from '@/modules/common/graph/graph'

const BIPOLAR_ARGUMENTATION_V1_TYPE = 'bipolar-argumentation-v1'
const TYPE_KEY = 'type'

const initialBipolarArgumentation = new BipoloarArgumentation<ArgumentData>()
initialBipolarArgumentation.addArgument(0, {
  name: 'a',
  x: 0,
  y: 0,
})
initialBipolarArgumentation.addArgument(1, {
  name: 'b',
  x: 0,
  y: 200,
})
initialBipolarArgumentation.addArgument(2, {
  name: 'c',
  x: 100,
  y: 100,
})
initialBipolarArgumentation.addAttack(0, 2)
initialBipolarArgumentation.addSupport(1, 2)

export const bipoloarArgumentationModule: ModuleConfig<BipoloarArgumentation<ArgumentData>> = {
  newNamePrefix: 'BAF',
  displayNameSingular: 'Bipolar Argumentation',
  is(model: unknown) {
    return model instanceof BipoloarArgumentation
  },
  deserialize(modelSerialized: unknown): BipoloarArgumentation<ArgumentData> | undefined {
    if (typeof modelSerialized !== 'object' || modelSerialized === null) {
      return undefined
    }
    // @ts-expect-error TS7053: ignore because we deserilize
    if (modelSerialized[TYPE_KEY] !== BIPOLAR_ARGUMENTATION_V1_TYPE) {
      return undefined
    }

    const content: BipoloarArgumentation<ArgumentData> = new BipoloarArgumentation(
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
      [TYPE_KEY]: BIPOLAR_ARGUMENTATION_V1_TYPE,
      // @ts-expect-error TS2341: intentional private access for serialization
      g: model.g,
    }
  },
  examples: [],
  initialCotent: initialBipolarArgumentation,
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
