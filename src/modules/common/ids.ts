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
export class IdMapping<InputIdT, OutputIdT> {
  private perInputIdOutputId = new Map<InputIdT, OutputIdT>()
  private perOutputIdInputId = new Map<OutputIdT, InputIdT>()

  add(inputId: InputIdT, outputId: OutputIdT) {
    this.perInputIdOutputId.set(inputId, outputId)
    this.perOutputIdInputId.set(outputId, inputId)
  }

  delete(inputId: InputIdT): OutputIdT {
    const outputId = this.getOrFail(inputId)
    this.perInputIdOutputId.delete(inputId)
    this.perOutputIdInputId.delete(outputId)
    return outputId
  }

  has(inputId: InputIdT): boolean {
    return this.perInputIdOutputId.has(inputId)
  }

  getOrFail(inputId: InputIdT): OutputIdT {
    if (this.has(inputId)) {
      return this.perInputIdOutputId.get(inputId)!
    }
    throw new Error('No ID mapping found.')
  }

  inputIds(): Iterable<InputIdT> {
    return this.perInputIdOutputId.keys()
  }

  hasReverse(outputId: OutputIdT): boolean {
    return this.perOutputIdInputId.has(outputId)
  }

  getOrFailReverse(outputId: OutputIdT): InputIdT {
    if (this.hasReverse(outputId)) {
      return this.perOutputIdInputId.get(outputId)!
    }
    throw new Error('No ID mapping found.')
  }
}

export class IdGenerator {
  private nextId: number = 0

  generate() {
    return this.nextId++
  }

  forward(nextId: number) {
    if (nextId >= this.nextId) {
      this.nextId = nextId + 1
    }
  }
}

export type UUID = `${string}-${string}-${string}-${string}-${string}`
export function generateUUID(): UUID {
  return crypto.randomUUID()
}
