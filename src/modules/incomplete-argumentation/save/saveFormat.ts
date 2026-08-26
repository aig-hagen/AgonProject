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
import * as z from 'zod'

import {
  ArgumentIdSaveSchema,
  ExampleSaveExtension,
  type LinksSave,
  LinksSaveSchema,
  loadExampleFromJsonWithSchema,
  loadFromStringWithSchema,
  makeCanLoadFromObject,
  toFormatedJsonString,
  validateLinks,
} from '@/modules/common/argumentation/save/saveFormat'
import type { DeserializationResult } from '@/modules/common/save/load'
import {
  type IafArgumentData,
  IncompleteArgumentation,
} from '@/modules/incomplete-argumentation/model'

const API_VERSION = 'incomplete-argumentation-framework/v1' as const

const IafArgumentsSaveSchema = z.record(
  ArgumentIdSaveSchema,
  z.strictObject({
    name: z.string(),
    x: z.number(),
    y: z.number(),
    uncertain: z.boolean(),
  }),
)

export const SaveSchema = z
  .strictObject({
    apiVersion: z.literal(API_VERSION),
    arguments: IafArgumentsSaveSchema,
    definiteAttacks: LinksSaveSchema,
    uncertainAttacks: LinksSaveSchema,
  })
  .superRefine((data, ctx) => {
    validateLinks(ctx, data.arguments, data.definiteAttacks, data.uncertainAttacks)
  })

export type Save = z.infer<typeof SaveSchema>

export function saveAsString(argumentation: IncompleteArgumentation<IafArgumentData>): string {
  const argumentsSave = Object.create(null)
  for (const [argumentId, argumentData] of argumentation.arguments()) {
    argumentsSave[argumentId] = {
      name: argumentData.name,
      x: argumentData.x,
      y: argumentData.y,
      uncertain: argumentData.uncertain,
    }
  }
  const definiteAttacksSave: LinksSave = []
  for (const [sourceId, targetId] of argumentation.definiteAttacks()) {
    definiteAttacksSave.push([sourceId, targetId])
  }
  const uncertainAttacksSave: LinksSave = []
  for (const [sourceId, targetId] of argumentation.uncertainAttacks()) {
    uncertainAttacksSave.push([sourceId, targetId])
  }
  const save: Save = {
    apiVersion: API_VERSION,
    arguments: argumentsSave,
    definiteAttacks: definiteAttacksSave,
    uncertainAttacks: uncertainAttacksSave,
  }
  return toFormatedJsonString(save)
}

export function loadFromString(
  dataString: string,
  fileName: string,
): DeserializationResult<IncompleteArgumentation<IafArgumentData>> {
  return loadFromStringWithSchema(SaveSchema, dataString, fileName, (data) => {
    const argumentation = new IncompleteArgumentation<IafArgumentData>()
    for (const [id, argumentData] of Object.entries(data.arguments)) {
      const numericId = parseInt(id, 10)
      argumentation.addArgument(numericId, {
        name: argumentData.name,
        x: argumentData.x,
        y: argumentData.y,
        uncertain: argumentData.uncertain,
      })
    }
    for (const [sourceId, targetId] of data.definiteAttacks) {
      argumentation.addDefiniteAttack(sourceId, targetId)
    }
    for (const [sourceId, targetId] of data.uncertainAttacks) {
      argumentation.addUncertainAttack(sourceId, targetId)
    }
    return argumentation
  })
}

export const ExampleSaveSchema = SaveSchema.extend(ExampleSaveExtension)

export function loadExampleFromJson(json: unknown) {
  return loadExampleFromJsonWithSchema(ExampleSaveSchema, json, (data) => {
    const framework = new IncompleteArgumentation<IafArgumentData>()
    for (const [id, argumentData] of Object.entries(data.arguments)) {
      framework.addArgument(parseInt(id, 10), {
        name: argumentData.name,
        x: argumentData.x,
        y: argumentData.y,
        uncertain: argumentData.uncertain,
      })
    }
    for (const [sourceId, targetId] of data.definiteAttacks) {
      framework.addDefiniteAttack(sourceId, targetId)
    }
    for (const [sourceId, targetId] of data.uncertainAttacks) {
      framework.addUncertainAttack(sourceId, targetId)
    }
    return framework
  })
}

export const canLoadFromObject = makeCanLoadFromObject(API_VERSION)
