import { randomInt } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

import cors from 'cors'
import express, { type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = parseInt(process.env.PORT ?? '8001', 10)
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*'
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '../../data/shares.db')

if (FRONTEND_URL === 'http://localhost:5173') {
  console.warn('WARNING: FRONTEND_URL is not set; share URLs in responses will point to localhost')
}
if (ALLOWED_ORIGIN === '*') {
  console.warn('WARNING: ALLOWED_ORIGIN is not set; CORS is open to all origins')
}
const MAX_CONTENT_BYTES = 512 * 1024
const EXPIRY_MS = 365 * 24 * 60 * 60 * 1000

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode=WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS shares (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_accessed_at INTEGER NOT NULL
  )
`)

const stmtInsert = db.prepare(
  'INSERT INTO shares (id, content, created_at, last_accessed_at) VALUES (?, ?, ?, ?)',
)
const stmtSelect = db.prepare('SELECT content FROM shares WHERE id = ?')
const stmtTouch = db.prepare('UPDATE shares SET last_accessed_at = ? WHERE id = ?')
const stmtCleanup = db.prepare('DELETE FROM shares WHERE last_accessed_at < ?')
const stmtExists = db.prepare('SELECT 1 FROM shares WHERE id = ?')

function cleanup() {
  const cutoff = Date.now() - EXPIRY_MS
  const result = stmtCleanup.run(cutoff)
  if ((result.changes as number) > 0) {
    console.log(`Cleaned up ${result.changes} expired share(s)`)
  }
}

cleanup()
setInterval(cleanup, 24 * 60 * 60 * 1000)

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function generateId(): string {
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += BASE62[randomInt(BASE62.length)]
  }
  return id
}

function generateUniqueId(): string {
  for (let attempts = 0; attempts < 10; attempts++) {
    const id = generateId()
    if (!stmtExists.get(id)) return id
  }
  throw new Error('Failed to generate unique ID after 10 attempts')
}

const app = express()

app.use(cors({ origin: ALLOWED_ORIGIN }))
app.use(express.json({ limit: '520kb' }))

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
})

app.post('/shares', uploadLimiter, (req: Request, res: Response) => {
  const { content } = req.body as { content?: unknown }
  if (typeof content !== 'string') {
    res.status(400).json({ error: 'content must be a string' })
    return
  }
  if (Buffer.byteLength(content, 'utf8') > MAX_CONTENT_BYTES) {
    res.status(413).json({ error: 'content exceeds 512 KB limit' })
    return
  }
  let id: string
  try {
    id = generateUniqueId()
  } catch {
    res.status(500).json({ error: 'Failed to generate share ID' })
    return
  }
  const now = Date.now()
  stmtInsert.run(id, content, now, now)
  res.status(201).json({ id, url: `${FRONTEND_URL}/share/${id}` })
})

app.get('/shares/:id', (req: Request, res: Response) => {
  const id = String(req.params['id'])
  const row = stmtSelect.get(id) as { content: string } | undefined
  if (!row) {
    res.status(404).json({ error: 'Share not found' })
    return
  }
  stmtTouch.run(Date.now(), id)
  res.json({ content: row.content })
})

app.listen(PORT, () => {
  console.log(`Share server running on http://localhost:${PORT}`)
})
