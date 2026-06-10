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

import { fetchTyped, USER_ID } from '@/modules/common/evaluation/tweety-project/fetch'
import type { Input } from '@/modules/common/evaluation/types'
import { IdMapping, type UUID } from '@/modules/common/ids'
import { type FormulaNode } from '@/modules/dialectical-argumentation/condition/formula'
import { type AdfArgumentData, type DialecticalArgumentation } from '@/modules/dialectical-argumentation/model'

const ENDPOINT_ADF = '/adf'
const TIMEOUT_IN_SECONDS = 300
const TIMEOUT_UNIT_SECONDS = 's'

// ── Semantics ─────────────────────────────────────────────────────────────────

export const KEY_DEFAULT_SEMANTIC = 'ADM'

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

export interface SemanticGroup {
  key: string
  displayName: string
  semantics: Semantic[]
}

export const KNOWN_SEMANTIC_GROUPS: SemanticGroup[] = [
  {
    key: 'adf-semantics',
    displayName: 'ADF Semantics',
    semantics: [
      { key: 'CF', displayName: 'Conflict-Free' },
      { key: 'ADM', displayName: 'Admissible' },
      { key: 'CO', displayName: 'Complete' },
      { key: 'GR', displayName: 'Grounded' },
      { key: 'PR', displayName: 'Preferred' },
      { key: 'ST', displayName: 'Stable' },
      { key: 'NA', displayName: 'Naive' },
    ],
  },
]

// ── Formula serialization ─────────────────────────────────────────────────────
// Produces the KPP-style condition string expected by the /adf endpoint,
// e.g. ac(1,neg(2)), ac(2,and(1,or(2,neg(3)))), ac(3,c(v))

function formulaToKpp(node: FormulaNode, idMapping: IdMapping<number, number>): string {
  switch (node.type) {
    case 'tautology':
      return 'c(v)'
    case 'contradiction':
      return 'c(f)'
    case 'atom':
      return String(idMapping.getOrFail(node.argumentId))
    case 'negation':
      return `neg(${formulaToKpp(node.child, idMapping)})`
    case 'conjunction': {
      if (node.children.length === 0) return 'c(v)'
      if (node.children.length === 1) return formulaToKpp(node.children[0]!, idMapping)
      // KPP and() is binary — fold left: and(and(a,b),c)
      const parts = node.children.map((c) => formulaToKpp(c, idMapping))
      return parts.slice(1).reduce((acc, p) => `and(${acc},${p})`, parts[0]!)
    }
    case 'disjunction': {
      if (node.children.length === 0) return 'c(f)'
      if (node.children.length === 1) return formulaToKpp(node.children[0]!, idMapping)
      // KPP or() is binary — fold left: or(or(a,b),c)
      const parts = node.children.map((c) => formulaToKpp(c, idMapping))
      return parts.slice(1).reduce((acc, p) => `or(${acc},${p})`, parts[0]!)
    }
  }
}

// ── Answer parsing ────────────────────────────────────────────────────────────
// Parses the answer string returned by the /adf endpoint, e.g.:
// "[{ u(1) u(2) u(3)}, {t(2) u(1) u(3)}, {t(2) f(1) u(3)}, {t(2) f(1) f(3)}]"
// t(n) = in, f(n) = out, u(n) = undecided

interface ServerInterpretation {
  in: number[]
  out: number[]
  undec: number[]
}

function parseInterpretations(answer: string): ServerInterpretation[] {
  const result: ServerInterpretation[] = []
  const blockRegex = /\{([^}]*)\}/g
  let blockMatch: RegExpExecArray | null
  while ((blockMatch = blockRegex.exec(answer)) !== null) {
    const block = blockMatch[1]!
    const interp: ServerInterpretation = { in: [], out: [], undec: [] }
    const tokenRegex = /([tfu])\((\d+)\)/g
    let tokenMatch: RegExpExecArray | null
    while ((tokenMatch = tokenRegex.exec(block)) !== null) {
      const id = Number(tokenMatch[2]!)
      if (tokenMatch[1] === 't') interp.in.push(id)
      else if (tokenMatch[1] === 'f') interp.out.push(id)
      else interp.undec.push(id)
    }
    result.push(interp)
  }
  return result
}

// ── Request / Response ────────────────────────────────────────────────────────

interface GetModelsRequestBody {
  email: string
  cmd: 'get_models'
  nr_of_arguments: number
  conditions: string[]
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
  conditions: string[],
  semantics: string,
): Promise<{ evaluationDurationInSeconds: number; interpretations: ServerInterpretation[] }> {
  const body: GetModelsRequestBody = {
    email: USER_ID,
    cmd: 'get_models',
    nr_of_arguments: numberOfArguments,
    conditions,
    semantics,
    timeout: TIMEOUT_IN_SECONDS,
    unit_timeout: TIMEOUT_UNIT_SECONDS,
  }
  const response = await fetchTyped(ENDPOINT_ADF, body, GetModelsResponseSchema)
  return {
    evaluationDurationInSeconds: response.time,
    interpretations: parseInterpretations(response.answer),
  }
}

// ── Public result types ───────────────────────────────────────────────────────

export type ArgumentLabel = 'in' | 'out' | 'undec'

export interface InterpretationArgument {
  id: number
  name: string
  label: ArgumentLabel
}

export type Interpretation = InterpretationArgument[]

export interface InterpretationEvaluationResult {
  stateId: UUID
  evaluationDurationInSeconds: number
  interpretations: Interpretation[]
}

// ── Composable ────────────────────────────────────────────────────────────────

export function useInterpretationEvaluationQuery(
  inputRef: MaybeRef<Input<DialecticalArgumentation<AdfArgumentData>>>,
  semanticsRef: MaybeRef<string>,
  enabled: MaybeRef<boolean>,
) {
  const argumentData = computed(() => {
    const input = unref(inputRef)
    const content = input.content
    let numberOfArguments = 0
    const idMapping = new IdMapping<number, number>()

    for (const [argumentId] of content.arguments()) {
      idMapping.add(argumentId, ++numberOfArguments)
    }

    const conditions: string[] = []
    for (const [argumentId, data] of content.arguments()) {
      const serverArgId = idMapping.getOrFail(argumentId)
      conditions.push(`ac(${serverArgId},${formulaToKpp(data.condition, idMapping)})`)
    }

    return { numberOfArguments, conditions, idMapping }
  })

  const queryKey = computed(() => ['adf_get_models', semanticsRef, argumentData] as const)

  const queryResult = useQuery<{
    evaluationDurationInSeconds: number
    interpretations: ServerInterpretation[]
  }>({
    queryKey,
    queryFn: ({ queryKey }) => {
      const [, semantics, { numberOfArguments, conditions }] = queryKey as [
        string,
        string,
        { numberOfArguments: number; conditions: string[]; idMapping: IdMapping<number, number> },
      ]
      return fetchModels(numberOfArguments, conditions, semantics)
    },
    enabled,
  })

  const data = computed((): InterpretationEvaluationResult | undefined => {
    const originalData = queryResult.data.value
    if (originalData === undefined) return undefined

    const input = unref(inputRef)
    const argumentIdAndData = [...input.content.arguments()]

    const interpretations: Interpretation[] = originalData.interpretations.map((serverInterp) => {
      const inSet = new Set(serverInterp.in)
      const outSet = new Set(serverInterp.out)
      return argumentIdAndData.map(([id, { name }], index) => {
        const serverArgId = index + 1
        let label: ArgumentLabel
        if (inSet.has(serverArgId)) label = 'in'
        else if (outSet.has(serverArgId)) label = 'out'
        else label = 'undec'
        return { id, name, label }
      })
    })

    return {
      stateId: input.stateId,
      evaluationDurationInSeconds: originalData.evaluationDurationInSeconds,
      interpretations,
    }
  })

  return {
    ...queryResult,
    data,
  }
}
