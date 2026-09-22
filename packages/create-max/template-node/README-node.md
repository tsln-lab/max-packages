# The node/ folder

Scripts for `[node.script]`, which runs a real Node.js process. They compile in place:

```sh
npm run watch:node   # compile node/*.ts next to their sources on every save
npm run build:node   # compile once
```

`[node.script script.js]` with `node/` in Max's search path, then `script start`. Runtime
dependencies go in `node/package.json` and are installed there, next to the scripts, by
`[n4m.setup]` or `npm install` run in that folder, since Node resolves `require()` from the
script's own folder.

`node/tsconfig.json` is separate from the root one on purpose: it uses Node's types and
`@tsln/max-api-types`, which can't share a program with the `[v8]` globals in `src/`. Editors
pick the nearest `tsconfig.json`, so files here see Node and files in `src/` see Max. Code shared
between the two has to be pure TypeScript that touches neither side's globals.
