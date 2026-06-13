/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
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
 * along with this program, if not, see <https://www.gnu.org/licenses/>.
 */
import type { InjectionKey } from 'vue'

import type { Publication } from '@/modules/common/tooltip/publications'

/** A plain string (may contain $...$ LaTeX) or a reference to another registry entry rendered as a nested TermTooltip. */
export type TooltipContentPart = string | { ref: string; label?: string }

export interface TooltipDefinition {
  /** Text used as the trigger when this entry is referenced inline from another definition. */
  label: string
  /** Optional bold header line shown at the top of the tooltip panel. */
  title?: string
  content: TooltipContentPart[]
  reference?: Publication
}

export type TooltipRegistry = Record<string, TooltipDefinition>

export const TOOLTIP_REGISTRY_KEY: InjectionKey<TooltipRegistry> = Symbol('tooltipRegistry')
