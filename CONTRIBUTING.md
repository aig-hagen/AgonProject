# Contributing to AgonProject

Contributions can cover the frontend, argumentation modules, backend services, documentation, examples, translations, or tests.

## First Steps

1. Read the [architecture overview](docs/architecture/overview.md), then the documentation relevant to the area you will change.

## Set up the project

Follow [the development setup](docs/contributing/development.md). Clone with submodules, install the root npm dependencies, and start only the backend services needed by your change, or use the `scripts/dev.sh` script.

## Make a change

- Base pull requests on `dev`. Use a separate branch for features or substantial changes.
- Follow the [coding conventions](docs/contributing/conventions.md). In particular, imports within `src/` use the `@/` alias and new `.ts`, `.vue`, and `.css` files need the project license header.
- Keep user-facing English and German message catalogs in sync; see the [localization guide](docs/contributing/localization.md).
- Add or update tests at the closest appropriate layer.
- Update documentation when behavior, public formats, APIs, configuration, or architecture changes.
- Add notable user-visible changes to the appropriate category under `Unreleased` in
  [CHANGELOG.md](CHANGELOG.md). Do not list refactors or maintenance with no user-visible effect.
- Do not include secrets, local databases, build output, or editor state.

## Verify the change

Use the [testing guide](docs/contributing/testing.md) to select relevant tests. Run at least:

```sh
npm run lint
npm run format
npm run format:check
npm run type-check
npm run test:unit -- --run
npm run build
npm run docs:check
```

Run Playwright and service-specific tests when those areas are affected. Note that `npm run lint` and `npm run format` modify files; review the resulting diff.

## Open a pull request

- Target `dev` and keep the pull request focused.
- Use a [Conventional Commits](https://www.conventionalcommits.org/) prefix for commit subjects, such as `feat:`, `fix:`, `docs:`, `test:`, or `refactor:`.
- Explain the user-visible outcome.
- Call out migrations, compatibility changes, new environment variables, or deployment work.

Release publishing is a maintainer task documented in
[docs/contributing/releases.md](docs/contributing/releases.md).
