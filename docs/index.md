# Development Documentation

## Required Tools

- [Node.js](https://nodejs.org/en)
  - Tested with v24
  - But other versions should also work fine
- Optionally [Docker](https://www.docker.com/)
  - can be used for building container images locally
  - can be used for running TweetyProject Web Server
  - other container runtimes like [Podman](https://podman.io/) should also work fine

## Quick Start

### Cloning

When cloning, also clone the used Git Submodules

```sh
git clone --recurse-submodules https://github.com/aig-hagen/AgonProject.git
```

### Install Dependencies

```sh
npm install-clean
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run E2E Tests with [Playwright](https://playwright.dev/)

```sh
npx playwright install
npm run test:e2e
```

### Running Everything at Once

[`scripts/dev.sh`](/scripts/dev.sh) starts the graph generation server, the share server, the TweetyProject web server, and the frontend dev server together, and stops them all on exit.
It sets up the graph-gen venv and installs share server dependencies on first run if missing.

```sh
./scripts/dev.sh
```

This requires the TweetyProject web server to already be buildable, i.e. `mvn install -Dgpg.skip=true` must have been run at least once inside the `TweetyProject` submodule — see below.

If you only need one server, or want more control, follow the manual instructions below instead.

### Running TweetyProject Web Server

During development, the TweetyProject web server is expected to run locally on port 8080.
This is configured in the [Vite config](/vite.config.ts) through the [`server.proxy`](https://vite.dev/config/server-options#server-proxy) option.

If you do not need to make modifications to the web server, achieve this by running an already built [OCI image](/README.md#oci-image) as it bundles and exposes the endpoints of the TweetyProject web server.

```sh
docker run -p 8080:8080 ghcr.io/aig-hagen/AgonProject:latest
```

Else you have to build and run the [TweetyProject](https://github.com/TweetyProjectTeam/TweetyProject) from source.
You can check out their [Developer Guide](https://tweetyproject.org/doc/dev-guide.html) and our [Dockerfile](/Dockerfile) on how to achieve this. For example, you can achieve this by running the following commands inside the TweetyProject: 

```sh
mvn install -Dgpg.skip=true
mvn spring-boot:run -pl org-tweetyproject-web
```

### Running the Graph Generation Server

Only needed if you're working on the random framework generation feature ([`GenerateView.vue`](/src/app/generate/GenerateView.vue)) — other development doesn't require it.

During development, this server is expected to run locally on port 8000, per the `/graph-gen` entry in the [Vite config](/vite.config.ts) `server.proxy` option.

```sh
cd servers/graph-gen
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --port 8000
```

### Running the Share Server

Only needed if you're working on the sharing feature — other development doesn't require it.

During development, this server is expected to run locally on port 8001, per the `/shares` entry in the [Vite config](/vite.config.ts) `server.proxy` option, which is also the default in `servers/share/.env.example`.

```sh
cd servers/share
npm install
cp .env.example .env
npm run dev
```

## Extending functionalities

This tool was built with the mind of being [extended](./extending.md) in the future.

## Example Requests

You can open the [example requests](./requests/) in [Bruno](https://www.usebruno.com/) to try out requests to the server without interacting with the frontend.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)