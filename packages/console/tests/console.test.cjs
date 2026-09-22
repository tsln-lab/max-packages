// Runs the built dist/index.js under Node with Max's globals stubbed, and checks what each
// console method posts. Run with `pnpm test` after `pnpm build`.
const assert = require("node:assert/strict");
const path = require("node:path");

const posted = [];
globalThis.post = (...args) => posted.push(["post", args.join("")]);
globalThis.error = (...args) => posted.push(["error", args.join("")]);
globalThis.File = class {
  constructor() {
    this.isopen = false;
  }
};
const nodeConsole = globalThis.console;
delete globalThis.console; // start without one, as Max may

const con = require(path.join(__dirname, "..", "dist", "index.js"));
const last = () => posted[posted.length - 1];
const take = () => posted.splice(0);

// callable module and the log/error names
con("plain", 1, { a: [1, 2] });
assert.deepEqual(last(), ["post", "plain 1 { a: [1, 2] }\n"]);
con.log("via log");
assert.deepEqual(last(), ["post", "via log\n"]);
con.error("bad", 3);
assert.deepEqual(last(), ["error", "bad 3\n"]);
assert.equal(typeof con.inspect, "function");
assert.equal(typeof con.logToFile, "function");

// levels
con.info("i");
assert.deepEqual(last(), ["post", "i\n"]);
con.debug("d");
assert.deepEqual(last(), ["post", "d\n"]);
con.warn("careful", { x: 1 });
assert.deepEqual(last(), ["post", "warning: careful { x: 1 }\n"]);

// format strings
con.log("%s has %d items (%f) %o %j %% %c!", "list", 3.7, 1.5, { a: 1 }, [1], "color: red", "tail");
assert.deepEqual(last(), ["post", "list has 3 items (1.5) { a: 1 } [1] % ! tail\n"]);
con.log("%d left over", 1, "extra");
assert.deepEqual(last(), ["post", "1 left over extra\n"]);
con.log("no args for %s");
assert.deepEqual(last(), ["post", "no args for %s\n"]);
con.log("100% sure");
assert.deepEqual(last(), ["post", "100% sure\n"]);

// inspect
const circular = { name: "loop" };
circular.self = circular;
assert.equal(con.inspect(circular), '{ name: "loop", self: [Circular] }');
assert.equal(con.inspect(new Map([["k", new Set([1])]])), 'Map(1) { "k" => Set(1) { 1 } }');
assert.equal(con.inspect(new Error("boom")), "Error: boom");
assert.equal(
  con.inspect(() => {}),
  "[Function anonymous]",
);

// assert
take();
con.assert(true, "never");
assert.equal(posted.length, 0);
con.assert(false);
assert.deepEqual(last(), ["error", "Assertion failed\n"]);
con.assert(0, "x is", 0);
assert.deepEqual(last(), ["error", "Assertion failed: x is 0\n"]);

// trace
con.trace("here");
assert.equal(last()[0], "error");
assert.match(last()[1], /^here\n {4}at /);

// dir and table
con.dir({ a: { b: { c: { d: { e: 1 } } } } }, { depth: 6 });
assert.deepEqual(last(), ["post", "{ a: { b: { c: { d: { e: 1 } } } } }\n"]);
con.log({ a: { b: { c: { d: { e: 1 } } } } });
assert.deepEqual(last(), ["post", "{ a: { b: { c: [Object] } } }\n"]);
con.table([{ a: 1 }]);
assert.deepEqual(last(), ["post", "[{ a: 1 }]\n"]);

// groups
take();
con.group("Outer");
con.log("one");
con.groupCollapsed();
con.log("two");
con.groupEnd();
con.groupEnd();
con.groupEnd(); // an extra end is harmless
con.log("three");
assert.deepEqual(
  take().map(([, t]) => t),
  ["Outer\n", "  one\n", "    two\n", "three\n"],
);

// count
con.count();
con.count();
con.count("x");
con.countReset();
con.count();
assert.deepEqual(
  take().map(([, t]) => t),
  ["default: 1\n", "default: 2\n", "x: 1\n", "default: 1\n"],
);

// timers
con.time("t");
con.time("t");
assert.deepEqual(last(), ["post", "warning: Timer 't' already exists\n"]);
con.timeLog("t", "checkpoint");
assert.match(last()[1], /^t: \d+ ms checkpoint\n$/);
con.timeEnd("t");
assert.match(last()[1], /^t: \d+ ms\n$/);
con.timeEnd("t");
assert.deepEqual(last(), ["post", "warning: Timer 't' does not exist\n"]);
con.clear();

// install: creates console when there is none
con.install();
assert.equal(typeof globalThis.console.log, "function");
assert.equal(globalThis.console.error, con.error);
globalThis.console.log("global %s", "works");
assert.deepEqual(last(), ["post", "global works\n"]);

// install: fills in only what an existing console lacks
const own = (...a) => posted.push(["own", a.join(" ")]);
globalThis.console = { log: own };
con.install();
assert.equal(globalThis.console.log, own);
assert.equal(globalThis.console.warn, con.warn);
assert.equal(globalThis.console.time, con.time);

globalThis.console = nodeConsole;
console.log("console: all assertions passed");
