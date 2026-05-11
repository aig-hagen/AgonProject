import { expect, test } from 'vitest'

import { datasets } from '@/modules/abstract-argumentation/examples'

test.each(datasets)('Example $name loads', (dataset) => {
  expect(() => dataset.load()).not.toThrow()
})
