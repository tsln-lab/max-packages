# Max scripts in TypeScript

Scripts for Max's `[v8]` object, written in TypeScript under `src/` and compiled to `js/`, which
is where Max loads them from. Created with `npm create @tsln/max`.

```sh
npm install
npm run watch       # compile src/*.ts to js/ on every save; autowatch reloads the script in Max
npm run build       # compile once
npm run typecheck   # check types without compiling
npm run lint        # biome
```

Add the `js/` folder to Max's search path (Options > File Preferences), or keep patchers next to
the compiled scripts, and use `[v8 device.js]`.

## How it fits together

- Every `.ts` file at the top of `src/` becomes a script in `js/` with the same name. Files in
  subfolders are modules for the scripts to import.
- Each script is bundled with everything it imports, so it can use the
  [`@tsln` packages](https://tsln-lab.github.io/max-packages/) and any npm package that sticks to
  the language: `[v8]` has no Node built-ins, no DOM, no `fetch` and no timers of its own
  (`@tsln/timers` provides those, built on `Task`).
- Max calls the functions a script defines at the top level (`bang`, `msg_int`, `list`, and any
  message name). Listing them in a `Handlers<{ ... }>` type checks them against Max's
  signatures. See `src/device.ts`.
- A script must not `export` anything, not even a type: that makes the bundler treat it as a
  module and add a `module.exports` line, which a top-level `[v8]` script can't run. Modules in
  subfolders export as usual.
- `@tsln/max-types` and `@tsln/lom-types` declare Max's globals and the Live Object Model, and are
  listed in `types` in `tsconfig.json`. Compile with no DOM or Node types: Max's `File`, `Buffer`
  and `XMLHttpRequest` are its own.
