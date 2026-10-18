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
import type { Publication } from '@/modules/common/publications/types'
import type { TooltipContentPart } from '@/modules/common/tooltip/tooltipRegistry'

/** Language-neutral data for one glossary term, kept out of the per-locale Markdown files. */
export interface GlossaryTermMeta {
  reference?: Publication
}

export type GlossaryMeta = Record<string, GlossaryTermMeta>

/** Body text: definition parts plus `[@KEY]` citations of `publications.ts` entries. */
export type GlossaryInline = TooltipContentPart | { cite: string }

export type GlossaryBlock =
  | { kind: 'heading'; level: 2 | 3; content: GlossaryInline[] }
  | { kind: 'paragraph'; content: GlossaryInline[] }
  | { kind: 'list'; items: GlossaryInline[][] }
