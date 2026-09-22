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

Compile with `lib: ["ES2022"]` and no DOM or Node types: `File`, `Buffer`, `XMLHttpRequest`,
`ProgressEvent` and `PointerEvent` share names with DOM and Node globals.

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
handlers against Max's signatures, stops them being reported as unused, and compiles to nothing:

```ts
function bang() {
  outlet(0, "bang");
}

function msg_int(value: number) {
  outlet(0, value * 2);
}

export type MaxHandlers = Handlers<{
  bang: typeof bang;
  msg_int: typeof msg_int;
}>;
```

## Files

| File | Declares |
| --- | --- |
| `globals.d.ts` | The jsthis scope (`inlets`, `outlet`, `post`, ...), `ScriptHandlers`, `Handlers`, `Global`, `Task`, `Max`, `Wind` |
| `patcher.d.ts` | `Patcher`, `Maxobj`, `MaxobjConnection`, `Folder` |
| `live.d.ts` | `LiveAPI` |
| `data.d.ts` | `Dict`, `Buffer`, `File`, `PolyBuffer`, `SQLite`, `XMLHttpRequest` |
| `mgraphics.d.ts` | `mgraphics`, `MGraphics`, `Image`, `ImageContext` |
| `sketch.d.ts` | `sketch`, `Sketch` |
| `jitter.d.ts` | `JitterObject`, `JitterMatrix`, `JitterListener`, ... |
