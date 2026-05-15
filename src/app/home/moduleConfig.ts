import type { Objectish } from 'immer'

import type { Example } from '@/modules/common/examples'
import type { EditorComponent } from '@/modules/common/graph-editor/graphEditor'
import type { DeserializationResult } from '@/modules/common/save/load'

export interface ModuleConfig<DocumentT extends Objectish> {
  newNamePrefix: string
  displayNameSingular: string
  is(model: Objectish): model is DocumentT
  deserialize(modelSerialized: Objectish): DocumentT | undefined
  serialize(model: Objectish): Objectish | undefined
  examples: Example<DocumentT>[]
  initialCotent: DocumentT
  editorComponent: EditorComponent<DocumentT>
  canLoadFromObject(dataObject: Record<string, unknown>): boolean
  load(dataString: string, fileName: string): DeserializationResult<DocumentT>
  getSaveString(document: DocumentT): string
}
