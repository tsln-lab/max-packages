/// <reference types="@tsln/max-types" preserve="true" />

// setTimeout and its relatives, which [v8] does not have, built on Max's Task.
//
//   import timers = require("./vendor/timers");
//   const id = timers.setTimeout(redraw, 50);
//   timers.clearTimeout(id);
//
// A bundled npm package looks for them as globals instead, which install() makes them:
//
//   timers.install();
//   import thing = require("./vendor/thing");
//
// They behave as they do anywhere else, give or take Max's scheduler: a Task runs in the
// low-priority queue, so a delay is a minimum rather than a promise, and 0 means "next tick".

type Callback<A extends unknown[]> = (...args: A) => void;

// the Tasks still waiting to run, by the id handed back for them
const pending: Record<number, Task> = {};
let last = 0;

function delay(ms: unknown): number {
  return Math.max(0, Number(ms) || 0);
}

/** Stops a timer and hands its Task back to Max, which does not collect one on its own. */
function release(id: unknown) {
  const task = pending[id as number];
  if (!task) {
    return;
  }
  delete pending[id as number];
  task.cancel();
  task.freepeer();
}

function setTimeout<A extends unknown[]>(fn: Callback<A>, ms?: number, ...args: A): number {
  const id = ++last;
  // Arguments passed through Task are converted to Max atoms, which turns objects into null,
  // so they are captured in the closure instead.
  const task = new Task(() => {
    // released first, so that a callback that throws does not leave its Task behind
    release(id);
    fn(...args);
  });
  pending[id] = task;
  task.schedule(delay(ms));
  return id;
}

function setInterval<A extends unknown[]>(fn: Callback<A>, ms?: number, ...args: A): number {
  const id = ++last;
  // at least a millisecond apart, or an interval of 0 would starve everything else in the queue
  const wait = Math.max(1, delay(ms));
  const task = new Task(() => {
    // scheduled again before the callback runs, so the callback can clear its own interval
    task.schedule(wait);
    fn(...args);
  });
  pending[id] = task;
  task.schedule(wait);
  return id;
}

/** Clears either kind of timer, as in a browser, where the two share their ids. */
function clearTimeout(id?: number) {
  release(id);
}

/** Stops everything still waiting. Worth calling from notifydeleted(), or Tasks outlive the script. */
function clearAll() {
  Object.keys(pending).forEach(release);
}

/**
 * Makes the timers global, for code that expects to find them there. Whatever is already
 * defined is left alone, so this does nothing under node or in a Max that grows its own.
 */
function install() {
  const target = globalThis as Record<string, unknown>;
  const globals = { setTimeout, clearTimeout, setInterval, clearInterval: clearTimeout };
  for (const [name, fn] of Object.entries(globals)) {
    if (typeof target[name] !== "function") {
      target[name] = fn;
    }
  }
}

export = {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval: clearTimeout,
  clearAll,
  install,
};
