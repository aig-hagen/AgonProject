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
import { useElementVisibility } from '@vueuse/core'
import type { IDBPDatabase } from 'idb'
import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'

import type { DocumentId, DocumentsDB } from '@/modules/common/documents/db'
import { getUIStateValue, setUIStateValue } from '@/modules/common/documents/uiState'
import type { PhysicsMode } from '@/modules/common/main-menu/types'
import { useSettings } from '@/modules/common/settings/useSettings'

const PHYSICS_MODE_STATE_KEY = 'physics-mode'

interface PhysicsCapable {
  getHostElement(): HTMLDivElement | null
  toggleNodePhysics(enabled: boolean): void
}

export function usePhysics({
  graphComponentRef,
  containerRef,
  documentId,
  db,
}: {
  graphComponentRef: Ref<PhysicsCapable | null>
  containerRef: Ref<HTMLDivElement | null>
  documentId?: DocumentId
  db?: IDBPDatabase<DocumentsDB>
}) {
  const { defaultPhysicsMode } = useSettings()
  const physicsMode = ref<PhysicsMode>(defaultPhysicsMode.value)
  let settleTimerId: ReturnType<typeof setTimeout> | null = null
  let settlePointerCleanup: (() => void) | undefined

  if (db && documentId !== undefined) {
    void getUIStateValue<PhysicsMode>(db, documentId, PHYSICS_MODE_STATE_KEY).then((stored) => {
      if (stored !== undefined) physicsMode.value = stored
    })
  }

  function persistPhysicsMode(mode: PhysicsMode) {
    if (db && documentId !== undefined) {
      void setUIStateValue(db, documentId, PHYSICS_MODE_STATE_KEY, mode)
    }
  }

  function disablePhysics() {
    graphComponentRef.value?.toggleNodePhysics(false)
  }

  function triggerSettle() {
    if (physicsMode.value !== 'on') return
    graphComponentRef.value?.toggleNodePhysics(true)
    if (settleTimerId !== null) clearTimeout(settleTimerId)
    settleTimerId = setTimeout(() => {
      settleTimerId = null
      if (physicsMode.value === 'on') disablePhysics()
    }, 500)
  }

  function toggleNodePhysics() {
    if (physicsMode.value === 'off') {
      physicsMode.value = 'on'
    } else {
      if (settleTimerId !== null) {
        clearTimeout(settleTimerId)
        settleTimerId = null
      }
      physicsMode.value = 'off'
      disablePhysics()
    }
    persistPhysicsMode(physicsMode.value)
  }

  watch(defaultPhysicsMode, (mode) => {
    if (settleTimerId !== null) {
      clearTimeout(settleTimerId)
      settleTimerId = null
    }
    disablePhysics()
    physicsMode.value = mode
  })

  const isTabVisible = useElementVisibility(containerRef)
  watch(isTabVisible, (visible) => {
    if (!visible) {
      if (settleTimerId !== null) {
        clearTimeout(settleTimerId)
        settleTimerId = null
      }
      disablePhysics()
      // Preserve physicsMode so it can be restored when the tab is shown again
    }
    // 'on' (settle) is interaction-triggered — no restart needed when tab becomes visible
  })

  onMounted(() => {
    const graphHost = graphComponentRef.value?.getHostElement()
    if (!graphHost) return

    let nodePointerDown = false
    const handleSettlePointerDown = (event: PointerEvent) => {
      if (physicsMode.value !== 'on') return
      if (event.button !== 0) return // right-click starts edge creation — don't move nodes mid-gesture
      if (!(event.target as Element).closest('.graph-controller__node-container')) return
      nodePointerDown = true
      graphComponentRef.value?.toggleNodePhysics(true)
      if (settleTimerId !== null) {
        clearTimeout(settleTimerId)
        settleTimerId = null
      }
    }
    const handleSettlePointerUp = () => {
      if (!nodePointerDown) return
      nodePointerDown = false
      if (physicsMode.value === 'on') triggerSettle()
    }

    graphHost.addEventListener('pointerdown', handleSettlePointerDown, true)
    graphHost.addEventListener('pointerup', handleSettlePointerUp, true)
    graphHost.addEventListener('pointercancel', handleSettlePointerUp, true)
    settlePointerCleanup = () => {
      graphHost.removeEventListener('pointerdown', handleSettlePointerDown, true)
      graphHost.removeEventListener('pointerup', handleSettlePointerUp, true)
      graphHost.removeEventListener('pointercancel', handleSettlePointerUp, true)
    }
  })

  onUnmounted(() => {
    settlePointerCleanup?.()
    if (settleTimerId !== null) clearTimeout(settleTimerId)
  })

  return {
    physicsMode,
    toggleNodePhysics,
    triggerSettle,
    disablePhysics,
  }
}
