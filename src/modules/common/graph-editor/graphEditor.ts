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
import type { Component, Ref } from 'vue'

import type { ExportFileData } from '@/modules/common/export'
import type { UUID } from '@/modules/common/ids'
import { Layout } from '@/modules/common/main-menu/layouting'
import type { GridVisibility, PhysicsMode } from '@/modules/common/main-menu/types'
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

// Layouts offered by the graph editor, shared by the desktop main menu and the
// presentation-neutral command surface below.
export const GRAPH_EDITOR_LAYOUTS: Layout[] = [
  Layout.TopToBottom,
  Layout.BottomToTop,
  Layout.LeftToRight,
  Layout.RightToLeft,
  Layout.ForceDirected,
  Layout.Neato,
  Layout.Circular,
  Layout.Radial,
]

// Imperative handle a shell (desktop or mobile) drives instead of the editor's own
// chrome. Exposed via defineExpose; consumers hold a typed template ref.
export interface GraphEditorCommands {
  fitToView(): void
  applyLayout(layout: Layout): void
  toggleGrid(): void
  toggleNodePhysics(): void
  openExport(): void
  openSettings(): void
  openHelp(): void
  openTutorials(): void
  readonly gridVisibility: Readonly<Ref<GridVisibility>>
  readonly physicsMode: Readonly<Ref<PhysicsMode>>
  readonly hasRanking: Readonly<Ref<boolean>>
  readonly hasSerialisation: Readonly<Ref<boolean>>
}
export type EditorComponent<DocumentT> = Component<
  {
    state: DocumentState<DocumentT>
    historyState: HistoryState
    documentId: number
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
      color?: string
      arrowType?: 'SINGLE' | 'DOUBLE'
      dashArray?: string
      icon?: Component
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

export interface GraphEditorStateHyperLink {
  sourceIds: NodeId[]
  targetId: NodeId
  type: LinkType
}

export interface GraphEditorState {
  stateId: UUID
  redraw: boolean
  nodes: GraphEditorStateNode[]
  links: GraphEditorStateLink[]
  hyperLinks?: GraphEditorStateHyperLink[]
}

export interface Highlight {
  stateId: UUID
  groups: ReadonlyArray<{ nodes: ReadonlySet<NodeId>; color: string }>
  attackedByFirst?: string
}
