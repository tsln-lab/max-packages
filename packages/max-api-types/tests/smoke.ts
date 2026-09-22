// Type-level smoke test: a [node.script] script written against the declarations must
// compile. Nothing here runs; the test fails when the file stops type-checking.

import maxAPI = require("max-api");

type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Expect<T extends true> = T;

// ---- handlers: the predefined selectors are typed, the rest are open ----

maxAPI.addHandler("bang", () => maxAPI.outletBang());
maxAPI.addHandler(maxAPI.MESSAGE_TYPES.BANG, () => {});

maxAPI.addHandler("number", (value) => {
  type _value = Expect<Eq<typeof value, number>>;
});

maxAPI.addHandler("list", (...values) => {
  type _values = Expect<Eq<typeof values, (string | number)[]>>;
  maxAPI.outlet(values.length);
});

maxAPI.addHandler("dict", (dict) => {
  const gain = dict.gain;
  type _gain = Expect<Eq<typeof gain, maxAPI.JSONValue | undefined>>;
});

maxAPI.addHandler(maxAPI.MESSAGE_TYPES.ALL, (handled, ...args) => {
  type _handled = Expect<Eq<typeof handled, boolean>>;
  if (!handled) maxAPI.post("unhandled", args.length, maxAPI.POST_LEVELS.WARN);
});

maxAPI.addHandler("gain", (db: number, channel?: string) => {
  maxAPI.post(db, channel ?? "all");
});

maxAPI.addHandlers({
  bang: () => {},
  number: (value) => {
    type _value = Expect<Eq<typeof value, number>>;
  },
  [maxAPI.MESSAGE_TYPES.LIST]: (...values) => {
    type _values = Expect<Eq<typeof values, (string | number)[]>>;
  },
  [maxAPI.MESSAGE_TYPES.ALL]: (handled) => {
    type _handled = Expect<Eq<typeof handled, boolean>>;
  },
  reset: () => {},
  gain: (db: number) => {
    maxAPI.post(db);
  },
});

const onBang = () => {};
maxAPI.removeHandler("bang", onBang);
maxAPI.removeHandlers("gain");
maxAPI.removeHandlers(maxAPI.MESSAGE_TYPES.ALL);

// @ts-expect-error a bang handler takes no arguments
maxAPI.addHandler("bang", (_value: number) => {});
// @ts-expect-error a number handler gets a number
maxAPI.addHandler("number", (_value: string) => {});
// @ts-expect-error a list handler gets atoms, not a dictionary
maxAPI.addHandler("list", (_dict: { gain: number }) => {});
maxAPI.addHandlers({
  // @ts-expect-error a bang handler takes no arguments
  bang: (_value: number) => {},
});

// ---- output and dictionaries ----

async function run() {
  await maxAPI.outlet("ready", 1, 2.5);
  await maxAPI.outlet({ gain: 0.5, names: ["L", "R"] });
  await maxAPI.post("hello", ["a", 1], { nested: true });
  await maxAPI.post("careful", maxAPI.POST_LEVELS.WARN);

  const settings = await maxAPI.getDict("settings");
  type _settings = Expect<Eq<typeof settings, maxAPI.JSONObject>>;
  await maxAPI.setDict("settings", { gain: 0.5 });
  await maxAPI.updateDict("settings", "routing.left", 2);

  // @ts-expect-error a function is not a JSON value
  await maxAPI.outlet(() => {});
}
run();

// ---- environment ----

const env = process.env.MAX_ENV;
type _env = Expect<Eq<typeof env, "max" | "maxforlive" | "max:standalone" | undefined>>;
if (env === maxAPI.MAX_ENV.MAX_FOR_LIVE) maxAPI.post("in Live");

// The Node globals are what they are in Node: Buffer is Node's, not the Max [v8] one.
const bytes: Buffer = Buffer.from("abc");
export const _checked = { bytes };
