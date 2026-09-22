# max-packages

A pnpm monorepo of publishable packages for writing Max/MSP and Max for Live scripts in
TypeScript.

| Package | Contents |
| --- | --- |
| [`@tsln/max-types`](packages/max-types) | Ambient type declarations for the Max 9 JavaScript API |
| [`@tsln/lom-types`](packages/lom-types) | Ambient type declarations for the Live Object Model, generated from the reference |
| [`@tsln/live-object`](packages/live-object) | `LiveObject`, a typed wrapper around `LiveAPI` |
| [`@tsln/max-api-types`](packages/max-api-types) | Ambient type declarations for the `max-api` module of `[node.script]` (Node for Max) |

## Using the `[v8]` and `[node.script]` types in one project

`@tsln/max-types` describes the globals of `[v8]`, `[js]` and their UI variants; `@tsln/max-api-types`
describes the `max-api` module of `[node.script]`, which is real Node.js and goes with `@types/node`.
Both sides declare globals of the same names (`Buffer`, `File`, `XMLHttpRequest`, ...), so they
can't share a TypeScript program. A project with both kinds of script keeps one folder per runtime,
each with its own `tsconfig.json`, under a root config that only references them:

```
tsconfig.json          # root: references only, nothing compiled here
src/                   # [v8] scripts, compiled to js/
  tsconfig.json        # "types": ["@tsln/max-types", "@tsln/lom-types"]
node/                  # [node.script] scripts
  tsconfig.json        # "types": ["node", "@tsln/max-api-types"]
  package.json         # the scripts' own runtime dependencies
```

```jsonc
// tsconfig.json
{
  "files": [],
  "references": [{ "path": "src" }, { "path": "node" }]
}
```

```jsonc
// node/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "types": ["node", "@tsln/max-api-types"],
    "strict": true,
    "rootDir": ".",
    "outDir": "."
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

The `src/tsconfig.json` is an ordinary `[v8]` config with `"composite": true` added. `tsc -b`
(or `tsc -b --watch`) builds both, and editors pick the nearest `tsconfig.json` above each file,
so a file under `node/` sees Node's globals and a file under `src/` sees Max's.

The `node/` scripts compile in place, and the folder has a `package.json` of its own, because
`[node.script]` runs a file where it finds it and resolves `require()` from that file's directory:
its `node_modules` has to sit beside it, installed there by `[n4m.setup]` or by hand. Code shared
between the two runtimes has to be pure TypeScript that touches neither side's globals, included
by each program separately.

## Working on it

```sh
pnpm install
pnpm typecheck     # type-check every package (its declarations and its type-level tests)
pnpm build         # build the packages that ship code (dist/ is not committed)
pnpm lint          # biome
pnpm format        # biome, writing fixes
pnpm test          # lint + typecheck + build
pnpm generate:lom  # regenerate lom-types/index.d.ts and live-object/src/lom-meta.ts from the LOM reference
```

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
(`pnpm version` on its own is pnpm’s version-bump command, not the changesets one).

## Using a package locally before it is published

From a consuming project, install the package directory as a file dependency; npm links it, so
edits here are picked up on the next type-check:

```sh
npm install --save-dev ../max-packages/packages/max-types
```
