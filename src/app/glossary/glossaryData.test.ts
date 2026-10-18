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

import { entryRefs, glossaryModules, glossaryPath, plainText } from '@/app/glossary/useGlossary'
import { glossaryMeta as afMeta } from '@/modules/abstract-argumentation/glossary/meta'
import { glossaryMeta as abaMeta } from '@/modules/assumption-based-argumentation/glossary/meta'
import { glossaryMeta as bafMeta } from '@/modules/bipolar-argumentation/glossary/meta'
import { glossaryMeta as cafMeta } from '@/modules/collective-attacks-argumentation/glossary/meta'
import { publicationByKey } from '@/modules/common/publications/lookup'
import { glossaryMeta as adfMeta } from '@/modules/dialectical-argumentation/glossary/meta'
import { glossaryMeta as iafMeta } from '@/modules/incomplete-argumentation/glossary/meta'
import { glossaryMeta as pafMeta } from '@/modules/probabilistic-argumentation/glossary/meta'

const metas = {
  AF: afMeta,
  ABA: abaMeta,
  BAF: bafMeta,
  SetAF: cafMeta,
  ADF: adfMeta,
  iAF: iafMeta,
  PAF: pafMeta,
}
const afGlossary = glossaryModules.find((m) => m.prefix === 'AF')!.glossary

describe.each(glossaryModules)('$prefix glossary', ({ prefix, glossary, mainKey }) => {
  test('has a registry and its main entry', () => {
    expect(glossary).toBeDefined()
    expect(glossary[mainKey]).toBeDefined()
  })

  // Modules provide their own registry merged over the AF one, so refs may point into either.
  test('every [[ref]] resolves', () => {
    const missing = Object.entries(glossary).flatMap(([key, def]) =>
      entryRefs(def)
        .filter((ref) => !(ref in glossary) && !(ref in afGlossary))
        .map((ref) => `${key} → ${ref}`),
    )
    expect(missing).toEqual([])
  })

  test('every [@KEY] citation names a publication', () => {
    const missing = Object.entries(glossary).flatMap(([key, def]) =>
      [...JSON.stringify(def.body ?? []).matchAll(/"cite":"([^"]+)"/g)]
        .filter((m) => !publicationByKey(m[1]!))
        .map((m) => `${key} → ${m[1]}`),
    )
    expect(missing).toEqual([])
  })

  test('meta.ts only names existing terms', () => {
    const meta = metas[prefix as keyof typeof metas]
    expect(Object.keys(meta).filter((key) => !(key in glossary))).toEqual([])
  })
})

test('term keys are unique across modules', () => {
  const seen = new Map<string, string>()
  const clashes: string[] = []
  for (const { prefix, glossary } of glossaryModules)
    for (const key of Object.keys(glossary)) {
      if (seen.has(key)) clashes.push(`${key} (${seen.get(key)}, ${prefix})`)
      seen.set(key, prefix)
    }
  expect(clashes).toEqual([])
})

test('glossaryPath builds canonical URLs', () => {
  expect(glossaryPath()).toBe('/glossary')
  expect(glossaryPath('AF')).toBe('/glossary/AF')
  expect(glossaryPath('AF', 'ADM')).toBe('/glossary/AF/ADM')
})

test('plainText strips LaTeX for page titles', () => {
  expect(plainText('Admissible Set')).toBe('Admissible Set')
  expect(plainText('Selection Function $\\alpha_{\\mathsf{ad}}$')).toBe('Selection Function ad')
})
