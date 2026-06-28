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
import { createToken, EmbeddedActionsParser, Lexer } from 'chevrotain'

const LSquare = createToken({ name: 'SQ_LBracket', pattern: /\[/ })
const RSquare = createToken({ name: 'SQ_RBracket', pattern: /\]/ })
const LParen = createToken({ name: 'SQ_LParen', pattern: /\(/ })
const RParen = createToken({ name: 'SQ_RParen', pattern: /\)/ })
const LCurly = createToken({ name: 'SQ_LBrace', pattern: /\{/ })
const RCurly = createToken({ name: 'SQ_RBrace', pattern: /\}/ })
const Comma = createToken({ name: 'SQ_Comma', pattern: /,/ })
const Integer = createToken({ name: 'SQ_Integer', pattern: /0|[1-9]\d*/ })
const WhiteSpace = createToken({ name: 'SQ_WS', pattern: /\s+/, group: Lexer.SKIPPED })

const allTokens = [WhiteSpace, LSquare, RSquare, LParen, RParen, LCurly, RCurly, Comma, Integer]
const lexer = new Lexer(allTokens)

class ListOfSequencesParser extends EmbeddedActionsParser {
  public list!: () => number[][][]
  public sequence!: () => number[][]
  public set!: () => number[]

  constructor() {
    super(allTokens)

    // oxlint-disable-next-line typescript/no-this-alias -- Using $ follows the example from https://chevrotain.io
    const $ = this

    $.RULE('list', () => {
      const sequences: number[][][] = []
      $.CONSUME(LSquare)
      $.MANY_SEP({
        SEP: Comma,
        DEF: () => sequences.push($.SUBRULE($.sequence)),
      })
      $.CONSUME(RSquare)
      return sequences
    })

    $.RULE('sequence', () => {
      const steps: number[][] = []
      $.CONSUME(LParen)
      $.MANY_SEP({
        SEP: Comma,
        DEF: () => steps.push($.SUBRULE($.set)),
      })
      $.CONSUME(RParen)
      return steps
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

const parser = new ListOfSequencesParser()

export function parseListOfSequences(answer: string): number[][][] {
  const { tokens, errors: lexErrors } = lexer.tokenize(answer)
  if (lexErrors.length > 0) throw new Error('Parsing failed')

  parser.input = tokens
  const result = parser.list()
  if (parser.errors.length) throw new Error('Parsing failed')

  return result
}
