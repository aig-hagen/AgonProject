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

import {
  compareEntries,
  fold,
  type LiteratureEntry,
  searchEntries,
  searchScore,
} from '@/app/literature/search'

const entry = (key: string, authors: string[], year: number, title: string, abstract?: string) =>
  ({
    key,
    publication: { kind: 'thesis', degree: 'PhD', school: 'S', authors, year, title },
    abstract,
  }) satisfies LiteratureEntry

const dvorak = entry('DD18', ['Dvořák, W.', 'Dunne, P.E.'], 2018, 'Computational Problems')
const dung = entry('D95', ['Dung, P.M.'], 1995, 'On the Acceptability of Arguments', 'games')
const amgoud = entry('AB13', ['Amgoud, L.'], 2013, 'Ranking-Based Semantics', 'dung games')

describe('fold', () => {
  test('drops accents and case', () => {
    expect(fold('Dvořák Čyras')).toBe('dvorak cyras')
  })
})

describe('searchScore', () => {
  test('needs every word to match', () => {
    expect(searchScore(dvorak, 'dvorak 2018')).toBeGreaterThan(0)
    expect(searchScore(dvorak, 'dvorak 1995')).toBe(0)
  })

  test('weighs title and authors above the abstract', () => {
    expect(searchScore(dung, 'dung')).toBeGreaterThan(searchScore(amgoud, 'dung'))
  })
})

describe('searchEntries', () => {
  test('returns everything for an empty query', () => {
    expect(searchEntries([dung, amgoud], '  ')).toEqual([dung, amgoud])
  })

  test('ranks the best match first and drops non-matches', () => {
    expect(searchEntries([amgoud, dvorak, dung], 'dung')).toEqual([dung, amgoud])
  })
})

test('sorts by first author, then year', () => {
  expect([dvorak, dung, amgoud].sort(compareEntries)).toEqual([amgoud, dung, dvorak])
})
