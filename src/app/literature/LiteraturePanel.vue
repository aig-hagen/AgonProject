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
import type { Objectish } from 'immer'
import { nextTick, onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { glossaryPath } from '@/app/glossary/useGlossary'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import { useLiterature } from '@/app/literature/useLiterature'
import SearchInput from '@/modules/common/forms/SearchInput.vue'
import { useLayoutMode } from '@/modules/common/layout/useLayoutMode'
import { FORMALISM_TAGS, TOPIC_TAGS } from '@/modules/common/publications/tags'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import PublicationCitation from '@/modules/common/tooltip/PublicationCitation.vue'

const { modules } = defineProps<{ modules: readonly ModuleConfig<Objectish>[] }>()

const { t } = useI18n({ useScope: 'global' })
const { isCompact } = useLayoutMode()
const route = useRoute()

const { total, index, searchQuery, selectedTags, toggleTag, filteredEntries } =
  useLiterature(modules)

const facets = [
  { label: 'literature.formalism', tags: FORMALISM_TAGS, translate: false },
  { label: 'literature.topic', tags: TOPIC_TAGS, translate: true },
] as const

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

const defaultTitle = document.title
onMounted(() => {
  document.title = `${t('literature.title')} · ${t('glossary.title')} · AgonProject`
})
onUnmounted(() => {
  document.title = defaultTitle
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
    <!-- Search and tag filters -->
    <div class="flex-none border-b border-base-300">
      <div
        class="mx-auto max-w-3xl flex flex-col gap-3"
        :class="isCompact ? 'px-4 py-3' : 'px-8 py-4'"
      >
        <SearchInput v-model="searchQuery" :placeholder="t('literature.searchPlaceholder')" />
        <div v-for="facet in facets" :key="facet.label" class="flex flex-col gap-1.5">
          <span class="field-label">{{ t(facet.label) }}</span>
          <div class="flex gap-1.5" :class="isCompact ? 'overflow-x-auto -mx-4 px-4' : 'flex-wrap'">
            <button
              v-for="tag in facet.tags"
              :key="tag"
              type="button"
              :aria-pressed="selectedTags.includes(tag)"
              class="rounded-full px-3 text-sm whitespace-nowrap transition-colors"
              :class="[
                isCompact ? 'h-8' : 'h-7',
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content/80 hover:text-base-content',
              ]"
              @click="toggleTag(tag)"
            >
              {{ facet.translate ? t(`literature.tags.${tag}`) : tag }}
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between gap-2 min-h-6">
          <span class="text-xs text-base-content/65">
            {{
              filteredEntries.length === total
                ? t('literature.count', total)
                : t('literature.countFiltered', { shown: filteredEntries.length, total })
            }}
          </span>
          <button
            v-if="selectedTags.length"
            type="button"
            class="btn btn-ghost btn-xs"
            @click="selectedTags = []"
          >
            {{ t('literature.clearFilters') }}
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
        <li v-if="filteredEntries.length === 0" class="py-6 text-sm text-base-content/65">
          {{ t('literature.noResults') }}
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
              class="badge badge-xs badge-ghost text-micro font-medium uppercase tracking-wide text-base-content/65"
            >
              {{
                (FORMALISM_TAGS as readonly string[]).includes(tag)
                  ? tag
                  : t(`literature.tags.${tag}`)
              }}
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
                <KatexInlineElement :text="term.definition.title ?? term.definition.label" />
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
</template>
