import { applyPatches, type Objectish, type Patch, produce } from 'immer'

import { generateUUID, type UUID } from '@/modules/common/ids'

export interface DocumentState<DocumentT> {
  stateId: UUID
  changes: Patch[][]
  inverseChanges: Patch[][]
  current: {
    changeIdx: number
    content: DocumentT
  }
}

export function modifyDocument<DocumentT>(
  state: DocumentState<DocumentT>,
  recipe: (draft: DocumentT) => DocumentT | void,
): DocumentState<DocumentT> | undefined {
  const changeIdx = state.current.changeIdx
  const changes = state.changes.slice(0, changeIdx + 1)
  const inverseChanges = state.inverseChanges.slice(0, changeIdx + 1)
  let changed = false
  const next = produce(state.current.content, recipe, (patches, inversePatches) => {
    changed = patches.length > 0 || inversePatches.length > 0
    changes.push(patches)
    inverseChanges.push(inversePatches)
  })
  if (!changed) {
    return undefined
  }
  return {
    stateId: generateUUID(),
    current: {
      changeIdx: state.current.changeIdx + 1,
      content: next,
    },
    changes,
    inverseChanges,
  }
}

export function setNewContent<DocumentT>(content: DocumentT): DocumentState<DocumentT> | undefined {
  return {
    stateId: generateUUID(),
    current: {
      changeIdx: -1,
      content: content,
    },
    changes: [],
    inverseChanges: [],
  }
}

export function canUndoContent<DocumentT extends Objectish>(
  state: DocumentState<DocumentT>,
): boolean {
  return state.current.changeIdx !== -1
}

export function undoContent<DocumentT extends Objectish>(
  state: DocumentState<DocumentT>,
): DocumentState<DocumentT> | undefined {
  if (!canUndoContent(state)) {
    return undefined
  }
  const changeIdx = state.current.changeIdx
  const changes = [...state.changes]
  const inverseChanges = [...state.inverseChanges]
  const next = produce(state.current.content, (draft) => {
    applyPatches(draft, inverseChanges[changeIdx]!)
  })
  return {
    stateId: generateUUID(),
    current: {
      changeIdx: state.current.changeIdx - 1,
      content: next,
    },
    changes,
    inverseChanges,
  }
}

export function canRedoContent<DocumentT extends Objectish>(
  state: DocumentState<DocumentT>,
): boolean {
  const changeIdx = state.current.changeIdx
  const nextChangeIdx = changeIdx + 1
  return nextChangeIdx < state.changes.length
}

export function redoContent<DocumentT extends Objectish>(
  state: DocumentState<DocumentT>,
): DocumentState<DocumentT> | undefined {
  if (!canRedoContent(state)) {
    return undefined
  }
  const changeIdx = state.current.changeIdx
  const nextChangeIdx = changeIdx + 1
  const changes = [...state.changes]
  const inverseChanges = [...state.inverseChanges]
  const next = produce(state.current.content, (draft) => {
    applyPatches(draft, changes[nextChangeIdx]!)
  })
  return {
    stateId: generateUUID(),
    current: {
      changeIdx: nextChangeIdx,
      content: next,
    },
    changes,
    inverseChanges,
  }
}
