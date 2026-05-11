import { QueryClient } from '@tanstack/vue-query'
import { Font, parse as parseOpentypeFont } from 'opentype.js'

const RENDER_SVG_CONTAINER_ID = 'render-svg-container'
const RENDER_SVG_CONTAINER = document.getElementById(RENDER_SVG_CONTAINER_ID)
if (RENDER_SVG_CONTAINER === null) {
  throw new Error('Could not find rendering container.')
}
const RESOLVE_SVG_FUNCTION_NAME = 'resolveSvg'

interface Wawoff2Module {
  decompress(x: Uint8Array<ArrayBuffer>): number
}

declare global {
  interface Window {
    Module?: Wawoff2Module
  }
}

// `wawoff2` needs to be loaded differently then other modules.
// See https://github.com/opentypejs/opentype.js#loading-a-woffotfttf-font
// We need to load wawoff2 if needed and also wait for it to be ready.
let wawoff2Promise: Promise<Wawoff2Module>
if (!window.Module) {
  wawoff2Promise = new Promise<Wawoff2Module>((resolve) => {
    // @ts-expect-error `onRuntimeInitialized` is part of the unconventional loading mechanism.
    window.Module = { onRuntimeInitialized: () => resolve(window.Module) }
    const script = document.createElement('script')
    script.src = 'node_modules/wawoff2/build/decompress_binding.js'
    document.body.append(script)
  })
} else {
  wawoff2Promise = Promise.resolve(window.Module as Wawoff2Module)
}

async function decompressWoff2Font(fontData: ArrayBuffer) {
  const wawoff2 = await wawoff2Promise
  return await wawoff2.decompress(new Uint8Array(fontData))
}

const fontQueryCleint = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
})

async function queryFont(fontFamily: string): Promise<Font> {
  const fontData = await fetch(`/node_modules/@drgrice1/tikzjax/dist/fonts/${fontFamily}.woff2`)
  if (!fontData.ok) {
    throw Error('Could not load font family: ' + fontFamily)
  }
  const fontDataArrayBuffer = await fontData.arrayBuffer()
  const fontDataDecomporessed = await decompressWoff2Font(fontDataArrayBuffer)
  return await parseOpentypeFont(fontDataDecomporessed)
}

async function queryFontCached(fontFamily: string) {
  return await fontQueryCleint.fetchQuery({
    queryKey: [fontFamily],
    queryFn: () => queryFont(fontFamily),
  })
}

RENDER_SVG_CONTAINER.style.display = 'none'
RENDER_SVG_CONTAINER.addEventListener('tikzjax-load-finished', async (event) => {
  const readySvg = event.target
  if (readySvg === null) {
    throw new Error('No event target.')
  }
  if (!(readySvg instanceof SVGSVGElement)) {
    throw new Error('Target not a top-level SVG Element.')
  }
  const scriptWrapper = readySvg.parentElement as (HTMLElement & Record<string, unknown>) | null
  if (scriptWrapper === null) {
    throw new Error('No script wrapper.')
  }
  if (!(typeof scriptWrapper[RESOLVE_SVG_FUNCTION_NAME] === 'function')) {
    throw new Error('Unexpected script wrapper encountered.')
  }
  const svgText = await processSvg(readySvg)
  scriptWrapper[RESOLVE_SVG_FUNCTION_NAME](svgText)
  scriptWrapper.remove()
})

async function processSvg(unprocessedSvg: SVGSVGElement): Promise<string> {
  const texts = [...unprocessedSvg.getElementsByTagName('text')]
  for (const text of texts) {
    const fontFamily = text.getAttribute('font-family')
    if (fontFamily === null) {
      throw new Error('Font family not set.')
    }
    const fontSizeText = text.getAttribute('font-size')
    if (fontSizeText === null) {
      throw new Error('Font size not set.')
    }
    const fontSize = parseInt(fontSizeText, 10)
    const xText = text.getAttribute('x')
    if (xText === null) {
      throw new Error('X not set.')
    }
    const x = parseFloat(xText)
    const yText = text.getAttribute('y')
    if (yText === null) {
      throw new Error('Y not set.')
    }
    const y = parseFloat(yText)
    const font = await queryFontCached(fontFamily)
    const textPath = font.getPath(text.textContent, x, y, fontSize)
    const textPathSvg = textPath.toDOMElement(2)
    // textPathSvg.setAttribute('fill', 'black');
    text.replaceWith(textPathSvg)
  }
  const serializer = new XMLSerializer()
  return serializer.serializeToString(unprocessedSvg)
}

export async function renderSvg(latex: string): Promise<string> {
  if (RENDER_SVG_CONTAINER === null) {
    throw new Error('Could not find rendering container.')
  }
  const scriptWrapper = document.createElement('div')
  const script = document.createElement('script')
  script.type = 'text/tikz'
  // script.dataset.disableCache = 'true'
  script.dataset.showConsole = 'true'
  script.dataset.texPackages = JSON.stringify({ argumentation: '' })
  script.text = latex
  scriptWrapper.append(script)
  const svg = await new Promise<string>((resolve) => {
    ;(scriptWrapper as unknown as Record<string, unknown>).resolveSvg = resolve
    RENDER_SVG_CONTAINER.append(scriptWrapper)
  })

  return Promise.resolve(svg)
}
