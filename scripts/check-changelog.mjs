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
import { readFileSync } from 'node:fs'

import { extractReleaseNotes } from './extract-release-notes.mjs'

const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')
const sectionMatches = [...changelog.matchAll(/^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?$/gm)]
const failures = []

if (sectionMatches[0]?.[1] !== 'Unreleased') {
  failures.push('The first changelog section must be [Unreleased].')
}
if (sectionMatches.filter((match) => match[1] === 'Unreleased').length !== 1) {
  failures.push('The changelog must contain exactly one [Unreleased] section.')
}

const releases = sectionMatches.filter((match) => match[1] !== 'Unreleased')
const seen = new Set()
let previousVersion

function versionParts(version) {
  return version.split('.').map(Number)
}

function compareVersions(left, right) {
  const a = versionParts(left)
  const b = versionParts(right)
  for (let index = 0; index < 3; index++) {
    if (a[index] !== b[index]) return a[index] - b[index]
  }
  return 0
}

for (const match of releases) {
  const version = match[1]
  const date = match[2]
  if (!/^\d+\.\d+\.\d+$/.test(version)) failures.push(`Invalid release version: ${version}`)
  if (!date) failures.push(`Release ${version} has no YYYY-MM-DD date.`)
  if (seen.has(version)) failures.push(`Duplicate release version: ${version}`)
  if (previousVersion && compareVersions(previousVersion, version) <= 0) {
    failures.push(`Release ${version} is not below ${previousVersion}.`)
  }
  seen.add(version)
  previousVersion = version

  try {
    extractReleaseNotes(changelog, version)
  } catch (error) {
    failures.push(error.message)
  }

  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const references = changelog.match(new RegExp(`^\\[${escaped}\\]:`, 'gm')) ?? []
  if (references.length !== 1) failures.push(`Release ${version} must have one comparison link.`)
}

if (!/^\[Unreleased\]:/m.test(changelog)) {
  failures.push('The changelog has no [Unreleased] comparison link.')
}

try {
  extractReleaseNotes(changelog, '0.0.0-does-not-exist')
  failures.push('Release-note extraction unexpectedly accepted an unknown version.')
} catch {
  // Expected.
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Validated ${releases.length} releases and their extracted notes.`)
