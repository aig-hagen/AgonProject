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
import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRef, unref } from 'vue'

import {
  type SetAF,
  type SetAfArgumentData,
} from '@/modules/collective-attacks-argumentation/model'
import { buildArgumentIdMapping } from '@/modules/common/evaluation/tweety-project/argumentMapping'
import { throwIfTimeout } from '@/modules/common/evaluation/tweety-project/errors'
import {
  fetchTyped,
  TWEETY_TIMEOUT_IN_MS,
  TWEETY_TIMEOUT_UNIT_MS,
  TweetyResponseSchema,
  USER_ID,
} from '@/modules/common/evaluation/tweety-project/fetch'
import { parserListOfSets, parserSet } from '@/modules/common/evaluation/tweety-project/listOfSets'
import type { SemanticsFamily } from '@/modules/common/evaluation/tweety-project/semantics'
import type { Input } from '@/modules/common/evaluation/types'
import type { UUID } from '@/modules/common/ids'

const ENDPOINT_SETAF = '/setaf'

export const KEY_DEFAULT_SEMANTIC = 'ST'

export const KNOWN_SEMANTIC_GROUPS: SemanticsFamily[] = [
  {
    key: 'classical',
    displayName: 'Classical Semantics',
    semantics: [
      { key: 'CF', displayName: 'Conflict-Free' },
      { key: 'ADM', displayName: 'Admissible' },
      { key: 'CO', displayName: 'Complete' },
      { key: 'GR', displayName: 'Grounded' },
      { key: 'PR', displayName: 'Preferred' },
      { key: 'ST', displayName: 'Stable' },
    ],
  },
  {
    key: 'admissibility-based',
    displayName: 'Admissibility-based Semantics',
    semantics: [
      { key: 'SAD', displayName: 'Strongly Admissible' },
      { key: 'SST', displayName: 'Semi-Stable' },
      { key: 'ID', displayName: 'Ideal' },
      { key: 'EA', displayName: 'Eager' },
      { key: 'IS', displayName: 'Initial' },
      { key: 'UC', displayName: 'Unchallenged' },
    ],
  },
  {
    key: 'non-admissible',
    displayName: 'Non-admissible Semantics',
    semantics: [
      { key: 'NA', displayName: 'Naive' },
      { key: 'STG', displayName: 'Stage' },
      { key: 'STG2', displayName: 'Stage2' },
      { key: 'CF2', displayName: 'CF2' },
      { key: 'SCF2', displayName: 'SCF2' },
      { key: 'UD', displayName: 'Undisputed' },
      { key: 'SUD', displayName: 'Strongly Undisputed' },
    ],
  },
  {
    key: 'weak',
    displayName: 'Weak Semantics',
    semantics: [
      { key: 'WAD', displayName: 'Weakly Admissible' },
      { key: 'WCO', displayName: 'Weakly Complete' },
      { key: 'WGR', displayName: 'Weakly Grounded' },
      { key: 'WPR', displayName: 'Weakly Preferred' },
    ],
  },
].filter((group) => group.semantics.length > 0)

export {
  type Semantics,
  type SemanticsFamily,
} from '@/modules/common/evaluation/tweety-project/semantics'

interface SetAfRequestBody {
  email: string
  cmd: 'get_models' | 'get_credulous' | 'get_skeptical'
  nr_of_arguments: number
  attacks: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TWEETY_TIMEOUT_UNIT_MS
}

async function fetchModels(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
): Promise<{ evaluationDurationInMs: number; extensions: number[][] }> {
  const body: SetAfRequestBody = {
    email: USER_ID,
    cmd: 'get_models',
    nr_of_arguments: numberOfArguments,
    attacks,
    semantics,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_SETAF, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, extensions: parserListOfSets(response.answer!) }
}

async function fetchCredulous(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
): Promise<{ evaluationDurationInMs: number; arguments: number[] }> {
  const body: SetAfRequestBody = {
    email: USER_ID,
    cmd: 'get_credulous',
    nr_of_arguments: numberOfArguments,
    attacks,
    semantics,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_SETAF, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, arguments: parserSet(response.answer!) }
}

async function fetchSkeptical(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
): Promise<{ evaluationDurationInMs: number; arguments: number[] }> {
  const body: SetAfRequestBody = {
    email: USER_ID,
    cmd: 'get_skeptical',
    nr_of_arguments: numberOfArguments,
    attacks,
    semantics,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_SETAF, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, arguments: parserSet(response.answer!) }
}

export type Extension = { id: number; name: string }[]

export interface ExtensionEvaluationResult {
  stateId: UUID
  evaluationDurationInMs: number
  extensions: Extension[]
}

export function useSetAfEvaluationQuery(
  inputRef: MaybeRef<Input<SetAF<SetAfArgumentData>>>,
  semanticsRef: MaybeRef<string>,
  modeRef: MaybeRef<string>,
  enabled: MaybeRef<boolean>,
) {
  const argumentData = computed(() => {
    const input = unref(inputRef)
    const content = input.content
    const { numberOfArguments, idMapping } = buildArgumentIdMapping(content.arguments())
    const attacks: number[][] = []
    for (const attack of content.attacks()) {
      const mappedAttackers = attack.attackers.map((id) => idMapping.getOrFail(id))
      const mappedTarget = idMapping.getOrFail(attack.target)
      attacks.push([...mappedAttackers, mappedTarget])
    }
    return { numberOfArguments, attacks, idMapping }
  })

  type EvaluationQueryResult =
    | { evaluationDurationInMs: number; extensions: number[][] }
    | { evaluationDurationInMs: number; arguments: number[] }

  const isModelResult = (
    data: EvaluationQueryResult,
  ): data is { evaluationDurationInMs: number; extensions: number[][] } => 'extensions' in data

  const queryKey = computed(() => {
    const mode = unref(modeRef)
    if (mode === 'credulous')
      return ['setaf_get_credulous', semanticsRef, modeRef, argumentData] as const
    if (mode === 'skeptical')
      return ['setaf_get_skeptical', semanticsRef, modeRef, argumentData] as const
    return ['setaf_get_models', semanticsRef, modeRef, argumentData] as const
  })

  const queryResult = useQuery<EvaluationQueryResult>({
    queryKey,
    queryFn: ({ queryKey }) => {
      const [, semantics, , { attacks, numberOfArguments }] = queryKey as [
        string,
        string,
        string,
        { attacks: number[][]; numberOfArguments: number },
      ]
      const mode = unref(modeRef)
      if (mode === 'credulous') return fetchCredulous(numberOfArguments, attacks, semantics)
      if (mode === 'skeptical') return fetchSkeptical(numberOfArguments, attacks, semantics)
      return fetchModels(numberOfArguments, attacks, semantics)
    },
    enabled,
  })

  const data = computed(() => {
    const originalData = queryResult.data.value
    if (originalData === undefined) return undefined
    const input = unref(inputRef)
    const content = input.content
    const argumentIdAndData = [...content.arguments()]

    if (isModelResult(originalData)) {
      const extensions: Extension[] = originalData.extensions.map((extension) =>
        extension.map((serverArgumentId) => {
          const idAndData = argumentIdAndData[serverArgumentId - 1]
          if (idAndData === undefined) throw new Error('Server returned invalid argument.')
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
      if (idAndData === undefined) throw new Error('Server returned invalid argument.')
      const [id, { name }] = idAndData
      return { id, name }
    })
    return {
      stateId: input.stateId,
      evaluationDurationInMs: originalData.evaluationDurationInMs,
      extensions: [accArguments],
    }
  })

  return { ...queryResult, data }
}
