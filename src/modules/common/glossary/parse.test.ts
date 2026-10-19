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
import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  buildRegistry,
  createGlossary,
  localeFromPath,
  setGlossaryLocale,
  termKeyFromPath,
} from '@/modules/common/glossary/load'
import { parseBody, parseGlossaryEntry, parseInline } from '@/modules/common/glossary/parse'
import type { Publication } from '@/modules/common/publications/types'

// A literal double hash trips the license-header tool (its regex marker).
const H2 = '#'.repeat(2)
const H3 = '#'.repeat(3)

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

describe('parseBody', () => {
  test('reads headings, paragraphs, lists and citations', () => {
    const body = parseBody(
      `${H2} Remarks\n\nIntroduced by [@D95],\nsee [[CO]].\n\n${H3} Sources\n- [@BCG18]: overview\n  of semantics\n- [@DD18]`,
    )
    expect(body).toEqual([
      { kind: 'heading', level: 2, content: ['Remarks'] },
      {
        kind: 'paragraph',
        content: ['Introduced by ', { cite: 'D95' }, ', see ', { ref: 'CO' }, '.'],
      },
      { kind: 'heading', level: 3, content: ['Sources'] },
      { kind: 'list', items: [[{ cite: 'BCG18' }, ': overview of semantics'], [{ cite: 'DD18' }]] },
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
      `---\nlabel: x\n---\n\nFirst line\nsecond line.\n\n${H2} Remarks\n\nMore text.\n`,
    )
    expect(entry.content).toEqual(['First line second line.'])
    expect(entry.body).toEqual([
      { kind: 'heading', level: 2, content: ['Remarks'] },
      { kind: 'paragraph', content: ['More text.'] },
    ])
  })

  test('keeps colons in frontmatter values', () => {
    expect(parseGlossaryEntry('---\nlabel: x\ntitle: A: B\n---\nT').title).toBe('A: B')
    expect(parseGlossaryEntry('---\nlabel: x\nshort: S\n---\nT').short).toBe('S')
  })

  test('rejects citations in the definition', () => {
    expect(() => parseGlossaryEntry('---\nlabel: x\n---\nSee [@D95].')).toThrow(/body/)
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

describe('createGlossary', () => {
  const english = {
    '/x/en/A.md': '---\nlabel: a\n---\nEnglish A.',
    '/x/en/B.md': `---\nlabel: b\n---\nEnglish B.\n\n${H2} Remarks\n\nMore.`,
  }
  const german = { '/x/de/B.md': async () => '---\nlabel: b\n---\nDeutsches B.' }

  afterEach(() => setGlossaryLocale('en'))

  test('swaps in translations and falls back to English', async () => {
    const registry = createGlossary(english, german)
    const merged = { ...registry }
    await setGlossaryLocale('de')
    expect(registry.B).toEqual({ label: 'b', content: ['Deutsches B.'] })
    expect(registry.A).toMatchObject({ content: ['English A.'] })
    // Entries update in place, so spread copies follow the switch.
    expect(merged.B!.content).toEqual(['Deutsches B.'])

    await setGlossaryLocale('en')
    expect(registry.B!.body).toBeDefined()
  })

  test('localizes registries created after the switch', async () => {
    await setGlossaryLocale('de')
    const registry = createGlossary(english, german)
    await vi.waitFor(() => expect(registry.B!.content).toEqual(['Deutsches B.']))
  })

  test('reads the locale from the folder name', () => {
    expect(localeFromPath('/src/a/glossary/de/ADM.md')).toBe('de')
  })
})
