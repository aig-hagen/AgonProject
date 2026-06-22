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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { ARGUMENT_RADIUS_IN_PX } from '@/modules/common/argumentation/model'

export function useGridOverlay(
  containerRef: Ref<HTMLDivElement | null>,
  graphComponentId: string,
) {
  const showGrid = ref<boolean>(false)
  let gridRectEl: SVGRectElement | null = null
  let gridDefsEl: SVGDefsElement | null = null

  function injectGrid(zoomGroup: SVGGElement): void {
    const ns = 'http://www.w3.org/2000/svg'
    const cellSize = ARGUMENT_RADIUS_IN_PX * 2

    const defs = document.createElementNS(ns, 'defs')
    const pattern = document.createElementNS(ns, 'pattern')
    pattern.setAttribute('id', `${graphComponentId}-grid`)
    pattern.setAttribute('width', String(cellSize))
    pattern.setAttribute('height', String(cellSize))
    pattern.setAttribute('patternUnits', 'userSpaceOnUse')
    const path = document.createElementNS(ns, 'path')
    path.setAttribute('d', `M ${cellSize} 0 L 0 0 0 ${cellSize}`)
    path.setAttribute('fill', 'none')
    path.setAttribute('vector-effect', 'non-scaling-stroke')
    path.style.stroke = 'var(--color-base-300)'
    path.style.strokeWidth = '1'
    pattern.appendChild(path)
    defs.appendChild(pattern)

    const rect = document.createElementNS(ns, 'rect')
    rect.setAttribute('x', '-10000')
    rect.setAttribute('y', '-10000')
    rect.setAttribute('width', '20000')
    rect.setAttribute('height', '20000')
    rect.setAttribute('fill', `url(#${graphComponentId}-grid)`)

    // Inject inside the zoom group so the grid is transformed by D3 automatically.
    // This means no patternTransform tracking is needed.
    zoomGroup.insertBefore(rect, zoomGroup.firstChild)
    zoomGroup.insertBefore(defs, rect)
    gridDefsEl = defs
    gridRectEl = rect
  }

  function removeGrid(): void {
    gridDefsEl?.remove()
    gridRectEl?.remove()
    gridDefsEl = null
    gridRectEl = null
  }

  watch(showGrid, (show) => {
    const zoomGroup = containerRef.value?.querySelector(
      '.graph-controller__graph-canvas > g',
    ) as SVGGElement | null
    if (!zoomGroup) return
    if (show) injectGrid(zoomGroup)
    else removeGrid()
  })

  onUnmounted(() => removeGrid())

  return { showGrid, injectGrid, removeGrid }
}
