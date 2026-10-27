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
import { afComplexity } from '@/modules/abstract-argumentation/complexity'
import {
  type ClassKey,
  type ComplexityCell,
  type ComplexityRow,
  type ComplexityTable,
  SHOWN_PROBLEMS,
  type ShownProblemKey,
} from '@/modules/common/complexity/types'
import type { GlossaryInline } from '@/modules/common/glossary/types'
import { adfComplexity } from '@/modules/dialectical-argumentation/complexity'

export const complexityTables: ComplexityTable[] = [afComplexity, adfComplexity]

export function complexityTableFor(overviewKey: string): ComplexityTable | undefined {
  return complexityTables.find((table) => table.overviewKey === overviewKey)
}

export function complexityRowFor(
  termKey: string,
): { table: ComplexityTable; row?: ComplexityRow; variantRow?: ComplexityRow } | undefined {
  const table = complexityTables.find(
    (t) => termKey in t.rows || termKey in (t.variant?.rows ?? {}),
  )
  return table && { table, row: table.rows[termKey], variantRow: table.variant?.rows[termKey] }
}

export interface CellWords {
  trivial: string
  complete: string
  hard: string
  in: string
  /** Appended to "∉ X" results; omitted where a legend explains it. */
  unless?: string
}

/** "NP-complete", "in L", "Θ₂ᴾ-hard, in Σ₂ᴾ", … with each class as a glossary link. */
export function cellParts(cell: ComplexityCell, words: CellWords): GlossaryInline[] {
  if (cell.trivial) return [words.trivial]
  if (cell.notIn)
    return ['∉ ', { ref: cell.notIn }, ...(words.unless ? [` (${words.unless})`] : [])]
  if (cell.in && cell.in === cell.hard) return [{ ref: cell.in }, words.complete]
  const parts: GlossaryInline[] = []
  if (cell.hard) parts.push({ ref: cell.hard }, words.hard)
  if (cell.hard && cell.in) parts.push(', ')
  if (cell.in) parts.push(`${words.in} `, { ref: cell.in })
  return parts
}

export const problemKeys: Record<ShownProblemKey, string> = {
  ver: 'problemVer',
  cred: 'problemCred',
  skept: 'problemSkept',
  exist: 'problemExist',
  ne: 'problemNE',
}

/** The Complexity tab's term list; `label` names a `glossary.complexity.groups` message. */
export const complexityTermGroups = [
  { label: 'overviews', keys: complexityTables.map((table) => table.overviewKey) },
  { label: 'problems', keys: SHOWN_PROBLEMS.map((p) => problemKeys[p]) },
  {
    label: 'classes',
    // Bottom to top of the hierarchy, not alphabetically.
    keys: [
      'classL',
      'classP',
      'classNP',
      'classCoNP',
      'classDP',
      'classTheta2P',
      'classSigma2P',
      'classPi2P',
      'classD2P',
      'classSigma3P',
      'classPi3P',
      'classPSPACE',
    ] satisfies ClassKey[],
  },
]
