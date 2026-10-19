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
import type { Publication } from '@/modules/common/publications/types'

export interface PrincipleCell {
  /** Missing: examined, but open in the literature. */
  holds?: boolean
  source?: Publication
  /** Data-only: where in the source the result is. */
  locator?: string
  /** Shown with the result. */
  remark?: string
  /** Data-only: the stated implication the result follows from. */
  via?: string
  /** Trivial or by definition, so shown without a citation. */
  unreferenced?: true
}

/** Principle glossary key → result. A missing principle was not examined. */
export type PrincipleRow = Partial<Record<string, PrincipleCell>>

/** A group of semantics as the evaluation window shows it. */
export interface SemanticsGroup {
  label: string
  keys: string[]
}

/** A group of principles; `key` names it in the `glossary.principles.groups` messages. */
export interface PrincipleGroup {
  key: string
  principles: string[]
}

export interface PrincipleTable {
  /** Glossary key of the overview entry that shows the whole table. */
  overviewKey: string
  groups: SemanticsGroup[]
  principleGroups: PrincipleGroup[]
  /** Principles left out of the overview until selected. */
  hiddenByDefault?: string[]
  /** Semantics glossary key → results. */
  rows: Record<string, PrincipleRow>
}

type CellOptions = Pick<PrincipleCell, 'remark' | 'via'>

export const holds = (
  source: Publication,
  locator: string,
  options: CellOptions = {},
): PrincipleCell => ({ holds: true, source, locator, ...options })

export const fails = (
  source: Publication,
  locator: string,
  options: CellOptions = {},
): PrincipleCell => ({ holds: false, source, locator, ...options })

export const unreferenced = (value: boolean, options: CellOptions = {}): PrincipleCell => ({
  holds: value,
  unreferenced: true,
  ...options,
})

export const open = (remark?: string): PrincipleCell => (remark ? { remark } : {})
