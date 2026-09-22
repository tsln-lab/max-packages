// Type-level smoke test. Nothing here runs; the test fails when the file stops type-checking.

import timers = require("../src/index");

type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Expect<T extends true> = T;

const id = timers.setTimeout((name: string, count: number) => post(name, count), 50, "x", 1);
type _id = Expect<Eq<typeof id, number>>;
timers.clearTimeout(id);
timers.clearTimeout(undefined);

const interval = timers.setInterval(() => {}, 100);
timers.clearInterval(interval);
timers.clearAll();
timers.install();

// @ts-expect-error the extra arguments must match the callback's parameters
timers.setTimeout((name: string) => post(name), 50, 1);
