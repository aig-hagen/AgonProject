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

const LCurly = createToken({ name: 'LBrace', pattern: /\{/ })
const RCurly = createToken({ name: 'RBrace', pattern: /\}/ })
const Comma = createToken({ name: 'Comma', pattern: /,/ })
const Equals = createToken({ name: 'Equals', pattern: /=/ })
const Num = createToken({ name: 'Num', pattern: /[0-9]+(\.[0-9]+)?/ })
const WhiteSpace = createToken({ name: 'WS', pattern: /\s+/, group: Lexer.SKIPPED })

const allTokens = [WhiteSpace, LCurly, RCurly, Comma, Equals, Num]
const lexer = new Lexer(allTokens)

class ScoresParser extends EmbeddedActionsParser {
  public scores!: () => Array<{ argumentId: number; score: number }>

  constructor() {
    super(allTokens)

    // oxlint-disable-next-line typescript/no-this-alias -- Using $ follows the example from https://chevrotain.io
    const $ = this

    $.RULE('scores', () => {
      const entries: Array<{ argumentId: number; score: number }> = []
      $.CONSUME(LCurly)
      $.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          const argumentId = Number($.CONSUME(Num).image)
          $.CONSUME(Equals)
          const score = Number($.CONSUME2(Num).image)
          entries.push({ argumentId, score })
        },
      })
      $.CONSUME(RCurly)
      return entries
    })

    this.performSelfAnalysis()
  }
}

const parser = new ScoresParser()

export function parserScores(answer: string): Array<{ argumentId: number; score: number }> {
  const { tokens, errors: lexErrors } = lexer.tokenize(answer)
  if (lexErrors.length > 0) throw new Error('Parsing failed')

  parser.input = tokens
  const result = parser.scores()
  if (parser.errors.length) throw new Error('Parsing failed')

  return result
}
