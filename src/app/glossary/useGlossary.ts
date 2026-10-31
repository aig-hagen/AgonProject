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
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { complexityTermGroups } from '@/app/glossary/complexity'
import {
  type GlossaryEntries,
  listTitle,
  provideGlossaryContext,
  termTitle,
} from '@/app/glossary/glossaryContext'
import glossaryModuleList from '@/app/glossary/glossaryModules.json'
import { plainText } from '@/app/glossary/plainText'
import { abstractArgumentationGlossary } from '@/modules/abstract-argumentation/glossary'
import { assumptionBasedArgumentationGlossary } from '@/modules/assumption-based-argumentation/glossary'
import { bipolarArgumentationGlossary } from '@/modules/bipolar-argumentation/glossary'
import { collectiveAttacksArgumentationGlossary } from '@/modules/collective-attacks-argumentation/glossary'
import { complexityGlossary } from '@/modules/common/complexity/glossary'
import { blockInlines } from '@/modules/common/glossary/parse'
import type { GlossaryInline } from '@/modules/common/glossary/types'
import { principlesGlossary } from '@/modules/common/principles/glossary'
import type { TooltipDefinition, TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'
import { dialecticalArgumentationGlossary } from '@/modules/dialectical-argumentation/glossary'
import { incompleteArgumentationGlossary } from '@/modules/incomplete-argumentation/glossary'
import { probabilisticArgumentationGlossary } from '@/modules/probabilistic-argumentation/glossary'

function inlineRefs(parts: GlossaryInline[]): string[] {
  return parts.flatMap((part) => (typeof part !== 'string' && 'ref' in part ? [part.ref] : []))
}

/** Every term key an entry links to, in its definition or body. */
export function entryRefs(def: TooltipDefinition): string[] {
  const body = (def.body ?? []).flatMap((block) => blockInlines(block).flatMap(inlineRefs))
  return [...inlineRefs(def.content), ...body]
}

/** Path segment of the literature tab, which lists publications instead of terms. */
export const LITERATURE_TAB = 'Literature'

export function glossaryPath(modulePrefix?: string, termKey?: string): string {
  return ['/glossary', modulePrefix, termKey].filter(Boolean).join('/')
}

/** Page title for the browser tab and search results: the page, its context, then the site. */
export function pageTitle(page: string, context: string): string {
  return `${page} - ${context} | AgonProject`
}

export interface GlossaryModule {
  prefix: string
  // i18n key of the module's display name.
  nameKey: string
  glossary: TooltipRegistry
  // Key of the "main" entry (the framework itself), pinned to the top of the list.
  mainKey: string
  // Curated term list sections; without them the list is grouped by first letter.
  groups?: { label: string; keys: string[] }[]
}

const registries: Record<string, TooltipRegistry> = {
  'abstract-argumentation': abstractArgumentationGlossary,
  'assumption-based-argumentation': assumptionBasedArgumentationGlossary,
  'bipolar-argumentation': bipolarArgumentationGlossary,
  'collective-attacks-argumentation': collectiveAttacksArgumentationGlossary,
  'common/complexity': complexityGlossary,
  'common/principles': principlesGlossary,
  'dialectical-argumentation': dialecticalArgumentationGlossary,
  'incomplete-argumentation': incompleteArgumentationGlossary,
  'probabilistic-argumentation': probabilisticArgumentationGlossary,
}

const termGroups: Record<string, GlossaryModule['groups']> = {
  'common/complexity': complexityTermGroups,
}

// The module list is JSON so the build's sitemap plugin (vite.config.ts) can read it too.
export const glossaryModules: GlossaryModule[] = glossaryModuleList.map(
  ({ prefix, nameKey, dir, mainKey }) => ({
    prefix,
    nameKey,
    mainKey,
    glossary: registries[dir]!,
    groups: termGroups[dir],
  }),
)

// Combined map for cross-module ref resolution; on a key clash the first module wins.
const allEntries: GlossaryEntries = {}
// termKey → the entries whose definition or body links to it.
const backlinks: Record<string, { key: string; definition: TooltipDefinition }[]> = {}
for (const m of glossaryModules) {
  for (const [key, def] of Object.entries(m.glossary)) {
    allEntries[key] ??= { definition: def, modulePrefix: m.prefix }
    for (const ref of new Set(entryRefs(def))) {
      if (ref !== key) (backlinks[ref] ??= []).push({ key, definition: def })
    }
  }
}

/**
 * Shared glossary state for the desktop two-panel view and the mobile inline-card view:
 * module selection, search, term grouping, and cross-module reference navigation.
 */
export function useGlossary() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n({ useScope: 'global' })

  const param = (name: string) => {
    const value = route.params[name]
    return typeof value === 'string' && value ? value : undefined
  }

  const activeModulePrefix = computed(() => {
    const p = param('module')
    return glossaryModules.find((m) => m.prefix === p)?.prefix ?? glossaryModules[0]!.prefix
  })

  const activeTermKey = computed(() => param('term') ?? '')
  const literatureActive = computed(() => param('module') === LITERATURE_TAB)

  // Old `?module=&term=` links and tooltips' `?term=` (keys are unique, so the module is
  // optional) move to the canonical path.
  watch(
    () => route.query,
    ({ module, term }) => {
      if (typeof module !== 'string' && typeof term !== 'string') return
      const key = typeof term === 'string' ? term : undefined
      const prefix = (key && allEntries[key]?.modulePrefix) ?? (module as string | undefined)
      router.replace(glossaryPath(prefix, key))
    },
    { immediate: true },
  )
  // While that redirect is pending, views must not navigate to a fallback term over it.
  const redirecting = computed(
    () => typeof route.query.module === 'string' || typeof route.query.term === 'string',
  )

  // Module tabs plus the Literature tab, in display order.
  const tabs = computed(() => [
    ...glossaryModules.map((m) => ({
      id: m.prefix,
      label: m.prefix,
      active: !literatureActive.value && m.prefix === activeModulePrefix.value,
    })),
    { id: LITERATURE_TAB, label: t('literature.title'), active: literatureActive.value },
  ])

  const activeModule = computed(
    () => glossaryModules.find((m) => m.prefix === activeModulePrefix.value)!,
  )

  const searchQuery = ref('')

  watch(activeModulePrefix, () => {
    searchQuery.value = ''
  })

  // Without LaTeX, so `$E$-Reduct` sorts and groups under E and is found by "e-reduct".
  const plainListTitle = (def: TooltipDefinition) => plainText(listTitle(def))

  function matchesQuery([key, def]: [string, TooltipDefinition], q: string) {
    return [termTitle(def), plainListTitle(def), def.label, key].some((name) =>
      name.toLowerCase().includes(q),
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
      .sort(([, a], [, b]) => plainListTitle(a).localeCompare(plainListTitle(b))),
  )

  const filteredTerms = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return sortedTerms.value
    return sortedTerms.value.filter((entry) => matchesQuery(entry, q))
  })

  const groupedTerms = computed(() => {
    const curated = activeModule.value.groups
    if (curated) {
      const terms = new Map(filteredTerms.value)
      const take = (keys: string[]) =>
        keys.flatMap((key) => (terms.has(key) ? [[key, terms.get(key)!] as const] : []))
      const groups = curated.map(({ label, keys }) => ({
        label: t(`glossary.complexity.groups.${label}`),
        terms: take(keys),
      }))
      // Terms missing from the curated groups still show up, at the end.
      const grouped = new Set(curated.flatMap(({ keys }) => keys))
      groups.push({
        label: t('glossary.complexity.groups.other'),
        terms: take([...terms.keys()].filter((key) => !grouped.has(key))),
      })
      return groups.filter((group) => group.terms.length)
    }
    const groups: { label: string; terms: (readonly [string, TooltipDefinition])[] }[] = []
    for (const entry of filteredTerms.value) {
      const letter = plainListTitle(entry[1]).charAt(0).toUpperCase()
      const last = groups[groups.length - 1]
      if (last?.label === letter) {
        last.terms.push(entry)
      } else {
        groups.push({ label: letter, terms: [entry] })
      }
    }
    return groups
  })

  const activeDefinition = computed(
    () => activeModule.value.glossary[activeTermKey.value] as TooltipDefinition | undefined,
  )

  // Shown when the URL names no valid term: the pinned entry, else the first alphabetically.
  const fallbackTermKey = computed(() =>
    activeModule.value.glossary[activeModule.value.mainKey]
      ? activeModule.value.mainKey
      : sortedTerms.value[0]?.[0],
  )

  const defaultTitle = document.title
  watch(
    activeDefinition,
    (def) => {
      document.title = def
        ? pageTitle(plainText(termTitle(def)), t(activeModule.value.nameKey))
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

  const pathOf = (termKey: string) => glossaryPath(allEntries[termKey]?.modulePrefix, termKey)

  provideGlossaryContext({ entries: allEntries, pathOf })

  return {
    backlinks,
    activeModulePrefix,
    activeTermKey,
    activeModule,
    literatureActive,
    tabs,
    searchQuery,
    pinnedTerm,
    groupedTerms,
    activeDefinition,
    fallbackTermKey,
    redirecting,
    navigate,
    selectModule,
  }
}
