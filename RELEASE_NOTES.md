## Highlights

**AgonProject is now usable on phones.** This release is a ground-up mobile rework of the
core workflows — modelling, evaluation, settings and export — so the platform works on a
small touch screen, not just on desktop.

## Mobile

- **Evaluation as a bottom sheet** — a detent-driven sheet (peek / half / full) with
  native-feeling pickers, a header that doubles as the semantics switcher, and a pinned
  copy-result footer that stays reachable at every height.
- The argumentation graph re-fits above the sheet at the half detent, so you can see the
  framework and its evaluation at the same time.
- **Settings as a bottom sheet**, with a new `SegmentedControl` for option toggles.
- Themed glossary, compact layout, and icon-based copy buttons throughout.
- 44px minimum touch targets and enlarged document-row action targets.

## Accessibility

- Notifications are announced through an ARIA live region.
- Per-module mobile Help now describes the real node-tap action for that formalism.
- Reduced-motion is respected in the UI and emulated in tests.

## Responsive layout

- Verified reflow down to 320px with no horizontal scroll.
- Documents survive resizing across the compact breakpoint.

## Testing & CI

- New mobile e2e coverage: per-module evaluate/export flows, a11y checks, and a
  many-documents stress smoke.
- Added a CI test workflow; Prettier formatting is now gated in CI.
- Stabilised WebKit sheet-animation flakiness (CI retry + reduced-motion emulation).

## Docs

- New AgonProject conference poster and refreshed project docs.

**Full changelog:** https://github.com/aig-hagen/AgonProject/compare/v0.7.4...v0.8.0
