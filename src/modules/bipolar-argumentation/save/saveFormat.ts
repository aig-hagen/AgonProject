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

import { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import {
  ArgumentsSaveSchema,
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

const API_VERSION = 'bipolar-argumentation-framework/v1' as const

export const SaveSchema = z
  .strictObject({
    apiVersion: z.literal(API_VERSION),
    arguments: ArgumentsSaveSchema,
    attacks: LinksSaveSchema,
    supports: LinksSaveSchema,
  })
  .superRefine((argumentation, ctx) => {
    validateLinks(ctx, argumentation.arguments, argumentation.attacks, argumentation.supports)
  })

export const ExampleSaveSchema = SaveSchema.extend(ExampleSaveExtension)

export type Save = z.infer<typeof SaveSchema>

export function saveAsString(
  argumentation: BipoloarArgumentation<ArgumentData>,
  name: string,
): string {
  const argumentsSave = Object.create(null)
  for (const [argumentId, argumentData] of argumentation.arguments()) {
    argumentsSave[argumentId] = {
      name: argumentData.name,
      x: argumentData.x,
      y: argumentData.y,
    }
  }
  const attacksSave: LinksSave = []
  for (const [attackerId, attackedId] of argumentation.attacks()) {
    attacksSave.push([attackerId, attackedId])
  }
  const supportsSave: LinksSave = []
  for (const [supporterId, supportedId] of argumentation.supports()) {
    supportsSave.push([supporterId, supportedId])
  }
  const save: z.infer<typeof ExampleSaveSchema> = {
    apiVersion: API_VERSION,
    name,
    arguments: argumentsSave,
    attacks: attacksSave,
    supports: supportsSave,
  }

  return toFormatedJsonString(save)
}

export function loadFromString(
  dataString: string,
  fileName: string,
): DeserializationResult<BipoloarArgumentation<ArgumentData>> {
  return loadFromStringWithSchema(ExampleSaveSchema, dataString, fileName, (data) => {
    const argumentation = new BipoloarArgumentation<ArgumentData>()
    for (const [id, argumentData] of Object.entries(data.arguments)) {
      const numericId = parseInt(id, 10)
      argumentation.addArgument(numericId, {
        name: argumentData.name,
        x: argumentData.x,
        y: argumentData.y,
      })
    }
    for (const [attackerId, attackedId] of data.attacks) {
      argumentation.addAttack(attackerId, attackedId)
    }
    for (const [supporterId, supportedId] of data.supports) {
      argumentation.addSupport(supporterId, supportedId)
    }
    return argumentation
  })
}

export function loadExampleFromJson(json: unknown) {
  return loadExampleFromJsonWithSchema(ExampleSaveSchema, json, (data) => {
    const framework = new BipoloarArgumentation<ArgumentData>()
    for (const [id, argumentData] of Object.entries(data.arguments)) {
      framework.addArgument(parseInt(id, 10), {
        name: argumentData.name,
        x: argumentData.x,
        y: argumentData.y,
      })
    }
    for (const [attackerId, attackedId] of data.attacks) {
      framework.addAttack(attackerId, attackedId)
    }
    for (const [supporterId, supportedId] of data.supports) {
      framework.addSupport(supporterId, supportedId)
    }
    return framework
  })
}

export const canLoadFromObject = makeCanLoadFromObject(API_VERSION)
