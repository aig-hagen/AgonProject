/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
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
import { useStorage } from '@vueuse/core'
import { createSharedComposable } from '@vueuse/shared'
import { computed, watchEffect } from 'vue'

export const useTheme = createSharedComposable(() => {
  const theme = useStorage('vueuse-color-scheme', 'light')

  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.value)
  })

  const isDark = computed({
    get: () => theme.value === 'dark',
    set: (value: boolean) => {
      theme.value = value ? 'dark' : 'light'
    },
  })

  return { isDark }
})
