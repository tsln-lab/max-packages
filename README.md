# max-packages

Packages for writing Max/MSP and Max for Live scripts in TypeScript: types for the APIs Max
exposes to JavaScript, and small runtime libraries for the `[v8]` object.

| Package | Contents |
| --- | --- |
| [`@tsln/max-types`](packages/max-types) | Ambient type declarations for the Max 9 JavaScript API |
| [`@tsln/lom-types`](packages/lom-types) | Ambient type declarations for the Live Object Model, generated from the reference |
| [`@tsln/live-object`](packages/live-object) | `LiveObject`, a typed wrapper around `LiveAPI` |
| [`@tsln/console`](packages/console) | The Max console as a Console API object, installable as the global `console` |
| [`@tsln/timers`](packages/timers) | `setTimeout` and `setInterval` built on `Task`, installable as globals |
| [`@tsln/max-api-types`](packages/max-api-types) | Ambient type declarations for the `max-api` module of `[node.script]` (Node for Max) |
| [`@tsln/create-max`](packages/create-max) | `npm create @tsln/max`: a new project set up with the packages above |

## Getting started

```sh
npm create @tsln/max my-device
cd my-device
npm install
npm run watch
```

That gives a project where every `.ts` file in `src/` compiles to a script in `js/`, bundled
with whatever it imports, so the packages below are used directly and nothing has to be copied
to where Max can find it. The rest of this page is for adding the packages to a project of your
own shape.

## Install

Each package's README says how to use it; the shape is the same across them:

- **Type packages** are ambient declarations. Install them as dev dependencies and list them in
  `types` in `tsconfig.json`; nothing is imported.

  ```sh
  npm install --save-dev @tsln/max-types @tsln/lom-types
  ```

  ```jsonc
  {
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["ES2022"],
      "types": ["@tsln/max-types", "@tsln/lom-types"]
    }
  }
  ```

- **Runtime packages** ship one CommonJS file each in `dist/`. Max's `require()` searches Max's
  file path and knows nothing of `node_modules`, so that file has to be copied or bundled to
  somewhere Max can find it, with a declaration file next to it that re-exports the package's
  types:

  ```ts
  // src/vendor/live-object.d.ts
  import LiveObject = require("@tsln/live-object");
  export = LiveObject;
  ```

  ```ts
  import LiveObject = require("./vendor/live-object");
  ```

  Importing a runtime package brings in the type packages it depends on.

The `[v8]` packages assume `lib: ["ES2022"]` with no DOM or Node types: `File`, `Buffer`,
`XMLHttpRequest` and `PointerEvent` share names with DOM and Node globals.

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
    "module": "node16",
    "moduleResolution": "node16",
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

## Contributing

How the repository is built, tested and released, and how to add a package, is in
[CONTRIBUTING.md](CONTRIBUTING.md).
