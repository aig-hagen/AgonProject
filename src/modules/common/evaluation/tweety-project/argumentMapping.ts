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
import { IdMapping } from '@/modules/common/ids'

export function buildArgumentIdMapping<K>(
  argumentsIterable: Iterable<[K, unknown]>,
): { numberOfArguments: number; idMapping: IdMapping<K, number> } {
  let numberOfArguments = 0
  const idMapping = new IdMapping<K, number>()
  for (const [argumentId] of argumentsIterable) {
    idMapping.add(argumentId, ++numberOfArguments)
  }
  return { numberOfArguments, idMapping }
}
