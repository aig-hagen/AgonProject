# Testing

Run the smallest relevant suite while developing, then the full applicable set before requesting review. Commands below assume root dependencies have been installed as described in [Development setup](./development.md).

## Test matrix

| Check                          | Command                                    | Scope                                      | Current CI                         |
| ------------------------------ | ------------------------------------------ | ------------------------------------------ | ---------------------------------- |
| License headers and lint fixes | `npm run lint`                             | Root TypeScript/Vue and configuration      | Yes, in check-only form            |
| Formatting                     | `npm run format:check`                     | `src/`                                     | Yes                                |
| Type checking                  | `npm run type-check`                       | Vue and TypeScript                         | Yes                                |
| Documentation                  | `npm run docs:check`                       | Formatting, Markdown, links, and changelog | Yes                                |
| Frontend unit tests            | `npm run test:unit -- --run`               | Colocated `src/**/*.test.ts`               | No                                 |
| Production build               | `npm run build`                            | Type check and frontend bundle             | Indirectly in E2E and publish jobs |
| Browser E2E                    | `npm run test:e2e`                         | Playwright tests under `e2e/`              | Yes                                |
| Share service                  | `npm test --prefix servers/share`          | Express endpoints and analytics            | No                                 |
| MCP service                    | `pytest -q` in `servers/argumentation-mcp` | Contracts, transports, adapters, and tools | Yes                                |

The table describes the repository's current workflow, not an assurance that unlisted suites are optional. A change should run every suite whose behavior it can affect.

## Frontend checks

`npm run lint` inserts missing license headers and applies lint fixes. `npm run format` also modifies files. Run them before their check-only counterparts and inspect the diff.

Vitest normally starts in watch mode. Add `-- --run` for a single non-interactive run. Playwright requires its browser binaries once per environment:

```sh
npx playwright install
npm run test:e2e
```

E2E configuration starts the appropriate Vite server; it does not start TweetyProject, graph-gen, or the share server unless a test explicitly arranges that dependency.

## Documentation checks

`npm run docs:check` checks Markdown formatting and structure, local file and heading links, and the changelog/release-note contract. Working notes under `docs/ideas/` and vendored documentation are excluded.

External URLs are checked by the scheduled **Documentation links** workflow and can also be checked through its manual workflow dispatch. Keeping the network-dependent check separate prevents temporary external failures from blocking every pull request.

## Service tests

For the share service:

```sh
npm install --prefix servers/share
npm test --prefix servers/share
```

For MCP, create its Python environment and install the development requirements first:

```sh
cd servers/argumentation-mcp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -q
```

Graphviz enables rendering coverage in MCP tests; those cases skip when `dot` is unavailable. The MCP suite mocks backend behavior and is not a live integration test against TweetyProject.

## Choosing tests

- Model, parser, save-format, localization, or composable changes need unit tests.
- Visible workflows, responsive behavior, keyboard interaction, and accessibility regressions need Playwright coverage.
- API validation, persistence, rate limiting, or analytics changes need the owning service tests.
- Format changes need round-trip and invalid-input cases plus an update to the relevant reference document.
- Changes crossing a service boundary should test both request construction and response parsing.
