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
import { type Extension } from '@codemirror/state'

import { ARGUMENT_RADIUS_IN_PX, type ArgumentData } from '@/modules/common/argumentation/model'
import {
  ExportFormatId,
  type ExportResult,
  type ExportStyleOptions,
  type NodeLabelMode,
} from '@/modules/common/export'
import { nameToMathTex, textToTex } from '@/modules/common/export/texEscape'

const AF_ENV_BEGIN = '\\begin{af}'

export const LATEX_PREAMBLE = '\\usepackage{argumentation}'

/** Values offered for each LaTeX style option; they are the package's own keywords. */
export const LATEX_STYLE_CHOICES = {
  argumentStyle: ['standard', 'large', 'thick', 'gray', 'colored'],
  nameStyle: ['math', 'bold', 'monospace', 'monoemph', 'none'],
  attackStyle: ['standard', 'large', 'modern'],
  supportStyle: ['standard', 'dashed', 'double'],
  nodeLabels: ['auto', 'full', 'short'],
} as const

export const LATEX_STYLE_DEFAULTS = {
  argumentStyle: 'standard',
  nameStyle: 'math',
  attackStyle: 'standard',
  supportStyle: 'double',
  nodeDistance: 2,
  nodeLabels: 'auto',
} as const satisfies ExportStyleOptions

/**
 * The appearance options that ride on the `\begin{af}[…]` environment. Node distance is not
 * here: it changes generated coordinates (the body), not the environment options.
 */
export interface AfAppearanceOptions {
  argumentStyle?: string
  nameStyle?: string
  attackStyle?: string
  supportStyle?: string
}

/**
 * Builds the comma-separated option list for `\begin{af}[…]` (without the brackets).
 * `supportstyle` is only included when the document actually has supports.
 */
export function buildAfOptionList(options: AfAppearanceOptions, includeSupport: boolean): string {
  const parts = [
    `argumentstyle=${options.argumentStyle ?? LATEX_STYLE_DEFAULTS.argumentStyle}`,
    `namestyle=${options.nameStyle ?? LATEX_STYLE_DEFAULTS.nameStyle}`,
    `attackstyle=${options.attackStyle ?? LATEX_STYLE_DEFAULTS.attackStyle}`,
  ]
  if (includeSupport) {
    parts.push(`supportstyle=${options.supportStyle ?? LATEX_STYLE_DEFAULTS.supportStyle}`)
  }
  return parts.join(',')
}

export interface AfOptionSpliceResult {
  ok: boolean
  text: string
  /** Why the splice failed: no `\begin{af}` marker, or more than one (ambiguous). */
  reason?: 'missing' | 'ambiguous'
}

const AF_BEGIN_REGEX = /\\begin\{af\}(\[[^\]]*\])?/g

/**
 * Replaces (or inserts) the option list of the single `\begin{af}[…]` environment in `latex`.
 * The first `\begin{af}` is the canonical options marker; if it is missing or appears more than
 * once, the text is returned untouched with `ok: false` so callers can surface a validation hint
 * rather than corrupt an edited buffer.
 */
export function spliceAfOptions(latex: string, optionList: string): AfOptionSpliceResult {
  const matches = [...latex.matchAll(AF_BEGIN_REGEX)]
  if (matches.length === 0) return { ok: false, text: latex, reason: 'missing' }
  if (matches.length > 1) return { ok: false, text: latex, reason: 'ambiguous' }
  const match = matches[0]!
  const replacement = optionList ? `${AF_ENV_BEGIN}[${optionList}]` : AF_ENV_BEGIN
  const start = match.index
  const text = latex.slice(0, start) + replacement + latex.slice(start + match[0].length)
  return { ok: true, text }
}

export function latexExportCommonConfig(): {
  id: ExportFormatId
  name: string
  codemirrorOptions?: {
    loadExtensions: () => Promise<Extension[]>
  }
  references: { label: string; url: string }[]
  extension: string
} {
  return {
    id: ExportFormatId.Latex,
    name: 'LaTeX (argumentation)',
    codemirrorOptions: {
      loadExtensions: () =>
        import('codemirror-lang-latex').then(({ latex }) => [
          latex({ linter: { checkMissingDocumentEnv: false } }),
        ]),
    },
    references: [{ label: 'CTAN Package', url: 'https://ctan.org/pkg/argumentation' }],
    extension: 'tex',
  }
}

/**
 * Builds ICCMA-style plain-text export output: a `p <type> <n>` problem line
 * followed by one line per relation/annotation. Only the AF format (`p af n`
 * with bare `<source> <target>` attack lines) is an official ICCMA format;
 * other types here are extensions of that style, using a leading qualifier
 * letter on a line only where it's needed to disambiguate from other line
 * kinds (mirroring how ICCMA's own ABA format uses `a`/`c`/`r`).
 */
export function buildIccmaText(
  type: string,
  numberOfArguments: number,
  lines: Iterable<string>,
): string {
  let text = `p ${type} ${numberOfArguments}\r\n`
  for (const line of lines) {
    text += `${line}\r\n`
  }
  return text.trimEnd()
}

interface NodeExportInfo {
  label: NodeLabel
  fullName: string
  x: number
  y: number
  latexId: number
}

export interface SetAttack {
  attackers: number[]
  target: number
}

export interface ExportHooks {
  argumentOptions?: (id: number) => string
  attackOptions?: (sourceId: number, targetId: number) => string
  attackSuffix?: (sourceId: number, targetId: number) => string
  /** `label` resolves an argument id to its node label as math-mode TeX. */
  argumentAnnotation?: (id: number, label: (id: number) => string) => string | undefined
  setAttacks?: Iterable<SetAttack>
  /** Adds `supportstyle` to the environment options (documents that can have supports). */
  includeSupportStyle?: boolean
}

function buildOpts(...parts: string[]): string {
  const joined = parts.filter(Boolean).join(',')
  return joined ? `[${joined}]` : ''
}

// Shortened labels keep their full name as a trailing comment.
function labelComment(node: NodeExportInfo): string {
  return !node.label.shortened ? '' : ` % ${node.fullName.replace(/\s+/g, ' ')}`
}

function absolutePlacement(
  nodeMap: Map<number, NodeExportInfo>,
  snapToGrid: boolean,
  argumentOptions?: (id: number) => string,
): string {
  let text = ''
  for (const [id, node] of nodeMap.entries()) {
    const x = snapToGrid ? Math.round(node.x).toFixed(1) : node.x.toFixed(2)
    const y = snapToGrid ? Math.round(node.y).toFixed(1) : node.y.toFixed(2)
    text += `  \\argument${buildOpts(argumentOptions?.(id) ?? '')}(a${node.latexId}){${node.label.tex}} at (${x},${y})${labelComment(node)}\r\n`
  }
  return text
}

// Longer names inflate the circular TikZ nodes, so they get shortened.
const MAX_NODE_LABEL_LENGTH = 3

export interface NodeLabel {
  /** TeX for the node, in the mode the name style typesets it in. */
  tex: string
  /** Math-mode TeX, for use inside formulas and annotations. */
  mathTex: string
  shortened: boolean
}

function shortLabelBase(name: string): string {
  if ([...name].length <= MAX_NODE_LABEL_LENGTH && !/\s/.test(name)) return name
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? []
  if (words.length === 0) return [...name][0] ?? 'a'
  if (words.length === 1) return [...words[0]!][0]!
  return words
    .slice(0, MAX_NODE_LABEL_LENGTH)
    .map((word) => [...word][0])
    .join('')
}

function renderLabel(base: string, index: number | undefined, math: boolean): string {
  const tex = math ? nameToMathTex(base) : textToTex(base)
  if (index === undefined) return tex
  if (!math) return `${tex}${index}`
  return /[_^]/.test(base) ? `{${tex}}_{${index}}` : `${tex}_{${index}}`
}

/** Maps argument names to node labels; short labels are made unique with an index. */
export function buildNodeLabels(
  names: string[],
  mode: NodeLabelMode,
  nameStyle: string,
): NodeLabel[] {
  const math = nameStyle === 'math' || nameStyle === 'bold'
  const trimmed = names.map((name) => name.trim().replace(/\s+/g, ' '))
  const allShort =
    trimmed.every((name) => /^\S{1,3}$/u.test(name)) && new Set(trimmed).size === trimmed.length
  if (mode === 'full' || (mode === 'auto' && allShort)) {
    return trimmed.map((name) => ({
      tex: renderLabel(name, undefined, math),
      mathTex: renderLabel(name, undefined, true),
      shortened: false,
    }))
  }

  const bases = trimmed.map(shortLabelBase)
  const counts = new Map<string, number>()
  for (const base of bases) counts.set(base, (counts.get(base) ?? 0) + 1)
  const taken = new Set(
    bases
      .filter((base) => counts.get(base) === 1)
      .map((base) => renderLabel(base, undefined, math)),
  )
  const nextIndex = new Map<string, number>()
  return bases.map((base, i) => {
    let index: number | undefined
    let tex = renderLabel(base, undefined, math)
    if (counts.get(base)! > 1) {
      do {
        index = (nextIndex.get(base) ?? 0) + 1
        nextIndex.set(base, index)
        tex = renderLabel(base, index, math)
      } while (taken.has(tex))
      taken.add(tex)
    }
    return {
      tex,
      mathTex: renderLabel(base, index, true),
      shortened: index !== undefined || base !== trimmed[i],
    }
  })
}

function buildNodeMap(
  args: IterableIterator<[id: number, data: ArgumentData]>,
  styleOptions?: ExportStyleOptions,
): Map<number, NodeExportInfo> {
  const nodeDistance = styleOptions?.nodeDistance ?? LATEX_STYLE_DEFAULTS.nodeDistance
  const gridCellScale = styleOptions?.gridCellScale ?? 3
  const pixelsPerUnit = (2 * ARGUMENT_RADIUS_IN_PX * gridCellScale) / nodeDistance
  const argsList = [...args]
  const labels = buildNodeLabels(
    argsList.map(([, data]) => data.name),
    styleOptions?.nodeLabels ?? LATEX_STYLE_DEFAULTS.nodeLabels,
    styleOptions?.nameStyle ?? LATEX_STYLE_DEFAULTS.nameStyle,
  )
  const nodeMap = new Map<number, NodeExportInfo>()
  argsList.forEach(([argumentId, argumentData], index) => {
    nodeMap.set(argumentId, {
      label: labels[index]!,
      fullName: argumentData.name,
      x: argumentData.x / pixelsPerUnit,
      y: (argumentData.y / pixelsPerUnit) * -1,
      latexId: index + 1,
    })
  })
  return nodeMap
}

export function exportLatexArgumentationCommon(
  args: IterableIterator<[id: number, data: ArgumentData]>,
  attacks: IterableIterator<[attackerId: number, attackedId: number]>,
  supports: IterableIterator<[attackerId: number, attackedId: number]>,
  styleOptions?: ExportStyleOptions,
  hooks?: ExportHooks,
): ExportResult {
  const nodeMap = buildNodeMap(args, styleOptions)
  offsetNodesToOrigin(nodeMap)

  const getLatexId = (id: number) => nodeMap.get(id)!.latexId

  // Singleton set attacks are plain attacks, so they join the pairing (dual/bent) logic.
  const setAttacks = [...(hooks?.setAttacks ?? [])]
  const collectiveAttacks = setAttacks.filter(({ attackers }) => attackers.length > 1)
  function* allAttacks(): IterableIterator<[number, number]> {
    yield* attacks
    for (const { attackers, target } of setAttacks) {
      if (attackers.length === 1) yield [attackers[0]!, target]
    }
  }

  const optionList = buildAfOptionList(styleOptions ?? {}, hooks?.includeSupportStyle ?? false)
  let text = `${AF_ENV_BEGIN}[${optionList}]\r\n`
  text += absolutePlacement(nodeMap, styleOptions?.snapToGrid ?? false, hooks?.argumentOptions)
  text += emitLinks(
    processLinks(allAttacks(), supports),
    getLatexId,
    hooks?.attackOptions,
    hooks?.attackSuffix,
  )
  for (const { attackers, target } of collectiveAttacks) {
    text += `  \\setattack{${attackers.map((id) => `a${getLatexId(id)}`).join(',')}}{a${getLatexId(target)}}\r\n`
  }
  text += emitAnnotations(nodeMap, hooks?.argumentAnnotation)
  text += `\\end{af}`

  return {
    text,
    // Loaded on demand: rendering pulls in opentype.js (~240 kB), only needed for SVG preview.
    svg: async () => {
      const { renderSvg } = await import('@/modules/common/export/renderSvg')
      return renderSvg(text)
    },
  }
}

interface ProcessedLink {
  type: ProcessedLinkType
  self: boolean
  reverseType: ProcessedLinkType
  sourceId: number
  targetId: number
}

enum ProcessedLinkType {
  None,
  Attack,
  Support,
}

function offsetNodesToOrigin(nodes: Map<number, NodeExportInfo>): void {
  if (nodes.size === 0) return
  const vals = [...nodes.values()]
  const minX = Math.min(...vals.map((n) => n.x))
  const minY = Math.min(...vals.map((n) => n.y))
  for (const node of vals) {
    node.x -= minX
    node.y -= minY
  }
}

function emitAnnotations(
  nodeMap: Map<number, NodeExportInfo>,
  argumentAnnotation?: ExportHooks['argumentAnnotation'],
): string {
  if (!argumentAnnotation) return ''
  const label = (id: number) => nodeMap.get(id)?.label.mathTex ?? '?'
  let text = ''
  for (const [id, node] of nodeMap) {
    const annotation = argumentAnnotation(id, label)
    if (annotation !== undefined) {
      text += `  \\annotation{a${node.latexId}}{${annotation}}\r\n`
    }
  }
  return text
}

function emitLinks(
  processedLinks: ProcessedLink[],
  getLatexId: (id: number) => number,
  attackOptions?: (sourceId: number, targetId: number) => string,
  attackSuffix?: (sourceId: number, targetId: number) => string,
): string {
  const a = (id: number) => `a${getLatexId(id)}`
  const attack = (s: number, t: number, ...extra: string[]) =>
    `  \\attack${buildOpts(attackOptions?.(s, t) ?? '', ...extra)}{${a(s)}}{${a(t)}}${attackSuffix?.(s, t) ?? ''}\r\n`
  const support = (s: number, t: number, ...extra: string[]) =>
    `  \\support${buildOpts(...extra)}{${a(s)}}{${a(t)}}\r\n`

  let text = ''
  for (const { type, self, reverseType, sourceId, targetId } of processedLinks) {
    if (self) {
      switch (type) {
        case ProcessedLinkType.None:
          break
        case ProcessedLinkType.Attack:
          text += `  \\selfattack${buildOpts(attackOptions?.(sourceId, targetId) ?? '')}{${a(sourceId)}}{${a(targetId)}}\r\n`
          break
        case ProcessedLinkType.Support:
          text += `  \\support[selfattack]{${a(sourceId)}}{${a(targetId)}}\r\n`
          break
      }
    } else if (type == ProcessedLinkType.Attack && reverseType === ProcessedLinkType.None) {
      text += attack(sourceId, targetId)
    } else if (type == ProcessedLinkType.Support && reverseType === ProcessedLinkType.None) {
      text += support(sourceId, targetId)
    } else if (type === ProcessedLinkType.None && reverseType == ProcessedLinkType.Attack) {
      text += attack(targetId, sourceId)
    } else if (type === ProcessedLinkType.None && reverseType == ProcessedLinkType.Support) {
      text += support(targetId, sourceId)
    } else if (type === ProcessedLinkType.Attack && reverseType == ProcessedLinkType.Attack) {
      // \dualattack takes no per-direction options or labels, so draw a bent pair instead.
      const perDirection = [
        attackOptions?.(sourceId, targetId),
        attackOptions?.(targetId, sourceId),
        attackSuffix?.(sourceId, targetId),
        attackSuffix?.(targetId, sourceId),
      ].some(Boolean)
      if (perDirection) {
        text += attack(sourceId, targetId, 'bend right')
        text += attack(targetId, sourceId, 'bend right')
      } else {
        text += `  \\dualattack{${a(sourceId)}}{${a(targetId)}}\r\n`
      }
    } else if (type === ProcessedLinkType.Attack && reverseType == ProcessedLinkType.Support) {
      text += attack(sourceId, targetId, 'bend right')
      text += support(targetId, sourceId, 'bend right')
    } else if (type === ProcessedLinkType.Support && reverseType == ProcessedLinkType.Attack) {
      text += support(sourceId, targetId, 'bend right')
      text += attack(targetId, sourceId, 'bend right')
    } else if (type === ProcessedLinkType.Support && reverseType == ProcessedLinkType.Support) {
      text += support(sourceId, targetId, 'bend right')
      text += support(targetId, sourceId, 'bend right')
    }
  }
  return text
}

function processLinks(
  attacks: IterableIterator<[attackerId: number, attackedId: number]>,
  supports: IterableIterator<[attackerId: number, attackedId: number]>,
): ProcessedLink[] {
  const linksProcessed = new Map<string, ProcessedLink>()

  function processLinkType(
    links: IterableIterator<[sourceId: number, targetId: number]>,
    linkType: ProcessedLinkType,
  ) {
    for (const [sourceId, targetId] of links) {
      const key = sourceId < targetId ? sourceId + '|' + targetId : targetId + '|' + sourceId
      const link = linksProcessed.get(key)
      if (link === undefined) {
        let newLink
        if (sourceId === targetId) {
          newLink = {
            type: linkType,
            self: true,
            reverseType: ProcessedLinkType.None,
            sourceId: sourceId,
            targetId: targetId,
          }
        } else if (sourceId < targetId) {
          newLink = {
            type: linkType,
            self: false,
            reverseType: ProcessedLinkType.None,
            sourceId: sourceId,
            targetId: targetId,
          }
        } else {
          newLink = {
            type: ProcessedLinkType.None,
            self: false,
            reverseType: linkType,
            sourceId: targetId,
            targetId: sourceId,
          }
        }
        linksProcessed.set(key, newLink)
        continue
      }
      if (!link.self) {
        if (sourceId < targetId) {
          link.type = linkType
        } else {
          link.reverseType = linkType
        }
      }
    }
  }
  processLinkType(attacks, ProcessedLinkType.Attack)
  processLinkType(supports, ProcessedLinkType.Support)
  return [...linksProcessed.values()]
}
