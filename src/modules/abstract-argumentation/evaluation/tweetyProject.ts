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

import { type AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import type { ArgumentData, ArgumentId } from '@/modules/common/argumentation/model'
import { buildArgumentIdMapping } from '@/modules/common/evaluation/tweety-project/argumentMapping'
import { throwIfTimeout } from '@/modules/common/evaluation/tweety-project/errors'
import { fetchTyped, TWEETY_TIMEOUT_IN_MS, TWEETY_TIMEOUT_UNIT_MS, TweetyResponseSchema, USER_ID } from '@/modules/common/evaluation/tweety-project/fetch'
import { parserListOfSets, parserSet } from '@/modules/common/evaluation/tweety-project/listOfSets'
import type { SemanticsFamily } from '@/modules/common/evaluation/tweety-project/semantics'
import type { Input } from '@/modules/common/evaluation/types'
import { type UUID } from '@/modules/common/ids'

const ENDPOINT_ABSTRACT_ARGUMENTATION = '/dung'

export const KEY_DEFAULT_SEMANTIC = 'ST'
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
      { key: 'SCF2', displayName: 'SCF2' },
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
  {
    key: 'qualified Semantics',
    displayName: 'Qualified Semantics',
    semantics: [],
  },
].filter((group) => group.semantics.length > 0)

export { type Semantics, type SemanticsFamily } from '@/modules/common/evaluation/tweety-project/semantics'

export interface MetaReasonerParameter {
  key: string
  label: string
  description: string
  /** Keys of {@link KNOWN_SEMANTIC_GROUPS} semantics this parameter may be set to. */
  compatibleSemantics: string[]
}

export interface MetaReasoner {
  key: string
  displayName: string
  parameters: MetaReasonerParameter[]
  /**
   * Formats the currently selected parameter semantics (in parameter order) into the
   * results-header notation, e.g. ["Preferred"] -> "q-preferred". May contain KaTeX
   * "$...$" math, since the results header renders through KatexInlineElement.
   */
  formatNotation: (params: { key: string; displayName: string }[]) => string
  /**
   * Plain-text variant of formatNotation for contexts that can't render KaTeX (e.g. the
   * window title bar). Falls back to formatNotation when omitted.
   */
  formatTitleNotation?: (params: { key: string; displayName: string }[]) => string
}

// Note: resolution-based reasoners are intentionally left out of this list for now.
export const KNOWN_META_REASONERS: MetaReasoner[] = [
  {
    key: 'QLD',
    displayName: 'Qualified',
    formatNotation: ([base]) => `q-${base!.displayName.toLowerCase()}`,
    parameters: [
      {
        key: 'baseSemantics',
        label: 'Base Semantics',
        description: 'SCC-decomposable semantics used as the base function for the qualified extensions.',
        compatibleSemantics: ['ADM', 'CO', 'GR', 'PR', 'ST'],
      },
    ],
  },
  {
    key: 'SQLD',
    displayName: 'Semi-Qualified',
    formatNotation: ([base]) => `sq-${base!.displayName.toLowerCase()}`,
    parameters: [
      {
        key: 'baseSemantics',
        label: 'Base Semantics',
        description: 'SCC-decomposable semantics used as the base function for the semi-qualified extensions.',
        compatibleSemantics: ['ADM', 'CO', 'GR', 'PR', 'ST'],
      },
    ],
  },
  {
    key: 'VR',
    displayName: 'Vacuous Reduct',
    formatNotation: ([base, reduct]) =>
      '$' + `{\\sf ${base!.key.toLowerCase()}}^{\\sf ${reduct!.key.toLowerCase()}}` + '$',
    formatTitleNotation: ([base, reduct]) =>
      `${base!.key.toLowerCase()}/${reduct!.key.toLowerCase()}`,
    parameters: [
      {
        key: 'baseSemantics',
        label: 'Base Semantics',
        description: 'Semantics whose extensions are filtered by the reduct condition.',
        compatibleSemantics: ['CF', 'ADM', 'CO', 'GR', 'PR', 'ST', 'UD', 'SUD'],
      },
      {
        key: 'reductSemantics',
        label: 'Reduct Semantics',
        description: 'Semantics that must not yield a non-empty extension on the reduct of a base extension.',
        compatibleSemantics: ['CF', 'ADM', 'CO', 'GR', 'PR', 'ST', 'UD', 'SUD'],
      },
    ],
  },
]

/** Default args for the given semantics/meta-reasoner key (empty for plain semantics). */
export function defaultArgsForSemantics(key: string): Record<string, string> {
  const metaReasoner = KNOWN_META_REASONERS.find((m) => m.key === key)
  if (metaReasoner === undefined) return {}
  const args: Record<string, string> = {}
  for (const param of metaReasoner.parameters) {
    args[param.key] = param.compatibleSemantics[0]!
  }
  return args
}

interface GetCredulousRequestBody {
  email: string
  cmd: 'get_credulous'
  nr_of_arguments: number
  attacks: number[][]
  semantics: string
  args: Record<string, string>
  timeout: number
  unit_timeout: typeof TWEETY_TIMEOUT_UNIT_MS
}

async function fetchCredulous(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
  args: Record<string, string>,
): Promise<{ evaluationDurationInMs: number; arguments: number[] }> {
  const body: GetCredulousRequestBody = {
    email: USER_ID,
    cmd: 'get_credulous',
    nr_of_arguments: numberOfArguments,
    attacks,
    semantics,
    args,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_ABSTRACT_ARGUMENTATION, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, arguments: parserSet(response.answer!) }
}

interface GetSkepticalRequestBody {
  email: string
  cmd: 'get_skeptical'
  nr_of_arguments: number
  attacks: number[][]
  semantics: string
  args: Record<string, string>
  timeout: number
  unit_timeout: typeof TWEETY_TIMEOUT_UNIT_MS
}

async function fetchSkeptical(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
  args: Record<string, string>,
): Promise<{ evaluationDurationInMs: number; arguments: number[] }> {
  const body: GetSkepticalRequestBody = {
    email: USER_ID,
    cmd: 'get_skeptical',
    nr_of_arguments: numberOfArguments,
    attacks,
    semantics,
    args,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_ABSTRACT_ARGUMENTATION, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, arguments: parserSet(response.answer!) }
}

interface GetModelsRequestBody {
  email: string
  cmd: 'get_models'
  nr_of_arguments: number
  attacks: number[][]
  semantics: string
  args: Record<string, string>
  timeout: number
  unit_timeout: typeof TWEETY_TIMEOUT_UNIT_MS
}

async function fetchModels(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
  args: Record<string, string>,
): Promise<{ evaluationDurationInMs: number; extensions: number[][] }> {
  const body: GetModelsRequestBody = {
    email: USER_ID,
    cmd: 'get_models',
    nr_of_arguments: numberOfArguments,
    attacks,
    semantics,
    args,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_ABSTRACT_ARGUMENTATION, body, TweetyResponseSchema)
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, extensions: parserListOfSets(response.answer!) }
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
  inputRef: MaybeRef<Input<AbstractArgumentation<ArgumentData>>>,
  semanticsRef: MaybeRef<string>,
  argsRef: MaybeRef<Record<string, string>>,
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
    return { numberOfArguments, attacks, semanticsRef: unref(semanticsRef), idMapping }
  })
  type EvaluationQueryResult =
    | { evaluationDurationInMs: number; extensions: number[][] }
    | { evaluationDurationInMs: number; arguments: number[] }

  const isModelResult = (
    data: EvaluationQueryResult,
  ): data is { evaluationDurationInMs: number; extensions: number[][] } =>
    'extensions' in data

  const queryKey = computed(() => {
    const mode = unref(modeRef)
    if (mode === 'credulous') {
      return ['dung_get_credulous', semanticsRef, argsRef, modeRef, argumentData] as const
    }
    if (mode === 'skeptical') {
      return ['dung_get_skeptical', semanticsRef, argsRef, modeRef, argumentData] as const
    }
    return ['dung_get_models', semanticsRef, argsRef, modeRef, argumentData] as const
  })

  const queryResult = useQuery<EvaluationQueryResult>({
    queryKey: queryKey,
    queryFn: ({ queryKey }) => {
      const [, semantics, args, , { attacks, numberOfArguments }] = queryKey as [
        string,
        string,
        Record<string, string>,
        string,
        { attacks: number[][]; numberOfArguments: number },
      ]
      const mode = unref(modeRef)
      if (mode === 'credulous') {
        return fetchCredulous(numberOfArguments, attacks, semantics, args)
      }
      if (mode === 'skeptical') {
        return fetchSkeptical(numberOfArguments, attacks, semantics, args)
      }
      return fetchModels(numberOfArguments, attacks, semantics, args)
    },
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

    if (isModelResult(originalData)) {
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
        evaluationDurationInMs: originalData.evaluationDurationInMs,
        extensions: extensions,
      }
    }

    const accArguments: Extension = originalData.arguments.map((serverArgumentId: number) => {
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
