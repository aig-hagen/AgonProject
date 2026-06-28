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
import z from 'zod'

import { EvaluationTimeoutError, RateLimitError, ServiceUnavailableError } from '@/modules/common/evaluation/tweety-project/errors'

const sourceTree = import.meta.env.VITE_APP_SOURCE_TREE

export const USER_ID = `argumentation-toolbox.aig.fernuni-hagen.de/${sourceTree}`

export const TWEETY_TIMEOUT_IN_MS = 30000
export const TWEETY_TIMEOUT_UNIT_MS = 'ms' as const

export const TweetyResponseSchema = z.object({
  time: z.number(),
  answer: z.string().nullable(),
  status: z.string().optional().nullable(),
})

const HTTP_TIMEOUT_STATUSES = new Set([408, 504, 524])

export async function fetchTyped<T extends z.ZodTypeAny>(
  url: string,
  body: unknown & {
    email: string
  },
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
    if (HTTP_TIMEOUT_STATUSES.has(response.status)) throw new EvaluationTimeoutError()
    if (response.status === 429) throw new RateLimitError()
    if (response.status === 502 || response.status === 503) throw new ServiceUnavailableError()
    throw new Error('HTTP response status: ' + response.status)
  }
  return schema.parse(await response.json())
}
