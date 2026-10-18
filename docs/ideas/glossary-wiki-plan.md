# Glossary wiki & publications — plan

Grow the glossary from tooltip-sized definitions into a small wiki: translatable, indexable by
search engines, with computational complexity data. Also clean up the publication list. Hover
tooltips stay the core feature and keep showing the full formal definition. Longer content
(remarks, complexity, later intuition and examples) only shows on the glossary page.

This plan replaces the former `glossary-seo-plan.md` (its tiers are Phases 5 and 9 here).

## Decisions (settled)

- **One branch for everything:** `feat/glossary-wiki`.
- **Glossary text is Markdown, one folder per language**, one file per term
  (`glossary/en/<term>.md`). It sits next to the module, not in `src/localization/`.
- **Language-neutral data stays in TS**: references and aliases in `glossary/meta.ts`, complexity
  in a central `complexity.ts` per formalism.
- **Tooltips show the full formal definition.** No length cap. Informal description and example
  come later as separate sections (Phase 10).
- **Publications get structured fields** in TS, rendered by one formatter in an LNCS-like style.
  Changing the style later means editing that one function.
- **PDFs go in a gitignored `literature/` folder**, one file per publication key.
- **One literature pass** covers both the metadata cleanup and the complexity sources.
- **Complexity, first pass: AF and ADF.** Problems: Ver, Cred, Skept, Exist, NE, plus counting and
  enumeration.
- **German:** infrastructure only. No German glossary text is written or merged without Lars's
  approval.

## Open issues (revisit later)

- **Derived complexity cells awaiting Lars's check** (details in
  `literature/notes/complexity.md`; only ticked ones go into `complexity.ts`):
  - AF: EA cred, EA skept, EA enum, ID enum (check DVW11 Table 2 visually), GR enum
  - AF count-dec: ADM, PR, SST (NP-hard), CF/NA/CF2 (in P, unary m)
  - ADF: S2V ne (Σ₂ᴾ-complete)
- **Missing paper:** Baroni, Dunne & Giacomin, "On extension counting problems in argumentation
  frameworks", COMMA 2010 (DOI 10.3233/978-1-60750-619-5-63). Needed to verify ST/PR counting
  ("#P-complete" in its abstract). Until then PR count shows "in #·coNP, exact class open".
- ~~**PSPACE reference.**~~ Done: every class entry now cites its defining source (Papadimitriou
  1994 for the basic classes, via a new `book` kind), with original papers under "Further reading".
  D₂ᴾ cites Chang & Kadin 1996, the earliest verified source for the Boolean hierarchy over Σ₂ᴾ.
  Cai et al. 1988 may predate it (unchecked, paywalled).
- ~~**ADF citation recheck.**~~ Done: cite the earliest paper that proves a result. Several
  ver/exist cells now cite BESWW13 (the MOD3 row was dropped), exist cells cite primary sources instead of DD18,
  SW15 locators use the published version, and bipolar GR/CO skept are P-c (DD18). Policy and
  reasons in `literature/notes/complexity.md`.
- **Search Console:** submit `/sitemap.xml` after the next deploy.
- **AIJ serialisability paper:** how to cite it (published / accepted / preprint) decides whether
  the bipolar ADF initial-model results (Thm. 6.1) go into the ADF table.

## Current state

```text
modules/<type>/glossary.ts       TooltipRegistry: key → { label, title?, content[], reference? }
                                 content = KaTeX strings | { ref, label? }
common/tooltip/publications.ts   50 consts, venue = one free-text string
/glossary?module=AF&term=…       single client-rendered route, sitemap lists only "/"
```

- About 148 entries across 7 modules, English only.
- `venue` has drifted (`'IJCAI 2013'`, `'KR 2010'` next to full proceedings titles). Many entries
  lack pages, and page ranges mix `-` and `–`.
- `CL05` and `CL05b` both render as "Cayrol & Lagasquie-Schiex (2005)".
- The keys `CO`, `PR` and `SER` exist in more than one module. The glossary page resolves refs as
  "first module wins".
- `credulousAcceptance` / `skepticalAcceptance` (AF) define the _notions_. There are no entries for
  the _decision problems_ yet.

## Target architecture

```text
src/modules/common/publications/
  types.ts  publications.ts  format.ts
src/modules/common/glossary/
  types.ts         GlossaryEntry, GlossaryMeta
  parse.ts         Markdown subset → { label, title, short: ContentPart[], body: Block[] }
  load.ts          import.meta.glob per locale (en eager, others lazy, fall back to en)
src/modules/common/complexity/
  types.ts         ComplexityCell, Problem
  glossary/en/*.md shared entries: problems (Cred, Skept, …) and classes (NP, Σ₂ᴾ, #P, …)
  ComplexityTable.vue
src/modules/<type>/
  glossary/meta.ts language-neutral: reference, aliases, related (keyed by term)
  glossary/en/<term>.md
  glossary/de/<term>.md    only with approval
  complexity.ts    (AF, ADF) one table: semantics × problem → cell
literature/        gitignored
```

```text
glossary/<locale>/<term>.md ─┐
glossary/meta.ts ────────────┼─ load.ts ─→ TooltipRegistry ─→ TermTooltip (short only)
complexity.ts ───────────────┘                            └─→ glossary term page (short + body
        │                                                       + its complexity row)
        └──────────────────────────────────────────────────→ complexity overview page (full table)
```

### Why per-language folders

- One `import.meta.glob('./glossary/de/*.md')` per locale, so lazy-loading German is trivial.
- What's translated is a plain directory comparison (`en/` vs `de/`).
- Translators work in one folder and never see TS.
- Per-term folders would only help for per-term assets (images), and we don't have any.

### Why central complexity tables

Complexity is a fact about `(formalism, semantics, problem)`, not about the text of one entry. The
literature also reports it as tables, one per formalism.

- **One source of truth** per formalism (`complexity.ts`). Nothing is duplicated.
- **Two views of the same data:** a term page looks up its row, and the overview page renders the
  whole table.
- **Easy to review against the source:** one file, laid out like the handbook tables.
- Rows are keyed by the namespaced glossary id (`AF/PR`), so a test can check that every row has a
  matching entry.

```ts
// modules/abstract-argumentation/complexity.ts
export const afComplexity: ComplexityTable = {
  'AF/PR': {
    cred: { class: 'NP-c', source: 'DD18', locator: 'Table 1' },
    skept: { class: 'Π2P-c', source: 'DD18', locator: 'Table 1' },
    count: { class: 'open' },
  },
}
```

`class` is the id of a glossary entry (`NP-c` → the NP entry with a "complete" marker). Adding a
new class (e.g. an enumeration class like DelayP) means adding one glossary entry, not changing a
type union.

### Markdown format

```markdown
---
label: admissible
title: Admissible Set
---

A set $S$ is admissible if it is [[CF|conflict-free]] and [[defends]] all its members.

## Remarks

Introduced by [@D95]. Every [[CO|complete]] extension is admissible …
```

- **Before the first `##`:** the formal definition. Tooltips show this part.
- **After it:** the wiki body, shown only on the glossary page.
- `[[key|label]]` is a wiki link (replaces `{ ref, label }`). `[[ADF/PR]]` links across modules;
  a bare key resolves in the current module first.
- `[@KEY]` is an inline citation. `$…$` / `$$…$$` are KaTeX, as today.
- **Small in-house parser** (paragraphs, headings, lists, bold/italic, math, links, citations).
  Switch to `markdown-it` if the subset grows.

## Phases

All on `feat/glossary-wiki`. Each phase ends in a working state.

### Phase 1 — Publication schema

- [x] Define a `Publication` union by kind and move it to `common/publications/`:

  ```ts
  type Publication =
    | { kind: 'article'; journal; volume; number?; pages?; articleNo? }
    | { kind: 'inproceedings'; booktitle; acronym; series?; seriesVolume?; pages?; publisher? }
    | { kind: 'chapter'; booktitle; editors?; volume?; chapter?; pages?; publisher }
    | { kind: 'thesis'; school; degree }
  // all: key, authors, year, title, doi?, url?
  ```

- [x] Derive `shortLabel` (`A`, `A & B`, `A et al.`, plus `a`/`b` on clashes) and `href` (DOI
      first, then `url`).
- [x] `formatCitation` in the LNCS-like scheme below.
- [x] Port the 50 entries to the new shape, still with their current data.
- [x] Tests: required fields per kind, en-dash page ranges, DOI format, unique keys and short
      labels.
- [x] Update the callers (`TermDefinitionBlock`, `PublicationCitation`, `PublicationsTooltip`, the
      `moduleConfig.ts` files).

```text
article        Dung, P.M. (1995). Title. Artificial Intelligence, 77(2), pp. 321–357.
inproceedings  … In: Proceedings of the 34th International Joint Conference on Artificial
               Intelligence (IJCAI 2025), pp. 4365–4373. ijcai.org.
               … In: Computational Models of Argument – Proceedings of COMMA 2022, FAIA 353,
               pp. 80–91. IOS Press.
chapter        … In: Baroni, P. et al. (eds.), Handbook of Formal Argumentation, Vol. 1,
               Chapter 4, pp. …. College Publications.
thesis         … PhD Thesis, Université d'Artois.
```

Rules: the official proceedings title plus `(ACRONYM YEAR)` unless the title already contains it;
series and volume when there is one (LNCS, FAIA, CEUR); en-dashes in page ranges; no trailing
period inside fields.

### Phase 2 — Literature pass (metadata + complexity sources)

**Inputs, in order of trust:**

1. DOI metadata from Crossref/DBLP (APIs, scripted).
2. BibTeX in `~/Downloads/*.bib` (≈207 entries, mostly from DBLP): `references.bib`,
   `handbook.bib`, `mypapers.bib`, `motivation.bib`.
3. Existing `href`s in `publications.ts`.

**Steps:**

- [x] Add `literature/` to `.gitignore`. Layout: `literature/<KEY>.pdf`, `literature/notes/`, and
      a generated `literature/references.bib`.
- [x] `scripts/literature.mjs`:
  - `lit:status` lists keys without a PDF and PDFs without a key.
  - `lit:bib` generates `references.bib` from `publications.ts`.
  - `lit:import` **copies** (never moves) matching PDFs from `~/Downloads`. A PDF only matches
    by DOI or exact title found in its first page (`pdftotext`). Everything else in Downloads is
    ignored, since it has plenty of unrelated files.
- [x] Fill in metadata for all 50 entries from the inputs above. If sources disagree, flag it for
      review instead of picking one. (DD17 → DD18: cited as the handbook chapter, like the other
      handbook entries. D95 pages: Crossref 321–357 over bib 321–358.)
- [x] **Complexity search** (AF + ADF, see Phase 6 for the problems). For each cell: the class, the
      source, a theorem/table locator, and a short quote. Notes go in
      `literature/notes/complexity-<topic>.md`. Unknown means `open`, never a guess.
- [ ] (Moved to Phase 6: only sources a table cell cites.) New sources found here become `Publication` entries. Their PDFs go into `literature/` when
      openly available (arXiv, author pages, CEUR, open-access proceedings). Paywalled ones go on
      a list for Lars to fetch through university access.

Candidate sources to check (all need verification):

- AF classical semantics: Dvořák & Dunne 2018 handbook chapter (DD18); stage semantics, Dvořák &
  Gaggl 2016 (DG16).
- AF newer semantics: weak admissibility (Dvořák, Ulbricht & Woltran); serialisable and
  unchallenged semantics (Thimm; Bengel & Thimm).
- AF counting: Baroni, Dunne & Giacomin (COMMA 2010). Enumeration: Kröll, Pichler & Woltran
  (IJCAI 2017).
- ADF: Strass & Wallner 2015 (SW15), Brewka et al. 2013 (BESWW13), Keshavarzi Zafarghandi et al.
  2021/22 for the newer semantics, and results for bipolar ADFs.

**Subagents.** This fans out well:

| Job                                               | Model  | Why                                                                            |
| ------------------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| Metadata fill (Crossref/DBLP/bib lookup, diffing) | Haiku  | Mechanical; mostly a script, with an agent for the leftovers.                  |
| Complexity search, one agent per topic (≈4)       | Sonnet | Reads papers, extracts results with locators. Good quality per cost.           |
| Verification of every complexity cell             | Opus   | Separate pass against the PDF/quote; catches wrong classes or theorem numbers. |
| Synthesis into `complexity.ts`                    | main   | Merging, resolving conflicts, flagging unclear cells for Lars to spot-check.   |

Topics for the search agents: (1) AF classical, (2) AF newer semantics, (3) AF counting +
enumeration, (4) ADF. Every agent must return a quote and a locator per result. A result with no
quote doesn't count.

### Phase 3 — Move glossary content to Markdown (no visible change)

- [x] `common/glossary/` with `types.ts`, `parse.ts`, `load.ts`. Extend `TooltipDefinition` with
      `body?` and `meta?`.
- [x] One-shot conversion script (scratchpad, not committed): `glossary.ts` →
      `glossary/en/<term>.md` + `glossary/meta.ts`.
- [x] ~~Namespace ids (`AF/PR`, `ADF/PR`).~~ Not needed: the only clashes were AF extension vs
      ranking keys (`CO`, `PR`, `SER`), now `rankingCO`/`rankingPR`/`rankingSER`. A test keeps keys
      unique across modules.
- [x] Switch all `provide(TOOLTIP_REGISTRY_KEY, …)` sites to the loader (same export names, so
      only the ranking window changed).
- [x] Tests (`[@KEY]` deferred to Phase 4, with citations): parser units; every `[[ref]]` and `[@KEY]` resolves; `meta.ts` keys match the files;
      a sample of entries renders the same as before the migration.
- [x] Update `extending.md` (module shape: `glossary.ts` → `glossary/`) and `structure.md`.

### Phase 4 — Wiki pages

- [x] Glossary page renders `body` under the definition (desktop: right panel; mobile: expanded
      card).
- [x] Tooltips get a small "More →" link when an entry has a body.
- [x] Backlinks ("Referenced by"), computed from `[[refs]]`.

### Phase 5 — Real URLs + sitemap (was SEO Tier 1)

- [x] Routes `/glossary/:module/:term` (keys as-is, e.g. `/glossary/AF/ADM`). `?module=&term=` and
      `?term=` redirect. Per-term `document.title`; mobile scrolls to and opens the term.
- [x] Build step (`sitemapPlugin` in `vite.config.ts`) generates `sitemap.xml` from the glossary
      Markdown files (one `<url>` per term). Complexity pages get added in Phase 6.
- [ ] Submit the new sitemap in Google Search Console (Lars, after deploying).

### Phase 6 — Complexity

- [x] `common/complexity/`: types, plus shared glossary entries for
  - **problems:** `Ver_σ` (is $S$ a σ-extension?), `Cred_σ`, `Skept_σ`, `Exist_σ` (does a
    σ-extension exist?), `NE_σ` (non-empty existence: does a _non-empty_ σ-extension exist?),
    `Count_σ` (how many σ-extensions?), `Enum_σ` (list them all);
  - **classes:** P, L, NP, coNP, DP, Σ₂ᴾ, Π₂ᴾ, …, #P, and the enumeration classes the literature
    uses.
- [x] The problem entries are formalism-generic and link to the existing AF notion entries
      (`credulousAcceptance` → `Cred_σ`, and back). The notion entries stay, since the
      evaluation windows use them as tooltips.
- [x] `complexity.ts` for AF and ADF, filled from the verified Phase 2 notes only.
      Verified notes: `literature/notes/complexity.md`. Settled: derived cells are shown with a "derived"
      marker and a one-line reason, and only after Lars has checked each one
      (`literature/notes/complexity.md`). Caveated classes are shown with their caveat (ID: "in
      Θ₂ᴾ, hard under randomised reductions"; PR count: "in #·coNP, exact class open").
- [x] `ComplexityTable.vue`: one row on each semantics page, the full table on an overview page per
      formalism (glossary entries `complexityAF` / `complexityADF` in a new Complexity tab). Every
      cell links its source.
- [x] Tests: every row maps to a glossary entry, every `class` to a class entry, every `source` to
      a publication.
- [x] New sources as `Publication` entries (DVW11, KPW17, DW20, DUW22, KDVV22, FHM24, KW24, SW26).
- [ ] Bipolar ADF initial models (AIJ Thm. 6.1), once the citation for the AIJ paper is settled.
- [ ] Optional: serialisation-sequence verification (`VerS`, AIJ Thm. 6.2) as a separate problem.
- [ ] Show counting and enumeration again. The results stay in `complexity.ts` (hidden via
      `SHOWN_PROBLEMS`); their problem and class glossary entries (#·P, #·coNP, DelayP, OutputP)
      were removed for now and need to come back, cited after FHM24 (p. 809) and KPW17 (p. 1147).

### Phase 7 — Literature page & publication tags

Settled: a Literature tab in the glossary (`/glossary/Literature`), no route of its own and no
per-publication routes (anchors only); tags hand-picked; abstracts for
search only, never displayed.

- [x] Uncited check: only BDKM16. Kept, cited as further reading on `rankingSemantics`.
- [x] `tags` on `Publication`, hand-picked from a fixed list in `tags.ts` that a test checks:
  - **formalism:** AF, ADF, BAF, SETAF, PAF, IAF, ABA
  - **topic:** semantics, ranking, complexity, algorithms, principles, survey, handbook (Handbook
    of Formal Argumentation chapters), foundations (general complexity theory)
- [x] `lit:abstracts` in `scripts/literature.mjs`: Crossref/OpenAlex (31), else the PDF's first
      page (18; 6 fixed by hand), else none (19). Writes `abstracts.json`, loaded only by the literature page.
- [x] Search: every query word must match a field (title, authors, venue, year, key, abstract),
      accent-insensitive; ranked by field weight. Tags filter via chips.
- [x] Literature tab in the glossary (after Complexity): every publication with its citation and link.
- [x] "Cited in" per publication, computed from glossary `meta.ts`, `[@KEY]` citations, complexity
      cells and module cards, linking back to the glossary.
- [x] Add the tab (`/glossary/Literature`) to the Phase 5 sitemap.

### Phase 8 — Localization infrastructure

- [ ] `load.ts` picks `glossary/<locale>/<term>.md`, falls back to `en/`.
- [ ] Quiet "English only" badge on fallback entries.
- [ ] Parity test: a `de/` file needs the same `[[refs]]` and `[@cites]` as its `en/` twin.
- [ ] Update `docs/contributing/localization.md`.
- No German content in this plan. It needs Lars's approval and is tracked separately.

### Phase 9 — Prerendering (was SEO Tiers 2–3)

- [ ] A build script writes static HTML per term (`dist/glossary/<module>/<term>/index.html`),
      using `parse.ts` + `katex.renderToString`. The SPA bundle still loads and takes over. No
      headless browser needed, unlike `vite-plugin-prerender`.
- [ ] Per-term `<title>`, `<meta description>` (plain text of the definition), `<link
rel="canonical">`.
- [ ] JSON-LD `DefinedTerm` per term.
- [ ] `hreflang` only once German entries exist.

### Phase 10 — More entry content (future)

Each entry should eventually have three standard parts: formal definition (the tooltip),
**informal description** (`## Intuition`), and an **example** (`## Example`, with an "Open in
editor" button). Further optional data, one at a time:

| Idea                                                                            | Effort |
| ------------------------------------------------------------------------------- | ------ |
| Aliases & notation (`σ_pr`, abbreviations). Also helps search.                  | S      |
| Guarantees: always exists? always unique? can be empty?                         | S      |
| Relations between semantics, as a small lattice. Central data, like complexity. | M      |
| Principles a semantics satisfies (admissibility, I-maximality, …). Central.     | M      |
| Origin / history.                                                               | S      |
| In AgonProject: where it shows up, which backend computes it.                   | S      |
