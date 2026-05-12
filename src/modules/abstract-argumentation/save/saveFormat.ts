import * as z from 'zod'

import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import {} from '@/modules/bipolar-argumentation/save/saveFormat'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import {
  ArgumentsSaveSchema,
  type LinksSave,
  LinksSaveSchema,
  toFormatedJsonString,
  validateLinks,
} from '@/modules/common/argumentation/save/saveFormat'
import {
  type DeserializationResult,
  JsonSyntaxError,
  ValidationError,
} from '@/modules/common/save/load'

const API_VERSION = 'argumentation-framework/v1' as const

export const SaveSchema = z
  .strictObject({
    apiVersion: z.literal(API_VERSION),
    arguments: ArgumentsSaveSchema,
    attacks: LinksSaveSchema,
  })
  .superRefine((argumentation, ctx) => {
    validateLinks(ctx, argumentation.arguments, argumentation.attacks)
  })

export type Save = z.infer<typeof SaveSchema>

export function saveAsString(argumentation: AbstractArgumentation<ArgumentData>): string {
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
  const save: Save = {
    apiVersion: API_VERSION,
    arguments: argumentsSave,
    attacks: attacksSave,
  }

  return toFormatedJsonString(save)
}

export function loadFromString(
  dtoString: string,
  fileName: string,
): DeserializationResult<AbstractArgumentation<ArgumentData>> {
  let unvalidatedData: unknown
  try {
    unvalidatedData = JSON.parse(dtoString)
  } catch (e) {
    return {
      success: false,
      errors: [new JsonSyntaxError((e as Error).message, fileName)],
    }
  }

  const result = SaveSchema.safeParse(unvalidatedData)
  if (!result.success) {
    return {
      success: false,
      errors: [new ValidationError(z.prettifyError(result.error), fileName)],
    }
  }
  const dto = result.data

  const argumentation = new AbstractArgumentation<ArgumentData>()
  for (const [id, argumentData] of Object.entries(dto.arguments)) {
    const numericId = parseInt(id, 10)
    argumentation.addArgument(numericId, {
      name: argumentData.name,
      x: argumentData.x,
      y: argumentData.y,
    })
  }
  for (const [attackerId, attackedId] of dto.attacks) {
    argumentation.addAttack(attackerId, attackedId)
  }

  return {
    success: true,
    data: argumentation,
  }
}
