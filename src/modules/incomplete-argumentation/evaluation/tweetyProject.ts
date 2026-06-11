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

import type { ArgumentId } from '@/modules/common/argumentation/model'
import { fetchTyped, USER_ID } from '@/modules/common/evaluation/tweety-project/fetch'
import { parserListOfSets, parserSet } from '@/modules/common/evaluation/tweety-project/listOfSets'
import type { Input } from '@/modules/common/evaluation/types'
import { IdMapping, type UUID } from '@/modules/common/ids'
import type { IafArgumentData, IncompleteArgumentation } from '@/modules/incomplete-argumentation/model'

export {
  KEY_DEFAULT_SEMANTIC,
  KNOWN_SEMANTIC_GROUPS,
  type Semantic,
  type SemanticGroup,
} from '@/modules/abstract-argumentation/evaluation/tweetyProject'

const ENDPOINT_IAF = '/iaf'
const TIMEOUT_IN_SECONDS = 10
const TIMEOUT_UNIT_SECONDS = 's'

type IafCommand =
  | 'get_models_pos'
  | 'get_models_nec'
  | 'get_credulous_pos'
  | 'get_credulous_nec'
  | 'get_skeptical_pos'
  | 'get_skeptical_nec'

export type IafType = 'pos' | 'nec'
export type IafMode = 'enumerate' | 'credulous' | 'skeptical'

interface IafRequestBody {
  email: string
  cmd: IafCommand
  nr_of_arguments: number
  uncertainArguments: number[]
  definiteAttacks: number[][]
  uncertainAttacks: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_SECONDS
}

const IafResponseSchema = z.object({
  time: z.number(),
  answer: z.string(),
})

function buildRequestBody(
  cmd: IafCommand,
  numberOfArguments: number,
  uncertainArgumentIds: number[],
  definiteAttacks: number[][],
  uncertainAttacks: number[][],
  semantics: string,
): IafRequestBody {
  return {
    email: USER_ID,
    cmd,
    nr_of_arguments: numberOfArguments,
    uncertainArguments: uncertainArgumentIds,
    definiteAttacks,
    uncertainAttacks,
    semantics,
    timeout: TIMEOUT_IN_SECONDS,
    unit_timeout: TIMEOUT_UNIT_SECONDS,
  }
}

async function fetchModels(
  type: IafType,
  numberOfArguments: number,
  uncertainArgumentIds: number[],
  definiteAttacks: number[][],
  uncertainAttacks: number[][],
  semantics: string,
): Promise<{ evaluationDurationInSeconds: number; extensions: number[][] }> {
  const body = buildRequestBody(
    `get_models_${type}`,
    numberOfArguments,
    uncertainArgumentIds,
    definiteAttacks,
    uncertainAttacks,
    semantics,
  )
  const response = await fetchTyped(ENDPOINT_IAF, body, IafResponseSchema)
  return {
    evaluationDurationInSeconds: response.time,
    extensions: parserListOfSets(response.answer),
  }
}

async function fetchAcceptability(
  mode: 'credulous' | 'skeptical',
  type: IafType,
  numberOfArguments: number,
  uncertainArgumentIds: number[],
  definiteAttacks: number[][],
  uncertainAttacks: number[][],
  semantics: string,
): Promise<{ evaluationDurationInSeconds: number; arguments: number[] }> {
  const body = buildRequestBody(
    `get_${mode}_${type}`,
    numberOfArguments,
    uncertainArgumentIds,
    definiteAttacks,
    uncertainAttacks,
    semantics,
  )
  const response = await fetchTyped(ENDPOINT_IAF, body, IafResponseSchema)
  return {
    evaluationDurationInSeconds: response.time,
    arguments: parserSet(response.answer),
  }
}

export interface ExtensionEvaluationResult {
  stateId: UUID
  evaluationDurationInSeconds: number
  extensions: string[][]
}

export type Extension = { id: ArgumentId; name: string }[]

export function useExtensionEvaluationQuery(
  inputRef: MaybeRef<Input<IncompleteArgumentation<IafArgumentData>>>,
  semanticsRef: MaybeRef<string>,
  typeRef: MaybeRef<IafType>,
  modeRef: MaybeRef<IafMode>,
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
    const uncertainArgumentIds: number[] = []
    for (const [argumentId] of content.uncertainArguments()) {
      uncertainArgumentIds.push(idMapping.getOrFail(argumentId))
    }
    const definiteAttacks: number[][] = []
    for (const [sourceId, targetId] of content.definiteAttacks()) {
      definiteAttacks.push([idMapping.getOrFail(sourceId), idMapping.getOrFail(targetId)])
    }
    const uncertainAttacks: number[][] = []
    for (const [sourceId, targetId] of content.uncertainAttacks()) {
      uncertainAttacks.push([idMapping.getOrFail(sourceId), idMapping.getOrFail(targetId)])
    }
    return { numberOfArguments, uncertainArgumentIds, definiteAttacks, uncertainAttacks, idMapping }
  })

  type EvaluationQueryResult =
    | { evaluationDurationInSeconds: number; extensions: number[][] }
    | { evaluationDurationInSeconds: number; arguments: number[] }

  const isModelResult = (
    result: EvaluationQueryResult,
  ): result is { evaluationDurationInSeconds: number; extensions: number[][] } =>
    'extensions' in result

  const queryKey = computed(() => {
    const mode = unref(modeRef)
    const type = unref(typeRef)
    return [`iaf_${mode}_${type}`, semanticsRef, typeRef, modeRef, argumentData] as const
  })

  type QueryKey = [string, string, IafType, IafMode, { numberOfArguments: number; uncertainArgumentIds: number[]; definiteAttacks: number[][]; uncertainAttacks: number[][] }]

  const queryResult = useQuery<EvaluationQueryResult>({
    queryKey,
    queryFn: ({ queryKey }) => {
      const [, semantics, type, mode, { numberOfArguments, uncertainArgumentIds, definiteAttacks, uncertainAttacks }] = queryKey as QueryKey
      if (mode === 'credulous' || mode === 'skeptical') {
        return fetchAcceptability(mode, type, numberOfArguments, uncertainArgumentIds, definiteAttacks, uncertainAttacks, semantics)
      }
      return fetchModels(type, numberOfArguments, uncertainArgumentIds, definiteAttacks, uncertainAttacks, semantics)
    },
    enabled,
  })

  const data = computed(() => {
    const originalData = queryResult.data.value
    if (originalData === undefined) return undefined

    const input = unref(inputRef)
    const content = input.content
    const argumentIdAndData = [...content.arguments()]

    function resolveArgument(serverArgumentId: number) {
      const idAndData = argumentIdAndData[serverArgumentId - 1]
      if (idAndData === undefined) throw new Error('Server returned invalid argument.')
      const [id, { name }] = idAndData
      return { id, name }
    }

    if (isModelResult(originalData)) {
      const extensions: Extension[] = originalData.extensions.map((extension) =>
        extension.map((serverArgumentId) => resolveArgument(serverArgumentId)),
      )
      return {
        stateId: input.stateId,
        evaluationDurationInSeconds: originalData.evaluationDurationInSeconds,
        extensions,
      }
    }

    const accArguments: Extension = originalData.arguments.map((serverArgumentId) =>
      resolveArgument(serverArgumentId),
    )
    return {
      stateId: input.stateId,
      evaluationDurationInSeconds: originalData.evaluationDurationInSeconds,
      extensions: [accArguments],
    }
  })

  return { ...queryResult, data }
}
