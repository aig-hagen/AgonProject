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

export function computeLabelFontSize(label: string): string {
  const len = label.length
  if (len <= 3) return '1rem'
  if (len <= 5) return '0.8rem'
  if (len <= 8) return '0.65rem'
  if (len <= 12) return '0.55rem'
  return '0.45rem'
}

function findNodeLabelDiv(
  graphEl: Element | null | undefined,
  graphComponentId: string,
  internalId: number,
): HTMLElement | null | undefined {
  const nodeEl = graphEl?.querySelector(`#${CSS.escape(`${graphComponentId}-node-${internalId}`)}`)
  return nodeEl
    ?.closest('.graph-controller__node-container')
    ?.querySelector<HTMLElement>('.graph-controller__node-label, .graph-controller__node-label-placeholder')
}

export function adjustNodeLabelFontSize(
  graphEl: Element | null | undefined,
  graphComponentId: string,
  internalId: number,
  label: string,
): void {
  const labelDiv = findNodeLabelDiv(graphEl, graphComponentId, internalId)
  if (labelDiv) {
    labelDiv.style.fontSize = computeLabelFontSize(label)
  }
}

/**
 * The graph-component library only enters label-edit mode in response to a real
 * `click` on the node's label element (there is no public API for it), so we
 * simulate that click to make a freshly created node's name immediately editable.
 */
export function startNodeLabelEdit(
  graphEl: Element | null | undefined,
  graphComponentId: string,
  internalId: number,
): void {
  const labelDiv = findNodeLabelDiv(graphEl, graphComponentId, internalId)
  labelDiv?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

function hasMoreThanOneEntry<T>(array: T[]): array is [T, T, ...T[]] {
  return array.length > 1
}

export function parseHyperLinkId(hyperLinkId: string): { sourceIds: number[]; targetId: number } {
  const dashIdx = hyperLinkId.lastIndexOf('-')
  const sourcesPart = hyperLinkId.slice(0, dashIdx)
  const targetPart = hyperLinkId.slice(dashIdx + 1)
  const sourceIds = sourcesPart.split(',').map(Number)
  const targetId = parseInt(targetPart)
  if (sourceIds.some((id) => !Number.isSafeInteger(id)))
    throw new Error(`HyperLink with ID \`${hyperLinkId}\` has invalid source IDs.`)
  if (!Number.isSafeInteger(targetId))
    throw new Error(`HyperLink with ID \`${hyperLinkId}\` has invalid target ID ${targetId}.`)
  return { sourceIds, targetId }
}

export function parseLinkId(linkId: string): { sourceId: number; targetId: number } {
  const linkParts = linkId.split('-')
  if (!hasMoreThanOneEntry(linkParts)) {
    throw new Error(`Link with ID \`${linkId}\` is not valid: Separator \`-\` is not contained.`)
  }
  if (linkParts.length > 2) {
    throw new Error(
      `Link with ID \`${linkId}\` is not valid: Separator \`-\` is contained more than once.`,
    )
  }
  const sourceId = parseInt(linkParts[0])
  const targetId = parseInt(linkParts[1])
  if (!Number.isSafeInteger(sourceId))
    throw new Error(`Link with ID \`${linkId}\` is not valid: Invalid source node ID ${sourceId}.`)
  if (!Number.isSafeInteger(targetId))
    throw new Error(`Link with ID \`${linkId}\` is not valid: Invalid target node ID ${targetId}.`)
  return { sourceId, targetId }
}
