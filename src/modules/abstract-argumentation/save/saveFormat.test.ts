import { expect, test } from 'vitest'

import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import { loadFromString, saveAsString } from '@/modules/abstract-argumentation/save/saveFormat'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import { JsonSyntaxError, ValidationError } from '@/modules/common/save/load'

const FILE_NAME = 'test.json'

function loadWithErrors(badData: string) {
  const result = loadFromString(badData, FILE_NAME)
  expect(result.errors).toBeDefined()
  return result.errors!
}

test('fail importing JSON with syntax error', () => {
  const badData = '{[}'

  const errors = loadWithErrors(badData)

  expect.soft(errors[0]).toBeInstanceOf(JsonSyntaxError)
  expect
    .soft(errors[0]?.message)
    .toBe(
      "The provided file `test.json` is not a valid JSON file: Expected property name or '}' in JSON at position 1 (line 1 column 2)",
    )
})

test('fail importing JSON with missing property', () => {
  const data = {
    apiVersion: 'argumentation-framework/v1',
    arguments: {},
  }
  const stringifiedData = JSON.stringify(data)

  const errors = loadWithErrors(stringifiedData)

  expect(errors).toHaveLength(1)
  expect.soft(errors[0]).toBeInstanceOf(ValidationError)
  expect
    .soft(errors[0]?.message)
    .toEqual(
      'The provided file `test.json` contains invalid data:\n' +
        '\n' +
        '✖ Invalid input: expected array, received undefined\n' +
        '  → at attacks\n',
    )
})

test('fail importing JSON with invalid id', () => {
  const stringifiedData = `{
    "apiVersion": "argumentation-framework/v1",
    "arguments": {
      "a1": {
        "name": "aName",
        "x": 0,
        "y": 0
      }
    },
    "attacks": []
  }`

  const errors = loadWithErrors(stringifiedData)
  expect(errors).toHaveLength(1)
  expect.soft(errors[0]).toBeInstanceOf(ValidationError)
  expect
    .soft(errors[0]?.message)
    .toEqual(
      'The provided file `test.json` contains invalid data:\n' +
        '\n' +
        '✖ Invalid key in record\n' +
        '  → at arguments.a1\n',
    )
})

test('fail importing JSON with duplicate attack', () => {
  const data = {
    apiVersion: 'argumentation-framework/v1',
    arguments: {
      1: {
        name: 'aName',
        x: 0,
        y: 0,
      },
      2: {
        name: 'aName',
        x: 0,
        y: 0,
      },
    },
    attacks: [
      [1, 2],
      [1, 2],
    ],
  }
  const stringifiedData = JSON.stringify(data)

  const errors = loadWithErrors(stringifiedData)
  expect(errors).toHaveLength(1)
  expect.soft(errors[0]).toBeInstanceOf(ValidationError)
  expect
    .soft(errors[0]?.message)
    .toEqual(
      'The provided file `test.json` contains invalid data:\n' +
        '\n' +
        '✖ Duplicate attack from `1` to `2`.\n' +
        '  → at attacks[0]\n' +
        '✖ Duplicate attack from `1` to `2`.\n' +
        '  → at attacks[1]\n',
    )
})

test('fail importing JSON with unknown attacks', () => {
  const data = {
    apiVersion: 'argumentation-framework/v1',
    arguments: {},
    attacks: [[1, 2]],
  }
  const stringifiedData = JSON.stringify(data)

  const errors = loadWithErrors(stringifiedData)
  expect(errors).toHaveLength(1)
  expect.soft(errors[0]).toBeInstanceOf(ValidationError)
  expect
    .soft(errors[0]?.message)
    .toEqual(
      'The provided file `test.json` contains invalid data:\n' +
        '\n' +
        '✖ Unkonwn argument `1`.\n' +
        '  → at attacks[0][0]\n' +
        '✖ Unkonwn argument `2`.\n' +
        '  → at attacks[0][1]\n',
    )
})

test('load successfully', () => {
  const argumentation = new AbstractArgumentation<ArgumentData>()
  argumentation.addArgument(0, {
    name: 'name1',
    x: 1,
    y: 2,
  })
  argumentation.addArgument(1, {
    name: 'aName2',
    x: 3,
    y: 4,
  })
  argumentation.addAttack(0, 1)
  argumentation.addAttack(1, 0)
  argumentation.addAttack(1, 1)
  const stringifiedData = saveAsString(argumentation)

  const result = loadFromString(stringifiedData, FILE_NAME)

  expect(result.success).toBeTruthy()
  expect(result.data).toBeDefined()
  const loadedArgumentation = result.data!
  expect(loadedArgumentation.arguments()).toEqual(argumentation.arguments())
  expect(loadedArgumentation.attacks()).toEqual(argumentation.attacks())
})
