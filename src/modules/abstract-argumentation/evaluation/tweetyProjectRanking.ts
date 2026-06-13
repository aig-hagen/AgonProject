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
import { parserScores } from '@/modules/common/evaluation/tweety-project/rankingScore'
import type { Input } from '@/modules/common/evaluation/types'
import { IdMapping, type UUID } from '@/modules/common/ids'

const ENDPOINT_ABSTRACT_ARGUMENTATION = '/rankings'

const TIMEOUT_IN_MS = 10000
const TIMEOUT_UNIT_MS = 'ms'

export const KEY_DEFAULT_RANKING_SEMANTIC = 'CAT'

export const KNOWN_RANKING_SEMANTICS: RankingSemantic[] = [
  {
    key: 'CAT',
    displayName: 'Categorizer',
  },
  {
    key: 'BB',
    displayName: 'Burden-based',
  },
  {
    key: 'SER',
    displayName: 'Serialisability-based',
  },
  {
    key: 'CO',
    displayName: 'Counting',
  },
  {
    key: 'DB',
    displayName: 'Discussion-based',
  },
  {
    key: 'IGD',
    displayName: 'Iterated Graded Defense',
  },
  {
    key: 'SAF',
    displayName: 'Social Argumentation',
  },
  {
    key: 'SB',
    displayName: 'Strategy-based',
  },
  {
    key: 'TU',
    displayName: 'Tuples',
  }
]

export interface RankingSemantic {
  key: string
  displayName: string
}

export type RankingType = 'numerical' | 'lattice'

export type RankingEntry = { id: ArgumentId; name: string; score: number }

/** Arguments sorted from highest-scored (index 0) to lowest-scored. */
export type Ranking = RankingEntry[]

export interface RankingEvaluationResult {
  stateId: UUID
  evaluationDurationInMs: number
  ranking: Ranking
  rankingType: RankingType
}

interface GetRankingRequestBody {
  email: string
  cmd: 'get_model'
  nr_of_arguments: number
  attacks: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_MS
}

const GetRankingResponseSchema = z.object({
  time: z.number(),
  answer: z.string().nullable(),
  status: z.string().optional().nullable(),
  rankingType: z.enum(['numerical', 'lattice']).optional(),
})

async function fetchRanking(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
): Promise<{ evaluationDurationInMs: number; scores: Array<{ argumentId: number; score: number }>; rankingType: RankingType }> {
  const body: GetRankingRequestBody = {
    email: USER_ID,
    cmd: 'get_model',
    nr_of_arguments: numberOfArguments,
    attacks,
    semantics,
    timeout: TIMEOUT_IN_MS,
    unit_timeout: TIMEOUT_UNIT_MS,
  }

  const response = await fetchTyped(ENDPOINT_ABSTRACT_ARGUMENTATION, body, GetRankingResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return {
    evaluationDurationInMs: response.time,
    scores: parserScores(response.answer!),
    rankingType: response.rankingType ?? 'numerical',
  }
}

export function useRankingEvaluationQuery(
  inputRef: MaybeRef<Input<AbstractArgumentation<ArgumentData>>>,
  semanticsRef: MaybeRef<string>,
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

  const queryKey = computed(
    () => ['rankings_get_model', semanticsRef, argumentData] as const,
  )

  type RawResult = { evaluationDurationInMs: number; scores: Array<{ argumentId: number; score: number }>; rankingType: RankingType }
  const queryResult = useQuery<RawResult>({
    queryKey,
    queryFn: ({ queryKey }) => {
      const [, semantics, { attacks, numberOfArguments }] = queryKey as [
        string,
        string,
        { attacks: number[][]; numberOfArguments: number },
      ]
      return fetchRanking(numberOfArguments, attacks, semantics)
    },
    enabled,
  })

  const data = computed((): RankingEvaluationResult | undefined => {
    const raw = queryResult.data.value
    if (raw === undefined) return undefined

    const input = unref(inputRef)
    const argumentIdAndData = [...input.content.arguments()]

    const ranking: Ranking = raw.scores
      .map(({ argumentId: serverArgumentId, score }) => {
        const idAndData = argumentIdAndData[serverArgumentId - 1]
        if (idAndData === undefined) throw new Error('Server returned invalid argument.')
        const [id, { name }] = idAndData
        return { id, name, score }
      })

    return {
      stateId: input.stateId,
      evaluationDurationInMs: raw.evaluationDurationInMs,
      ranking,
      rankingType: raw.rankingType,
    }
  })

  return { ...queryResult, data }
}
