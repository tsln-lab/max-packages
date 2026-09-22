# @tsln/timers

`setTimeout`, `setInterval` and their `clear` counterparts for `[v8]` scripts, which have none,
built on Max's `Task`.

```ts
import timers = require("./vendor/timers");

const id = timers.setTimeout(redraw, 50);
timers.clearTimeout(id);

const tick = timers.setInterval(poll, 500, "arg");
timers.clearInterval(tick);

function notifydeleted() {
  timers.clearAll(); // or the Tasks outlive the script
}
```

They behave as they do anywhere else, give or take Max's scheduler: a Task runs in the
low-priority queue, so a delay is a minimum rather than a promise, and 0 means "next tick".
Both kinds share their ids, so `clearTimeout` clears an interval too, as in a browser. Extra
arguments are passed to the callback, and are kept in a closure rather than handed to the Task,
which would turn objects into null.

## As globals

A bundled npm package looks for the timers as globals. `install()` provides them, leaving alone
any that already exist:

```ts
timers.install();
import thing = require("./vendor/thing");
```

## Install

```sh
npm install --save-dev @tsln/timers
```

Max's `require()` searches Max's file path and knows nothing of `node_modules`, so the package's
single CommonJS file, `dist/index.js`, has to be copied or bundled to somewhere Max can find it
(the `max-msp` repository bundles it to `js/vendor/timers.js` with esbuild), with a declaration
file next to it for the types:

```ts
// src/vendor/timers.d.ts
import timers = require("@tsln/timers");
export = timers;
```

The package depends on `@tsln/max-types` for `Task`.
