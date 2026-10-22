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
import { type RemovableRef, useStorage } from '@vueuse/core'
import { createSharedComposable } from '@vueuse/shared'

import { LATEX_STYLE_CHOICES, LATEX_STYLE_DEFAULTS } from '@/modules/common/argumentation/export'
import { notifyStorageFailureOnce } from '@/modules/common/notifications/storageFailure'

import type { NodeLabelMode } from '.'

export type ImageFormat = 'svg' | 'png'
export const IMAGE_FORMATS: ImageFormat[] = ['svg', 'png']
export const IMAGE_SCALES = [1, 2, 3]

const NODE_DISTANCE_RANGE = { min: 0.5, max: 4 }

/** Last-used export options, shared by the LaTeX studio, the mobile sheet and the image panel. */
export const useExportPreferences = createSharedComposable(() => {
  const options = { onError: notifyStorageFailureOnce }

  // Falls back to the default when a stored value is no longer a valid choice.
  function choice<T extends string | number>(
    key: string,
    fallback: T,
    allowed: readonly T[],
  ): RemovableRef<T> {
    const stored = useStorage<T>(`export:${key}`, fallback, undefined, options)
    if (!allowed.includes(stored.value)) stored.value = fallback
    return stored
  }

  const argumentStyle = choice<string>(
    'latex:argumentStyle',
    LATEX_STYLE_DEFAULTS.argumentStyle,
    LATEX_STYLE_CHOICES.argumentStyle,
  )
  const nameStyle = choice<string>(
    'latex:nameStyle',
    LATEX_STYLE_DEFAULTS.nameStyle,
    LATEX_STYLE_CHOICES.nameStyle,
  )
  const attackStyle = choice<string>(
    'latex:attackStyle',
    LATEX_STYLE_DEFAULTS.attackStyle,
    LATEX_STYLE_CHOICES.attackStyle,
  )
  const supportStyle = choice<string>(
    'latex:supportStyle',
    LATEX_STYLE_DEFAULTS.supportStyle,
    LATEX_STYLE_CHOICES.supportStyle,
  )
  const nodeLabels = choice<NodeLabelMode>(
    'latex:nodeLabels',
    LATEX_STYLE_DEFAULTS.nodeLabels,
    LATEX_STYLE_CHOICES.nodeLabels,
  )
  const nodeDistance = useStorage<number>(
    'export:latex:nodeDistance',
    LATEX_STYLE_DEFAULTS.nodeDistance,
    undefined,
    options,
  )
  if (
    !(
      nodeDistance.value >= NODE_DISTANCE_RANGE.min && nodeDistance.value <= NODE_DISTANCE_RANGE.max
    )
  ) {
    nodeDistance.value = LATEX_STYLE_DEFAULTS.nodeDistance
  }

  const imageFormat = choice<ImageFormat>('image:format', 'svg', IMAGE_FORMATS)
  const imageScale = choice<number>('image:scale', 2, IMAGE_SCALES)
  const imageTransparent = useStorage<boolean>('export:image:transparent', true, undefined, options)

  return {
    argumentStyle,
    nameStyle,
    attackStyle,
    supportStyle,
    nodeLabels,
    nodeDistance,
    imageFormat,
    imageScale,
    imageTransparent,
  }
})
