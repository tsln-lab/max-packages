// Reads and writes Max for Live device files (.amxd).
//
// An .amxd is a small binary container around the same JSON a .maxpat holds:
//
//   offset  size  content
//   0       4     "ampf"                            magic
//   4       4     uint32 LE                         container version (4)
//   8       4     "aaaa" | "iiii" | "mmmm"          device type: audio effect, instrument, MIDI effect
//   12      ...   chunks: 4-byte tag, uint32 LE length, payload
//
// Two chunks are known. "meta" carries a single uint32 whose meaning is not documented (0 or 1
// in the files seen so far, unrelated to device type, dependencies or Max version), and "ptch"
// carries the patcher JSON as UTF-8 text with a trailing NUL, which the length includes.
// Any other chunk is kept as it was so that a file round-trips unchanged.
//
//   import { readAmxd, writeAmxd } from "@tsln/amxd";
//   const device = readAmxd("Spat Web.amxd");
//   device.type;                       // "audio"
//   device.patcher.patcher.boxes;      // the usual .maxpat structure
//   writeAmxd("Spat Web.amxd", device);
//
// decode()/encode() do the same on bytes, and decodeRaw()/encodeRaw() leave the JSON as text.

import { readFileSync, writeFileSync } from "node:fs";

/** What kind of Live device the file is, as the header states it. */
export type DeviceType = "audio" | "instrument" | "midi";

/** A chunk of the container other than `meta` and `ptch`, kept as it was. */
export interface Chunk {
  /** Four ASCII characters. */
  tag: string;
  data: Uint8Array;
}

/** The container around the patcher. */
export interface AmxdHeader {
  /** The container's format version. Every file seen so far says 4. */
  version: number;
  type: DeviceType;
  /** The value of the `meta` chunk. Undocumented; 0 or 1 in practice. Keep what was read. */
  meta: number;
  /** Chunks other than `meta` and `ptch`, in file order. None have been seen, but they survive. */
  chunks: Chunk[];
}

/** A device with its patcher JSON as text, exactly as stored (without the trailing NUL). */
export interface RawAmxd extends AmxdHeader {
  text: string;
}

/** A device with its patcher JSON parsed. */
export interface Amxd extends AmxdHeader {
  patcher: PatcherFile;
}

/** The top level of a .maxpat or .amxd document: one `patcher` key. */
export interface PatcherFile {
  patcher: Patcher;
}

/**
 * A patcher as Max saves it. Only the members every patcher has are typed; the many optional
 * settings (`rect`, `parameters`, `dependency_cache`, `project`, ...) come through the index
 * signature.
 */
export interface Patcher {
  fileversion: number;
  appversion: {
    major: number;
    minor: number;
    revision: number;
    architecture: string;
    modernui: number;
  };
  boxes: Box[];
  lines: Line[];
  [key: string]: unknown;
}

/** An object box. Subpatchers and embedded bpatchers carry their own `patcher`. */
export interface Box {
  box: {
    id: string;
    maxclass: string;
    text?: string;
    patcher?: Patcher;
    [key: string]: unknown;
  };
}

/** A patch cord. `source` and `destination` are `[box id, inlet or outlet index]`. */
export interface Line {
  patchline: {
    source: [string, number];
    destination: [string, number];
    [key: string]: unknown;
  };
}

export interface EncodeOptions {
  /**
   * Indentation passed to JSON.stringify. Max 9.1 saves with 4 spaces, older versions with tabs.
   * Default 4.
   */
  indent?: number | string;
  /** Line ending for the JSON. Max writes the platform's; either loads anywhere. Default "\n". */
  newline?: "\n" | "\r\n";
}

const MAGIC = "ampf";
const HEADER_SIZE = 12;
const TYPE_BY_TAG: Record<string, DeviceType> = {
  aaaa: "audio",
  iiii: "instrument",
  mmmm: "midi",
};
const TAG_BY_TYPE: Record<DeviceType, string> = {
  audio: "aaaa",
  instrument: "iiii",
  midi: "mmmm",
};

const ascii = (bytes: Uint8Array, offset: number, length: number): string =>
  String.fromCharCode(...bytes.subarray(offset, offset + length));

/** Reads the container and returns the patcher JSON as text. */
export function decodeRaw(bytes: Uint8Array): RawAmxd {
  if (bytes.length < HEADER_SIZE || ascii(bytes, 0, 4) !== MAGIC) {
    throw new Error("Not an .amxd file: missing the ampf magic");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(4, true);
  const typeTag = ascii(bytes, 8, 4);
  const type = TYPE_BY_TAG[typeTag];
  if (!type) throw new Error(`Unknown device type tag "${typeTag}"`);

  let meta: number | undefined;
  let text: string | undefined;
  const chunks: Chunk[] = [];
  let offset = HEADER_SIZE;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) {
      throw new Error(`Truncated chunk header at byte ${offset}`);
    }
    const tag = ascii(bytes, offset, 4);
    const length = view.getUint32(offset + 4, true);
    const start = offset + 8;
    const end = start + length;
    if (end > bytes.length) {
      throw new Error(`Chunk "${tag}" at byte ${offset} runs past the end of the file`);
    }
    const data = bytes.subarray(start, end);
    if (tag === "meta") {
      if (length !== 4) throw new Error(`Expected a 4-byte meta chunk, got ${length} bytes`);
      meta = view.getUint32(start, true);
    } else if (tag === "ptch") {
      let textEnd = end;
      while (textEnd > start && bytes[textEnd - 1] === 0) textEnd--;
      text = new TextDecoder("utf-8").decode(bytes.subarray(start, textEnd));
    } else {
      chunks.push({ tag, data: data.slice() });
    }
    offset = end;
  }
  if (meta === undefined) throw new Error("No meta chunk");
  if (text === undefined) throw new Error("No ptch chunk");
  return { version, type, meta, chunks, text };
}

/** Writes the container around patcher JSON given as text. A trailing NUL is added. */
export function encodeRaw(raw: RawAmxd): Uint8Array {
  const typeTag = TAG_BY_TYPE[raw.type];
  if (!typeTag) throw new Error(`Unknown device type "${raw.type}"`);
  for (const chunk of raw.chunks) {
    if (chunk.tag.length !== 4) throw new Error(`Chunk tag "${chunk.tag}" is not 4 characters`);
  }
  const json = new TextEncoder().encode(raw.text);
  const extra = raw.chunks.reduce((n, chunk) => n + 8 + chunk.data.length, 0);
  const out = new Uint8Array(HEADER_SIZE + 12 + extra + 8 + json.length + 1);
  const view = new DataView(out.buffer);
  let offset = 0;
  const putTag = (tag: string) => {
    for (let i = 0; i < 4; i++) out[offset + i] = tag.charCodeAt(i);
    offset += 4;
  };
  const putUint32 = (n: number) => {
    view.setUint32(offset, n, true);
    offset += 4;
  };

  putTag(MAGIC);
  putUint32(raw.version);
  putTag(typeTag);
  putTag("meta");
  putUint32(4);
  putUint32(raw.meta);
  for (const chunk of raw.chunks) {
    putTag(chunk.tag);
    putUint32(chunk.data.length);
    out.set(chunk.data, offset);
    offset += chunk.data.length;
  }
  putTag("ptch");
  putUint32(json.length + 1);
  out.set(json, offset);
  // the NUL after the JSON is already there: the buffer is zero-filled
  return out;
}

/** Reads the container and parses the patcher JSON. */
export function decode(bytes: Uint8Array): Amxd {
  const { text, ...header } = decodeRaw(bytes);
  return { ...header, patcher: JSON.parse(text) as PatcherFile };
}

/**
 * Serializes the patcher and writes the container around it.
 *
 * JSON.stringify writes numbers as short as it can, so a float Max saved as `1.0` comes out as
 * `1`. Max reads that back fine. For byte-exact edits of the text, use decodeRaw/encodeRaw.
 */
export function encode(amxd: Amxd, options: EncodeOptions = {}): Uint8Array {
  const { patcher, ...header } = amxd;
  let text = JSON.stringify(patcher, null, options.indent ?? 4);
  if (options.newline === "\r\n") text = text.replace(/\n/g, "\r\n");
  return encodeRaw({ ...header, text });
}

/** Reads and parses a device file. */
export function readAmxd(path: string): Amxd {
  return decode(readFileSync(path));
}

/** Writes a device file. */
export function writeAmxd(path: string, amxd: Amxd, options?: EncodeOptions): void {
  writeFileSync(path, encode(amxd, options));
}
