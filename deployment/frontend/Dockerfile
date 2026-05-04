# Adapts https://docs.docker.com/guides/vuejs/containerize/#step-2-configure-the-dockerfile

# build
FROM node:24-alpine AS build
WORKDIR /build
COPY package.json package-lock.json* ./
COPY third-party/aig-hagen/aig_graph_component/*.tgz ./third-party/aig-hagen/aig_graph_component/
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

# runtime
FROM --platform=linux/amd64 caddy:2-alpine
COPY /deployment/frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /build/dist /srv