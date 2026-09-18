# Architecture Overview

This document describes the system boundaries and the way data moves through AgonProject. For a
file-by-file map, see [repository structure](./structure.md). For instructions on changing the
system, see [CONTRIBUTING.md](/CONTRIBUTING.md).

## System context

AgonProject is a Vue single-page application backed by several small services. Editing, layout,
local persistence, tutorials, glossary rendering, and export happen in the browser. Computationally
expensive semantics, random generation, sharing, and aggregated analytics use HTTP services.

```mermaid
flowchart LR
    user([Browser user])
    agent([MCP client])

    subgraph browser[Browser]
        direction TB
        spa[Vue single-page application]
        indexedDb[(IndexedDB<br/>documents and UI state)]
        webStorage[(Web Storage<br/>settings and tutorials)]

        spa -->|persist documents| indexedDb
        spa -->|persist preferences| webStorage
    end

    subgraph container[Production OCI container]
        direction TB
        caddy[Caddy<br/>public port 8080]

        subgraph services[Application services]
            direction TB
            tweety[TweetyProject<br/>Java · port 8081]
            generator[graph-gen<br/>Python · port 8082]
            share[share server<br/>Node.js · port 8001]
            mcp[argumentation MCP<br/>Python · port 8083]
        end

        caddy -->|evaluation routes| tweety
        caddy -->|/graph-gen/*| generator
        caddy -->|/shares* · /events · /stats| share
        caddy -->|/mcp| mcp
        mcp -->|reasoning| tweety
        mcp -->|generation| generator
    end

    subgraph volume[Persistent Docker volume]
        sqlite[(shares.db<br/>analytics.db)]
    end

    user -->|interacts with| spa
    caddy -.->|serves HTML, CSS, and JavaScript| spa
    spa -->|same-origin HTTPS requests| caddy
    agent -->|MCP over HTTPS| caddy
    share -->|SQLite WAL| sqlite

    classDef actor fill:#fff4d6,stroke:#9a6700,color:#24292f
    classDef browserNode fill:#ddf4ff,stroke:#0969da,color:#24292f
    classDef edgeNode fill:#f6f8fa,stroke:#57606a,color:#24292f
    classDef serviceNode fill:#dafbe1,stroke:#1a7f37,color:#24292f
    classDef storeNode fill:#ffebe9,stroke:#cf222e,color:#24292f

    class user,agent actor
    class spa browserNode
    class caddy edgeNode
    class tweety,generator,share,mcp serviceNode
    class indexedDb,webStorage,sqlite storeNode
```

In development Vite serves the frontend and proxies browser API paths to ports 8080, 8000, and 8001. The MCP server is independent of the browser stack. In production one image runs every
process and Caddy provides the single public origin, static-file serving, routing, headers, and
rate limits.

Solid arrows are runtime calls or data writes. The dashed arrow is the application bootstrap: Caddy
delivers the frontend bundle, which then executes in the browser. Only the red storage nodes retain
data across page loads or container replacement.

## Frontend boundaries

[`src/app/`](/src/app/) owns the application shell: routing, the home and tab experience, random
generation, shared-link loading, privacy, and third-party notices.

[`src/modules/`](/src/modules/) owns argumentation behavior. Each formalism supplies a model,
editor adapter, examples, glossary, tutorials, evaluation integration, exports, and portable save
format. A [`ModuleConfig`](/src/app/home/moduleConfig.ts) is the integration boundary between a
module and the application shell. The registered module list in [`src/main.ts`](/src/main.ts)
determines what the application exposes.

[`src/modules/common/`](/src/modules/common/) contains infrastructure shared across formalisms:
graph editing, evaluation UI and HTTP transport, document state, import/export, windows, settings,
themes, notifications, tutorials, and tooltips. Framework-specific knowledge should remain in its
module unless more than one module genuinely uses it.

```mermaid
flowchart TB
    subgraph bootstrap[Bootstrap and application shell · src/main.ts and src/app]
        direction LR
        main[Application bootstrap<br/>Vue · router · i18n · Vue Query]
        router[Router and page views]
        home[Home controller<br/>documents · tabs · commands]
        generateView[Generate view]
        shareView[Share view]

        main --> router
        router --> home
        router --> generateView
        router --> shareView
    end

    subgraph moduleLayer[Argumentation module layer · src/modules/&lt;type&gt;]
        direction LR
        registry[ModuleConfig registry]
        modules[AF · BAF · ADF<br/>iAF · PAF · SetAF]
        model[Domain model]
        moduleEditor[Module editor adapter]
        moduleFeatures[Examples · glossary · tutorials<br/>evaluation · exports · save format]

        registry -.->|registers| modules
        modules --> model
        modules --> moduleEditor
        modules --> moduleFeatures
    end

    subgraph common[Shared frontend layer · src/modules/common]
        direction LR
        documents[Document state<br/>Immer patches · undo/redo]
        graphEditor[Shared graph editor]
        evaluation[Evaluation UI and adapters]
        importExport[Import and export pipeline]
        sharedUi[Windows · settings · themes<br/>tutorials · tooltips · notifications]
    end

    subgraph browserInfrastructure[Browser and library infrastructure]
        direction LR
        graphComponent["@aig-hagen/graph-component"]
        query[Vue Query and fetch]
        indexedDb2[(IndexedDB)]
        webStorage2[(Web Storage)]
        portableFile[(Portable JSON file)]
    end

    subgraph remote[HTTP service boundaries]
        direction LR
        reasoningApi[TweetyProject APIs]
        generationApi[graph-gen API]
        shareApi[share API]
    end

    main -.->|provides module list| registry
    home -->|selects by document type| registry
    home --> documents
    documents --> model
    documents --> indexedDb2

    moduleEditor --> graphEditor
    graphEditor --> graphComponent
    graphEditor --> sharedUi
    moduleFeatures --> evaluation
    moduleFeatures --> importExport
    evaluation --> query
    query --> reasoningApi

    generateView --> generationApi
    generateView -->|creates| model
    shareView --> shareApi
    shareView --> importExport
    importExport --> portableFile
    sharedUi --> webStorage2

    classDef shellNode fill:#ddf4ff,stroke:#0969da,color:#24292f
    classDef moduleNode fill:#dafbe1,stroke:#1a7f37,color:#24292f
    classDef commonNode fill:#fff4d6,stroke:#9a6700,color:#24292f
    classDef infrastructureNode fill:#f6f8fa,stroke:#57606a,color:#24292f
    classDef boundaryNode fill:#ffebe9,stroke:#cf222e,color:#24292f

    class main,router,home,generateView,shareView shellNode
    class registry,modules,model,moduleEditor,moduleFeatures moduleNode
    class documents,graphEditor,evaluation,importExport,sharedUi commonNode
    class graphComponent,query,indexedDb2,webStorage2,portableFile infrastructureNode
    class reasoningApi,generationApi,shareApi boundaryNode
```

The dashed relationships are registration/configuration performed during startup. Solid arrows are
runtime dependencies or data flow. The module-specific editor translates its domain model into the
shared graph-editor state; the common editor does not need to know which formalism it is displaying.

## State and persistence

There are three distinct persistence contracts:

| Data                                                | Storage                                 | Contract                                                                  |
| --------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| Open documents, edit history, per-document UI state | Browser IndexedDB, database `documents` | Internal and versioned with the application                               |
| Settings, theme, locale, tutorial progress          | Browser local storage                   | Internal keys owned by composables                                        |
| Saved files, examples, and share content            | Portable JSON                           | Public contract documented in [save-format.md](../formats/save-format.md) |

Document edits produce Immer patches. The document state retains forward and inverse patches for
undo/redo, while `useDocuments` serializes module models into IndexedDB. This internal serialization
must not be treated as an interchange format. Portable files pass through Zod schemas and are the
compatibility boundary for users and share links.

## Service responsibilities

| Service           | Public paths                                                                         | Responsibility                                                               | Persistent state |
| ----------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ---------------- |
| TweetyProject     | `/dung`, `/setaf`, `/bipolar`, `/rankings`, `/adf`, `/serialisation`, `/paf`, `/iaf` | Semantics and reasoning                                                      | None owned here  |
| graph-gen         | `/graph-gen/*`                                                                       | Random framework generation                                                  | None             |
| share             | `/shares*`, `/events`, `/stats`                                                      | Share storage and anonymous aggregated analytics                             | SQLite           |
| argumentation MCP | `/mcp`                                                                               | Typed tools for AF reasoning and generation                                  | None             |
| Caddy             | all public paths                                                                     | Static SPA, reverse proxy, headers, caching, maintenance mode, rate limiting | None             |

The service READMEs own exact request and response contracts, except TweetyProject, whose
contract is documented in the [reasoning backend API reference](./reasoning-backend-api.md) since
its code is vendored third-party. The production routes and security controls are defined in
[`deployment/Caddyfile`](/deployment/Caddyfile).

## Important data flows

### Evaluation

An evaluation window constructs a module-specific request. Vue Query invokes the shared fetch
layer, Vite or Caddy routes it to TweetyProject, and the module adapter validates and maps the result
back to application argument IDs. Results are view state; they are not uploaded to the share server.

### Random generation

The Generate view loads available algorithms and framework types from graph-gen, submits parameters,
and converts the returned structure into a module model. A generated framework becomes persistent
only when opened as a browser document or explicitly saved/shared.

### Sharing

The frontend serializes a document using its portable save format and sends that string to the
share service. The server returns an opaque short ID. Opening `/share/:id` retrieves the string and
uses `apiVersion` to select the module loader. The server does not interpret framework content.

### MCP

An MCP client calls the public `/mcp` endpoint or runs the server over stdio. The MCP adapter
validates a canonical AF representation and delegates reasoning to TweetyProject or generation to
graph-gen. It is stateless and is not a dependency of the browser application.

## Deployment characteristics

The production image deliberately contains several processes. The wrapper starts them and exits
when one exits; the container restart policy then restarts the unit. Only Caddy's port is published.
The Docker volume mounted at `/opt/share-server/data` is the only server-side durable application
state. See [deployment and operations](../operations/deployment.md) for configuration and lifecycle
procedures.
