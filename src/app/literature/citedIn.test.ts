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

import { complexityTables } from '@/app/glossary/complexity'
import { principleTables } from '@/app/glossary/principles'
import { glossaryModules } from '@/app/glossary/useGlossary'
import { citedIn } from '@/app/literature/citedIn'
import { abstractArgumentationModule } from '@/modules/abstract-argumentation/moduleConfig'
import { assumptionBasedArgumentationModule } from '@/modules/assumption-based-argumentation/moduleConfig'
import { bipoloarArgumentationModule } from '@/modules/bipolar-argumentation/moduleConfig'
import { collectiveAttacksArgumentationModule } from '@/modules/collective-attacks-argumentation/moduleConfig'
import * as publications from '@/modules/common/publications/publications'
import { dialecticalArgumentationModule } from '@/modules/dialectical-argumentation/moduleConfig'
import { incompleteArgumentationModule } from '@/modules/incomplete-argumentation/moduleConfig'
import { probabilisticArgumentationModule } from '@/modules/probabilistic-argumentation/moduleConfig'

const modules = [
  abstractArgumentationModule,
  bipoloarArgumentationModule,
  dialecticalArgumentationModule,
  incompleteArgumentationModule,
  probabilisticArgumentationModule,
  collectiveAttacksArgumentationModule,
  assumptionBasedArgumentationModule,
]
const index = citedIn(glossaryModules, complexityTables, principleTables, modules)
const termKeys = (pubKey: string) => index[pubKey]?.terms.map((term) => term.key) ?? []

test('every publication is cited somewhere', () => {
  const uncited = Object.keys(publications).filter(
    (key) => !index[key]?.terms.length && !index[key]?.modules.length,
  )
  expect(uncited).toEqual([])
})

test('collects references, citations, complexity sources and module cards', () => {
  expect(termKeys('D95')).toContain('ADM')
  expect(termKeys('BDKM16')).toContain('rankingSemantics')
  expect(termKeys('BESWW13')).toContain('adfMOD2')
  expect(index.D95?.modules).toEqual(['abstract'])
})

test('lists each citing term once', () => {
  for (const { terms } of Object.values(index)) expect(new Set(terms).size).toBe(terms.length)
})
