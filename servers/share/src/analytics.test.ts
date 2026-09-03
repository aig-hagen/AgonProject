import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, describe, test } from 'node:test'

import express, { type Express } from 'express'

import { registerAnalytics } from './analytics.ts'

const tmpDirs: string[] = []

// registerAnalytics reads ANALYTICS_DB_PATH and STATS_TOKEN at call time, so
// each app gets its own throwaway database and (optionally) a stats token.
function buildApp(opts: { statsToken?: string } = {}): Express {
  const dir = mkdtempSync(path.join(tmpdir(), 'agon-analytics-'))
  tmpDirs.push(dir)
  process.env.ANALYTICS_DB_PATH = path.join(dir, 'analytics.db')
  if (opts.statsToken !== undefined) process.env.STATS_TOKEN = opts.statsToken
  else delete process.env.STATS_TOKEN

  const app = express()
  app.use(express.json())
  registerAnalytics(app, dir)
  return app
}

async function withServer(app: Express, fn: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const { port } = server.address() as AddressInfo
  try {
    await fn(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

function postEvent(baseUrl: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

after(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true })
})

describe('POST /events', () => {
  test('accepts an allowlisted event', async () => {
    await withServer(buildApp(), async (url) => {
      const res = await postEvent(url, { type: 'page_view', name: '/generate' })
      assert.equal(res.status, 204)
    })
  })

  test('accepts an event with no name or props', async () => {
    await withServer(buildApp(), async (url) => {
      const res = await postEvent(url, { type: 'share_create' })
      assert.equal(res.status, 204)
    })
  })

  test('rejects an unknown event type', async () => {
    await withServer(buildApp(), async (url) => {
      const res = await postEvent(url, { type: 'not_a_real_event' })
      assert.equal(res.status, 400)
      assert.deepEqual(await res.json(), { error: 'unknown event type' })
    })
  })

  test('rejects a non-string type', async () => {
    await withServer(buildApp(), async (url) => {
      const res = await postEvent(url, { type: 42 })
      assert.equal(res.status, 400)
    })
  })

  test('rejects a name over the byte limit', async () => {
    await withServer(buildApp(), async (url) => {
      const res = await postEvent(url, { type: 'page_view', name: 'x'.repeat(129) })
      assert.equal(res.status, 400)
      assert.deepEqual(await res.json(), { error: 'invalid name' })
    })
  })

  test('rejects props over the byte limit', async () => {
    await withServer(buildApp(), async (url) => {
      const res = await postEvent(url, { type: 'module_open', props: { blob: 'x'.repeat(600) } })
      assert.equal(res.status, 400)
      assert.deepEqual(await res.json(), { error: 'props too large' })
    })
  })
})

describe('GET /stats', () => {
  test('is unavailable when no STATS_TOKEN is configured', async () => {
    await withServer(buildApp(), async (url) => {
      const res = await fetch(`${url}/stats`)
      assert.equal(res.status, 503)
    })
  })

  test('rejects a missing or wrong token', async () => {
    await withServer(buildApp({ statsToken: 'secret' }), async (url) => {
      assert.equal((await fetch(`${url}/stats`)).status, 401)
      assert.equal(
        (await fetch(`${url}/stats`, { headers: { authorization: 'Bearer nope' } })).status,
        401,
      )
    })
  })

  test('accepts a valid bearer token or query token', async () => {
    await withServer(buildApp({ statsToken: 'secret' }), async (url) => {
      assert.equal(
        (await fetch(`${url}/stats`, { headers: { authorization: 'Bearer secret' } })).status,
        200,
      )
      assert.equal((await fetch(`${url}/stats?token=secret`)).status, 200)
    })
  })

  test('aggregates posted events, counting distinct visitors', async () => {
    await withServer(buildApp({ statsToken: 'secret' }), async (url) => {
      // Two page views from distinct clients (distinct X-Forwarded-For), plus a
      // module open carrying its module type in props.
      await postEvent(url, { type: 'page_view', name: '/' }, { 'x-forwarded-for': '1.1.1.1' })
      await postEvent(url, { type: 'page_view', name: '/' }, { 'x-forwarded-for': '2.2.2.2' })
      await postEvent(
        url,
        { type: 'module_open', name: 'AF', props: { module: 'AF', source: 'blank' } },
        { 'x-forwarded-for': '1.1.1.1' },
      )

      const res = await fetch(`${url}/stats`, { headers: { authorization: 'Bearer secret' } })
      assert.equal(res.status, 200)
      const stats = (await res.json()) as {
        eventTotals: { type: string; count: number }[]
        viewsByDay: { day: string; views: number; visitors: number }[]
        topModules: { module: string; count: number; blank: number }[]
      }

      const pageViews = stats.eventTotals.find((e) => e.type === 'page_view')
      assert.equal(pageViews?.count, 2)
      assert.equal(stats.viewsByDay[0]?.views, 2)
      assert.equal(stats.viewsByDay[0]?.visitors, 2)

      const af = stats.topModules.find((m) => m.module === 'AF')
      assert.equal(af?.count, 1)
      assert.equal(af?.blank, 1)
    })
  })
})
