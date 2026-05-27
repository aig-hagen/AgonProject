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
import { parserListOfSets, parserSet } from '@/modules/common/evaluation/tweety-project/listOfSets'
import type { Input } from '@/modules/common/evaluation/types'
import { IdMapping, type UUID } from '@/modules/common/ids'

const ENDPOINT_ABSTRACT_ARGUMENTATION = '/dung'

const TIMEOUT_IN_SECONDS = 300
const TIMEOUT_UNIT_SECONDS = 's'

export const KEY_DEFAULT_SEMANTIC = 'ST'
export const KNOWN_SEMANTIC_GROUPS: SemanticGroup[] = [
  {
    key: 'classical',
    displayName: 'Classical Semantics',
    semantics: [
      {
        key: 'CF',
        displayName: 'Conflict-Free',
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
        key: 'ADM',
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
        key: 'CO',
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
        key: 'GR',
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
        key: 'PR',
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
        key: 'ST',
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
    displayName: 'Admissibility-based Semantics',
    semantics: [
      {
        key: 'SAD',
        displayName: 'Strongly Admissible',
        info: {
          description:
            'A set of arguments $E$ is strongly admissible iff $E=\\emptyset$ or each $a \\in E$ is defended by some strongly admissible $E\' \\subseteq E \\setminus \\{a\\}$.',
          reference: {
            name: 'Caminada, M. (2014). "Strong Admissibility Revisited". In: Computational Models of Argument - Proceedings of COMMA 2014. pp. 197 - 208',
            url: 'https://doi.org/10.3233/978-1-61499-436-7-197',
          }
        },
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
        key: 'ID',
        displayName: 'Ideal',
        info: {
          description:
            'The ideal extension is the $\\subseteq$-maximal admissible set in the intersection of all preferred extensions.',
          reference: {
            name: 'Dung, P.M., P. Mancarella and F. Toni. (2007). "Computing Ideal Sceptical Argumentation". Artificial Intelligence, Vol. 171, pp. 642 - 674',
            url: 'https://doi.org/10.1016/j.artint.2007.05.003',
          }
        },
      },
      {
        key: 'EA',
        displayName: 'Eager',
        info: {
          description:
            'The eager extension is the $\\subseteq$-maximal admissible set in the intersection of all semi-stable extensions.',
          reference: {
            name: 'Caminada, M. (2007). "Comparing two Unique Extension Semantics for Formal Argumentation: Ideal and Eager". In: Proceedings of the 19th Belgian-Durch Conference on Artificial Intelligence (BNACIC 2007), pp. 81 - 87',
            url: 'http://www.martincaminada.net/publications/ideal-eager.pdf',
          }
        },
      },
      {
        key: 'IS',
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
        key: 'UC',
        displayName: 'Unchallenged',
        info: {
          description:
            'Unchallenged extensions are defined via serialisation by exhaustively selecting only unattacked and unchallenged initial sets.',
          reference: {
            name: 'Bengel, L. and M. Thimm (2022). "Serialisable Semantics for Abstract Argumentation". In: Computational Models of Argument - Proceedings of COMMA 2022, pp. 80 - 91',
            url: 'https://doi.org/10.3233/FAIA220143',
          },
        },
      },
    ],
  },
  {
    key: 'non-admissible',
    displayName: 'Non-admissible Semantics',
    semantics: [
      {
        key: 'NA',
        displayName: 'Naive',
        info: {
          description:
            'A set of arguments $E$ is naive iff $E$ is a $\\subseteq$-maximal conflict-free set.',
          reference: {
            name: '',
            url: '',
          }
        },
      },
      {
        key: 'STG',
        displayName: 'Stage',
        info: {
          description:
            'A set of arguments $E$ is a stage extension iff $E$ is conflict-free and $E \\cup E^+$ is $\\subseteq$-maximal.',
          reference: {
            name: 'Verheij, B. (1996). "Two approaches to dialectical argumentation: admissible sets and argumentation stages". In: Proc. NAIC 96.357-368',
            url: 'https://www.ai.rug.nl/~verheij/publications/pdf/cd96.pdf',
          }
        },
      },
      {
        key: 'STG2',
        displayName: 'Stage2',
        info: {
          description:
            'The stage2 extensions are defined via the SCC-recursive schema with the stage semantics as the base function.',
          reference: {
            name: 'Dvorák, W. and S.A. Gaggl (2016). "Stage Semantics and the SCC-Recursive Schema for Argumentation Semantics", J. Log. Comput. 26, pp. 1149 - 1202',
            url: 'https://doi.org/10.1093/logcom/exu006',
          }
        },
      },
      {
        key: 'CF2',
        displayName: 'CF2',
        info: {
          description:
            'The CF2-extensions are defined via the SCC-recursive schema with the naive semantics as the base function.',
          reference: {
            name: 'Baroni, P., M. Giacomin and G. Guida (2005). "SCC-recursiveness: a general schema for argumentation semantics", Artificial Intelligence 168, pp. 162 - 210',
            url: 'https://doi.org/10.1016/j.artint.2005.05.006',
          }
        },
      },
      {
        key: 'UD',
        displayName: 'Undisputed',
        info: {
          description:
            'A set of arguments $E$ is undisputed iff $E$ is conflict-free in $F$ and the reduct $F^E$ contains no non-empty admissible set.',
          reference: {
            name: 'Thimm, M. (2023). "On Undisputed Sets in Abstract Argumentation", In: Proceedings of the AAAI Conference on Artificial Intelligence (AAAI 2023), pp. 6550 - 6557',
            url: 'https://doi.org/10.1609/aaai.v37i5.25805',
          }
        },
      },
      {
        key: 'SUD',
        displayName: 'Strongly Undisputed',
        info: {
          description:
            'A set of arguments $E$ is strongly undisputed iff $E$ is conflict-free in $F$ and the reduct $F^E$ contains no non-empty undisputed set.',
          reference: {
            name: 'Thimm, M. (2023). "On Undisputed Sets in Abstract Argumentation", In: Proceedings of the AAAI Conference on Artificial Intelligence (AAAI 2023), pp. 6550 - 6557',
            url: 'https://doi.org/10.1609/aaai.v37i5.25805',
          }
        },
      },
    ],
  },
  {
    key: 'weak',
    displayName: 'Weak Semantics',
    semantics: [
      {
        key: 'WAD',
        displayName: 'Weakly Admissible',
      },
      {
        key: 'WCO',
        displayName: 'Weakly Complete',
      },
      {
        key: 'WGR',
        displayName: 'Weakly Grounded',
      },
      {
        key: 'WPR',
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

interface GetCredulousRequestBody {
  email: string
  cmd: 'get_credulous'
  nr_of_arguments: number
  attacks: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_SECONDS
}

const GetAcceptabilityResponseSchema = z.object({
  time: z.number(),
  answer: z.string(),
})

async function fetchCredulous(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
): Promise<{
  evaluationDurationInSeconds: number
  arguments: number[]
}> {
  const body: GetCredulousRequestBody = {
    email: USER_ID,
    cmd: 'get_credulous',
    nr_of_arguments: numberOfArguments,
    attacks: attacks,
    semantics: semantics,
    timeout: TIMEOUT_IN_SECONDS,
    unit_timeout: TIMEOUT_UNIT_SECONDS,
  }

  const credulousResponse = await fetchTyped(
    ENDPOINT_ABSTRACT_ARGUMENTATION,
    body,
    GetAcceptabilityResponseSchema,
  )
  const accArguments = parserSet(credulousResponse.answer)
  return {
    evaluationDurationInSeconds: credulousResponse.time,
    arguments: accArguments,
  }
}

interface GetSkepticalRequestBody {
  email: string
  cmd: 'get_skeptical'
  nr_of_arguments: number
  attacks: number[][]
  semantics: string
  timeout: number
  unit_timeout: typeof TIMEOUT_UNIT_SECONDS
}

async function fetchSkeptical(
  numberOfArguments: number,
  attacks: number[][],
  semantics: string,
): Promise<{
  evaluationDurationInSeconds: number
  arguments: number[]
}> {
  const body: GetSkepticalRequestBody = {
    email: USER_ID,
    cmd: 'get_skeptical',
    nr_of_arguments: numberOfArguments,
    attacks: attacks,
    semantics: semantics,
    timeout: TIMEOUT_IN_SECONDS,
    unit_timeout: TIMEOUT_UNIT_SECONDS,
  }

  const skepticalResponse = await fetchTyped(
    ENDPOINT_ABSTRACT_ARGUMENTATION,
    body,
    GetAcceptabilityResponseSchema,
  )
  const accArguments = parserSet(skepticalResponse.answer)
  return {
    evaluationDurationInSeconds: skepticalResponse.time,
    arguments: accArguments,
  }
}

// Stuff for requesting models from the Tweety server
interface GetModelsRequestBody {
  email: string
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
    email: USER_ID,
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
  modeRef: MaybeRef<string>,
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
  type EvaluationQueryResult =
    | { evaluationDurationInSeconds: number; extensions: number[][] }
    | { evaluationDurationInSeconds: number; arguments: number[] }

  const isModelResult = (
    data: EvaluationQueryResult,
  ): data is { evaluationDurationInSeconds: number; extensions: number[][] } =>
    'extensions' in data

  const queryKey = computed(() => {
    const mode = unref(modeRef)
    if (mode === 'credulous') {
      return ['dung_get_credulous', semanticsRef, modeRef, argumentData] as const
    }
    if (mode === 'skeptical') {
      return ['dung_get_skeptical', semanticsRef, modeRef, argumentData] as const
    }
    return ['dung_get_models', semanticsRef, modeRef, argumentData] as const
  })

  const queryResult = useQuery<EvaluationQueryResult>({
    queryKey: queryKey,
    queryFn: ({ queryKey }) => {
      const [, semantics, , { attacks, numberOfArguments }] = queryKey as [
        string,
        string,
        string,
        { attacks: number[][]; numberOfArguments: number },
      ]
      const mode = unref(modeRef)
      if (mode === 'credulous') {
        return fetchCredulous(numberOfArguments, attacks, semantics)
      }
      if (mode === 'skeptical') {
        return fetchSkeptical(numberOfArguments, attacks, semantics)
      }
      return fetchModels(numberOfArguments, attacks, semantics)
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
        evaluationDurationInSeconds: originalData.evaluationDurationInSeconds,
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
      evaluationDurationInSeconds: originalData.evaluationDurationInSeconds,
      extensions: [accArguments],
    }
  })

  return {
    ...queryResult,
    data,
  }
}
