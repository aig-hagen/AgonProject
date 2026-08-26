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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * The three explicit surfaces the mobile home shell shows within `/`. The value
 * is carried in the `surface` query parameter so Back, forward, refresh and
 * shared URLs behave predictably; the editor stays mounted underneath.
 */
export type HomeSurface = 'documents' | 'new' | 'editor'

const SURFACES: HomeSurface[] = ['documents', 'new', 'editor']

/**
 * Query-backed navigation between the mobile home surfaces. `defaultSurface`
 * decides where an URL without a `surface` query lands (editor when a document
 * is open, otherwise the documents list).
 */
export function useHomeSurface(defaultSurface: () => HomeSurface) {
  const route = useRoute()
  const router = useRouter()

  const surface = computed<HomeSurface>({
    get() {
      const raw = route.query.surface
      const value = Array.isArray(raw) ? raw[0] : raw
      return SURFACES.includes(value as HomeSurface) ? (value as HomeSurface) : defaultSurface()
    },
    set(next) {
      router.push({ query: { ...route.query, surface: next } })
    },
  })

  function goTo(next: HomeSurface) {
    surface.value = next
  }

  return { surface, goTo }
}
