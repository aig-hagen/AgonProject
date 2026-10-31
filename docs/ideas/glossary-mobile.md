# Mobile glossary rework

The compact (mobile) glossary moves from one long list of cards to the same page-per-entry model
as desktop, as a drill-down: index → module → entry. Mobile only: desktop keeps its tabs and
two-panel layout. Tracked as #42 in [`TODO.md`](TODO.md).

## Why

- On mobile, `/glossary/AF/ST` renders every card, so Google (mobile-first) indexes nearly the
  same page for every entry. `data-nosnippet` on the other cards is only a stopgap.
- Expanding a card doesn't change the URL, so sharing or bookmarking misses the entry being read.
- Long entries (complexity and principle tables, backlinks) are cramped inside a card.
- The module pills hide most of the 10 tabs off-screen and use bare prefixes as labels.

## Settled decisions

From the prototype review:

- **Three levels:** `/glossary` (index) → `/glossary/AF` (module list) → `/glossary/AF/ST`
  (entry page). Routes are unchanged; only the compact view changes. Desktop keeps redirecting
  `/glossary` and `/glossary/<module>` to a term.
- **No pills.** The index lists the modules, grouped as Frameworks (AF … ABA), Topics
  (Complexity, Principles) and References (Literature). Rows show the localized module name
  (`nameKey`) with the prefix beside it.
- **Search across all modules** on the index. Module pages keep a search scoped to the module.
- **Complexity and Principles land on their overview** (`/glossary/Principles` redirects to
  `principlesAF`, as on desktop). The overview page is that module's home: overview table first,
  then "All entries" with a search and the entry list. Complexity shows the AF overview; ADF stays
  in the list under "Overviews".
- **List rows: title only**, Body type (14px), 44px rows, hairline dividers. The pinned main entry
  keeps the `primary/40` border with a `primary/5` fill.
- **Header title:** "Glossary" on the index, the module prefix on module and entry pages (the long
  names don't fit the header).
- **Header back (`‹`) returns to the previous page** (`router.back()`). Only without in-app
  history (a deep link) it goes up one level: entry → module → index → editor.
- **Tables:** first column and header row stay put (sticky); the table scrolls inside its own box
  capped at about 70% of the viewport height. Principle names wrap in a fixed 8rem column. Beyond
  that the tables don't need to look perfect on mobile.
- **No tooltips in tables.** Column headers (`CO`, `Ver`, …) link to their entry page; back
  returns to the table.
- **No user-facing "term".** Use "entry"/"entries", "Search the glossary…", "Search AF…",
  "N results", "No results".

## Phases

### 1. Navigation and pages

- [x] `GlossaryViewMobile.vue`: switch on route level: index, module list, or entry page.
      Entry pages reuse `GlossaryEntryDetails` (with the source section, as on desktop).
- [x] Index page component with grouped module rows and the global search over `allEntries`
      (useGlossary exports a cross-module match; keep the existing matching rules).
- [x] Overview homes for modules with an overview: a flag in `glossaryModules.json` (e.g.
      `"home": "overview"`) instead of hardcoding Complexity/Principles.
- [x] `PageHeader`: optional back target or handler (today it always links to `/`). Back logic:
      `router.back()` when `history.state.back` is an in-app glossary route, else push the parent.
- [x] Remember list scroll position and search per page across back navigation.
- [x] Remove `GlossaryCardMobile.vue`, the expand logic and the `data-nosnippet` stopgap.

### 2. Tables

- [x] Sticky first column and header row in `ComplexityOverview` and `PrinciplesOverview`
      (`thead th` sticky top, first cell sticky left, wrapper with its own scroll on compact).
- [x] Principles: wrap principle names in a fixed-width first column on compact.
- [x] Principles column headers: on compact, a plain `RouterLink` without `TermTooltip`
      (already the case); drop the `title` workaround if unused.
- [x] Complexity column headers link to their problem entry.

### 3. Copy and i18n

- [x] Replace "term" in en/de strings shown on mobile (`glossary.searchPlaceholder`,
      `glossary.selectTerm`, new index strings). Check desktop uses of the same keys.
- [x] New keys: index group labels, "All entries", result count, per-module search placeholder.

### 4. Design guide

- [x] Layout → header bar: on compact pages with levels (the glossary), back returns to the
      previous page, or goes up one level on a deep link. Other pages and desktop keep "back
      returns to the editor".
- [x] Same Bones Rule: the sanctioned compact difference becomes "page tabs become an index page"
      instead of pills; update Components → Tabs.
- [x] Note the sticky-table pattern (own scroll box, sticky first column and header row) under
      Components, if it gets reused.

### 5. Tests and follow-ups

- [x] Unit: index search, overview-home paths, entry module lookup.
- [x] E2E (mobile viewport): index → module → entry → back; deep link → back goes to the module
      list; Principles opens on the table; index search (`e2e/glossary.mobile.spec.ts`).
- [x] Sitemap: one hand-set `<lastmod>` (`GLOSSARY_UPDATED` in `vite.config.ts`) for all glossary
      URLs; set it to the release date. `/glossary` was already listed.
- [ ] After deploy: check search snippets again. If math still shows up three times ("E E E"),
      mark KaTeX's hidden MathML/annotation copies with `data-nosnippet`.

## Out of scope

- Desktop: no index page (it would look bare), tabs and two-panel layout stay, header back keeps
  going to the editor.
- Entry page content: already reads fine at phone width.
- Literature tab: reached from the index, otherwise unchanged.
