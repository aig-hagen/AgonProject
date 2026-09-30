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
import type { Component } from 'vue'

import { i18n } from '@/localization'
import AfViewIcon from '@/modules/assumption-based-argumentation/views/AfViewIcon.vue'
import type { AbaView } from '@/modules/assumption-based-argumentation/views/editorState'
import SetAfViewIcon from '@/modules/assumption-based-argumentation/views/SetAfViewIcon.vue'
import TheoryViewIcon from '@/modules/assumption-based-argumentation/views/TheoryViewIcon.vue'

export interface ViewOption {
  key: AbaView
  label: string
  icon: Component
  description: string
  flatOnly: boolean
}

// The third slot is the SETAF for flat theories and the BSAF otherwise (a flat BSAF is a SETAF).
export function viewOptions(flat: boolean): ViewOption[] {
  const t = i18n.global.t
  return [
    {
      key: 'theory',
      label: t('editor.aba.theory.title'),
      icon: TheoryViewIcon,
      description: t('editor.aba.views.theoryDescription'),
      flatOnly: false,
    },
    {
      key: 'af',
      label: 'AF',
      icon: AfViewIcon,
      description: t('editor.aba.views.afDescription'),
      flatOnly: true,
    },
    {
      key: 'setaf',
      label: flat ? 'SetAF' : 'BSAF',
      icon: SetAfViewIcon,
      description: t(
        flat ? 'editor.aba.views.setafDescription' : 'editor.aba.views.bsafDescription',
      ),
      flatOnly: false,
    },
  ]
}

export function flatOnlyReason(): string {
  return i18n.global.t('editor.aba.views.flatOnly')
}
