# Development Documentation

## Quick Start

### Cloning

When cloning, also clone the used Git Submodules

```sh
git clone --recurse-submodules https://github.com/aig-hagen/aig-causal-knowledge-base-editor.git
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

### Running TweetyProject Web Server

During development, the TweetyProject web server is expected to run locally on port 8080.
This is configured in the [Vite config](/vite.config.ts) through the [`server.proxy`](https://vite.dev/config/server-options#server-proxy) option.

If you do not need to make modifications to the web server, achieve this by running an already built [OCI image](/README.md#oci-image) as it bundles and exposes the endpoints of the TweetyProject web server.

```sh
docker run -p 8080:8080 ghcr.io/aig-hagen/argumentation-toolbox:latest
```

Else you have to build and run the [TweetyProject](https://github.com/TweetyProjectTeam/TweetyProject) from source.
You can check out their [Developer Guide](https://tweetyproject.org/doc/dev-guide.html) and our [Dockerfile](/Dockerfile) on how to achieve this. For example, you can achieve this by running the following commands inside the TweetyProject: 

```sh
mvn install -Dgpg.skip=true
mvn spring-boot:run -pl org-tweetyproject-web
```

## Extending functionalities


This tool was built with the mind of being [extended](./extending.md) in the future.

## Example Requests

You can open the [example requests](./requests/) in [Bruno](https://www.usebruno.com/) to try out requests to the server without interacting with the frontend.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)