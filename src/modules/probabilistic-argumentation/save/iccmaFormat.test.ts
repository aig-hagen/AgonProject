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

import { ExportFormatId } from '@/modules/common/export'
import { availableExports } from '@/modules/probabilistic-argumentation/export'
import { iccmaImport } from '@/modules/probabilistic-argumentation/save/iccmaFormat'

const iccmaExport = availableExports.find((config) => config.id === ExportFormatId.Iccma)!

test('ICCMA import round-trips through export', () => {
  const text = ['p paf 3', 'w 2 0.5', '1 2', 'w 2 3 0.25'].join('\r\n')

  const result = iccmaImport.load(text, 'test.paf')

  expect(result.errors).toBeUndefined()
  expect(iccmaExport.export(result.data!, undefined).text).toBe(text)
})

test('rejects probabilities outside [0, 1]', () => {
  const result = iccmaImport.load('p paf 2\nw 1 2 1.5', 'test.paf')

  expect(result.errors?.[0]?.detail).toBe('Line 2: "1.5" is not a probability between 0 and 1.')
})
