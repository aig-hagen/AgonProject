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
import { type AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import { type ArgumentData } from '@/modules/common/argumentation/model'
import { getNodePositions } from '@/modules/common/graph-editor/layouting'
import { Layout } from '@/modules/common/main-menu/layouting'

export function layout(argumentation: AbstractArgumentation<ArgumentData>) {
  const nodes = [...argumentation.arguments()].map(([id]) => id)
  const links = [...argumentation.attacks()]
  const nodePositions = getNodePositions(nodes, links, Layout.BottomToTop)
  for (const [argumentId, argumentData] of argumentation.arguments()) {
    const newPosition = nodePositions.get(argumentId)!
    argumentData.x = newPosition.x
    argumentData.y = newPosition.y
  }
}
