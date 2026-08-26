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
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { effectScope } from 'vue'

import { useVisualViewport } from '@/modules/common/layout/useVisualViewport'

interface FakeViewport {
  height: number
  offsetTop: number
  listeners: Map<string, Set<() => void>>
}

function makeViewport(height: number, offsetTop = 0): FakeViewport & VisualViewport {
  const listeners = new Map<string, Set<() => void>>()
  const vp = {
    height,
    offsetTop,
    listeners,
    addEventListener: (type: string, cb: () => void) => {
      const set = listeners.get(type) ?? new Set()
      set.add(cb)
      listeners.set(type, set)
    },
    removeEventListener: (type: string, cb: () => void) => listeners.get(type)?.delete(cb),
  }
  return vp as unknown as FakeViewport & VisualViewport
}

function fire(vp: FakeViewport, type: string) {
  for (const cb of vp.listeners.get(type) ?? []) cb()
}

beforeEach(() => {
  vi.stubGlobal('innerHeight', 800)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('keyboard inset is zero when the visual viewport fills the layout', () => {
  const vp = makeViewport(800)
  vi.stubGlobal('visualViewport', vp)
  const scope = effectScope()
  scope.run(() => {
    const { keyboardInset } = useVisualViewport()
    expect(keyboardInset.value).toBe(0)
  })
  scope.stop()
})

test('keyboard inset reflects the overlap and updates on resize', () => {
  const vp = makeViewport(800)
  vi.stubGlobal('visualViewport', vp)
  const scope = effectScope()
  scope.run(() => {
    const { keyboardInset } = useVisualViewport()
    expect(keyboardInset.value).toBe(0)

    // Keyboard shrinks the visual viewport to 500px tall.
    vp.height = 500
    fire(vp as unknown as FakeViewport, 'resize')
    expect(keyboardInset.value).toBe(300)
  })
  scope.stop()
})
