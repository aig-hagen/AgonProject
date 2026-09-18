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
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

// Root-absolute links the app serves at runtime rather than files in the repo.
const runtimeRoutes = new Set(['/api'])

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (
        entry.name === '.git' ||
        entry.name === '.pytest_cache' ||
        entry.name === 'node_modules' ||
        entry.name === 'third-party'
      )
        return []
      if (path === join(root, 'docs', 'ideas')) return []
      return markdownFiles(path)
    }
    return extname(entry.name) === '.md' ? [path] : []
  })
}

function targetPath(rawTarget, sourceFile) {
  let target = rawTarget.trim()
  if (target.startsWith('<') && target.includes('>')) {
    target = target.slice(1, target.indexOf('>'))
  } else {
    target = target.split(/\s+["']/)[0]
  }
  if (!target || /^(?:[a-z][a-z+.-]*:|#)/i.test(target)) return undefined

  const [withoutFragment, rawFragment] = target.split('#', 2)
  if (runtimeRoutes.has(withoutFragment)) return undefined
  let decoded
  let fragment
  try {
    decoded = decodeURIComponent(withoutFragment)
    fragment = rawFragment ? decodeURIComponent(rawFragment) : undefined
  } catch {
    return { error: `invalid URL encoding in ${rawTarget}` }
  }
  const path = decoded.startsWith('/')
    ? join(root, decoded.slice(1))
    : resolve(dirname(sourceFile), decoded)
  return { path, fragment }
}

function headingAnchors(markdown) {
  const anchors = new Set()
  const occurrences = new Map()
  for (const match of markdown.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const heading = match[1]
      .replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .replace(/<[^>]+>/g, '')
    const base = heading
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s/g, '-')
    const count = occurrences.get(base) ?? 0
    occurrences.set(base, count + 1)
    anchors.add(count === 0 ? base : `${base}-${count}`)
  }
  return anchors
}

const files = [
  'README.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'CLAUDE.md',
  ...markdownFiles(join(root, 'docs')).map((file) => relative(root, file)),
  'servers/argumentation-mcp/README.md',
  'servers/graph-gen/README.md',
  'servers/share/README.md',
].map((file) => resolve(root, file))
const failures = []
const anchorsByFile = new Map()

for (const file of files) {
  const markdown = readFileSync(file, 'utf8')
  const targets = [
    ...[...markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]),
    ...[...markdown.matchAll(/^\[[^\]]+\]:\s+(\S+)/gm)].map((match) => match[1]),
  ]
  for (const rawTarget of targets) {
    const target = targetPath(rawTarget, file)
    if (!target) continue
    if (target.error) {
      failures.push(`${relative(root, file)}: ${target.error}`)
    } else if (!existsSync(target.path)) {
      failures.push(`${relative(root, file)}: missing ${rawTarget}`)
    } else if (target.fragment && extname(target.path) === '.md') {
      let anchors = anchorsByFile.get(target.path)
      if (!anchors) {
        anchors = headingAnchors(readFileSync(target.path, 'utf8'))
        anchorsByFile.set(target.path, anchors)
      }
      if (!anchors.has(target.fragment.toLowerCase())) {
        failures.push(`${relative(root, file)}: missing heading in ${rawTarget}`)
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Checked local links in ${files.length} Markdown files.`)
