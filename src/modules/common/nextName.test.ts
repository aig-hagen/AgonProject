import { test, expect } from 'vitest'

import { getNextName } from '@/modules/common/nextName'

const cases: [string[], string][] = [
  [[], 'a'],
  [['a'], 'b'],
  [['a', 'b'], 'c'],
  [['b', 'a'], 'c'],
  [['b'], 'c'],
  [['y'], 'z'],
  [['z'], ''],
]

test.for(cases)(`${getNextName.name}(%o)-> %s`, ([givenNames, expectedNextName]) => {
  const nextName = getNextName(givenNames)
  expect(nextName).toBe(expectedNextName)
})
