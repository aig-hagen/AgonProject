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
export const KNOWN_SEMANTIC_GROUPS: SemanticGroup[] = [
  {
    key: 'classical',
    displayName: 'Classical',
    semantics: [
      {
        key: 'cf',
        displayName: 'Conflict-free',
        info: {
          description:
            'A set of arguments $E$ is conflict-free iff for all arguments $a,b \\in E$ we have that $(a,b) \\notin R$.',
          reference: {
            name: 'Dung, P.M. (1995). "On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games". In: Artificial Intelligence, Vol. 77.2, pp. 321 - 358',
            url: 'https://doi.org/10.1016/0004-3702(94)00041-X',
          },
        },
      },
      {
        key: 'ad',
        displayName: 'Admissible',
        info: {
          description:
            'A set of arguments $E$ is admissible iff $E$ is conflict-free and defends every argument $a \\in E$.',
          reference: {
            name: 'Dung, P.M. (1995). "On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games". In: Artificial Intelligence, Vol. 77.2, pp. 321 - 358',
            url: 'https://doi.org/10.1016/0004-3702(94)00041-X',
          },
        },
      },
      {
        key: 'co',
        displayName: 'Complete',
        info: {
          description:
            'A set of arguments $E$ is a complete extension iff $E$ is admissible and for every argument $a \\in A$ defended by $E$, we have that $a \\in E$.',
          reference: {
            name: 'Dung, P.M. (1995). "On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games". In: Artificial Intelligence, Vol. 77.2, pp. 321 - 358',
            url: 'https://doi.org/10.1016/0004-3702(94)00041-X',
          },
        },
      },
      {
        key: 'gr',
        displayName: 'Grounded',
        info: {
          description:
            'A set of arguments $E$ is a grounded extension iff $E$ is complete and $\\subseteq$-minimal.',
          reference: {
            name: 'Dung, P.M. (1995). "On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games". In: Artificial Intelligence, Vol. 77.2, pp. 321 - 358',
            url: 'https://doi.org/10.1016/0004-3702(94)00041-X',
          },
        },
      },
      {
        key: 'pr',
        displayName: 'Preferred',
        info: {
          description:
            'A set of arguments $E$ is a preferred extension iff $E$ is complete and $\\subseteq$-maximal.',
          reference: {
            name: 'Dung, P.M. (1995). "On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games". In: Artificial Intelligence, Vol. 77.2, pp. 321 - 358',
            url: 'https://doi.org/10.1016/0004-3702(94)00041-X',
          },
        },
      },
      {
        key: KEY_STABLE_SEMANTIC,
        displayName: 'Stable',
        info: {
          description:
            'A set of arguments $E$ is a stable extension iff $E$ is conflict-free and we have that $E \\cup E^+ = A$.',
          reference: {
            name: 'Dung, P.M. (1995). "On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games". In: Artificial Intelligence, Vol. 77.2, pp. 321 - 358',
            url: 'https://doi.org/10.1016/0004-3702(94)00041-X',
          },
        },
      },
    ],
  },
  {
    key: 'admissibility-based',
    displayName: 'Admissibility-based',
    semantics: [
      {
        key: 'sad',
        displayName: 'Strongly Admissible',
      },
      {
        key: 'SST',
        displayName: 'Semi-Stable',
        info: {
          description:
            'A set of arguments $E$ is a semi-stable extension iff $E$ is complete and $E \\cup E^+$ is $\\subseteq$-maximal.',
          reference: {
            name: 'Caminada, M. (2006). "Semi-Stable Semantics". In: Computational Models of Argument - Proceedings of COMMA 2006. pp. 121 - 130',
            url: 'https://dl.acm.org/doi/abs/10.5555/1565233.1565248',
          },
        },
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
        info: {
          description:
            'A set of arguments $E$ is initial iff $E$ is non-empty, admissible and $\\subseteq$-minimal.',
          reference: {
            name: 'Xu, Y. and C. Cayrol (2018). "Initial Sets in Abstract Argumentation Frameworks". In: Journal of Applied Non-Classical Logics, Vol. 28.2-3, pp. 260 - 279',
            url: 'https://doi.org/10.1080/11663081.2018.1457252',
          },
        },
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
        displayName: 'Weakly Admissible',
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
].filter((group) => group.semantics.length > 0)

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
  info?: {
    description: string
    reference: {
      name: string
      url: string
    }
  }
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
