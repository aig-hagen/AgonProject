# TODO

## General

- **3. [M] AF ranking tutorial.** AF has a ranking window (`WindowRanking.vue`) but only the
  `af-basics` and `af-evaluation` tutorials. Add one that walks through the ranking semantics.
- **4. [S] AF serialiation tutorial.** Missing

## Glossary

- **27. [S] After deploy.** Check that Caddy serves the prerendered `dist/glossary/**/index.html`
  pages, then submit `/sitemap.xml` in Google Search Console.
- **28. [S] Derived complexity cells.** Review the unticked cells in
  `literature/notes/complexity.md` (AF: EA cred/skept/enum, ID enum, GR enum, ADM/PR/SST/CF/NA/CF2
  count-dec; ADF: S2V ne). Only ticked ones go into `complexity.ts`.
- **35. [L] Review the other modules' glossaries.** Same pass as the AF review: see "Next: other
  modules" in [glossary-review.md](glossary-review.md) and the tooling in `scripts/glossary-review/`.
- **33. [L] More entry content.** Each entry gets `## Intuition` and `## Example` sections (with
  an "Open in editor" button). Later, one at a time: aliases and notation (also helps search), relations between semantics as a lattice

## Mobile

- **34. [M] mobile version of the serialisation sheet needs a small overhaul.** especially the collapsed sheet
- **7. [S] Publications on module cards.** Desktop shows a `PublicationsTooltip` on each home card
  (`BlankDocumentCanvas.vue`); the mobile cards show none.
- **26. [M] Landscape layout.** Phones in landscape now get the compact shell, but its top and
  bottom bars leave little canvas height. Consider moving the command bar to a side rail.
- **ADF center view.** On mobile, the centered view of an ADF may cut off acceptance conditions.
- **Serialisation graph sheet.** The compact detent measures the graph's font probe as a row; let results
  declare `data-evaluation-row-height` (graph: 44px). Also check graph spacing and long edge labels.

## Assumption-based argumentation (ABA)

Feature work (BAF/ADF views, LaTeX export, generation, Δ-semantics, tutorials) is planned in
[`aba-roadmap.md`](aba-roadmap.md). This section is editor polish.

### Evaluation window

- **11. [S] Semantics definitions.** Some semantics show incomplete definitions, and the semantics
  list needs a cleaner layout (for ABA).
- **12. [S] Glossary.** Update the ABA glossary entries, and in the evaluation window show the
  definitions for flat and non-flat theories separately.

### Theory editor

- **13. [M] Theory panel.** Improve the layout and look of the side panel.
- **14. [S] Fact annotation.** Improve how facts are marked and toggled.
- **15. [S] Action bar.** Improve the visuals of the node action bar.

### Derived views (AF, SETAF)

- **16. [S] Non-flat notice.** The message shown when the theory becomes non-flat while in the AF
  view needs better wording and styling.
- **17. [M] Derivation per argument.** Show the derivation tree behind each argument node.
- **18. [M] Placing new arguments.** When a theory edit adds arguments to the AF/SETAF view, they
  land in poor spots. Place them near related arguments.
