# @tsln/console

The Max console as a [Console API](https://developer.mozilla.org/docs/Web/API/console) object
for `[v8]` scripts: `log`, `info`, `warn`, `error`, `assert`, `trace`, `dir`, `table`, `group`,
`count`, `time` and the rest. Values are formatted by `inspect()`, which handles circular
references, functions, Map and Set, errors, and summarises Max and Live objects (`Maxobj`, `Dict`,
`LiveAPI`, `LiveObject`) instead of expanding their internals. A leading string can hold format
specifiers (`%s`, `%d`, `%i`, `%f`, `%o`, `%O`, `%j`, `%c`, `%%`).

```ts
import console = require("./vendor/console");

console.log("tracks:", song.tracks); // tracks: [LiveObject<Track> live_set tracks 0, ...]
console.log("%d of %d", done, total);
console.error("no input on", index); // in red
console.warn("careful"); // "warning: careful", since the Max console has no warning level
console.group("connecting");
console.log("indented");
console.groupEnd();
console.time("render");
console.timeEnd("render"); // render: 12 ms
console.dir(deep, { depth: 6 }); // more than log() shows
```

The module is also callable, as a shorthand for `log()`, so `import log = require("./vendor/console")`
and `log("loaded")` work too.

## As the global `console`

A bundled npm package looks for `console` as a global. `install()` provides it, keeping a console
Max supplies itself and adding only the methods it lacks:

```ts
console.install();
import thing = require("./vendor/thing");
```

## Log file

`logToFile(path)` also writes every line to a file, timestamped and with its level; `logToFile(null)`
stops. Use an absolute path.

## Install

```sh
npm install --save-dev @tsln/console
```

Max's `require()` searches Max's file path and knows nothing of `node_modules`, so the package's
single CommonJS file, `dist/index.js`, has to be copied or bundled to somewhere Max can find it
(the `max-msp` repository bundles it to `js/vendor/console.js` with esbuild), with a declaration
file next to it for the types:

```ts
// src/vendor/console.d.ts
import console = require("@tsln/console");
export = console;
```

The package depends on `@tsln/max-types` for the Max globals it calls (`post`, `error`, `File`).

Where the Console API has no Max equivalent: `table` posts the data like `log`, and `clear` does
nothing, since a script can't clear the Max console.
