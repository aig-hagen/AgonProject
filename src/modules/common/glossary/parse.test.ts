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

import { buildRegistry, termKeyFromPath } from '@/modules/common/glossary/load'
import { parseGlossaryEntry, parseInline } from '@/modules/common/glossary/parse'
import type { Publication } from '@/modules/common/publications/types'

describe('parseInline', () => {
  test('splits wiki links with and without labels', () => {
    expect(parseInline('A [[CF|conflict-free]] set $S$ that [[defends]] $a$.')).toEqual([
      'A ',
      { ref: 'CF', label: 'conflict-free' },
      ' set $S$ that ',
      { ref: 'defends' },
      ' $a$.',
    ])
  })

  test('keeps math labels intact', () => {
    expect(parseInline('[[extension|$\\sigma$-extension]]')).toEqual([
      { ref: 'extension', label: '$\\sigma$-extension' },
    ])
  })
})

describe('parseGlossaryEntry', () => {
  test('reads frontmatter and the definition', () => {
    const entry = parseGlossaryEntry(
      '---\nlabel: admissible\ntitle: Admissible Set\n---\n\nA set.\n',
    )
    expect(entry).toEqual({ label: 'admissible', title: 'Admissible Set', content: ['A set.'] })
  })

  test('joins wrapped definition lines and splits off the body', () => {
    const entry = parseGlossaryEntry(
      '---\nlabel: x\n---\n\nFirst line\nsecond line.\n\n## Remarks\n\nMore text.\n',
    )
    expect(entry.content).toEqual(['First line second line.'])
    expect(entry.body).toBe('## Remarks\n\nMore text.')
  })

  test('keeps colons in frontmatter values', () => {
    expect(parseGlossaryEntry('---\nlabel: x\ntitle: A: B\n---\nT').title).toBe('A: B')
  })

  test('rejects entries without frontmatter or label', () => {
    expect(() => parseGlossaryEntry('No frontmatter')).toThrow(/frontmatter/)
    expect(() => parseGlossaryEntry('---\ntitle: T\n---\nT')).toThrow(/label/)
  })
})

describe('buildRegistry', () => {
  test('keys terms by file name and merges meta', () => {
    const reference: Publication = {
      kind: 'thesis',
      authors: ['A, B.'],
      year: 2000,
      title: 'T',
      degree: 'PhD',
      school: 'S',
    }
    const registry = buildRegistry(
      { '/x/en/AF.md': '---\nlabel: AF\n---\nAn AF.' },
      { AF: { reference } },
    )
    expect(registry.AF).toEqual({ label: 'AF', content: ['An AF.'], reference })
  })

  test('names the file in parse errors', () => {
    expect(() => buildRegistry({ '/x/en/bad.md': 'oops' })).toThrow('/x/en/bad.md')
    expect(termKeyFromPath('/src/a/glossary/en/selFnADM.md')).toBe('selFnADM')
  })
})
