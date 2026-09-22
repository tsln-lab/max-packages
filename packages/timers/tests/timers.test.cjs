// Runs the built dist/index.js under Node with Max's Task stubbed on Node's own timers, and
// checks that the timers fire, clear and install as they should. Run with `pnpm test` after
// `pnpm build`.
const assert = require("node:assert/strict");
const path = require("node:path");

const nodeTimers = {
  setTimeout: globalThis.setTimeout,
  clearTimeout: globalThis.clearTimeout,
};
let live = 0; // Tasks not yet freed, to check that nothing leaks

globalThis.Task = class {
  constructor(fn) {
    this.fn = fn;
    this.handle = null;
    live++;
  }
  schedule(ms) {
    this.cancel();
    this.handle = nodeTimers.setTimeout(() => {
      this.handle = null;
      this.fn();
    }, ms);
  }
  cancel() {
    if (this.handle) nodeTimers.clearTimeout(this.handle);
    this.handle = null;
  }
  freepeer() {
    this.cancel();
    live--;
  }
};

const timers = require(path.join(__dirname, "..", "dist", "index.js"));
const wait = (ms) => new Promise((resolve) => nodeTimers.setTimeout(resolve, ms));

(async () => {
  // setTimeout fires once, with its arguments, and frees its Task
  const calls = [];
  const id = timers.setTimeout((a, b) => calls.push([a, b]), 10, "x", { y: 1 });
  assert.equal(typeof id, "number");
  await wait(30);
  assert.deepEqual(calls, [["x", { y: 1 }]]);
  assert.equal(live, 0);

  // clearTimeout stops one that has not fired, and clearing again is harmless
  const id2 = timers.setTimeout(() => calls.push("never"), 10);
  timers.clearTimeout(id2);
  timers.clearTimeout(id2);
  timers.clearTimeout(undefined);
  await wait(30);
  assert.equal(calls.length, 1);
  assert.equal(live, 0);

  // ids are distinct and shared between both kinds
  assert.notEqual(id, id2);

  // a timeout whose callback throws still frees its Task: the Task's function is run by
  // hand here, since the stub would let the throw escape into Node's event loop
  const handles = [];
  const scheduled = globalThis.Task.prototype.schedule;
  globalThis.Task.prototype.schedule = function (ms) {
    handles.push(this);
    scheduled.call(this, ms);
  };
  timers.setTimeout(() => {
    throw new Error("boom");
  }, 0);
  globalThis.Task.prototype.schedule = scheduled;
  const thrower = handles.pop();
  thrower.cancel();
  assert.throws(() => thrower.fn(), /boom/);
  assert.equal(live, 0);

  // setInterval repeats, and the callback can clear its own interval
  let ticks = 0;
  const id3 = timers.setInterval(() => {
    ticks++;
    if (ticks === 3) timers.clearInterval(id3);
  }, 5);
  await wait(60);
  assert.equal(ticks, 3);
  assert.equal(live, 0);

  // an interval of 0 still runs at least a millisecond apart
  let fast = 0;
  const id4 = timers.setInterval(() => fast++, 0);
  await wait(20);
  timers.clearTimeout(id4); // clearTimeout clears either kind, as in a browser
  assert.ok(fast > 0 && fast < 30, `interval of 0 ran ${fast} times in 20 ms`);

  // clearAll stops everything still waiting
  timers.setTimeout(() => calls.push("never"), 10);
  timers.setInterval(() => calls.push("never"), 10);
  timers.clearAll();
  await wait(30);
  assert.equal(calls.length, 1);
  assert.equal(live, 0);

  // install adds only what is missing: Node has its own timers, so nothing changes
  timers.install();
  assert.equal(globalThis.setTimeout, nodeTimers.setTimeout);
  delete globalThis.setInterval;
  timers.install();
  assert.equal(globalThis.setInterval, timers.setInterval);
  assert.equal(globalThis.setTimeout, nodeTimers.setTimeout);

  console.log("timers: all assertions passed");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
