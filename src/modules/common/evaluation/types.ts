import type { UUID } from 'crypto'

export interface Input<DocumentT> {
  stateId: UUID
  content: DocumentT
}
