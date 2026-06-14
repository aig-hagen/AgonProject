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

import { type AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
import { throwIfTimeout } from '@/modules/common/evaluation/tweety-project/errors'
import { fetchTyped, USER_ID } from '@/modules/common/evaluation/tweety-project/fetch'
import { parseListOfSequences } from '@/modules/common/evaluation/tweety-project/listOfSequences'
import { parserListOfSets } from '@/modules/common/evaluation/tweety-project/listOfSets'
import type { Input } from '@/modules/common/evaluation/types'
import { IdMapping, type UUID } from '@/modules/common/ids'

const ENDPOINT_SERIALISATION = '/serialisation'

const TIMEOUT_IN_MS = 10000
const TIMEOUT_UNIT_MS = 'ms'

export interface SerialisationFunction {
  key: string
  displayName: string
  tooltipId: string
}

export const SELECTION_FUNCTIONS: SerialisationFunction[] = [
  { key: 'ADM', displayName: 'Admissible', tooltipId: 'selFnADM' },
  { key: 'UC', displayName: 'Unchallenged', tooltipId: 'selFnUC' },
  { key: 'GR', displayName: 'Grounded', tooltipId: 'selFnGR' },
]

export const TERMINATION_FUNCTIONS: SerialisationFunction[] = [
  { key: 'ADM', displayName: 'Admissible', tooltipId: 'termFnADM' },
  { key: 'CO', displayName: 'Complete', tooltipId: 'termFnCO' },
  { key: 'UC', displayName: 'Unchallenged', tooltipId: 'termFnUC' },
  { key: 'PR', displayName: 'Preferred', tooltipId: 'termFnPR' },
  { key: 'ST', displayName: 'Stable', tooltipId: 'termFnST' },
]

export const KEY_DEFAULT_SELECTION_FUNCTION = 'UC'
export const KEY_DEFAULT_TERMINATION_FUNCTION = 'UC'

export type SequenceStep = { id: ArgumentId; name: string }[]
export type Sequence = SequenceStep[]

export interface SerialisationEvaluationResult {
  stateId: UUID
  evaluationDurationInMs: number
  sequences: Sequence[]
}

interface GetSequencesRequestBody {
  email: string
  cmd: 'get_sequences'
  nr_of_arguments: number
  attacks: number[][]
  selectionFunction: string
  terminationFunction: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_MS
}

const SerialisationResponseSchema = z.object({
  time: z.number(),
  answer: z.string().nullable(),
  status: z.string().optional().nullable(),
})

export async function fetchSelection(
  numberOfArguments: number,
  attacks: number[][],
  selectionFunction: string,
): Promise<{ evaluationDurationInMs: number; steps: number[][] }> {
  const body = {
    email: USER_ID,
    cmd: 'get_selection' as const,
    nr_of_arguments: numberOfArguments,
    attacks,
    selectionFunction,
    timeout: TIMEOUT_IN_MS,
    unit_timeout: TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_SERIALISATION, body, SerialisationResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return {
    evaluationDurationInMs: response.time,
    steps: parserListOfSets(response.answer!),
  }
}

export async function fetchIsTerminal(
  numberOfArguments: number,
  attacks: number[][],
  extension: number[],
  terminationFunction: string,
): Promise<{ evaluationDurationInMs: number; terminal: boolean }> {
  const body = {
    email: USER_ID,
    cmd: 'is_terminal' as const,
    nr_of_arguments: numberOfArguments,
    attacks,
    extension,
    terminationFunction,
    timeout: TIMEOUT_IN_MS,
    unit_timeout: TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_SERIALISATION, body, SerialisationResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return {
    evaluationDurationInMs: response.time,
    terminal: response.answer === 'true',
  }
}

async function fetchSequences(
  numberOfArguments: number,
  attacks: number[][],
  selectionFunction: string,
  terminationFunction: string,
): Promise<{ evaluationDurationInMs: number; rawSequences: number[][][] }> {
  const body: GetSequencesRequestBody = {
    email: USER_ID,
    cmd: 'get_sequences',
    nr_of_arguments: numberOfArguments,
    attacks,
    selectionFunction,
    terminationFunction,
    timeout: TIMEOUT_IN_MS,
    unit_timeout: TIMEOUT_UNIT_MS,
  }

  const response = await fetchTyped(ENDPOINT_SERIALISATION, body, SerialisationResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return {
    evaluationDurationInMs: response.time,
    rawSequences: parseListOfSequences(response.answer!),
  }
}

export function useSerialisationEvaluationQuery(
  inputRef: MaybeRef<Input<AbstractArgumentation<ArgumentData>>>,
  selectionFunctionRef: MaybeRef<string>,
  terminationFunctionRef: MaybeRef<string>,
  enabled: MaybeRef<boolean>,
) {
  const argumentData = computed(() => {
    const input = unref(inputRef)
    const content = input.content
    let numberOfArguments = 0
    const idMapping = new IdMapping<ArgumentId, number>()
    for (const [argumentId] of content.arguments()) {
      idMapping.add(argumentId, ++numberOfArguments)
    }
    const attacks: number[][] = []
    for (const [sourceId, targetId] of content.attacks()) {
      attacks.push([idMapping.getOrFail(sourceId), idMapping.getOrFail(targetId)])
    }
    return { numberOfArguments, attacks, idMapping }
  })

  const queryKey = computed(() => [
    'serialisation_get_sequences',
    selectionFunctionRef,
    terminationFunctionRef,
    argumentData,
  ] as const)

  type RawResult = { evaluationDurationInMs: number; rawSequences: number[][][] }

  const queryResult = useQuery<RawResult>({
    queryKey,
    queryFn: ({ queryKey }) => {
      const [, selectionFunction, terminationFunction, { attacks, numberOfArguments }] =
        queryKey as [string, string, string, { attacks: number[][]; numberOfArguments: number }]
      return fetchSequences(numberOfArguments, attacks, selectionFunction, terminationFunction)
    },
    enabled,
  })

  const data = computed((): SerialisationEvaluationResult | undefined => {
    const raw = queryResult.data.value
    if (raw === undefined) return undefined

    const input = unref(inputRef)
    const argumentIdAndData = [...input.content.arguments()]

    const sequences: Sequence[] = raw.rawSequences.map((rawSequence) =>
      rawSequence.map((rawStep) =>
        rawStep.map((serverArgumentId) => {
          const idAndData = argumentIdAndData[serverArgumentId - 1]
          if (idAndData === undefined) throw new Error('Server returned invalid argument.')
          const [id, { name }] = idAndData
          return { id, name }
        }),
      ),
    )

    return {
      stateId: input.stateId,
      evaluationDurationInMs: raw.evaluationDurationInMs,
      sequences,
    }
  })

  return { ...queryResult, data }
}
