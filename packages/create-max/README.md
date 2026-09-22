# @tsln/create-max

Creates a project for writing Max scripts in TypeScript, set up with the
[`@tsln` packages](https://tsln-lab.github.io/max-packages/):

```sh
npm create @tsln/max my-device
cd my-device
npm install
npm run watch
```

It asks whether to add a `node/` folder for `[node.script]` scripts; `-- --node` or
`-- --no-node` answers without asking (the `--` is what passes the flag through `npm create`).

## What you get

```
my-device/
  src/device.ts     # a [v8] script with typed handlers, to rename or copy
  js/               # what Max loads: one compiled file per script in src/ (after a build)
  build.mjs         # esbuild: bundles each script with everything it imports
  tsconfig.json     # Max's globals and the Live Object Model as types, nothing else
  biome.jsonc
  package.json      # the @tsln packages, esbuild, typescript and biome as dev dependencies
  node/             # with --node: a [node.script] script, its own tsconfig and package.json
```

Every `.ts` file at the top of `src/` compiles to a script of the same name in `js/`, bundled
with its imports, so scripts use `@tsln/live-object`, `@tsln/console`, `@tsln/timers` and other
npm packages directly, and nothing has to be copied to where Max can find it. `npm run watch`
recompiles on save, and `autowatch = 1` in the script makes Max reload it. Add the `js/` folder
to Max's search path, or keep patchers next to the compiled scripts.

The `node/` folder compiles in place with its own `tsconfig.json`, since `[node.script]` is real
Node.js and its types can't share a program with the `[v8]` globals. Its runtime dependencies
are installed there, beside the scripts, where Node looks for them.

## Versions

The generated `package.json` pins the `@tsln` packages to the versions this package was released
alongside, so a project starts from a set that was checked together.
