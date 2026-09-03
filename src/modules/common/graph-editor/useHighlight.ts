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
import type { ComputedRef, Ref } from 'vue'
import { computed, ref, watchEffect } from 'vue'

import type { GraphEditorState, Highlight, NodeId } from '@/modules/common/graph-editor/graphEditor'
import {
  getContrastingLabelColor,
  setNodeLabelColor,
} from '@/modules/common/graph-editor/graphEditorUtils'
import type { GraphStyle } from '@/modules/common/graph-editor/graphStyle'
import type { IdMapping } from '@/modules/common/ids'

interface HighlightCapable {
  setColor(color: string, ids: number | number[]): void
  $el?: Element
}

export function useHighlight({
  graphComponentRef,
  graphComponentId,
  getIdMapping,
  stateRef,
  effectiveStyle,
}: {
  graphComponentRef: Ref<HighlightCapable | null>
  graphComponentId: string
  getIdMapping: () => IdMapping<number, number>
  stateRef: Ref<GraphEditorState> | ComputedRef<GraphEditorState>
  effectiveStyle: Ref<GraphStyle> | ComputedRef<GraphStyle>
}) {
  const extensionHighlightRef = ref<Highlight | undefined>(undefined)
  const serialisationHighlightRef = ref<Highlight | undefined>(undefined)
  const highlightToShow = computed(
    () => extensionHighlightRef.value ?? serialisationHighlightRef.value,
  )

  watchEffect(() => {
    const graphComponent = graphComponentRef.value
    if (graphComponent === null) return

    const highlight = highlightToShow.value
    const groups = highlight?.groups ?? []
    const state = stateRef.value
    const idMapping = getIdMapping()

    // Collect all nodes explicitly covered by a group
    const coveredNodes = new Set<NodeId>()
    for (const group of groups) {
      for (const id of group.nodes) coveredNodes.add(id)
    }

    // Compute nodes attacked by the first group (if requested)
    const attackedNodes = new Set<NodeId>()
    if (highlight?.attackedByFirst !== undefined && groups.length > 0) {
      const firstNodes = groups[0]!.nodes
      for (const link of state.links) {
        if (firstNodes.has(link.sourceId) && !coveredNodes.has(link.targetId)) {
          attackedNodes.add(link.targetId)
        }
      }
    }

    // Categorize all graph nodes into their output buckets
    const groupBuckets: number[][] = groups.map(() => [])
    const attackedBucket: number[] = []
    const defaultBucket: number[] = []
    for (const { id } of state.nodes) {
      if (!idMapping.hasReverse(id)) continue
      const internalId = idMapping.getOrFailReverse(id)
      let placed = false
      for (let i = 0; i < groups.length; i++) {
        if (groups[i]!.nodes.has(id)) {
          groupBuckets[i]!.push(internalId)
          placed = true
          break
        }
      }
      if (!placed) {
        if (attackedNodes.has(id)) attackedBucket.push(internalId)
        else defaultBucket.push(internalId)
      }
    }

    // Apply colors, and give each node a label color that contrasts with its
    // background so white-on-pastel highlights stay readable in dark mode.
    const graphEl = graphComponent.$el
    const applyColors = (color: string, ids: number[]) => {
      graphComponent.setColor(color, ids)
      const labelColor = getContrastingLabelColor(color)
      for (const id of ids) setNodeLabelColor(graphEl, graphComponentId, id, labelColor)
    }
    for (let i = 0; i < groups.length; i++) {
      applyColors(groups[i]!.color, groupBuckets[i]!)
    }
    if (highlight?.attackedByFirst !== undefined) {
      applyColors(highlight.attackedByFirst, attackedBucket)
    }
    // Reset the default bucket's label color to inherit the theme color.
    graphComponent.setColor(effectiveStyle.value.nodeColor, defaultBucket)
    for (const id of defaultBucket) setNodeLabelColor(graphEl, graphComponentId, id, '')
  })

  return { extensionHighlightRef, serialisationHighlightRef }
}
