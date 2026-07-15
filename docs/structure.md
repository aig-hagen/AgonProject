# Project Structure

This is an overview of how the repository is laid out. For how to set up a dev environment, see [DEVELOPMENT.md](./DEVELOPMENT.md); for how to extend the app, see [extending.md](./extending.md); for coding conventions, see [conventions.md](./conventions.md).

## Top level

- [`src/`](/src/) — the Vue frontend (see below)
- [`servers/`](/servers/) — auxiliary backend services (graph generation, sharing)
- [`third-party/TweetyProjectTeam/TweetyProject`](/third-party/TweetyProjectTeam/TweetyProject) — Git submodule providing the semantics-evaluation backend
- [`deployment/`](/deployment/) — Docker Compose, Caddyfile, and deploy scripts for running the app as one container
- [`Dockerfile`](/Dockerfile) — builds the combined production image (frontend + TweetyProject + graph-gen + share server, fronted by Caddy)
- [`docs/`](/docs/) — this documentation, plus a Bruno request collection under [`requests/`](./requests/), the [ICCMA export format spec](./iccma-format.md), and the [native save file format spec](./save-format.md)
- [`scripts/`](/scripts/) — dev tooling (`dev.sh` to run everything locally, license header checks, attribution generation)
- [`e2e/`](/e2e/) — Playwright end-to-end tests

## `src/app/` — application shell

Code here isn't specific to any argumentation type; it's the chrome around the editors.

- [`router.ts`](/src/app/router.ts) — page routing
- [`home/`](/src/app/home/) — the landing page, editor tabs, and [`moduleConfig.ts`](/src/app/home/moduleConfig.ts) (the `ModuleConfig` interface every argumentation module implements to plug into the tab/document system)
- [`generate/`](/src/app/generate/) — the random framework generation view (talks to the `graph-gen` server)
- [`glossary/`](/src/app/glossary/) — the standalone glossary browser view
- [`share/`](/src/app/share/) — the view for opening a shared framework link
- [`third-party/`](/src/app/third-party/) — the in-app third-party attributions view

## `src/modules/` — one folder per argumentation type

Each of `abstract-argumentation`, `bipolar-argumentation`, `dialectical-argumentation`, `incomplete-argumentation`, `probabilistic-argumentation`, and `collective-attacks-argumentation` follows the same internal convention:

- `moduleConfig.ts` — the `ModuleConfig` registering the module (display name, initial content, save/load, examples) — see [extending.md](./extending.md#add-new-argumentation-types)
- `model.ts` — the data model for that framework type
- `GraphEditor.vue` — the module's editor, wrapping the shared [`common/graph-editor/GraphEditor.vue`](/src/modules/common/graph-editor/GraphEditor.vue)
- `glossary.ts` — glossary entries specific to this framework type, referenced by inline tooltips and tutorials
- `tutorials/` — the `<type>-basics` and `<type>-evaluation` step-by-step tutorials
- `evaluation/` — semantics-evaluation logic, typically a `tweetyProject.ts` calling the TweetyProject backend
- `examples.ts` (+ `examples/`) — bundled example frameworks
- `export.ts` — available export formats (LaTeX, ICCMA, TGF, ...)
- `save/` — the native save-file format (de)serialisation
- `Window*.vue` — floating windows for evaluation results, rankings, serialisation, etc.

New argumentation types are added by following this same shape; see [extending.md](./extending.md) for the extension points in detail.

## `src/modules/common/` — shared building blocks

Used by every module above instead of being reimplemented per type:

- [`graph-editor/`](/src/modules/common/graph-editor/) — the shared canvas editor (`GraphEditor.vue`), wrapping the external [`@aig-hagen/graph-component`](https://github.com/aig-hagen/aig_graph_component)
- [`tutorial/`](/src/modules/common/tutorial/) — the tutorial engine (`useTutorial.ts`, `TutorialOverlay.vue`, `types.ts`)
- [`tooltip/`](/src/modules/common/tooltip/) — the glossary/tooltip registry and rendering (`TermTooltip.vue`, `tooltipRegistry.ts`, `publications.ts`)
- [`evaluation/`](/src/modules/common/evaluation/) — shared evaluation UI (`BaseEvaluationWindow.vue`, result grids) and the TweetyProject fetch client
- [`export/`](/src/modules/common/export/) — shared export machinery (save-file, SVG rendering, copy-to-clipboard button)
- [`graph-editor/`](/src/modules/common/graph-editor/), [`window/`](/src/modules/common/window/), [`main-menu/`](/src/modules/common/main-menu/), [`settings/`](/src/modules/common/settings/), [`share/`](/src/modules/common/share/), [`notifications/`](/src/modules/common/notifications/), [`theme/`](/src/modules/common/theme/) — other shared editor chrome and app-wide concerns

## `servers/` — auxiliary backend services

The frontend talks to three backends in development (see [DEVELOPMENT.md](./DEVELOPMENT.md) for how to run them), proxied via `vite.config.ts`:

- TweetyProject web server (Java, submodule under `third-party/`) — semantics evaluation, port 8080
- [`graph-gen/`](/servers/graph-gen/) (Python/FastAPI) — random framework generation, port 8000
- [`share/`](/servers/share/) (Node/Express) — sharing framework instances via a link, port 8001

In production these are bundled into one container ([`Dockerfile`](/Dockerfile)) and multiplexed behind Caddy ([`deployment/Caddyfile`](/deployment/Caddyfile)).
