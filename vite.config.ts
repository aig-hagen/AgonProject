import { fileURLToPath, URL } from 'node:url'

import { defineConfig, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

const isStoryBook = process.env.STORYBOOK === 'true'
const plugins: PluginOption[] = [tailwindcss(), vue(), vueJsx()]
if (!isStoryBook) {
  plugins.push(vueDevTools())
}

// https://vite.dev/config/
export default defineConfig({
  plugins: plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
