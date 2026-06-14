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
import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRef, unref } from 'vue'
import z from 'zod'

import type { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
import { throwIfTimeout } from '@/modules/common/evaluation/tweety-project/errors'
import { fetchTyped, USER_ID } from '@/modules/common/evaluation/tweety-project/fetch'
import { parserListOfSets, parserSet } from '@/modules/common/evaluation/tweety-project/listOfSets'
import type { Input } from '@/modules/common/evaluation/types'
import { IdMapping, type UUID } from '@/modules/common/ids'

const ENDPOINT_BIPOLAR_ARGUMENTATION = '/bipolar'

const TIMEOUT_IN_MS = 10000
const TIMEOUT_UNIT_MS = 'ms'

export const KEY_DEFAULT_SEMANTIC = 'b-cf'

export const KNOWN_SEMANTIC_GROUPS: SemanticGroup[] = [
  {
    key: 'none-interpretation',
    displayName: 'None Interpretation',
    interpretations: ['None'],
    semantics: [
      { key: 'b-cf',      displayName: 'Conflict-free',         tooltipId: 'b-cf' },
      { key: 'b-coh',     displayName: 'Coherent',              tooltipId: 'b-coh' },
      { key: 'b-ad',      displayName: 'Coherent Admissible',   tooltipId: 'b-ad' },
      { key: 'b-coal-ad', displayName: 'Coalition-Admissible',  tooltipId: 'b-coal-ad' },
      { key: 'b-coal-co', displayName: 'Coalition-Complete',    tooltipId: 'b-coal-co' },
      { key: 'b-coal-gr', displayName: 'Coalition-Grounded',    tooltipId: 'b-coal-gr' },
      { key: 'b-coal-pr', displayName: 'Coalition-Preferred',   tooltipId: 'b-coal-pr' },
      { key: 'b-coal-st', displayName: 'Coalition-Stable',      tooltipId: 'b-coal-st' },
    ],
  },
  {
    key: 'deductive-interpretation',
    displayName: 'Deductive Interpretation',
    interpretations: ['Deductive'],
    semantics: [
      { key: 'd-ad', displayName: 'Admissible', tooltipId: 'd-ad' },
      { key: 'd-co', displayName: 'Complete',   tooltipId: 'd-co' },
      { key: 'd-gr', displayName: 'Grounded',   tooltipId: 'd-gr' },
      { key: 'd-pr', displayName: 'Preferred',  tooltipId: 'd-pr' },
      { key: 'd-st', displayName: 'Stable',     tooltipId: 'd-st' },
    ],
  },
  {
    key: 'necessary-interpretation',
    displayName: 'Necessary Interpretation',
    interpretations: ['Necessary'],
    semantics: [
      { key: 'n-ad', displayName: 'Admissible', tooltipId: 'n-ad' },
      { key: 'n-co', displayName: 'Complete',   tooltipId: 'n-co' },
      { key: 'n-gr', displayName: 'Grounded',   tooltipId: 'n-gr' },
      { key: 'n-pr', displayName: 'Preferred',  tooltipId: 'n-pr' },
      { key: 'n-st', displayName: 'Stable',     tooltipId: 'n-st' },
    ],
  },
]

export interface SemanticGroup {
  key: string
  displayName: string
  interpretations: string[]
  semantics: Semantic[]
}

export interface Semantic {
  key: string
  displayName: string
  tooltipId?: string
}

interface GetModelsRequestBody {
  email: string
  cmd: 'get_models'
  nr_of_arguments: number
  attacks: number[][]
  supports: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_MS
}

const GetModelsResponseSchema = z.object({
  time: z.number(),
  answer: z.string().nullable(),
  status: z.string().optional().nullable(),
})

async function fetchModels(
  numberOfArguments: number,
  attacks: number[][],
  supports: number[][],
  semantics: string,
): Promise<{
  evaluationDurationInMs: number
  extensions: number[][]
}> {
  const body: GetModelsRequestBody = {
    email: USER_ID,
    cmd: 'get_models',
    nr_of_arguments: numberOfArguments,
    attacks: attacks,
    supports: supports,
    semantics: semantics,
    timeout: TIMEOUT_IN_MS,
    unit_timeout: TIMEOUT_UNIT_MS,
  }

  const modelsResponse = await fetchTyped(
    ENDPOINT_BIPOLAR_ARGUMENTATION,
    body,
    GetModelsResponseSchema,
  )
  throwIfTimeout(modelsResponse.answer, modelsResponse.status)
  const extensions = parserListOfSets(modelsResponse.answer!)
  return {
    evaluationDurationInMs: modelsResponse.time,
    extensions,
  }
}

interface GetCredulousRequestBody {
  email: string
  cmd: 'get_credulous'
  nr_of_arguments: number
  attacks: number[][]
  supports: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_MS
}

interface GetSkepticalRequestBody {
  email: string
  cmd: 'get_skeptical'
  nr_of_arguments: number
  attacks: number[][]
  supports: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_MS
}

const GetAcceptabilityResponseSchema = z.object({
  time: z.number(),
  answer: z.string().nullable(),
  status: z.string().optional().nullable(),
})

async function fetchCredulous(
  numberOfArguments: number,
  attacks: number[][],
  supports: number[][],
  semantics: string,
): Promise<{ evaluationDurationInMs: number; arguments: number[] }> {
  const body: GetCredulousRequestBody = {
    email: USER_ID,
    cmd: 'get_credulous',
    nr_of_arguments: numberOfArguments,
    attacks,
    supports,
    semantics,
    timeout: TIMEOUT_IN_MS,
    unit_timeout: TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_BIPOLAR_ARGUMENTATION, body, GetAcceptabilityResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return {
    evaluationDurationInMs: response.time,
    arguments: parserSet(response.answer!),
  }
}

async function fetchSkeptical(
  numberOfArguments: number,
  attacks: number[][],
  supports: number[][],
  semantics: string,
): Promise<{ evaluationDurationInMs: number; arguments: number[] }> {
  const body: GetSkepticalRequestBody = {
    email: USER_ID,
    cmd: 'get_skeptical',
    nr_of_arguments: numberOfArguments,
    attacks,
    supports,
    semantics,
    timeout: TIMEOUT_IN_MS,
    unit_timeout: TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_BIPOLAR_ARGUMENTATION, body, GetAcceptabilityResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return {
    evaluationDurationInMs: response.time,
    arguments: parserSet(response.answer!),
  }
}

export interface ExtensionEvaluationResult {
  stateId: UUID
  evaluationDurationInMs: number
  extensions: string[][]
}

export type Extension = {
  id: ArgumentId
  name: string
}[]

export function useExtensionEvaluationQuery(
  inputRef: MaybeRef<Input<BipoloarArgumentation<ArgumentData>>>,
  semanticsRef: MaybeRef<string>,
  modeRef: MaybeRef<string>,
  enabled: MaybeRef<boolean>,
) {
  const argumentData = computed(() => {
    const input = unref(inputRef)
    const content = input.content
    let numberOfArguments = 0
    const idMapping = new IdMapping<ArgumentId, number>()
    for (const [argumentId] of content.arguments()) {
      // Tweety expects argument IDs to start with 1 and go up to n,
      // where n is the number of arguments.
      idMapping.add(argumentId, ++numberOfArguments)
    }
    const attacks = []
    for (const [sourceId, targetId] of content.attacks()) {
      const serverSourceId = idMapping.getOrFail(sourceId)
      const serverTargetId = idMapping.getOrFail(targetId)
      attacks.push([serverSourceId, serverTargetId])
    }
    const supports = []
    for (const [sourceId, targetId] of content.supports()) {
      const serverSourceId = idMapping.getOrFail(sourceId)
      const serverTargetId = idMapping.getOrFail(targetId)
      supports.push([serverSourceId, serverTargetId])
    }
    return { numberOfArguments, attacks, supports, idMapping }
  })

  type EvaluationQueryResult =
    | { evaluationDurationInMs: number; extensions: number[][] }
    | { evaluationDurationInMs: number; arguments: number[] }

  const isModelsResult = (
    data: EvaluationQueryResult,
  ): data is { evaluationDurationInMs: number; extensions: number[][] } =>
    'extensions' in data

  const queryKey = computed(() => {
    const mode = unref(modeRef)
    if (mode === 'credulous') return ['bipolar_get_credulous', semanticsRef, modeRef, argumentData] as const
    if (mode === 'skeptical') return ['bipolar_get_skeptical', semanticsRef, modeRef, argumentData] as const
    return ['bipolar_get_models', semanticsRef, modeRef, argumentData] as const
  })

  const queryResult = useQuery<EvaluationQueryResult>({
    queryKey,
    queryFn: ({ queryKey }) => {
      const [, semantics, , { attacks, supports, numberOfArguments }] = queryKey as [
        string,
        string,
        string,
        { attacks: number[][]; supports: number[][]; numberOfArguments: number },
      ]
      const mode = unref(modeRef)
      if (mode === 'credulous') return fetchCredulous(numberOfArguments, attacks, supports, semantics)
      if (mode === 'skeptical') return fetchSkeptical(numberOfArguments, attacks, supports, semantics)
      return fetchModels(numberOfArguments, attacks, supports, semantics)
    },
    enabled,
  })

  const data = computed(() => {
    const originalData = queryResult.data.value
    if (originalData === undefined) {
      return undefined
    }
    const input = unref(inputRef)
    const content = input.content
    const argumentIdAndData = [...content.arguments()]

    if (isModelsResult(originalData)) {
      const extensions: Extension[] = originalData.extensions.map((extension) =>
        extension.map((serverArgumentId) => {
          // Tweety expects argument IDs to start with 1 and go up to n,
          // where n is the number of arguments.
          const idAndData = argumentIdAndData[serverArgumentId - 1]
          if (idAndData === undefined) {
            throw new Error('Server returned invalid argument.')
          }
          const [id, { name }] = idAndData
          return { id, name }
        }),
      )
      return {
        stateId: input.stateId,
        evaluationDurationInMs: originalData.evaluationDurationInMs,
        extensions,
      }
    }

    const accArguments: Extension = originalData.arguments.map((serverArgumentId) => {
      const idAndData = argumentIdAndData[serverArgumentId - 1]
      if (idAndData === undefined) {
        throw new Error('Server returned invalid argument.')
      }
      const [id, { name }] = idAndData
      return { id, name }
    })
    return {
      stateId: input.stateId,
      evaluationDurationInMs: originalData.evaluationDurationInMs,
      extensions: [accArguments],
    }
  })

  return {
    ...queryResult,
    data,
  }
}
