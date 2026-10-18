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

import { cellParts, complexityTables, problemKeys } from '@/app/glossary/complexity'
import { glossaryModules } from '@/app/glossary/useGlossary'
import { complexityGlossary } from '@/modules/common/complexity/glossary'
import { type ComplexityCell, PROBLEMS, SHOWN_PROBLEMS } from '@/modules/common/complexity/types'
import * as publications from '@/modules/common/publications/publications'

const allGlossaries = Object.assign({}, ...glossaryModules.map((m) => m.glossary))
const knownSources = new Set(Object.values(publications))

const cells = complexityTables.flatMap((table) =>
  [
    ...Object.entries(table.rows).map(([key, row]) => [key, row] as const),
    ...Object.entries(table.variant?.rows ?? {}).map(
      ([key, row]) => [`${key} (variant)`, row] as const,
    ),
  ].flatMap(([key, row]) =>
    PROBLEMS.filter((p) => row[p]).map((p) => [`${key} ${p}`, row[p]!, p] as const),
  ),
)

describe.each(complexityTables)('$overviewKey', (table) => {
  test('has an overview entry', () => {
    expect(complexityGlossary[table.overviewKey]).toBeDefined()
  })

  test('every semantics in the groups is a glossary term', () => {
    const keys = table.groups.flatMap((group) => group.keys)
    expect(keys.length).toBeGreaterThan(0)
    expect(keys.filter((key) => !(key in allGlossaries))).toEqual([])
  })

  test('every row is a glossary term', () => {
    const keys = [...Object.keys(table.rows), ...Object.keys(table.variant?.rows ?? {})]
    expect(keys.filter((key) => !(key in allGlossaries))).toEqual([])
  })
})

test('every shown class and problem has a glossary entry', () => {
  const shown = cells.filter(([, , p]) => (SHOWN_PROBLEMS as readonly string[]).includes(p))
  const classes = shown.flatMap(([, c]) => [c.in, c.hard, c.notIn]).filter((c) => c !== undefined)
  const missing = [...classes, ...Object.values(problemKeys)].filter(
    (key) => !(key in complexityGlossary),
  )
  expect(missing).toEqual([])
})

test('every cell names a publication and a locator', () => {
  expect(cells.filter(([, c]) => !knownSources.has(c.source) || !c.locator.trim())).toEqual([])
})

test('every cell states a result', () => {
  expect(cells.filter(([, c]) => !c.trivial && !c.in && !c.hard && !c.notIn)).toEqual([])
})

// Derived cells only go in after Lars has checked them (literature/notes/derived-cells.md).
test('derived cells are exactly the reviewed ones', () => {
  expect(cells.filter(([, c]) => c.derived).map(([key]) => key)).toEqual([
    'GR count',
    'ID count',
    'EA exist',
    'EA count',
    'SAD exist',
    'WAD exist',
    'WPR exist',
    'adfCF exist',
    'adfNA exist',
    'adfMOD3 exist',
    'adfSAD exist',
    'adfSAD ne',
    'adfS2V exist',
  ])
})

describe('cellParts', () => {
  const words = { trivial: 'trivial', complete: '-complete', hard: '-hard', in: 'in' }
  const cell = (fields: Partial<ComplexityCell>) =>
    ({ source: publications.DD18, locator: 'x', ...fields }) as ComplexityCell

  test('formats each shape', () => {
    expect(cellParts(cell({ trivial: true }), words)).toEqual(['trivial'])
    expect(cellParts(cell({ in: 'classNP', hard: 'classNP' }), words)).toEqual([
      { ref: 'classNP' },
      '-complete',
    ])
    expect(cellParts(cell({ in: 'classL' }), words)).toEqual(['in ', { ref: 'classL' }])
    expect(cellParts(cell({ hard: 'classNP' }), words)).toEqual([{ ref: 'classNP' }, '-hard'])
    expect(cellParts(cell({ in: 'classSigma2P', hard: 'classTheta2P' }), words)).toEqual([
      { ref: 'classTheta2P' },
      '-hard',
      ', ',
      'in ',
      { ref: 'classSigma2P' },
    ])
    expect(
      cellParts(cell({ notIn: 'classOutputP' }), { ...words, unless: 'unless P = NP' }),
    ).toEqual(['∉ ', { ref: 'classOutputP' }, ' (unless P = NP)'])
    expect(cellParts(cell({ notIn: 'classOutputP' }), words)).toEqual([
      '∉ ',
      { ref: 'classOutputP' },
    ])
  })
})
