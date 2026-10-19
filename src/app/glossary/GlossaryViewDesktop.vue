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
import { MapPinIcon } from '@heroicons/vue/24/outline'
import type { Objectish } from 'immer'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { complexityTableFor } from '@/app/glossary/complexity'
import { termTitle } from '@/app/glossary/glossaryContext'
import GlossaryEntryDetails from '@/app/glossary/GlossaryEntryDetails.vue'
import GlossaryInline from '@/app/glossary/GlossaryInline.vue'
import { principleTableFor } from '@/app/glossary/principles'
import { glossaryModules, LITERATURE_TAB, useGlossary } from '@/app/glossary/useGlossary'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import LiteraturePanel from '@/app/literature/LiteraturePanel.vue'
import SearchInput from '@/modules/common/forms/SearchInput.vue'
import PageHeader from '@/modules/common/layout/PageHeader.vue'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'

const { modules } = defineProps<{ modules: readonly ModuleConfig<Objectish>[] }>()

const { t } = useI18n({ useScope: 'global' })

const {
  backlinks,
  activeModulePrefix,
  activeTermKey,
  searchQuery,
  pinnedTerm,
  groupedTerms,
  activeDefinition,
  fallbackTermKey,
  literatureActive,
  navigate,
  selectModule,
} = useGlossary(t('glossary.title'))

const wide = computed(
  () => !!complexityTableFor(activeTermKey.value) || !!principleTableFor(activeTermKey.value),
)

// The detail panel always shows a term: without a valid one in the URL, open the fallback.
watch(
  [activeModulePrefix, literatureActive, activeTermKey],
  ([prefix, literature]) => {
    if (literature || activeDefinition.value || !fallbackTermKey.value) return
    navigate(prefix, fallbackTermKey.value, { replace: true })
  },
  { immediate: true },
)
</script>

<template>
  <div class="h-screen flex flex-col bg-base-100 overflow-hidden">
    <PageHeader :title="t('glossary.title')" :back-label="t('glossary.backToEditor')" />

    <!-- Module tabs -->
    <div role="tablist" class="flex gap-0 px-6 border-b border-base-300 shrink-0 overflow-x-auto">
      <button
        v-for="m in glossaryModules"
        :key="m.prefix"
        role="tab"
        class="px-4 py-2.5 text-sm border-b-2 whitespace-nowrap transition-colors"
        :class="
          !literatureActive && m.prefix === activeModulePrefix
            ? 'border-primary text-primary font-medium'
            : 'border-transparent text-base-content/65 hover:text-base-content'
        "
        @click="selectModule(m.prefix)"
      >
        {{ m.prefix }}
      </button>
      <button
        role="tab"
        class="px-4 py-2.5 text-sm border-b-2 whitespace-nowrap transition-colors"
        :class="
          literatureActive
            ? 'border-primary text-primary font-medium'
            : 'border-transparent text-base-content/65 hover:text-base-content'
        "
        @click="selectModule(LITERATURE_TAB)"
      >
        {{ t('literature.title') }}
      </button>
    </div>

    <LiteraturePanel v-if="literatureActive" :modules="modules" />

    <!-- Two-panel body -->
    <div v-else class="flex flex-1 overflow-hidden">
      <!-- Left: term list -->
      <div class="w-64 shrink-0 flex flex-col border-r border-base-300 overflow-hidden">
        <div class="p-3 border-b border-base-300">
          <SearchInput v-model="searchQuery" :placeholder="t('glossary.searchPlaceholder')" />
        </div>
        <div class="overflow-y-auto flex-1 py-2">
          <p
            v-if="groupedTerms.length === 0 && !pinnedTerm"
            class="text-sm text-base-content/65 px-4 py-2"
          >
            {{ t('glossary.noResults') }}
          </p>
          <button
            v-if="pinnedTerm"
            class="w-full flex items-center gap-1.5 text-left px-4 py-1.5 text-sm hover:bg-base-200 border-b border-base-300 mb-1"
            :class="{ 'bg-base-200 font-medium': pinnedTerm[0] === activeTermKey }"
            @click="navigate(activeModulePrefix, pinnedTerm[0])"
          >
            <MapPinIcon class="size-3.5 text-primary shrink-0" />
            <span class="truncate">
              <KatexInlineElement :text="termTitle(pinnedTerm[1])" />
            </span>
          </button>
          <template v-for="group in groupedTerms" :key="group.letter">
            <div class="section-label px-4 pt-2 pb-0.5">
              {{ group.letter }}
            </div>
            <button
              v-for="[key, def] in group.terms"
              :key="key"
              class="w-full text-left px-4 py-1.5 text-sm hover:bg-base-200 truncate"
              :class="{ 'bg-base-200 font-medium': key === activeTermKey }"
              @click="navigate(activeModulePrefix, key)"
            >
              <KatexInlineElement :text="termTitle(def)" />
            </button>
          </template>
        </div>
      </div>

      <!-- Right: definition panel -->
      <div class="flex-1 overflow-y-auto p-8">
        <div v-if="activeDefinition" :key="activeTermKey" :class="wide ? 'max-w-5xl' : 'max-w-2xl'">
          <h2 class="text-xl font-bold leading-snug mb-4">
            <KatexInlineElement :text="termTitle(activeDefinition)" />
          </h2>
          <p class="text-base-content/80 leading-relaxed">
            <GlossaryInline :parts="activeDefinition.content" />
          </p>
          <GlossaryEntryDetails
            :term-key="activeTermKey"
            :definition="activeDefinition"
            :backlinks="backlinks[activeTermKey]"
          />
        </div>
        <p v-else class="text-sm text-base-content/65">{{ t('glossary.selectTerm') }}</p>
      </div>
    </div>
  </div>
</template>
