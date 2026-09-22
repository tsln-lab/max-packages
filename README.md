# max-packages

A pnpm monorepo of publishable packages for writing Max/MSP and Max for Live scripts in
TypeScript.

| Package | Contents |
| --- | --- |
| [`@tsln/max-types`](packages/max-types) | Ambient type declarations for the Max 9 JavaScript API |

## Working on it

```sh
pnpm install
pnpm typecheck     # type-check every package (its declarations and its type-level tests)
pnpm lint          # biome
pnpm format        # biome, writing fixes
pnpm test          # lint + typecheck
```

## Releasing

Versions and changelogs are managed with [changesets](https://github.com/changesets/changesets).

1. Make a change, then run `pnpm changeset` and pick the packages and bump level. Commit the
   file it writes to `.changeset/`.
2. When that lands on `main`, the release workflow opens (or updates) a "Version Packages" PR.
3. Merging that PR bumps the versions, updates each package's `CHANGELOG.md` and publishes to npm.

The workflow needs an `NPM_TOKEN` repository secret: an npm granular access token that can
publish to the `@tsln` scope. To publish by hand instead: `pnpm version` then `pnpm release`.

## Using a package locally before it is published

From a consuming project, install the package directory as a file dependency; npm links it, so
edits here are picked up on the next type-check:

```sh
npm install --save-dev ../max-packages/packages/max-types
```
