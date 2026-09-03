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
import { useMediaQuery } from '@vueuse/core'
import { createSharedComposable } from '@vueuse/shared'
import { computed } from 'vue'

/**
 * Viewport width (in CSS pixels) below which the compact (mobile) shell is used.
 * Input capability never changes the shell by itself — see the mobile layout plan.
 */
export const COMPACT_MAX_WIDTH = 768

export type LayoutMode = 'compact' | 'regular'

/**
 * Which presentation shell to render, decided by viewport width alone.
 * Kept separate from input capability so narrow mouse windows and wide touch
 * devices are both handled correctly.
 */
export const useLayoutMode = createSharedComposable(() => {
  const isCompact = useMediaQuery(`(max-width: ${COMPACT_MAX_WIDTH - 1}px)`)
  const layoutMode = computed<LayoutMode>(() => (isCompact.value ? 'compact' : 'regular'))
  return { layoutMode, isCompact }
})

/**
 * Input capability of the primary pointer, independent of viewport width.
 * Drives gesture help and interaction affordances, not shell selection.
 */
export const useInputCapability = createSharedComposable(() => {
  const isCoarsePointer = useMediaQuery('(pointer: coarse)')
  const canHover = useMediaQuery('(hover: hover)')
  return { isCoarsePointer, canHover }
})
