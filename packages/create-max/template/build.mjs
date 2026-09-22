// Compiles every script in src/ to a file of the same name in js/, which is what Max loads.
//
//   node build.mjs           # once
//   node build.mjs --watch   # on every change; autowatch in the script reloads it in Max
//
// Each script is bundled with everything it imports, so scripts can use the @tsln packages
// and any other npm package that sticks to the language (no Node built-ins, no DOM), and
// nothing has to be copied to where Max can find it. Files in subfolders of src/ are modules
// for the scripts to import, not scripts of their own.
//
// A script must not `export` anything (a type included): that makes esbuild treat it as a
// module and add a `module.exports` line, and a top-level [v8] script has no `module`.

import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "js");

const entryPoints = fs
  .readdirSync(SRC)
  .filter((name) => /\.tsx?$/.test(name) && !name.endsWith(".d.ts"))
  .map((name) => path.join(SRC, name));

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints,
  outdir: OUT,
  bundle: true,
  format: "cjs",
  // neither Node nor a browser; "browser" picks the builds of packages that don't reach for fs
  platform: "neutral",
  conditions: ["browser"],
  mainFields: ["main", "module"],
  target: "es2022",
  // Max calls bang(), msg_int() and the other handlers by name from outside the file, so
  // nothing in the file references them and tree shaking would remove them
  treeShaking: false,
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const context = await esbuild.context(options);
  await context.watch();
  console.log(`watching ${path.relative(ROOT, SRC)}/`);
} else {
  await esbuild.build(options);
}
