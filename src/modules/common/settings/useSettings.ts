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
import { useStorage } from '@vueuse/core'
import { createSharedComposable } from '@vueuse/shared'

import type { GridVisibility, PhysicsMode } from '@/modules/common/main-menu/types'
import { notifyStorageFailureOnce } from '@/modules/common/notifications/storageFailure'

export type GraphStyleName = 'default' | 'high-contrast' | 'minimal' | 'library'
export type GridType = 'square' | 'rhombus'

export const useSettings = createSharedComposable(() => {
  const options = { onError: notifyStorageFailureOnce }
  const graphStyle = useStorage<GraphStyleName>(
    'settings:graphStyle',
    'default',
    undefined,
    options,
  )
  const defaultPhysicsMode = useStorage<PhysicsMode>(
    'settings:defaultPhysicsMode',
    'off',
    undefined,
    options,
  )
  if ((defaultPhysicsMode.value as string) === 'settle') defaultPhysicsMode.value = 'on'
  const defaultShowGrid = useStorage<GridVisibility>(
    'settings:defaultGridVisibility',
    'off',
    undefined,
    options,
  )
  const defaultGridType = useStorage<GridType>(
    'settings:defaultGridType',
    'rhombus',
    undefined,
    options,
  )
  const gridCellScale = useStorage<number>('settings:gridCellScale', 3, undefined, options)
  const snapMode = useStorage<boolean>('settings:snapMode', false, undefined, options)
  const showHints = useStorage<boolean>('settings:showHints', true, undefined, options)

  return {
    graphStyle,
    defaultPhysicsMode,
    defaultShowGrid,
    defaultGridType,
    gridCellScale,
    snapMode,
    showHints,
  }
})
