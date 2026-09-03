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
/**
 * Next unused document name for a given prefix: the bare prefix if free, else the
 * prefix with the smallest positive integer suffix that isn't already taken.
 */
export function nextDocumentName(existingNames: Iterable<string>, prefix: string): string {
  const allNames = new Set(existingNames)
  if (!allNames.has(prefix)) {
    return prefix
  }
  for (let i = 1; ; i++) {
    const candidate = prefix + i.toString(10)
    if (!allNames.has(candidate)) {
      return candidate
    }
  }
}

/**
 * File name for saving/exporting a document: the document name stripped of
 * characters unsafe for a file name, falling back to the module prefix when the
 * stripped name is empty.
 */
export function exportFileName(name: string, prefix: string): string {
  const nameEscaped = name.replace(/[^a-zA-Z0-9 _\\-]/g, '')
  if (nameEscaped.trim() !== '') {
    return nameEscaped
  }
  return prefix
}
