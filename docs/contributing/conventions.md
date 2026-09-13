# Coding conventions

This page records project-specific rules that are not obvious from the automated tooling. For the repository layout, see [Project structure](../architecture/structure.md). For extension points and module organization, see [Extending Agon](./extending.md).

## Automated checks

Before submitting a change, run `npm run lint`, `npm run format:check`, `npm run type-check`, and the relevant test suites. These tools enforce most routine conventions; do not duplicate their configuration here.

Files under `src/` with a `.ts`, `.vue`, or `.css` extension require the GPL-3.0 header managed by `npm run license-headers`. Let the command insert headers instead of copying them manually.

Within `src/`, import through the `@/*` alias instead of traversing with relative paths:

```ts
import { useSettings } from '@/modules/common/settings/useSettings'
```

## TypeScript and Vue

- Avoid `any`. Narrow untrusted `unknown` values before use.
- Use `@ts-expect-error` only for an intentional, localized exception and include the reason. Do not use `@ts-ignore`.
- Define runtime-validated data with a Zod schema and derive its TypeScript type with `z.infer` so the two cannot drift.
- Write Vue components with `<script setup lang="ts">`, typed `defineProps` and `defineEmits`, and `defineModel` for two-way bindings.
- Name component files in `PascalCase.vue`; use `camelCase` for TypeScript support files and composables.

## State and service boundaries

- Put reusable reactive behavior in `useXxx` composables. Wrap truly application-wide instances with `createSharedComposable`; use typed `provide`/`inject` for values scoped to a component subtree.
- Persist preferences with VueUse `useStorage` and an ownership-oriented `namespace:key` key.
- Change document models through `modifyDocument`, which uses Immer and records undo/redo patches. Do not mutate a document directly or deep-clone it to make an edit.
- Keep HTTP calls out of presentation components and place them in concern-specific adapters or composables. Use Vue Query when caching, deduplication, retries, or request lifecycle state is useful.
- Represent expected user-facing failures as typed results. Reserve thrown exceptions for unexpected failures, and surface suitable feedback through the shared notification system.

## Localization and stable identifiers

All user-facing text must be available in English and German through `vue-i18n`. English defines the message schema, and missing German keys fail type checking. Use an explicit global `useI18n` scope:

```ts
const { t } = useI18n({ useScope: 'global' })
```

Keep stable domain identifiers and machine-readable output locale-neutral. Translate labels in computed view models rather than when creating module-level objects. See [Localization](./localization.md) for the complete workflow.

## Styling and theming

- Prefer Tailwind and DaisyUI semantic utilities in templates.
- Use the tokens from `palette.ts` or their `--color-*` CSS variables for application colors. Do not introduce raw color values or Tailwind primitive color utilities in app code.
- Add global CSS to `src/style.css` only when utilities cannot express the behavior cleanly.
- Graph rendering, format-owned output, and the standalone maintenance page are documented exceptions to the palette rule; keep their fallback values aligned with the application theme where applicable.

## Testing

- Colocate Vitest files with their implementation as `*.test.ts`.
- Put Playwright tests in `e2e/` as `*.spec.ts` and prefer role- or accessibility-based locators over CSS selectors.
- Use `expect.soft` when independent assertions should all be reported in one run.

See [Testing](./testing.md) for prerequisites, commands, and CI coverage.
