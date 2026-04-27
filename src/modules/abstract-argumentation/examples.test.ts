import { test, expect } from 'vitest'

import { datasets } from './examples'

test.each(datasets)('Example $name loads', (dataset) => {
  expect(() => dataset.load()).not.toThrow()
})
