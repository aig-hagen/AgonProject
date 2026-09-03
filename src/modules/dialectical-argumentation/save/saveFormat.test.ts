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
import type { FormulaNode } from '@/modules/dialectical-argumentation/condition/formula'
import {
  type AdfArgumentData,
  DialecticalArgumentation,
} from '@/modules/dialectical-argumentation/model'
import { loadFromString, saveAsString } from '@/modules/dialectical-argumentation/save/saveFormat'

const FILE_NAME = 'test.json'

test('fail importing JSON with syntax error', () => {
  const result = loadFromString('{[}', FILE_NAME)

  expect(result.success).toBeFalsy()
  expect(result.errors?.[0]).toBeInstanceOf(JsonSyntaxError)
})

test('fail importing JSON with missing property', () => {
  const data = { apiVersion: 'dialectical-argumentation-framework/v1' }

  const result = loadFromString(JSON.stringify(data), FILE_NAME)

  expect(result.success).toBeFalsy()
  expect(result.errors?.[0]).toBeInstanceOf(ValidationError)
})

test('save then load round-trips arguments, conditions, and derived links', () => {
  const tautology: FormulaNode = { type: 'tautology' }
  const dependsOnZero: FormulaNode = { type: 'atom', argumentId: 0 }

  const adf = new DialecticalArgumentation<AdfArgumentData>()
  adf.addArgument(0, { name: 'a', x: 1, y: 2, condition: tautology })
  adf.addArgument(1, { name: 'b', x: 3, y: 4, condition: dependsOnZero })
  // Re-run the derivation so the in-memory model has the link 0 -> 1.
  adf.setCondition(0, tautology)
  adf.setCondition(1, dependsOnZero)

  const result = loadFromString(saveAsString(adf, FILE_NAME), FILE_NAME)

  expect(result.errors).toBeUndefined()
  expect(result.success).toBeTruthy()
  const loaded = result.data!
  expect([...loaded.arguments()]).toEqual([...adf.arguments()])
  expect([...loaded.links()]).toEqual([[0, 1]])
})
