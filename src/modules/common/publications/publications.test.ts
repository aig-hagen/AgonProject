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

import abstracts from '@/modules/common/publications/abstracts.json'
import {
  formatCitation,
  formatVenue,
  publicationHref,
  shortLabel,
} from '@/modules/common/publications/format'
import * as publications from '@/modules/common/publications/publications'
import type { Publication } from '@/modules/common/publications/types'

const base = { authors: ['A, B.'], year: 2000, title: 'T' }

describe('formatCitation', () => {
  test('joins one, two and more authors', () => {
    const thesis = { ...base, kind: 'thesis', degree: 'PhD', school: 'S' } as const
    expect(formatCitation(thesis)).toBe('A, B. (2000). T. PhD Thesis, S.')
    expect(formatCitation({ ...thesis, authors: ['A, B.', 'C, D.'] })).toBe(
      'A, B. & C, D. (2000). T. PhD Thesis, S.',
    )
    expect(formatCitation({ ...thesis, authors: ['A, B.', 'C, D.', 'E, F.'] })).toBe(
      'A, B., C, D. & E, F. (2000). T. PhD Thesis, S.',
    )
  })

  test('formats each kind', () => {
    expect(
      formatCitation({
        ...base,
        kind: 'article',
        journal: 'J',
        volume: '7',
        number: '2',
        pages: '1–9',
      }),
    ).toBe('A, B. (2000). T. J, 7(2), pp. 1–9.')
    expect(
      formatCitation({
        ...base,
        kind: 'inproceedings',
        booktitle: 'Proc. of X',
        acronym: 'X 2000',
        series: 'LNCS',
        seriesVolume: '42',
        pages: '1–9',
        publisher: 'P',
      }),
    ).toBe('A, B. (2000). T. In: Proc. of X (X 2000), LNCS 42, pp. 1–9. P.')
    expect(
      formatCitation({
        ...base,
        kind: 'chapter',
        booktitle: 'H',
        editors: ['E, F.'],
        volume: '1',
        chapter: '4',
        publisher: 'P',
      }),
    ).toBe('A, B. (2000). T. In: E, F. (eds.), H, Vol. 1, Chapter 4. P.')
    expect(formatCitation({ ...base, kind: 'book', publisher: 'P' })).toBe('A, B. (2000). T. P.')
  })

  test('skips an acronym the booktitle already contains', () => {
    expect(
      formatVenue({
        ...base,
        kind: 'inproceedings',
        booktitle: 'Proc. of X 2000',
        acronym: 'X 2000',
      }),
    ).toBe('Proc. of X 2000')
  })
})

describe('shortLabel', () => {
  test('uses surnames and et al.', () => {
    expect(shortLabel(publications.D95)).toBe('Dung (1995)')
    expect(shortLabel(publications.DG16)).toBe('Dvořák & Gaggl (2016)')
    expect(shortLabel(publications.BCG18)).toBe('Baroni et al. (2018)')
  })

  test('adds year suffixes on clashes', () => {
    expect(shortLabel(publications.CL05)).toBe('Cayrol & Lagasquie-Schiex (2005a)')
    expect(shortLabel(publications.CL05b)).toBe('Cayrol & Lagasquie-Schiex (2005b)')
  })
})

describe('publication entries', () => {
  const entries = Object.entries(publications) as [string, Publication][]

  test.each(entries)('%s is well-formed', (_, pub) => {
    expect.soft(pub.authors.length).toBeGreaterThan(0)
    for (const author of pub.authors) expect.soft(author).toMatch(/^[^,]+, [^,]+$/)
    expect.soft(pub.year).toBeGreaterThan(1900)
    expect.soft(pub.title).not.toMatch(/\.$/)
    expect.soft(formatVenue(pub)).not.toMatch(/\.$/)
    expect.soft(pub.doi ?? '').toMatch(/^(10\.\d{4,9}\/\S+)?$/)
    expect.soft(publicationHref(pub)).toMatch(/^https?:\/\//)
    expect.soft(('pages' in pub && pub.pages) || '').toMatch(/^(\d+(–\d+)?)?$/)
    expect.soft(pub.tags?.length).toBeGreaterThan(0)
    expect.soft(new Set(pub.tags).size).toBe(pub.tags?.length)
    const isHandbook =
      pub.kind === 'chapter' && pub.booktitle === 'Handbook of Formal Argumentation'
    expect.soft(pub.tags?.includes('handbook')).toBe(isHandbook)
  })

  test('abstracts belong to known publications', () => {
    const keys = new Set(entries.map(([key]) => key))
    expect(Object.keys(abstracts).filter((key) => !keys.has(key))).toEqual([])
  })

  test('short labels are unique', () => {
    const labels = entries.map(([, pub]) => shortLabel(pub))
    expect(new Set(labels).size).toBe(labels.length)
  })
})
