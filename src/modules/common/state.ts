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

export function possibleUndos<DocumentT extends Objectish>(
  state: DocumentState<DocumentT>,
): number {
  return state.current.changeIdx + 1
}

export function undoContent<DocumentT extends Objectish>(
  state: DocumentState<DocumentT>,
): DocumentState<DocumentT> | undefined {
  if (possibleUndos(state) < 1) {
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

export function possibleRedos<DocumentT extends Objectish>(
  state: DocumentState<DocumentT>,
): number {
  return state.changes.length - state.current.changeIdx - 1
}

export function redoContent<DocumentT extends Objectish>(
  state: DocumentState<DocumentT>,
): DocumentState<DocumentT> | undefined {
  if (possibleRedos(state) < 1) {
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
