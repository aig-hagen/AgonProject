# Deployment and Operations

AgonProject is published as a single OCI image. The image contains the static Vue application, TweetyProject, graph-gen, the share server, the argumentation MCP server, and Caddy. See the [architecture overview](../architecture/overview.md) before changing the topology.

## Run the image

For an evaluation without durable shares:

```sh
docker run --publish 8080:8080 ghcr.io/aig-hagen/AgonProject:latest
```

For a maintained deployment, use [`deployment/compose.yml`](/deployment/compose.yml) as a starting point. Adjust the published port and public origin for the target environment. Keep the named volume mounted at `/opt/share-server/data`; it contains both share and analytics databases.

## Configuration

| Variable                  | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| `FRONTEND_URL`            | Public origin used to construct share links           |
| `ALLOWED_ORIGIN`          | Browser origin allowed by the share service           |
| `STATS_TOKEN`             | Enables and protects the aggregated `/stats` endpoint |
| `MCP_STATIC_TOKEN`        | Optional shared bearer token for MCP                  |
| `MCP_OAUTH_ISSUER`        | Optional OIDC issuer for MCP authentication           |
| `MCP_OAUTH_AUDIENCE`      | Expected MCP token audience                           |
| `MCP_REQUIRED_SCOPES`     | Required OAuth scopes                                 |
| `MCP_RESOURCE_SERVER_URL` | Public MCP resource URL                               |
| `MCP_ALLOWED_HOSTS`       | Hosts accepted by the MCP server                      |

The deployed MCP endpoint is read-only, unauthenticated by default, and rate-limited by Caddy. Configure a static token or OIDC when public unauthenticated access is unsuitable. See the [MCP README](/servers/argumentation-mcp/README.md) for the full configuration model.

## Maintenance mode

From the deployment directory, [`maintenance.sh`](/deployment/maintenance.sh) toggles a flag that makes Caddy return the maintenance page with HTTP 503:

```sh
./maintenance.sh on
./maintenance.sh status
./maintenance.sh off
```

## Health and logs

The container health check requests Caddy on port 8080. The MCP server additionally exposes `/healthz` and `/readyz` internally, although those paths are not currently proxied by the production Caddy configuration. Container stdout contains Caddy and process logs.

The wrapper exits when any managed process exits. With Compose's `restart: unless-stopped`, that causes the complete unit to restart instead of leaving a partially available deployment.

## Analytics administration

See [Usage analytics](./analytics/README.md) for enabling `/stats`, reading the dashboard, rotating its token, data definitions, and privacy constraints.
