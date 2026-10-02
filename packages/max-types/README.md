# @tsln/max-types

Ambient type declarations for the JavaScript API of Max 9's `[v8]`, `[v8ui]`, `[js]` and `[jsui]`
objects: `post`, `outlet`, `inlets`, `autowatch`, `Patcher`, `Maxobj`, `Task`, `Dict`, `Buffer`,
`File`, `LiveAPI`, `mgraphics`, `sketch`, Jitter and the rest, transcribed from the
[JS API reference](https://docs.cycling74.com/apiref/js/).

Where the docs are wrong in practice, a declaration is widened and a comment says so (for
example `autowatch` accepts `1`, and `LiveAPI.get()` returns `any[]`).

## Install

```sh
npm install --save-dev @tsln/max-types
```

The declarations are global, so list the package in `types` rather than importing it:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "types": ["@tsln/max-types"]
  }
}
```

Compile with `lib: ["ES2022"]` and no DOM or Node types: `console`, `setTimeout`, `fetch`,
`File`, `Buffer`, `URL`, `WebSocket`, `XMLHttpRequest`, `PointerEvent` and more share names
with DOM and Node globals, and the built-in modules share theirs with Node's.

## Max 9.2

The declarations follow the reference for Max 9.2, whose `[v8]` gained a `console` that writes
to the Max console, `setTimeout` and the other timers, `fetch`, `WebSocket` and
`WebSocketServer`, `MaxFFT`, and the built-in modules `http`, `https`, `net`, `tls`, `dgram`
and `buffer`:

```ts
import http = require("http");

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.end("hello\n");
});
server.listen(3007, () => console.log("listening"));

setTimeout(() => server.close(), 60_000);
```

Each of these is a subset of the browser or Node API it is named after. None of them exists
in Max 9.1 or earlier, or in `[js]`, and the types can't tell which Max a script will run in:
a script that has to run in an older Max must check before it calls, as in
`typeof setTimeout == "function"`.

The binary type of the networking APIs is `IOBuffer`, a `Uint8Array` subclass. `Buffer` is
still the `buffer~` wrapper.

## Not for `[node.script]`

`[node.script]` runs a real Node.js process, and its API is the `max-api` module rather than
these globals: none of `post`, `outlet`, `inlets` or the classes here exist there, and Node's own
globals do. That side is covered by [`@tsln/max-api-types`](../max-api-types), which declares
the module and nothing global.

The two packages stay separate because this one can't share a TypeScript program with
`@types/node`, which a `[node.script]` project needs: both declare `Buffer` and `File` as
globals, as unrelated types, and TypeScript reports them as duplicate identifiers. A project with
both kinds of script gives each its own folder and `tsconfig.json`; the
[repository README](../../README.md#using-the-v8-and-nodescript-types-in-one-project) shows the
layout.

## Handlers

Max calls the functions you define at the top level of a script (`bang`, `msg_int`, `list`, ...).
They must not be exported, so list them in a `Handlers<T>` type instead. This checks the built-in
handlers against Max's signatures and compiles to nothing:

```ts
function bang() {
  outlet(0, "bang");
}

function msg_int(value: number) {
  outlet(0, value * 2);
}

type MaxHandlers = Handlers<{
  bang: typeof bang;
  msg_int: typeof msg_int;
}>;
```

Exporting the type marks the handlers as used for a linter, and is fine when scripts are
compiled file by file with `tsc`. In a project that bundles each script with esbuild, leave the
`export` off: it makes the bundler treat the script as a module and add a `module.exports` line,
which a top-level `[v8]` script can't run.

## Files

| File | Declares |
| --- | --- |
| `globals.d.ts` | The jsthis scope (`inlets`, `outlet`, `post`, ...), `ScriptHandlers`, `Handlers`, `console`, the timers, `Global`, `Task`, `Max`, `Wind` |
| `patcher.d.ts` | `Patcher`, `Maxobj`, `MaxobjConnection`, `Folder` |
| `live.d.ts` | `LiveAPI` |
| `data.d.ts` | `Dict`, `Buffer`, `File`, `PolyBuffer`, `MaxString`, `MaxArray`, `MaxFFT`, `MaxFFT2D`, `Rx256`, `SQLite`, `XMLHttpRequest` |
| `network.d.ts` | `fetch`, `Request`, `Response`, `Headers`, `AbortController`, `Blob`, `FormData`, `URL`, the streams, `EventSource`, `WebSocket`, `WebSocketServer`, `IOBuffer`, and the modules `buffer`, `dgram`, `net`, `tls`, `http`, `https` |
| `mgraphics.d.ts` | `mgraphics`, `MGraphics`, `Image`, `ImageContext` |
| `sketch.d.ts` | `sketch`, `Sketch` |
| `jitter.d.ts` | `JitterObject`, `JitterMatrix`, `JitterListener`, ... |
