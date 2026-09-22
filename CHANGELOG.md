# Changelog

All notable user-visible changes to AgonProject are recorded in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions use the project's `vMAJOR.MINOR.PATCH` tag convention.

## [Unreleased]

### Added

- Added a glossary hint icon to the Incomplete Argumentation acceptance type selector.

### Changed

- ABA editor: facts now appear in the Rules list as empty-body rules (`h ← ⊤`), and the rule builder creates a fact when the body is left empty.
- ABA editor: statements can be promoted/demoted between atom and assumption, and deleted, directly from the side panel.
- ABA editor: reworked the side panel — deliberate atom/assumption add buttons, inline contrary picker with overline notation (`‾a`), a unified rule builder (head select plus a body token field taking typed names as removable pills or chip clicks), and a collapsible ABA definition section.

### Fixed

- Fixed SVG graph export: node labels are centered again and bent edges no longer show a black fill sliver.

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
