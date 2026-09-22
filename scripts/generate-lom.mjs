// Generates Live Object Model types from the Cycling '74 LOM reference.
//
//   node scripts/generate-lom.mjs [--cache <dir>]
//
// Outputs:
//   packages/lom-types/index.d.ts         LomClasses map, path -> class resolution, helper types
//   packages/live-object/src/lom-meta.ts  runtime lists of list-valued member names (for LiveObject)

import fs from "node:fs";
import path from "node:path";

const BASE = "https://docs.cycling74.com/apiref/lom/";
const ROOT = path.resolve(import.meta.dirname, "..");
const cacheArg = process.argv.indexOf("--cache");
const CACHE = cacheArg > 0 ? path.resolve(process.argv[cacheArg + 1]) : null;

// ---- fetching ----

async function fetchText(url, cacheName) {
  const cached = CACHE && path.join(CACHE, cacheName);
  if (cached && fs.existsSync(cached)) return fs.readFileSync(cached, "utf8");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  const text = await res.text();
  if (cached) {
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(cached, text);
  }
  return text;
}

function htmlToText(html) {
  const main = html.match(/<main[\s\S]*<\/main>/i);
  return (main ? main[0] : html)
    .replace(/<(script|style|nav|svg)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr|pre|section|table)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(h[1-6])[^>]*>/gi, "\n## ")
    .replace(/<t[dh][^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ---- parsing ----

function parsePage(text) {
  const lines = text.split("\n").map((l) => l.trim());
  const page = {
    title: lines[0].replace(/^## /, ""),
    intro: [],
    paths: [],
    parent: null,
    members: [],
  };

  let section = "intro";
  let member = null;

  for (const line of lines.slice(1)) {
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      const h = heading[1];
      if (/^(Canonical Paths?|Children|Properties|Functions)$/.test(h)) {
        section = h.startsWith("Canonical") ? "paths" : h.toLowerCase();
        member = null;
      } else if (/^Example/.test(h)) {
        member = null; // skip example blocks
      } else if (section === "children" || section === "properties" || section === "functions") {
        const m = h.match(/^([a-z_0-9]+)(?:\s+(.+))?$/);
        if (!m) continue;
        member = { section, name: m[1], type: m[2] ?? null, access: [], lines: [] };
        page.members.push(member);
      }
      continue;
    }
    if (!line) continue;

    if (section === "intro") {
      page.intro.push(line);
      // "A SimplerDevice is a type of Device, ...", "An Eq8Device has all the properties, functions
      // and children of a Device", "A WavetableDevice shares all of the children, ... that a Device has"
      const inherit = line.match(
        /^An? [\w.]+ (?:is a type of|(?:has|shares) all (?:of )?the (?:children|properties|functions)[\w ,]*? (?:of|that) an?) (?:[A-Z]\w+ (?=Device))?(\w+(?:\.View)?)/i,
      );
      if (inherit) page.parent = inherit[1];
    } else if (section === "paths") {
      page.paths.push(line);
    } else if (member) {
      const access = line.match(/^Access:\s*(\w+)$/);
      if (access) member.access = access[1].match(/get|set|observe/g) ?? [];
      else member.lines.push(line);
    }
  }
  return page;
}

// ---- corrections to the reference ----

// Children documented as a single object that are actually lists.
const LIST_CHILD_ERRATA = new Set([
  "Chain.devices", // documented as "Device"; a chain holds a list of devices
  "DrumPad.chains", // documented as "Chain"; a drum pad holds a list of chains
]);

// ---- type mapping ----

const SPECIAL_DICTS = [
  [/^available_\w*routing_types$/, "LomRoutingType[]"],
  [/^available_\w*routing_channels$/, "LomRoutingChannel[]"],
  [/routing_type$/, "LomRoutingType"],
  [/routing_channel$/, "LomRoutingChannel"],
];

function scalarType(docType, name) {
  const t = (docType ?? "").trim();
  switch (t) {
    case "bool":
      return "LomBool";
    case "int":
    case "long":
    case "float":
    case "double":
    case "number":
      return "number";
    case "symbol":
    case "unicode":
    case "string":
      return "string";
    case "StringVector":
    case "list of symbols":
      return "string[]";
    case "list of int":
    case "list of ints":
    case "list of float":
    case "list of floats":
      return "number[]";
    case "list":
      return "any[]";
    case "bang":
      return "void";
    case "dictionary":
    case "dict": {
      for (const [re, type] of SPECIAL_DICTS) if (re.test(name)) return type;
      return "any";
    }
    default:
      return null;
  }
}

// function parameter/return types written like "[int]" or "int"
function paramType(docType) {
  return scalarType(docType.replace(/^\[|\]$/g, ""), "") ?? "any";
}

function parseFunction(member) {
  const params = [];
  // without a Parameters section, arguments may still be described in prose
  let ok = member.lines.some((l) => /^Parameters?:/.test(l));
  let returns = "any";
  let inParams = false;
  const description = [];

  const paramRe = /([a-z_]\w*)(?:\s*\[([^\]]+)\])?(\s*\(optional\))?/gi;

  for (const line of member.lines) {
    const header = line.match(/^Parameters?:\s*(.*)$/);
    if (header) {
      inParams = true;
      const inline = header[1].replace(/`/g, "");
      if (inline) {
        if (!/^([a-z_]\w*(\s*\[[^\]]+\])?(\s*\(optional\))?\s*)+$/i.test(inline)) ok = false;
        for (const m of inline.matchAll(paramRe))
          params.push({ name: m[1], type: m[2] ? paramType(m[2]) : "any", optional: !!m[3] });
        inParams = false;
      }
      continue;
    }

    if (inParams) {
      const p = line.match(/^([a-z_]\w*)\s*\[([^\]]+)\](\s*\(optional\))?$/i);
      if (p) {
        params.push({ name: p[1], type: paramType(p[2]), optional: !!p[3] });
        continue;
      }
      inParams = false;
      if (params.length === 0) ok = false; // e.g. a prose-described dictionary parameter
    }

    const ret = line.match(/^Returns:\s*(?:\[([^\]]+)\]|(bool)\b)/);
    if (ret) returns = paramType(ret[1] ?? ret[2]);
    description.push(line);
  }

  // required params can't follow optional ones
  let sawOptional = false;
  for (const p of params) {
    if (p.optional) sawOptional = true;
    else if (sawOptional) p.optional = true;
  }

  return { params: ok ? params : null, returns, description };
}

// ---- output helpers ----

function jsdoc(lines, indent) {
  const text = lines.filter(Boolean).map((l) => l.replace(/\*\//g, "*\\/"));
  if (!text.length) return "";
  if (text.length === 1) return `${indent}/** ${text[0]} */\n`;
  return `${indent}/**\n${text.map((l) => `${indent} * ${l}`).join("\n")}\n${indent} */\n`;
}

const accessType = (access) => (access.length ? access.map((a) => `"${a}"`).join(" | ") : "never");

// ---- main ----

const index = await fetchText(BASE, "index.html");
const slugs = [
  ...new Set([...index.matchAll(/apiref\/lom\/([a-z0-9_]+)\//g)].map((m) => m[1])),
].sort();
const pages = await Promise.all(
  slugs.map(async (slug) => ({
    slug,
    ...parsePage(htmlToText(await fetchText(`${BASE}${slug}/`, `${slug}.html`))),
  })),
);

const classPages = pages.filter((p) => /^[A-Z]/.test(p.title));
const byName = new Map(classPages.map((p) => [p.title, p]));
const byLowerName = new Map(classPages.map((p) => [p.title.toLowerCase(), p]));
const warnings = [];

function resolveClass(name) {
  return byName.get(name) ?? byLowerName.get(name.toLowerCase()) ?? null;
}

// Classify each member as a child (object reference), property, or function.
function classify(page) {
  const children = new Map();
  const properties = new Map();
  const functions = new Map();

  for (const m of page.members) {
    if (m.section === "functions") {
      functions.set(m.name, { ...m, fn: parseFunction(m) });
      continue;
    }
    const listOf = m.type?.match(/^list of ([A-Z][\w.]*)$/);
    const target = listOf
      ? resolveClass(listOf[1])
      : m.type && /^[A-Z]/.test(m.type)
        ? resolveClass(m.type)
        : null;
    if (target) {
      const list = !!listOf || LIST_CHILD_ERRATA.has(`${page.title}.${m.name}`);
      children.set(m.name, { ...m, list, target: target.title });
      continue;
    }
    let type = scalarType(m.type, m.name);
    if (type === null) {
      warnings.push(
        `${page.title}.${m.name}: ${m.type ? `unknown type "${m.type}"` : "no documented type"}, using any`,
      );
      type = "any";
    }
    properties.set(m.name, { ...m, tsType: type });
  }
  return { children, properties, functions };
}

// Flatten inheritance: subclasses get their parent's members.
const classified = new Map();
function membersOf(page) {
  if (classified.has(page.title)) return classified.get(page.title);
  const own = classify(page);
  if (page.parent) {
    const parent = resolveClass(page.parent);
    if (!parent) warnings.push(`${page.title}: unknown parent ${page.parent}`);
    else {
      const inherited = membersOf(parent);
      for (const key of ["children", "properties", "functions"]) {
        own[key] = new Map([...inherited[key], ...own[key]]);
      }
    }
  }
  classified.set(page.title, own);
  return own;
}

// Declarations are written with a "Lom" prefix (LomClasses, LomBool, ...) and moved
// into the Lom namespace (Lom.Classes, Lom.Bool, ...) when the file is written.
const DTS_HEADER = `// Generated by scripts/generate-lom.mjs from ${BASE} — do not edit by hand.
//
// Live Object Model classes for LiveAPI, in the type-only Lom namespace. Members of
// subclasses (e.g. SimplerDevice) include everything inherited from their parent
// class (e.g. Device).

/// <reference path="access.d.ts" />

`;

let dts = `/** Live booleans are sent as 0 or 1. */
type LomBool = 0 | 1;

/** A routing type, as returned by routing_type / available_routing_types. */
interface LomRoutingType {
  display_name: string;
  identifier: number | string;
}

/** A routing channel, as returned by routing_channel / available_routing_channels. */
interface LomRoutingChannel {
  display_name: string;
  identifier: number | string;
}

type LomAccess = "get" | "set" | "observe";

interface LomChildSpec {
  class: LomClassName;
  list: boolean;
  access: LomAccess;
}

interface LomPropertySpec {
  type: unknown;
  access: LomAccess;
}

interface LomClasses {
`;

const listNames = new Map(); // member name -> Set of booleans (is list-valued)
function noteList(name, isList) {
  if (!listNames.has(name)) listNames.set(name, new Set());
  listNames.get(name).add(isList);
}

for (const page of classPages) {
  const { children, properties, functions } = membersOf(page);
  const intro = page.intro.filter((l) => !/is a type of/.test(l));

  dts += jsdoc(
    [...intro.slice(0, 2), ...page.paths.map((p) => `Path: \`${p}\``), `@see ${BASE}${page.slug}/`],
    "  ",
  );
  dts += `  ${JSON.stringify(page.title)}: {\n`;

  dts += `    children: {\n`;
  for (const c of children.values()) {
    noteList(c.name, c.list);
    dts += jsdoc(c.lines, "      ");
    dts += `      ${c.name}: { class: ${JSON.stringify(c.target)}; list: ${c.list}; access: ${accessType(c.access)} };\n`;
  }
  dts += `    };\n`;

  dts += `    properties: {\n`;
  for (const p of properties.values()) {
    noteList(p.name, p.tsType.endsWith("[]") && !/^Lom/.test(p.tsType));
    dts += jsdoc(
      [...p.lines, p.tsType === "any" && p.type ? `Documented type: ${p.type}` : ""],
      "      ",
    );
    dts += `      ${p.name}: { type: ${p.tsType}; access: ${accessType(p.access)} };\n`;
  }
  dts += `    };\n`;

  dts += `    functions: {\n`;
  for (const f of functions.values()) {
    dts += jsdoc(f.fn.description, "      ");
    const sig = f.fn.params
      ? `(${f.fn.params.map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join(", ")}) => ${f.fn.returns}`
      : `(...args: any[]) => ${f.fn.returns}`;
    dts += `      ${f.name}: ${sig};\n`;
  }
  dts += `    };\n`;

  dts += `  };\n`;
}
dts += `}\n\n`;

// ---- path resolution ----

const subclasses = new Map(); // base class -> Set of all descendants
for (const page of classPages) {
  let parent = page.parent && resolveClass(page.parent);
  while (parent) {
    if (!subclasses.has(parent.title)) subclasses.set(parent.title, new Set());
    subclasses.get(parent.title).add(page.title);
    parent = parent.parent && resolveClass(parent.parent);
  }
}

dts += `type LomClassName = keyof LomClasses;

// ---- member lookups ----

type LomChildren<C extends LomClassName> = LomClasses[C]["children"];
type LomProperties<C extends LomClassName> = LomClasses[C]["properties"];
type LomFunctions<C extends LomClassName> = LomClasses[C]["functions"];

/** Names of the members of M whose spec supports access A. */
type LomNamesWith<M, A extends LomAccess> = { [K in keyof M]: M[K] extends { access: infer X } ? (A extends X ? K : never) : never }[keyof M];

/** Names of children and properties of C that support the given access. */
type LomMemberWith<C extends LomClassName, A extends LomAccess> =
  | LomNamesWith<LomChildren<C>, A>
  | LomNamesWith<LomProperties<C>, A>;

/** Names of list children of C (usable with getcount). */
type LomListChild<C extends LomClassName> = {
  [K in keyof LomChildren<C>]: LomChildren<C>[K] extends { list: true } ? K : never;
}[keyof LomChildren<C>];

/** Value type of property K of C. */
type LomPropertyType<C extends LomClassName, K> =
  K extends keyof LomProperties<C> ? (LomProperties<C>[K] extends { type: infer T } ? T : never) : never;

// ---- path resolution ----

/** Root path segments and the class they refer to. */
interface LomRoots {
  live_set: "Song";
  live_app: "Application";
  /** Documented as Device; a Max for Live device is a MaxDevice (audio_inputs, audio_outputs, ...). */
  this_device: "MaxDevice";
}

/** Direct and indirect subclasses of each class that has any. */
interface LomSubclasses {
${[...subclasses].map(([base, subs]) => `  ${JSON.stringify(base)}: ${[...subs].map((s) => JSON.stringify(s)).join(" | ")};`).join("\n")}
}

type LomSubclassOf<C extends LomClassName> = C extends keyof LomSubclasses ? LomSubclasses[C] : never;

/** C if it has child Name, otherwise whichever subclasses of C do (e.g. RackDevice for Device "chains"). */
type LomChildOwner<C extends LomClassName, Name> = Name extends keyof LomChildren<C>
  ? C
  : LomSubclassOf<C> extends infer S extends LomClassName
    ? S extends unknown ? (Name extends keyof LomChildren<S> ? S : never) : never
    : never;

type LomChildClass<C extends LomClassName, K> = K extends keyof LomChildren<C>
  ? LomChildren<C>[K] extends { class: infer T extends LomClassName } ? T : never
  : never;

/** Follows the space-separated child names (and list indices) in Rest, starting at class C. */
type LomResolvePath<C extends LomClassName, Rest extends string> =
  Rest extends \`\${infer Name} \${infer Tail}\`
    ? LomChildOwner<C, Name> extends infer O extends LomClassName
      ? O extends unknown
        ? Name extends LomListChild<O>
          ? Tail extends \`\${number} \${infer After}\` ? LomResolvePath<LomChildClass<O, Name>, After>
          : Tail extends \`\${number}\` ? LomChildClass<O, Name>
          : never
        : LomResolvePath<LomChildClass<O, Name>, Tail>
        : never
      : never
    : LomChildOwner<C, Rest> extends infer O extends LomClassName
      ? O extends unknown
        ? LomChildren<O>[Rest & keyof LomChildren<O>] extends { list: true } ? never : LomChildClass<O, Rest>
        : never
      : never;

/**
 * Resolves a literal Live API path (e.g. "live_set tracks 0 devices 1") to its
 * LOM class name by walking the children of each class, or \`never\` if the path
 * isn't valid. Subclasses resolve to their documented base (e.g. "Device").
 */
type LomClassAtPath<P extends string> =
  P extends keyof LomRoots ? LomRoots[P]
  : P extends \`\${infer Root extends keyof LomRoots} \${infer Rest}\` ? LomResolvePath<LomRoots[Root], Rest>
  : P extends \`control_surfaces \${number}\` ? "ControlSurface"
  : never;
`;

// ---- runtime metadata ----

const listValued = [];
for (const [name, kinds] of [...listNames].sort()) {
  if (kinds.size > 1)
    warnings.push(`member "${name}" is list-valued in some classes and not others`);
  if (kinds.has(true)) listValued.push(name);
}

const meta = `// Generated by scripts/generate-lom.mjs from ${BASE} — do not edit by hand.

/**
 * LOM members whose value is always a list (list children like \`devices\`, and
 * list-typed properties like StringVector), even when Live returns one element.
 */
const LIST_MEMBERS: ReadonlySet<string> = new Set([
${listValued.map((n) => `  ${JSON.stringify(n)},`).join("\n")}
]);

interface ClassMembers {
  /** The class this one inherits members from. */
  parent?: string;
  /** Children and properties declared on this class (not inherited). */
  values: string[];
  /** Functions declared on this class (not inherited). */
  functions: string[];
}

/** Members declared by each LOM class, used to resolve dynamic accessors. */
const CLASS_MEMBERS: Record<string, ClassMembers> = {
${classPages
  .map((page) => {
    const own = classify(page);
    const parent = page.parent && resolveClass(page.parent);
    const fields = [
      parent ? `parent: ${JSON.stringify(parent.title)}` : null,
      `values: ${JSON.stringify([...own.children.keys(), ...own.properties.keys()])}`,
      `functions: ${JSON.stringify([...own.functions.keys()])}`,
    ].filter(Boolean);
    return `  ${JSON.stringify(page.title)}: { ${fields.join(", ")} },`;
  })
  .join("\n")}
};

export = { LIST_MEMBERS, CLASS_MEMBERS };
`;

const LOM_TYPES = path.join(ROOT, "packages/lom-types");
const LIVE_OBJECT = path.join(ROOT, "packages/live-object/src");
const namespaced = dts
  .replace(/\bLom([A-Z]\w*)/g, "$1")
  .trimEnd()
  .split("\n")
  .map((line) => (line ? `  ${line}` : line))
  .join("\n");
fs.writeFileSync(
  path.join(LOM_TYPES, "index.d.ts"),
  `${DTS_HEADER}declare namespace Lom {\n${namespaced}\n}\n`,
);
fs.writeFileSync(path.join(LIVE_OBJECT, "lom-meta.ts"), meta);

console.log(`${classPages.length} classes, ${listValued.length} list-valued members`);
for (const w of new Set(warnings)) console.warn(`warning: ${w}`);
