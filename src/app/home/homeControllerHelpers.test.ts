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

import { exportFileName, nextDocumentName } from '@/app/home/homeControllerHelpers'

test('nextDocumentName returns the bare prefix when it is free', () => {
  expect(nextDocumentName([], 'AF')).toBe('AF')
  expect(nextDocumentName(['Other'], 'AF')).toBe('AF')
})

test('nextDocumentName appends the smallest free integer suffix', () => {
  expect(nextDocumentName(['AF'], 'AF')).toBe('AF1')
  expect(nextDocumentName(['AF', 'AF1', 'AF2'], 'AF')).toBe('AF3')
  // Gaps are filled by the smallest missing suffix.
  expect(nextDocumentName(['AF', 'AF2'], 'AF')).toBe('AF1')
})

test('exportFileName keeps allowed characters and strips the rest', () => {
  expect(exportFileName('My Graph_1', 'AF')).toBe('My Graph_1')
  expect(exportFileName('a/b:c*d', 'AF')).toBe('abcd')
})

test('exportFileName falls back to the prefix when nothing usable remains', () => {
  expect(exportFileName('', 'AF')).toBe('AF')
  expect(exportFileName('***', 'AF')).toBe('AF')
  expect(exportFileName('   ', 'AF')).toBe('AF')
})
