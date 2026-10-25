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
import { expect, test } from 'vitest'

import { useLiterature } from '@/app/literature/useLiterature'

test('tags combine with OR within a facet and AND across facets', () => {
  const { selectedTags, filteredEntries, total } = useLiterature([])
  expect(filteredEntries.value).toHaveLength(total)

  selectedTags.value = ['ADF', 'complexity']
  const adfComplexity = filteredEntries.value.map(({ key }) => key)
  expect(adfComplexity).toContain('SW15')
  expect(adfComplexity).not.toContain('BW10')
  expect(adfComplexity).not.toContain('DVW11')

  selectedTags.value = ['ADF', 'AF', 'complexity']
  expect(filteredEntries.value.map(({ key }) => key)).toEqual(
    expect.arrayContaining(['SW15', 'DVW11']),
  )
})

test('searches within the tag selection', () => {
  const { selectedTags, searchQuery, filteredEntries } = useLiterature([])
  selectedTags.value = ['ADF']
  searchQuery.value = 'semi-stable'
  const keys = filteredEntries.value.map(({ key }) => key)
  expect(keys).toEqual(expect.arrayContaining(['KVV21', 'KW24']))
  expect(filteredEntries.value.every(({ publication }) => publication.tags?.includes('ADF'))).toBe(
    true,
  )
})

test('counts each tag against the search and the other facets', () => {
  const { selectedTags, tagCounts, filteredEntries, reset, searchQuery } = useLiterature([])
  selectedTags.value = ['ADF']
  // Within its own facet a count ignores that facet's selection, since tags there combine with OR.
  expect(tagCounts.value.AF).toBeGreaterThan(0)
  expect(tagCounts.value.complexity).toBe(
    filteredEntries.value.filter(({ publication }) => publication.tags?.includes('complexity'))
      .length,
  )

  searchQuery.value = 'semi-stable'
  reset()
  expect(searchQuery.value).toBe('')
  expect(selectedTags.value).toEqual([])
})
