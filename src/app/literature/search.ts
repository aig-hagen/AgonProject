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
import { formatVenue } from '@/modules/common/publications/format'
import type { Publication } from '@/modules/common/publications/types'

export interface LiteratureEntry {
  key: string
  publication: Publication
  abstract?: string
}

/** Lowercase without accents, so "dvorak" finds "Dvořák". */
export const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const surname = (pub: Publication) => fold(pub.authors[0]?.split(', ')[0] ?? '')

/** Bibliography order: first author's surname, then year, then title. */
export function compareEntries(a: LiteratureEntry, b: LiteratureEntry): number {
  return (
    surname(a.publication).localeCompare(surname(b.publication)) ||
    a.publication.year - b.publication.year ||
    a.publication.title.localeCompare(b.publication.title)
  )
}

function fields({ key, publication, abstract }: LiteratureEntry): [string, number][] {
  return [
    [fold(publication.title), 4],
    [fold(publication.authors.join(' ')), 4],
    [fold(`${key} ${publication.year}`), 3],
    [fold(formatVenue(publication)), 2],
    [fold(abstract ?? ''), 1],
  ]
}

/** Every query word must match some field; the score sums each word's best field weight. */
export function searchScore(entry: LiteratureEntry, query: string): number {
  const words = fold(query).split(/\s+/).filter(Boolean)
  const weighted = fields(entry)
  let score = 0
  for (const word of words) {
    const best = Math.max(0, ...weighted.map(([text, w]) => (text.includes(word) ? w : 0)))
    if (!best) return 0
    score += best
  }
  return score
}

/** Matching entries, best first; ties keep the input order. */
export function searchEntries(entries: LiteratureEntry[], query: string): LiteratureEntry[] {
  if (!query.trim()) return entries
  return entries
    .map((entry) => ({ entry, score: searchScore(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry)
}
