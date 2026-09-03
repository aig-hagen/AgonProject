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
import { onScopeDispose, readonly, ref } from 'vue'

/**
 * Tracks how far the virtual keyboard (or any other browser UI shrinking the
 * visual viewport) overlaps the bottom of the layout viewport, in CSS pixels.
 *
 * `keyboardInset` is 0 when nothing overlaps, and grows as the on-screen keyboard
 * covers the layout. Bottom sheets add it to `env(safe-area-inset-bottom)` so their
 * footer and focused inputs stay above the keyboard.
 */
export function useVisualViewport() {
  const keyboardInset = ref(0)

  const viewport = typeof window !== 'undefined' ? window.visualViewport : undefined

  function update() {
    if (!viewport) return
    // Layout-viewport height minus the visible area still on screen below the fold.
    const overlap = window.innerHeight - (viewport.height + viewport.offsetTop)
    keyboardInset.value = Math.max(0, Math.round(overlap))
  }

  if (viewport) {
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    onScopeDispose(() => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    })
  }

  return { keyboardInset: readonly(keyboardInset) }
}
