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
import type { Component } from 'vue'

import type { ExportFileData } from '@/modules/common/export'
import type { UUID } from '@/modules/common/ids'
import type { DocumentState } from '@/modules/common/state'

export const LinkType = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
} as const

export interface HistoryState {
  canUndo: boolean
  possibleUndos: number
  canRedo: boolean
  possibleRedos: number
}
export type EditorComponent<DocumentT> = Component<
  {
    state: DocumentState<DocumentT>
    historyState: HistoryState
  },
  unknown,
  unknown,
  Record<string, never>,
  Record<string, never>,
  {
    load: () => void
    new: () => void
    change: (state: DocumentState<DocumentT>) => void
    undo: () => void
    redo: () => void
    export: (filedata: ExportFileData) => void
  }
>

export type LinkType = (typeof LinkType)[keyof typeof LinkType]

export type LinkConfigs = Partial<
  Record<
    LinkType,
    {
      displayName: string
    }
  >
>

export type NodeId = number

export interface GraphEditorStateNode {
  id: NodeId
  label: string
  x: number
  y: number
}

export interface GraphEditorStateLink {
  sourceId: NodeId
  targetId: NodeId
  type: LinkType
}

export interface GraphEditorState {
  stateId: UUID
  redraw: boolean
  nodes: GraphEditorStateNode[]
  links: GraphEditorStateLink[]
}

export interface Highlight {
  stateId: UUID
  nodes: Set<NodeId>
  color: string
  restColor: string
}
