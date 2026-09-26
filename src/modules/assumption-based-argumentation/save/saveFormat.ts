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

import { ABAF, type ABANodeData } from '@/modules/assumption-based-argumentation/model'
import {
  ArgumentIdSaveSchema,
  ExampleSaveExtension,
  loadExampleFromJsonWithSchema,
  loadFromStringWithSchema,
  makeCanLoadFromObject,
  toFormatedJsonString,
} from '@/modules/common/argumentation/save/saveFormat'
import type { DeserializationResult } from '@/modules/common/save/load'

const API_VERSION = 'aba/v1' as const

const NodesSaveSchema = z.record(
  ArgumentIdSaveSchema,
  z.strictObject({
    name: z.string(),
    kind: z.enum(['atom', 'assumption']),
    x: z.number(),
    y: z.number(),
    fact: z.boolean(),
  }),
)

const RulesSaveSchema = z.array(
  z.strictObject({
    id: z.int().nonnegative(),
    head: ArgumentIdSaveSchema,
    body: z.array(ArgumentIdSaveSchema),
  }),
)

const ContrariesSaveSchema = z.record(ArgumentIdSaveSchema, ArgumentIdSaveSchema)

export const SaveSchema = z
  .strictObject({
    apiVersion: z.literal(API_VERSION),
    nodes: NodesSaveSchema,
    rules: RulesSaveSchema,
    contraries: ContrariesSaveSchema,
  })
  .superRefine((data, ctx) => {
    const knownIds = new Set(Object.keys(data.nodes).map((id) => parseInt(id, 10)))
    const require = (id: number, path: (string | number)[]) => {
      if (!knownIds.has(id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unknown node \`${id}\`.`,
          path,
          params: { id },
          input: id,
        })
      }
    }
    data.rules.forEach((rule, idx) => {
      require(rule.head, ['rules', idx, 'head'])
      rule.body.forEach((atom, bIdx) => require(atom, ['rules', idx, 'body', bIdx]))
    })
    for (const [assumption, target] of Object.entries(data.contraries)) {
      require(parseInt(assumption, 10), ['contraries', assumption])
      require(target, ['contraries', assumption])
    }
  })

export type Save = z.infer<typeof SaveSchema>

export const ExampleSaveSchema = SaveSchema.extend(ExampleSaveExtension)

function buildFromSave(data: Save): ABAF {
  const aba = new ABAF()
  for (const [id, nodeData] of Object.entries(data.nodes)) {
    aba.addNode(parseInt(id, 10), { ...nodeData } as ABANodeData)
  }
  for (const { head, body } of data.rules) {
    aba.addRule(head, body)
  }
  for (const [assumption, target] of Object.entries(data.contraries)) {
    aba.setContrary(parseInt(assumption, 10), target)
  }
  return aba
}

export function saveAsString(aba: ABAF, name: string): string {
  const nodesSave = Object.create(null)
  for (const [id, data] of aba.nodeEntries()) {
    nodesSave[id] = { name: data.name, kind: data.kind, x: data.x, y: data.y, fact: data.fact }
  }
  const contrariesSave = Object.create(null)
  for (const [assumption, target] of aba.contraries()) {
    contrariesSave[assumption] = target
  }
  const save: z.infer<typeof ExampleSaveSchema> = {
    apiVersion: API_VERSION,
    name,
    nodes: nodesSave,
    rules: aba.rules(),
    contraries: contrariesSave,
  }
  return toFormatedJsonString(save)
}

export function loadFromString(dataString: string, fileName: string): DeserializationResult<ABAF> {
  return loadFromStringWithSchema(ExampleSaveSchema, dataString, fileName, buildFromSave)
}

export const canLoadFromObject = makeCanLoadFromObject(API_VERSION)

export function loadExampleFromJson(json: unknown) {
  return loadExampleFromJsonWithSchema(ExampleSaveSchema, json, buildFromSave)
}
