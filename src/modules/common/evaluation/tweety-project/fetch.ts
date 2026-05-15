import type z from 'zod'

const sourceTree = import.meta.env.VITE_APP_SOURCE_TREE

export const USER_ID = `argumentation-toolbox.aig.fernuni-hagen.de/${sourceTree}`

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
    throw new Error('HTTP response status: ' + response.status)
  }
  return schema.parse(await response.json())
}
