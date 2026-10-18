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

function joinNames(names: string[]): string {
  return names.length === 1
    ? names[0]!
    : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

function surname(author: string): string {
  return author.split(', ')[0]!
}

function baseLabel(pub: Publication): string {
  const { authors } = pub
  if (authors.length === 1) return surname(authors[0]!)
  if (authors.length === 2) return `${surname(authors[0]!)} & ${surname(authors[1]!)}`
  return `${surname(authors[0]!)} et al.`
}

// Year suffixes (a, b, …) for publications that would otherwise share a label, ordered by key.
const yearSuffixes = (() => {
  const groups = new Map<string, [string, Publication][]>()
  for (const entry of Object.entries(publications) as [string, Publication][]) {
    const id = `${baseLabel(entry[1])} ${entry[1].year}`
    groups.set(id, [...(groups.get(id) ?? []), entry])
  }
  const suffixes = new Map<Publication, string>()
  for (const group of groups.values()) {
    if (group.length < 2) continue
    group
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([, pub], i) => suffixes.set(pub, String.fromCharCode(97 + i)))
  }
  return suffixes
})()

/** e.g. "Dung (1995)", "Dvořák & Gaggl (2016)", "Baroni et al. (2018)". */
export function shortLabel(pub: Publication): string {
  return `${baseLabel(pub)} (${pub.year}${yearSuffixes.get(pub) ?? ''})`
}

export function publicationHref(pub: Publication): string | undefined {
  return pub.doi ? `https://doi.org/${pub.doi}` : pub.url
}

/** Where it appeared, without the leading "In: ". */
export function formatVenue(pub: Publication): string {
  const parts: string[] = []
  switch (pub.kind) {
    case 'article': {
      let journal = pub.journal
      if (pub.volume) journal += `, ${pub.volume}${pub.number ? `(${pub.number})` : ''}`
      parts.push(journal)
      if (pub.articleNo) parts.push(pub.articleNo)
      break
    }
    case 'inproceedings': {
      const acronym = pub.acronym && !pub.booktitle.includes(pub.acronym) ? ` (${pub.acronym})` : ''
      parts.push(pub.booktitle + acronym)
      if (pub.volume) parts.push(`Vol. ${pub.volume}`)
      if (pub.series) parts.push(`${pub.series} ${pub.seriesVolume ?? ''}`.trim())
      break
    }
    case 'chapter': {
      const editors = pub.editors?.length ? `${joinNames(pub.editors)} (eds.), ` : ''
      parts.push(editors + pub.booktitle)
      if (pub.volume) parts.push(`Vol. ${pub.volume}`)
      if (pub.chapter) parts.push(`Chapter ${pub.chapter}`)
      break
    }
    case 'thesis':
      return `${pub.degree} Thesis, ${pub.school}`
  }
  if (pub.pages) parts.push(`pp. ${pub.pages}`)
  const venue = parts.join(', ')
  return 'publisher' in pub && pub.publisher ? `${venue}. ${pub.publisher}` : venue
}

/** The full one-line citation, e.g. for plain-text contexts. */
export function formatCitation(pub: Publication): string {
  const prefix = pub.kind === 'inproceedings' || pub.kind === 'chapter' ? 'In: ' : ''
  return `${joinNames(pub.authors)} (${pub.year}). ${pub.title}. ${prefix}${formatVenue(pub)}.`
}
