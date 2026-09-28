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
import { applyGraphLayout, type LayoutGraph } from '@/modules/common/graph-editor/layouting'
import { Layout } from '@/modules/common/main-menu/layouting'
import {
  type PafArgumentData,
  type ProbabilisticArgumentation,
} from '@/modules/probabilistic-argumentation/model'

// Probabilities are drawn below each argument, so they take part in the layout.
export function toLayoutGraph(paf: ProbabilisticArgumentation<PafArgumentData>): LayoutGraph {
  return {
    nodes: [...paf.arguments()].map(([id, { name, probability }]) => ({
      id,
      label: name,
      annotation: probability.toFixed(2),
    })),
    edges: [...paf.attacks()].map(([source, target]) => ({ sources: [source], target })),
  }
}

export function layout(
  paf: ProbabilisticArgumentation<PafArgumentData>,
  layoutType: Layout = Layout.Circular,
): Promise<void> {
  return applyGraphLayout(toLayoutGraph(paf), layoutType, (id, position) =>
    Object.assign(paf.getArgument(id), position),
  )
}
