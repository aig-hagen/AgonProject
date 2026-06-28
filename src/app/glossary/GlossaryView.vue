<!--
  Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.

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
import { ArrowLeftIcon, BookOpenIcon } from '@heroicons/vue/24/outline'
import type { IDBPDatabase } from 'idb'
import type { Objectish } from 'immer'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import type { ModuleConfig } from '@/app/home/moduleConfig'
import { abstractArgumentationGlossary, abstractArgumentationRankingGlossary } from '@/modules/abstract-argumentation/glossary'
import { bipolarArgumentationGlossary } from '@/modules/bipolar-argumentation/glossary'
import { collectiveAttacksArgumentationGlossary } from '@/modules/collective-attacks-argumentation/glossary'
import type { DocumentsDB } from '@/modules/common/documents/db'
import KatexInlineElement from '@/modules/common/tooltip/KatexInlineElement.vue'
import type { TooltipDefinition, TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'
import { dialecticalArgumentationGlossary } from '@/modules/dialectical-argumentation/glossary'
import { incompleteArgumentationGlossary } from '@/modules/incomplete-argumentation/glossary'
import { probabilisticArgumentationGlossary } from '@/modules/probabilistic-argumentation/glossary'

// Declared to prevent Vue from warning about unrecognized attrs (same pattern as GenerateView).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { modules: _modules } = defineProps<{
  db: IDBPDatabase<DocumentsDB>
  modules: ModuleConfig<Objectish>[]
}>()

interface GlossaryModule {
  prefix: string
  label: string
  glossary: TooltipRegistry
}

const glossaryModules: GlossaryModule[] = [
  { prefix: 'AF', label: 'Abstract AF', glossary: { ...abstractArgumentationGlossary, ...abstractArgumentationRankingGlossary } },
  { prefix: 'BAF', label: 'Bipolar AF', glossary: bipolarArgumentationGlossary },
  { prefix: 'ADF', label: 'Dialectical AF', glossary: dialecticalArgumentationGlossary },
  { prefix: 'iAF', label: 'Incomplete AF', glossary: incompleteArgumentationGlossary },
  { prefix: 'PAF', label: 'Probabilistic AF', glossary: probabilisticArgumentationGlossary },
  { prefix: 'SetAF', label: 'Collective Attacks', glossary: collectiveAttacksArgumentationGlossary },
]

// Combined map for cross-module ref resolution: termKey → { definition, modulePrefix }
const allEntries = computed(() => {
  const map: Record<string, { definition: TooltipDefinition; modulePrefix: string }> = {}
  for (const m of glossaryModules) {
    for (const [key, def] of Object.entries(m.glossary)) {
      if (!(key in map)) map[key] = { definition: def, modulePrefix: m.prefix }
    }
  }
  return map
})

const route = useRoute()
const router = useRouter()

const activeModulePrefix = computed(() => {
  const p = route.query.module as string | undefined
  return glossaryModules.find((m) => m.prefix === p)?.prefix ?? glossaryModules[0]!.prefix
})

const activeTermKey = computed(() => (route.query.term as string | undefined) ?? '')

const activeModule = computed(
  () => glossaryModules.find((m) => m.prefix === activeModulePrefix.value)!,
)

const searchQuery = ref('')

watch(activeModulePrefix, () => {
  searchQuery.value = ''
})

const sortedTerms = computed(() =>
  Object.entries(activeModule.value.glossary).sort(([, a], [, b]) =>
    (a.title ?? a.label).localeCompare(b.title ?? b.label),
  ),
)

const filteredTerms = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return sortedTerms.value
  return sortedTerms.value.filter(([key, def]) =>
    (def.title ?? def.label ?? key).toLowerCase().includes(q) || key.toLowerCase().includes(q),
  )
})

const groupedTerms = computed(() => {
  const groups: { letter: string; terms: [string, TooltipDefinition][] }[] = []
  for (const entry of filteredTerms.value) {
    const letter = (entry[1].title ?? entry[1].label ?? entry[0]).charAt(0).toUpperCase()
    const last = groups[groups.length - 1]
    if (last?.letter === letter) {
      last.terms.push(entry)
    } else {
      groups.push({ letter, terms: [entry] })
    }
  }
  return groups
})

const activeDefinition = computed(
  () => activeModule.value.glossary[activeTermKey.value] as TooltipDefinition | undefined,
)

function navigate(modulePrefix: string, termKey: string) {
  router.replace({ path: '/glossary', query: { module: modulePrefix, term: termKey } })
}

function followRef(refKey: string) {
  const entry = allEntries.value[refKey]
  if (entry) navigate(entry.modulePrefix, refKey)
}

// Auto-select the first term when the module changes or no valid term is in the URL.
watch(
  activeModulePrefix,
  (prefix) => {
    const glossary = glossaryModules.find((m) => m.prefix === prefix)?.glossary ?? {}
    if (!activeTermKey.value || !glossary[activeTermKey.value]) {
      const first = Object.entries(glossary).sort(([, a], [, b]) =>
        (a.title ?? a.label).localeCompare(b.title ?? b.label),
      )[0]
      if (first) navigate(prefix, first[0])
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="h-screen flex flex-col bg-base-100 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-4 px-6 py-3 border-b border-base-300 shrink-0">
      <RouterLink to="/" class="btn btn-sm btn-ghost gap-1">
        <ArrowLeftIcon class="size-4" />
        Back to Editor
      </RouterLink>
      <h1 class="text-lg font-bold">Glossary</h1>
    </div>

    <!-- Module tabs -->
    <div role="tablist" class="flex gap-0 px-6 border-b border-base-300 shrink-0 overflow-x-auto">
      <button
        v-for="m in glossaryModules"
        :key="m.prefix"
        role="tab"
        class="px-4 py-2.5 text-sm border-b-2 whitespace-nowrap transition-colors"
        :class="
          m.prefix === activeModulePrefix
            ? 'border-primary text-primary font-medium'
            : 'border-transparent text-base-content/60 hover:text-base-content'
        "
        @click="navigate(m.prefix, '')"
      >
        {{ m.label }}
      </button>
    </div>

    <!-- Two-panel body -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left: term list -->
      <div class="w-64 shrink-0 flex flex-col border-r border-base-300 overflow-hidden">
        <div class="p-3 border-b border-base-300">
          <input
            v-model="searchQuery"
            type="search"
            class="input input-sm w-full"
            placeholder="Search…"
          />
        </div>
        <div class="overflow-y-auto flex-1 py-2">
          <p v-if="groupedTerms.length === 0" class="text-sm text-base-content/40 px-4 py-2">
            No results
          </p>
          <template v-for="group in groupedTerms" :key="group.letter">
            <div
              class="px-4 pt-2 pb-0.5 text-xs font-semibold text-base-content/40 uppercase tracking-wide"
            >
              {{ group.letter }}
            </div>
            <button
              v-for="[key, def] in group.terms"
              :key="key"
              class="w-full text-left px-4 py-1.5 text-sm hover:bg-base-200 truncate"
              :class="{ 'bg-base-200 font-medium': key === activeTermKey }"
              @click="navigate(activeModulePrefix, key)"
            >
              <KatexInlineElement :text="def.title ?? def.label" />
            </button>
          </template>
        </div>
      </div>

      <!-- Right: definition panel -->
      <div class="flex-1 overflow-y-auto p-8">
        <div v-if="activeDefinition" class="max-w-2xl">
          <div class="flex items-start gap-2 mb-4">
            <h2 class="text-xl font-bold leading-snug">
              <KatexInlineElement
                :text="activeDefinition.title ?? activeDefinition.label"
              />
            </h2>
            <a
              v-if="activeDefinition.reference"
              :href="activeDefinition.reference.href"
              :title="activeDefinition.reference.label"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-1 text-base-content/40 hover:text-base-content/70 shrink-0"
            >
              <BookOpenIcon class="size-5" />
            </a>
          </div>
          <p class="text-base-content/80 leading-relaxed">
            <template v-for="(part, i) in activeDefinition.content" :key="i">
              <KatexInlineElement v-if="typeof part === 'string'" :text="part" />
              <button
                v-else-if="allEntries[part.ref]"
                class="text-primary underline underline-offset-2 hover:opacity-70"
                @click="followRef(part.ref)"
              >
                <KatexInlineElement
                  :text="part.label ?? allEntries[part.ref]!.definition.label ?? part.ref"
                />
              </button>
              <span v-else class="text-base-content/60">
                <KatexInlineElement :text="part.label ?? part.ref" />
              </span>
            </template>
          </p>
        </div>
        <p v-else class="text-sm text-base-content/40">Select a term from the list.</p>
      </div>
    </div>
  </div>
</template>
