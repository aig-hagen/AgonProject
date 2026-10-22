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
import type { PickerOption } from '@/modules/common/forms/PickerSelect.vue'

const MODE_KEYS = {
  enumerate: 'evaluation.modes.enumerate',
  credulous: 'evaluation.modes.credulous',
  skeptical: 'evaluation.modes.skeptical',
} as const

export type EvaluationMode = keyof typeof MODE_KEYS

type Translate = (key: string) => string

export function modeLabel(t: Translate, mode: string): string {
  return t(MODE_KEYS[mode as EvaluationMode] ?? MODE_KEYS.skeptical)
}

export function modeOptions(
  t: Translate,
  modes: readonly EvaluationMode[] = ['enumerate', 'credulous', 'skeptical'],
): PickerOption[] {
  return modes.map((mode) => ({ value: mode, label: t(MODE_KEYS[mode]) }))
}
