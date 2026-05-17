import type { Component } from 'vue'

import type { ExportFileData } from '@/modules/common/export'
import type { UUID } from '@/modules/common/ids'
import type { DocumentState } from '@/modules/common/state'

export const LinkType = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
} as const

export type EditorComponent<DocumentT> = Component<
  {
    state: DocumentState<DocumentT>
    canUndo: boolean
    canRedo: boolean
    saveFileName: string
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
