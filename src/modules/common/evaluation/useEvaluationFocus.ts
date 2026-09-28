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
import { computed, ref, shallowReactive } from 'vue'

import type { Highlight } from '@/modules/common/graph-editor/graphEditor'

// Only the active evaluation window paints the canvas. Every window reports its highlight here
// whether active or not, so switching windows shows the new one's result right away.
export function useEvaluationFocus() {
  const activeId = ref<string | undefined>(undefined)
  const highlights = shallowReactive(new Map<string, Highlight | undefined>())

  const highlight = computed(() =>
    activeId.value === undefined ? undefined : highlights.get(activeId.value),
  )

  return {
    activeId,
    highlight,
    isSuppressed: (id: string) => activeId.value !== id,
    focus: (id: string) => {
      activeId.value = id
    },
    report: (id: string, h: Highlight | undefined) => {
      highlights.set(id, h)
    },
    remove: (id: string) => {
      highlights.delete(id)
      if (activeId.value === id) activeId.value = undefined
    },
  }
}
