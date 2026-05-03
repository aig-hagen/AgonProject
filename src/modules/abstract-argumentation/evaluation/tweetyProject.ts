import z from 'zod'

import { useQuery } from '@tanstack/vue-query'
import { type ArgumentId, type AbstractArgumentation } from '../model'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { Input } from '@/modules/common/evaluation/types'
import { computed, unref, type MaybeRef } from 'vue'
import { IdMapping } from '@/modules/common/ids'
import { parserListOfSets } from './listOfSets'
import type { UUID } from 'crypto'

const ENDPOINT_ABSTRACT_ARGUMENTATION = '/dung'

async function fetchTyped<T extends z.ZodTypeAny>(
  url: string,
  body: unknown,
  schema: T,
): Promise<z.infer<T>> {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('HTTP response status: ' + response.status)
  }
  return schema.parse(await response.json())
}

const InfoResponseSchema = z.object({
  semantics: z.array(z.string()),
})

const TIMEOUT_IN_SECONDS = 300
const TIMEOUT_UNIT_SECONDS = 's'

async function fetchSemantics(): Promise<SemanticGroup[]> {
  const infoResponse = await fetchTyped(
    ENDPOINT_ABSTRACT_ARGUMENTATION,
    {
      cmd: 'info',
    },
    InfoResponseSchema,
  )
  const semanticKeys = infoResponse.semantics
  const semanticGroups = matchAvailableSemanticKeyToSemanticGroups(semanticKeys)
  return semanticGroups
}

function matchAvailableSemanticKeyToSemanticGroups(semanticKeys: string[]): SemanticGroup[] {
  const semanticKeysAvailable = new Set(semanticKeys)
  const semanticKeysUncatagorized = new Set(semanticKeysAvailable)
  const groups = []
  for (const knownGroup of KNOWN_SEMANTIC_GROUPS) {
    const semantics = []
    for (const knownSemantic of knownGroup.semantics) {
      if (!semanticKeysAvailable.has(knownSemantic.key)) {
        continue
      }
      semanticKeysUncatagorized.delete(knownSemantic.key)
      semantics.push({
        key: knownSemantic.key,
        displayName: knownSemantic.displayName,
      })
    }
    if (semantics.length < 1) {
      continue
    }
    groups.push({
      key: knownGroup.key,
      displayName: knownGroup.displayName,
      semantics: semantics,
    })
  }
  if (semanticKeysUncatagorized.size > 0) {
    const semantics = []
    for (const key of semanticKeysUncatagorized) {
      semantics.push({
        key: key,
        displayName: key,
      })
    }
    groups.push({
      key: SEMANTIC_GROUP_UNCATAGORIZED_KEY,
      displayName: SEMANTIC_GROUP_UNCATAGORIZED_DISPLAY_NAME,
      semantics: semantics,
    })
  }
  return groups
}

export const KEY_STABLE_SEMANTIC = 'st'
export const KNOWN_SEMANTIC_GROUPS = [
  {
    key: 'classical',
    displayName: 'Classical',
    semantics: [
      {
        key: 'cf',
        displayName: 'Conflict-free',
      },
      {
        key: 'ad',
        displayName: 'Admissible',
      },
      {
        key: 'gr',
        displayName: 'Grounded',
      },
      {
        key: 'co',
        displayName: 'Complete',
      },
      {
        key: 'pr',
        displayName: 'Preferred',
      },
      {
        key: KEY_STABLE_SEMANTIC,
        displayName: 'Stable',
      },
    ],
  },
  {
    key: 'admissibility-based',
    displayName: 'Admissibility-based',
    semantics: [
      {
        key: 'sad',
        displayName: 'Strongly Admissable',
      },
      {
        key: 'SST',
        displayName: 'Semi Stable',
      },
      {
        key: 'id',
        displayName: 'Ideal',
      },
      {
        key: 'ea',
        displayName: 'Eager',
      },
      {
        key: 'in',
        displayName: 'Initial',
      },
      {
        key: 'soad',
        displayName: 'Solid Admissible',
      },
    ],
  },
  {
    key: 'non-admissible',
    displayName: 'Non-admissible',
    semantics: [
      {
        key: 'na',
        displayName: 'Naive',
      },
      {
        key: 'stage',
        displayName: 'Stage',
      },
      {
        key: 'stage2',
        displayName: 'Stage2',
      },
    ],
  },
  {
    key: 'weak',
    displayName: 'Weak',
    semantics: [
      {
        key: 'wad',
        displayName: 'Weakly Admissable',
      },
      {
        key: 'wco',
        displayName: 'Weakly Complete',
      },
      {
        key: 'wgr',
        displayName: 'Weakly Grounded',
      },
      {
        key: 'wpr',
        displayName: 'Weakly Preferred',
      },
    ],
  },
  {
    key: 'qualified Semantics',
    displayName: 'Qualified Semantics',
    semantics: [],
  },
] as const

const SEMANTIC_GROUP_UNCATAGORIZED_KEY = 'uncategorized'
const SEMANTIC_GROUP_UNCATAGORIZED_DISPLAY_NAME = 'Uncategorized'

export interface SemanticGroup {
  key: string
  displayName: string
  semantics: Semantic[]
}

export interface Semantic {
  key: string
  displayName: string
}

export function useSemanticsQuery() {
  return useQuery({ queryKey: ['dung_info'], queryFn: fetchSemantics })
}

interface GetModelsRequestBody {
  cmd: 'get_models'
  nr_of_arguments: number
  attacks: number[][]
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
  semantics: string,
): Promise<{
  evaluationDurationInSeconds: number
  extensions: number[][]
}> {
  const body: GetModelsRequestBody = {
    cmd: 'get_models',
    nr_of_arguments: numberOfArguments,
    attacks: attacks,
    semantics: semantics,
    timeout: TIMEOUT_IN_SECONDS,
    unit_timeout: TIMEOUT_UNIT_SECONDS,
  }

  const modelsResponse = await fetchTyped(
    ENDPOINT_ABSTRACT_ARGUMENTATION,
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
    return { numberOfArguments, attacks, semanticsRef: unref(semanticsRef), idMapping }
  })
  const queryResult = useQuery({
    queryKey: ['dung_get_models', semanticsRef, argumentData] as const,
    queryFn: ({ queryKey: [_key, semantics, { attacks, numberOfArguments }] }) =>
      fetchModels(numberOfArguments, attacks, semantics),
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
