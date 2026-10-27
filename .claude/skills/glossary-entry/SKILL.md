---
name: glossary-entry
description: Add or extend an AgonProject glossary entry from its source paper — key, definition, links, publication, checks, and a formal review. Use when the user asks to add, write, or extend a glossary term.
argument-hint: '<term> [module] [publication key]'
---

Read [docs/contributing/glossary.md](../../../docs/contributing/glossary.md) first; it defines the
format and the sourcing rules this skill follows. Work on one term at a time.

## 1. Place the term

- Pick the module from `$ARGUMENTS` or the term's formalism; ask if unclear.
- Choose the key like its neighbors: AF terms use the bare semantics key (`SAD`) or camelCase
  (`attackedSet`); other modules prefix it (`adfCO`, `setafReduct`, `abaContrary`).
- Check the key is unused in every module (`src/modules/**/glossary/en/<key>.md`). If the term
  already exists, extend that entry instead.

## 2. Find the source

- Use the publication key from `$ARGUMENTS`, or find the defining paper: the earliest that
  defines the term. If unsure, propose candidates and ask.
- If the paper isn't in `publications.ts` yet, add it (kind, authors as `Last, I.`, venue, pages,
  DOI, tags); the app will cite it, so it qualifies. Take every field from the PDF (first page,
  header, footer) or a lookup you actually ran, such as `https://doi.org/<DOI>` or the publisher
  page. Never fill in a field from memory or by pattern; a guessed DOI or page range is worse than
  none. If a field can't be found, leave it out and ask the user; say which source each field
  came from.
- For a new publication, copy its PDF to `literature/<KEY>.pdf` and run `npm run lit:abstracts`.
  Check the abstract it writes against the PDF; text taken from a PDF can pick up the
  introduction or a second column.
- Results in the body cite the earliest paper that proves them. A later journal version by the
  same authors may stand in for its workshop or conference version; a survey may not.
- Read the definition in `literature/<KEY>.pdf` and note its page and number. If the PDF is
  missing, stop and ask the user for it (`npm run lit:import -- <dir>` adds it); don't write a
  definition from memory.

## 3. Write the entry

- Frontmatter: `label`, `title` if it differs, `reference`, `short` only for term lists, and
  `symbol` (bare LaTeX, e.g. `\mathsf{co}`) when the entry introduces notation. Introduce the
  symbol there, not in the definition text.
- Before writing, read two or three related entries (same module, and the entries the new one
  links to) and match their structure, wording and markup. Use only the syntax the guide lists;
  the parser renders nothing else, so other Markdown shows up as raw characters.
- Follow the style rules in the guide (template, "iff", notation); where they leave a choice,
  use the terms and notation of the FernUni course text (`m_64402_fa`), as long as they read
  naturally in English.
- Definition before the first `##`: faithful to the paper, in the notation of the module's other
  entries. It is the hover tooltip, so keep it short and readable; one plain sentence of reading
  aid at most, and remarks go in the body.
- List the terms the definition relies on (symbols included, e.g. $par(a)$) and look each up in
  every module. Link each one that has an entry at its first use; for a symbol, keep the
  notation and put the link on it (`[[parents|$par(a)$]]`). Note each term without an entry for
  the report.
- A body only if the user asks for one, or the paper gives properties worth stating, each cited
  with `[@KEY]` and stated as the source states it.
- No German translation; German glossary text needs a domain expert.

## 4. Wire it in

- Link the new term from entries that mention it in prose.
- If it is a semantics or principle that a complexity or principle table should list, say so and
  ask before adding rows; table cells follow their own sourcing rules.

## 5. Check

```sh
npm run test:unit -- --run src/app/glossary src/modules/common
npm run type-check
```

Then run the `formal-reviewer` subagent on the new or changed files and fix its **error** findings.

## 6. Report

Show the entry, the source evidence (paper, page, definition number), the reviewer's remaining
findings, the terms it relies on that have no entry yet, and a proposed changelog line under
`Added`. Wait for approval before committing.
