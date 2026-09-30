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
import { describe, expect, test } from 'vitest'

import { parseLinkId } from '@/modules/common/graph-editor/graphEditorUtils'

describe('parseLinkId', () => {
  test('plain links have no kind', () => {
    expect(parseLinkId('3-7')).toStrictEqual({ sourceId: 3, targetId: 7 })
  })

  test('a kind suffix is split off', () => {
    expect(parseLinkId('3-7:contrary')).toStrictEqual({
      sourceId: 3,
      targetId: 7,
      kind: 'contrary',
    })
  })

  test('malformed ids still throw', () => {
    expect(() => parseLinkId('3:contrary')).toThrow('Separator')
    expect(() => parseLinkId('3-7-9')).toThrow('more than once')
  })
})
