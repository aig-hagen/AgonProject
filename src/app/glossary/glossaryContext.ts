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
import { inject, type InjectionKey, provide } from 'vue'

import {
  TOOLTIP_REGISTRY_KEY,
  type TooltipDefinition,
} from '@/modules/common/tooltip/tooltipRegistry'

/** Every glossary entry across modules: termKey → { definition, modulePrefix }. */
export type GlossaryEntries = Record<
  string,
  { definition: TooltipDefinition; modulePrefix: string }
>

export interface GlossaryContext {
  entries: GlossaryEntries
  /** The glossary page of a term, in whichever module it lives. */
  pathOf: (termKey: string) => string
}

const GLOSSARY_CONTEXT: InjectionKey<GlossaryContext> = Symbol('glossaryContext')

export function termTitle(def: TooltipDefinition): string {
  return def.title ?? def.label
}

/** The name in the term list, which may drop what its group heading already says. */
export function listTitle(def: TooltipDefinition): string {
  return def.short ?? termTitle(def)
}

/** Shares the entries and navigation with every glossary component below, tooltips included. */
export function provideGlossaryContext(context: GlossaryContext) {
  provide(GLOSSARY_CONTEXT, context)
  provide(
    TOOLTIP_REGISTRY_KEY,
    Object.fromEntries(Object.entries(context.entries).map(([k, e]) => [k, e.definition])),
  )
}

export function useGlossaryContext() {
  const context = inject(GLOSSARY_CONTEXT)
  if (!context) throw new Error('useGlossaryContext() called outside a glossary view')
  const { entries } = context
  const titleOf = (key: string) => (entries[key] ? listTitle(entries[key].definition) : key)
  return { ...context, titleOf }
}
