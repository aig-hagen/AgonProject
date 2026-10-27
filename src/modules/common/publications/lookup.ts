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
import * as publications from '@/modules/common/publications/publications'
import type { Publication } from '@/modules/common/publications/types'

/** The publication exported under `key` in `publications.ts`, as cited by `[@KEY]`. */
export function publicationByKey(key: string): Publication | undefined {
  return (publications as Record<string, Publication>)[key]
}

const keys = new Map(Object.entries(publications).map(([key, pub]) => [pub as Publication, key]))

/** The `publications.ts` key of an entry, e.g. for a `reference` or complexity source. */
export function publicationKey(pub: Publication): string | undefined {
  return keys.get(pub)
}
