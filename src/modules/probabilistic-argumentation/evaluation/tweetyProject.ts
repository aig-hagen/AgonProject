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

import type { ArgumentId } from '@/modules/common/argumentation/model'
import { throwIfTimeout } from '@/modules/common/evaluation/tweety-project/errors'
import { fetchTyped, TWEETY_TIMEOUT_IN_MS, TWEETY_TIMEOUT_UNIT_MS, TweetyResponseSchema, USER_ID } from '@/modules/common/evaluation/tweety-project/fetch'
import { parserScores } from '@/modules/common/evaluation/tweety-project/rankingScore'
import type { SemanticsFamily } from '@/modules/common/evaluation/tweety-project/semantics'
import type { Input } from '@/modules/common/evaluation/types'
import { IdMapping, type UUID } from '@/modules/common/ids'
import type { PafArgumentData, ProbabilisticArgumentation } from '@/modules/probabilistic-argumentation/model'

const ENDPOINT = '/paf'

export const KEY_DEFAULT_SEMANTIC = 'ST'
export const KEY_DEFAULT_MODE = 'credulous'
export const KEY_DEFAULT_SOLVER = 'simple'

export const KNOWN_SEMANTIC_GROUPS: SemanticsFamily[] = [
  {
    key: 'classical',
    displayName: 'Classical Semantics',
    semantics: [
      { key: 'CF',  displayName: 'Conflict-Free' },
      { key: 'ADM', displayName: 'Admissible' },
      { key: 'CO',  displayName: 'Complete' },
      { key: 'GR',  displayName: 'Grounded' },
      { key: 'PR',  displayName: 'Preferred' },
      { key: 'ST',  displayName: 'Stable' },
    ],
  },
  {
    key: 'admissibility-based',
    displayName: 'Admissibility-based Semantics',
    semantics: [
      { key: 'SAD', displayName: 'Strongly Admissible' },
      { key: 'SST', displayName: 'Semi-Stable' },
      { key: 'ID',  displayName: 'Ideal' },
      { key: 'EA',  displayName: 'Eager' },
      { key: 'IS',  displayName: 'Initial' },
      { key: 'UC',  displayName: 'Unchallenged' },
    ],
  },
  {
    key: 'non-admissible',
    displayName: 'Non-admissible Semantics',
    semantics: [
      { key: 'NA',   displayName: 'Naive' },
      { key: 'STG',  displayName: 'Stage' },
      { key: 'STG2', displayName: 'Stage2' },
      { key: 'CF2',  displayName: 'CF2' },
      { key: 'UD',   displayName: 'Undisputed' },
      { key: 'SUD',  displayName: 'Strongly Undisputed' },
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
]

export { type Semantics, type SemanticsFamily } from '@/modules/common/evaluation/tweety-project/semantics'

export type PafEntry = { id: ArgumentId; name: string; probability: number }

export interface PafEvaluationResult {
  stateId: UUID
  evaluationDurationInMs: number
  entries: PafEntry[]
}

interface PafRequestBody {
  email: string
  cmd: 'get_credulous' | 'get_skeptical'
  nr_of_arguments: number
  attacks: number[][]
  argument_probabilities: number[]
  attack_probabilities: number[]
  semantics: string
  solver: string
  timeout: number
  unit_timeout: typeof TWEETY_TIMEOUT_UNIT_MS
}

async function fetchPaf(
  cmd: 'get_credulous' | 'get_skeptical',
  numberOfArguments: number,
  attacks: number[][],
  argumentProbabilities: number[],
  attackProbabilities: number[],
  semantics: string,
  solver: string,
): Promise<{ evaluationDurationInMs: number; scores: Array<{ argumentId: number; score: number }> }> {
  const body: PafRequestBody = {
    email: USER_ID,
    cmd,
    nr_of_arguments: numberOfArguments,
    attacks,
    argument_probabilities: argumentProbabilities,
    attack_probabilities: attackProbabilities,
    semantics,
    solver,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, scores: parserScores(response.answer!) }
}

export function usePafEvaluationQuery(
  inputRef: MaybeRef<Input<ProbabilisticArgumentation<PafArgumentData>>>,
  semanticsRef: MaybeRef<string>,
  modeRef: MaybeRef<string>,
  solverRef: MaybeRef<string>,
  enabled: MaybeRef<boolean>,
) {
  const argumentData = computed(() => {
    const input = unref(inputRef)
    const content = input.content
    let numberOfArguments = 0
    const idMapping = new IdMapping<ArgumentId, number>()
    const argumentProbabilities: number[] = []

    for (const [argumentId, data] of content.arguments()) {
      idMapping.add(argumentId, ++numberOfArguments)
      argumentProbabilities.push(data.probability)
    }

    const attacks: number[][] = []
    const attackProbabilities: number[] = []
    for (const [sourceId, targetId, prob] of content.attacks()) {
      attacks.push([idMapping.getOrFail(sourceId), idMapping.getOrFail(targetId)])
      attackProbabilities.push(prob)
    }

    return { numberOfArguments, attacks, argumentProbabilities, attackProbabilities, idMapping }
  })

  const queryKey = computed(() => {
    const mode = unref(modeRef)
    const prefix = mode === 'skeptical' ? 'paf_get_skeptical' : 'paf_get_credulous'
    return [prefix, semanticsRef, modeRef, solverRef, argumentData] as const
  })

  type RawResult = { evaluationDurationInMs: number; scores: Array<{ argumentId: number; score: number }> }

  const queryResult = useQuery<RawResult>({
    queryKey,
    queryFn: ({ queryKey }) => {
      const [, semantics, mode, solver, { attacks, numberOfArguments, argumentProbabilities, attackProbabilities }] =
        queryKey as [
          string,
          string,
          string,
          string,
          { attacks: number[][]; numberOfArguments: number; argumentProbabilities: number[]; attackProbabilities: number[] },
        ]
      const cmd = mode === 'skeptical' ? 'get_skeptical' : 'get_credulous'
      return fetchPaf(cmd, numberOfArguments, attacks, argumentProbabilities, attackProbabilities, semantics, solver)
    },
    enabled,
  })

  const data = computed((): PafEvaluationResult | undefined => {
    const raw = queryResult.data.value
    if (raw === undefined) return undefined

    const input = unref(inputRef)
    const argumentIdAndData = [...input.content.arguments()]

    const entries: PafEntry[] = raw.scores.map(({ argumentId: serverArgumentId, score }) => {
      const idAndData = argumentIdAndData[serverArgumentId - 1]
      if (idAndData === undefined) throw new Error('Server returned invalid argument.')
      const [id, { name }] = idAndData
      return { id, name, probability: score }
    })

    return {
      stateId: input.stateId,
      evaluationDurationInMs: raw.evaluationDurationInMs,
      entries,
    }
  })

  return { ...queryResult, data }
}
