# Share Server

A small Express service that lets a framework instance be shared via a short link: the frontend POSTs the serialized document and gets back an id, and anyone with that id's link can fetch the content back.

For how to run this locally alongside the rest of the app, see [../../docs/DEVELOPMENT.md](../../docs/DEVELOPMENT.md#running-the-share-server).

## API

### `POST /shares`

Body: `{ "content": string }`

- `content` must be a string and no larger than 512 KB, or the request is rejected (`400`/`413`).
- Rate-limited to 20 requests per minute per IP.
- On success (`201`), returns `{ "id": string, "url": string }`, where `id` is an 8-character base62 id and `url` is `${FRONTEND_URL}/share/${id}`.

### `GET /shares/:id`

Returns `{ "content": string }` for a known id (`200`), or `{ "error": "Share not found" }` (`404`). Reading a share refreshes its `last_accessed_at` timestamp.

## Storage and expiry

Shares are stored in a SQLite database (via Node's built-in `node:sqlite`, WAL mode) at `DB_PATH`. A share that hasn't been accessed (created or read) in over a year is deleted; this cleanup runs on startup and then once every 24 hours.

## Configuration

Environment variables (see [`.env.example`](./.env.example)):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8001` | Port to listen on |
| `FRONTEND_URL` | `http://localhost:5173` | Used to build the `url` returned by `POST /shares` |
| `ALLOWED_ORIGIN` | `*` | CORS origin allowed to call this server |
| `DB_PATH` | `./data/shares.db` | Path to the SQLite database file |

If `FRONTEND_URL`/`ALLOWED_ORIGIN` are left at their defaults, the server logs a startup warning, since that means share URLs will point at localhost and/or CORS is wide open.

## Running

```sh
npm install
cp .env.example .env
npm run dev
```
