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
