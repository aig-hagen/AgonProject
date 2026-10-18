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
import { nextTick, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import GlossaryCardMobile from '@/app/glossary/GlossaryCardMobile.vue'
import { glossaryModules, useGlossary } from '@/app/glossary/useGlossary'
import SearchInput from '@/modules/common/forms/SearchInput.vue'
import PageHeader from '@/modules/common/layout/PageHeader.vue'

const { t } = useI18n({ useScope: 'global' })

const {
  allEntries,
  backlinks,
  activeModulePrefix,
  activeTermKey,
  searchQuery,
  pinnedTerm,
  groupedTerms,
  selectModule,
  followRef,
} = useGlossary(t('glossary.title'))

const list = useTemplateRef('list')

// Bring the term in the URL into view, e.g. after following a link or opening a shared URL.
watch(
  activeTermKey,
  async (key) => {
    await nextTick()
    list.value
      ?.querySelector(`[data-term="${CSS.escape(key)}"]`)
      ?.scrollIntoView({ block: 'start' })
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col h-dvh w-full bg-base-100 overflow-hidden">
    <PageHeader :title="t('glossary.title')" :back-label="t('glossary.backToEditor')" />

    <!-- Module selector -->
    <div class="flex-none overflow-x-auto px-3 py-2 border-b border-base-200">
      <div class="flex gap-2 w-max">
        <button
          v-for="m in glossaryModules"
          :key="m.prefix"
          class="px-3.5 h-8 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="
            m.prefix === activeModulePrefix
              ? 'bg-primary text-primary-content'
              : 'bg-base-200 text-base-content/80'
          "
          @click="selectModule(m.prefix)"
        >
          {{ m.prefix }}
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="flex-none px-4 pt-3 pb-1">
      <SearchInput v-model="searchQuery" :placeholder="t('glossary.searchPlaceholder')" />
    </div>

    <!-- Entry list -->
    <div
      ref="list"
      class="flex-1 overflow-y-auto px-4 pt-2 flex flex-col gap-2.5"
      style="padding-bottom: max(env(safe-area-inset-bottom), 1.25rem)"
    >
      <p
        v-if="groupedTerms.length === 0 && !pinnedTerm"
        class="text-sm text-base-content/65 px-1 py-4"
      >
        {{ t('glossary.noResults') }}
      </p>
      <GlossaryCardMobile
        v-if="pinnedTerm"
        :key="pinnedTerm[0]"
        :definition="pinnedTerm[1]"
        :entries="allEntries"
        :backlinks="backlinks[pinnedTerm[0]]"
        :active="pinnedTerm[0] === activeTermKey"
        :data-term="pinnedTerm[0]"
        pinned
        @follow="followRef"
      />
      <template v-for="group in groupedTerms" :key="group.letter">
        <div class="text-xs font-bold text-secondary tracking-wide mt-1.5 px-0.5">
          {{ group.letter }}
        </div>
        <GlossaryCardMobile
          v-for="[key, def] in group.terms"
          :key="key"
          :definition="def"
          :entries="allEntries"
          :backlinks="backlinks[key]"
          :active="key === activeTermKey"
          :data-term="key"
          @follow="followRef"
        />
      </template>
    </div>
  </div>
</template>
