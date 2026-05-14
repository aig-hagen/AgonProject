import type { UUID } from '@/modules/common/ids'

export interface Input<DocumentT> {
  stateId: UUID
  content: DocumentT
}
