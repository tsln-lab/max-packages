# Working on max-packages

The repository is a [pnpm](https://pnpm.io) workspace: every package lives under `packages/`,
with its own `package.json`, README and tests. The root holds the shared tooling.

```sh
pnpm install
pnpm typecheck     # type-check every package (its declarations and its type-level tests)
pnpm build         # build the packages that ship code (dist/ is not committed)
pnpm lint          # biome
pnpm format        # biome, writing fixes
pnpm test          # lint + typecheck + build + each package's runtime tests
pnpm generate:lom  # regenerate lom-types/index.d.ts and live-object/src/lom-meta.ts from the LOM reference
pnpm site          # build the GitHub Pages site into site/ from the Markdown in the repository
```

## Packages

There are two kinds of package:

- **Type packages** (`max-types`, `lom-types`, `max-api-types`) are hand-written or generated
  `.d.ts` files at the package root, published as they are. Their `tsconfig.json` type-checks the
  declarations themselves together with a type-level smoke test under `tests/`, which is a file
  that has to keep compiling.
- **Runtime packages** (`live-object`, `console`, `timers`) are TypeScript under `src/`, built
  by `pnpm build` into `dist/`: tsc writes the declarations and esbuild bundles `src/index.ts` into
  one CommonJS file, which is the only form Max's `require()` can load. They reference the type
  packages with `/// <reference types="..." preserve="true" />` so that consumers get those types
  along with the import. Each has a Node test under `tests/` that stubs the Max globals and runs
  the built bundle; `pnpm test` runs it after building.

The type packages assume a `[v8]` environment: `lib: ["ES2022"]`, no DOM and no Node types. The
exception is `max-api-types`, which is for `[node.script]` and is checked against `@types/node`.

### Adding a package

1. Copy the layout of the nearest existing package, keep the `@tsln/` scope, and add a row to
   the table in the README.
2. Add a changeset for its first release (see below) and merge.
3. Publish it once by hand from a terminal, where npm's two-factor prompt works:
   `pnpm changeset version` then `pnpm changeset publish`.
4. On npmjs.com, open the new package's settings and add a trusted publisher: GitHub Actions,
   organisation `tsln-lab`, repository `max-packages`, workflow `release.yml`, no environment.
   The entry has to allow `npm publish`, not only `npm stage publish`, or the workflow fails with
   an OIDC permission error.

From then on the package releases through the workflow like the others.

## Releasing

Versions and changelogs are managed with [changesets](https://github.com/changesets/changesets).

1. Make a change, then run `pnpm changeset` and pick the packages and bump level. Commit the
   file it writes to `.changeset/`.
2. When that lands on `main`, the release workflow opens (or updates) a "Version Packages" PR.
3. Merging that PR bumps the versions, updates each package's `CHANGELOG.md` and publishes to npm.

The workflow publishes with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers):
each package on npmjs.com lists this repository and `release.yml` as a trusted publisher, so no
npm token is stored anywhere. A new package has to be published once by hand before it can be
set up that way. To publish by hand: `pnpm changeset version` then `pnpm changeset publish`
(`pnpm version` on its own is pnpm's version-bump command, not the changesets one).

Right after a publish, the registry's package listing can lag a few minutes behind the tarball,
so a version may look missing while an install of it already works.

## Using a package locally before it is published

From a consuming project, install the package directory as a file dependency; npm links it, so
edits here are picked up on the next type-check:

```sh
npm install --save-dev ../max-packages/packages/max-types
```

For a runtime package, run `pnpm build` here after a change, and rebuild whatever bundles
`dist/index.js` on the consuming side. Switch back to a version range once the package is
published, and reinstall by version so the lockfile drops the link.

## Site

[tsln-lab.github.io/max-packages](https://tsln-lab.github.io/max-packages/) is built from the
Markdown in this repository: the README is the home page, this file is the contributing page, and
each package's README and changelog are pages of their own. `scripts/build-site.mjs` renders them
with `marked`, rewriting the links between the files to the pages they become, and the Pages
workflow deploys the result on every push to `main`. Nothing on the site is written separately,
so a change to a README is a change to the site. The repository's Pages setting has to be
"GitHub Actions" for the deploy to work.
