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

import type { BipoloarArgumentation } from '@/modules/bipolar-argumentation/model'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
import { buildArgumentIdMapping } from '@/modules/common/evaluation/tweety-project/argumentMapping'
import { throwIfTimeout } from '@/modules/common/evaluation/tweety-project/errors'
import { fetchTyped, TWEETY_TIMEOUT_IN_MS, TWEETY_TIMEOUT_UNIT_MS, TweetyResponseSchema, USER_ID } from '@/modules/common/evaluation/tweety-project/fetch'
import { parserListOfSets, parserSet } from '@/modules/common/evaluation/tweety-project/listOfSets'
import type { Semantics } from '@/modules/common/evaluation/tweety-project/semantics'
import type { Input } from '@/modules/common/evaluation/types'
import { type UUID } from '@/modules/common/ids'

const ENDPOINT_BIPOLAR_ARGUMENTATION = '/bipolar'

export const KEY_DEFAULT_SEMANTIC = 'BCF'
export const KEY_NONE_INTERPRETATION_GROUP = 'none-interpretation'

export const KNOWN_SEMANTIC_GROUPS: SemanticsFamily[] = [
  {
    key: 'none-interpretation',
    displayName: 'None Interpretation',
    semantics: [
      { key: 'BCF',  displayName: 'Conflict-free',        tooltipId: 'b-cf' },
      { key: 'BCOH', displayName: 'Coherent',             tooltipId: 'b-coh' },
      { key: 'BAD',  displayName: 'Coherent Admissible',  tooltipId: 'b-ad' },
      { key: 'CAD',  displayName: 'Coalition-Admissible', tooltipId: 'b-coal-ad' },
      { key: 'CCO',  displayName: 'Coalition-Complete',   tooltipId: 'b-coal-co' },
      { key: 'CGR',  displayName: 'Coalition-Grounded',   tooltipId: 'b-coal-gr' },
      { key: 'CPR',  displayName: 'Coalition-Preferred',  tooltipId: 'b-coal-pr' },
      { key: 'CST',  displayName: 'Coalition-Stable',     tooltipId: 'b-coal-st' },
    ],
  },
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

export interface SemanticsFamily {
  key: string
  displayName: string
  semantics: Semantics[]
}

export { type Semantics } from '@/modules/common/evaluation/tweety-project/semantics'

interface GetModelsRequestBody {
  email: string
  cmd: 'get_models'
  nr_of_arguments: number
  attacks: number[][]
  supports: number[][]
  support_type: string
  semantics: string
  timeout: number
  unit_timeout: typeof TWEETY_TIMEOUT_UNIT_MS
}

async function fetchModels(
  numberOfArguments: number,
  attacks: number[][],
  supports: number[][],
  semantics: string,
  supportType: string,
): Promise<{ evaluationDurationInMs: number; extensions: number[][] }> {
  const body: GetModelsRequestBody = {
    email: USER_ID,
    cmd: 'get_models',
    nr_of_arguments: numberOfArguments,
    attacks,
    supports,
    support_type: supportType,
    semantics,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_BIPOLAR_ARGUMENTATION, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, extensions: parserListOfSets(response.answer!) }
}

interface GetCredulousRequestBody {
  email: string
  cmd: 'get_credulous'
  nr_of_arguments: number
  attacks: number[][]
  supports: number[][]
  support_type: string
  semantics: string
  timeout: number
  unit_timeout: typeof TWEETY_TIMEOUT_UNIT_MS
}

interface GetSkepticalRequestBody {
  email: string
  cmd: 'get_skeptical'
  nr_of_arguments: number
  attacks: number[][]
  supports: number[][]
  support_type: string
  semantics: string
  timeout: number
  unit_timeout: typeof TWEETY_TIMEOUT_UNIT_MS
}

async function fetchCredulous(
  numberOfArguments: number,
  attacks: number[][],
  supports: number[][],
  semantics: string,
  supportType: string,
): Promise<{ evaluationDurationInMs: number; arguments: number[] }> {
  const body: GetCredulousRequestBody = {
    email: USER_ID,
    cmd: 'get_credulous',
    nr_of_arguments: numberOfArguments,
    attacks,
    supports,
    support_type: supportType,
    semantics,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_BIPOLAR_ARGUMENTATION, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, arguments: parserSet(response.answer!) }
}

async function fetchSkeptical(
  numberOfArguments: number,
  attacks: number[][],
  supports: number[][],
  semantics: string,
  supportType: string,
): Promise<{ evaluationDurationInMs: number; arguments: number[] }> {
  const body: GetSkepticalRequestBody = {
    email: USER_ID,
    cmd: 'get_skeptical',
    nr_of_arguments: numberOfArguments,
    attacks,
    supports,
    support_type: supportType,
    semantics,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_BIPOLAR_ARGUMENTATION, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, arguments: parserSet(response.answer!) }
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
  supportTypeRef: MaybeRef<string>,
  modeRef: MaybeRef<string>,
  enabled: MaybeRef<boolean>,
) {
  const argumentData = computed(() => {
    const input = unref(inputRef)
    const content = input.content
    const { numberOfArguments, idMapping } = buildArgumentIdMapping(content.arguments())
    const attacks = []
    for (const [sourceId, targetId] of content.attacks()) {
      attacks.push([idMapping.getOrFail(sourceId), idMapping.getOrFail(targetId)])
    }
    const supports = []
    for (const [sourceId, targetId] of content.supports()) {
      supports.push([idMapping.getOrFail(sourceId), idMapping.getOrFail(targetId)])
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
    if (mode === 'credulous') return ['bipolar_get_credulous', semanticsRef, supportTypeRef, modeRef, argumentData] as const
    if (mode === 'skeptical') return ['bipolar_get_skeptical', semanticsRef, supportTypeRef, modeRef, argumentData] as const
    return ['bipolar_get_models', semanticsRef, supportTypeRef, modeRef, argumentData] as const
  })

  const queryResult = useQuery<EvaluationQueryResult>({
    queryKey,
    queryFn: ({ queryKey }) => {
      const [, semantics, supportType, , { attacks, supports, numberOfArguments }] = queryKey as [
        string,
        string,
        string,
        string,
        { attacks: number[][]; supports: number[][]; numberOfArguments: number },
      ]
      const mode = unref(modeRef)
      if (mode === 'credulous') return fetchCredulous(numberOfArguments, attacks, supports, semantics, supportType)
      if (mode === 'skeptical') return fetchSkeptical(numberOfArguments, attacks, supports, semantics, supportType)
      return fetchModels(numberOfArguments, attacks, supports, semantics, supportType)
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
