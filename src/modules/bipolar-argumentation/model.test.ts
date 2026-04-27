import { test, expect } from 'vitest'
import { produce, type Patch } from 'immer'
import { BipoloarArgumentation } from './model'

test('works with immer', () => {
  const argumentation = new BipoloarArgumentation<undefined>()
  argumentation.addArgument(1, undefined)
  argumentation.addArgument(2, undefined)
  argumentation.addAttack(1, 2)

  const changes: Patch[] = []
  const inverseChanges: Patch[] = []
  const nextArgumentation = produce(
    argumentation,
    (draft) => {
      draft.addSupport(1, 2)
    },
    (patches, inversePatches) => {
      changes.push(...patches)
      inverseChanges.push(...inversePatches)
    },
  )

  expect(nextArgumentation).not.toEqual(argumentation)
  expect(changes).toStrictEqual([
    {
      op: 'replace',
      path: ['g', 'e', 1, 2],
      value: 's',
    },
  ])
  expect(inverseChanges).toEqual([
    {
      op: 'replace',
      path: ['g', 'e', 1, 2],
      value: undefined,
    },
  ])
})
