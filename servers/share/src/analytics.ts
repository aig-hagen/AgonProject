import { createHash, randomBytes } from 'node:crypto'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

import type { Express, Request, Response } from 'express'

// Allowlisted event types. Anything else is rejected so the endpoint can't be
// used as a free-form write sink. Keep in sync with src/app/analytics/events.ts.
const ALLOWED_TYPES = new Set([
  'page_view',
  'module_open',
  'evaluation_open',
  'evaluation_rate_limited',
  'share_create',
  'tutorial_start',
  'tutorial_complete',
])

const MAX_NAME_BYTES = 128
const MAX_PROPS_BYTES = 512

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// One salt per process lifetime, mixed with the current day. Rotating the day
// component means a visitor hash is only stable within a single day: we can
// count daily-unique visitors, but nobody is linkable across days. No IP or
// user-agent is ever stored.
const SESSION_SALT = randomBytes(32).toString('hex')

function clientIp(req: Request): string {
  // Behind Caddy, req.ip is the proxy (localhost) for everyone; the real client
  // IP is the first entry of X-Forwarded-For. Fall back to req.ip in dev.
  const forwarded = req.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? ''
  return req.ip ?? ''
}

function visitorHash(req: Request): string {
  const ip = clientIp(req)
  const ua = req.get('user-agent') ?? ''
  return createHash('sha256')
    .update(`${SESSION_SALT}:${today()}:${ip}:${ua}`)
    .digest('hex')
    .slice(0, 16)
}

export function registerAnalytics(app: Express, dataDir: string): void {
  const dbPath = process.env.ANALYTICS_DB_PATH ?? path.join(dataDir, 'analytics.db')
  const statsToken = process.env.STATS_TOKEN ?? ''

  const db = new DatabaseSync(dbPath)
  db.exec('PRAGMA journal_mode=WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT,
      props TEXT,
      day TEXT NOT NULL,
      visitor_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)
  db.exec('CREATE INDEX IF NOT EXISTS idx_events_day ON events (day)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_events_type ON events (type)')

  const stmtInsert = db.prepare(
    'INSERT INTO events (type, name, props, day, visitor_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  )

  // Rate limiting is handled at the Caddy edge (per-IP), which sees the real
  // client IP; no app-level limiter here.
  app.post('/events', (req: Request, res: Response) => {
    const { type, name, props } = req.body as {
      type?: unknown
      name?: unknown
      props?: unknown
    }

    if (typeof type !== 'string' || !ALLOWED_TYPES.has(type)) {
      res.status(400).json({ error: 'unknown event type' })
      return
    }

    let nameValue: string | null = null
    if (name !== undefined && name !== null) {
      if (typeof name !== 'string' || Buffer.byteLength(name, 'utf8') > MAX_NAME_BYTES) {
        res.status(400).json({ error: 'invalid name' })
        return
      }
      nameValue = name
    }

    let propsValue: string | null = null
    if (props !== undefined && props !== null) {
      const serialized = JSON.stringify(props)
      if (Buffer.byteLength(serialized, 'utf8') > MAX_PROPS_BYTES) {
        res.status(400).json({ error: 'props too large' })
        return
      }
      propsValue = serialized
    }

    stmtInsert.run(type, nameValue, propsValue, today(), visitorHash(req), Date.now())
    res.status(204).end()
  })

  // Aggregated read-only stats. Guarded by a bearer token so it is not public.
  app.get('/stats', (req: Request, res: Response) => {
    if (!statsToken) {
      res.status(503).json({ error: 'stats disabled (STATS_TOKEN not set)' })
      return
    }
    const provided = req.get('authorization')?.replace(/^Bearer\s+/i, '') ?? req.query['token']
    if (provided !== statsToken) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const viewsByDay = db
      .prepare(
        `SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors
         FROM events WHERE type = 'page_view' GROUP BY day ORDER BY day DESC LIMIT 90`,
      )
      .all()
    const eventTotals = db
      .prepare('SELECT type, COUNT(*) AS count FROM events GROUP BY type ORDER BY count DESC')
      .all()
    const topModules = db
      .prepare(
        `SELECT name AS module, COUNT(*) AS count FROM events
         WHERE type = 'module_open' AND name IS NOT NULL GROUP BY name ORDER BY count DESC`,
      )
      .all()
    const topEvaluations = db
      .prepare(
        `SELECT name AS endpoint, COUNT(*) AS count FROM events
         WHERE type = 'evaluation_open' AND name IS NOT NULL GROUP BY name ORDER BY count DESC`,
      )
      .all()
    // Per-day, per-type time series (all event types) so evals, module opens,
    // shares, etc. can each be plotted over time. Days are UTC.
    const eventsByDay = db
      .prepare(
        `SELECT day, type, COUNT(*) AS count, COUNT(DISTINCT visitor_hash) AS visitors
         FROM events GROUP BY day, type ORDER BY day DESC, type LIMIT 2000`,
      )
      .all()
    // How often the TweetyProject eval limit (Caddy 429) actually bites, and
    // how many distinct visitors it affects — to tune the limit with data.
    const rateLimited = db
      .prepare(
        `SELECT name AS endpoint, COUNT(*) AS count, COUNT(DISTINCT visitor_hash) AS visitors
         FROM events WHERE type = 'evaluation_rate_limited'
         GROUP BY name ORDER BY count DESC`,
      )
      .all()

    res.json({ viewsByDay, eventsByDay, eventTotals, topModules, topEvaluations, rateLimited })
  })
}
