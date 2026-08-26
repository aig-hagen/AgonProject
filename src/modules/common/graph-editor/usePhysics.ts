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

import { ARGUMENT_RADIUS_IN_PX } from '@/modules/common/argumentation/model'
import type { DocumentId, DocumentsDB } from '@/modules/common/documents/db'
import { getUIStateValue, setUIStateValue } from '@/modules/common/documents/uiState'
import type { IdMapping } from '@/modules/common/ids'
import type { PhysicsMode } from '@/modules/common/main-menu/types'
import { useSettings } from '@/modules/common/settings/useSettings'

const PHYSICS_MODE_STATE_KEY = 'physics-mode'

interface PhysicsCapable {
  $el: unknown
  toggleNodePhysics(enabled: boolean): void
  getNodePosition(id: number): { x: number; y: number }
  setNodePosition(pos: { x: number; y: number }, a: undefined, id: number): void
  centerView(
    margins: { top: number; right: number; bottom: number; left: number },
    b: undefined,
    maxScale: number,
  ): void
}

export function usePhysics({
  graphComponentRef,
  getIdMapping,
  containerRef,
  documentId,
  db,
}: {
  graphComponentRef: Ref<PhysicsCapable | null>
  getIdMapping: () => IdMapping<number, number>
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

  // Shifts all nodes so their centroid sits at the simulation's centering-force target
  // (clientWidth/2, clientHeight/2), then compensates the zoom/pan transform so that
  // no visual jump occurs. Must be called before enabling physics to prevent the
  // centering force from pulling the entire graph across the canvas.
  function alignNodesToSimulationCenter() {
    const gc = graphComponentRef.value
    if (!gc) return
    const el = gc.$el as HTMLElement
    const graphHost = (el.querySelector('.graph-controller__graph-host') ?? el) as HTMLElement
    const svgCenterX = graphHost.clientWidth / 2
    const svgCenterY = graphHost.clientHeight / 2
    // Iterate idMapping directly so newly created nodes (added to idMapping before
    // triggerSettle fires but not yet reflected in the state prop) are included.
    const idMapping = getIdMapping()
    let sumX = 0,
      sumY = 0,
      count = 0
    for (const internalId of idMapping.inputIds()) {
      const pos = gc.getNodePosition(internalId)
      sumX += pos.x
      sumY += pos.y
      count++
    }
    if (count === 0) return
    const dx = svgCenterX - sumX / count
    const dy = svgCenterY - sumY / count
    for (const internalId of idMapping.inputIds()) {
      const pos = gc.getNodePosition(internalId)
      gc.setNodePosition({ x: pos.x + dx, y: pos.y + dy }, undefined, internalId)
    }
    // Compensate the zoom/pan so nodes remain at the same visual positions.
    const svgEl = containerRef.value?.querySelector('.graph-controller__graph-canvas') as
      | (SVGElement & { __zoom?: { k: number; x: number; y: number } })
      | null
    const g = svgEl?.firstElementChild
    const currentZoom = svgEl?.__zoom
    if (svgEl && g && currentZoom != null) {
      const k = currentZoom.k
      const newTx = currentZoom.x - dx * k
      const newTy = currentZoom.y - dy * k
      const newZoom = Object.create(Object.getPrototypeOf(currentZoom))
      newZoom.k = k
      newZoom.x = newTx
      newZoom.y = newTy
      svgEl.__zoom = newZoom
      g.setAttribute('transform', `translate(${newTx},${newTy}) scale(${k})`)
    }
  }

  function enablePhysics() {
    const gc = graphComponentRef.value!
    alignNodesToSimulationCenter()
    gc.toggleNodePhysics(true)
    const margin = ARGUMENT_RADIUS_IN_PX * 2
    gc.centerView({ top: margin, right: margin, bottom: margin, left: margin }, undefined, 1)
  }

  function disablePhysics() {
    graphComponentRef.value?.toggleNodePhysics(false)
  }

  function triggerSettle() {
    if (physicsMode.value !== 'on') return
    alignNodesToSimulationCenter()
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
    const graphHost = containerRef.value?.querySelector<HTMLElement>(
      '.graph-controller__graph-host',
    )
    if (!graphHost) return

    let nodePointerDown = false
    const handleSettlePointerDown = (event: PointerEvent) => {
      if (physicsMode.value !== 'on') return
      if (event.button !== 0) return // right-click starts edge creation — don't shift coordinates mid-gesture
      if (!(event.target as Element).closest('.graph-controller__node-container')) return
      nodePointerDown = true
      alignNodesToSimulationCenter()
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
    enablePhysics,
    alignNodesToSimulationCenter,
  }
}
