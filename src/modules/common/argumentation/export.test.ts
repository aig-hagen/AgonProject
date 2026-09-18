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

import { buildAfOptionList, spliceAfOptions } from '@/modules/common/argumentation/export'

describe('buildAfOptionList', () => {
  test('includes the base styles and omits supportstyle without supports', () => {
    expect(
      buildAfOptionList({ argumentStyle: 'gray', nameStyle: 'bold', attackStyle: 'modern' }, false),
    ).toBe('argumentstyle=gray,namestyle=bold,attackstyle=modern')
  })

  test('includes supportstyle when the document has supports', () => {
    expect(
      buildAfOptionList(
        {
          argumentStyle: 'colored',
          nameStyle: 'math',
          attackStyle: 'standard',
          supportStyle: 'dashed',
        },
        true,
      ),
    ).toBe('argumentstyle=colored,namestyle=math,attackstyle=standard,supportstyle=dashed')
  })

  test('falls back to defaults for unset styles', () => {
    expect(buildAfOptionList({}, false)).toBe(
      'argumentstyle=colored,namestyle=math,attackstyle=standard',
    )
  })
})

describe('spliceAfOptions', () => {
  test('inserts options into a bare \\begin{af}', () => {
    const result = spliceAfOptions('\\begin{af}\n  \\argument(a1){a}\n\\end{af}', 'namestyle=bold')
    expect(result.ok).toBe(true)
    expect(result.text).toBe('\\begin{af}[namestyle=bold]\n  \\argument(a1){a}\n\\end{af}')
  })

  test('replaces existing options', () => {
    const result = spliceAfOptions(
      '\\begin{af}[namestyle=math]\n  \\argument(a1){a}\n\\end{af}',
      'namestyle=bold,attackstyle=modern',
    )
    expect(result.ok).toBe(true)
    expect(result.text).toContain('\\begin{af}[namestyle=bold,attackstyle=modern]')
    expect(result.text).not.toContain('namestyle=math')
  })

  test('drops the brackets when the option list is empty', () => {
    const result = spliceAfOptions('\\begin{af}[namestyle=math]\nx\n\\end{af}', '')
    expect(result.ok).toBe(true)
    expect(result.text).toBe('\\begin{af}\nx\n\\end{af}')
  })

  test('reports a missing marker and leaves the text untouched', () => {
    const text = 'not latex at all'
    const result = spliceAfOptions(text, 'namestyle=bold')
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('missing')
    expect(result.text).toBe(text)
  })

  test('reports an ambiguous marker when there are multiple environments', () => {
    const text = '\\begin{af}\na\n\\end{af}\n\\begin{af}\nb\n\\end{af}'
    const result = spliceAfOptions(text, 'namestyle=bold')
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('ambiguous')
    expect(result.text).toBe(text)
  })
})
