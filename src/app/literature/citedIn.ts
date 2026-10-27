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
import type { GlossaryModule } from '@/app/glossary/useGlossary'
import type { ModuleConfig } from '@/app/home/moduleConfig'
import type { ComplexityTable } from '@/modules/common/complexity/types'
import { blockInlines } from '@/modules/common/glossary/parse'
import type { GlossaryInline } from '@/modules/common/glossary/types'
import type { PrincipleTable } from '@/modules/common/principles/types'
import { publicationKey } from '@/modules/common/publications/lookup'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

export interface CitingTerm {
  modulePrefix: string
  key: string
  definition: TooltipDefinition
}

export interface CitedIn {
  terms: CitingTerm[]
  /** Ids of the modules whose home card lists the publication. */
  modules: string[]
}

function inlineCites(parts: GlossaryInline[]): string[] {
  return parts.flatMap((part) => (typeof part !== 'string' && 'cite' in part ? [part.cite] : []))
}

function bodyCites(def: TooltipDefinition): string[] {
  return (def.body ?? []).flatMap((block) => blockInlines(block).flatMap(inlineCites))
}

/**
 * Publication key → where it is cited: glossary references, `[@KEY]`, complexity and principle
 * cells, cards.
 */
export function citedIn(
  glossaryModules: GlossaryModule[],
  complexityTables: ComplexityTable[],
  principleTables: PrincipleTable[],
  moduleConfigs: readonly Pick<ModuleConfig<object>, 'id' | 'publications'>[],
): Record<string, CitedIn> {
  const index: Record<string, CitedIn> = {}
  const entry = (key: string) => (index[key] ??= { terms: [], modules: [] })
  const termOf: Record<string, CitingTerm> = {}
  for (const { prefix, glossary } of glossaryModules) {
    for (const [key, definition] of Object.entries(glossary)) {
      termOf[key] ??= { modulePrefix: prefix, key, definition }
    }
  }
  const addTerm = (pubKey: string | undefined, termKey: string) => {
    const term = termOf[termKey]
    if (!pubKey || !term) return
    const { terms } = entry(pubKey)
    if (!terms.includes(term)) terms.push(term)
  }

  for (const { glossary } of glossaryModules) {
    for (const [key, def] of Object.entries(glossary)) {
      if (def.reference) addTerm(publicationKey(def.reference), key)
      for (const cite of bodyCites(def)) addTerm(cite, key)
    }
  }
  for (const table of complexityTables) {
    for (const rows of [table.rows, table.variant?.rows ?? {}]) {
      for (const [key, row] of Object.entries(rows)) {
        for (const cell of Object.values(row)) addTerm(publicationKey(cell.source), key)
      }
    }
  }
  for (const table of principleTables) {
    for (const [key, row] of Object.entries(table.rows)) {
      for (const cell of Object.values(row))
        addTerm(cell?.source && publicationKey(cell.source), key)
    }
  }
  for (const module of moduleConfigs) {
    for (const pub of module.publications ?? []) {
      const key = publicationKey(pub)
      if (key && !entry(key).modules.includes(module.id)) entry(key).modules.push(module.id)
    }
  }
  return index
}
