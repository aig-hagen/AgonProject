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

import { SetAF, type SetAfArgumentData } from '@/modules/collective-attacks-argumentation/model'
import {
  loadFromString,
  saveAsString,
} from '@/modules/collective-attacks-argumentation/save/saveFormat'
import { JsonSyntaxError, ValidationError } from '@/modules/common/save/load'

const FILE_NAME = 'test.json'

test('fail importing JSON with syntax error', () => {
  const result = loadFromString('{[}', FILE_NAME)

  expect(result.success).toBeFalsy()
  expect(result.errors?.[0]).toBeInstanceOf(JsonSyntaxError)
})

test('fail importing JSON with missing property', () => {
  const data = { apiVersion: 'set-af/v1', arguments: {} }

  const result = loadFromString(JSON.stringify(data), FILE_NAME)

  expect(result.success).toBeFalsy()
  expect(result.errors?.[0]).toBeInstanceOf(ValidationError)
})

test('fail importing JSON referencing an unknown argument', () => {
  const data = {
    apiVersion: 'set-af/v1',
    arguments: {},
    attacks: [{ id: 0, attackers: [1], target: 2 }],
  }

  const result = loadFromString(JSON.stringify(data), FILE_NAME)

  expect(result.success).toBeFalsy()
  expect(result.errors?.[0]).toBeInstanceOf(ValidationError)
})

test('save then load round-trips the framework', () => {
  const af = new SetAF<SetAfArgumentData>()
  af.addArgument(0, { name: 'a', x: 1, y: 2 })
  af.addArgument(1, { name: 'b', x: 3, y: 4 })
  af.addArgument(2, { name: 'c', x: 5, y: 6 })
  af.addCollectiveAttack([0, 1], 2)
  af.addCollectiveAttack([2], 0)

  const result = loadFromString(saveAsString(af, FILE_NAME), FILE_NAME)

  expect(result.errors).toBeUndefined()
  expect(result.success).toBeTruthy()
  const loaded = result.data!
  expect([...loaded.arguments()]).toEqual([...af.arguments()])
  expect(loaded.attacks()).toEqual(af.attacks())
})
