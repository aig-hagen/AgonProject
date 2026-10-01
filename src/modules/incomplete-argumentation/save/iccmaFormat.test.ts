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
import { availableExports } from '@/modules/incomplete-argumentation/export'
import { iccmaImport } from '@/modules/incomplete-argumentation/save/iccmaFormat'

const iccmaExport = availableExports.find((config) => config.id === ExportFormatId.Iccma)!

test('ICCMA import round-trips through export', () => {
  const text = ['p iaf 3', 'u 2', '1 2', 'u 2 3'].join('\r\n')

  const result = iccmaImport.load(text, 'test.iaf')

  expect(result.errors).toBeUndefined()
  expect(iccmaExport.export(result.data!, undefined).text).toBe(text)
})
