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
  const index = citedIn(glossaryModules, complexityTables, modules)
  const searchQuery = ref('')
  const selectedTags = ref<PublicationTag[]>([])

  function toggleTag(tag: PublicationTag) {
    selectedTags.value = selectedTags.value.includes(tag)
      ? selectedTags.value.filter((t) => t !== tag)
      : [...selectedTags.value, tag]
  }

  const filteredEntries = computed(() => {
    const facets = [FORMALISM_TAGS, TOPIC_TAGS]
      .map((facet) =>
        selectedTags.value.filter((tag) => (facet as readonly string[]).includes(tag)),
      )
      .filter((selected) => selected.length)
    const tagged = entries.filter(({ publication }) =>
      facets.every((selected) => selected.some((tag) => publication.tags?.includes(tag))),
    )
    return searchEntries(tagged, searchQuery.value)
  })

  return {
    total: entries.length,
    index,
    searchQuery,
    selectedTags,
    toggleTag,
    filteredEntries,
  }
}
