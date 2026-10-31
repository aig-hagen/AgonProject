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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { listTitle } from '@/app/glossary/glossaryContext'
import GlossaryRowMobile from '@/app/glossary/GlossaryRowMobile.vue'
import {
  glossaryModules,
  glossaryPath,
  LITERATURE_TAB,
  moduleHomePath,
  searchGlossary,
} from '@/app/glossary/useGlossary'
import SearchInput from '@/modules/common/forms/SearchInput.vue'

const query = defineModel<string>({ required: true })

const { t } = useI18n({ useScope: 'global' })

const sections = computed(() => [
  { label: t('glossary.index.frameworks'), modules: glossaryModules.filter((m) => !m.topic) },
  { label: t('glossary.index.topics'), modules: glossaryModules.filter((m) => m.topic) },
])

const results = computed(() => searchGlossary(query.value))
</script>

<template>
  <div>
    <div class="px-4 pt-3 pb-1">
      <SearchInput v-model="query" :placeholder="t('glossary.searchAll')" />
    </div>

    <template v-if="query.trim()">
      <p v-if="results.length === 0" class="px-4 py-4 text-sm text-base-content/65">
        {{ t('glossary.noResults') }}
      </p>
      <template v-else>
        <div class="section-label px-4 pt-4 pb-1">
          {{ t('glossary.results', results.length) }}
        </div>
        <GlossaryRowMobile
          v-for="result in results"
          :key="result.key"
          :to="glossaryPath(result.modulePrefix, result.key)"
          :title="listTitle(result.definition)"
          :meta="result.modulePrefix"
        />
      </template>
    </template>

    <template v-else>
      <template v-for="section in sections" :key="section.label">
        <div class="section-label px-4 pt-4 pb-1">{{ section.label }}</div>
        <GlossaryRowMobile
          v-for="m in section.modules"
          :key="m.prefix"
          :to="moduleHomePath(m)"
          :title="t(m.nameKey)"
          :meta="t(m.nameKey) === m.prefix ? undefined : m.prefix"
        />
      </template>
      <div class="section-label px-4 pt-4 pb-1">{{ t('glossary.index.references') }}</div>
      <GlossaryRowMobile :to="glossaryPath(LITERATURE_TAB)" :title="t('literature.title')" />
    </template>
  </div>
</template>
