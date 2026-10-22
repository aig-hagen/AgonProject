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
  COLOR_VISIONS,
  contrastRatio,
  deltaE,
  fromOklab,
  parseRgb,
  type Rgb,
  toOklab,
} from '@/modules/common/theme/colorMath'
import {
  buildPaletteCss,
  COLOR_BLIND_HIGHLIGHTS,
  DARK_GRAPH_PALETTE,
  DARK_PALETTE,
  GRAPH_LABEL_INKS,
  GRAPH_PALETTE,
  type GraphPresetId,
  LIGHT_GRAPH_PALETTE,
  LIGHT_PALETTE,
} from '@/modules/common/theme/palette'

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

// --- Contrast and color-blind guard -------------------------------------------------------------

type Mode = 'light' | 'dark'
const PRESETS: GraphPresetId[] = ['default', 'high-contrast', 'minimal', 'library', 'outline']
const PRESET_HAS_BORDER: Record<GraphPresetId, boolean> = {
  default: true,
  'high-contrast': true,
  minimal: true,
  library: false,
  outline: true,
}

const prefixed = (tokens: Record<string, string>) =>
  Object.fromEntries(Object.entries(tokens).map(([k, v]) => [`--${k}`, v]))

function tokensFor(mode: Mode): Record<string, string> {
  const app = mode === 'light' ? LIGHT_PALETTE : DARK_PALETTE
  const graph = mode === 'light' ? LIGHT_GRAPH_PALETTE : DARK_GRAPH_PALETTE
  return {
    ...Object.fromEntries(Object.entries(app).map(([k, v]) => [`--color-${k}`, v])),
    ...Object.fromEntries(Object.entries(graph).map(([k, v]) => [`--${k}`, v])),
  }
}

// Split on top-level commas only.
function args(inner: string): string[] {
  const out: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === '(') depth++
    else if (inner[i] === ')') depth--
    else if (inner[i] === ',' && depth === 0) {
      out.push(inner.slice(start, i).trim())
      start = i + 1
    }
  }
  return [...out, inner.slice(start).trim()]
}

// Enough of CSS color resolution for the palette's own values.
function resolve(value: string, tokens: Record<string, string>): Rgb {
  const v = value.trim()
  if (v === 'white') return [1, 1, 1]
  if (v === 'black') return [0, 0, 0]
  const ref = /^var\((--[\w-]+)\)$/.exec(v)?.[1]
  if (ref) return resolve(tokens[ref]!, tokens)
  const mix = /^color-mix\((.*)\)$/.exec(v)?.[1]
  if (mix) {
    const [space, a, b] = args(mix) as [string, string, string]
    const part = (p: string) => {
      const m = /^(.*?)(?:\s+([\d.]+)%)?$/.exec(p)!
      return { color: resolve(m[1]!, tokens), weight: m[2] ? Number(m[2]) / 100 : undefined }
    }
    const [x, y] = [part(a), part(b)]
    const wx = x.weight ?? (y.weight !== undefined ? 1 - y.weight : 0.5)
    if (space === 'in oklab') {
      const [lx, ly] = [toOklab(x.color), toOklab(y.color)]
      return fromOklab(lx.map((c, i) => c * wx + ly[i]! * (1 - wx)) as [number, number, number])
    }
    return x.color.map((c, i) => c * wx + y.color[i]! * (1 - wx)) as unknown as Rgb
  }
  const rgb = parseRgb(v)
  if (!rgb) throw new Error(`Cannot resolve ${v}`)
  return rgb
}

const worstDeltaE = (a: Rgb, b: Rgb) =>
  Math.min(deltaE(a, b), ...COLOR_VISIONS.map((vision) => deltaE(a, b, vision)))

// Agreed targets (see docs/ideas/graph-color-scheme-plan.md). WCAG: 3:1 for shapes, 4.5:1 for
// labels. ΔE is the worst OKLab difference ×100 across normal vision and the three color-blind
// types; 15 reads clearly, 10 is the floor for a node next to a highlight.
const MIN_SHAPE = 3
const MIN_LABEL = 4.5
const MIN_HIGHLIGHT_PAIR = 15
const MIN_VS_HIGHLIGHT = 10

// Accepted trade-offs, each with its own floor just under today's value so they can't quietly get
// worse.
const EXCEPTIONS: Record<string, { floor: number; reason: string }> = {
  'light library edge': { floor: 2.5, reason: 'borderless brand yellow on white' },
  'light outline edge': { floor: 2.5, reason: 'amber rim on white' },
  'light library rejected': { floor: 1.5, reason: 'brand yellow vs. rejected salmon' },
  'dark library accepted': { floor: 8, reason: 'lifted brand yellow vs. neon green' },
  'dark library rejected': { floor: 6.5, reason: 'lifted brand yellow vs. rejected salmon' },
  'light outline accepted': { floor: 6.5, reason: 'pale amber fill vs. neon green' },
}
const floor = (key: string, target: number) => EXCEPTIONS[key]?.floor ?? target

describe.each<Mode>(['light', 'dark'])('%s mode graph colors', (mode) => {
  const tokens = tokensFor(mode)
  const color = (name: string) => resolve(`var(--${name})`, tokens)
  const canvas = resolve('var(--color-base-100)', tokens)
  const accepted = color('graph-accepted')
  const rejected = color('graph-rejected')
  const inks = [GRAPH_LABEL_INKS.dark, GRAPH_LABEL_INKS.light].map((ink) => parseRgb(ink)!)

  test('accepted and rejected stay apart for every color vision', () => {
    expect(worstDeltaE(accepted, rejected)).toBeGreaterThanOrEqual(MIN_HIGHLIGHT_PAIR)
  })

  test.each(['graph-accepted', 'graph-derived', 'graph-rejected'])(
    '%s has a readable label ink',
    (name) => {
      const fill = color(name)
      expect(Math.max(...inks.map((ink) => contrastRatio(fill, ink)))).toBeGreaterThanOrEqual(
        MIN_LABEL,
      )
    },
  )

  describe.each(PRESETS)('%s preset', (preset) => {
    const node = color(`graph-${preset}-node`)

    test('links and nodes stand out from the canvas, labels from the node', () => {
      expect(contrastRatio(color(`graph-${preset}-link`), canvas)).toBeGreaterThanOrEqual(MIN_SHAPE)
      const stroke = PRESET_HAS_BORDER[preset]
        ? contrastRatio(color(`graph-${preset}-stroke`), canvas)
        : 0
      const edge = Math.max(contrastRatio(node, canvas), stroke)
      expect(edge).toBeGreaterThanOrEqual(floor(`${mode} ${preset} edge`, MIN_SHAPE))
      expect(contrastRatio(color(`graph-${preset}-label`), node)).toBeGreaterThanOrEqual(MIN_LABEL)
    })

    test.each([
      ['accepted', accepted],
      ['rejected', rejected],
    ] as const)('undecided nodes differ from %s', (name, highlight) => {
      const min = floor(`${mode} ${preset} ${name}`, MIN_VS_HIGHLIGHT)
      expect(worstDeltaE(node, highlight)).toBeGreaterThanOrEqual(min)
    })
  })
})

describe.each<Mode>(['light', 'dark'])('%s mode color-blind scheme', (mode) => {
  const tokens = { ...tokensFor(mode), ...prefixed(COLOR_BLIND_HIGHLIGHTS[mode]) }
  const color = (name: string) => resolve(`var(--${name})`, tokens)
  const [accepted, rejected] = [color('graph-accepted'), color('graph-rejected')]
  const inks = [GRAPH_LABEL_INKS.dark, GRAPH_LABEL_INKS.light].map((ink) => parseRgb(ink)!)

  test('is emitted for the root attribute', () => {
    expect(buildPaletteCss()).toContain(`[data-theme='${mode}'][data-graph-colors='color-blind']`)
  })

  test('every highlight has a readable label ink', () => {
    for (const name of ['graph-accepted', 'graph-derived', 'graph-rejected']) {
      const fill = color(name)
      expect(Math.max(...inks.map((ink) => contrastRatio(fill, ink)))).toBeGreaterThanOrEqual(
        MIN_LABEL,
      )
    }
  })

  // No trade-offs here: the scheme exists to clear every preset for every color vision.
  test.each(PRESETS)('accepted, rejected and %s nodes stay apart', (preset) => {
    const node = color(`graph-${preset}-node`)
    for (const [a, b] of [
      [accepted, rejected],
      [accepted, node],
      [rejected, node],
    ] as const) {
      expect(worstDeltaE(a, b)).toBeGreaterThanOrEqual(MIN_HIGHLIGHT_PAIR)
    }
  })
})
