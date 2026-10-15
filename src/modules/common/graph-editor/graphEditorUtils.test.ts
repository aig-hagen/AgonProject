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

import {
  getContrastingLabelColor,
  parseLinkId,
  resolveCssColor,
} from '@/modules/common/graph-editor/graphEditorUtils'

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

describe('getContrastingLabelColor', () => {
  test('picks whichever of near-black or white contrasts more', () => {
    expect(getContrastingLabelColor('#66ff99')).toBe('#1a1a1a')
    // Mid salmon: a fixed luminance threshold used to pick white here (2.6:1).
    expect(getContrastingLabelColor('#ff7766')).toBe('#1a1a1a')
    expect(getContrastingLabelColor('#004c97')).toBe('#ffffff')
  })

  test('accepts resolved rgb colors and short hex', () => {
    expect(getContrastingLabelColor('rgb(0, 76, 151)')).toBe('#ffffff')
    expect(getContrastingLabelColor('rgba(102, 255, 153, 1)')).toBe('#1a1a1a')
    expect(getContrastingLabelColor('#fff')).toBe('#1a1a1a')
  })

  test('returns an empty string for colors it cannot read', () => {
    expect(getContrastingLabelColor('var(--graph-accepted)')).toBe('')
    expect(getContrastingLabelColor('not a color')).toBe('')
  })
})

describe('resolveCssColor', () => {
  test('passes plain colors through untouched', () => {
    expect(resolveCssColor('#5a87a8', 'light')).toBe('#5a87a8')
    expect(resolveCssColor('transparent', 'dark')).toBe('transparent')
  })
})
