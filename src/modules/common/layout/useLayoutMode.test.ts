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
import { effectScope, nextTick } from 'vue'

import {
  COMPACT_MAX_WIDTH,
  useInputCapability,
  useLayoutMode,
} from '@/modules/common/layout/useLayoutMode'

// Controllable matchMedia mock: each query starts !matches; setMatch flips it and
// notifies listeners, mirroring a viewport/capability change.
const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>()
const state = new Map<string, boolean>()

function makeMql(query: string): MediaQueryList {
  const set = listeners.get(query) ?? new Set()
  listeners.set(query, set)
  return {
    get matches() {
      return state.get(query) ?? false
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => set.add(cb),
    removeEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => set.delete(cb),
    addListener: (cb: (event: MediaQueryListEvent) => void) => set.add(cb),
    removeListener: (cb: (event: MediaQueryListEvent) => void) => set.delete(cb),
    dispatchEvent: () => true,
  } as MediaQueryList
}

function setMatch(query: string, matches: boolean) {
  state.set(query, matches)
  for (const cb of listeners.get(query) ?? []) {
    cb({ matches } as MediaQueryListEvent)
  }
}

beforeEach(() => {
  listeners.clear()
  state.clear()
  vi.stubGlobal('matchMedia', makeMql)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('layout mode is compact only below the compact breakpoint', async () => {
  const query = `(max-width: ${COMPACT_MAX_WIDTH - 1}px)`
  const scope = effectScope()
  scope.run(() => {
    const { layoutMode, isCompact } = useLayoutMode()
    expect(isCompact.value).toBe(false)
    expect(layoutMode.value).toBe('regular')

    setMatch(query, true)
    return nextTick().then(() => {
      expect(isCompact.value).toBe(true)
      expect(layoutMode.value).toBe('compact')
    })
  })
  await nextTick()
  scope.stop()
})

test('input capability tracks pointer and hover independently', async () => {
  const scope = effectScope()
  scope.run(() => {
    const { isCoarsePointer, canHover } = useInputCapability()
    expect(isCoarsePointer.value).toBe(false)
    expect(canHover.value).toBe(false)

    setMatch('(pointer: coarse)', true)
    setMatch('(hover: hover)', true)
    return nextTick().then(() => {
      expect(isCoarsePointer.value).toBe(true)
      expect(canHover.value).toBe(true)
    })
  })
  await nextTick()
  scope.stop()
})
