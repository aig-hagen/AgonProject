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

export const PROBLEMS = ['ver', 'cred', 'skept', 'exist', 'ne', 'count', 'enum'] as const
export type ProblemKey = (typeof PROBLEMS)[number]

/** Problems the glossary shows; counting and enumeration stay in the data for later. */
export const SHOWN_PROBLEMS = [
  'ver',
  'cred',
  'skept',
  'exist',
  'ne',
] as const satisfies ProblemKey[]
export type ShownProblemKey = (typeof SHOWN_PROBLEMS)[number]

/** Glossary keys of the complexity classes (`common/complexity/glossary`). */
export type ClassKey =
  | 'classL'
  | 'classP'
  | 'classNP'
  | 'classCoNP'
  | 'classDP'
  | 'classTheta2P'
  | 'classSigma2P'
  | 'classPi2P'
  | 'classD2P'
  | 'classSigma3P'
  | 'classPi3P'
  | 'classPSPACE'
  | 'classSharpP'
  | 'classSharpCoNP'
  | 'classDelayP'
  | 'classOutputP'

export interface ComplexityCell {
  /** Membership. Equal to `hard` means complete. */
  in?: ClassKey
  hard?: ClassKey
  /** Not in this class unless P = NP (enumeration). */
  notIn?: ClassKey
  trivial?: true
  source: Publication
  locator: string
  /** Qualification shown with the result, e.g. the reduction notion. */
  note?: string
  /** Data-only remark, not shown in the app. */
  comment?: string
  /** Not stated by the source; the reason it follows. Only cells Lars has checked. */
  derived?: string
}

export type ComplexityRow = Partial<Record<ProblemKey, ComplexityCell>>

/** A group of semantics as the evaluation window shows it; `labelKey` is an i18n key. */
export interface ComplexityGroup {
  label?: string
  labelKey?: string
  keys: string[]
}

export interface ComplexityTable {
  /** Glossary key of the overview entry that shows the whole table. */
  overviewKey: string
  /** Every semantics of the module, in the evaluation window's grouping. */
  groups: ComplexityGroup[]
  /** Semantics glossary key → results. */
  rows: Record<string, ComplexityRow>
  /** Same shape for a restricted subclass, e.g. bipolar ADFs. */
  variant?: { label: string; rows: Record<string, ComplexityRow> }
}

type CellOptions = Pick<ComplexityCell, 'note' | 'comment' | 'derived'>

export const complete = (
  cls: ClassKey,
  source: Publication,
  locator: string,
  options: CellOptions = {},
): ComplexityCell => ({ in: cls, hard: cls, source, locator, ...options })

export const member = (
  cls: ClassKey,
  source: Publication,
  locator: string,
  options: CellOptions = {},
): ComplexityCell => ({ in: cls, source, locator, ...options })

export const trivial = (
  source: Publication,
  locator: string,
  options: CellOptions = {},
): ComplexityCell => ({ trivial: true, source, locator, ...options })
