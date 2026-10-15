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
import { contrastRatio, parseRgb } from '@/modules/common/theme/colorMath'
import { GRAPH_LABEL_INKS, type GraphColorScheme } from '@/modules/common/theme/palette'

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
    ?.querySelector<HTMLElement>(
      '.graph-controller__node-label, .graph-controller__node-label-placeholder',
    )
}

/**
 * Node labels are HTML divs whose text color follows the theme (white in dark
 * mode). When a highlight paints the node a light pastel, white text becomes
 * unreadable — so we override the label color to contrast with the given
 * background. Pass an empty string to clear the override and fall back to the
 * theme color.
 */
export function setNodeLabelColor(
  graphEl: Element | null | undefined,
  graphComponentId: string,
  internalId: number,
  color: string,
): void {
  const labelDiv = findNodeLabelDiv(graphEl, graphComponentId, internalId)
  if (labelDiv) {
    labelDiv.style.color = color
  }
}

export type ColorTheme = 'light' | 'dark'

const resolvedColors = new Map<string, string>()

/**
 * Resolve a CSS color that may reference palette tokens (`var(...)` / `color-mix(...)`) to a
 * hex/rgba color the graph library can parse. The probe carries its own `data-theme` and
 * `data-graph-colors`, so the result doesn't depend on when the document's attributes flip.
 * Plain colors pass through.
 */
export function resolveCssColor(
  value: string,
  theme: ColorTheme,
  scheme: GraphColorScheme = 'default',
): string {
  if (typeof document === 'undefined') return value
  if (!value.includes('var(') && !value.includes('color-mix')) return value
  const key = `${theme}|${scheme}|${value}`
  const cached = resolvedColors.get(key)
  if (cached !== undefined) return cached
  const probe = document.createElement('span')
  probe.dataset.theme = theme
  probe.dataset.graphColors = scheme
  probe.style.color = value
  probe.style.position = 'absolute'
  probe.style.pointerEvents = 'none'
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe).color
  probe.remove()
  const resolved = normalizeColor(computed) || value
  resolvedColors.set(key, resolved)
  return resolved
}

// Browsers may serialize mixes as `oklab(...)` or `color(srgb ...)`; a canvas pixel turns any
// of them into plain channels.
function normalizeColor(color: string): string {
  if (!color || parseRgb(color)) return color
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!ctx) return color
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data as unknown as [
    number,
    number,
    number,
    number,
  ]
  if (a === 255) return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
  return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`
}

/** The palette's dark or light label ink, whichever contrasts more with `background` (hex or rgb). */
export function getContrastingLabelColor(background: string): string {
  const bg = parseRgb(background)
  if (!bg) return ''
  const dark = contrastRatio(bg, parseRgb(GRAPH_LABEL_INKS.dark)!)
  const light = contrastRatio(bg, parseRgb(GRAPH_LABEL_INKS.light)!)
  return dark >= light ? GRAPH_LABEL_INKS.dark : GRAPH_LABEL_INKS.light
}

export function adjustNodeLabelFontSize(
  graphEl: Element | null | undefined,
  graphComponentId: string,
  internalId: number,
  label: string,
  fontSize = computeLabelFontSize(label),
): void {
  const labelDiv = findNodeLabelDiv(graphEl, graphComponentId, internalId)
  if (labelDiv) {
    labelDiv.style.fontSize = fontSize
  }
}

function hasMoreThanOneEntry<T>(array: T[]): array is [T, T, ...T[]] {
  return array.length > 1
}

/** Parses a library hyperlink id `s1,s2-target`, or `s1,s2-target:kind` for one with a kind. */
export function parseHyperLinkId(hyperLinkId: string): {
  sourceIds: number[]
  targetId: number
  kind?: string
} {
  const kindIndex = hyperLinkId.indexOf(':')
  const kind = kindIndex === -1 ? undefined : hyperLinkId.slice(kindIndex + 1)
  const ends = kindIndex === -1 ? hyperLinkId : hyperLinkId.slice(0, kindIndex)
  const dashIdx = ends.lastIndexOf('-')
  const sourcesPart = ends.slice(0, dashIdx)
  const targetPart = ends.slice(dashIdx + 1)
  const sourceIds = sourcesPart.split(',').map(Number)
  const targetId = parseInt(targetPart)
  if (sourceIds.some((id) => !Number.isSafeInteger(id)))
    throw new Error(`HyperLink with ID \`${hyperLinkId}\` has invalid source IDs.`)
  if (!Number.isSafeInteger(targetId))
    throw new Error(`HyperLink with ID \`${hyperLinkId}\` has invalid target ID ${targetId}.`)
  return kind === undefined ? { sourceIds, targetId } : { sourceIds, targetId, kind }
}

/** Parses a library link id `source-target`, or `source-target:kind` for a link with a kind. */
export function parseLinkId(linkId: string): { sourceId: number; targetId: number; kind?: string } {
  const kindIndex = linkId.indexOf(':')
  const kind = kindIndex === -1 ? undefined : linkId.slice(kindIndex + 1)
  const linkParts = (kindIndex === -1 ? linkId : linkId.slice(0, kindIndex)).split('-')
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
  return kind === undefined ? { sourceId, targetId } : { sourceId, targetId, kind }
}
