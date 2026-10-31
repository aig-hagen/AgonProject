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
<script lang="ts">
// List scroll positions per history entry, kept across leaving and re-entering the glossary.
const scrollMemory = new Map<string, number>()
</script>

<script setup lang="ts">
import type { Objectish } from 'immer'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

import GlossaryEntry from '@/app/glossary/GlossaryEntry.vue'
import GlossaryIndexMobile from '@/app/glossary/GlossaryIndexMobile.vue'
import GlossaryListMobile from '@/app/glossary/GlossaryListMobile.vue'
import {
  entryModulePrefix,
  glossaryModules,
  glossaryPath,
  moduleHomePath,
  useGlossary,
} from '@/app/glossary/useGlossary'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import LiteraturePanel from '@/app/literature/LiteraturePanel.vue'
import SearchInput from '@/modules/common/forms/SearchInput.vue'
import PageHeader from '@/modules/common/layout/PageHeader.vue'

const { modules } = defineProps<{ modules: readonly ModuleConfig<Objectish>[] }>()

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()

const {
  backlinks,
  activeModule,
  activeModulePrefix,
  moduleParam,
  activeTermKey,
  searchQuery,
  groupedTerms,
  pinnedTerm,
  activeDefinition,
  literatureActive,
  redirecting,
} = useGlossary()

// Drill-down levels: index (/glossary) → module list (/glossary/AF) → entry (/glossary/AF/ST).
// Modules with an overview home have no list page; their overview entry lists the rest.
const moduleValid = computed(() => glossaryModules.some((m) => m.prefix === moduleParam.value))
const level = computed<'index' | 'list' | 'entry' | 'literature' | null>(() => {
  if (literatureActive.value) return 'literature'
  if (!moduleParam.value) return 'index'
  if (!moduleValid.value) return null
  if (!activeTermKey.value) return activeModule.value.overviewHome ? null : 'list'
  return activeDefinition.value ? 'entry' : null
})
const isModuleHome = computed(
  () => activeModule.value.overviewHome && activeTermKey.value === activeModule.value.mainKey,
)

// URLs without a page of their own move to the closest one that has.
watch(
  [level, redirecting],
  () => {
    if (level.value || redirecting.value) return
    const term = activeTermKey.value
    const prefix = term ? entryModulePrefix(term) : undefined
    const to = !moduleValid.value
      ? glossaryPath()
      : prefix
        ? glossaryPath(prefix, term)
        : moduleHomePath(activeModule.value)
    router.replace(to)
  },
  { immediate: true },
)

const title = computed(() =>
  level.value === 'index'
    ? t('glossary.title')
    : level.value === 'literature'
      ? t('literature.title')
      : activeModulePrefix.value,
)

const parentPath = computed(() => {
  if (level.value === 'index') return '/'
  if (level.value === 'entry' && !isModuleHome.value) return moduleHomePath(activeModule.value)
  return glossaryPath()
})

// Back to the previous page; without one (a deep link), up one level instead of off the site.
function back() {
  if (router.options.history.state.back) router.back()
  else router.push(parentPath.value)
}

const indexQuery = ref('')

const scroller = useTemplateRef('scroller')
const scrollKey = () => `${String(router.options.history.state.position)}:${route.fullPath}`
const rememberScroll = () => {
  if (scroller.value) scrollMemory.set(scrollKey(), scroller.value.scrollTop)
}
onBeforeRouteUpdate(rememberScroll)
onBeforeRouteLeave(rememberScroll)
watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    if (scroller.value) scroller.value.scrollTop = scrollMemory.get(scrollKey()) ?? 0
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col h-dvh w-full bg-base-100 overflow-hidden">
    <PageHeader :title="title" :back-label="t('glossary.back')" :on-back="back" />

    <LiteraturePanel v-if="level === 'literature'" :modules="modules" />

    <div
      v-else
      ref="scroller"
      class="flex-1 overflow-y-auto"
      style="padding-bottom: max(env(safe-area-inset-bottom), 1.25rem)"
    >
      <GlossaryIndexMobile v-if="level === 'index'" v-model="indexQuery" />

      <template v-else-if="level === 'list'">
        <div class="px-4 pt-3 pb-1">
          <SearchInput
            v-model="searchQuery"
            :placeholder="t('glossary.searchModule', { name: activeModulePrefix })"
          />
        </div>
        <GlossaryListMobile
          :module-prefix="activeModulePrefix"
          :pinned="pinnedTerm"
          :groups="groupedTerms"
        />
      </template>

      <template v-else-if="level === 'entry' && activeDefinition">
        <GlossaryEntry
          :key="activeTermKey"
          :term-key="activeTermKey"
          :definition="activeDefinition"
          :backlinks="backlinks[activeTermKey]"
          class="px-4 pt-5 pb-2"
        />
        <!-- An overview entry is its module's home, so the module's other entries follow. -->
        <section v-if="isModuleHome" class="mt-6 border-t border-base-300">
          <h2 class="section-label px-4 pt-4 pb-1">{{ t('glossary.allEntries') }}</h2>
          <div class="px-4 pt-1 pb-1">
            <SearchInput
              v-model="searchQuery"
              :placeholder="t('glossary.searchModule', { name: activeModulePrefix })"
            />
          </div>
          <GlossaryListMobile :module-prefix="activeModulePrefix" :groups="groupedTerms" />
        </section>
      </template>
    </div>
  </div>
</template>
