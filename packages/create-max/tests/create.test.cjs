// Scaffolds projects into a temporary folder and checks what comes out. Run with `pnpm test`.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const CLI = path.join(__dirname, "..", "index.mjs");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "create-max-"));

(async () => {
  const { create } = await import(`file://${CLI}`);

  // [v8] only
  const v8 = create({ dir: path.join(tmp, "My Device"), node: false });
  assert.equal(v8.name, "my-device");
  for (const file of [
    "package.json",
    "tsconfig.json",
    "build.mjs",
    "biome.jsonc",
    ".gitignore",
    "README.md",
    "src/device.ts",
  ]) {
    assert.ok(fs.existsSync(path.join(v8.target, file)), `${file} is created`);
  }
  assert.ok(!fs.existsSync(path.join(v8.target, "node")), "no node/ folder without --node");
  assert.ok(!fs.existsSync(path.join(v8.target, "_gitignore")), "_gitignore is renamed");

  const manifest = JSON.parse(fs.readFileSync(path.join(v8.target, "package.json"), "utf8"));
  assert.equal(manifest.name, "my-device");
  assert.equal(manifest.private, true);
  assert.deepEqual(Object.keys(manifest.scripts), [
    "build",
    "watch",
    "typecheck",
    "lint",
    "format",
  ]);
  assert.deepEqual(Object.keys(manifest.devDependencies), [
    "@biomejs/biome",
    "@tsln/console",
    "@tsln/live-object",
    "@tsln/lom-types",
    "@tsln/max-types",
    "@tsln/timers",
    "esbuild",
    "typescript",
  ]);
  for (const [name, range] of Object.entries(manifest.devDependencies)) {
    assert.match(range, /^[\^~]?\d/, `${name} has a real version range, not ${range}`);
  }

  // with the [node.script] folder
  const both = create({ dir: path.join(tmp, "both"), node: true });
  for (const file of [
    "node/package.json",
    "node/tsconfig.json",
    "node/script.ts",
    "README-node.md",
  ]) {
    assert.ok(fs.existsSync(path.join(both.target, file)), `${file} is created`);
  }
  const nodeManifest = JSON.parse(fs.readFileSync(path.join(both.target, "package.json"), "utf8"));
  assert.ok("@tsln/max-api-types" in nodeManifest.devDependencies);
  assert.ok("@types/node" in nodeManifest.devDependencies);
  assert.equal(nodeManifest.scripts.typecheck, "tsc --noEmit && tsc -p node --noEmit");
  assert.equal(nodeManifest.scripts["watch:node"], "tsc -p node --watch");
  const inner = JSON.parse(fs.readFileSync(path.join(both.target, "node/package.json"), "utf8"));
  assert.equal(inner.private, true);

  // refuses a non-empty directory
  assert.throws(() => create({ dir: both.target, node: false }), /not empty/);

  // the command line: flags, and no prompts when there is no terminal
  const out = execFileSync(process.execPath, [CLI, path.join(tmp, "cli"), "--no-node"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert.match(out, /Created cli in/);
  assert.match(out, /npm install/);
  assert.ok(fs.existsSync(path.join(tmp, "cli", "src", "device.ts")));
  assert.ok(!fs.existsSync(path.join(tmp, "cli", "node")));

  const help = execFileSync(process.execPath, [CLI, "--help"], { encoding: "utf8" });
  assert.match(help, /^Usage: npm create @tsln\/max/);

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("create-max: all assertions passed");
})().catch((error) => {
  console.error(error);
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(1);
});
