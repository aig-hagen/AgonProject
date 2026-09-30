# Changelog

All notable user-visible changes to AgonProject are recorded in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions use the project's `vMAJOR.MINOR.PATCH` tag convention.

## [Unreleased]

### Added

- ABA theory view: contraries are drawn as dashed ⊣ edges from the contrary to its assumption, next to any rule between the same nodes.
- New Assumption-based Argumentation (ABA) module (beta): build a theory from rules, assumptions and contraries, view it as an AF,
  SetAF or BSAF, and compute extensions via TweetyProject, highlighted in every view; includes an ABA glossary.
- Added a glossary hint icon to the Incomplete Argumentation acceptance type selector.
- Added a color legend to the graph editor while an evaluation result is highlighted.
- Added a setting to merge mutual edges of the same type into one straight line instead of two arcs.

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
- New typography: Inter for the UI, JetBrains Mono for code/data, graph labels and evaluation results, Fraunces for the app name; all fonts are self-hosted.
- Auto-layouts now respect node shapes, annotations (ADF conditions, PAF probabilities) and collective attacks; generated graphs of every type are laid out force-directed.

### Fixed

- Math symbols (← ⊢ ⊤ ⊥ ∧ ∨) in graph labels and the ABA/ADF editors no longer fall back to tiny system glyphs.
- ABA theory panel, view switcher and canvas notes are now translated instead of always showing English.
- ABA BSAF view: an attack and a support with the same ends (also collective ones) are now both drawn side by side instead of listing the attack in a note.
- ABA SetAF/BSAF views: attacks and supports from the empty set are drawn from a ∅ symbol, and attacks involving always-out assumptions are no longer hidden.
- Arrowheads now end exactly on the border of rectangular and diamond arguments, also for curved and angled edges.
- Graph annotations (e.g. ABA facts `⊤` and contraries) now disappear once they no longer apply instead of lingering.
- BAF extension highlighting no longer marks supported arguments as rejected, and follows the complex attacks of the chosen support type.
- iAF extension highlighting only marks targets of definite attacks as rejected.
- With several evaluation windows open, only the focused one highlights the canvas, and closing it clears the highlight.
- SetAF extension highlighting now marks targets of collective attacks as rejected when all attackers are accepted.
- Fixed SVG graph export: node labels are centered again and bent edges no longer show a black fill sliver.
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

[Unreleased]: https://github.com/aig-hagen/AgonProject/compare/v0.12.0...HEAD
[0.12.0]: https://github.com/aig-hagen/AgonProject/compare/v0.11.4...v0.12.0
[0.11.4]: https://github.com/aig-hagen/AgonProject/compare/v0.11.3...v0.11.4
[0.11.3]: https://github.com/aig-hagen/AgonProject/compare/v0.11.2...v0.11.3
[0.11.2]: https://github.com/aig-hagen/AgonProject/compare/v0.11.1...v0.11.2
[0.11.1]: https://github.com/aig-hagen/AgonProject/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/aig-hagen/AgonProject/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/aig-hagen/AgonProject/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/aig-hagen/AgonProject/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/aig-hagen/AgonProject/compare/v0.8.2...v0.9.0
