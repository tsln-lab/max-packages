#!/usr/bin/env node
// Scaffolds a project for Max scripts written in TypeScript:
//
//   npm create @tsln/max my-device            # asks whether to add a [node.script] folder
//   npm create @tsln/max my-device -- --node  # adds it without asking
//   npm create @tsln/max my-device -- --no-node
//
// The [v8] template is copied from template/, the [node.script] folder from template-node/,
// and package.json is written here with the dependency versions this package was released with.

import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OWN = JSON.parse(fs.readFileSync(path.join(HERE, "package.json"), "utf8"));

// Dependencies of the generated project, taken from this package's own dev dependencies so
// that a release of this package pins the package versions it was tested with.
const V8_DEPENDENCIES = [
  "@biomejs/biome",
  "@tsln/console",
  "@tsln/live-object",
  "@tsln/lom-types",
  "@tsln/max-types",
  "@tsln/timers",
  "esbuild",
  "typescript",
];
const NODE_DEPENDENCIES = ["@tsln/max-api-types", "@types/node"];

// Files whose real names npm would strip from the published template.
const RENAMES = {
  _gitignore: ".gitignore",
  "_package.json": "package.json",
  "_biome.jsonc": "biome.jsonc",
};

function usage() {
  return `Usage: npm create @tsln/max <directory> [-- --node | --no-node]

Creates a TypeScript project for Max [v8] scripts in <directory>, set up with the @tsln
packages and an esbuild build. With --node it also gets a node/ folder for [node.script].`;
}

function versionOf(name) {
  const range = OWN.devDependencies?.[name];
  if (!range) throw new Error(`${name} is not a dependency of ${OWN.name}`);
  if (!range.startsWith("workspace:")) return range;
  // an unpublished checkout: read the version from the workspace package itself
  const dir = name.split("/").pop();
  const manifest = JSON.parse(fs.readFileSync(path.join(HERE, "..", dir, "package.json"), "utf8"));
  return `^${manifest.version}`;
}

function projectName(dir) {
  const base = path.basename(path.resolve(dir)).toLowerCase();
  const name = base.replace(/[^a-z0-9._-]+/g, "-").replace(/^[-._]+|[-._]+$/g, "");
  return name || "max-project";
}

function manifest(name, node) {
  const devDependencies = {};
  for (const dep of [...V8_DEPENDENCIES, ...(node ? NODE_DEPENDENCIES : [])].sort()) {
    devDependencies[dep] = versionOf(dep);
  }
  return {
    name,
    private: true,
    description: "Max scripts written in TypeScript",
    scripts: {
      build: "node build.mjs",
      watch: "node build.mjs --watch",
      ...(node ? { "build:node": "tsc -p node", "watch:node": "tsc -p node --watch" } : {}),
      typecheck: node ? "tsc --noEmit && tsc -p node --noEmit" : "tsc --noEmit",
      lint: "biome check .",
      format: "biome check --write .",
    },
    devDependencies,
  };
}

function copyTemplate(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, RENAMES[entry.name] ?? entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(target, { recursive: true });
      copyTemplate(source, target);
    } else {
      fs.copyFileSync(source, target);
    }
  }
}

function packageManager() {
  const agent = process.env.npm_config_user_agent ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";
  return "npm";
}

/** Creates the project; exported for the tests, which pass their answers instead of asking. */
export function create({ dir, node }) {
  const target = path.resolve(dir);
  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    throw new Error(`${target} exists and is not empty`);
  }
  fs.mkdirSync(target, { recursive: true });

  copyTemplate(path.join(HERE, "template"), target);
  if (node) copyTemplate(path.join(HERE, "template-node"), target);

  const name = projectName(target);
  fs.writeFileSync(
    path.join(target, "package.json"),
    `${JSON.stringify(manifest(name, node), null, 2)}\n`,
  );
  return { target, name };
}

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      node: { type: "boolean" },
      "no-node": { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });
  if (values.help) {
    console.log(usage());
    return;
  }

  const interactive = process.stdin.isTTY && process.stdout.isTTY;
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  const ask = async (question, fallback) => {
    if (!rl) return fallback;
    const answer = (await rl.question(question)).trim();
    return answer || fallback;
  };

  try {
    let dir = positionals[0];
    if (!dir) {
      dir = await ask("Project directory: ", "");
      if (!dir) throw new Error(`a project directory is needed\n\n${usage()}`);
    }

    let node = values.node ? true : values["no-node"] ? false : null;
    if (node === null) {
      const answer = await ask("Add a node/ folder for [node.script] scripts? (y/N) ", "n");
      node = /^y/i.test(answer);
    }

    const { target, name } = create({ dir, node });
    const pm = packageManager();
    const run = pm === "npm" ? "npm run" : pm;
    console.log(`
Created ${name} in ${target}

  cd ${path.relative(process.cwd(), target) || "."}
  ${pm} install
  ${run} watch          # compiles src/*.ts to js/ and keeps going${
    node ? `\n  ${run} watch:node     # compiles node/*.ts in place` : ""
  }

Then add the project's js/ folder to Max's search path (Options > File Preferences),
or keep patchers next to the compiled scripts, and use [v8 device.js].
`);
  } finally {
    rl?.close();
  }
}

// Run as a command; import as a module (the tests do) without running.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
