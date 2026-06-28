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
export abstract class ImportError {
  abstract message: string
}

export class JsonSyntaxError extends ImportError {
  message: string
  constructor(cause: string, fileName: string) {
    super()
    this.message = `The provided file \`${fileName}\` is not a valid JSON file: ${cause}`
  }
}

export class SchemaMismatchError extends ImportError {
  message: string
  constructor(cause: string) {
    super()
    // The `cause` will already contain a file name
    this.message = `Data does not match the expected schema: ${cause}`
  }
}

export class InvalidDataError extends ImportError {
  message: string
  constructor(cause: string, fileName: string) {
    super()
    this.message = `The provided file \`${fileName}\` contains invalid data: ${cause}`
  }
}

export class ValidationError extends ImportError {
  message: string
  constructor(cause: string, fileName: string) {
    super()
    this.message = `The provided file \`${fileName}\` contains invalid data:

${cause}
`
  }
}

export type DeserializationResult<ValueT> = DeserializationSuccess<ValueT> | DeserializationError

export interface DeserializationSuccess<ValueT> {
  success: true
  data: ValueT
  errors?: never
}
export interface DeserializationError {
  success: false
  data?: never
  errors: ImportError[]
}
