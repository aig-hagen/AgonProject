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

- [ ] Map every grid source string to a publication key (34 strings → ~29 keys; e.g.
      `Baumann Brewka Ulbricht 2022` → `BBU22`, `Friese Ulbricht 2021` → `FU21`,
      `T23 / Blümel & Thimm 2024` → pick one).
- [ ] Add the ~19 missing papers to `publications.ts` (TV17, BG07, BBU20a, BBU22, BBCGTV14,
      BCG11, BLW16, BlT24, BT26, BU22, CCD12, CD19, CDM05, CT23, DDLW15, DT25, FU21, GW13, XC16)
      with data checked via `literature/notes/principles-work/verify_refs.py` (Crossref / publisher
      page; no unverified fields). Tags as in the existing entries.
- [ ] Mirror them in `literature/references.bib`; file the PDFs we have from `literature/incoming/`
      under their keys.
- [ ] BT26: cite as preprint (Lars). Only confluence (7 cells, incl. SAD) and UC language
      independence rely on it.

### Phase 2 — Data

- [ ] `src/modules/common/principles/types.ts`: `PrincipleCell` (`holds: boolean`, `source?`,
      `locator?`, `remark?`, `via?`, `noReference?`), `PrincipleTable` (overview key, semantics
      groups, rows), helpers like `holds()` / `fails()` in the style of `complete()` / `member()`.
- [ ] `src/modules/abstract-argumentation/principles.ts`: generated once from the grid JSON by a
      script under `principles-work/` (source strings → publication imports), then maintained by
      hand like `complexity.ts`. Header comment points to `literature/notes/principles.md`.
- [ ] Unit test: every row key is a semantics in `KNOWN_SEMANTIC_GROUPS`, every principle key has
      a glossary entry, every non-open cell without `noReference` has a source.

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
