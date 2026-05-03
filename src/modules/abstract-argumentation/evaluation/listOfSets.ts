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
