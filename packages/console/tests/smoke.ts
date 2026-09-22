// Type-level smoke test: the module has to be usable both as `console` and as `log`.
// Nothing here runs; the test fails when the file stops type-checking.

import console = require("../src/index");

console("callable", 1);
console.log("tracks:", [1, 2]);
console.log("%d of %d", 1, 2);
console.info("i");
console.debug("d");
console.warn("w", { a: 1 });
console.error("e", new Error("boom"));
console.assert(1 > 0, "never");
console.trace("here");
console.dir({ deep: { deeper: {} } }, { depth: 6, maxItems: 10 });
console.table([{ a: 1 }]);
console.group("Outer");
console.groupCollapsed();
console.groupEnd();
console.count();
console.count("x");
console.countReset("x");
console.time("t");
console.timeLog("t", "checkpoint");
console.timeEnd("t");
console.clear();
console.logToFile("C:/tmp/max.log");
console.logToFile(null);
const text: string = console.inspect({ a: [1, 2] }, { depth: 1 });
console.install();

// @ts-expect-error dir takes inspect options, not a depth number
console.dir({}, 6);

export const _checked = { text };
