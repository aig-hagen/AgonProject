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

import { availableExports } from '@/modules/bipolar-argumentation/export'
import { iccmaImport } from '@/modules/bipolar-argumentation/save/iccmaFormat'
import { ExportFormatId } from '@/modules/common/export'

const iccmaExport = availableExports.find((config) => config.id === ExportFormatId.Iccma)!

test('ICCMA import round-trips through export', () => {
  const text = ['p baf 3', '1 2', 's 2 3', 's 3 1'].join('\r\n')

  const result = iccmaImport.load(text, 'test.baf')

  expect(result.errors).toBeUndefined()
  expect(iccmaExport.export(result.data!, undefined).text).toBe(text)
})
