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
  buildAfOptionList,
  buildNodeLabels,
  type ExportHooks,
  exportLatexArgumentationCommon,
  spliceAfOptions,
} from '@/modules/common/argumentation/export'
import type { ArgumentData } from '@/modules/common/argumentation/model'

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

function args(): IterableIterator<[number, ArgumentData]> {
  return new Map<number, ArgumentData>([
    [1, { name: 'a', x: 0, y: 0 } as ArgumentData],
    [2, { name: 'b', x: 100, y: 0 } as ArgumentData],
    [3, { name: 'c', x: 0, y: 100 } as ArgumentData],
  ]).entries()
}

function linkLines(
  attacks: [number, number][],
  supports: [number, number][] = [],
  hooks?: ExportHooks,
): string[] {
  const { text } = exportLatexArgumentationCommon(
    args(),
    attacks.values(),
    supports.values(),
    undefined,
    hooks,
  )
  return text
    .split('\r\n')
    .map((line) => line.trim())
    .filter((line) => /^\\(attack|dualattack|support|setattack)/.test(line))
}

describe('reciprocal links', () => {
  test('plain mutual attack uses \\dualattack', () => {
    expect(
      linkLines([
        [1, 2],
        [2, 1],
      ]),
    ).toEqual(['\\dualattack{a1}{a2}'])
  })

  test('mutual attack with per-direction options is bent', () => {
    const lines = linkLines(
      [
        [1, 2],
        [2, 1],
      ],
      [],
      { attackOptions: (s, t) => (s === 1 && t === 2 ? 'incomplete' : '') },
    )
    expect(lines).toEqual([
      '\\attack[incomplete,bend right]{a1}{a2}',
      '\\attack[bend right]{a2}{a1}',
    ])
  })

  test('mutual attack with labels is bent and keeps the labels', () => {
    const lines = linkLines(
      [
        [1, 2],
        [2, 1],
      ],
      [],
      { attackSuffix: (s) => (s === 1 ? '($0.5$)' : '') },
    )
    expect(lines).toEqual(['\\attack[bend right]{a1}{a2}($0.5$)', '\\attack[bend right]{a2}{a1}'])
  })

  test('mutual singleton set attacks pair up like plain attacks', () => {
    const lines = linkLines([], [], {
      setAttacks: [
        { attackers: [1], target: 2 },
        { attackers: [2], target: 1 },
        { attackers: [1, 2], target: 3 },
      ],
    })
    expect(lines).toEqual(['\\dualattack{a1}{a2}', '\\setattack{a1,a2}{a3}'])
  })
})

describe('buildNodeLabels', () => {
  const tex = (names: string[], mode: 'auto' | 'full' | 'short', nameStyle = 'math') =>
    buildNodeLabels(names, mode, nameStyle).map((label) => label.tex)

  test('auto keeps short unique names', () => {
    expect(tex(['a', 'b1', 'a_1', 'α'], 'auto')).toEqual(['a', 'b1', 'a_{1}', '\\alpha'])
  })

  test('auto shortens once any name is long', () => {
    expect(tex(['a', 'Guilty', 'Red Wine', 'Äpfel'], 'auto')).toEqual([
      'a',
      'G',
      '\\mathit{RW}',
      '\\textit{\\"{A}}',
    ])
  })

  test('colliding short labels get an index', () => {
    expect(tex(['Alibi', 'Accuse', 'Guilty'], 'short')).toEqual(['A_{1}', 'A_{2}', 'G'])
    expect(tex(['Alibi', 'Accuse'], 'short', 'monospace')).toEqual(['A1', 'A2'])
  })

  test('indexed labels skip ones already taken', () => {
    expect(tex(['A1', 'Alibi', 'Accuse'], 'short', 'none')).toEqual(['A1', 'A2', 'A3'])
    expect(tex(['A_1', 'Alibi', 'Accuse'], 'short')).toEqual(['A_{1}', 'A_{2}', 'A_{3}'])
  })

  test('full keeps names intact', () => {
    expect(tex(['Alibi', 'a_1', 'Käse'], 'full')).toEqual([
      '\\mathit{Alibi}',
      'a_{1}',
      '\\textit{K\\"{a}se}',
    ])
    expect(tex(['a_1', 'Käse'], 'full', 'monospace')).toEqual(['a\\_1', 'K\\"{a}se'])
  })

  test('only shortened labels are flagged', () => {
    expect(buildNodeLabels(['a', 'Alibi'], 'auto', 'math').map((l) => l.shortened)).toEqual([
      false,
      true,
    ])
  })
})

describe('label comments', () => {
  test('shortened arguments carry their full name as a trailing comment', () => {
    const { text } = exportLatexArgumentationCommon(
      new Map<number, ArgumentData>([
        [1, { name: 'Alibi', x: 0, y: 0 } as ArgumentData],
        [2, { name: 'b', x: 100, y: 0 } as ArgumentData],
      ]).entries(),
      [].values(),
      [].values(),
    )
    expect(text.startsWith('\\begin{af}')).toBe(true)
    expect(text).toContain('(a1){A} at (0.00,0.00) % Alibi\r\n')
    expect(text).toMatch(/\(a2\)\{b\} at \([^)]*\)\r\n/)
  })

  test('annotations resolve names through the exported labels', () => {
    const { text } = exportLatexArgumentationCommon(
      new Map<number, ArgumentData>([
        [1, { name: 'Alibi', x: 0, y: 0 } as ArgumentData],
        [2, { name: 'Guilty', x: 100, y: 0 } as ArgumentData],
      ]).entries(),
      [].values(),
      [].values(),
      undefined,
      { argumentAnnotation: (id, label) => (id === 2 ? `$\\neg ${label(1)}$` : undefined) },
    )
    expect(text).toContain('\\annotation{a2}{$\\neg A$}')
  })
})
