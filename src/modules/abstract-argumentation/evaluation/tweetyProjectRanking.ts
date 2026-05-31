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
import { fetchTyped, USER_ID } from '@/modules/common/evaluation/tweety-project/fetch'
import { parserScores } from '@/modules/common/evaluation/tweety-project/rankingScore'
import type { Input } from '@/modules/common/evaluation/types'
import { IdMapping, type UUID } from '@/modules/common/ids'

const ENDPOINT_ABSTRACT_ARGUMENTATION = '/rankings'

const TIMEOUT_IN_SECONDS = 300
const TIMEOUT_UNIT_SECONDS = 's'

export const KEY_DEFAULT_RANKING_SEMANTIC = 'CAT'

export const KNOWN_RANKING_SEMANTICS: RankingSemantic[] = [
  {
    key: 'CAT',
    displayName: 'Categorizer',
    info: {
      description:
        'The categorizer function assigns a value to each argument based on the sum of the values of its attackers. Arguments with no attackers receive the highest rank.',
      reference: {
        name: 'Besnard, P. and A. Hunter (2001). "A Logic-based Theory of Deductive Arguments". In: Artificial Intelligence, Vol. 128.1-2, pp. 203 - 235',
        url: 'https://doi.org/10.1016/S0004-3702(01)00071-6',
      },
    },
  },
  {
    key: 'BBS',
    displayName: 'Burden-based',
    info: {
      description:
        'The burden-based semantics assigns a burden value to each argument based on the burdens of its attackers and defenders, ranking arguments by their accumulated burden.',
      reference: {
        name: 'Amgoud, L. and J. Ben-Naim (2016). "Ranking-based Semantics for Argumentation Frameworks". In: Scalable Uncertainty Management - Proceedings of SUM 2016, pp. 134 - 147',
        url: 'https://doi.org/10.1007/978-3-319-45856-4_10',
      },
    },
  },
]

export interface RankingSemantic {
  key: string
  displayName: string
  info?: {
    description: string
    reference: {
      name: string
      url: string
    }
  }
}

export type RankingEntry = { id: ArgumentId; name: string; score: number }

/** Arguments sorted from highest-scored (index 0) to lowest-scored. */
export type Ranking = RankingEntry[]

export interface RankingEvaluationResult {
  stateId: UUID
  evaluationDurationInSeconds: number
  ranking: Ranking
}

interface GetRankingRequestBody {
  email: string
  cmd: 'get_model'
  nr_of_arguments: number
  attacks: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_SECONDS
}

const GetRankingResponseSchema = z.object({
  time: z.number(),
  answer: z.string(),
})

async function fetchRanking(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
): Promise<{ evaluationDurationInSeconds: number; scores: Array<{ argumentId: number; score: number }> }> {
  const body: GetRankingRequestBody = {
    email: USER_ID,
    cmd: 'get_model',
    nr_of_arguments: numberOfArguments,
    attacks,
    semantics,
    timeout: TIMEOUT_IN_SECONDS,
    unit_timeout: TIMEOUT_UNIT_SECONDS,
  }

  const response = await fetchTyped(ENDPOINT_ABSTRACT_ARGUMENTATION, body, GetRankingResponseSchema)
  return {
    evaluationDurationInSeconds: response.time,
    scores: parserScores(response.answer),
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

  type RawResult = { evaluationDurationInSeconds: number; scores: Array<{ argumentId: number; score: number }> }
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
      evaluationDurationInSeconds: raw.evaluationDurationInSeconds,
      ranking,
    }
  })

  return { ...queryResult, data }
}
