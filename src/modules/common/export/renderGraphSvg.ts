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
// Serializes the live graph-component canvas (`.graph-controller__graph-canvas`) into a
// standalone, self-contained SVG string that matches what's on screen (WYSIWYG). Unlike the
// LaTeX/TikZ export, this needs no WebAssembly, so it works on any device including phones.
//
// The canvas relies on stylesheet rules and CSS custom properties for its colours, so a bare
// clone would come out unstyled. We therefore walk the live tree and the clone in lockstep and
// copy a whitelist of *computed* presentation styles inline. Editor-only chrome (grid, hit
// boxes, drag previews, the rename input) is dropped, and the pan/zoom transform is reset to a
// tight viewBox around the graph content.
const SVG_NS = 'http://www.w3.org/2000/svg'
const XMLNS_NS = 'http://www.w3.org/2000/xmlns/'

// Presentation properties worth inlining. Kept deliberately small: enough to reproduce the
// look, not so much that the output balloons with irrelevant layout properties.
const INLINED_STYLE_PROPERTIES = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-anchor',
  'dominant-baseline',
  'text-align',
  'transform',
  'transform-origin',
  'transform-box',
]

// Editor-only elements that shouldn't appear in an exported figure. Matched by class substring.
const CHROME_CLASS_FRAGMENTS = [
  'grid-line',
  'grid-background',
  'click-box',
  'drag-preview',
  'label-input',
  'controls-overview',
  'info-text',
  'placeholder',
  'draggable',
]

function isChrome(element: Element): boolean {
  const className =
    typeof element.className === 'string'
      ? element.className
      : ((element.getAttribute('class') ?? '') as string)
  if (CHROME_CLASS_FRAGMENTS.some((fragment) => className.includes(fragment))) return true
  // The library hides transient helpers with a `hidden` class rather than removing them.
  return className.split(/\s+/).includes('hidden')
}

function inlineComputedStyle(live: Element, clone: Element): void {
  const computed = window.getComputedStyle(live)
  let inlineStyle = ''
  for (const property of INLINED_STYLE_PROPERTIES) {
    const value = computed.getPropertyValue(property)
    if (value && value !== 'none' && value !== 'normal') {
      inlineStyle += `${property}:${value};`
    }
  }
  if (inlineStyle) {
    const existing = clone.getAttribute('style')
    clone.setAttribute('style', existing ? `${existing};${inlineStyle}` : inlineStyle)
  }
}

// Single aligned pass over the live tree and its clone: drop editor-only chrome from the clone
// and inline computed styles onto everything that survives. Doing both in one walk keeps the
// index pairing valid — removing a clone child here mirrors skipping its live counterpart, so
// the two trees stay in step as we recurse.
function cleanAndStyle(live: Element, clone: Element): void {
  inlineComputedStyle(live, clone)
  // Snapshot to arrays so removing a clone child below doesn't shift the live collection we're
  // iterating (both `children` are live HTMLCollections).
  const liveChildren = [...live.children]
  const cloneChildren = [...clone.children]
  for (let i = 0; i < liveChildren.length; i++) {
    const liveChild = liveChildren[i]
    const cloneChild = cloneChildren[i]
    if (!liveChild || !cloneChild) continue
    if (isChrome(liveChild)) {
      cloneChild.remove()
      continue
    }
    cleanAndStyle(liveChild, cloneChild)
  }
}

export function serializeGraphSvg(canvas: SVGSVGElement): string {
  const clone = canvas.cloneNode(true) as SVGSVGElement

  cleanAndStyle(canvas, clone)

  // Reset the on-screen pan/zoom so the export shows the whole graph rather than the current
  // viewport.
  const cloneGroup = clone.querySelector(':scope > g') as SVGGElement | null
  if (cloneGroup) {
    cloneGroup.removeAttribute('transform')
    cloneGroup.style.removeProperty('transform')
  }

  // Strip properties that only matter for the on-screen widget.
  clone.removeAttribute('style')
  clone.removeAttribute('class')
  clone.style.removeProperty('background-color')
  clone.setAttributeNS(XMLNS_NS, 'xmlns', SVG_NS)
  clone.setAttributeNS(XMLNS_NS, 'xmlns:xlink', 'http://www.w3.org/1999/xlink')

  // Crop tightly to the graph. We measure the box off a throwaway copy that has every
  // `foreignObject` stripped: node/link labels are rendered as off-SVG HTML, and the library
  // parks each empty link-label container far off-screen (e.g. -452,-355), which would blow the
  // bounding box up into wide white margins. The remaining geometry — circles, link paths,
  // arrowheads — already bounds the labels, so a pure-geometry box is both tight and correct.
  if (cloneGroup) {
    const box = measureContentBox(clone)
    if (box) {
      const margin = 16
      const width = box.width + 2 * margin
      const height = box.height + 2 * margin
      clone.setAttribute('viewBox', `${box.x - margin} ${box.y - margin} ${width} ${height}`)
      clone.setAttribute('width', `${Math.round(width)}`)
      clone.setAttribute('height', `${Math.round(height)}`)
    }
  }

  return new XMLSerializer().serializeToString(clone)
}

// Returns the bounding box of the graph's drawn geometry, or null if it can't be measured.
// getBBox needs the element laid out, so the measurement copy is attached off-screen briefly.
function measureContentBox(cleanedClone: SVGSVGElement): DOMRect | null {
  const measureSvg = cleanedClone.cloneNode(true) as SVGSVGElement
  for (const foreignObject of measureSvg.querySelectorAll('foreignObject')) foreignObject.remove()
  const measureGroup = measureSvg.querySelector(':scope > g') as SVGGElement | null
  if (!measureGroup) return null

  measureSvg.style.position = 'absolute'
  measureSvg.style.left = '-99999px'
  measureSvg.style.top = '-99999px'
  measureSvg.style.visibility = 'hidden'
  document.body.append(measureSvg)
  try {
    return measureGroup.getBBox()
  } finally {
    measureSvg.remove()
  }
}
