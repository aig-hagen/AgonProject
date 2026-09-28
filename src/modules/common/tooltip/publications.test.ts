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

import * as publications from '@/modules/common/tooltip/publications'
import { formatCitation, type Publication } from '@/modules/common/tooltip/publications'

const base = { shortLabel: 'X', year: 2000, title: 'T', venue: 'V', href: 'https://x' }

describe('formatCitation', () => {
  test('joins one, two and more authors', () => {
    expect(formatCitation({ ...base, authors: ['A, B.'] })).toBe('A, B. (2000). T. V.')
    expect(formatCitation({ ...base, authors: ['A, B.', 'C, D.'] })).toBe(
      'A, B. & C, D. (2000). T. V.',
    )
    expect(formatCitation({ ...base, authors: ['A, B.', 'C, D.', 'E, F.'] })).toBe(
      'A, B., C, D. & E, F. (2000). T. V.',
    )
  })
})

describe('publication entries', () => {
  const entries = Object.entries(publications).filter(
    (e): e is [string, Publication] => typeof e[1] === 'object',
  )

  test.each(entries)('%s is well-formed', (_, pub) => {
    expect.soft(pub.authors.length).toBeGreaterThan(0)
    for (const author of pub.authors) expect.soft(author).toMatch(/^[^,]+, [^,]+$/)
    expect.soft(pub.year).toBeGreaterThan(1900)
    expect.soft(pub.title).not.toMatch(/\.$/)
    expect.soft(pub.venue).not.toMatch(/\.$/)
    expect.soft(pub.href).toMatch(/^https?:\/\//)
  })
})
