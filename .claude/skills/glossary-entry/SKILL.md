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
  DOI, tags) from the PDF's first page; the app will cite it, so it qualifies.
- Read the definition in `literature/<KEY>.pdf` and note its page and number. If the PDF is
  missing, stop and ask the user for it (`npm run lit:import -- <dir>` adds it); don't write a
  definition from memory.

## 3. Write the entry

- Frontmatter: `label`, `title` if it differs, `reference`, and `short` only for term lists.
- Definition before the first `##`: faithful to the paper, in the notation of the module's other
  entries, linking existing terms with `[[key]]`. One plain sentence of reading aid at most.
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
findings, and a proposed changelog line under `Added`. Wait for approval before committing.
