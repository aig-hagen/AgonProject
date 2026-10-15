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

import { buildPaletteCss, GRAPH_PALETTE } from '@/modules/common/theme/palette'

function themeBlocks(css: string): string[] {
  return [...css.matchAll(/\[data-theme='(?:light|dark)'\] \{([^}]*)\}/g)].map((m) => m[1]!)
}

test('emits every graph token in both modes', () => {
  const blocks = themeBlocks(buildPaletteCss())
  expect(blocks).toHaveLength(2)
  for (const block of blocks) {
    for (const token of Object.keys(GRAPH_PALETTE.light)) {
      expect(block).toContain(`--${token}:`)
    }
  }
})

test('every var() reference points at a token defined in the same mode', () => {
  for (const block of themeBlocks(buildPaletteCss())) {
    const defined = new Set([...block.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]))
    const referenced = [...block.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1])
    expect(referenced.length).toBeGreaterThan(0)
    for (const name of referenced) expect(defined).toContain(name)
  }
})
