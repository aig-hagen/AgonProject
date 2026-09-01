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

import { JsonSyntaxError, ValidationError } from '@/modules/common/save/load'
import {
  type PafArgumentData,
  ProbabilisticArgumentation,
} from '@/modules/probabilistic-argumentation/model'
import { loadFromString, saveAsString } from '@/modules/probabilistic-argumentation/save/saveFormat'

const FILE_NAME = 'test.json'

test('fail importing JSON with syntax error', () => {
  const result = loadFromString('{[}', FILE_NAME)

  expect(result.success).toBeFalsy()
  expect(result.errors?.[0]).toBeInstanceOf(JsonSyntaxError)
})

test('fail importing JSON with missing property', () => {
  const data = { apiVersion: 'probabilistic-argumentation-framework/v1', arguments: {} }

  const result = loadFromString(JSON.stringify(data), FILE_NAME)

  expect(result.success).toBeFalsy()
  expect(result.errors?.[0]).toBeInstanceOf(ValidationError)
})

test('fail importing JSON with out-of-range probability', () => {
  const data = {
    apiVersion: 'probabilistic-argumentation-framework/v1',
    arguments: { 0: { name: 'a', x: 0, y: 0, probability: 1.5 } },
    attacks: [],
  }

  const result = loadFromString(JSON.stringify(data), FILE_NAME)

  expect(result.success).toBeFalsy()
  expect(result.errors?.[0]).toBeInstanceOf(ValidationError)
})

test('save then load round-trips the framework', () => {
  const paf = new ProbabilisticArgumentation<PafArgumentData>()
  paf.addArgument(0, { name: 'a', x: 1, y: 2, probability: 0.5 })
  paf.addArgument(1, { name: 'b', x: 3, y: 4, probability: 1 })
  paf.addAttack(0, 1, 0.25)
  paf.addAttack(1, 0, 1)

  const result = loadFromString(saveAsString(paf, FILE_NAME), FILE_NAME)

  expect(result.errors).toBeUndefined()
  expect(result.success).toBeTruthy()
  const loaded = result.data!
  expect([...loaded.arguments()]).toEqual([...paf.arguments()])
  expect([...loaded.attacks()]).toEqual([...paf.attacks()])
})
