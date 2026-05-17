/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
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
import { type Patch, produce } from 'immer'
import { expect, test } from 'vitest'

import { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'

test('works with immer', () => {
  const argumentation = new BipoloarArgumentation<undefined>()
  argumentation.addArgument(1, undefined)
  argumentation.addArgument(2, undefined)
  argumentation.addAttack(1, 2)

  const changes: Patch[] = []
  const inverseChanges: Patch[] = []
  const nextArgumentation = produce(
    argumentation,
    (draft) => {
      draft.addSupport(1, 2)
    },
    (patches, inversePatches) => {
      changes.push(...patches)
      inverseChanges.push(...inversePatches)
    },
  )

  expect(nextArgumentation).not.toEqual(argumentation)
  expect(changes).toStrictEqual([
    {
      op: 'replace',
      path: ['g', 'e', 1, 2],
      value: 's',
    },
  ])
  expect(inverseChanges).toEqual([
    {
      op: 'replace',
      path: ['g', 'e', 1, 2],
      value: 'a',
    },
  ])
})
