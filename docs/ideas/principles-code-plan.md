# Principles in the app — code plan

Bring the principles grid (`literature/notes/principles-grid.json`, built under
[`principles-plan.md`](principles-plan.md)) into the glossary: one entry per principle, a
principles table on each AF semantics entry, and an overview of the whole grid. Mirrors the
complexity feature (`common/complexity/`, `abstract-argumentation/complexity.ts`,
`app/glossary/Complexity*.vue`). AF only.

## Decisions (settled)

- **Shown:** ✓ / ✗ per cell with source + locator. Open cells show as "open", not examined ones stay
  empty.
- **Via cells** show as normal results; `viaText` is kept in the data (data-only, like
  `ComplexityCell.comment`).
- **No-reference cells** (`noReference`, 21) show the result without a citation.
- **`remark`** is user-facing (single-status abstention, IS directionality, weak SCC-recursiveness).
- **Notes** (`notes`, `corroboration`, verifier output) stay out of the app.
- **All 59 principles** get a glossary entry (Lars: keep all new ones).
- **Literature rule:** a paper enters `publications.ts`, `references.bib` and `literature/` only
  once the app cites it — this feature is what makes the principle papers cited.

## UI decisions (Lars)

- **Grouped principles** (admissibility, reinstatement, directionality, decomposability, adequacy,
  …) — grouping proposed in Phase 3, Lars confirms.
- **Adequacy variants** (∩ / W / S) stay separate rows.
- **One overview table** to start, with filters: the user picks which principles and which
  semantics are shown. Presentation gets refined later.
- **Cardinality** (0+ / 1 / 1+) is shown.

## Phases

### Phase 1 — Publications

- [x] 18 papers added to `publications.ts` (new "Principles" section): CDM05, BG07, BCG11, CCD12,
      GW13, BBCGTV14, DDLW15, BLW16, XC16, TV17, CD19, BBU20a, FU21, BBU22, BU22, CT23, BlT24, DT25.
      Data from Crossref (authors, venue, volume, pages, DOI), IOS Press pages (FAIA volume/pages),
      CEUR-WS (XC16), the TU Dresden ICCL page (FU21) and the PDF itself (TV17 vol./no.; no
      verified pages, so none given).
- [x] `npm run lit:bib`; PDFs filed with `lit:import` (fixed three wrong matches by hand: P94,
      XC18, C14). Local PDFs now for BG07, TV17, BBU22, CD19, CDM05, XC16, DT25 (manuscript),
      BLW16 (arXiv), FU21.
- [x] BT26 as a preprint: new `preprint` kind (types, `format.ts`, `lit:bib` → `@misc`), entry from
      the Zenodo record (doi:10.5281/zenodo.19048256, dated 2026), PDF filed. Grid
      locators for BT26 cite numbered results only (Zenodo pages differ from the AIJ draft).
- [ ] `citedIn.test.ts` ("every publication is cited somewhere") fails until Phase 2 wires the
      principle cells into `citedIn()` (as complexity cells are).

### Phase 2 — Data

- [x] `src/modules/common/principles/types.ts`: `PrincipleCell` (`holds?`, `source?`, `locator?`,
      `remark?`, `via?`, `unreferenced?`), `PrincipleTable` (semantics groups, principle groups,
      cardinality, rows) and helpers `holds()` / `fails()` / `unreferenced()` / `open()`.
- [x] `src/modules/abstract-argumentation/principles.ts` generated once by
      `principles-work/gen_principles_ts.py` (source strings → publication keys; adequacy keys
      renamed `…Cap/W/S`); maintained by hand from now on. Seven principle groups (draft, Lars
      confirms): conflict & defence, reinstatement, extension sets, independence, decomposition,
      reduct, adequacy.
- [x] Cardinality for all 23 semantics: TV17 Table 4 (EA from C07 Thm. 3), the rest from their
      origin papers; CF and ADM unreferenced (∅ is always an extension).
- [x] `app/glossary/principles.ts` (`principleTables`, `principleRowFor`, `principleTableFor`);
      `citedIn()` counts principle and cardinality sources.
- [x] `principles.test.ts`: rows and cardinality match the semantics groups, every principle in
      exactly one group, sources known / absent as required.

### Phase 3 — Glossary entries

- [ ] `src/modules/common/principles/glossary/en/<key>.md` per principle (label, title, informal
      idea, formal definition in Agon notation from `principles.md`), `meta.ts` with the defining
      paper as `reference`. Reuse/link existing entries where they exist (`sccRecursive`,
      `reduct`, `scc`).
- [ ] Register the glossary module: `glossaryModules.json` entry (`dir: common/principles`,
      `mainKey: principlesAF`) and the map in `useGlossary.ts`, as for `common/complexity`.
- [ ] Overview entry (`principlesAF`) and an entry explaining "principle" itself.

### Phase 4 — UI

- [ ] `app/glossary/principles.ts`: `principleRowFor(termKey)`, `principleTableFor(overviewKey)`
      (as `complexity.ts`).
- [ ] `PrinciplesResults.vue` on semantics entries: cardinality, then ✓ / ✗ per principle group,
      citation on hover/click, link to the overview.
- [ ] `PrinciplesOverview.vue`: one table (semantics × principles, grouped), with selectors for
      which principles and which semantics to show; `PrincipleCellView.vue`.
- [ ] Principle entries list which semantics satisfy / violate them (reverse view of the same data).
- [ ] Mobile: `GlossaryCardMobile.vue` handling as for complexity.
- [ ] i18n strings (`glossary.principles.*`).

### Phase 5 — Wrap-up

- [ ] `npm run lint`, `format`, `format:check`, `docs:check`; tests.
- [ ] CHANGELOG entry (Added: principles in the glossary).
- [ ] TODO.md #33: tick "principles satisfied".
