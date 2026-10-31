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
import { describe, expect, test } from 'vitest'

import template from '/index.html?raw'
import { prerenderGlossary } from '@/app/glossary/prerender'
import { glossaryModules } from '@/app/glossary/useGlossary'

const site = 'https://example.org'
const pages = prerenderGlossary(template, site)
const pageFor = (file: string) => pages.find((p) => p.file === file)!.html

describe('prerenderGlossary', () => {
  test('writes one page per term and per module', () => {
    const terms = glossaryModules.reduce((n, m) => n + Object.keys(m.glossary).length, 0)
    expect(pages).toHaveLength(terms + glossaryModules.length)
    expect(new Set(pages.map((p) => p.file)).size).toBe(pages.length)
  })

  test('fills title, description, canonical URL and JSON-LD', () => {
    const html = pageFor('glossary/AF/ADM/index.html')
    expect(html).toContain('<title>Admissibility - Abstract Argumentation | AgonProject</title>')
    expect(html).toContain(`<link rel="canonical" href="${site}/glossary/AF/ADM"`)
    expect(html).toContain(`<meta property="og:url" content="${site}/glossary/AF/ADM"`)
    expect(html).toMatch(/name="description"\s+content="A set E[^"]* is admissible iff/)
    expect(html).not.toMatch(/content="[^"]*\$/)

    const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]!))
      .find((data) => data['@type'] === 'DefinedTerm')
    expect(jsonLd).toMatchObject({
      name: 'Admissibility',
      termCode: 'ADM',
      url: `${site}/glossary/AF/ADM`,
      inDefinedTermSet: { url: `${site}/glossary/AF` },
    })
  })

  test('adds a breadcrumb trail up to the module', () => {
    const html = pageFor('glossary/SetAF/setafRange/index.html')
    const trail = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]!))
      .find((data) => data['@type'] === 'BreadcrumbList')
    expect(trail.itemListElement.map((item: { name: string }) => item.name)).toEqual([
      'AgonProject',
      'Glossary',
      'Argumentation with Collective Attacks',
      'Range (SetAF)',
    ])
    expect(trail.itemListElement.at(-2).item).toBe(`${site}/glossary/SetAF`)
    expect(trail.itemListElement.at(-1).item).toBeUndefined()
  })

  test('renders the definition with math and term links in the fallback', () => {
    const main = pageFor('glossary/AF/ADM/index.html').match(/<main[\s\S]*?<\/main>/)![0]
    expect(main).toContain('<h1>Admissibility</h1>')
    expect(main).toContain('<math')
    expect(main).toContain('href="/glossary/AF/CF"')
    expect(main).not.toContain('AgonProject requires JavaScript')
  })

  test('module pages list their terms', () => {
    expect(pageFor('glossary/ADF/index.html')).toContain('href="/glossary/ADF/ADF"')
  })
})
