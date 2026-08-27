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
import type { InjectionKey, Ref } from 'vue'

// The active snap detent of the compact evaluation sheet, provided by EvaluationHost
// and injected by the mobile body to fold the selector row / glossary away at compact.
export type EvaluationDetentLayout = 'compact' | 'standard' | 'full'

export const EVALUATION_DETENT_KEY: InjectionKey<Ref<EvaluationDetentLayout>> =
  Symbol('evaluation-detent')

// Provided (true) by the mobile body so the shared result grid pins its status/copy
// line to the sheet bottom; absent on desktop, where the footer stays in flow.
export const EVALUATION_STICKY_FOOTER_KEY: InjectionKey<boolean> = Symbol(
  'evaluation-sticky-footer',
)
