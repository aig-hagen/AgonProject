import * as z from 'zod'

import dix from '@/../third-party/xai-ca/xray/7a83aa5/examples/dix.json'
import double_loop from '@/../third-party/xai-ca//xray/7a83aa5/examples/double_loop.json'
import martin_str from '@/../third-party/xai-ca/xray/7a83aa5/examples/martin_str.json'
import matti_lpnmr_2024 from '@/../third-party/xai-ca/xray/7a83aa5/examples/matti_lpnmr_2024.json'
import meal_wine from '@/../third-party/xai-ca/xray/7a83aa5/examples/meal_wine.json'
import min_uniq_stb from '@/../third-party/xai-ca/xray/7a83aa5/examples/min_uniq_stb.json'
import pierson_post from '@/../third-party/xai-ca/xray/7a83aa5/examples/pierson_post.json'
import safa24 from '@/../third-party/xai-ca/xray/7a83aa5/examples/safa24.json'
import simple_game from '@/../third-party/xai-ca/xray/7a83aa5/examples/simple_game.json'
import tapp24 from '@/../third-party/xai-ca/xray/7a83aa5/examples/tapp24.json'
import tapp25 from '@/../third-party/xai-ca/xray/7a83aa5/examples/tapp25.json'
import unique_stb from '@/../third-party/xai-ca/xray/7a83aa5/examples/unique-stb.json'
import wild_animals from '@/../third-party/xai-ca/xray/7a83aa5/examples/wild-animals.json'

const afXrayExampleSources = [
  dix,
  double_loop,
  { ...martin_str, name: 'martin_str' },
  matti_lpnmr_2024,
  meal_wine,
  { ...min_uniq_stb, name: 'min_uniq_stb' },
  { ...pierson_post, name: 'pierson_post' },
  safa24,
  simple_game,
  tapp24,
  tapp25,
  { ...unique_stb, name: 'unique_stb' },
  wild_animals,
]

import { AbstractArgumentation } from '@/modules/abstract-argumentation/model'
import { layout } from '@/modules/abstract-argumentation/layout'
import { IdMapping } from '@/modules/common/ids'
import type { ArgumentData } from '@/modules/common/argumentation/model'
import type { Example } from '@/modules/common/examples'

const AfXrayExampleId = z.string()

const AfXrayExample = z.object({
  name: z.string(),
  arguments: z.array(
    z.object({
      id: AfXrayExampleId,
      annotation: z.optional(z.string()),
      name: z.optional(z.string()),
    }),
  ),
  defeats: z.array(
    z.object({
      from: AfXrayExampleId,
      to: AfXrayExampleId,
    }),
  ),
})

type AfXrayExample = z.infer<typeof AfXrayExample>

export const datasets: Example<AbstractArgumentation<ArgumentData>>[] = afXrayExampleSources.map(
  (unverfiedSource) => {
    return {
      name: unverfiedSource.name,
      load: () => {
        const idMapping = new IdMapping<string, number>()
        const source = AfXrayExample.parse(unverfiedSource)
        const argumentation = new AbstractArgumentation<ArgumentData>()
        source.arguments.forEach((argument, idx) => {
          idMapping.add(argument.id, idx)
          argumentation.addArgument(idx, {
            name: argument.id,
            x: 0,
            y: 0,
          })
        })
        for (const defeat of source.defeats) {
          const attackerId = idMapping.getOrFail(defeat.from)
          const attackedId = idMapping.getOrFail(defeat.to)
          argumentation.addAttack(attackerId, attackedId)
        }
        layout(argumentation)
        return argumentation
      },
    }
  },
)
