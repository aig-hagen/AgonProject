# Release Process

Releases are maintainer-driven. [`CHANGELOG.md`](/CHANGELOG.md) is the durable source of truth for release history. Pushing a tag matching `v*` triggers [`publish.yml`](/.github/workflows/publish.yml), which extracts that version's changelog section, builds the frontend and production container, pushes the image to GitHub Container Registry, and creates a GitHub Release.

## Record changes during development

Add notable user-visible changes under `Unreleased` as part of the change that introduces them. Use the `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security` categories where applicable. Avoid copying commit subjects or listing internal maintenance that has no effect on users or operators.

## Prepare a release

1. Identify the previous tag and review the commits since it for missing changelog entries.
2. Rename `## [Unreleased]` to `## [0.12.0] - YYYY-MM-DD`, then add a new empty
   `## [Unreleased]` section above it.
3. Update the comparison links at the bottom of the changelog so `Unreleased` starts at the new tag
   and the new version compares the previous tag with the new one.
4. Verify extraction before publishing:

   ```sh
   node scripts/extract-release-notes.mjs v0.12.0
   ```

5. Verify the release candidate, including the production build and all relevant test suites.
6. Commit and push the finalized changelog to `dev` through the normal review workflow.

## Publish

For version `v0.12.0`, for example:

```sh
git tag v0.12.0
git push origin v0.12.0
```

The publish job fails before building if the tag has no matching dated changelog section. Watch the
workflow through completion and confirm both the GitHub Release and container tag before announcing
the release. Tags are immutable release identifiers; correct a broken release with a new patch
version rather than moving a published tag.

## Version history

`CHANGELOG.md` is the repository's version history. GitHub Release bodies are generated from it, so
they do not require a separately maintained `RELEASE_NOTES.md` file.
