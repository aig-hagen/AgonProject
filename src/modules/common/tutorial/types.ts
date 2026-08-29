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

export interface TutorialContext {
  nodeCount: number
  linkCount: number
  canUndo: boolean
  canRedo: boolean
  isExtensionWindowOpen: boolean
  /** Monotonic count of evaluations triggered — compare against baseline to detect a new one */
  evaluationCount: number
  /** Monotonic count of result highlights — compare against baseline to detect a new one */
  highlightCount: number
  /** Count of uncertain arguments currently in the framework — compare against baseline */
  uncertainNodeCount: number
  /** Count of hyper-links (collective attacks) currently in the framework — compare against baseline */
  hyperLinkCount: number
  /** Monotonic count of acceptance condition edits — compare against baseline to detect a change */
  conditionEditCount: number
  /** Monotonic count of condition editor opens — compare against baseline to detect a new open */
  conditionEditorOpenCount: number
  /** Monotonic count of probability edits (argument or attack) */
  probabilityEditCount: number
  /** Monotonic count of node move gestures (drag-to-reposition) */
  moveCount: number
  /** Monotonic count of pan gestures */
  panCount: number
  /** Monotonic count of zoom gestures */
  zoomCount: number
  /** Monotonic count of center-view (middle-click) actions */
  centerCount: number
  /** Monotonic count of physics mode toggles */
  physicsToggleCount: number
  /** Monotonic count of grid visibility toggles */
  gridToggleCount: number
  /** Monotonic count of completed ctrl+snap gestures */
  ctrlSnapCount: number
  /** Whether the export panel is currently open */
  isExportOpened: boolean
}

export type StepPlacement =
  | 'right-start'
  | 'right-end'
  | 'left-start'
  | 'left-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'

/**
 * A piece of step body content. Plain strings are rendered as HTML (use <kbd>, <strong>, …).
 * The `{ text, tooltipId }` form renders an inline glossary hover tooltip — same convention as
 * `ResultsHeaderPart` in the evaluation windows.
 */
export type TutorialBodyPart = string | { text: string; tooltipId: string }

/** A full step body: either a single HTML string, or a sequence of parts that may include tooltips. */
export type TutorialBody = string | TutorialBodyPart[]

export interface TutorialStep {
  id: string
  title: string
  /** Step body. Plain strings render as HTML; use the parts array to embed glossary tooltips. */
  body: TutorialBody | ((isTouchDevice: boolean) => TutorialBody)
  /** Key into the refs map passed to TutorialOverlay. Absent = fixed top-right. */
  anchor?: string
  /** Key into the refs map — draws a spotlight ring without moving the card. */
  highlight?: string | ((isTouchDevice: boolean) => string | undefined)
  placement?: StepPlacement
  /** Offset in px from anchor element. Default: 64 */
  offsetPx?: number
  advanceOn: 'button' | 'action' | ((isTouchDevice: boolean) => 'button' | 'action')
  /** Only for advanceOn:'action' — auto-advances when true. Receives both current and baseline context. */
  advanceCondition?: (ctx: TutorialContext, baseline: TutorialContext) => boolean
  /** ID of tutorial to offer as follow-up on the final step */
  nextTutorialId?: string
}

export interface Tutorial {
  id: string
  name: string
  description: string
  steps: TutorialStep[]
}
