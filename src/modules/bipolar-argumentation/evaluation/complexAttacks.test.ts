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

import { effectiveAttacks } from '@/modules/bipolar-argumentation/evaluation/complexAttacks'
import { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'

// a attacks b; c supports d supports b.
function chain() {
  const baf = new BipoloarArgumentation<null>()
  for (const id of [1, 2, 3, 4]) baf.addArgument(id, null)
  baf.addAttack(1, 2)
  baf.addSupport(3, 4)
  baf.addSupport(4, 2)
  return baf
}

const pairs = (baf: BipoloarArgumentation<null>, type: string) =>
  effectiveAttacks(baf, type)
    .map(({ tail, head }) => `${tail.join(',')}>${head}`)
    .sort()

describe('effectiveAttacks', () => {
  test('coalition keeps only direct attacks', () => {
    expect(pairs(chain(), 'coalition')).toEqual(['1>2'])
  })

  test('deductive: attacking a supported argument attacks its transitive supporters', () => {
    expect(pairs(chain(), 'ded')).toEqual(['1>2', '1>3', '1>4'])
  })

  test('necessity: attacking a supporter attacks what it transitively supports', () => {
    const baf = chain()
    baf.addAttack(1, 3)
    expect(pairs(baf, 'nec')).toEqual(['1>2', '1>3', '1>4'])
    expect(pairs(chain(), 'nec')).toEqual(['1>2'])
  })

  test('support cycles terminate', () => {
    const baf = chain()
    baf.addSupport(2, 3)
    expect(pairs(baf, 'ded')).toEqual(['1>2', '1>3', '1>4'])
  })
})
