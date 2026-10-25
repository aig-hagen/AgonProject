<!--
  AgonProject - The platform to explore different approaches to formal argumentation.

  Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<script setup lang="ts">
import { FunnelIcon } from '@heroicons/vue/24/outline'
import type { Objectish } from 'immer'
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { termTitle } from '@/app/glossary/glossaryContext'
import { glossaryPath } from '@/app/glossary/useGlossary'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import LiteratureFacets from '@/app/literature/LiteratureFacets.vue'
import { useLiterature } from '@/app/literature/useLiterature'
import SearchInput from '@/modules/common/forms/SearchInput.vue'
import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import { FORMALISM_TAGS, type PublicationTag } from '@/modules/common/publications/tags'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import PublicationCitation from '@/modules/common/tooltip/PublicationCitation.vue'
import BottomSheet from '@/modules/common/window/BottomSheet.vue'

const { modules } = defineProps<{ modules: readonly ModuleConfig<Objectish>[] }>()

const { t } = useI18n({ useScope: 'global' })
const { isCompact } = useLayoutMode()
const route = useRoute()

const { total, index, searchQuery, selectedTags, toggleTag, reset, filteredEntries, tagCounts } =
  useLiterature(modules)

const tagLabel = (tag: PublicationTag) =>
  (FORMALISM_TAGS as readonly string[]).includes(tag) ? tag : t(`literature.tags.${tag}`)

const filtersOpen = ref(false)

const list = useTemplateRef('list')

// Bring `/glossary/Literature#KEY` into view, e.g. from a glossary citation.
watch(
  () => route.hash,
  async (hash) => {
    if (!hash) return
    await nextTick()
    list.value
      ?.querySelector(`[id="${CSS.escape(decodeURIComponent(hash.slice(1)))}"]`)
      ?.scrollIntoView({ block: 'start' })
  },
  { immediate: true },
)

watch([searchQuery, selectedTags], () => list.value?.scrollTo({ top: 0 }))

const defaultTitle = document.title
onMounted(() => {
  document.title = `${t('literature.title')} · ${t('glossary.title')} · AgonProject`
})
onUnmounted(() => {
  document.title = defaultTitle
})
</script>

<template>
  <div class="flex-1 flex min-h-0 overflow-hidden">
    <!-- Desktop: search and facets in a rail, like the glossary's term list -->
    <aside
      v-if="!isCompact"
      class="w-64 shrink-0 flex flex-col border-r border-base-300 overflow-hidden"
      :aria-label="t('literature.filters')"
    >
      <div class="p-3 border-b border-base-300">
        <SearchInput v-model="searchQuery" :placeholder="t('literature.searchPlaceholder')" />
      </div>
      <LiteratureFacets
        class="overflow-y-auto flex-1 py-2"
        :selected="selectedTags"
        :counts="tagCounts"
        @toggle="toggleTag"
      />
    </aside>

    <div class="flex-1 flex flex-col min-w-0 min-h-0">
      <div class="flex-none border-b border-base-300">
        <div
          class="mx-auto max-w-3xl flex flex-col"
          :class="isCompact ? 'gap-2 px-4 pt-3 pb-2' : 'px-8'"
        >
          <!-- Compact: search beside a button that opens the facets in a sheet -->
          <div v-if="isCompact" class="flex gap-2">
            <SearchInput
              v-model="searchQuery"
              class="flex-1 min-w-0"
              :placeholder="t('literature.searchPlaceholder')"
            />
            <button
              type="button"
              class="btn btn-soft h-11 gap-1.5 px-3"
              :aria-label="t('literature.filters')"
              @click="filtersOpen = true"
            >
              <FunnelIcon class="size-5" />
              <span
                v-if="selectedTags.length"
                class="badge badge-sm badge-primary text-micro font-medium tabular-nums"
              >
                {{ selectedTags.length }}
              </span>
            </button>
          </div>
          <div
            class="flex items-center justify-between gap-2"
            :class="isCompact ? 'min-h-6' : 'h-15'"
          >
            <span class="text-xs text-base-content/65" aria-live="polite">
              {{
                filteredEntries.length === total
                  ? t('literature.count', total)
                  : t('literature.countFiltered', { shown: filteredEntries.length, total })
              }}
            </span>
            <button
              v-if="!isCompact && (searchQuery.trim() || selectedTags.length)"
              type="button"
              class="btn btn-ghost btn-xs"
              @click="reset"
            >
              {{ t('literature.reset') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Publication list -->
      <div ref="list" class="flex-1 overflow-y-auto">
        <ul
          class="mx-auto max-w-3xl divide-y divide-base-300"
          :class="isCompact ? 'px-4' : 'px-8'"
          style="padding-bottom: max(env(safe-area-inset-bottom), 1.5rem)"
        >
          <li
            v-if="filteredEntries.length === 0"
            class="py-6 flex items-center gap-3 text-sm text-base-content/65"
          >
            {{ t('literature.noResults') }}
            <button
              type="button"
              class="btn btn-ghost"
              :class="isCompact ? 'h-11' : 'btn-xs'"
              @click="reset"
            >
              {{ t('literature.reset') }}
            </button>
          </li>
          <li
            v-for="{ key, publication } in filteredEntries"
            :id="key"
            :key="key"
            class="py-3 scroll-mt-2"
            :class="{
              '-mx-3 px-3 rounded-box border border-primary/40 bg-primary/5':
                route.hash === `#${key}`,
            }"
          >
            <PublicationCitation :publication="publication" />
            <div v-if="publication.tags?.length" class="mt-1.5 flex flex-wrap gap-1">
              <span
                v-for="tag in publication.tags"
                :key="tag"
                class="badge badge-xs badge-ghost text-micro font-medium text-base-content/65"
              >
                {{ tagLabel(tag) }}
              </span>
            </div>
            <p
              v-if="index[key]?.terms.length || index[key]?.modules.length"
              class="mt-1.5 text-xs text-base-content/65 leading-relaxed"
            >
              <span class="font-medium">{{ t('literature.citedIn') }}:</span>
              <template v-for="term in index[key]?.terms ?? []" :key="term.key">
                {{ ' ' }}
                <RouterLink
                  :to="glossaryPath(term.modulePrefix, term.key)"
                  class="text-base-content/80 underline decoration-base-300 underline-offset-2 hover:text-primary"
                >
                  <KatexInlineElement :text="termTitle(term.definition)" />
                </RouterLink>
              </template>
              <template v-for="id in index[key]?.modules ?? []" :key="id">
                {{ ' '
                }}<span>{{ t('literature.moduleCard', { name: t(`modules.${id}.name`) }) }}</span>
              </template>
            </p>
          </li>
        </ul>
      </div>
    </div>

    <BottomSheet v-if="isCompact" v-model:open="filtersOpen" :title="t('literature.filters')">
      <LiteratureFacets compact :selected="selectedTags" :counts="tagCounts" @toggle="toggleTag" />
      <template #footer>
        <div class="flex gap-2 pb-3">
          <button
            type="button"
            class="btn btn-soft h-12 flex-1"
            :disabled="!selectedTags.length"
            @click="selectedTags = []"
          >
            {{ t('literature.clearFilters') }}
          </button>
          <button type="button" class="btn btn-primary h-12 flex-1" @click="filtersOpen = false">
            {{ t('literature.showResults', filteredEntries.length) }}
          </button>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>
