// Type-level test of the main entry on its own: what it exports can be imported, and none of it,
// least of all `max`, is global. Nothing here runs.

import type { JitterMatrix, MaxBridge, MaxDict } from "@tsln/jweb-types";

const dict: MaxDict = { gain: 0.5 };
declare const bridge: MaxBridge;
bridge.setDict("settings", dict);
bridge.getJitterMatrix("frame", (matrix: JitterMatrix | null) => matrix);

// @ts-expect-error `max` is declared by @tsln/jweb-types/global, not by the main entry
window.max.outlet("ready");

// @ts-expect-error nor as a variable
max.outlet("ready");
