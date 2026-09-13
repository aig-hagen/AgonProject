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
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const [versionArgument, outputArgument] = process.argv.slice(2)

if (!versionArgument) {
  console.error('Usage: node scripts/extract-release-notes.mjs <version> [output-file]')
  process.exit(2)
}

const version = versionArgument.replace(/^v/, '')
const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const changelogPath = fileURLToPath(new URL('../CHANGELOG.md', import.meta.url))
const lines = readFileSync(changelogPath, 'utf8').split(/\r?\n/)
const heading = new RegExp(`^## \\[${escapedVersion}\\] - \\d{4}-\\d{2}-\\d{2}$`)
const start = lines.findIndex((line) => heading.test(line))

if (start === -1) {
  console.error(`CHANGELOG.md has no dated section for version ${version}.`)
  process.exit(1)
}

const nextSectionOffset = lines.slice(start + 1).findIndex((line) => /^## \[/.test(line))
const end = nextSectionOffset === -1 ? lines.length : start + 1 + nextSectionOffset
const releaseNotes = `${lines
  .slice(start + 1, end)
  .join('\n')
  .trim()}\n`

if (!releaseNotes.trim()) {
  console.error(`The CHANGELOG.md section for version ${version} is empty.`)
  process.exit(1)
}

if (outputArgument) {
  writeFileSync(resolve(outputArgument), releaseNotes)
} else {
  process.stdout.write(releaseNotes)
}
