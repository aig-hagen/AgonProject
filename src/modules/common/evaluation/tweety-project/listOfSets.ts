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
import { createToken, EmbeddedActionsParser, Lexer } from 'chevrotain'

const LSquare = createToken({ name: 'LBracket', pattern: /\[/ })
const RSquare = createToken({ name: 'RBracket', pattern: /\]/ })
const LCurly = createToken({ name: 'LBrace', pattern: /\{/ })
const RCurly = createToken({ name: 'RBrace', pattern: /\}/ })
const Comma = createToken({ name: 'Comma', pattern: /,/ })
const Integer = createToken({ name: 'Integer', pattern: /0|[1-9]\d*/ })
const WhiteSpace = createToken({ name: 'WS', pattern: /\s+/, group: Lexer.SKIPPED })

const allTokens = [WhiteSpace, LSquare, RSquare, LCurly, RCurly, Comma, Integer]
const lexer = new Lexer(allTokens)

class ListOfSetsParser extends EmbeddedActionsParser {
  public list!: () => number[][]
  public set!: () => number[]

  constructor() {
    super(allTokens)

    // oxlint-disable-next-line typescript/no-this-alias -- Using $ follows the example from https://chevrotain.io
    const $ = this

    $.RULE('list', () => {
      const sets: number[][] = []
      $.CONSUME(LSquare)
      $.MANY_SEP({
        SEP: Comma,
        DEF: () => sets.push($.SUBRULE($.set)),
      })
      $.CONSUME(RSquare)
      return sets
    })

    $.RULE('set', () => {
      const nums: number[] = []
      $.CONSUME(LCurly)
      $.MANY_SEP({
        SEP: Comma,
        DEF: () => nums.push(Number($.CONSUME(Integer).image)),
      })
      $.CONSUME(RCurly)
      return nums
    })

    this.performSelfAnalysis()
  }
}

const parser = new ListOfSetsParser()

export function parserListOfSets(answer: string): number[][] {
  const { tokens, errors: lexErrors } = lexer.tokenize(answer)
  if (lexErrors.length > 0) throw new Error(`Parsing failed`)

  parser.input = tokens
  const result = parser.list()
  if (parser.errors.length) throw new Error(`Parsing failed`)

  return result
}
