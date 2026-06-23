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

export interface TutorialStep {
  id: string
  title: string
  /** HTML string rendered via v-html — use <kbd> for key hints */
  body: string | ((isTouchDevice: boolean) => string)
  /** Key into the refs map passed to TutorialOverlay. Absent = fixed top-right. */
  anchor?: string
  placement?: StepPlacement
  /** Offset in px from anchor element. Default: 64 */
  offsetPx?: number
  advanceOn: 'button' | 'action'
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
