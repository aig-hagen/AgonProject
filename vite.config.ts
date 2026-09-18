import { readFileSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig, Plugin, PreviewServer, ViteDevServer } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import vueDevTools from 'vite-plugin-vue-devtools'

// Canonical list of solver API paths. The prod reverse proxy in
// deployment/Caddyfile (@backend) must mirror these by hand — Caddy can't read
// this file — so keep the two in sync when adding an endpoint.
import backendRoutes from './config/backend-routes.json'

const solverTarget = 'http://localhost:8080/'
const solverProxy = Object.fromEntries(backendRoutes.solverPaths.map((p) => [p, solverTarget]))

// The solver endpoints are POST-only. Mirror the prod (Caddyfile) behaviour in
// dev/preview: a browser GET/HEAD to one of them gets the friendly notice page
// instead of the backend's raw error. Runs before the proxy so POST still flows.
function solverBrowseNoticePlugin(): Plugin {
  const notice = readFileSync(
    fileURLToPath(new URL('./public/api-endpoint.html', import.meta.url)),
    'utf8',
  )
  const solverPaths = new Set<string>(backendRoutes.solverPaths)
  const install = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req, res, next) => {
      const method = req.method?.toUpperCase()
      if (method !== 'GET' && method !== 'HEAD') return next()
      if (!solverPaths.has((req.url ?? '').split('?')[0]!)) return next()
      res.statusCode = 405
      res.setHeader('Allow', 'POST')
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(method === 'HEAD' ? undefined : notice)
    })
  }
  return {
    name: 'solver-browse-notice',
    configureServer: install,
    configurePreviewServer: install,
  }
}

// The API reference (Swagger UI) is served at the clean path /api in prod
// (deployment/Caddyfile @apidocs rewrites it to /api.html). Mirror that in
// dev/preview so the same /api link works; /api.html itself is a static file
// Vite already serves, but the extension-less /api would otherwise hit the SPA
// fallback and render the app's 404.
function apiDocsPlugin(): Plugin {
  const page = readFileSync(fileURLToPath(new URL('./public/api.html', import.meta.url)), 'utf8')
  const install = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req, res, next) => {
      const method = req.method?.toUpperCase()
      if (method !== 'GET' && method !== 'HEAD') return next()
      if ((req.url ?? '').split('?')[0] !== '/api') return next()
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(method === 'HEAD' ? undefined : page)
    })
  }
  return {
    name: 'api-docs',
    configureServer: install,
    configurePreviewServer: install,
  }
}

// Solves with vite compression when serving `*.sty.gz` files:
// See https://github.com/vitejs/vite/issues/12266#issuecomment-2131263039
function gzipFixPlugin(): Plugin {
  const fixHeader = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req, res, next) => {
      if (req.originalUrl?.endsWith('.gz')) {
        res.setHeader('Content-Encoding', 'invalid-value')
      }
      next()
    })
  }

  return {
    name: 'gzip-fix-plugin',
    configureServer: fixHeader,
    // vite dev and vite preview use different server, so we need to configure both.
    configurePreviewServer: fixHeader,
  }
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    vueJsx(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@drgrice1/tikzjax/dist/**',
          dest: '',
        },
        // Add custom TeX package to the ones provided by @drgrice1/tikzjax
        // See https://github.com/drgrice1/tikzjax#options
        {
          src: 'third-party/ctan.org/pkg/argumentation/1.7 2026-06-20/argumentation.sty.gz',
          dest: 'node_modules/@drgrice1/tikzjax/dist/tex_files/',
          rename: { stripBase: 5 },
        },
        // `pgfopts.sty.gz` is required by `argumentation.sty.gz`
        {
          src: 'third-party/ctan.org/pkg/pgfopts/2.1a/pgfopts.sty.gz',
          dest: 'node_modules/@drgrice1/tikzjax/dist/tex_files/',
          rename: { stripBase: 5 },
        },
        {
          // `wawoff2` needs to be loaded differently then other modules.
          // See https://github.com/opentypejs/opentype.js#loading-a-woffotfttf-font
          src: 'node_modules/wawoff2/build/decompress_binding.js',
          dest: '',
        },
      ],
    }),
    gzipFixPlugin(),
    solverBrowseNoticePlugin(),
    apiDocsPlugin(),
    // The devtools overlay intercepts pointer events (disabled under e2e) and shows
    // a floating icon (set NO_DEVTOOLS=1 for clean screenshots).
    ...(process.env.E2E || process.env.NO_DEVTOOLS ? [] : [vueDevTools()]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      ...solverProxy,
      '/graph-gen': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/graph-gen/, ''),
      },
      '/shares': 'http://localhost:8001',
      '/events': 'http://localhost:8001',
      '/stats': 'http://localhost:8001',
    },
  },
})
