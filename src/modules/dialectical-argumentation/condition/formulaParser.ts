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

import type { FormulaNode } from '@/modules/dialectical-argumentation/condition/formula'

type Token =
  | { kind: 'taut' }
  | { kind: 'cont' }
  | { kind: 'not' }
  | { kind: 'and' }
  | { kind: 'or' }
  | { kind: 'lparen' }
  | { kind: 'rparen' }
  | { kind: 'name'; value: string }
  | { kind: 'eof' }

const SPECIAL = new Set(['⊤', '⊥', '¬', '∧', '∨', '(', ')'])

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < text.length) {
    const ch = text[i]!
    if (/\s/.test(ch)) {
      i++
      continue
    }
    if (ch === '⊤') {
      tokens.push({ kind: 'taut' })
      i++
      continue
    }
    if (ch === '⊥') {
      tokens.push({ kind: 'cont' })
      i++
      continue
    }
    if (ch === '¬') {
      tokens.push({ kind: 'not' })
      i++
      continue
    }
    if (ch === '∧') {
      tokens.push({ kind: 'and' })
      i++
      continue
    }
    if (ch === '∨') {
      tokens.push({ kind: 'or' })
      i++
      continue
    }
    if (ch === '(') {
      tokens.push({ kind: 'lparen' })
      i++
      continue
    }
    if (ch === ')') {
      tokens.push({ kind: 'rparen' })
      i++
      continue
    }
    let j = i
    while (j < text.length && !/\s/.test(text[j]!) && !SPECIAL.has(text[j]!)) j++
    if (j > i) {
      tokens.push({ kind: 'name', value: text.slice(i, j) })
      i = j
    } else {
      i++
    }
  }
  tokens.push({ kind: 'eof' })
  return tokens
}

class Parser {
  private pos = 0

  constructor(
    private readonly tokens: Token[],
    private readonly argNameToId: Map<string, number>,
  ) {}

  private peek(): Token {
    return this.tokens[this.pos]!
  }
  private consume(): Token {
    return this.tokens[this.pos++]!
  }

  parseRoot(): FormulaNode {
    const node = this.parseOr()
    if (this.peek().kind !== 'eof') throw new Error('unexpected token after expression')
    return node
  }

  private parseOr(): FormulaNode {
    const parts = [this.parseAnd()]
    while (this.peek().kind === 'or') {
      this.consume()
      parts.push(this.parseAnd())
    }
    return parts.length === 1 ? parts[0]! : { type: 'disjunction', children: parts }
  }

  private parseAnd(): FormulaNode {
    const parts = [this.parseNot()]
    while (this.peek().kind === 'and') {
      this.consume()
      parts.push(this.parseNot())
    }
    return parts.length === 1 ? parts[0]! : { type: 'conjunction', children: parts }
  }

  private parseNot(): FormulaNode {
    if (this.peek().kind === 'not') {
      this.consume()
      return { type: 'negation', child: this.parseNot() }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): FormulaNode {
    const tok = this.peek()
    if (tok.kind === 'taut') {
      this.consume()
      return { type: 'tautology' }
    }
    if (tok.kind === 'cont') {
      this.consume()
      return { type: 'contradiction' }
    }
    if (tok.kind === 'name') {
      this.consume()
      const id = this.argNameToId.get(tok.value)
      if (id === undefined) throw new Error(`unknown argument: ${tok.value}`)
      return { type: 'atom', argumentId: id }
    }
    if (tok.kind === 'lparen') {
      this.consume()
      const inner = this.parseOr()
      if (this.peek().kind !== 'rparen') throw new Error('expected )')
      this.consume()
      return inner
    }
    throw new Error(`unexpected token: ${tok.kind}`)
  }
}

export function parseFormula(text: string, argNameToId: Map<string, number>): FormulaNode | null {
  const trimmed = text.trim()
  if (trimmed.length === 0) return null
  try {
    return new Parser(tokenize(trimmed), argNameToId).parseRoot()
  } catch {
    return null
  }
}
