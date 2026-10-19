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
import { describe, expect, test } from 'vitest'

import { principleRowFor, principleStatus, principleTables } from '@/app/glossary/principles'
import { glossaryModules } from '@/app/glossary/useGlossary'
import * as publications from '@/modules/common/publications/publications'

const knownSources = new Set(Object.values(publications))
const allGlossaries = Object.assign({}, ...glossaryModules.map((m) => m.glossary))

describe.each(principleTables)('$overviewKey', (table) => {
  const semantics = table.groups.flatMap((group) => group.keys)
  const grouped = table.principleGroups.flatMap((group) => group.principles)
  const cells = Object.entries(table.rows).flatMap(([s, row]) =>
    Object.entries(row).map(([p, cell]) => [`${s} ${p}`, p, cell!] as const),
  )

  test('rows cover exactly the grouped semantics', () => {
    expect(Object.keys(table.rows).sort()).toEqual([...semantics].sort())
  })

  test('has an overview entry, and every principle a glossary entry', () => {
    expect(allGlossaries[table.overviewKey]).toBeDefined()
    expect(grouped.filter((p) => !(p in allGlossaries))).toEqual([])
  })

  test('every principle sits in exactly one group', () => {
    expect(new Set(grouped).size).toBe(grouped.length)
    expect(cells.map(([, p]) => p).filter((p) => !grouped.includes(p))).toEqual([])
  })

  test('open and unreferenced cells have no source, all others a known one', () => {
    const bad = cells.filter(([, , cell]) =>
      cell.holds === undefined || cell.unreferenced
        ? cell.source !== undefined
        : !knownSources.has(cell.source!),
    )
    expect(bad.map(([key]) => key)).toEqual([])
  })

  test('principles hidden by default are in the table', () => {
    expect((table.hiddenByDefault ?? []).filter((p) => !grouped.includes(p))).toEqual([])
  })
})

test('a semantics row gives each examined principle a status', () => {
  const row = principleRowFor('GR')!.row
  expect(principleStatus(row.directionality!)).toBe('satisfied')
  expect(principleRowFor('ST')!.row.directionality!.holds).toBe(false)
})
