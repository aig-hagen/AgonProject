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
import * as z from 'zod'

import {
  ArgumentIdSaveSchema,
  ExampleSaveExtension,
  loadExampleFromJsonWithSchema,
  loadFromStringWithSchema,
  makeCanLoadFromObject,
  toFormatedJsonString,
} from '@/modules/common/argumentation/save/saveFormat'
import type { DeserializationResult } from '@/modules/common/save/load'
import {
  type PafArgumentData,
  ProbabilisticArgumentation,
} from '@/modules/probabilistic-argumentation/model'

const API_VERSION = 'probabilistic-argumentation-framework/v1' as const

const ProbabilitySchema = z.number().min(0).max(1)

const PafArgumentsSaveSchema = z.record(
  ArgumentIdSaveSchema,
  z.strictObject({
    name: z.string(),
    x: z.number(),
    y: z.number(),
    probability: ProbabilitySchema,
  }),
)

const PafAttacksSaveSchema = z.array(
  z.tuple([ArgumentIdSaveSchema, ArgumentIdSaveSchema, ProbabilitySchema]),
)

export const SaveSchema = z
  .strictObject({
    apiVersion: z.literal(API_VERSION),
    arguments: PafArgumentsSaveSchema,
    attacks: PafAttacksSaveSchema,
  })
  .superRefine((data, ctx) => {
    const knownIds = new Set(Object.keys(data.arguments).map((id) => parseInt(id, 10)))
    data.attacks.forEach(([sourceId, targetId], idx) => {
      if (!knownIds.has(sourceId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unknown argument \`${sourceId}\`.`,
          path: ['attacks', idx, 0],
          params: { id: sourceId },
          input: sourceId,
        })
      }
      if (!knownIds.has(targetId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unknown argument \`${targetId}\`.`,
          path: ['attacks', idx, 1],
          params: { id: targetId },
          input: targetId,
        })
      }
    })
  })

export type Save = z.infer<typeof SaveSchema>

export function saveAsString(
  argumentation: ProbabilisticArgumentation<PafArgumentData>,
): string {
  const argumentsSave = Object.create(null)
  for (const [id, data] of argumentation.arguments()) {
    argumentsSave[id] = {
      name: data.name,
      x: data.x,
      y: data.y,
      probability: data.probability,
    }
  }
  const attacksSave: [number, number, number][] = []
  for (const [sourceId, targetId, prob] of argumentation.attacks()) {
    attacksSave.push([sourceId, targetId, prob])
  }
  const save: Save = {
    apiVersion: API_VERSION,
    arguments: argumentsSave,
    attacks: attacksSave,
  }
  return toFormatedJsonString(save)
}

export function loadFromString(
  dataString: string,
  fileName: string,
): DeserializationResult<ProbabilisticArgumentation<PafArgumentData>> {
  return loadFromStringWithSchema(SaveSchema, dataString, fileName, (data) => {
    const argumentation = new ProbabilisticArgumentation<PafArgumentData>()
    for (const [id, argumentData] of Object.entries(data.arguments)) {
      const numericId = parseInt(id, 10)
      argumentation.addArgument(numericId, {
        name: argumentData.name,
        x: argumentData.x,
        y: argumentData.y,
        probability: argumentData.probability,
      })
    }
    for (const [sourceId, targetId, prob] of data.attacks) {
      argumentation.addAttack(sourceId, targetId, prob)
    }
    return argumentation
  })
}

export const ExampleSaveSchema = SaveSchema.extend(ExampleSaveExtension)

export function loadExampleFromJson(json: unknown) {
  return loadExampleFromJsonWithSchema(ExampleSaveSchema, json, (data) => {
    const framework = new ProbabilisticArgumentation<PafArgumentData>()
    for (const [id, argumentData] of Object.entries(data.arguments)) {
      framework.addArgument(parseInt(id, 10), {
        name: argumentData.name,
        x: argumentData.x,
        y: argumentData.y,
        probability: argumentData.probability,
      })
    }
    for (const [sourceId, targetId, prob] of data.attacks) {
      framework.addAttack(sourceId, targetId, prob)
    }
    return framework
  })
}

export const canLoadFromObject = makeCanLoadFromObject(API_VERSION)
