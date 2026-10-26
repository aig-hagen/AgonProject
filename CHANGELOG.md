# Changelog

All notable user-visible changes to AgonProject are recorded in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions use the project's `vMAJOR.MINOR.PATCH` tag convention.

## [Unreleased]

### Added

- Glossary pages are prerendered as static HTML with their own title, description and structured data, so search engines can index each term.
- Glossary entries can be translated per term; untranslated entries fall back to English.
- Glossary: a Literature tab lists every cited publication, with search over titles, authors, venues and abstracts, formalism and topic filters with live counts, and links to where it is cited.
- Glossary: computational complexity results for AF and ADF semantics, each with its source, on every semantics page and in overview tables, plus a Complexity tab defining the reasoning problems and complexity classes.
- Glossary: which principles (Directionality, Reinstatement, Modularisation, …) each AF semantics satisfies, with sources from the literature, on every semantics page, plus a Principles tab with a filterable overview table.
- Every glossary term has its own URL (e.g. `/glossary/AF/ADM`) and page title, and the sitemap lists them all; old `?module=&term=` links still work.
- Glossary entries can carry a longer write-up with citations, shown on the glossary page and linked from tooltips ("More →"); each entry lists the entries that reference it.
- SetAF glossary: strongly and weakly admissible, weakly complete, preferred and grounded semantics, with the SetAF reduct.
- SetAF and ABA semantics pickers mark semantics computed via an unproven AF reduction.
- AF glossary: entries show the notation they introduce (e.g. $\mathsf{co}$) beside their title, plus new entries for the range, labellings and the probabilistic ranking.

### Changed

- BAF glossary: definitions checked against the course and sources; coalition entries get symbols,
  and deductive and necessary support say how their semantics are computed.
- PAF and SetAF glossaries: definitions checked against the course and sources; the SetAF weak
  semantics read like their AF counterparts, and semantics entries get symbols.
- Publication references share one citation format with full venue, pages and publisher; same-author, same-year papers are labeled 2005a/2005b.
- Glossary search brightens while typing and has a clear (×) button.
- Glossary follows the design system more closely: shared section labels on mobile, underline link hovers, and a larger "More" tap target.
- Glossary terms are real links (open in a new tab, copy the link); the term list drops redundant "(ABA)"/"(SetAF)"/"(ADF)" suffixes.
- ABA semantics are grouped by family like the other modules; flat-only semantics are disabled one by one on non-flat theories.
- SetAF evaluation uses native reasoners where available, including the strong and weak semantics.
- AF glossary: definitions checked against their sources, with more formal wording, consistent notation, and fixes to SCF2, initial sets, social models and the counting ranking; tooltips in every editor can link to principle, complexity and PAF entries.
- iAF glossary: definitions checked against their sources; possible and necessary extensions get their own entries, separate from possible and necessary acceptance, and the type hint in the evaluation window links the one matching the mode.

### Removed

- SetAF: naive, stage2, CF2 and SCF2 semantics, whose AF reduction gave wrong results.

### Fixed

- Glossary: the complete, preferred and serialisable semantics entries were hidden behind the counting, propagation and serialisability-based ranking entries.
- Glossary: corrected the categorizer definition; the tuples ranking notes that it is partial.
- The mobile tutorial step counter is translated instead of always showing English.

## [0.14.1] - 2026-10-24

### Fixed

- ABA: nodes behind the collapsed theory panel can be clicked and dragged again.
- ABA evaluation works again on the hosted site instead of failing with a server error.

## [0.14.0] - 2026-10-22

### Added

- "Color-blind friendly colors" setting: evaluation results switch to blue and red-orange, which stay apart for
  red-green and blue-yellow color blindness on every graph style.
- Load ICCMA text files (`.af`, `.baf`, `.setaf`, `.iaf`, `.paf`, `.aba`) from the file menu; imported graphs are laid out automatically.
- ABA tutorials: a basics tutorial for building a theory on the canvas, and a views tutorial for the AF/SetAF views.
- Web app manifest and home-screen icons: "Add to Home Screen" now opens AgonProject full-window, without browser bars.
- ADF semantics: strongly admissible, semi-stable, semi-two-valued, initial, two-valued and three-valued, with glossary entries.
- PNG image export (1×–3×) in a new export window with a live preview and a transparent-background toggle; fonts
  are embedded so labels look the same outside the app.
- Serialisation graph: all sequences as a graph of states or as a list grouped by extension; an Explore toggle
  builds the graph step by step. Selecting or hovering a state shows it on the canvas.

### Changed

- ADF evaluation now defaults to preferred semantics instead of admissible.
- Visual polish: one type scale, consistent corner radii and label styles, darker muted text (WCAG AA), flatter home
  cards, and one shared header bar on the glossary, generator and info pages.
- Graph style presets come from the app palette, and every preset now has a proper dark mode.
- Evaluation highlights are easier to tell apart with red-green color blindness; derived nodes get a dotted border.
- Evaluation windows show the result count and a live timer; the empty extension shows as ∅.
- Export options are remembered across sessions, and text formats download in one click.
- New documents are numbered from the start (AF1, AF2, …).
- Mobile: landscape keeps the mobile layout, and the editor chip shows the framework type as a badge.
- Probabilistic: hints and glossary entries explain the acceptance probabilities; approximate inference samples
  1,000 subframeworks, and probabilities must be at least 0.01.

### Fixed

- Glossary: corrected about a dozen definitions (ADF, iAF acceptance, rankings, serialisation and more).
- Numerical ranking scores are readable in dark mode and no longer rely on red-green hue.
- Privacy and third-party links in Help open in the same tab instead of a second app instance.
- The publications tooltip heading on module cards is now translated.

## [0.13.0] - 2026-09-30

### Added

- New Assumption-based Argumentation (ABA) module (beta): build a theory from rules, assumptions and contraries, view it as an AF,
  SetAF or BSAF, and compute extensions via TweetyProject, highlighted in every view; includes a glossary, examples and ICCMA export.
- Added a glossary hint icon to the Incomplete Argumentation acceptance type selector.
- Added a color legend to the graph editor while an evaluation result is highlighted.
- Added a setting to merge mutual edges of the same type into one straight line instead of two arcs.
- Added an "Outline" graph style.

### Changed

- The link-type switch (attack/support, definite/uncertain) and the iAF argument-type switch now use a pill-style segmented control.
- Publication references on the module cards and glossary pages now show title, authors and venue on separate lines.
- The selection action bar now also appears on desktop: click an argument or link to select it; double-click a label to rename it directly. Replaces the old link type popup; ADF arguments get an Edit condition action.
- The PAF probability popup now shows a compact `P(a)` / `P((a,b))` header with the value, and opens from the selection bar on desktop.
- Updated the bundled graph component to 5.0.0-rc.35; uncertain iAF attacks now use its native dashed links.
- Physics now pulls arguments towards the graph's own center instead of the canvas middle, so settling no longer shifts the graph.
- With physics on, linked arguments are gently pulled together while settling, and larger arguments get more room.
- The SVG image export now uses the graph component's exporter: labels are plain SVG text (opens in Inkscape and co.) and the canvas background is kept.
- Renaming an argument or link now also saves when you click outside the graph (e.g. on a panel); only Escape discards the edit.
- The serialisation window, the generate view and the mobile LaTeX export options now use the app's standard picker instead of native selects.
- Export: mobile Save/Copy buttons use the sheet's large touch style with Save as the primary action, and copy/save feedback now shows a check icon for longer.
- Grouped parameter panels (evaluation, serialisation, LaTeX export options, tutorials, mobile term definitions) now show the same recessed background in light and dark mode.
- Dropdowns and text fields now share one field background that sets them apart from grouped panels in light and dark mode.
- New typography: Inter for the UI, JetBrains Mono for code/data, graph labels and evaluation results (math symbols from KaTeX), Fraunces for the app name; all fonts are self-hosted.
- Evaluation results use tighter spacing between argument names.
- Auto-layouts now respect node shapes, annotations (ADF conditions, PAF probabilities) and collective attacks; generated graphs of every type are laid out force-directed.

### Fixed

- BAF extension highlighting no longer marks supported arguments as rejected, and follows the complex attacks of the chosen support type.
- iAF extension highlighting only marks targets of definite attacks as rejected.
- With several evaluation windows open, only the focused one highlights the canvas, and closing it clears the highlight.
- SetAF extension highlighting now marks targets of collective attacks as rejected when all attackers are accepted.
- Fixed LaTeX export: mobile and desktop now produce identical code — style options always ride on `\begin{af}[…]`, and both share the same defaults and the Node Labels option.
- Fixed LaTeX export: argument names keep special characters, umlauts and Greek letters (`a_1` → `a_{1}`, `Käse` → `K\"{a}se`, `α` → `\alpha`) instead of stripping them.
- Fixed LaTeX export: shortened argument names are now unique (e.g. `A_{1}`, `A_{2}`) with the full name as a trailing `% Alibi` comment, and used consistently in ADF conditions; a new "Node Labels" option (Auto/Full/Short) controls shortening.
- Fixed LaTeX export: mutual attacks in iAFs, pAFs and SETAFs are now bent instead of overlapping, and pAF attack probabilities are no longer dropped.

## [0.12.0] - 2026-09-21

### Added

- Added a documentation index with separate user, architecture, contributor, reference, and operations paths.
- Added C4-inspired system and frontend architecture diagrams.
- Added contributor, testing, release, user, and deployment guides.
- Added a `share_framework` tool to the MCP service so external tools can save and share frameworks.
- Added an interactive reference (Swagger UI) for the reasoning backend API, plus a friendly notice
  for direct browser visits to solver endpoints.
- Added a localized 404 page for unknown routes.

### Changed

- Standardized the English name of ADF as "Abstract Dialectical Frameworks."
- Made the changelog the source for generated GitHub Release notes.
- Reworked desktop export into an editable LaTeX studio with live preview; moved ICCMA, TGF, and
  image export to one-click Export menu actions.
- Pinned the base framework term to the top of each module glossary.

### Fixed

- Corrected the BAF ICCMA example and documentation of save-schema strictness.
- Updated the documented production topology and development prerequisites.
- Gave tooltip popups a surface distinct from the app background.
- Fixed a bug in Incomplete Argumentation reasoning.

## [0.11.4] - 2026-09-12

### Changed

- Enriched page metadata with an accurate title and description, Open Graph and Twitter tags,
  absolute image URLs, a canonical link, and JSON-LD structured data.
- Added `robots.txt`, `sitemap.xml`, and Google Search Console verification.

## [0.11.3] - 2026-09-12

### Changed

- Clarified that MCP extension enumeration and acceptance results are sound and complete and do not
  need to be checked through manual reasoning.

## [0.11.2] - 2026-09-12

### Changed

- Temporarily disabled the MCP `render_framework` tool behind a feature flag that can re-enable it
  without a code change.
- Strengthened MCP guidance to prefer solver tools over manual reasoning for expressible inputs.

## [0.11.1] - 2026-09-12

### Added

- Made the read-only argumentation MCP endpoint publicly accessible by default with per-IP rate
  limiting and optional authentication.

### Changed

- Load TikZJax only when rendering TikZ instead of on every page load.

## [0.11.0] - 2026-09-12

### Added

- Added English and German localization, with English as the default and German selectable in
  settings.
- Added an MCP service exposing abstract argumentation reasoning and generation to external tools
  and AI assistants.

### Security

- Updated `js-yaml` and `qs` to patch denial-of-service advisories.

## [0.10.0] - 2026-09-09

### Added

- Added centralized light and dark theme palette tokens.

### Changed

- Polished the share flow, tutorial spotlight, and ADF condition-editor layout.
- Restored all help links in the mobile help sheet.

### Fixed

- Prevented clipping of the node-label input focus ring.

## [0.9.1] - 2026-09-03

### Added

- Added anonymous, cookieless usage analytics, a privacy notice, DNT/GPC opt-out, and a protected
  statistics dashboard.
- Added sticky term tooltips, evaluation-kind icons, an imprint, and additional framework examples.

### Changed

- Reduced initial JavaScript by lazy-loading Graphviz, export code, and route components.
- Aligned the desktop and mobile menus and improved evaluation controls.
- Unified save and example schemas across modules.

### Fixed

- Fixed WYSIWYG SVG preview sizing and refresh behavior.

## [0.9.0] - 2026-08-30

### Added

- Added richer interactive tutorials, spotlight targets, and touch gesture instructions.
- Added interactive graph-node feedback and animated recentering.
- Added last-edited time and framework type to mobile framework entries.

### Changed

- Renamed Documents to Frameworks throughout the application.
- Refined mobile selection behavior, the editorial layout, help content, and tutorial interactions.
- Updated the bundled graph component to 5.0.0-rc.22.

Earlier versions are available on the
[GitHub Releases page](https://github.com/aig-hagen/AgonProject/releases).

[Unreleased]: https://github.com/aig-hagen/AgonProject/compare/v0.14.1...HEAD
[0.14.1]: https://github.com/aig-hagen/AgonProject/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/aig-hagen/AgonProject/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/aig-hagen/AgonProject/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/aig-hagen/AgonProject/compare/v0.11.4...v0.12.0
[0.11.4]: https://github.com/aig-hagen/AgonProject/compare/v0.11.3...v0.11.4
[0.11.3]: https://github.com/aig-hagen/AgonProject/compare/v0.11.2...v0.11.3
[0.11.2]: https://github.com/aig-hagen/AgonProject/compare/v0.11.1...v0.11.2
[0.11.1]: https://github.com/aig-hagen/AgonProject/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/aig-hagen/AgonProject/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/aig-hagen/AgonProject/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/aig-hagen/AgonProject/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/aig-hagen/AgonProject/compare/v0.8.2...v0.9.0
