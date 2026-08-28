## Highlights

A follow-up to the mobile launch: this release adds **SVG export straight from the live
graph**, **Undo on mobile**, and a **blank-document module picker**, alongside a batch of
mobile evaluation, tooltip, and dark-mode fixes.

## New features

- **WYSIWYG SVG export** — export the graph exactly as it appears on screen, straight from
  the live view.
- **Blank-document module picker** in the mobile editor, so you can start a new framework of
  any type without leaving the small-screen flow.
- **Undo** is now available from the mobile menu.
- **Tap-to-open term tooltips** on mobile — glossary terms respond to a tap instead of hover.
- **Open Graph tags** for richer social link previews when sharing the app.

## Mobile evaluation

- The evaluation header's add button is now a detent toggle, and the compact switcher floats
  up from the pill.
- The compact eval sheet sizes itself to its content, measuring the active grid.
- Fit-to-content now works for non-grid evaluation result sheets.
- Added a scroll cue so longer evaluation results read as scrollable.

## Fixes

- Keep the on-screen keyboard closed when creating a node on mobile.
- Keep the edge-creation preview aligned after a viewport restore.
- Keep node labels readable on dark-mode highlights.
- Recompute tooltip position on each open.
- Delete mobile documents without the extra confirmation step.
- Share a plain link via the Web Share API.
- Show AF-type acronyms in glossary pills and tabs.

## Other

- Raised the TweetyProject backend rate limit to 60 requests/min.
- Updated the bundled graph component to 5.0.0-rc.11.
- Refined the mobile export sheet and completed the glossary entries from issue #33.
