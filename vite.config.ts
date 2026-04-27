import { fileURLToPath, URL } from 'node:url'

import { defineConfig, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

const isStorybook = !!process.env.STORYBOOK
const plugins: PluginOption[] = [tailwindcss(), vue(), vueJsx()]
if (!isStorybook) {
  plugins.push(vueDevTools())
}

export default defineConfig({
  plugins: plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
