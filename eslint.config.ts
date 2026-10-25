import pluginVitest from '@vitest/eslint-plugin'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import skipFormatting from 'eslint-config-prettier/flat'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginPlaywright from 'eslint-plugin-playwright'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup
export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'third-party/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['src/**'],
    plugins: { 'no-relative-import-paths': noRelativeImportPaths },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          rootDir: 'src',
          prefix: '@',
        },
      ],
    },
  },
  {
    files: ['src/**/*.vue'],
    rules: {
      // User-facing text goes through vue-i18n (docs/contributing/localization.md)
      'vue/no-bare-strings-in-template': [
        'error',
        {
          // Symbols, key names, and names that stay untranslated by design
          allowlist: [
            '(', ')', ',', '.', '&', '+', '-', '=', '*', '/', '#', '%', '!', '?', ':', '[', ']',
            '{', '}', '<', '>', '•', '|', '@', '×', '→', '←', '↔', '∅', '≻', '▾', '⌘', '∧', '∨',
            '¬', '⊤', '⊥', '·', '–', '—', '▶', '✕', '.tex', 'Ctrl', 'Shift', 'AgonProject', 'argumentation', '404',
          ],
        },
      ],
      // Design-system guardrails (docs/contributing/design.md, Do's and Don'ts)
      'vue/no-restricted-class': [
        'error',
        '/(^|:)text-\\[\\d/',
        '/(^|:)rounded-(lg|md)$/',
        '/(^|:)shadow-.+\\/\\d+$/',
        '/(^|:)[a-z]+-\\[#/',
        '/(^|:)(text|bg|border|ring|fill|stroke|outline|divide|from|via|to)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|stone)-\\d+/',
      ],
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
)
