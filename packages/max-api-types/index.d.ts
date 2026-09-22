// Type declarations for the "max-api" module that Max's [node.script] object provides to the
// Node.js process it runs. Transcribed from https://docs.cycling74.com/apiref/nodeformax/
//
// This is a Node.js API, not the [v8]/[js] one: it goes with @types/node, and must not be
// loaded together with @tsln/max-types, which declares globals of the same names.

declare module "max-api" {
  // ---- values ----

  /** A single Max atom, as they arrive in a list or a message. */
  type Atom = string | number;

  type JSONPrimitive = string | number | boolean | null;
  type JSONArray = JSONValue[];
  interface JSONObject {
    [key: string]: JSONValue | undefined;
  }
  type JSONValue = JSONPrimitive | JSONArray | JSONObject;

  /** What post() accepts: atoms, a list of atoms, or something JSON-like. */
  type Anything = string | number | Atom[] | JSONObject | JSONArray;

  // ---- constants ----
  //
  // The reference presents these as enums; at runtime they are plain objects of strings,
  // which is how they are declared here so that the strings themselves can be used too.

  /** Values Node for Max sets `process.env.MAX_ENV` to. */
  const MAX_ENV: {
    /** node.script running from within Max */
    readonly MAX: "max";
    /** node.script running from within Max for Live */
    readonly MAX_FOR_LIVE: "maxforlive";
    /** node.script running from within a standalone application */
    readonly STANDALONE: "max:standalone";
  };
  type MaxEnv = (typeof MAX_ENV)[keyof typeof MAX_ENV];

  /** The predefined selectors a handler can be registered for. */
  const MESSAGE_TYPES: {
    /** Every message, after the more specific handlers */
    readonly ALL: "all";
    /** A bang */
    readonly BANG: "bang";
    /** A dictionary */
    readonly DICT: "dict";
    /** A list (a message starting with a number) */
    readonly LIST: "list";
    /** A single number */
    readonly NUMBER: "number";
  };
  type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

  /** Log levels for post(), given as its last argument. */
  const POST_LEVELS: {
    readonly ERROR: "error";
    readonly INFO: "info";
    readonly WARN: "warn";
  };
  type PostLevel = (typeof POST_LEVELS)[keyof typeof POST_LEVELS];

  // ---- handlers ----

  /** What a handler receives for each predefined selector. */
  interface MessageHandlers {
    /**
     * Called for every message, after any more specific handler. `handled` says whether
     * another handler already took the message; the rest is the message as received.
     */
    all: (handled: boolean, ...args: any[]) => void;
    bang: () => void;
    /** The dictionary's contents. */
    dict: (dict: JSONObject) => void;
    /** The elements of the list. */
    list: (...values: Atom[]) => void;
    number: (value: number) => void;
  }

  /** A handler for a message of the script's own, `selector arg1 arg2 ...`. */
  type AnyHandler = (...args: any[]) => void;

  /** Either a predefined selector or a message name of the script's own. */
  type MaxFunctionSelector = MessageType | (string & {});

  /** The handler type for a selector: typed for the predefined ones, open for the rest. */
  type MaxFunctionHandler<S extends string = string> = S extends keyof MessageHandlers
    ? MessageHandlers[S]
    : AnyHandler;

  /** Handlers by selector, as addHandlers() takes them. */
  interface HandlerMap extends Partial<MessageHandlers> {
    [selector: string]: AnyHandler | undefined;
  }

  /**
   * Registers a handler for a selector: a predefined MESSAGE_TYPES value, or the first
   * word of a message of the script's own.
   * @example
   * maxAPI.addHandler("list", (...values) => maxAPI.outlet(values.length));
   * maxAPI.addHandler("gain", (db: number) => { ... });
   */
  function addHandler<S extends string>(selector: S, handler: MaxFunctionHandler<S>): void;

  /**
   * Registers several handlers at once, keyed by selector.
   * @example
   * maxAPI.addHandlers({
   *   bang: () => maxAPI.outletBang(),
   *   [maxAPI.MESSAGE_TYPES.ALL]: (handled, ...args) => { if (!handled) maxAPI.post(args); },
   * });
   */
  function addHandlers(handlers: HandlerMap): void;

  /** Removes one handler previously registered for the selector. */
  function removeHandler<S extends string>(selector: S, handler: MaxFunctionHandler<S>): void;

  /** Removes every handler registered for the selector. */
  function removeHandlers(selector: MaxFunctionSelector): void;

  // ---- output ----

  /**
   * Sends the values out of the [node.script] outlet: atoms as a message or list, arrays
   * and objects as a dictionary. Resolves once Max has received them.
   */
  function outlet(...args: JSONValue[]): Promise<void>;

  /** Sends a bang out of the [node.script] outlet. */
  function outletBang(): Promise<void>;

  /**
   * Posts to the Max console. A POST_LEVELS value as the last argument sets the level.
   * @example
   * maxAPI.post("something went wrong", maxAPI.POST_LEVELS.ERROR);
   */
  function post(...args: (Anything | PostLevel)[]): Promise<void>;

  // ---- dictionaries ----

  /** Reads the contents of the named [dict]. */
  function getDict(id: string): Promise<JSONObject>;

  /** Replaces the contents of the named [dict], and resolves with the new contents. */
  function setDict(id: string, dict: JSONObject): Promise<JSONObject>;

  /**
   * Sets one value in the named [dict] at a path such as `"a.b.c"` or `"items[2]"`, and
   * resolves with the whole new contents.
   */
  function updateDict(id: string, updatePath: string, updateValue: JSONValue): Promise<JSONObject>;

  global {
    namespace NodeJS {
      interface ProcessEnv {
        /** Set by Node for Max to say what the script is running inside; see MAX_ENV. */
        MAX_ENV?: MaxEnv;
      }
    }
  }
}
