# Principle analysis — literature plan

Compile which **principles** (properties a semantics may satisfy, e.g. Directionality) hold for
each AF extension semantics, as reported in the literature. Feeds the "principles satisfied" item of
the glossary wiki in [`TODO.md`](TODO.md). Code integration is a separate, later plan.

## Ground rules (settled)

- **Literature only.** Every cell cites a published (or preprint) result. No new proofs. A cell
  with no source stays **open**. Exception (Lars): trivial or definitional results may be shown
  without a reference (`noReference`).
- **Scope:** the 23 AF extension semantics (CF, ADM, CO, GR, PR, ST, SAD, SST, ID, EA, IS, UC, NA,
  STG, STG2, CF2, SCF2, UD, SUD, WAD, WCO, WGR, WPR). No meta-reasoners (QLD, SQLD, VR, SER), no
  ranking semantics, no other modules.
- **Broad principle set.** Start from the catalogue below; agents add any further principle they
  come across (with origin and definition), even if no result for our semantics is attached.
- **Notation:** AgonProject's glossary notation wins; the AIJ paper (Bengel & Thimm 2026) is the
  orientation for anything the glossary doesn't cover yet.
- **Citation policy:** as for complexity — cite the earliest paper that _proves_ the result; later
  restatements (surveys, tables) go in as corroboration only.
- **`via` cells are kept:** a stated implication plus a stated membership, both cited, shown as
  "follows from X + Y". No solver checks.
- **Stage2 cites DG16** (not the 2012 TU Wien tech report) wherever DG16 carries the result.

## Sources

| Key    | Paper                                                                        | Status                 |
| ------ | ---------------------------------------------------------------------------- | ---------------------- |
| BT26   | Bengel & Thimm, _Serialisability in Formal Argumentation_, preprint (Zenodo) | `literature/`          |
| BG07   | Baroni & Giacomin, _On principle-based evaluation…_, AIJ 171 (2007)          | `literature/incoming/` |
| TV18   | van der Torre & Vesic, _The principle-based approach…_, IfCoLog (2017)       | `literature/incoming/` |
| BGG05  | Baroni, Giacomin, Guida, _SCC-recursiveness_, AIJ 168 (2005)                 | `literature/`          |
| DRT20  | Dauphin, Rienstra, van der Torre, principles for weak admissibility          | `literature/`          |
| others | per-semantics papers in `literature/` (see agent briefs)                     | `literature/`          |

Use the AIJ version (`Serialisability_in_Formal_Argumentation___AIJ.pdf`), not the older preprint.
Def. 2.6 and Table 1 (pp. 10–12) are the seed.

## Principle catalogue

Lives in `literature/notes/principles.md` (30 entries after Phase 0: BG07, TV18's Principles 1–23,
BT26's Modularisation, DRT20's four). New principles found by agents are appended there.

## Cell format

Each agent returns one JSON object per cell:

```json
{
  "semantics": "SST",
  "principle": "Directionality",
  "value": "violated",
  "source": "BG07",
  "locator": "Prop. 51, p. 694",
  "quote": "semi-stable semantics does not satisfy the directionality principle",
  "conditions": "finite AFs",
  "confidence": "high",
  "corroboration": ["TV18 Table 2"]
}
```

- `value`: `satisfied` | `violated` | `open`.
- `locator`: printed page plus numbered result; preprints cite numbered results only.
- `conditions`: any restriction the source makes (finite AFs, a variant definition, …). A result
  for a _variant_ of the principle is recorded with the variant named, not silently merged.
- Conflicting sources: record both, flag the cell.

## Phases

### Phase 0 — Groundwork (main session)

- [x] Lars places BG07 and TV18 in `literature/incoming/`; add both to `references.bib`
      (keys `BG07`, `TV18` — the local vdTV copy is the 2017 IfCoLog version).
- [x] Write `literature/notes/principles.md`: catalogue with origin, informal idea, formal
      definition in Agon notation, known implications between principles (e.g. Admissibility ⇒
      Reduct Admissibility).
- [x] Notation crib (BT26 → Agon): `US(F)`, `op_F(S)`, `D_F/P_F/U_F`, reduct `F^E`, `E^+`, `E^-`,
      strong defense `sd(a, E)`, isomorphism `F ≡_m F'`.
- [x] Seed the grid from BT26 Table 1 (7 semantics × 12 principles), with BT26's own sources
      as the citation where Table 1 names them.
- [x] Check the `?` origins in the catalogue.

### Phase 1 — Search pass (4 agents, parallel)

One agent per semantics family. Each gets: the catalogue, the notation crib, the cell format, the
list of local PDFs for its family, and the instruction to (a) fill every cell of its rows it can
source, (b) sweep papers citing the semantics' origin paper for later principle results, and (c)
report any principle not in the catalogue.

| Agent       | Semantics                                      | Start from                      |
| ----------- | ---------------------------------------------- | ------------------------------- |
| A classical | CF, ADM, CO, GR, PR, ST, SST, ID, NA, STG, CF2 | BG07, TV18, BGG05, D95, DMT07   |
| B adm-based | SAD, EA, IS, UC                                | C07, C14, T22, BT22, BT26       |
| C non-adm   | STG2, SCF2, UD, SUD                            | DG16, CT19, T23, BRU24          |
| D weak      | WAD, WCO, WGR, WPR                             | BBU20, DRT20, Baumann et al. 22 |

- [x] A classical
- [x] B admissibility-based
- [x] C non-admissible
- [x] D weak
- [x] Merge into one grid (876 cells: 381 ✓, 251 ✗, 239 open, 5 conflicts; 150 `via` cells).
- [x] Lars: keep `via` cells; keep all new principles for the final report; DG16 for stage2.
- Merged grid: scratchpad `merge/grid.json` + `grid.md`, built by `merge/merge.py`.

### Phase 2 — Gap pass (literature only)

- [x] Fetch list from Phase 1 agents; Lars fetched 9 papers (`literature/incoming/`: BBU22, BU26,
      C14 TR, CD19, OW11, CDM05, DRT+W22 COMMA, Doukas & Thimm 2025 manuscript, XC16 HAL copy).
- [x] Two reading agents (weak/modularity; SAD/succinctness/indirect CF) → 134 delta cells, merged.
      Grid now 914 cells: 418 ✓, 279 ✗, 213 open, 4 conflicts.
- [x] Cells still unsourced stay `open`.

### Phase 3 — Verify pass (fresh agents, never the one that found the cell)

- [x] **Reading check:** per family, re-read each cited locator via `pdftotext -layout` (rendered
      page where symbols drop out); confirm value, conditions, and that the principle definition
      matches ours.
- [x] Lars reviews flagged cells in `literature/notes/principles-decisions.md`.
- [x] FU21 (Friese & Ulbricht, NMR 2021) read in full: modularisation for SST/EA/ID/CF2, weak
      splitting, range compatibility, new principle ad-modularisation (`add_fu21.py`).
- [x] Review applied to the grid (`apply_decisions.py`): table-only cells resolved, 15 cells shown
      without reference, DT25 treated as published, rationality from BLW16, cycleHomogeneity
      dropped, user-facing `remark`s for abstention, IS directionality and weak SCC-recursiveness.
      Grid now 936 cells: 438 ✓, 275 ✗, 223 open.
- [x] Reference data verified against Crossref / publisher pages (`verify_refs.py`); fetch list in
      `literature/notes/principles-missing-papers.md`.
- [x] Remaining calls: via cells shown as normal results (via info kept in the data);
      `ADM|directionality` ✓ without reference; weak admissibility stays BBU22; CF2/STG2
      decomposability kept as DRT20 Table 1 (revisit later); CF2 rationality not added.
- [ ] Fetch the must-have papers (BBU20a, BBCGTV14, BCG11, DDLW15, published DT25) and recheck
      their cells' locators.

### Phase 4 — Wrap-up

- [x] Final grid and caveats in `literature/notes/principles.md` (conventions, variant definitions,
      conflicting sources, open cells), mirroring `complexity.md`.
- [ ] Separate plan for code: `principles.ts` (like `ComplexityTable`), one glossary entry per
      principle, principles table on each semantics entry.

## Open questions

- Principles that only make sense for some semantics (e.g. Naivety for admissibility-based ones) —
  show as `violated`, or as not applicable?
- Variant definitions across papers (e.g. Directionality via unattacked sets vs. via SCCs): one row
  per variant, or one row with a note?
