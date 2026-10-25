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
import { computed, ref } from 'vue'

import { complexityTables } from '@/app/glossary/complexity'
import { principleTables } from '@/app/glossary/principles'
import { glossaryModules } from '@/app/glossary/useGlossary'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import { citedIn } from '@/app/literature/citedIn'
import { compareEntries, type LiteratureEntry, searchEntries } from '@/app/literature/search'
import abstracts from '@/modules/common/publications/abstracts.json'
import * as publications from '@/modules/common/publications/publications'
import { FORMALISM_TAGS, type PublicationTag, TOPIC_TAGS } from '@/modules/common/publications/tags'
import type { Publication } from '@/modules/common/publications/types'

const entries: LiteratureEntry[] = Object.entries(publications as Record<string, Publication>)
  .map(([key, publication]) => ({
    key,
    publication,
    abstract: (abstracts as Record<string, string>)[key],
  }))
  .sort(compareEntries)

/** Search and tag filters over all publications: OR within a facet, AND across facets. */
export function useLiterature(
  modules: readonly Pick<ModuleConfig<object>, 'id' | 'publications'>[],
) {
  const index = citedIn(glossaryModules, complexityTables, principleTables, modules)
  const searchQuery = ref('')
  const selectedTags = ref<PublicationTag[]>([])

  function toggleTag(tag: PublicationTag) {
    selectedTags.value = selectedTags.value.includes(tag)
      ? selectedTags.value.filter((t) => t !== tag)
      : [...selectedTags.value, tag]
  }

  const facets = [FORMALISM_TAGS, TOPIC_TAGS] as readonly (readonly PublicationTag[])[]

  // Passes the selections of every facet except `skip`.
  const matchesFacets = (publication: Publication, skip?: readonly PublicationTag[]) =>
    facets.every((facet) => {
      if (facet === skip) return true
      const selected = selectedTags.value.filter((tag) => facet.includes(tag))
      return !selected.length || selected.some((tag) => publication.tags?.includes(tag))
    })

  const searched = computed(() => searchEntries(entries, searchQuery.value))

  const filteredEntries = computed(() =>
    searched.value.filter(({ publication }) => matchesFacets(publication)),
  )

  /** Per tag, how many results it matches given the search and the other facets' selections. */
  const tagCounts = computed(() => {
    const counts = {} as Record<PublicationTag, number>
    for (const facet of facets) {
      const pool = searched.value.filter(({ publication }) => matchesFacets(publication, facet))
      for (const tag of facet) {
        counts[tag] = pool.filter(({ publication }) => publication.tags?.includes(tag)).length
      }
    }
    return counts
  })

  function reset() {
    searchQuery.value = ''
    selectedTags.value = []
  }

  return {
    total: entries.length,
    index,
    searchQuery,
    selectedTags,
    toggleTag,
    reset,
    filteredEntries,
    tagCounts,
  }
}
