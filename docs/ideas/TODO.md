# TODO

## General

- Add tags to publications (Semantics, Complexity, AF/BAF/etc, etc); add a page with the literature list; allow search and filter by tags there

- **3. [M] AF ranking tutorial.** AF has a ranking window (`WindowRanking.vue`) but only the
  `af-basics` and `af-evaluation` tutorials. Add one that walks through the ranking semantics.

## Mobile

- **7. [S] Publications on module cards.** Desktop shows a `PublicationsTooltip` on each home card
  (`BlankDocumentCanvas.vue`); the mobile cards show none.
- **26. [M] Landscape layout.** Phones in landscape now get the compact shell, but its top and
  bottom bars leave little canvas height. Consider moving the command bar to a side rail.

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
