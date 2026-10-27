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
import type { GlossaryBlock, GlossaryInline } from '@/modules/common/glossary/types'
import { publicationByKey } from '@/modules/common/publications/lookup'
import type { Publication } from '@/modules/common/publications/types'
import type { TooltipContentPart } from '@/modules/common/tooltip/tooltipRegistry'

export interface ParsedGlossaryEntry {
  label: string
  title?: string
  short?: string
  /** LaTeX for the notation the entry introduces (e.g. `\mathsf{co}`), shown beside the title. */
  symbol?: string
  /** The `publications.ts` entry named by the `reference` frontmatter field. */
  reference?: Publication
  /** The formal definition: everything before the first `##` heading. */
  content: TooltipContentPart[]
  /** Everything after the definition, rendered only on the glossary page. */
  body?: GlossaryBlock[]
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/
// Math spans are matched only so that underscores inside them never start emphasis.
const INLINE =
  /(\$(?:\\.|[^$\\])*\$)|\[\[(.+?)\]\]|\[@([\w-]+)\]|(?<![\w\\])_([^_\s$](?:[^_$]*[^_\s$])?)_(?!\w)/g

/** Splits text with `[[key]]` / `[[key|label]]` links, `[@KEY]` citations and `_emphasis_` into parts. */
export function parseInline(text: string): GlossaryInline[] {
  const parts: GlossaryInline[] = []
  let last = 0
  for (const match of text.matchAll(INLINE)) {
    if (match[1]) continue
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[4]) {
      parts.push({ em: match[4] })
    } else if (match[3]) {
      parts.push({ cite: match[3] })
    } else {
      const [ref, label] = match[2]!.split('|', 2) as [string, string?]
      parts.push(label === undefined ? { ref } : { ref, label })
    }
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

const joinLines = (lines: string[]) => lines.map((line) => line.trim()).join(' ')

/** Splits a `| a | b |` table row into cells, ignoring `|` inside `[[…]]` links and `$…$` math. */
export function splitTableRow(line: string): string[] {
  const cells: string[] = []
  let cell = ''
  let inLink = false
  let inMath = false
  const row = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  for (let i = 0; i < row.length; i++) {
    const char = row[i]!
    if (!inMath && row.startsWith('[[', i)) inLink = true
    else if (inLink && row.startsWith(']]', i)) inLink = false
    else if (char === '$' && row[i - 1] !== '\\') inMath = !inMath
    if (char === '|' && !inLink && !inMath) {
      cells.push(cell.trim())
      cell = ''
    } else {
      cell += char
    }
  }
  cells.push(cell.trim())
  return cells
}

/** Every inline run of a block, e.g. to collect its links or citations. */
export function blockInlines(block: GlossaryBlock): GlossaryInline[][] {
  if (block.kind === 'list') return block.items
  if (block.kind === 'table') return [...block.header, ...block.rows.flat()]
  return [block.content]
}

/** Paragraphs, `##`/`###` headings, `-` lists and `|` tables, separated by blank lines. */
export function parseBody(markdown: string): GlossaryBlock[] {
  const blocks: GlossaryBlock[] = []
  for (const chunk of markdown.trim().split(/\n\s*\n/)) {
    const lines = chunk.split('\n')
    const heading = lines[0]!.match(/^(#{2,3}) (.*)$/)
    if (heading) {
      const level = heading[1]!.length as 2 | 3
      blocks.push({ kind: 'heading', level, content: parseInline(heading[2]!.trim()) })
      lines.shift()
      if (!lines.length) continue
    }
    if (lines[0]!.startsWith('|')) {
      // The second line is the `| --- |` separator.
      const [header, , ...rows] = lines.map((line) => splitTableRow(line).map(parseInline))
      blocks.push({ kind: 'table', header: header!, rows })
    } else if (lines[0]!.startsWith('- ')) {
      const items: string[][] = []
      for (const line of lines) {
        if (line.startsWith('- ')) items.push([line.slice(2)])
        else items[items.length - 1]!.push(line)
      }
      blocks.push({ kind: 'list', items: items.map((item) => parseInline(joinLines(item))) })
    } else {
      blocks.push({ kind: 'paragraph', content: parseInline(joinLines(lines)) })
    }
  }
  return blocks
}

function parseFrontmatter(block: string): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':')
    if (colon > 0) fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
  }
  return fields
}

export function parseGlossaryEntry(source: string): ParsedGlossaryEntry {
  const match = source.match(FRONTMATTER)
  if (!match) throw new Error('Glossary entry is missing its frontmatter')
  const { label, title, short, symbol, reference } = parseFrontmatter(match[1]!)
  if (!label) throw new Error('Glossary entry frontmatter needs a label')

  const rest = source.slice(match[0].length)
  const heading = rest.search(/^## /m)
  const definition = heading === -1 ? rest : rest.slice(0, heading)
  const body = heading === -1 ? '' : rest.slice(heading).trim()

  const content = parseInline(definition.trim().replace(/\s*\n\s*/g, ' '))
  if (content.some((part) => typeof part !== 'string' && 'cite' in part))
    throw new Error('Citations belong in the body; the definition cites via `reference`')

  const entry: ParsedGlossaryEntry = { label, content: content as TooltipContentPart[] }
  if (title) entry.title = title
  if (short) entry.short = short
  if (symbol) entry.symbol = symbol
  if (reference) {
    const publication = publicationByKey(reference)
    if (!publication) throw new Error(`Unknown reference ${reference}`)
    entry.reference = publication
  }
  if (body) entry.body = parseBody(body)
  return entry
}
