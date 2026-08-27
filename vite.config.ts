import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig, Plugin, PreviewServer, ViteDevServer } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import vueDevTools from 'vite-plugin-vue-devtools'

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
    // The devtools overlay intercepts pointer events; disable it under e2e.
    ...(process.env.E2E ? [] : [vueDevTools()]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/dung': 'http://localhost:8080/',
      '/setaf': 'http://localhost:8080/',
      '/bipolar': 'http://localhost:8080/',
      '/rankings': 'http://localhost:8080/',
      '/serialisation': 'http://localhost:8080/',
      '/paf': 'http://localhost:8080/',
      '/adf': 'http://localhost:8080/',
      '/iaf': 'http://localhost:8080/',
      '/graph-gen': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/graph-gen/, ''),
      },
      '/shares': 'http://localhost:8001',
    },
  },
})
