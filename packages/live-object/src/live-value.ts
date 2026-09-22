// Conversions between LiveAPI's atom lists and the values LiveObject exposes, and the
// per-class member tables its dynamic accessors are resolved from.

import lomMeta = require("./lom-meta");
const { LIST_MEMBERS, CLASS_MEMBERS } = lomMeta;

function chunk<T>(array: T[], chunkSize = 2): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

function isJson(str: unknown): str is string {
  if (!str || typeof str !== "string") {
    return false;
  }

  return str.charAt(0) === "{";
}

/**
 * Converts a raw LiveAPI value (an atom list) for LOM member `name`: object ids become
 * objects created by `wrap` (id 0 is skipped), JSON dictionaries are parsed, and single
 * values are unwrapped unless the member is always a list.
 */
function normalizeLiveValue(name: string, raw: any[], wrap: (id: any[]) => unknown): any {
  if (raw[0] === "id") {
    const objects = chunk(raw, 2)
      .filter(([, id]) => Number(id) !== 0)
      .map(wrap);
    return LIST_MEMBERS.has(name) ? objects : (objects[0] ?? null);
  }

  if (isJson(raw[0])) {
    return JSON.parse(raw[0])[name];
  }

  return LIST_MEMBERS.has(name) ? raw : raw[0];
}

/** Converts a value for LiveAPI.set(): instances of `objectClass` become `id N` references. */
function toLiveValue(
  value: unknown,
  objectClass: abstract new (...args: any[]) => { id: number | string },
) {
  return value instanceof objectClass ? ["id", value.id] : value;
}

type LomMemberKind = "value" | "function";
const lomMemberKindCache = new Map<string, Map<string, LomMemberKind>>();

/**
 * The kind of each member of a LOM class ("value" for children and properties),
 * including inherited members.
 */
function lomMemberKinds(className: string) {
  let kinds = lomMemberKindCache.get(className);

  if (!kinds) {
    kinds = new Map();
    let cls: (typeof CLASS_MEMBERS)[string] | undefined = CLASS_MEMBERS[className];
    for (; cls; cls = cls.parent ? CLASS_MEMBERS[cls.parent] : undefined) {
      // subclasses come first, so their members take precedence
      for (const name of cls.values) if (!kinds.has(name)) kinds.set(name, "value");
      for (const name of cls.functions) if (!kinds.has(name)) kinds.set(name, "function");
    }
    lomMemberKindCache.set(className, kinds);
  }

  return kinds;
}

export = { normalizeLiveValue, toLiveValue, lomMemberKinds };
