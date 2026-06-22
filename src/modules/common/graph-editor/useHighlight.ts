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
import { computed, ref, watchEffect } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { Highlight, GraphEditorState, NodeId } from '@/modules/common/graph-editor/graphEditor'
import type { GraphStyle } from '@/modules/common/graph-editor/graphStyle'
import type { IdMapping } from '@/modules/common/ids'

interface HighlightCapable {
  setColor(color: string, ids: number | number[]): void
}

export function useHighlight({
  graphComponentRef,
  getIdMapping,
  stateRef,
  effectiveStyle,
}: {
  graphComponentRef: Ref<HighlightCapable | null>
  getIdMapping: () => IdMapping<number, number>
  stateRef: Ref<GraphEditorState> | ComputedRef<GraphEditorState>
  effectiveStyle: Ref<GraphStyle> | ComputedRef<GraphStyle>
}) {
  const extensionHighlightRef = ref<Highlight | undefined>(undefined)
  const serialisationHighlightRef = ref<Highlight | undefined>(undefined)
  const highlightToShow = computed(() => extensionHighlightRef.value ?? serialisationHighlightRef.value)

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

    // Apply colors
    for (let i = 0; i < groups.length; i++) {
      graphComponent.setColor(groups[i]!.color, groupBuckets[i]!)
    }
    if (highlight?.attackedByFirst !== undefined) {
      graphComponent.setColor(highlight.attackedByFirst, attackedBucket)
    }
    graphComponent.setColor(effectiveStyle.value.nodeColor, defaultBucket)
  })

  return { extensionHighlightRef, serialisationHighlightRef }
}
