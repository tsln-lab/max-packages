// Type definitions for the MaxBridge API: `window.max`, which Max's [jweb] object gives the web
// pages it loads.
// Transcribed from https://docs.cycling74.com/apiref/jweb/
//
// A module: the types of the bridge and of what passes through it, for `import type` from any
// program, a [jweb] page's or one shared with other contexts. Nothing here is global. The
// global itself, `max` on `Window` and as a variable, is in global.d.ts
// ("@tsln/jweb-types/global"), which a [jweb] page's tsconfig lists in `types`. That one
// clashes with @tsln/max-types, which declares a `max` of its own for [v8], so the two don't
// share a program; this one clashes with nothing.

// ==== values ====

/**
 * A Max dictionary as JavaScript sees it: string keys, and values that are numbers, strings,
 * arrays or dictionaries.
 * @see https://docs.cycling74.com/apiref/jweb/maxdict/
 */
export type MaxDict = { [key: string]: number | string | MaxArray | MaxDict };

/**
 * An array in a Max dictionary: numbers, strings, arrays and dictionaries.
 * @see https://docs.cycling74.com/apiref/jweb/maxarray/
 */
export type MaxArray = Array<number | string | MaxArray | MaxDict>;

/**
 * A Jitter matrix. `data` is a typed array that matches `type`, over a plain ArrayBuffer, so it
 * can go straight to DOM APIs that refuse a SharedArrayBuffer.
 * @see https://docs.cycling74.com/apiref/jweb/jittermatrix/
 */
export type JitterMatrix =
  | { type: "char"; planecount: number; dim: number[]; data: Uint8Array<ArrayBuffer> }
  | { type: "long"; planecount: number; dim: number[]; data: Int32Array<ArrayBuffer> }
  | { type: "float32"; planecount: number; dim: number[]; data: Float32Array<ArrayBuffer> }
  | { type: "float64"; planecount: number; dim: number[]; data: Float64Array<ArrayBuffer> };

/**
 * The values the `type` of a JitterMatrix takes.
 * @see https://docs.cycling74.com/apiref/jweb/jittermatrixtype/
 */
export type JitterMatrixType = JitterMatrix["type"];

/**
 * A Jitter matrix as an image: RGBA pixels, already swizzled from Jitter's ARGB, ready for a
 * canvas or WebGL.
 * @see https://docs.cycling74.com/apiref/jweb/jitterimage/
 */
export type JitterImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray<ArrayBuffer>;
};

/**
 * What comes with each streamed matrix or image.
 * @see https://docs.cycling74.com/apiref/jweb/streamingmetadata/
 */
export type StreamingMetadata = {
  /** The time the frame was sent. */
  timestamp: number;
  /** The frame's number in the stream. */
  seq: number;
  /** How many frames have been received. */
  received: number;
  /** How many frames have been dropped. */
  dropped: number;
};

/**
 * How frames are queued while the page is busy.
 *
 * The reference has both fields required; they are optional here, as the options themselves
 * are, until it is known whether Max fills in the one left out.
 * @see https://docs.cycling74.com/apiref/jweb/streamingoptions/
 */
export type StreamingOptions = {
  /** How many frames the queue holds. */
  queue?: number;
  /** Which frame goes when the queue is full. */
  drop?: "oldest" | "newest";
};

// ==== the bridge ====

/**
 * What a page loaded in [jweb] has to talk to Max with.
 * @see https://docs.cycling74.com/apiref/jweb/maxbridge/
 */
export interface MaxBridge {
  /**
   * Calls `callback` with the arguments of each `message` that arrives at the [jweb] inlet: for
   * `level 0.5` bound as "level", with 0.5.
   */
  bindInlet(message: string, callback: (...args: any[]) => void): void;

  /**
   * Calls `callback` with each Jitter matrix sent to [jweb] as `jit_matrix`, as an image.
   * Frames are queued as they arrive and handed over asynchronously.
   */
  bindJitterImage(
    callback: (image: JitterImage & StreamingMetadata) => void,
    opts?: StreamingOptions,
  ): void;

  /**
   * Calls `callback` with each Jitter matrix sent to [jweb] as `jit_matrix`. Frames are queued
   * as they arrive and handed over asynchronously.
   */
  bindJitterMatrix(
    callback: (matrix: JitterMatrix & StreamingMetadata) => void,
    opts?: StreamingOptions,
  ): void;

  /** Gets a named dictionary from Max, and calls `callback` with it. */
  getDict(name: string, callback: (dict: MaxDict | undefined) => void): void;

  /**
   * Gets a named Jitter matrix from Max, and calls `callback` with it: null if there is no
   * matrix of that name, it has no data, or its type is not one of JitterMatrixType.
   */
  getJitterMatrix(name: string, callback: (matrix: JitterMatrix | null) => void): void;

  /**
   * Sends a message out of the [jweb] outlet: `outlet("level", 0.5)`. For a message held in an
   * array, `outlet(...values)`.
   */
  outlet(initial: number | string, ...args: (number | string)[]): void;

  /**
   * Replaces a named dictionary in Max. To change one key, getDict(), change it, and
   * setDict() the whole.
   */
  setDict(name: string, dict: MaxDict): void;

  /** Sets a named Jitter matrix in Max. Only from the page itself, not from an iframe in it. */
  setJitterMatrix(name: string, matrix: JitterMatrix): void;
}
