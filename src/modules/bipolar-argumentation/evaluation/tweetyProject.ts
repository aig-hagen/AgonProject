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
import { fetchTyped, USER_ID } from '@/modules/common/evaluation/tweety-project/fetch'
import { parserListOfSets } from '@/modules/common/evaluation/tweety-project/listOfSets'
import type { Input } from '@/modules/common/evaluation/types'
import { IdMapping, type UUID } from '@/modules/common/ids'

const ENDPOINT_BIPOLAR_ARGUMENTATION = '/bipolar'

const TIMEOUT_IN_SECONDS = 300
const TIMEOUT_UNIT_SECONDS = 's'

export const KEY_DEFAULT_SEMANTIC = 'b-cf'
export const KNOWN_SEMANTIC_GROUPS: SemanticGroup[] = [
  {
    key: 'none-interpretation',
    displayName: 'None Interpretation',
    interpretations: ['None'],
    semantics: [
      {
        key: 'b-cf',
        displayName: 'Conflict-free',
      },
      {
        key: 'b-coh',
        displayName: 'Coherent',
      },
      {
        key: 'b-ad',
        displayName: 'Coherent Admissible',
      },
      {
        key: 'b-coal-ad',
        displayName: 'Coalition-Admissible',
      },
      {
        key: 'b-coal-co',
        displayName: 'Coalition-Complete',
      },
      {
        key: 'b-coal-gr',
        displayName: 'Coalition-Grounded',
      },
      {
        key: 'b-coal-pr',
        displayName: 'Coalition-Preferred',
      },
      {
        key: 'b-coal-st',
        displayName: 'Coalition-Stable',
      },
    ],
  },
  {
    key: 'deductive-interpretation',
    displayName: 'Deductive Interpretation',
    interpretations: ['Deductive'],
    semantics: [
      {
        key: 'd-ad',
        displayName: 'Admissible',
      },
      {
        key: 'd-co',
        displayName: 'Complete',
      },
      {
        key: 'd-gr',
        displayName: 'Grounded',
      },
      {
        key: 'd-pr',
        displayName: 'Preferred',
      },
      {
        key: 'd-st',
        displayName: 'Stable',
      },
    ],
  },
  {
    key: 'necessary-interpretation',
    displayName: 'Necessary Interpretation',
    interpretations: ['Necessary'],
    semantics: [
      {
        key: 'n-ad',
        displayName: 'Admissible',
      },
      {
        key: 'n-co',
        displayName: 'Complete',
      },
      {
        key: 'n-gr',
        displayName: 'Grounded',
      },
      {
        key: 'n-pr',
        displayName: 'Preferred',
      },
      {
        key: 'n-st',
        displayName: 'Stable',
      },
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
  info?: {
    description: string
    reference: {
      name: string
      url: string
    }
  }
}

interface GetModelsRequestBody {
  email: string
  cmd: 'get_models'
  nr_of_arguments: number
  attacks: number[][]
  supports: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_SECONDS
}

const GetModelsResponseSchema = z.object({
  time: z.number(),
  answer: z.string(),
})

async function fetchModels(
  numberOfArguments: number,
  attacks: number[][],
  supports: number[][],
  semantics: string,
): Promise<{
  evaluationDurationInSeconds: number
  extensions: number[][]
}> {
  const body: GetModelsRequestBody = {
    email: USER_ID,
    cmd: 'get_models',
    nr_of_arguments: numberOfArguments,
    attacks: attacks,
    supports: supports,
    semantics: semantics,
    timeout: TIMEOUT_IN_SECONDS,
    unit_timeout: TIMEOUT_UNIT_SECONDS,
  }

  const modelsResponse = await fetchTyped(
    ENDPOINT_BIPOLAR_ARGUMENTATION,
    body,
    GetModelsResponseSchema,
  )
  const extensions = parserListOfSets(modelsResponse.answer)
  return {
    evaluationDurationInSeconds: modelsResponse.time,
    extensions,
  }
}

export interface ExtensionEvaluationResult {
  stateId: UUID
  evaluationDurationInSeconds: number
  extensions: string[][]
}

export type Extension = {
  id: ArgumentId
  name: string
}[]

export function useExtensionEvaluationQuery(
  inputRef: MaybeRef<Input<BipoloarArgumentation<ArgumentData>>>,
  semanticsRef: MaybeRef<string>,
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
    return { numberOfArguments, attacks, supports, semanticsRef: unref(semanticsRef), idMapping }
  })
  const queryResult = useQuery({
    queryKey: ['dung_get_models', semanticsRef, argumentData] as const,
    queryFn: ({ queryKey: [_key, semantics, { attacks, supports, numberOfArguments }] }) =>
      fetchModels(numberOfArguments, attacks, supports, semantics),
    enabled: enabled,
  })
  const data = computed(() => {
    const originalData = queryResult.data.value
    if (originalData === undefined) {
      return undefined
    }
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
        return {
          id,
          name,
        }
      }),
    )
    return {
      stateId: input.stateId,
      evaluationDurationInSeconds: originalData.evaluationDurationInSeconds,
      extensions: extensions,
    }
  })
  return {
    ...queryResult,
    data,
  }
}
