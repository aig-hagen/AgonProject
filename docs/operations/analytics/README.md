# Usage analytics

AgonProject collects lightweight, **anonymous, aggregated** usage statistics without
cookies or cross-day visitor tracking. Raw IP addresses and user-agent strings are used
only to calculate a short-lived visitor hash and are not stored.

## What is collected

Each event is a row of `{ type, name?, props?, day, visitor_hash }`:

| Event                                  | `name`                                                    | `props`                 | Fired when                                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page_view`                            | route pattern (e.g. `/generate`, `/share/:id`)            | —                       | any route navigation                                                                                                                                        |
| `module_open`                          | module prefix, or example name (when `source: 'example'`) | `{ source, module }`    | a document is opened in the editor — from a blank (`source: 'blank'`), an example (`'example'`), or a random generation (`'generate'`, on _Open in Editor_) |
| `generate_run`                         | module prefix                                             | `{ module, algorithm }` | a random framework is actually generated in the Generate view                                                                                               |
| `evaluation_open`                      | evaluation title                                          | `{ module }`            | an evaluation is initially selected or the selection changes                                                                                                |
| `evaluation_rate_limited`              | TweetyProject endpoint                                    | —                       | an eval request is throttled (HTTP 429)                                                                                                                     |
| `share_create`                         | —                                                         | —                       | a share link is created                                                                                                                                     |
| `tutorial_start` / `tutorial_complete` | tutorial id                                               | —                       | a tutorial is started / finished                                                                                                                            |

`module_open` carries `props.module` (the module type, e.g. `AF`) so opens group by
module regardless of how the document was created; for examples `name` still holds the
concrete example (unique only _per module_). `generate_run` is distinct from
`module_open` with `source: 'generate'`: the former counts frameworks generated, the
latter counts those actually opened in the editor. The home-screen _Generate_ button —
which only navigates to the Generate view — is **not** tracked.

Deliberately **not** collected: IP addresses, precise location, share IDs (only the
`/share/:id` _pattern_ is stored), or the content of any framework.

### `visitor_hash`

Computed server-side as `sha256(sessionSalt + day + ip + user-agent)`, truncated to 16
hexadecimal characters. The salt is random per server process and the day component
rotates daily, so a visitor is countable _within_ a day while the process remains
running but is **not linkable across days**. The raw IP and user-agent are never stored.

### Opt-out

The frontend honours `navigator.doNotTrack` and Global Privacy Control — if either is
set, nothing is sent. Analytics is on in production builds and off in dev unless
`VITE_ANALYTICS_ENABLED=true`; set `VITE_ANALYTICS_ENABLED=false` to disable a production
build entirely.

## User-facing notice

The plain-language version shown to visitors lives at the `/privacy` route
([`src/app/privacy/`](/src/app/privacy/)), linked from the Help window's links bar
([`HelpLinks.vue`](/src/modules/common/help/HelpLinks.vue)). Keep it in sync with the
"What is collected" and "Opt-out" sections above.

## Where it lives

- Ingest + storage: [`servers/share/src/analytics.ts`](/servers/share/src/analytics.ts),
  registered on the share server. Data goes to `analytics.db` in the same persisted
  volume as `shares.db`.
- Client: [`src/app/usage/report.ts`](/src/app/usage/report.ts) (fire-and-forget
  `trackEvent`) and [`signals.ts`](/src/app/usage/signals.ts) (the event allowlist,
  kept in sync with the backend). The directory is deliberately named `usage` (not
  `analytics`) so content blockers like uBlock don't block the module requests in dev.
- Routing: `/events` (rate-limited) and `/stats` in
  [`deployment/Caddyfile`](/deployment/Caddyfile).

## Reading the stats

`GET /stats` returns aggregated JSON, guarded by a bearer token — set `STATS_TOKEN` in the
container environment; while unset the endpoint stays disabled (503). Fields:

| Field            | Shape                                           | Use                                                                                  |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `viewsByDay`     | `{ day, views, visitors }[]`                    | page views & unique visitors per day                                                 |
| `eventsByDay`    | `{ day, type, count, visitors }[]`              | per-day, per-type series (evals, module opens, shares, …) — plot any event over time |
| `eventTotals`    | `{ type, count }[]`                             | all-time totals per event type                                                       |
| `topModules`     | `{ module, count, blank, generate, example }[]` | most-opened module types, with the open count split by source                        |
| `topExamples`    | `{ module, example, count }[]`                  | most-opened examples, keyed by `(module, name)` — names are unique only per module   |
| `topGenerators`  | `{ algorithm, module, count }[]`                | random generations run, by algorithm and module                                      |
| `topEvaluations` | `{ module, endpoint, count }[]`                 | selected evaluations, grouped by `(module, endpoint)`                                |
| `topTutorials`   | `{ tutorial, starts, completes }[]`             | per-tutorial starts vs completes                                                     |
| `rateLimited`    | `{ endpoint, count, visitors }[]`               | eval requests throttled (HTTP 429)                                                   |

Days are bucketed in **UTC**. `viewsByDay` covers the last 90 days; `eventsByDay` is
capped at 2000 rows (≈ the most recent days across all types). `topModules` counts group
by `props.module` (falling back to `name` for rows predating it), so historical example
opens may still appear under their example name rather than a module type.

Analytics events currently have no automatic expiry and remain in `analytics.db` until
the database or its rows are removed manually.

### Dashboard viewer

An HTML dashboard renders this JSON as charts and ranked lists:
[`dashboard.html`](./dashboard.html), next to this doc. It loads
Tailwind CSS and ApexCharts from public CDNs. Open the file in a browser, then enter the
server URL (e.g. `https://<host>`) and `STATS_TOKEN` in its settings panel. The server's
`ALLOWED_ORIGIN` setting must permit the dashboard page's origin. The server stores no
dashboard settings; the browser saves the server URL and token in `localStorage` until
the dashboard's **Clear** action is used.

### One-time setup on the deploy server

`compose.yml` reads `STATS_TOKEN` from a `.env` file in the same directory (Compose loads
it automatically):

```sh
cd /path/to/deployment          # the directory containing compose.yml

openssl rand -hex 32            # generate a token, copy the output
echo "STATS_TOKEN=<paste>" >> .env
chmod 600 .env

docker compose up -d           # recreate the container with the new env
```

The `shares_data` volume (and the analytics DB inside it) is untouched by the recreate.

### Verify

```sh
docker compose exec agonproject printenv STATS_TOKEN   # var reached the container
curl -H "Authorization: Bearer <token>" https://agonproject.aig.fernuni-hagen.de/stats
```

`401` means the sent token ≠ the `.env` value; `503` means the var never reached the
process (not set, or the container wasn't recreated).

### Reading day-to-day

```sh
# header form (preferred), pretty-printed
curl -s -H "Authorization: Bearer <token>" \
  https://agonproject.aig.fernuni-hagen.de/stats | jq

# query-string authentication is supported, but places the token in browser history
https://agonproject.aig.fernuni-hagen.de/stats?token=<token>
```

### Rotate or disable

```sh
# rotate: edit .env with a new value, then
docker compose up -d

# disable /stats entirely: remove/blank the line and recreate → back to 503
```

## Adding a new event

1. Add the type to `ANALYTICS_EVENTS` in [`signals.ts`](/src/app/usage/signals.ts).
2. Add the same string to `ALLOWED_TYPES` in
   [`analytics.ts`](/servers/share/src/analytics.ts) (the backend rejects unknown types).
3. Call `trackEvent(ANALYTICS_EVENTS.yourEvent, name?, props?)` at the call site.
