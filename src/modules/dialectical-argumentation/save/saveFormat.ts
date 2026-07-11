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
  loadExampleFromJsonWithSchema,
  loadFromStringWithSchema,
  makeCanLoadFromObject,
  toFormatedJsonString,
} from '@/modules/common/argumentation/save/saveFormat'
import type { DeserializationResult } from '@/modules/common/save/load'
import type { FormulaNode } from '@/modules/dialectical-argumentation/condition/formula'
import { FormulaNodeSchema } from '@/modules/dialectical-argumentation/condition/formulaSchema'
import { type AdfArgumentData, DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'

const API_VERSION = 'dialectical-argumentation-framework/v1' as const

const AnnotationPositionSaveSchema = z.strictObject({
  angle: z.number(),
  distance: z.number(),
})

// Links are fully derived from conditions, so only arguments are saved.
// condition is validated separately via FormulaNodeSchema after schema parse.
const AdfArgumentsSaveSchema = z.record(
  ArgumentIdSaveSchema,
  z.object({
    name: z.string(),
    x: z.number(),
    y: z.number(),
    condition: z.unknown(),
    conditionAnnotationPosition: AnnotationPositionSaveSchema.optional(),
  }),
)

export const SaveSchema = z.object({
  apiVersion: z.literal(API_VERSION),
  arguments: AdfArgumentsSaveSchema,
})

export type Save = z.infer<typeof SaveSchema>

export function saveAsString(adf: DialecticalArgumentation<AdfArgumentData>): string {
  const argumentsSave: Record<string, AdfArgumentData> = Object.create(null)
  for (const [argumentId, argumentData] of adf.arguments()) {
    argumentsSave[argumentId] = {
      name: argumentData.name,
      x: argumentData.x,
      y: argumentData.y,
      condition: argumentData.condition,
      conditionAnnotationPosition: argumentData.conditionAnnotationPosition,
    }
  }
  return toFormatedJsonString({
    apiVersion: API_VERSION,
    arguments: argumentsSave,
  })
}

export function loadFromString(
  dataString: string,
  fileName: string,
): DeserializationResult<DialecticalArgumentation<AdfArgumentData>> {
  return loadFromStringWithSchema(SaveSchema, dataString, fileName, (data) => {
    const adf = new DialecticalArgumentation<AdfArgumentData>()

    // First pass: add all arguments with their conditions
    for (const [id, argumentData] of Object.entries(data.arguments)) {
      const numericId = parseInt(id, 10)
      const conditionResult = FormulaNodeSchema.safeParse(argumentData.condition)
      const condition: FormulaNode = conditionResult.success
        ? conditionResult.data
        : { type: 'tautology' }
      adf.addArgument(numericId, {
        name: argumentData.name,
        x: argumentData.x,
        y: argumentData.y,
        condition,
        conditionAnnotationPosition: argumentData.conditionAnnotationPosition,
      })
    }

    // Second pass: derive links from conditions (all arguments exist now)
    for (const [id] of adf.arguments()) {
      adf.setCondition(id, adf.getArgument(id).condition)
    }

    return adf
  })
}

export const ExampleSaveSchema = SaveSchema.extend(ExampleSaveExtension)

export function loadExampleFromJson(json: unknown) {
  return loadExampleFromJsonWithSchema(ExampleSaveSchema, json, (data) => {
    const adf = new DialecticalArgumentation<AdfArgumentData>()
    for (const [id, argumentData] of Object.entries(data.arguments)) {
      const numericId = parseInt(id, 10)
      const conditionResult = FormulaNodeSchema.safeParse(argumentData.condition)
      const condition: FormulaNode = conditionResult.success
        ? conditionResult.data
        : { type: 'tautology' }
      adf.addArgument(numericId, {
        name: argumentData.name,
        x: argumentData.x,
        y: argumentData.y,
        condition,
        conditionAnnotationPosition: argumentData.conditionAnnotationPosition,
      })
    }
    for (const [id] of adf.arguments()) {
      adf.setCondition(id, adf.getArgument(id).condition)
    }
    return adf
  })
}

export const canLoadFromObject = makeCanLoadFromObject(API_VERSION)
