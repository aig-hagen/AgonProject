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
import { afPrinciples } from '@/modules/abstract-argumentation/principles'
import type { PrincipleCell, PrincipleRow, PrincipleTable } from '@/modules/common/principles/types'

export const principleTables: PrincipleTable[] = [afPrinciples]

export function principleTableFor(overviewKey: string): PrincipleTable | undefined {
  return principleTables.find((table) => table.overviewKey === overviewKey)
}

export function principleRowFor(
  termKey: string,
): { table: PrincipleTable; row: PrincipleRow } | undefined {
  const table = principleTables.find((t) => termKey in t.rows)
  return table && { table, row: table.rows[termKey]! }
}

/** Principles the overview shows before any filtering, in table order. */
export function defaultPrinciples(table: PrincipleTable): string[] {
  return table.principleGroups
    .flatMap((group) => group.principles)
    .filter((p) => !table.hiddenByDefault?.includes(p))
}

export type PrincipleStatus = 'satisfied' | 'violated' | 'open'

export function principleStatus(cell: PrincipleCell): PrincipleStatus {
  if (cell.holds === undefined) return 'open'
  return cell.holds ? 'satisfied' : 'violated'
}

export const statusMark: Record<PrincipleStatus, string> = {
  satisfied: '✓',
  violated: '✗',
  open: '?',
}
