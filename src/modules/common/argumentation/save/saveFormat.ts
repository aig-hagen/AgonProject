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
  type DeserializationResult,
  JsonSyntaxError,
  ValidationError,
} from '@/modules/common/save/load'
import { getOrSet } from '@/modules/common/util'

export const ArgumentIdSaveSchema = z.int().nonnegative()
export const ArgumentsSaveSchema = z.record(
  ArgumentIdSaveSchema,
  z.strictObject({
    name: z.string(),
    x: z.number(),
    y: z.number(),
  }),
)
export type ArgumentsSave = z.infer<typeof ArgumentsSaveSchema>

export const LinksSaveSchema = z.array(z.tuple([ArgumentIdSaveSchema, ArgumentIdSaveSchema]))
export type LinksSave = z.infer<typeof LinksSaveSchema>

export function toFormatedJsonString(data: object) {
  return JSON.stringify(data, undefined, 2)
}

export function validateLinks(
  ctx: z.RefinementCtx<unknown>,
  args: ArgumentsSave,
  attacks: LinksSave,
  supports?: LinksSave,
) {
  const knownArgumentIds = new Set(Object.keys(args).map((id) => parseInt(id, 10)))

  const keyLinksNames = [
    {
      name: 'attack',
      key: 'attacks',
      links: attacks,
    },
  ]

  if (supports !== undefined) {
    keyLinksNames.push({
      name: 'attack',
      key: 'supports',
      links: supports,
    })
  }

  for (const { key, links } of keyLinksNames) {
    links.forEach(([sourceId, targetId], idx) => {
      if (!knownArgumentIds.has(sourceId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unkonwn argument \`${sourceId}\`.`,
          path: [key, idx, 0],
          params: { id: sourceId },
          input: sourceId,
        })
      }

      if (!knownArgumentIds.has(targetId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unkonwn argument \`${targetId}\`.`,
          path: [key, idx, 1],
          params: { id: targetId },
          input: targetId,
        })
      }
    })
  }
  const perKeyLinkToPerTargetToPerSeenTargetIdx = new Map<
    string,
    Map<number, Map<number, number>>
  >()
  for (const { key } of keyLinksNames) {
    perKeyLinkToPerTargetToPerSeenTargetIdx.set(key, new Map())
  }

  for (const { key: linkKey, name: linkName, links } of keyLinksNames) {
    links.forEach((link, idx) => {
      const [sourceId, targetId] = link
      let seen = false
      for (const { key: linkKeyChecking, name: linkNameChecking } of keyLinksNames) {
        const perSeenTargetId = getOrSet(
          perKeyLinkToPerTargetToPerSeenTargetIdx.get(linkKeyChecking)!,
          sourceId,
          () => new Map(),
        )

        if (perSeenTargetId.has(targetId)) {
          seen = true
          const duplicateType =
            linkName === linkNameChecking ? linkName : `${linkName} and ${linkNameChecking}`
          const previousIndex = perSeenTargetId.get(targetId)
          ctx.addIssue({
            code: 'custom',
            message: `Duplicate ${duplicateType} from \`${sourceId}\` to \`${targetId}\`.`,
            path: [linkKeyChecking, previousIndex],
            params: { id: targetId },
            input: attacks[previousIndex],
          })
          ctx.addIssue({
            code: 'custom',
            message: `Duplicate ${duplicateType} from \`${sourceId}\` to \`${targetId}\`.`,
            path: [linkKey, idx],
            params: { id: targetId },
            input: link,
          })
        }
      }

      if (!seen) {
        perKeyLinkToPerTargetToPerSeenTargetIdx.get(linkKey)!.get(sourceId)!.set(targetId, idx)
      }
    })
  }
}

export function loadFromStringWithSchema<SchemaT, ResultT>(
  schema: z.ZodType<SchemaT>,
  dataString: string,
  fileName: string,
  createArgumentation: (validatedData: SchemaT) => ResultT,
): DeserializationResult<ResultT> {
  let unvalidatedData: unknown
  try {
    unvalidatedData = JSON.parse(dataString)
  } catch (e) {
    return {
      success: false,
      errors: [new JsonSyntaxError((e as Error).message, fileName)],
    }
  }

  const result = schema.safeParse(unvalidatedData)
  if (!result.success) {
    return {
      success: false,
      errors: [new ValidationError(z.prettifyError(result.error), fileName)],
    }
  }
  const validatedData = result.data

  const argumentation = createArgumentation(validatedData)

  return {
    success: true,
    data: argumentation,
  }
}
