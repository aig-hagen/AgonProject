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
import { defineAsyncComponent } from 'vue'

// The export window drags in the codemirror editor runtime (~440 kB); load it lazily so it
// stays off the initial bundle. Consumers gate it behind a `v-if` latch (see the `#export`
// slot) so the chunk is only fetched the first time a user opens export.
export const WindowExport = defineAsyncComponent(
  () => import('@/modules/common/export/WindowExport.vue'),
)
