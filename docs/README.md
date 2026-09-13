# Documentation

AgonProject's documentation is organized by audience. Start with the section that matches what
you are trying to do rather than reading the files in repository order.

## Use AgonProject

- [User guide](./user-guide.md) — frameworks, main workflows, storage, and sharing
- [Public deployment](https://agonproject.aig.fernuni-hagen.de/) — use the application
- The in-app tutorials and glossary — guided editing, evaluation, and formal definitions

## Understand the system

- [Architecture overview](./architecture/overview.md) — boundaries, runtime services, and data flows
- [Repository structure](./architecture/structure.md) — where code and supporting files live
- [File formats](./formats/README.md) — portable JSON, text, LaTeX/TikZ, and SVG

Architecture documentation describes what the system is and how its parts collaborate. It does
not prescribe the contributor workflow.

## Contribute

- [Contribution guide](/CONTRIBUTING.md) — the entry point for proposing and submitting changes
- [Development setup](./contributing/development.md) — prerequisites and local services
- [Testing](./contributing/testing.md) — test suites and CI coverage
- [Coding conventions](./contributing/conventions.md) — TypeScript, Vue, state, styling, and test patterns
- [Extending the application](./contributing/extending.md) — modules, evaluations, tutorials, exports, and layouts
- [Localization](./contributing/localization.md) — English/German message catalogs and untranslated content
- [Release process](./contributing/releases.md) — version tags, images, and GitHub releases

Contribution documentation describes how to change the system. It may link to architecture or
reference documents, but those remain independent sources of truth.

## Operate a deployment

- [Deployment and operations](./operations/deployment.md) — container topology, configuration,
  persistence, upgrades, and maintenance
- [Usage analytics](./operations/analytics/README.md) — event contract, privacy, dashboard, and administration
- Service documentation: [share server](/servers/share/README.md),
  [graph-generation server](/servers/graph-gen/README.md), and
  [argumentation MCP server](/servers/argumentation-mcp/README.md)

## Project material

- [Changelog](/CHANGELOG.md) — durable version history and changes queued for the next release
- [`paper/`](./paper/) and [`poster/`](./poster/) contain publication sources and generated assets.
- [`ideas/`](./ideas/) contains working notes and proposals. These are not current product or contributor documentation.

## Keeping documentation current

Update documentation in the same change whenever behavior, an API, a file format, configuration,
or a contributor command changes. Prefer links to source over copied implementation detail, and
label planned behavior explicitly. The architecture overview owns component boundaries; service
READMEs own their exact APIs; format documents own external serialization contracts.
