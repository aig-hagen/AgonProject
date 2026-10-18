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
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import glossaryModuleList from '@/app/glossary/glossaryModules.json'
import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import { assumptionBasedArgumentationGlossary } from '@/modules/assumption-based-argumentation/glossary'
import { bipolarArgumentationGlossary } from '@/modules/bipolar-argumentation/glossary'
import { collectiveAttacksArgumentationGlossary } from '@/modules/collective-attacks-argumentation/glossary'
import { complexityGlossary } from '@/modules/common/complexity/glossary'
import type { GlossaryInline } from '@/modules/common/glossary/types'
import type { TooltipDefinition, TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'
import { dialecticalArgumentationGlossary } from '@/modules/dialectical-argumentation/glossary'
import { incompleteArgumentationGlossary } from '@/modules/incomplete-argumentation/glossary'
import { probabilisticArgumentationGlossary } from '@/modules/probabilistic-argumentation/glossary'

function inlineRefs(parts: GlossaryInline[]): string[] {
  return parts.flatMap((part) => (typeof part !== 'string' && 'ref' in part ? [part.ref] : []))
}

/** Every term key an entry links to, in its definition or body. */
export function entryRefs(def: TooltipDefinition): string[] {
  const body = (def.body ?? []).flatMap((block) =>
    block.kind === 'list' ? block.items.flatMap(inlineRefs) : inlineRefs(block.content),
  )
  return [...inlineRefs(def.content), ...body]
}

/** Strips `$…$` LaTeX down to its letters, for plain-text contexts like the page title. */
export function plainText(text: string): string {
  return text.replace(/\$([^$]*)\$/g, (_, math: string) =>
    math
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[{}^]/g, '')
      .replace(/_/g, ''),
  )
}

export function glossaryPath(modulePrefix?: string, termKey?: string): string {
  return ['/glossary', modulePrefix, termKey].filter(Boolean).join('/')
}

export interface GlossaryModule {
  prefix: string
  label: string
  glossary: TooltipRegistry
  // Key of the "main" entry (the framework itself), pinned to the top of the list.
  mainKey: string
}

const registries: Record<string, TooltipRegistry> = {
  'abstract-argumentation': abstractArgumentationGlossary,
  'assumption-based-argumentation': assumptionBasedArgumentationGlossary,
  'bipolar-argumentation': bipolarArgumentationGlossary,
  'collective-attacks-argumentation': collectiveAttacksArgumentationGlossary,
  'common/complexity': complexityGlossary,
  'dialectical-argumentation': dialecticalArgumentationGlossary,
  'incomplete-argumentation': incompleteArgumentationGlossary,
  'probabilistic-argumentation': probabilisticArgumentationGlossary,
}

// The module list is JSON so the build's sitemap plugin (vite.config.ts) can read it too.
export const glossaryModules: GlossaryModule[] = glossaryModuleList.map(
  ({ prefix, label, dir, mainKey }) => ({ prefix, label, mainKey, glossary: registries[dir]! }),
)

/**
 * Shared glossary state for the desktop two-panel view and the mobile inline-card view:
 * module selection, search, letter-grouping, and cross-module reference navigation.
 */
export function useGlossary(glossaryTitle: string) {
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

  // termKey → the entries whose definition or body links to it.
  const backlinks = computed(() => {
    const map: Record<
      string,
      { key: string; definition: TooltipDefinition; modulePrefix: string }[]
    > = {}
    for (const m of glossaryModules) {
      for (const [key, def] of Object.entries(m.glossary)) {
        for (const ref of new Set(entryRefs(def))) {
          if (ref !== key) (map[ref] ??= []).push({ key, definition: def, modulePrefix: m.prefix })
        }
      }
    }
    return map
  })

  const route = useRoute()
  const router = useRouter()

  const param = (name: string) => {
    const value = route.params[name]
    return typeof value === 'string' && value ? value : undefined
  }

  const activeModulePrefix = computed(() => {
    const p = param('module')
    return glossaryModules.find((m) => m.prefix === p)?.prefix ?? glossaryModules[0]!.prefix
  })

  const activeTermKey = computed(() => param('term') ?? '')

  // Old `?module=&term=` links and tooltips' `?term=` (keys are unique, so the module is
  // optional) move to the canonical path.
  watch(
    () => route.query,
    ({ module, term }) => {
      if (typeof module !== 'string' && typeof term !== 'string') return
      const key = typeof term === 'string' ? term : undefined
      const prefix = (key && allEntries.value[key]?.modulePrefix) ?? (module as string | undefined)
      router.replace(glossaryPath(prefix, key))
    },
    { immediate: true },
  )

  const activeModule = computed(
    () => glossaryModules.find((m) => m.prefix === activeModulePrefix.value)!,
  )

  const searchQuery = ref('')

  watch(activeModulePrefix, () => {
    searchQuery.value = ''
  })

  function matchesQuery([key, def]: [string, TooltipDefinition], q: string) {
    return (
      (def.title ?? def.label ?? key).toLowerCase().includes(q) || key.toLowerCase().includes(q)
    )
  }

  // The framework entry, pinned above the alphabetical list (hidden when it fails the search).
  const pinnedTerm = computed<[string, TooltipDefinition] | null>(() => {
    const { mainKey, glossary } = activeModule.value
    const def = glossary[mainKey]
    if (!def) return null
    const q = searchQuery.value.toLowerCase().trim()
    if (q && !matchesQuery([mainKey, def], q)) return null
    return [mainKey, def]
  })

  const sortedTerms = computed(() =>
    Object.entries(activeModule.value.glossary)
      .filter(([key]) => key !== activeModule.value.mainKey)
      .sort(([, a], [, b]) => (a.title ?? a.label).localeCompare(b.title ?? b.label)),
  )

  const filteredTerms = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return sortedTerms.value
    return sortedTerms.value.filter((entry) => matchesQuery(entry, q))
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

  const defaultTitle = document.title
  watch(
    activeDefinition,
    (def) => {
      document.title = def
        ? `${plainText(def.title ?? def.label)} · ${glossaryTitle} · AgonProject`
        : defaultTitle
    },
    { immediate: true },
  )
  onUnmounted(() => {
    document.title = defaultTitle
  })

  function navigate(modulePrefix: string, termKey: string, { replace = false } = {}) {
    const to = glossaryPath(modulePrefix, termKey)
    if (replace) router.replace(to)
    else router.push(to)
  }

  function selectModule(modulePrefix: string) {
    router.push(glossaryPath(modulePrefix))
  }

  function followRef(refKey: string) {
    const entry = allEntries.value[refKey]
    if (entry) navigate(entry.modulePrefix, refKey)
  }

  return {
    allEntries,
    backlinks,
    activeModulePrefix,
    activeTermKey,
    activeModule,
    searchQuery,
    pinnedTerm,
    groupedTerms,
    activeDefinition,
    navigate,
    selectModule,
    followRef,
  }
}
