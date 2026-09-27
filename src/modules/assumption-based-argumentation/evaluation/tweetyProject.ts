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

import type { ABAF, NodeId } from '@/modules/assumption-based-argumentation/model'
import { buildArgumentIdMapping } from '@/modules/common/evaluation/tweety-project/argumentMapping'
import { ReasonerError, throwIfTimeout } from '@/modules/common/evaluation/tweety-project/errors'
import {
  fetchTyped,
  TWEETY_TIMEOUT_IN_MS,
  TWEETY_TIMEOUT_UNIT_MS,
  TweetyResponseSchema,
  USER_ID,
} from '@/modules/common/evaluation/tweety-project/fetch'
import { parserListOfSets, parserSet } from '@/modules/common/evaluation/tweety-project/listOfSets'
import type { Semantics } from '@/modules/common/evaluation/tweety-project/semantics'
import type { Input } from '@/modules/common/evaluation/types'
import type { IdMapping, UUID } from '@/modules/common/ids'

const ENDPOINT_ABA = '/aba'

export const KEY_DEFAULT_SEMANTIC = 'st'

export interface AbaSemanticsFamily {
  key: string
  displayName: string
  flatOnly: boolean
  semantics: Semantics[]
}

export const KNOWN_SEMANTIC_GROUPS: AbaSemanticsFamily[] = [
  {
    key: 'aba',
    displayName: 'ABA Semantics',
    flatOnly: false,
    semantics: [
      { key: 'cf', displayName: 'Conflict-Free', tooltipId: 'abaCF' },
      { key: 'adm', displayName: 'Admissible', tooltipId: 'abaADM' },
      { key: 'co', displayName: 'Complete', tooltipId: 'abaCO' },
      { key: 'pr', displayName: 'Preferred', tooltipId: 'abaPR' },
      { key: 'st', displayName: 'Stable', tooltipId: 'abaST' },
      { key: 'wf', displayName: 'Well-Founded', tooltipId: 'abaWF' },
      { key: 'id', displayName: 'Ideal', tooltipId: 'abaID' },
    ],
  },
  {
    // Evaluated on the SETAF translation of the theory, which needs a flat theory.
    key: 'setaf',
    displayName: 'Via SetAF · flat only',
    flatOnly: true,
    semantics: [
      { key: 'gr', displayName: 'Grounded', tooltipId: 'abaGR' },
      { key: 'sad', displayName: 'Strongly Admissible' },
      { key: 'sst', displayName: 'Semi-Stable' },
      { key: 'ea', displayName: 'Eager' },
      { key: 'is', displayName: 'Initial' },
      { key: 'uc', displayName: 'Unchallenged' },
      { key: 'stg', displayName: 'Stage' },
      { key: 'ud', displayName: 'Undisputed' },
      { key: 'sud', displayName: 'Strongly Undisputed' },
      { key: 'wad', displayName: 'Weakly Admissible' },
      { key: 'wco', displayName: 'Weakly Complete' },
      { key: 'wgr', displayName: 'Weakly Grounded' },
      { key: 'wpr', displayName: 'Weakly Preferred' },
    ],
  },
]

// Serialises the theory in Tweety's ABA text format, using the mapped numeric ids as atoms.
export function toKb(aba: ABAF, idMapping: IdMapping<NodeId, number>): string {
  const id = (node: NodeId) => idMapping.getOrFail(node)
  const lines: string[] = []
  const assumptions = aba.assumptions()
  if (assumptions.length > 0) lines.push(`{${assumptions.map(id).join(',')}}`)
  for (const rule of aba.rules()) lines.push(`${id(rule.head)} <- ${rule.body.map(id).join(',')}`)
  for (const [node, data] of aba.nodeEntries()) if (data.fact) lines.push(`${id(node)} <-`)
  for (const [assumption, contrary] of aba.contraries()) {
    if (!aba.hasNode(assumption) || !aba.hasNode(contrary)) continue
    if (aba.getNode(assumption).kind !== 'assumption') continue
    lines.push(`not ${id(assumption)} = ${id(contrary)}`)
  }
  return lines.join('\n')
}

type Command = 'get_models' | 'get_credulous' | 'get_skeptical'

interface AbaRequestBody {
  email: string
  cmd: Command
  kb: string
  kb_format: 'pl'
  semantics: string
  timeout: number
  unit_timeout: typeof TWEETY_TIMEOUT_UNIT_MS
}

async function fetchAnswer(kb: string, semantics: string, cmd: Command) {
  const body: AbaRequestBody = {
    email: USER_ID,
    cmd,
    kb,
    kb_format: 'pl',
    semantics,
    timeout: TWEETY_TIMEOUT_IN_MS,
    unit_timeout: TWEETY_TIMEOUT_UNIT_MS,
  }
  const response = await fetchTyped(ENDPOINT_ABA, body, TweetyResponseSchema)
  if (response.status === 'ERROR') throw new ReasonerError(response.answer ?? 'Evaluation failed')
  throwIfTimeout(response.answer, response.status)
  return { evaluationDurationInMs: response.time, answer: response.answer! }
}

export type Extension = { id: number; name: string }[]

export interface ExtensionEvaluationResult {
  stateId: UUID
  evaluationDurationInMs: number
  extensions: Extension[]
}

export function useAbaEvaluationQuery(
  inputRef: MaybeRef<Input<ABAF>>,
  semanticsRef: MaybeRef<string>,
  modeRef: MaybeRef<string>,
  enabled: MaybeRef<boolean>,
) {
  const theory = computed(() => {
    const aba = unref(inputRef).content
    const { idMapping } = buildArgumentIdMapping(aba.nodeEntries())
    return { kb: toKb(aba, idMapping), idMapping }
  })
  const kb = computed(() => theory.value.kb)

  const queryResult = useQuery({
    queryKey: ['aba', semanticsRef, modeRef, kb] as const,
    queryFn: async ({ queryKey: [, semantics, mode, kb] }) => {
      if (mode === 'credulous' || mode === 'skeptical') {
        const cmd = mode === 'credulous' ? 'get_credulous' : 'get_skeptical'
        const { evaluationDurationInMs, answer } = await fetchAnswer(kb, semantics, cmd)
        return { evaluationDurationInMs, extensions: [parserSet(answer)] }
      }
      const { evaluationDurationInMs, answer } = await fetchAnswer(kb, semantics, 'get_models')
      return { evaluationDurationInMs, extensions: parserListOfSets(answer) }
    },
    enabled,
  })

  const data = computed<ExtensionEvaluationResult | undefined>(() => {
    const result = queryResult.data.value
    if (result === undefined) return undefined
    const input = unref(inputRef)
    const { idMapping } = theory.value
    const toNode = (serverId: number) => {
      if (!idMapping.hasReverse(serverId)) throw new Error('Server returned invalid assumption.')
      const id = idMapping.getOrFailReverse(serverId)
      return { id, name: input.content.getNode(id).name }
    }
    return {
      stateId: input.stateId,
      evaluationDurationInMs: result.evaluationDurationInMs,
      extensions: result.extensions.map((extension) => extension.map(toNode)),
    }
  })

  return { ...queryResult, data }
}
