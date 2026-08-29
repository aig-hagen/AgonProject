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
import { usePreferredDark, useStorage } from '@vueuse/core'
import { createSharedComposable } from '@vueuse/shared'
import { computed, watchEffect } from 'vue'

import { notifyStorageFailureOnce } from '@/modules/common/notifications/storageFailure'

export type ThemePreference = 'system' | 'light' | 'dark'

export const useTheme = createSharedComposable(() => {
  const themePreference = useStorage<ThemePreference>('vueuse-color-scheme', 'system', undefined, {
    onError: notifyStorageFailureOnce,
  })
  const prefersDark = usePreferredDark()

  const isDark = computed(
    () =>
      themePreference.value === 'dark' ||
      (themePreference.value === 'system' && prefersDark.value),
  )

  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  })

  return { themePreference, isDark }
})
