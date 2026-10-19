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
import katex, { type KatexOptions } from 'katex'

import { plainText } from '@/app/glossary/plainText'
import { entryRefs, glossaryModules, glossaryPath } from '@/app/glossary/useGlossary'
import enGlossary from '@/localization/locales/en/messages/glossary'
import type { GlossaryBlock, GlossaryInline } from '@/modules/common/glossary/types'
import { formatCitation, publicationHref, shortLabel } from '@/modules/common/publications/format'
import { publicationByKey } from '@/modules/common/publications/lookup'
import { KATEX_OPTIONS } from '@/modules/common/tooltip/katexOptions'
import type { TooltipDefinition } from '@/modules/common/tooltip/tooltipRegistry'

/** A static glossary page: its output file and full HTML document. */
export interface PrerenderedPage {
  file: string
  html: string
}

interface Entry {
  key: string
  prefix: string
  definition: TooltipDefinition
}

const DESCRIPTION_LENGTH = 160

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

// MathML needs no stylesheet, so the static page reads fine before (or without) the app.
function renderMath(text: string): string {
  return text
    .split('$')
    .map((chunk, i) =>
      i % 2
        ? katex.renderToString(chunk, {
            ...(KATEX_OPTIONS as KatexOptions),
            output: 'mathml',
            throwOnError: false,
          })
        : escapeHtml(chunk),
    )
    .join('')
}

const truncate = (text: string) =>
  text.length > DESCRIPTION_LENGTH
    ? `${text.slice(0, DESCRIPTION_LENGTH - 1).replace(/\s+\S*$/, '')}…`
    : text

function termTitle({ definition }: Entry): string {
  return definition.title ?? definition.label
}

/**
 * Renders the glossary as static HTML, one page per term and module, from the built
 * `index.html`. Crawlers read it directly; the SPA replaces it on mount.
 */
export function prerenderGlossary(template: string, site: string): PrerenderedPage[] {
  const entries = new Map<string, Entry>()
  for (const { prefix, glossary } of glossaryModules) {
    for (const [key, definition] of Object.entries(glossary)) {
      if (!entries.has(key)) entries.set(key, { key, prefix, definition })
    }
  }

  const backlinks = new Map<string, Entry[]>()
  for (const entry of entries.values()) {
    for (const ref of new Set(entryRefs(entry.definition))) {
      if (ref !== entry.key) backlinks.set(ref, [...(backlinks.get(ref) ?? []), entry])
    }
  }

  const termLink = (entry: Entry, label = termTitle(entry)) =>
    `<a href="${glossaryPath(entry.prefix, entry.key)}">${renderMath(label)}</a>`

  function inline(parts: GlossaryInline[]): string {
    return parts
      .map((part) => {
        if (typeof part === 'string') return renderMath(part)
        if ('cite' in part) {
          const pub = publicationByKey(part.cite)
          if (!pub) return escapeHtml(part.cite)
          const href = publicationHref(pub)
          const label = escapeHtml(shortLabel(pub))
          return href ? `<a href="${escapeHtml(href)}">${label}</a>` : label
        }
        const target = entries.get(part.ref)
        if (!target) return renderMath(part.label ?? part.ref)
        return termLink(target, part.label ?? target.definition.label)
      })
      .join('')
  }

  function plain(parts: GlossaryInline[]): string {
    return parts
      .map((part) => {
        if (typeof part === 'string') return plainText(part)
        if ('cite' in part) return ''
        return plainText(part.label ?? entries.get(part.ref)?.definition.label ?? part.ref)
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function block(b: GlossaryBlock): string {
    if (b.kind === 'heading') return `<h${b.level}>${inline(b.content)}</h${b.level}>`
    if (b.kind === 'list') return `<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`
    return `<p>${inline(b.content)}</p>`
  }

  function page(path: string, title: string, description: string, main: string, jsonLd: object) {
    const url = `${site}${path}`
    const html = template
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(
        /(<meta\s+(?:name="description"|property="og:description"|name="twitter:description")\s+content=")[^"]*"/g,
        `$1${escapeHtml(description)}"`,
      )
      .replace(
        /(<meta\s+(?:property="og:title"|name="twitter:title")\s+content=")[^"]*"/g,
        `$1${escapeHtml(title)}"`,
      )
      .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
      .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
      .replace(
        '</head>',
        `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n</head>`,
      )
      .replace(
        /<main class="app-fallback">[\s\S]*?<\/main>/,
        `<main class="app-fallback">${main}</main>`,
      )
    return { file: `${path.slice(1)}/index.html`, html }
  }

  const glossaryTitle = enGlossary.title
  const pages: PrerenderedPage[] = []

  for (const { prefix, label } of glossaryModules) {
    const termSet = {
      '@type': 'DefinedTermSet',
      name: `AgonProject ${glossaryTitle}: ${label}`,
      url: `${site}${glossaryPath(prefix)}`,
    }
    const terms = [...entries.values()]
      .filter((entry) => entry.prefix === prefix)
      .sort((a, b) => termTitle(a).localeCompare(termTitle(b)))
    const breadcrumb = `<nav><a href="/">AgonProject</a> › <a href="${glossaryPath()}">${glossaryTitle}</a> › <a href="${glossaryPath(prefix)}">${escapeHtml(label)}</a></nav>`

    pages.push(
      page(
        glossaryPath(prefix),
        `${label} · ${glossaryTitle} · AgonProject`,
        truncate(
          `${label} terms in the AgonProject ${glossaryTitle.toLowerCase()}: ${terms.map((t) => plainText(termTitle(t))).join(', ')}`,
        ),
        `${breadcrumb}<h1>${escapeHtml(label)}</h1><ul>${terms.map((t) => `<li>${termLink(t)}</li>`).join('')}</ul>`,
        { '@context': 'https://schema.org', ...termSet },
      ),
    )

    for (const entry of terms) {
      const { definition } = entry
      const title = plainText(termTitle(entry))
      const fullDescription = plain(definition.content)
      const reference = definition.reference
        ? `<section><h2>${enGlossary.source}</h2><p>${escapeHtml(formatCitation(definition.reference))}</p></section>`
        : ''
      const referencedBy = backlinks.get(entry.key)?.length
        ? `<section><h2>${enGlossary.referencedBy}</h2><ul>${backlinks
            .get(entry.key)!
            .map((b) => `<li>${termLink(b)}</li>`)
            .join('')}</ul></section>`
        : ''
      const main = [
        breadcrumb,
        `<article><h1>${renderMath(termTitle(entry))}</h1>`,
        `<p>${inline(definition.content)}</p>`,
        ...(definition.body ?? []).map(block),
        reference,
        referencedBy,
        '</article>',
      ].join('')

      pages.push(
        page(
          glossaryPath(entry.prefix, entry.key),
          `${title} · ${glossaryTitle} · AgonProject`,
          truncate(fullDescription),
          main,
          {
            '@context': 'https://schema.org',
            '@type': 'DefinedTerm',
            name: title,
            termCode: entry.key,
            description: fullDescription,
            url: `${site}${glossaryPath(entry.prefix, entry.key)}`,
            inDefinedTermSet: termSet,
          },
        ),
      )
    }
  }
  return pages
}
