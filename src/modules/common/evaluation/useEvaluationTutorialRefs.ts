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
import { inject, onUnmounted, type Ref, watch, watchEffect } from 'vue'

import { TUTORIAL_REF_REGISTRY_KEY } from '@/modules/common/graph-editor/graphEditor'

type ComponentRef = Readonly<Ref<{ $el: HTMLElement } | null>>

// Registers an evaluation window's selectors and result area as tutorial-spotlight targets
// while it is the active window, so the evaluation tutorial can highlight them.
export function useEvaluationTutorialRefs(options: {
  selectors: Record<string, ComponentRef>
  resultsArea: Readonly<Ref<HTMLElement | null>>
  /** Changes whenever the rendered results change, so the target is re-resolved. */
  resultsVersion: () => unknown
  suppressed: () => boolean
  /** Spotlight the result grid inside the area (not the footer) instead of the whole area. */
  grid?: boolean
}) {
  const register = inject(TUTORIAL_REF_REGISTRY_KEY, null)
  if (register === null) return

  watchEffect(() => {
    if (options.suppressed()) return
    for (const [key, ref] of Object.entries(options.selectors))
      register(key, ref.value?.$el ?? null)
  })

  watch(
    [options.resultsArea, options.resultsVersion, options.suppressed],
    () => {
      const area = options.suppressed() ? null : options.resultsArea.value
      const target = options.grid
        ? (area?.querySelector<HTMLElement>('.evaluation-result-grid') ?? null)
        : area
      register('resultArea', target)
    },
    { flush: 'post', immediate: true },
  )

  onUnmounted(() => {
    for (const key of Object.keys(options.selectors)) register(key, null)
    register('resultArea', null)
  })
}
