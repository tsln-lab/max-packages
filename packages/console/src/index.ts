/// <reference types="@tsln/max-types" preserve="true" />

// The Max console through the Console API: log, info, warn, error, group, count, time and
// the rest, with values formatted by inspect() and printf-style format strings supported.
//
//   import console = require("./vendor/console");
//   console.log("tracks:", song.tracks);   // tracks: [LiveObject<Track> live_set tracks 0, ...]
//   console.error("no input on", index);
//   console.time("render"); ...; console.timeEnd("render");
//
// The module is also callable as a shorthand for log(), so `import log = require("./vendor/console")`
// and `log("loaded")` work too. A bundled npm package looks for `console` as a global instead,
// which install() provides:
//
//   console.install();
//   import thing = require("./vendor/thing");
//
// Everything can also be written to a file with logToFile().

interface InspectOptions {
  /** How many levels of nested objects and arrays to expand. Default 3. */
  depth?: number;
  /** How many array items or object keys to show before summarizing the rest. Default 50. */
  maxItems?: number;
}

/**
 * Formats any value as readable text for debugging. Unlike JSON.stringify it handles
 * circular references (`[Circular]`), functions, undefined, Map/Set, errors, and
 * summarizes Max and Live objects instead of expanding their internals.
 *
 * @example
 * inspect({ a: 1, list: [1, 2] }); // { a: 1, list: [1, 2] }
 */
function inspect(value: unknown, options: InspectOptions = {}): string {
  const depth = options.depth ?? 3;
  const maxItems = options.maxItems ?? 50;
  // objects on the current path, to detect cycles without flagging shared references
  const ancestors = new Set<object>();

  function format(value: unknown, level: number, quoteStrings: boolean): string {
    switch (typeof value) {
      case "string":
        return quoteStrings ? JSON.stringify(value) : value;
      case "number":
      case "boolean":
      case "undefined":
        return String(value);
      case "bigint":
        return `${value}n`;
      case "symbol":
        return value.toString();
      case "function":
        return `[Function ${value.name || "anonymous"}]`;
    }

    if (value === null) return "null";
    const object = value as any;

    if (ancestors.has(object)) return "[Circular]";

    try {
      const summary = summarize(object);
      if (summary !== undefined) return summary;

      const name = object.constructor?.name;
      const isPlain = !name || name === "Object";

      if (level >= depth) {
        return Array.isArray(object) ? `[Array(${object.length})]` : `[${name || "Object"}]`;
      }

      ancestors.add(object);
      try {
        if (Array.isArray(object)) {
          return `[${joinItems(object, (item) => format(item, level + 1, true))}]`;
        }
        if (object instanceof Map) {
          const entries = joinItems(
            [...object],
            ([k, v]) => `${format(k, level + 1, true)} => ${format(v, level + 1, true)}`,
          );
          return `Map(${object.size}) ${braces(entries)}`;
        }
        if (object instanceof Set) {
          return `Set(${object.size}) ${braces(joinItems([...object], (item) => format(item, level + 1, true)))}`;
        }

        const entries = joinItems(
          Object.keys(object),
          (key) => `${key}: ${format(object[key], level + 1, true)}`,
        );
        return `${isPlain ? "" : `${name} `}${braces(entries)}`;
      } finally {
        ancestors.delete(object);
      }
    } catch (e) {
      return `[unprintable: ${e}]`;
    }
  }

  // Formats up to maxItems items, noting how many were left out.
  function joinItems<T>(items: T[], formatItem: (item: T) => string) {
    const parts = items.slice(0, maxItems).map(formatItem);
    if (items.length > maxItems) parts.push(`... ${items.length - maxItems} more`);
    return parts.join(", ");
  }

  function braces(contents: string) {
    return contents ? `{ ${contents} }` : "{}";
  }

  // One-line descriptions for objects whose fields aren't useful to expand.
  function summarize(object: any): string | undefined {
    if (object instanceof Error) {
      return `${object.name}: ${object.message}`;
    }
    if (object instanceof Date) {
      return object.toISOString();
    }
    if (typeof LiveAPI !== "undefined" && object.api instanceof LiveAPI) {
      // a LiveObject (checked structurally to avoid importing live-object here)
      return Number(object.api.id) === 0
        ? "LiveObject (no object)"
        : `LiveObject<${object.api.type}> ${object.api.unquotedpath}`;
    }
    if (typeof LiveAPI !== "undefined" && object instanceof LiveAPI) {
      return `LiveAPI<${object.type}> ${object.unquotedpath}`;
    }
    if (typeof Dict !== "undefined" && object instanceof Dict) {
      return `Dict "${object.name}" ${object.stringify_compressed()}`;
    }
    if (typeof object.maxclass === "string" && typeof object.getattr === "function") {
      return `Maxobj<${object.maxclass}>${object.varname ? ` "${object.varname}"` : ""}`;
    }
    return undefined;
  }

  return format(value, 0, false);
}

// ---- formatting ----

/**
 * Formats the arguments of a console call as one line: a leading string with format
 * specifiers (%s, %d, %i, %f, %o, %O, %j, %c, %%) consumes the arguments it names, and
 * whatever is left is appended, strings as they are and everything else through inspect().
 */
function formatValues(values: unknown[]): string {
  const rest = [...values];
  const parts: string[] = [];

  if (typeof rest[0] === "string" && rest[0].includes("%")) {
    const template = rest.shift() as string;
    parts.push(
      template.replace(/%([sdifoOjc%])/g, (match, spec: string) => {
        if (spec === "%") return "%";
        if (spec === "c") {
          rest.shift(); // CSS for a browser console; nothing to do with it here
          return "";
        }
        if (rest.length === 0) return match;
        const value = rest.shift();
        switch (spec) {
          case "s":
            return typeof value === "string" ? value : inspect(value, { depth: 1 });
          case "d":
          case "i":
            return typeof value === "bigint" ? `${value}n` : String(Math.trunc(Number(value)));
          case "f":
            return String(Number(value));
          case "j":
            try {
              return JSON.stringify(value);
            } catch {
              return "[Circular]";
            }
          default: // o, O
            return inspect(value, { depth: 4 });
        }
      }),
    );
  }

  for (const value of rest) {
    parts.push(inspect(value));
  }
  return parts.join(" ");
}

// Max's global error(). Looked up on globalThis so that a script declaring its own `error`
// (e.g. `const { error } = console`) can't make our error() call itself.
function maxError(...args: unknown[]) {
  const fn: typeof error = (globalThis as { error?: typeof error }).error ?? error;
  fn(...args);
}

// ---- log file ----

let logFilePath: string | null = null;

/**
 * Also writes everything posted through this module to a file, one timestamped line per
 * call. Lines are appended, and the file is created if it doesn't exist. Pass null to stop.
 *
 * Use an absolute path; how Max resolves relative paths for writing isn't documented.
 * If the file can't be opened, an error is posted and file logging stops.
 *
 * @param path the file to write to, e.g. "C:/Users/me/Documents/spat.log"
 * @example
 * console.logToFile("C:/Users/me/Documents/spat.log");
 * console.log("connecting", tracks); // console, and "2026-09-14T10:15:00.000Z [log] connecting [...]" in the file
 */
function logToFile(path: string | null) {
  logFilePath = path;
}

function appendToLogFile(level: Level, text: string) {
  if (!logFilePath) {
    return;
  }

  // readwrite keeps existing contents; write is the fallback for creating a new file
  let file = new File(logFilePath, "readwrite");
  if (!file.isopen) {
    file = new File(logFilePath, "write");
  }

  if (!file.isopen) {
    const path = logFilePath;
    logFilePath = null;
    maxError(`log file: couldn't open ${path}; file logging stopped`, "\n");
    return;
  }

  // open and close on every write, so no file is left open if the script reloads
  try {
    file.position = file.eof;
    file.writeline(`${new Date().toISOString()} [${level}] ${text}`);
  } finally {
    file.close();
  }
}

// ---- output ----

type Level = "log" | "info" | "debug" | "warn" | "error";

// how deep in console.group() we are; each level indents the output
let groupDepth = 0;

/** Posts one line at a level: errors in red through Max's error(), the rest through post(). */
function write(level: Level, values: unknown[]) {
  const text = formatValues(values);
  const line = "  ".repeat(groupDepth) + (level === "warn" ? `warning: ${text}` : text);
  if (level === "error") {
    maxError(line, "\n");
  } else {
    post(line, "\n");
  }
  appendToLogFile(level, text);
}

/**
 * Posts values to the Max console, formatted with inspect(). Strings are posted as they are,
 * and a leading string can hold format specifiers (`%s`, `%d`, `%o`, ...).
 *
 * @example
 * console.log("tracks:", song.tracks); // tracks: [LiveObject<Track> live_set tracks 0, ...]
 * console.log("%d of %d", done, total);
 */
function log(...values: unknown[]) {
  write("log", values);
}

/** Same as log(); the Console API has both. */
function info(...values: unknown[]) {
  write("info", values);
}

/** Same as log(); the Console API has both. */
function debug(...values: unknown[]) {
  write("debug", values);
}

/** Posts values like log(), prefixed with "warning:", as the Max console has no warning level. */
function warn(...values: unknown[]) {
  write("warn", values);
}

/**
 * Posts values to the Max console as an error (in red), formatted like log().
 *
 * @example
 * console.error("no audio input", index);
 */
// Named logError inside the module so it doesn't shadow Max's global error(), which it calls.
function logError(...values: unknown[]) {
  write("error", values);
}

/** Posts values as an error when the condition is false; nothing otherwise. */
function assert(condition: unknown, ...values: unknown[]) {
  if (condition) return;
  write("error", values.length ? ["Assertion failed:", ...values] : ["Assertion failed"]);
}

/** Posts values as an error, followed by the stack of the call. */
function trace(...values: unknown[]) {
  const stack = (new Error().stack ?? "")
    .split("\n")
    .slice(2) // the "Error" line and this function
    .map((line) => line.trim())
    .filter(Boolean);
  const text = values.length ? formatValues(values) : "Trace";
  write("error", [stack.length ? `${text}\n    ${stack.join("\n    ")}` : text]);
}

/**
 * Posts one value expanded with inspect(), with its options: `console.dir(x, { depth: 6 })`
 * shows more of a deep object than log() would.
 */
function dir(value: unknown, options?: InspectOptions) {
  write("log", [inspect(value, options)]);
}

/** Posts the data like log(); the Max console has no tables. */
function table(data: unknown) {
  write("log", [data]);
}

/** Starts an indented group of output, headed by the label if there is one. */
function group(...label: unknown[]) {
  if (label.length) write("log", label);
  groupDepth++;
}

/** Ends the innermost group. */
function groupEnd() {
  groupDepth = Math.max(0, groupDepth - 1);
}

// ---- counters and timers ----

const counts = new Map<string, number>();
const timers = new Map<string, number>();

/** Posts how many times count() has been called with the label. */
function count(label: unknown = "default") {
  const key = String(label);
  const n = (counts.get(key) ?? 0) + 1;
  counts.set(key, n);
  write("log", [`${key}: ${n}`]);
}

/** Resets the counter for the label. */
function countReset(label: unknown = "default") {
  counts.delete(String(label));
}

/** Starts a timer under the label. Max reports in milliseconds, as a browser does. */
function time(label: unknown = "default") {
  const key = String(label);
  if (timers.has(key)) {
    warn(`Timer '${key}' already exists`);
    return;
  }
  timers.set(key, Date.now());
}

function elapsed(label: unknown): [string, string] | undefined {
  const key = String(label);
  const start = timers.get(key);
  if (start === undefined) {
    warn(`Timer '${key}' does not exist`);
    return undefined;
  }
  return [key, `${key}: ${Date.now() - start} ms`];
}

/** Posts the time since time(label), keeping the timer running. */
function timeLog(label: unknown = "default", ...values: unknown[]) {
  const result = elapsed(label);
  if (result) write("log", [result[1], ...values]);
}

/** Posts the time since time(label) and stops the timer. */
function timeEnd(label: unknown = "default") {
  const result = elapsed(label);
  if (!result) return;
  timers.delete(result[0]);
  write("log", [result[1]]);
}

/** Does nothing: a script can't clear the Max console. Here so callers don't have to check. */
function clear() {}

// ---- the console object ----

const methods = {
  log,
  info,
  debug,
  warn,
  error: logError,
  assert,
  trace,
  dir,
  dirxml: log,
  table,
  group,
  groupCollapsed: group,
  groupEnd,
  count,
  countReset,
  time,
  timeLog,
  timeEnd,
  clear,
};

/**
 * Makes this the global `console`, for bundled npm packages and other code that expects
 * one. A console Max provides itself is kept, and only the methods it lacks are added, so
 * this is safe to call whether or not Max has grown one.
 */
function install() {
  const target = globalThis as { console?: Record<string, unknown> };
  if (!target.console) {
    target.console = { ...methods };
    return;
  }
  for (const [name, fn] of Object.entries(methods)) {
    if (typeof target.console[name] !== "function") {
      target.console[name] = fn;
    }
  }
}

// The module is the log function itself, with the console methods attached, so
// `import console = require("./vendor/console")`, `import log = require("./vendor/console")` and
// `const { log, error } = require("./vendor/console")` all work.
export = Object.assign(log, methods, { logToFile, inspect, install });
