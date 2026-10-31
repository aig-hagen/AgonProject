---
name: release
description: Prepare and publish an AgonProject release — changelog, checks, release commit, tag, and watching the Publish workflow. Only when the user asks for a release.
argument-hint: '[version]'
disable-model-invocation: true
---

Follow [docs/contributing/releases.md](../../../docs/contributing/releases.md); this is its
checklist form. Pushing and tagging are outward-facing: stop where marked and wait for the user.

## 1. Preflight

- On `dev`, clean working tree, up to date with `origin/dev` (`git fetch`, then compare).
- The TweetyProject submodule is at the commit `dev` records (`git submodule status`, no `+`).

## 2. Changelog and version

- Find the last tag (`git tag --sort=-v:refname | head -1`) and read `git log <tag>..HEAD`.
- List user-visible changes missing from `## [Unreleased]` and draft entries for them (one line
  each, no refactors or maintenance).
- Review the existing `[Unreleased]` entries. They describe the change from the last release, not
  the development history:
  - Drop fixes, tweaks, and reverts of things added since the last release; fold any lasting
    effect into the entry that introduced them.
  - Merge minor and related entries into one entry per feature or area.
  - Drop entries with no user-visible effect, and move entries to the right section
    (`Added`/`Changed`/`Removed`/`Fixed`).
- Propose the version, unless `$ARGUMENTS` gives one: minor if anything was added, changed, or
  removed; patch if there are only fixes.
- **Stop:** show the proposed `[Unreleased]` section as a diff against the current one, with a
  short reason per dropped or merged entry, plus the version, and wait for approval.

## 3. Finalize the changelog

- Add the approved entries, rename `## [Unreleased]` to `## [X.Y.Z] - <today>`, and add an empty
  `## [Unreleased]` above it.
- Update the links at the bottom: `[Unreleased]` compares `vX.Y.Z...HEAD`, and a new `[X.Y.Z]`
  line compares the previous tag with `vX.Y.Z`.
- `node scripts/extract-release-notes.mjs vX.Y.Z` prints the expected notes.

## 4. Verify

Run all of these and report the results; fix failures before going on:

```sh
npm run lint && npm run format && npm run format:check && npm run type-check
npm run test:unit -- --run
npm run build
npm run docs:check
npm run test:e2e -- --project=chromium --project="Mobile Chrome"
```

E2E runs once, on the Chromium projects only: Firefox and WebKit don't launch on every machine,
and CI covers them. A `browserType.launch` error is a local setup gap, not a regression; report it
and don't rerun. Compare other failures against `dev` before calling them new.

## 5. Commit, push, tag

- Commit only `CHANGELOG.md` (plus fixes from step 4, committed separately) as
  `docs: release vX.Y.Z`.
- **Stop:** show the commit and the release notes, and wait for explicit approval to publish.
- `git push origin dev`, then `git tag vX.Y.Z` and `git push origin vX.Y.Z`.

## 6. Watch

- Find the Publish run for the tag (`gh run list --workflow publish.yml --limit 1`) and watch it
  through completion (`gh run watch <id> --exit-status`).
- Confirm the GitHub Release exists (`gh release view vX.Y.Z`) and the image was pushed (the run's
  "Build and push" step lists the `ghcr.io/aig-hagen/agonproject:X.Y.Z` tag).
- Report the result with links. If the run failed, report the failing step and log excerpt. Never
  move or delete a published tag; a broken release is fixed with a new patch version.
