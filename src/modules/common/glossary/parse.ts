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
import type { TooltipContentPart } from '@/modules/common/tooltip/tooltipRegistry'

export interface ParsedGlossaryEntry {
  label: string
  title?: string
  /** The formal definition: everything before the first `##` heading. */
  content: TooltipContentPart[]
  /** Raw Markdown after the definition, rendered only on the glossary page. */
  body?: string
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/
const WIKI_LINK = /\[\[(.+?)\]\]/g

/** Splits text with `[[key]]` / `[[key|label]]` links into tooltip content parts. */
export function parseInline(text: string): TooltipContentPart[] {
  const parts: TooltipContentPart[] = []
  let last = 0
  for (const match of text.matchAll(WIKI_LINK)) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const [ref, label] = match[1]!.split('|', 2) as [string, string?]
    parts.push(label === undefined ? { ref } : { ref, label })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
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
  const { label, title } = parseFrontmatter(match[1]!)
  if (!label) throw new Error('Glossary entry frontmatter needs a label')

  const rest = source.slice(match[0].length)
  const heading = rest.search(/^## /m)
  const definition = heading === -1 ? rest : rest.slice(0, heading)
  const body = heading === -1 ? '' : rest.slice(heading).trim()

  const entry: ParsedGlossaryEntry = {
    label,
    content: parseInline(definition.trim().replace(/\s*\n\s*/g, ' ')),
  }
  if (title) entry.title = title
  if (body) entry.body = body
  return entry
}
