// Type-level smoke test: a [jweb] page written against the declarations must compile. Nothing
// here runs; the test fails when the file stops type-checking. The tsconfig includes both
// entries: the types come from the module, by the package's own name, and `max` from global.d.ts.

import type { JitterMatrixType, MaxDict } from "@tsln/jweb-types";

type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Expect<T extends true> = T;

// ---- messages in and out ----

if ("max" in window) {
  window.max.bindInlet("level", (value: number) => {
    document.title = String(value);
  });
  max.outlet("ready");
  max.outlet("level", 0.5, "db");
  const values: (string | number)[] = ["set", 1, 2];
  max.outlet(...(values as [string, ...(string | number)[]]));
}

// @ts-expect-error a message starts with a number or a word
max.outlet({ gain: 1 });

// ---- dictionaries ----

max.getDict("settings", (dict) => {
  type _dict = Expect<Eq<typeof dict, MaxDict | undefined>>;
  if (!dict) return;
  const nested: MaxDict = { gain: 0.5, name: "a", list: [1, "two", [3], { four: 4 }] };
  max.setDict("settings", { ...dict, nested });
});

// @ts-expect-error a dictionary holds numbers, strings, arrays and dictionaries
max.setDict("settings", { on: true });

// ---- Jitter ----

max.getJitterMatrix("frame", (matrix) => {
  if (!matrix) return;
  if (matrix.type === "float32") {
    type _data = Expect<Eq<typeof matrix.data, Float32Array<ArrayBuffer>>>;
  }
  max.setJitterMatrix("copy", matrix);
});

max.setJitterMatrix("made", {
  type: "char",
  planecount: 4,
  dim: [2, 2],
  data: new Uint8Array(16),
});

// @ts-expect-error the data has to match the type
max.setJitterMatrix("wrong", { type: "long", planecount: 1, dim: [4], data: new Float32Array(4) });

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d")!;

max.bindJitterImage(
  (image) => {
    context.putImageData(new ImageData(image.data, image.width, image.height), 0, 0);
    if (image.dropped > 0) console.warn(`dropped ${image.dropped} of ${image.received}`);
  },
  { queue: 2, drop: "oldest" },
);

max.bindJitterMatrix((matrix) => {
  const type: JitterMatrixType = matrix.type;
  console.log(type, matrix.dim, matrix.seq, matrix.timestamp);
});
