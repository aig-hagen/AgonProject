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

import { availableExports } from '@/modules/assumption-based-argumentation/export'
import { iccmaImport } from '@/modules/assumption-based-argumentation/save/iccmaFormat'
import { ExportFormatId } from '@/modules/common/export'

const iccmaExport = availableExports.find((config) => config.id === ExportFormatId.Iccma)!

test('ICCMA import round-trips through export', () => {
  const text = ['p aba 4', 'a 1', 'a 2', 'c 1 4', 'c 2 3', 'r 3 1', 'r 4 1 2', 'r 3'].join('\r\n')

  const result = iccmaImport.load(text, 'test.aba')

  expect(result.errors).toBeUndefined()
  expect(iccmaExport.export(result.data!, undefined).text).toBe(text)
})

test('rejects an assumption without a contrary', () => {
  const result = iccmaImport.load('p aba 2\na 1\nr 2 1', 'test.aba')

  expect(result.errors?.[0]?.detail).toBe('Line 2: assumption 1 has no contrary.')
})
