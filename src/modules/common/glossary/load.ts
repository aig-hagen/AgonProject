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
import { shallowReactive } from 'vue'

import { parseGlossaryEntry } from '@/modules/common/glossary/parse'
import type { TooltipDefinition, TooltipRegistry } from '@/modules/common/tooltip/tooltipRegistry'

/** File path → raw Markdown, as returned by an eager `import.meta.glob(…, { query: '?raw' })`. */
export type GlossarySources = Record<string, string>

/** File path → loader, as returned by a lazy `import.meta.glob` over the non-English folders. */
export type LazyGlossarySources = Record<string, () => Promise<string>>

const SOURCE_LOCALE = 'en'

export function termKeyFromPath(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1).replace(/\.md$/, '')
}

/** The locale folder a term file sits in (`…/glossary/de/ADM.md` → `de`). */
export function localeFromPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 2]!
}

export function buildRegistry(sources: GlossarySources): TooltipRegistry {
  const registry: TooltipRegistry = {}
  for (const [path, source] of Object.entries(sources)) {
    const key = termKeyFromPath(path)
    try {
      registry[key] = parseGlossaryEntry(source)
    } catch (error) {
      throw new Error(`${path}: ${(error as Error).message}`)
    }
  }
  return registry
}

interface LocalizedGlossary {
  english: TooltipRegistry
  translations: LazyGlossarySources
  registry: TooltipRegistry
}

const glossaries: LocalizedGlossary[] = []
let activeLocale = SOURCE_LOCALE

// Entries change in place, so registries spread into a merged one (`{ ...af, ...baf }`) follow too.
function replaceEntry(target: TooltipDefinition, next: TooltipDefinition) {
  for (const field of Object.keys(target)) {
    if (!(field in next)) delete target[field as keyof TooltipDefinition]
  }
  Object.assign(target, next)
}

async function localize(glossary: LocalizedGlossary, locale: string) {
  const files = Object.entries(glossary.translations).filter(([p]) => localeFromPath(p) === locale)
  const sources = await Promise.all(files.map(async ([p, load]) => [p, await load()] as const))
  if (locale !== activeLocale) return
  const translated = buildRegistry(Object.fromEntries(sources))
  for (const [key, english] of Object.entries(glossary.english)) {
    const translation = translated[key]
    // The reference is language-neutral, so translations needn't repeat it.
    if (translation && !translation.reference && english.reference)
      translation.reference = english.reference
    replaceEntry(glossary.registry[key]!, translation ?? english)
  }
}

/**
 * A reactive registry in the active glossary locale. English is bundled; other locales load on
 * demand and fall back to English per term.
 */
export function createGlossary(
  english: GlossarySources,
  translations: LazyGlossarySources = {},
): TooltipRegistry {
  const base = buildRegistry(english)
  // Shallow, so `reference` stays the publication object that identity lookups expect.
  const registry: TooltipRegistry = Object.fromEntries(
    Object.entries(base).map(([key, def]) => [key, shallowReactive({ ...def })]),
  )
  const glossary = { english: base, translations, registry }
  glossaries.push(glossary)
  if (activeLocale !== SOURCE_LOCALE) void localize(glossary, activeLocale)
  return registry
}

/** Switches every glossary registry to `locale`, resolving once all translations are loaded. */
export async function setGlossaryLocale(locale: string): Promise<void> {
  activeLocale = locale
  await Promise.all(glossaries.map((glossary) => localize(glossary, locale)))
}
