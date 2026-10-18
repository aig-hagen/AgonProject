// Local collection of cited papers in the gitignored literature/ folder.
//   node scripts/literature.mjs status         keys without a PDF, PDFs without a key
//   node scripts/literature.mjs bib            write literature/references.bib
//   node scripts/literature.mjs import <dir>   copy PDFs from <dir> that match a publication
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import * as publications from '../src/modules/common/publications/publications.ts'

const LIT_DIR = 'literature'
const entries = Object.entries(publications)

function pdfKeys() {
  if (!existsSync(LIT_DIR)) return []
  return readdirSync(LIT_DIR)
    .filter((f) => f.endsWith('.pdf'))
    .map((f) => f.slice(0, -4))
}

function status() {
  const have = new Set(pdfKeys())
  const known = new Set(entries.map(([key]) => key))
  const missing = entries.filter(([key]) => !have.has(key))
  const unknown = [...have].filter((key) => !known.has(key))
  console.log(`${entries.length - missing.length}/${entries.length} publications have a PDF.`)
  if (missing.length) {
    console.log('\nMissing:')
    for (const [key, pub] of missing) {
      const link = pub.doi ? `https://doi.org/${pub.doi}` : (pub.url ?? '')
      console.log(`  ${key.padEnd(10)} ${link}`)
    }
  }
  if (unknown.length) console.log(`\nNot in publications.ts:\n  ${unknown.join('\n  ')}`)
}

const BIB_TYPES = {
  article: 'article',
  inproceedings: 'inproceedings',
  chapter: 'incollection',
  thesis: 'phdthesis',
}

function bibValue(value) {
  return `{${String(value).replaceAll('&', '\\&').replaceAll('–', '--')}}`
}

function bibEntry(key, pub) {
  const fields = {
    author: pub.authors.join(' and '),
    title: `{${pub.title}}`,
    year: pub.year,
    journal: pub.journal,
    booktitle: pub.booktitle,
    editor: pub.editors?.join(' and '),
    series: pub.series,
    volume: pub.kind === 'inproceedings' ? pub.seriesVolume : pub.volume,
    number: pub.number,
    eid: pub.articleNo,
    chapter: pub.chapter,
    pages: pub.pages,
    publisher: pub.publisher,
    school: pub.school,
    doi: pub.doi,
    url: pub.doi ? undefined : pub.url,
  }
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `  ${name} = ${bibValue(value)},`)
  return `@${BIB_TYPES[pub.kind]}{${key},\n${lines.join('\n')}\n}`
}

function bib() {
  mkdirSync(LIT_DIR, { recursive: true })
  const out = join(LIT_DIR, 'references.bib')
  writeFileSync(out, entries.map(([key, pub]) => bibEntry(key, pub)).join('\n\n') + '\n')
  console.log(`Wrote ${entries.length} entries to ${out}`)
}

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '')

function firstPages(file) {
  try {
    return execFileSync('pdftotext', ['-l', '2', '-q', file, '-'], { encoding: 'utf8' })
  } catch {
    return ''
  }
}

// Only a DOI or the exact title on the first pages counts as a match.
function importFrom(dir) {
  mkdirSync(LIT_DIR, { recursive: true })
  const have = new Set(pdfKeys())
  for (const file of readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'))) {
    const text = firstPages(join(dir, file))
    // The title must sit near the top, so cited titles in an intro don't count.
    const head = normalize(text).slice(0, 1500)
    const lower = text.toLowerCase()
    let matches = entries.filter(([, pub]) => pub.doi && lower.includes(pub.doi.toLowerCase()))
    if (!matches.length) {
      const byTitle = entries.filter(([, pub]) => head.includes(normalize(pub.title)))
      const longest = Math.max(0, ...byTitle.map(([, pub]) => pub.title.length))
      matches = byTitle.filter(([, pub]) => pub.title.length === longest)
    }
    if (matches.length !== 1) {
      if (matches.length > 1) console.log(`ambiguous  ${file}: ${matches.map(([k]) => k)}`)
      continue
    }
    const [key] = matches[0]
    if (have.has(key)) {
      console.log(`exists     ${file} → ${key}`)
      continue
    }
    copyFileSync(join(dir, file), join(LIT_DIR, `${key}.pdf`))
    have.add(key)
    console.log(`copied     ${file} → ${key}.pdf`)
  }
}

const [command, arg] = process.argv.slice(2)
if (command === 'status') status()
else if (command === 'bib') bib()
else if (command === 'import' && arg) importFrom(arg)
else {
  console.error('Usage: node scripts/literature.mjs status | bib | import <dir>')
  process.exit(1)
}
