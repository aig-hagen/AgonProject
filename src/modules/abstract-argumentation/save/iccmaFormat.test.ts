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

import { availableExports } from '@/modules/abstract-argumentation/export'
import { iccmaImport } from '@/modules/abstract-argumentation/save/iccmaFormat'
import { ExportFormatId } from '@/modules/common/export'

const iccmaExport = availableExports.find((config) => config.id === ExportFormatId.Iccma)!

test('ICCMA import round-trips through export', () => {
  const text = ['p af 3', '1 2', '2 3', '3 3'].join('\r\n')

  const result = iccmaImport.load(text, 'test.af')

  expect(result.errors).toBeUndefined()
  expect(iccmaExport.export(result.data!, undefined).text).toBe(text)
})

test('ignores comments and blank lines', () => {
  const result = iccmaImport.load('# generated\np af 2\n\n1 2 # attack\n', 'test.af')

  expect([...result.data!.attacks()]).toEqual([[0, 1]])
})

test('only claims texts with a matching header', () => {
  expect(iccmaImport.canLoad('p af 2\n1 2')).toBe(true)
  expect(iccmaImport.canLoad('p baf 2\n1 2')).toBe(false)
  expect(iccmaImport.canLoad('{"apiVersion": "argumentation-framework/v1"}')).toBe(false)
})

test('rejects indices outside 1..n', () => {
  const result = iccmaImport.load('p af 2\n1 3', 'test.af')

  expect(result.errors?.[0]?.code).toBe('textSyntax')
  expect(result.errors?.[0]?.params.fileName).toBe('test.af')
  expect(result.errors?.[0]?.detail).toBe('Line 2: "3" is not an index between 1 and 2.')
})

test('rejects malformed attack lines', () => {
  const result = iccmaImport.load('p af 2\n1 2 1', 'test.af')

  expect(result.errors?.[0]?.detail).toBe('Line 2: unexpected number of entries in "1 2 1".')
})
