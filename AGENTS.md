# AGENTS.md

AgonProject — a Vue 3 + TypeScript platform for exploring formal argumentation. This file is
intentionally thin: the real documentation lives under [`docs/`](docs/README.md), and this file
only points there plus a few rules for coding agents.

## Read the docs first

Start from the [docs index](docs/README.md) and read the doc for the area you change rather than
re-deriving conventions:

- Any code change: [conventions](docs/contributing/conventions.md) and
  [structure](docs/architecture/structure.md)
- UI or styling: [design system](docs/contributing/design.md)
- User-facing text: [localization](docs/contributing/localization.md)
- Modules, glossary, tutorials, exports, evaluations: [extending](docs/contributing/extending.md)
- Tests: [testing](docs/contributing/testing.md)
- File formats or backend calls: [formats](docs/formats/README.md),
  [reasoning backend API](docs/architecture/reasoning-backend-api.md)
- Services and data flows: [architecture overview](docs/architecture/overview.md)

`docs/ideas/` holds working notes and plans, not the source of truth.

## Do not run the app

Never start the app, dev server, or backend services to verify changes (`npm run dev`,
`scripts/dev.sh`, the servers under `servers/`). The user checks changes visually themselves.
Unit and E2E tests are fine (`npm run test:e2e` starts its own Vite server).

## Verify before reporting

- Run `npm run type-check` and the relevant unit tests before calling a change done, and say
  what ran. `npm run test:unit` starts in watch mode; always pass `-- --run`.
- Add or update tests at the closest layer, colocated as `*.test.ts`; E2E specs live in `e2e/`.

## Code rules worth repeating

- Change documents through `modifyDocument` (Immer, records undo/redo); never mutate them directly.
- All user-facing text goes into both the `en` and `de` catalogs, via
  `useI18n({ useScope: 'global' })`. No hardcoded strings.
- No `any` or `@ts-ignore`. Runtime-validated data gets a Zod schema plus `z.infer`.
- Use the `@/*` alias, never relative imports, within `src/`.
- Keep comments terse: at most one short line for a non-obvious _why_.
- Stay in scope. Don't refactor unrelated code; mention issues you spot instead.
- Ask before adding an npm or Python dependency.
- Don't edit `third-party/`. Graph-component fixes go upstream to `aig_graph_component`, then the
  vendored `.tgz` is rebuilt.

## UI and styling changes

- Before changing templates, styles, or CSS, read
  [`docs/contributing/design.md`](docs/contributing/design.md), at least its Named Rules and Do's
  and Don'ts.
- Use palette tokens, font roles, the type scale, and existing components. No raw colors,
  arbitrary sizes, or one-off radii/shadows.
- If a change needs something the design system doesn't cover, flag it instead of inventing it.

## Formal content

- Definitions, results, and citations must come from a source in `publications.ts`, following the
  sourcing rules in `docs/contributing/glossary.md`. Don't infer or invent them; ask when unsure.
- Check claims about concrete frameworks with the argumentation MCP solver instead of computing
  extensions by hand.
- In Claude Code, run the `formal-reviewer` subagent (`.claude/agents/`) after adding or changing
  formal content.

## License headers and formatting

- New `.ts`, `.vue`, and `.css` files need a GPL-3.0 header. Don't hand-write it; run
  `npm run license-headers` (or `npm run lint`, which runs it first).
- Formatting and import order are auto-fixed by `npm run format` / `npm run lint`. In Claude Code,
  a hook (`.claude/hooks/format-file.sh`) lint-fixes and formats each file after an edit and
  reports what it can't fix.
- ESLint also enforces i18n (no bare strings in templates) and design guardrails (no arbitrary
  font sizes, extra radii, shadow opacity, or raw colors). Fix the cause; disable a rule inline
  only for a sanctioned exception, with the reason.
- These rewrite files beyond your diff: `format` covers all of `src/`, `docs:format` all Markdown.
  Check `git status` afterwards and don't commit unrelated changes.

## Plans and TODOs

- Multi-phase plans live in `docs/ideas/<topic>.md`; track progress in the plan itself.
- Remove an item from [`docs/ideas/TODO.md`](docs/ideas/TODO.md) once it is done.

## Git workflow

- New features or major changes go on a **new branch**, unless stated otherwise. Minor fixes can
  go directly to `dev`.
- After a batch of changes, **wait for approval before committing**. The summary lists the changed
  files, the proposed commit message, and the changelog entry.
- Commit messages are short, with a [Conventional Commits](https://www.conventionalcommits.org/)
  prefix (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, ...).

## Changelog

Record user-visible changes in [`CHANGELOG.md`](CHANGELOG.md) under `[Unreleased]`, in the
matching `Added`/`Changed`/`Removed`/`Fixed` section. One line per entry (two at most). Don't list
refactors or maintenance with no user-visible effect.

## Opening a PR

- **Before pushing, run `npm run lint`, `npm run format`, `npm run format:check`,
  `npm run type-check`, `npm run test:unit -- --run`, and `npm run docs:check`.** CI checks lint,
  prettier over all of `src/`, types, and Markdown; a stray issue anywhere fails the job. Unit
  tests don't run in CI, so run them locally.
- Base PRs on `dev`. Keep the description **short**: a one-line summary plus a terse bullet list of
  the notable changes.

## Publishing a release

Follow [`docs/contributing/releases.md`](docs/contributing/releases.md). Publishing is triggered by
a `v*` tag; watch the resulting workflow through completion and report its result.
