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
import { parserListOfSets } from '@/modules/common/evaluation/tweety-project/listOfSets'
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
const TIMEOUT_IN_SECONDS = 300
const TIMEOUT_UNIT_SECONDS = 's'

type IafCommand = 'get_models_pos' | 'get_models_nec'

interface GetModelsRequestBody {
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

const GetModelsResponseSchema = z.object({
  time: z.number(),
  answer: z.string(),
})

async function fetchModels(
  cmd: IafCommand,
  numberOfArguments: number,
  uncertainArgumentIds: number[],
  definiteAttacks: number[][],
  uncertainAttacks: number[][],
  semantics: string,
): Promise<{ evaluationDurationInSeconds: number; extensions: number[][] }> {
  const body: GetModelsRequestBody = {
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
  const response = await fetchTyped(ENDPOINT_IAF, body, GetModelsResponseSchema)
  return {
    evaluationDurationInSeconds: response.time,
    extensions: parserListOfSets(response.answer),
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
  modeRef: MaybeRef<'pos' | 'nec'>,
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

  const queryResult = useQuery({
    queryKey: ['iaf_get_models', semanticsRef, modeRef, argumentData] as const,
    queryFn: ({ queryKey: [_key, semantics, mode, { numberOfArguments, uncertainArgumentIds, definiteAttacks, uncertainAttacks }] }) =>
      fetchModels(
        `get_models_${mode}` as IafCommand,
        numberOfArguments,
        uncertainArgumentIds,
        definiteAttacks,
        uncertainAttacks,
        semantics,
      ),
    enabled,
  })

  const data = computed(() => {
    const originalData = queryResult.data.value
    if (originalData === undefined) return undefined

    const input = unref(inputRef)
    const content = input.content
    const argumentIdAndData = [...content.arguments()]

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
      evaluationDurationInSeconds: originalData.evaluationDurationInSeconds,
      extensions,
    }
  })

  return { ...queryResult, data }
}
