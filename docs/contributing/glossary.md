# Glossary content

The glossary is the formal reference behind the editor's tooltips, the tutorials, and the
standalone glossary pages. Its audience is students and researchers, so every definition, result,
and citation must be traceable to the literature. This guide covers the content formats; the
loading code is described in [Extending AgonProject](./extending.md#add-glossary-entries) and
translations in [Localization](./localization.md#structured-content-glossaries-and-tutorials).

## Where content lives

| Content                      | Location                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| Module terms                 | `src/modules/<type>/glossary/<locale>/<key>.md`                                                      |
| Complexity classes, problems | [`common/complexity/glossary/`](/src/modules/common/complexity/glossary/)                            |
| Principles                   | [`common/principles/glossary/`](/src/modules/common/principles/glossary/)                            |
| Publications                 | [`publications.ts`](/src/modules/common/publications/publications.ts) and `abstracts.json`           |
| Complexity results           | `src/modules/<type>/complexity.ts`, registered in [`complexity.ts`](/src/app/glossary/complexity.ts) |
| Principle results            | `src/modules/<type>/principles.ts`, registered in [`principles.ts`](/src/app/glossary/principles.ts) |
| Glossary sections and URLs   | [`glossaryModules.json`](/src/app/glossary/glossaryModules.json)                                     |

## Entries

One Markdown file per term. The file name is the term key; keys are unique across all modules and
are what `[[links]]`, `tooltipId`s, table rows, and URLs (`/glossary/<prefix>/<key>`) refer to.
Abstract-argumentation keys use the bare semantics key (`SAD`) or camelCase (`attackedSet`); other
modules prefix theirs (`adfCO`, `setafReduct`, `abaContrary`).

```markdown
---
label: admissible
title: Admissible Set
reference: D95
---

A set $S$ is admissible if it is [[CF|conflict-free]] and [[defends]] all its members.

## Properties

Every admissible set is contained in a preferred extension [@D95].
```

Frontmatter:

- `label` (required): the inline name used in tooltips and link text.
- `title`: the heading on the glossary page; defaults to the label.
- `short`: a shorter name for the term list, e.g. `NP` instead of the full class name.
- `reference`: the key of the publication that defines the term. An unknown key fails the build.

Body:

- **Definition:** everything before the first `##` heading. It is what hover tooltips show, so
  keep it short and readable: the formal definition plus at most one sentence of reading aid.
  Remarks, properties and caveats go below the first `##`. It may use KaTeX (`$…$`) and links,
  but no citations; the definition cites through `reference`.
- **Longer text:** everything from the first `##` on, shown only on the glossary page. Paragraphs,
  `##`/`###` headings, `-` lists, links, and `[@KEY]` citations, separated by blank lines.
- **Links:** `[[key]]` or `[[key|label]]` to any entry in any module. Link every term that has an
  entry at its first use, notation included. Keep definitions formal and put the link on the
  symbol itself (`$R \subseteq$ [[parents|$par(a)$]]`) rather than writing the notation out.
- **Missing terms:** for each term a new entry relies on, check whether an entry exists. If none
  does, flag it in the report or PR so it can be added; don't leave the gap silently.

## Publications

Each [`Publication`](/src/modules/common/publications/types.ts) is a named export whose name is its
citation key (`D95`, `BCG18`). Authors are written `Last, I.`; every entry needs tags (one formalism
tag plus topic tags from [`tags.ts`](/src/modules/common/publications/tags.ts)). Prefer a DOI,
falling back to a URL. Every field comes from the paper itself or a resolved lookup (DOI,
publisher page); leave out what can't be confirmed rather than guessing it.

A publication is added only once the app cites it, and is cited in its published version where
one exists. When citing a result, cite the earliest paper that proves it; surveys and summary
tables corroborate but are not the source.

## Result tables

Complexity and principle tables share one shape: rows are semantics glossary keys, grouped as in
the evaluation window, and each table has an overview glossary entry (`overviewKey`) that shows the
whole table. Every cell is built with a helper from the table's `types.ts`, so the source and
locator are never forgotten.

The rules for both tables:

- **Literature only.** A cell records what a source states. No own proofs and no solver checks.
- **Locators** give the printed page plus the numbered result (`Thm. 5, p. 33`). For preprints and
  manuscripts, give the numbered result only.
- **Variants** of a definition or principle are named in the cell's remark or note, never merged
  silently with the standard one.
- **Derived results** that only follow from stated ones are marked as such and reviewed by a
  maintainer before they are merged.

### Complexity

[`ComplexityCell`](/src/modules/common/complexity/types.ts), one per semantics and reasoning
problem (`ver`, `cred`, `skept`, `exist`, `ne`, `count`, `enum`; only the first five are shown):

- `complete(cls, source, locator)`, `member(...)`, or `trivial(...)`; `hard` and `notIn` for other
  shapes.
- `note` qualifies the result in the app (e.g. the reduction notion); `comment` is data-only.
- `derived` gives the reason a result follows when no source states it. `complexity.test.ts` pins
  the list of derived cells, so adding one is a deliberate change.

### Principles

[`PrincipleCell`](/src/modules/common/principles/types.ts), one per semantics and principle:

- `holds(source, locator)` or `fails(source, locator)`.
- `via` names the stated implication a result follows from (both parts cited); it is shown as a
  normal result.
- `unreferenced(value)` for trivial or definitional results only; shown without a citation.
- `open()` for a principle that was examined but is unresolved in the literature. A principle
  missing from a row was not examined.

## Checks

[`glossaryData.test.ts`](/src/app/glossary/glossaryData.test.ts) checks that links and citations
resolve, keys are unique, and translations link and cite like their English twin.
[`complexity.test.ts`](/src/app/glossary/complexity.test.ts) and
[`principles.test.ts`](/src/app/glossary/principles.test.ts) check that rows match the grouped
semantics, every term has an entry, and every cell has a known source and locator. Whether a
definition or result matches its source is a review question; the `formal-reviewer` agent in
`.claude/agents/` helps with it.

## Local literature collection

Maintainers keep the cited PDFs in the gitignored `literature/` folder as `literature/<KEY>.pdf`,
with working notes on conventions and open questions in `literature/notes/`.
[`scripts/literature.mjs`](/scripts/literature.mjs) keeps it in sync: `npm run lit:status` lists
keys without a PDF, and `lit:import`, `lit:bib`, and `lit:abstracts` import PDFs, write
`references.bib`, and fill `abstracts.json`.
