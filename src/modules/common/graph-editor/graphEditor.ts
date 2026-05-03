import type { Component } from 'vue'
import type { UUID } from '../ids'
import type { DocumentState } from '../state'

export const LinkType = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
} as const

export type EditorComponent<DocumentT> = Component<
  {
    state: DocumentState<DocumentT>
  },
  unknown,
  unknown,
  Record<string, never>,
  Record<string, never>,
  {
    change: (state: DocumentState<DocumentT>) => void
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
