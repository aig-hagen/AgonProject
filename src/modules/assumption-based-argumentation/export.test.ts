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

import { availableExports } from '@/modules/assumption-based-argumentation/export'
import { ABAF } from '@/modules/assumption-based-argumentation/model'
import { ExportFormatId } from '@/modules/common/export'

const iccma = availableExports.find((c) => c.id === ExportFormatId.Iccma)!

describe('ICCMA export', () => {
  test('matches the ICCMA 2025 rules example', () => {
    // Rules p ← q,a; q ←; r ← b,c; contraries ‾a = r, ‾b = s, ‾c = t.
    const aba = new ABAF()
    const names = ['a', 'b', 'c', 'p', 'q', 'r', 's', 't']
    names.forEach((name, id) =>
      aba.addNode(id, { name, kind: id < 3 ? 'assumption' : 'atom', x: 0, y: 0, fact: false }),
    )
    const [a, b, c, p, q, r, s, t] = names.map((_, id) => id)
    aba.addRule(p!, [q!, a!])
    aba.setFact(q!, true)
    aba.addRule(r!, [b!, c!])
    aba.setContrary(a!, r!)
    aba.setContrary(b!, s!)
    aba.setContrary(c!, t!)

    expect(iccma.export(aba).text.split('\r\n')).toEqual([
      'p aba 8',
      'a 1',
      'a 2',
      'a 3',
      'c 1 6',
      'c 2 7',
      'c 3 8',
      'r 4 5 1',
      'r 6 2 3',
      'r 5',
    ])
  })

  test('remaps sparse node ids to 1..n', () => {
    const aba = new ABAF()
    aba.addNode(4, { name: 'a', kind: 'assumption', x: 0, y: 0, fact: false })
    aba.addNode(9, { name: 'p', kind: 'atom', x: 0, y: 0, fact: false })
    aba.addRule(9, [4])
    aba.setContrary(4, 9)
    expect(iccma.export(aba).text).toBe('p aba 2\r\na 1\r\nc 1 2\r\nr 2 1')
  })
})
