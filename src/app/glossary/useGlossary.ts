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
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  abstractArgumentationGlossary,
  abstractArgumentationRankingGlossary,
} from '@/modules/abstract-argumentation/glossary'
import { bipolarArgumentationGlossary } from '@/modules/bipolar-argumentation/glossary'
import { collectiveAttacksArgumentationGlossary } from '@/modules/collective-attacks-argumentation/glossary'
import type { TooltipDefinition, TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'
import { dialecticalArgumentationGlossary } from '@/modules/dialectical-argumentation/glossary'
import { incompleteArgumentationGlossary } from '@/modules/incomplete-argumentation/glossary'
import { probabilisticArgumentationGlossary } from '@/modules/probabilistic-argumentation/glossary'

export interface GlossaryModule {
  prefix: string
  label: string
  glossary: TooltipRegistry
}

export const glossaryModules: GlossaryModule[] = [
  {
    prefix: 'AF',
    label: 'Abstract AF',
    glossary: { ...abstractArgumentationGlossary, ...abstractArgumentationRankingGlossary },
  },
  { prefix: 'BAF', label: 'Bipolar AF', glossary: bipolarArgumentationGlossary },
  { prefix: 'ADF', label: 'Dialectical AF', glossary: dialecticalArgumentationGlossary },
  { prefix: 'iAF', label: 'Incomplete AF', glossary: incompleteArgumentationGlossary },
  { prefix: 'PAF', label: 'Probabilistic AF', glossary: probabilisticArgumentationGlossary },
  {
    prefix: 'SetAF',
    label: 'Collective Attacks',
    glossary: collectiveAttacksArgumentationGlossary,
  },
]

/**
 * Shared glossary state for the desktop two-panel view and the mobile inline-card view:
 * module selection, search, letter-grouping, and cross-module reference navigation.
 */
export function useGlossary() {
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
    return sortedTerms.value.filter(
      ([key, def]) =>
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

  function selectModule(modulePrefix: string) {
    router.replace({ path: '/glossary', query: { module: modulePrefix } })
  }

  function followRef(refKey: string) {
    const entry = allEntries.value[refKey]
    if (entry) navigate(entry.modulePrefix, refKey)
  }

  return {
    allEntries,
    activeModulePrefix,
    activeTermKey,
    activeModule,
    searchQuery,
    groupedTerms,
    activeDefinition,
    navigate,
    selectModule,
    followRef,
  }
}
