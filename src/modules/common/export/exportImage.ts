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
// Browsers cap canvas area (Safari at ~16.7M px), so large graphs get a lower PNG scale.
const MAX_CANVAS_AREA = 16_000_000

const fontDataCache = new Map<string, Promise<string>>()

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function fontDataUri(url: string): Promise<string> {
  let cached = fontDataCache.get(url)
  if (cached === undefined) {
    cached = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`Could not load font: ${url}`)
      return response.blob().then(blobToDataUri)
    })
    cached.catch(() => fontDataCache.delete(url))
    fontDataCache.set(url, cached)
  }
  return cached
}

function normalizeFamily(family: string): string {
  return family
    .trim()
    .replace(/^["']|["']$/g, '')
    .toLowerCase()
}

function collectFontFaceRules(rules: CSSRuleList, into: CSSFontFaceRule[]) {
  for (const rule of rules) {
    if (rule instanceof CSSFontFaceRule) into.push(rule)
    else if (rule instanceof CSSImportRule && rule.styleSheet)
      collectFontFaceRules(rule.styleSheet.cssRules, into)
    else if ('cssRules' in rule) collectFontFaceRules(rule.cssRules as CSSRuleList, into)
  }
}

function documentFontFaceRules(): CSSFontFaceRule[] {
  const rules: CSSFontFaceRule[] = []
  for (const sheet of document.styleSheets) {
    try {
      collectFontFaceRules(sheet.cssRules, rules)
    } catch {
      // Cross-origin stylesheets can't be read.
    }
  }
  return rules
}

function parseUnicodeRange(value: string): [number, number][] {
  return value.split(',').map((token) => {
    const range = token.trim().replace(/^u\+/i, '')
    if (range.includes('?')) {
      return [parseInt(range.replace(/\?/g, '0'), 16), parseInt(range.replace(/\?/g, 'F'), 16)]
    }
    const [low = '0', high = low] = range.split('-')
    return [parseInt(low, 16), parseInt(high, 16)]
  })
}

function coversAny(rule: CSSFontFaceRule, codePoints: Set<number>): boolean {
  const unicodeRange = rule.style.getPropertyValue('unicode-range')
  if (!unicodeRange) return true
  const ranges = parseUnicodeRange(unicodeRange)
  for (const codePoint of codePoints) {
    if (ranges.some(([low, high]) => codePoint >= low && codePoint <= high)) return true
  }
  return false
}

async function inlineFontFace(rule: CSSFontFaceRule): Promise<string> {
  const base = rule.parentStyleSheet?.href ?? document.baseURI
  const urls = [...rule.cssText.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)]
  let css = rule.cssText
  for (const [match, url] of urls) {
    if (url!.startsWith('data:')) continue
    css = css.replace(match, `url("${await fontDataUri(new URL(url!, base).href)}")`)
  }
  return css
}

/**
 * Embeds the page's `@font-face` rules for the fonts the SVG uses, limited to the subsets its
 * text needs, so it renders the same outside the app (and when rasterized).
 */
export async function embedFonts(svg: string): Promise<string> {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const root = doc.documentElement
  const families = new Set<string>()
  for (const element of root.querySelectorAll<SVGElement>('[style]')) {
    for (const family of element.style.fontFamily.split(',')) {
      if (family.trim()) families.add(normalizeFamily(family))
    }
  }
  const codePoints = new Set<number>()
  for (const char of root.textContent ?? '') {
    if (char.trim()) codePoints.add(char.codePointAt(0)!)
  }
  if (families.size === 0 || codePoints.size === 0) return svg

  const rules = documentFontFaceRules().filter(
    (rule) =>
      families.has(normalizeFamily(rule.style.getPropertyValue('font-family'))) &&
      coversAny(rule, codePoints),
  )
  if (rules.length === 0) return svg

  const style = doc.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = (await Promise.all(rules.map(inlineFontFace))).join('\n')
  root.insertBefore(style, root.firstChild)
  return new XMLSerializer().serializeToString(doc)
}

/** Draws a standalone SVG onto a canvas and encodes it as PNG at the given scale. */
export async function rasterizeSvg(svg: string, scale: number): Promise<Blob> {
  const image = new Image()
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  await image.decode()
  // Safari may paint before the embedded fonts are ready on the first frame.
  await new Promise(requestAnimationFrame)

  const { naturalWidth: width, naturalHeight: height } = image
  if (!width || !height) throw new Error('SVG has no size.')
  const effectiveScale = Math.min(scale, Math.sqrt(MAX_CANVAS_AREA / (width * height)))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * effectiveScale)
  canvas.height = Math.round(height * effectiveScale)
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('Canvas 2D context unavailable.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed.'))),
      'image/png',
    ),
  )
}
