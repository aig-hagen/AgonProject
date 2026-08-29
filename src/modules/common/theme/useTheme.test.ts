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
import { afterEach, expect, test, vi } from 'vitest'
import { nextTick } from 'vue'

import { useTheme } from '@/modules/common/theme/useTheme'

test('defaults to the system theme and supports explicit light and dark modes', async () => {
  let prefersDark = false
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(
      (query: string) =>
        ({
          get matches() {
            return prefersDark
          },
          media: query,
          onchange: null,
          addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
            listeners.add(listener),
          removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
            listeners.delete(listener),
          addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
          removeListener: (listener: (event: MediaQueryListEvent) => void) =>
            listeners.delete(listener),
          dispatchEvent: () => true,
        }) as MediaQueryList,
    ),
  )
  localStorage.clear()

  const { themePreference, isDark } = useTheme()

  expect(themePreference.value).toBe('system')
  expect(isDark.value).toBe(false)
  expect(document.documentElement.dataset.theme).toBe('light')

  prefersDark = true
  for (const listener of listeners) listener({ matches: true } as MediaQueryListEvent)
  await nextTick()
  expect(isDark.value).toBe(true)
  expect(document.documentElement.dataset.theme).toBe('dark')

  themePreference.value = 'light'
  await nextTick()
  expect(isDark.value).toBe(false)
  expect(document.documentElement.dataset.theme).toBe('light')

  themePreference.value = 'dark'
  await nextTick()
  expect(isDark.value).toBe(true)
  expect(document.documentElement.dataset.theme).toBe('dark')
})

afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})
