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

import { SetAF,type SetAfArgumentData } from '@/modules/collective-attacks-argumentation/model'
import {
  ArgumentIdSaveSchema,
  ExampleSaveExtension,
  loadExampleFromJsonWithSchema,
  loadFromStringWithSchema,
  makeCanLoadFromObject,
  toFormatedJsonString,
} from '@/modules/common/argumentation/save/saveFormat'
import type { DeserializationResult } from '@/modules/common/save/load'

const API_VERSION = 'set-af/v1' as const

const SetAfArgumentsSaveSchema = z.record(
  ArgumentIdSaveSchema,
  z.strictObject({
    name: z.string(),
    x: z.number(),
    y: z.number(),
  }),
)

const SetAfAttacksSaveSchema = z.array(
  z.strictObject({
    id: z.int().nonnegative(),
    attackers: z.array(ArgumentIdSaveSchema),
    target: ArgumentIdSaveSchema,
  }),
)

export const SaveSchema = z
  .strictObject({
    apiVersion: z.literal(API_VERSION),
    arguments: SetAfArgumentsSaveSchema,
    attacks: SetAfAttacksSaveSchema,
  })
  .superRefine((data, ctx) => {
    const knownIds = new Set(Object.keys(data.arguments).map((id) => parseInt(id, 10)))
    data.attacks.forEach(({ attackers, target }, idx) => {
      attackers.forEach((attackerId, aIdx) => {
        if (!knownIds.has(attackerId)) {
          ctx.addIssue({
            code: 'custom',
            message: `Unknown argument \`${attackerId}\`.`,
            path: ['attacks', idx, 'attackers', aIdx],
            params: { id: attackerId },
            input: attackerId,
          })
        }
      })
      if (!knownIds.has(target)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unknown argument \`${target}\`.`,
          path: ['attacks', idx, 'target'],
          params: { id: target },
          input: target,
        })
      }
    })
  })

export type Save = z.infer<typeof SaveSchema>

export function saveAsString(af: SetAF<SetAfArgumentData>): string {
  const argumentsSave = Object.create(null)
  for (const [id, data] of af.arguments()) {
    argumentsSave[id] = { name: data.name, x: data.x, y: data.y }
  }
  const save: Save = {
    apiVersion: API_VERSION,
    arguments: argumentsSave,
    attacks: af.attacks().map((a) => ({ id: a.id, attackers: a.attackers, target: a.target })),
  }
  return toFormatedJsonString(save)
}

export function loadFromString(
  dataString: string,
  fileName: string,
): DeserializationResult<SetAF<SetAfArgumentData>> {
  return loadFromStringWithSchema(SaveSchema, dataString, fileName, (data) => {
    const af = new SetAF<SetAfArgumentData>()
    for (const [id, argData] of Object.entries(data.arguments)) {
      af.addArgument(parseInt(id, 10), { name: argData.name, x: argData.x, y: argData.y })
    }
    for (const { attackers, target } of data.attacks) {
      af.addCollectiveAttack(attackers, target)
    }
    return af
  })
}

export const canLoadFromObject = makeCanLoadFromObject(API_VERSION)

const ExampleSaveSchema = z.object({
  apiVersion: z.literal(API_VERSION),
  ...ExampleSaveExtension,
  arguments: SetAfArgumentsSaveSchema,
  attacks: SetAfAttacksSaveSchema,
})

export function loadExampleFromJson(json: unknown) {
  return loadExampleFromJsonWithSchema(ExampleSaveSchema, json, ({ arguments: args, attacks }) => {
    const af = new SetAF<SetAfArgumentData>()
    for (const [id, argData] of Object.entries(args)) {
      af.addArgument(parseInt(id, 10), { name: argData.name, x: argData.x, y: argData.y })
    }
    for (const { attackers, target } of attacks) {
      af.addCollectiveAttack(attackers, target)
    }
    return af
  })
}
