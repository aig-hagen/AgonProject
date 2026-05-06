import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

import App from './app/App.vue'
import router from './app/router'
import './app/setup-immer'
import { openDocumentsDB } from './app/db'
import { BipoloarArgumentation } from './modules/bipolar-argumentation/model'
import type { ArgumentData } from './modules/common/argumentation/model'
import { DirectedGraph } from './modules/common/graph/graph'
import { AbstractArgumentation } from './modules/abstract-argumentation/model'
import { datasets } from './modules/abstract-argumentation/examples'
import type { Example } from './modules/common/examples'
import type { Objectish } from 'immer'
import BipiolarArgumentationGraphEditor from './modules/bipolar-argumentation/GraphEditor.vue'
import AbstractArgumentationGraphEditor from './modules/abstract-argumentation/GraphEditor.vue'
import type { EditorComponent } from './modules/common/graph-editor/graphEditor'

const PRODUCTION_DATABASE_DOCUMENTS_NAME = 'documents'
const db = await openDocumentsDB(PRODUCTION_DATABASE_DOCUMENTS_NAME)

export interface ModuleConfig<DocumentT extends Objectish> {
  newNamePrefix: string
  displayNameSingular: string
  is(model: Objectish): model is DocumentT
  deserialize(modelSerialized: Objectish): DocumentT | undefined
  serialize(model: Objectish): Objectish | undefined
  examples: Example<DocumentT>[]
  initialCotent: DocumentT
  editorComponent: EditorComponent<DocumentT>
}

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
const BIPOLAR_ARGUMENTATION_V1_TYPE = 'bipolar-argumentation-v1'
const ABSTRACT_ARGUMENTATION_V1_TYPE = 'abstract-argumentation-v1'
const abstractArgumentationModule: ModuleConfig<AbstractArgumentation<ArgumentData>> = {
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
  editorComponent: AbstractArgumentationGraphEditor,
}
const bipoloarArgumentationModule: ModuleConfig<BipoloarArgumentation<ArgumentData>> = {
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
  editorComponent: BipiolarArgumentationGraphEditor,
}
const modules = [abstractArgumentationModule, bipoloarArgumentationModule] as const

const app = createApp(App, {
  db: db,
  modules: modules,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

app.use(VueQueryPlugin, { queryClient })
app.use(createPinia())
app.use(router)

app.mount('#app')
