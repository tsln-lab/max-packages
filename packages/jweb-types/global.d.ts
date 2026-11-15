// The global of a page loaded in Max's [jweb]: `max`, on `Window` and as a variable.
// Transcribed from https://docs.cycling74.com/apiref/jweb/global-max/
//
// Listed in the `types` of a [jweb] page's tsconfig, as "@tsln/jweb-types/global". It clashes
// with @tsln/max-types, which declares a `max` of its own for [v8], so the two don't share a
// program. The types it refers to are in index.d.ts, imported from "@tsln/jweb-types".

import type { MaxBridge } from "./index.js";

declare global {
  interface Window {
    /**
     * The bridge to Max, there in a page loaded by [jweb] and in no other. Typed as always
     * present: a page that also runs in an ordinary browser checks for it, as in
     * `if ("max" in window)`.
     * @see https://docs.cycling74.com/apiref/jweb/global-max/
     */
    max: MaxBridge;
  }

  /**
   * The bridge to Max, there in a page loaded by [jweb] and in no other.
   * @see https://docs.cycling74.com/apiref/jweb/global-max/
   */
  var max: MaxBridge;
}
