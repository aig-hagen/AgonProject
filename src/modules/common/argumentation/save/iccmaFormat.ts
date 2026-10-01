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
import {
  type DeserializationResult,
  type TextImportConfig,
  TextSyntaxError,
} from '@/modules/common/save/load'

export interface IccmaLine {
  lineNo: number
  tokens: string[]
}

class IccmaLineError {
  constructor(
    readonly lineNo: number,
    readonly message: string,
  ) {}
}

export function failLine(line: IccmaLine, message: string): never {
  throw new IccmaLineError(line.lineNo, message)
}

function contentLines(text: string): IccmaLine[] {
  const lines: IccmaLine[] = []
  text.split(/\r?\n/).forEach((raw, index) => {
    const hashIndex = raw.indexOf('#')
    const content = (hashIndex === -1 ? raw : raw.slice(0, hashIndex)).trim()
    if (content !== '') lines.push({ lineNo: index + 1, tokens: content.split(/\s+/) })
  })
  return lines
}

const NATURAL = /^\d+$/

function parseHeader(line: IccmaLine | undefined): { type: string; n: number } | undefined {
  const tokens = line?.tokens
  if (tokens?.length !== 3 || tokens[0] !== 'p' || !NATURAL.test(tokens[2]!)) return undefined
  return { type: tokens[1]!, n: parseInt(tokens[2]!, 10) }
}

/** Reads the `p <type> <n>` problem line, or `undefined` if the text has none. */
export function readIccmaHeader(text: string): { type: string; n: number } | undefined {
  return parseHeader(contentLines(text)[0])
}

/** Parses the 1-based ICCMA index `token` into a 0-based model id. */
export function iccmaIndex(line: IccmaLine, token: string | undefined, n: number): number {
  const value = token !== undefined && NATURAL.test(token) ? parseInt(token, 10) : 0
  if (value < 1 || value > n) failLine(line, `"${token ?? ''}" is not an index between 1 and ${n}.`)
  return value - 1
}

export function expectArity(line: IccmaLine, ...counts: number[]) {
  if (!counts.includes(line.tokens.length)) {
    failLine(line, `unexpected number of entries in "${line.tokens.join(' ')}".`)
  }
}

/** Imported elements are named after their ICCMA index, matching the generator. */
export function iccmaName(id: number): string {
  return String(id + 1)
}

export function parseIccma<T>(
  text: string,
  type: string,
  fileName: string,
  build: (n: number, lines: IccmaLine[]) => T,
): DeserializationResult<T> {
  const fail = (detail: string): DeserializationResult<T> => ({
    success: false,
    errors: [new TextSyntaxError(detail, fileName)],
  })
  const [headerLine, ...lines] = contentLines(text)
  const header = parseHeader(headerLine)
  if (header?.type !== type) {
    return fail(`Line ${headerLine?.lineNo ?? 1}: expected the header "p ${type} <n>".`)
  }
  try {
    return { success: true, data: build(header.n, lines) }
  } catch (error) {
    if (error instanceof IccmaLineError) return fail(`Line ${error.lineNo}: ${error.message}`)
    throw error
  }
}

export function makeIccmaImport<T>(
  type: string,
  extension: string,
  build: (n: number, lines: IccmaLine[]) => T,
): TextImportConfig<T> {
  return {
    extension,
    canLoad: (text) => readIccmaHeader(text)?.type === type,
    load: (text, fileName) => parseIccma(text, type, fileName, build),
  }
}
