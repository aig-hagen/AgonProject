# Glossary SEO — implementation plan

Make glossary definitions findable via Google (and AI answer engines). Today they are
effectively invisible to search: the glossary is one **CSR** (client-side rendered) route,
terms are query params, and `sitemap.xml` lists only the homepage.

## Problem

```
/glossary?module=AF&term=admissible-set    ← a term is a query param, not a page
```

- Served HTML is an empty shell; definitions live in the JS bundle and are rendered at runtime.
- One route (`/glossary`) for the whole glossary; terms differ only by `?term=` — Google largely
  folds these into a single page.
- `public/sitemap.xml` points crawlers only at `/`. Nothing advertises the glossary.
- Definitions are KaTeX (LaTeX rendered by JS) — little plain text for engines to index.

Net effect: Google _can_ render JS but does it slowly and dislikes query-param-only content;
Bing does it worse; LLM crawlers mostly don't run JS at all. So the definitions don't rank.

## Data model (for reference)

`glossaryModules` in [`useGlossary.ts`](../../src/app/glossary/useGlossary.ts) — array of
`{ prefix, label, glossary, mainKey }`. Each `glossary` is a `TooltipRegistry`: `termKey →
{ label, title, content[], reference }`. This is already build-time data, so a script can walk
it to emit URLs and prerendered HTML.

## Tier 1 — cheap, do first (an afternoon)

Unlocks Google's JS-rendering path. Two changes:

1. **Real paths instead of query params.** Add a route
   `/glossary/:module/:term` alongside the current one; read params in
   [`GlossaryView.vue`](../../src/app/glossary/GlossaryView.vue) instead of `route.query`.
   Keep `?module=&term=` working with a redirect so existing links don't break.
   - Slugify term keys once (`admissibleSet → admissible-set`) in a shared helper.
2. **Generate the sitemap from glossary data.** A build script walks `glossaryModules` and
   writes one `<url>` per term into `public/sitemap.xml` (or a generated copy). Wire it into
   `build` so it can't drift from the glossary.

## Tier 2 — the real fix (a few days): prerendering

Puts definition text in the served HTML _before_ JS runs, so every engine (LLM crawlers
included) can index it. Still a static site — no backend.

- Add `vite-plugin-prerender` (or `vite-ssg`) over the glossary routes at `vite build`.
- Render KaTeX to static HTML at build time (`katex.renderToString`) so math is real markup;
  also emit a plain-text fallback of each definition for engines that don't parse math.
- Per-term `<title>`, `<meta description>`, and `<link rel="canonical">` injected per page.

## Tier 3 — polish (low effort)

- **JSON-LD** `DefinedTermSet` / `DefinedTerm` structured data per term so Google and AI engines
  recognise these as definitions (better rich results).

## Effort vs. payoff

```
Tier 1  ▓▓░░░░░░  low     unlocks Google's JS path, sitemap discovery
Tier 2  ▓▓▓▓▓░░░  medium  unlocks EVERYONE reliably   ← the one that matters
Tier 3  ▓░░░░░░░  low     richer results, definition semantics
```

## Notes / open questions

- **i18n:** glossary has `en` + `de`. Decide whether to prerender both and add `hreflang` tags,
  or index English only for v1.
- Google Search Console is already verified (`public/google4ed3c2e6a8565d08.html`) — submit the
  new sitemap there once Tier 1 lands to confirm indexing.
- Deployment is static hosting, so all of this is build-time only; nothing new to run in prod.
