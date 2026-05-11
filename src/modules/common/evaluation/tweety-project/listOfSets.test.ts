import { expect, test } from 'vitest'

import { parserListOfSets } from '@/modules/common/evaluation/tweety-project/listOfSets'

test.each([
  ['[]', []],
  ['[{}]', [[]]],
  ['[{1}]', [[1]]],
  ['[{1,2}]', [[1, 2]]],
  ['[{1,2},{}]', [[1, 2], []]],
  ['[{1,2},{1}]', [[1, 2], [1]]],
  [
    '[{1,2},{1,2}]',
    [
      [1, 2],
      [1, 2],
    ],
  ],
  [
    ' [ { 1, 2  },  {1 , 2   } ] ',
    [
      [1, 2],
      [1, 2],
    ],
  ],
  ['[{}]', [[]]],
])('parserListOfSets(%s) => %o', (answer, expected) => {
  const extensions = parserListOfSets(answer)
  expect(extensions).toStrictEqual(expected)
})

test.each(['[', ']', '[{}', '[{}{}]', '[{a}]'])('parserListOfSets(%s) throws error', (answer) => {
  expect(() => parserListOfSets(answer)).toThrow('Parsing failed')
})
