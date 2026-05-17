/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
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
// Unicode code point are like ASCII codes but for Unicode.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt
export const a = 97
export const z = 122

export function getNextName(names: Iterable<string>) {
  let nextNameAsCodePoint = a

  for (const name of names) {
    if (name.length != 1) {
      continue
    }
    const nameCodePoint = name.codePointAt(0)!
    if (nameCodePoint < nextNameAsCodePoint) {
      continue
    }
    if (nameCodePoint === z) {
      return ''
    }
    if (nameCodePoint < z) {
      nextNameAsCodePoint = nameCodePoint + 1
    }
  }
  return String.fromCodePoint(nextNameAsCodePoint)
}
