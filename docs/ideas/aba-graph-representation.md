# ABA module — remaining work

What's still missing or only partly done in the **assumption-based argumentation (ABA)** module.
Editor bugs and UI polish live in the ABA section of [`TODO.md`](TODO.md).

Notation: `‾a` = contrary of assumption `a`; `⊢` = derivability; `A` = assumptions.

## Ground rules (settled)

- **Rules derive, contraries attack.** A rule never _is_ an attack; an attack is
  `derive(head) ∘ (head is a contrary)`. Attacks and supports are computed, never drawn.
- **The theory is the only editable graph.** AF, SETAF, BSAF (and later BAF, ADF) are read-only
  views compiled from it (`views/`). The side panel stays editable in every view.
- **A view is exact or unavailable.** No partial states. Flat-only views are greyed out on
  non-flat theories, with the reason on the switcher.
- **Evaluation happens in assumption space** (TweetyProject `/aba`) and each view maps the
  result onto its own nodes.

## Semantic views

Status: AF, SETAF, BSAF done. Worked example below uses the default theory
(`p ← a`, `q ← a,b`, `‾a = q`, `‾b = p`), with `A1 = ({a}, {a, p})`, `A2 = ({b}, {b})`,
`A3 = ({a, b}, {q})`:

```text
BAF                       ADF
A3 ──▶ A1                 a [¬q]    p [a]
A1 ──▶ A2                 b [¬p]    q [a ∧ b]
A1 ⇒ A3,  A2 ⇒ A3
```

### BAF view (flat, missing)

Lehtonen, _Constructing Compact Structured Argumentation Frameworks_ (COMMA 2026), Def. 12, on
the AF view's support-unique arguments:

```text
Att = {(A, b_singleton) | ‾b ∈ Conc(A)}      b_singleton: the argument with support {b}
Sup = {(b_singleton, A) | b ∈ Prem(A)}
```

- **Nodes:** the AF view's arguments (`supportArguments`), so positions can share its keys.
- **Attacks** only hit singleton arguments; **supports** go from `{b}` to every other argument
  using `b` (the trivial self-support isn't drawn).
- **Semantics:** necessary support (Def. 11). Exact for co, st, pr, gr (Prop. 13), mapping `E`
  to `Prem(E)` and `S` back to `{x | Prem(x) ⊆ S}`.
- **Why:** routes the AF's `n·m` attacks through `n + m` edges and shows which assumptions an
  argument rests on. Drawn with the BAF module's double-arrow support style.
- **Work:** `views/baf.ts` (`toBAF`) + tests, a switcher slot, highlight mapping (same as AF).

### ADF view (flat, missing)

The two-tier reading, drawn: every atom is a node with an acceptance condition.

- **Nodes:** all atoms and assumptions, at their theory positions.
- **Conditions:** atom `p` → OR over its rules of the AND of each body (fact `⊤`, no rule `⊥`);
  assumption `a` → `¬‾a` (no contrary: `⊤`).
- **Links:** body atom → head (supporting), contrary → assumption (attacking).
- **Reuse:** the ADF module's formula model and condition annotations.
- **Open question:** which semantics correspond exactly. The chain is flat ABA → normal logic
  program (Caminada & Schulz 2017) → ADF (Strass 2013); co, gr, pr, st expected. Check both
  papers before the view claims to be exact.
- **Why:** the only view that keeps the non-assumption atoms, so derivations stay visible.

### Switcher leftovers (partial)

- **Shortcuts:** `Alt+1…n` per view — not wired (check against `shortcuts.ts`).
- **"Open as document":** copy a view into its module as a new, independent document (AF → AF,
  SETAF → SETAF, BAF → BAF, ADF → ADF; no BSAF module, so non-flat can't). Needs a small
  cross-module document-creation entry point.

## Export (missing)

The ABA editor has no `export.ts`, no export window and no quick export; other modules pass
`availableExports` to `WindowExport` and the quick-export bar.

- **LaTeX / TikZ:** the theory graph (atoms, assumptions, rule hubs, contraries) needs its own
  drawing, since `exportLatexArgumentationCommon` only knows arguments and attacks. Probably
  also a plain-text theory block (`p ← a`, `‾a = q`).
- **Text formats:**
  - ICCMA 2023 ABA track (`p aba n`, `a x`, `c x y`, `r h b…`) — the standard solver input.
  - TweetyProject `.aba` — already built for `/aba` in `evaluation/tweetyProject.ts`; reuse it.
- **Views:** export the active derived view with its target module's formats (AF → ICCMA/TGF,
  SETAF → `setaf`), or leave that to "open as document".
- **Docs:** add the ABA formats to [`docs/formats/`](../formats/README.md).

## Evaluation (partial)

- **Δ-semantics** (`co_Δ`, `gr_Δ`) for non-flat theories — Berthold, Rapberger, Ulbricht (KR
  2024), Defs 4.6/4.7/4.12; tests from Ex. 4.8/4.9. Needs a TweetyProject reasoner first; until
  then non-flat only gets the direct semantics.
- **Views as explanations:** "why is `a` out?" → highlight the BSAF edge `{a,b} ⇒ a`, then the
  theory rule behind it.

## Random generation (missing)

No random generation for ABA yet (no "Generate" button).

## Tutorials (missing)

No `tutorials/` folder yet. Follow the other modules: a short controls tutorial (two handles,
hubs for collective rules, fact badge, view switcher) and one on the formalism (derivation,
contraries, flat vs. non-flat, what each view shows).
