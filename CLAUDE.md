# CLAUDE.md

AgonProject — a Vue 3 + TypeScript platform for exploring formal argumentation. This file
is intentionally thin: the real documentation lives under [`docs/`](docs/), and CLAUDE.md
only points there plus a few Claude-facing rules.

## Read the docs first

Before non-trivial work, read the relevant doc rather than re-deriving conventions:

- [`docs/structure.md`](docs/structure.md) — repository layout
- [`docs/conventions.md`](docs/conventions.md) — coding patterns (Vue, TS, state, styling, testing)
- [`docs/extending.md`](docs/extending.md) — how to add argumentation modules
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) — dev environment setup

## Do not run the app

Never start the app, dev server, or backend services to verify changes (`npm run dev`,
`scripts/dev.sh`, the servers under `servers/`). The user checks changes visually themselves.

## License headers, formatting, and linting

- Every new source file (`.ts`, `.vue`, `.css`) needs a GPL-3.0 header. **Do not hand-write it** —
  run `npm run license-headers` (or `npm run lint`, which runs it first) to insert one.
- Formatting and import ordering are auto-fixed — run `npm run format` / `npm run lint`.
  Don't hand-order import groups.

## No relative imports in `src/`

Use the `@/*` alias (mapped to `src/*`), never `../../` paths within `src/`. This is
lint-enforced by `eslint-plugin-no-relative-import-paths`.

## Git workflow

- New features or major changes go on a **new branch**, unless stated otherwise.
- After a batch of changes, give a brief summary and **wait for approval before committing**.
- Keep commit messages short and focused on the change, prefixed with a
  [Conventional Commits](https://www.conventionalcommits.org/) type (`feat:`, `fix:`,
  `chore:`, `docs:`, `refactor:`, ...).
- Never add yourself (Claude) to the commit message or as an author/co-author.

## Adding features: follow the module shape

Every argumentation type under `src/modules/<type>/` follows the same internal file layout
(`moduleConfig.ts`, `model.ts`, `GraphEditor.vue`, `glossary.ts`, `tutorials/`, `evaluation/`,
`examples.ts`, `export.ts`, `save/`, `Window*.vue`). When adding or changing a module,
pattern-match an existing one — see [`docs/extending.md`](docs/extending.md).
