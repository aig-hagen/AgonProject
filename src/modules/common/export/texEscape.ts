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
const TEX_SPECIAL_CHARS: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  $: '\\$',
  '&': '\\&',
  '%': '\\%',
  '#': '\\#',
  _: '\\_',
  '^': '\\textasciicircum{}',
  '~': '\\textasciitilde{}',
}

/** Escapes LaTeX-special characters in `text` so it can be pasted as literal TeX source. */
export function escapeTexText(text: string): string {
  return text.replace(/[\\{}$&%#_^~]/g, (char) => TEX_SPECIAL_CHARS[char]!)
}

// Combining marks (as produced by NFD) mapped to LaTeX text accent commands.
const TEX_ACCENTS: Record<string, string> = {
  '̀': '`',
  '́': "'",
  '̂': '^',
  '̃': '~',
  '̄': '=',
  '̆': 'u',
  '̇': '.',
  '̈': '"',
  '̊': 'r',
  '̋': 'H',
  '̌': 'v',
  '̧': 'c',
  '̨': 'k',
}

const TEX_TEXT_LETTERS: Record<string, string> = {
  ß: '\\ss{}',
  æ: '\\ae{}',
  Æ: '\\AE{}',
  ø: '\\o{}',
  Ø: '\\O{}',
  œ: '\\oe{}',
  Œ: '\\OE{}',
  ł: '\\l{}',
  Ł: '\\L{}',
}

const GREEK_NAMES = [
  'alpha',
  'beta',
  'gamma',
  'delta',
  'epsilon',
  'zeta',
  'eta',
  'theta',
  'iota',
  'kappa',
  'lambda',
  'mu',
  'nu',
  'xi',
  'o',
  'pi',
  'rho',
  'varsigma',
  'sigma',
  'tau',
  'upsilon',
  'phi',
  'chi',
  'psi',
  'omega',
]
// Uppercase Greek letters without a TeX macro look like their Latin counterparts.
const GREEK_UPPER_LATIN: Record<string, string> = {
  Α: 'A',
  Β: 'B',
  Ε: 'E',
  Ζ: 'Z',
  Η: 'H',
  Ι: 'I',
  Κ: 'K',
  Μ: 'M',
  Ν: 'N',
  Ο: 'O',
  Ρ: 'P',
  Τ: 'T',
  Χ: 'X',
}

const TEX_MATH_SYMBOLS: Record<string, string> = {
  ...Object.fromEntries(
    GREEK_NAMES.map((name, i) => [
      String.fromCodePoint(0x3b1 + i),
      name === 'o' ? 'o' : `\\${name}`,
    ]),
  ),
  ...Object.fromEntries(
    GREEK_NAMES.filter((name) => name !== 'varsigma').map((name, i) => {
      const char = String.fromCodePoint(0x391 + (i >= 17 ? i + 1 : i))
      return [char, GREEK_UPPER_LATIN[char] ?? `\\${name[0]!.toUpperCase()}${name.slice(1)}`]
    }),
  ),
  '¬': '\\neg',
  '∧': '\\wedge',
  '∨': '\\vee',
  '→': '\\to',
  '′': "'",
  '×': '\\times',
  '≤': '\\leq',
  '≥': '\\geq',
  '≠': '\\neq',
}

const TEX_MATH_SPECIAL_CHARS: Record<string, string> = {
  '\\': '\\backslash',
  '{': '\\{',
  '}': '\\}',
  $: '\\$',
  '&': '\\&',
  '%': '\\%',
  '#': '\\#',
  '~': '\\sim',
  ' ': '\\ ',
}

function textCharToTex(char: string): string {
  const special = TEX_SPECIAL_CHARS[char] ?? TEX_TEXT_LETTERS[char]
  if (special !== undefined) return special
  if (/[\x20-\x7e]/.test(char)) return char
  const math = TEX_MATH_SYMBOLS[char]
  if (math !== undefined) return `$${math}$`
  const [base, ...marks] = char.normalize('NFD')
  if (base === undefined || !/[A-Za-z]/.test(base) || marks.length === 0) return ''
  if (!marks.every((mark) => TEX_ACCENTS[mark] !== undefined)) return ''
  return marks.reduce((tex, mark) => `\\${TEX_ACCENTS[mark]}{${tex}}`, base)
}

/** Converts arbitrary (Unicode) text into text-mode TeX; unsupported characters are dropped. */
export function textToTex(text: string): string {
  return [...text.normalize('NFC')].map(textCharToTex).join('')
}

const isWordChar = (char: string) =>
  /[\p{L}\p{M}]/u.test(char) && TEX_MATH_SYMBOLS[char] === undefined

/**
 * Converts an argument name into math-mode TeX: `a_1` → `a_{1}`, `Alibi` → `\mathit{Alibi}`,
 * `α` → `\alpha`, and accented words become `\textit{…}`.
 */
export function nameToMathTex(name: string): string {
  const chars = [...name.normalize('NFC')]
  const parts: string[] = []
  let i = 0
  while (i < chars.length) {
    const char = chars[i]!
    if (isWordChar(char)) {
      let end = i
      while (end < chars.length && isWordChar(chars[end]!)) end++
      const word = chars.slice(i, end).join('')
      if (!/^[A-Za-z]+$/.test(word)) parts.push(`\\textit{${textToTex(word)}}`)
      else parts.push(word.length === 1 ? word : `\\mathit{${word}}`)
      i = end
      continue
    }
    if (char === '_' || char === '^') {
      let end = i + 1
      while (end < chars.length && /[A-Za-z0-9]/.test(chars[end]!)) end++
      if (end > i + 1) {
        parts.push(`${char}{${nameToMathTex(chars.slice(i + 1, end).join(''))}}`)
        i = end
        continue
      }
      parts.push(char === '_' ? '\\_' : '\\text{\\textasciicircum}')
      i++
      continue
    }
    const symbol = TEX_MATH_SYMBOLS[char] ?? TEX_MATH_SPECIAL_CHARS[char]
    if (symbol !== undefined) {
      // Keeps a macro like `\alpha` from running into a following letter.
      parts.push(/\\[a-zA-Z]+$/.test(symbol) ? `${symbol} ` : symbol)
    } else if (/[\x21-\x7e]/.test(char)) {
      parts.push(char)
    } else {
      const text = textCharToTex(char)
      if (text) parts.push(`\\text{${text}}`)
    }
    i++
  }
  return parts.join('').trimEnd()
}
