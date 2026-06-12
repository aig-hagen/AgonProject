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

/** A plain string (may contain $...$ LaTeX) or a reference to another registry entry rendered as a nested TermPopover. */
export type PopoverContentPart = string | { ref: string }

export interface PopoverDefinition {
  /** Text used as the trigger when this entry is referenced inline from another definition. */
  label: string
  /** Optional bold header line shown at the top of the popover panel. */
  title?: string
  content: PopoverContentPart[]
  reference?: { label: string; href: string }
}

export type PopoverRegistry = Record<string, PopoverDefinition>

export const POPOVER_REGISTRY_KEY: InjectionKey<PopoverRegistry> = Symbol('popoverRegistry')
