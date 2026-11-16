# @tsln/jweb-types

Type declarations for the MaxBridge API: `window.max`, which Max's `[jweb]` object gives the web
pages it loads, transcribed from the [reference](https://docs.cycling74.com/apiref/jweb/).

It has two entries:

- `@tsln/jweb-types`, a module: the `MaxBridge` interface and the types of what passes through
  it (`MaxDict`, `MaxArray`, `JitterMatrix`, `JitterImage`, ...), for `import type`. Nothing in
  it is global, so any program can import from it, including code shared between a `[jweb]`
  page and other contexts.
- `@tsln/jweb-types/global`: the global, `max` on `Window` and as a variable. A `[jweb]` page is
  an ordinary Chromium page, so this goes alongside the DOM types and adds to them.

For scripts in `[v8]`, `[js]` and their UI variants, see [`@tsln/max-types`](../max-types); for
`[node.script]`, [`@tsln/max-api-types`](../max-api-types). `@tsln/max-types` has no DOM,
declares globals of the same names as the DOM's (`console`, `fetch`, `URL`, ...) and a `max` of
its own, so it can't share a TypeScript program with the global entry: a project with both a
`[jweb]` page and `[v8]` scripts gives each its own folder and `tsconfig.json`, as the
[repository README](../../README.md#using-the-v8-and-nodescript-types-in-one-project) shows for
`[node.script]`. The main entry clashes with nothing.

## Install

```sh
npm install --save-dev @tsln/jweb-types
```

A `[jweb]` page lists the global entry in `types`, with the DOM in `lib`:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["@tsln/jweb-types/global"]
  }
}
```

and imports the types it names:

```ts
import type { JitterMatrix, MaxDict } from "@tsln/jweb-types";
```

A project that only wants the types, without the global, imports them and leaves `types` alone.

TypeScript 5.7 or later is needed: the typed arrays are declared over `ArrayBuffer`, as in
`Uint8ClampedArray<ArrayBuffer>`, so they can go straight to DOM APIs such as `ImageData`.

## Use

```ts
max.bindInlet("level", (value: number) => {
  meter.style.height = `${value * 100}%`;
});

button.onclick = () => max.outlet("pressed", 1);

max.getDict("settings", (dict) => {
  if (dict) max.setDict("settings", { ...dict, gain: 0.5 });
});

max.bindJitterImage(
  (image) => context.putImageData(new ImageData(image.data, image.width, image.height), 0, 0),
  { queue: 2, drop: "oldest" },
);
```

`max` is typed as always there, which it is in `[jweb]`. A page that also runs in an ordinary
browser, during development say, checks before it uses it:

```ts
if ("max" in window) {
  max.outlet("ready");
}
```

## Where these differ from the reference

- The fields of `StreamingOptions` are optional. The reference has both required, while the
  options themselves are optional.
- `bindInlet` callbacks take `(...args: any[])`. Max sends the arguments of the message, whose
  types the page decides on, so a callback can declare them, as `(value: number) => ...`.

Neither has been checked against Max yet; nor has any other part of these declarations.
