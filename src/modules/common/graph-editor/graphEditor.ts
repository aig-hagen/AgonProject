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
import type { Component, InjectionKey, Ref } from 'vue'

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

// Provided by the common GraphEditor so a docked bottom sheet (the compact evaluation
// sheet) can ask the graph to re-fit into the band above it. `coveredFraction` is the
// sheet height as a fraction of the viewport (0..1); null re-fits using the full canvas
// (sheet closed or fully covering — no useful band to fit into).
export const SHEET_REFIT_KEY: InjectionKey<(coveredFraction: number | null) => void> =
  Symbol('sheet-refit')

// Provided by the common GraphEditor so the docked mobile tutorial card (which floats over
// the top of the canvas) can ask the graph to re-fit into the band below it. The argument is
// the number of viewport px the card covers from the top; null re-fits using the full canvas.
export const TUTORIAL_REFIT_KEY: InjectionKey<(coveredTopPx: number | null) => void> =
  Symbol('tutorial-refit')

// Provided by the common GraphEditor so controls rendered deep inside evaluation windows/sheets
// (the semantics and mode selectors) can register their DOM element under a tutorial-ref key for
// the overlay to spotlight. Pass null to deregister (on unmount).
export const TUTORIAL_REF_REGISTRY_KEY: InjectionKey<
  (key: string, el: HTMLElement | null) => void
> = Symbol('tutorial-ref-registry')

// Provided by the common GraphEditor so shared evaluation components can report a parameter-panel
// collapse (desktop card header, or mobile sheet folding to the compact detent) as a tutorial
// action, without each module wiring its own counter.
export const TUTORIAL_COLLAPSE_KEY: InjectionKey<() => void> = Symbol('tutorial-collapse')

// Serializes the live graph canvas into a standalone SVG string (or null if the canvas
// isn't mounted). Provided by the common GraphEditor so the export UI can offer a
// WYSIWYG SVG export without touching the module-agnostic ExportConfig pipeline.
export const GRAPH_SVG_RENDERER_KEY: InjectionKey<() => string | null> =
  Symbol('graph-svg-renderer')

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

/**
 * A button in the floating selection action bar. The shared editor composes these for the
 * current selection (common Rename/Delete + generic edge type-switch), and module wrappers
 * contribute their own domain actions (iAF certainty, ADF condition, PAF probability). Array
 * order is display order; `danger` actions (Delete) are pushed to the far right.
 */
export interface SelectionAction {
  key: string
  label: string
  icon?: Component
  danger?: boolean
  run: () => void
}

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
