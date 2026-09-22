# @tsln/max-api-types

Type declarations for `max-api`, the module Max's `[node.script]` object provides to the
Node.js process it runs (Node for Max), transcribed from the
[reference](https://docs.cycling74.com/apiref/nodeformax/).

This is the Node.js side of Max. For scripts in `[v8]`, `[js]` and their UI variants see
[`@tsln/max-types`](../max-types); the two declare globals of the same names and can't be
loaded together. A project with both kinds of script gives each its own folder and
`tsconfig.json`; the [repository README](../../README.md#using-the-v8-and-nodescript-types-in-one-project)
shows the layout.

## Install

```sh
npm install --save-dev @tsln/max-api-types @types/node
```

`max-api` isn't a package to install: `[node.script]` injects it. The declarations are ambient,
so list the package in `types` and require the module as usual:

```jsonc
{
  "compilerOptions": {
    "types": ["node", "@tsln/max-api-types"]
  }
}
```

```ts
import maxAPI = require("max-api");

maxAPI.addHandlers({
  bang: () => maxAPI.outletBang(),
  number: (value) => maxAPI.outlet(value * 2), // value: number
  list: (...values) => maxAPI.outlet(values.length), // values: (string | number)[]
  dict: (dict) => maxAPI.post(dict.gain), // dict: JSONObject
  gain: (db: number) => { ... }, // a message of the script's own: `gain -6`
  [maxAPI.MESSAGE_TYPES.ALL]: (handled, ...args) => {
    if (!handled) maxAPI.post("unhandled:", args, maxAPI.POST_LEVELS.WARN);
  },
});
```

## Compared to `@types/max-api`

DefinitelyTyped has typings for the same module. These differ in two ways:

- The module is declared with `export =`, so `import maxAPI = require("max-api")` gives the API
  directly, as it does at runtime, instead of an object with a `default` property.
- Handlers for the predefined selectors (`bang`, `number`, `list`, `dict`, `all`) are typed with
  what they receive, through `addHandler` and `addHandlers` alike. Handlers for messages of the
  script's own stay open, as `(...args: any[]) => void`.

`MAX_ENV`, `MESSAGE_TYPES` and `POST_LEVELS` are declared as the objects of strings they are at
runtime rather than as enums, so the plain strings work wherever the constants do.
`process.env.MAX_ENV` is typed with the `MAX_ENV` values.
