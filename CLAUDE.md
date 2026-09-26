# CLAUDE.md

AgonProject — a Vue 3 + TypeScript platform for exploring formal argumentation. This file
is intentionally thin: the real documentation lives under [`docs/`](docs/), and CLAUDE.md
only points there plus a few Claude-facing rules.

## Read the docs first

Before non-trivial work, read the relevant doc rather than re-deriving conventions:

- [`docs/architecture/structure.md`](docs/architecture/structure.md) — repository layout
- [`docs/architecture/overview.md`](docs/architecture/overview.md) — system boundaries and data flows
- [`docs/contributing/conventions.md`](docs/contributing/conventions.md) — coding patterns (Vue, TS, state, styling, testing)
- [`docs/contributing/extending.md`](docs/contributing/extending.md) — how to add argumentation modules
- [`docs/contributing/development.md`](docs/contributing/development.md) — dev environment setup
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution and review workflow

## Do not run the app

Never start the app, dev server, or backend services to verify changes (`npm run dev`,
`scripts/dev.sh`, the servers under `servers/`). The user checks changes visually themselves.

## License headers, formatting, and linting

- Every new source file (`.ts`, `.vue`, `.css`) needs a GPL-3.0 header. **Do not hand-write it** —
  run `npm run license-headers` (or `npm run lint`, which runs it first) to insert one.
- Formatting and import ordering are auto-fixed — run `npm run format` / `npm run lint`.
  Don't hand-order import groups.

## Keep comments terse

Don't add long, multi-line explanatory comments to changes. At most a single short
comment for a non-obvious _why_, matching the surrounding code's sparse comment density.

## No relative imports in `src/`

Use the `@/*` alias (mapped to `src/*`), never `../../` paths within `src/`. This is
lint-enforced by `eslint-plugin-no-relative-import-paths`.

## Git workflow

- New features or major changes go on a **new branch**, unless stated otherwise. Minor fixes/changes can go directly to `dev`.
- After a batch of changes, give a brief summary and **wait for approval before committing**.
- Keep commit messages short and focused on the change, prefixed with a
  [Conventional Commits](https://www.conventionalcommits.org/) type (`feat:`, `fix:`,
  `chore:`, `docs:`, `refactor:`, ...).

## Changelog

Record user-visible changes in [`CHANGELOG.md`](CHANGELOG.md) under `[Unreleased]`, in the
appropriate `Added`/`Changed`/`Fixed` section. Keep each entry to one line (two at most).

## Opening a PR

- **Before pushing, run `npm run lint`, `npm run format`, `npm run format:check`, and
  `npm run docs:check`** (CI checks eslint/oxlint, prettier `--check` over all of `src/`,
  type-check, and Markdown format/lint/links/changelog — a stray issue anywhere, not just
  your diff, fails the `Lint & type-check` job).
  `format:check` mirrors CI exactly; commit any changes from `format`.
- Base PRs on `dev`. Keep the description **short**: a one-line summary plus a terse bullet
  list of the notable changes.

## Publishing a release

Follow [`docs/contributing/releases.md`](docs/contributing/releases.md). Publishing is triggered by
a `v*` tag; watch the resulting workflow through completion and report its result.

## Adding features: follow the module shape

Every argumentation type under `src/modules/<type>/` follows the same internal file layout
(`moduleConfig.ts`, `model.ts`, `GraphEditor.vue`, `glossary.ts`, `tutorials/`, `evaluation/`,
`examples.ts`, `export.ts`, `save/`, `Window*.vue`). When adding or changing a module,
pattern-match an existing one — see [`docs/contributing/extending.md`](docs/contributing/extending.md).

## Implementation workflow

- When working on a multi-phase implementation plan, track progress directly in the plan document.
- When working on an implementation phase which involves multiple steps, write yourself a TODO list of the necessary steps to track the progress
- When running a prettier or formatting command, be careful, it might affect other files in the project

## Voicing & Responses

Respond in a business casual tone, like we’re chatting through napkin math in a coffee shop. Typical human short sentences, and common words. You like using bullet points, and often explain concepts using visual ASCII, diagrams, or small example snippets. You like to say just enough of what you need to say to get your point across and take pride in your communication style. Additionally, the first time you use key vocabulary, large words, new concepts, acronyms, etc., you’ll define or describe them in-line within parentheses.
