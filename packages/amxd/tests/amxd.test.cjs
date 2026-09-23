// Runs the built dist/index.js under Node and checks the container layout byte for byte, the
// round trips, and the error cases. If a directory of real devices is at hand (AMXD_DIR, or the
// max-msp repository beside this one), every .amxd in it is round-tripped too. Run with
// `pnpm test` after `pnpm build`.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const amxd = require(path.join(__dirname, "..", "dist", "index.js"));

const patcher = {
  patcher: {
    fileversion: 1,
    appversion: { major: 9, minor: 1, revision: 2, architecture: "x64", modernui: 1 },
    boxes: [{ box: { id: "obj-1", maxclass: "newobj", text: "plugin~", gain: 1.5 } }],
    lines: [],
  },
};

// encode: the header layout
const bytes = amxd.encode({ version: 4, type: "audio", meta: 1, chunks: [], patcher });
const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const tag = (at) => String.fromCharCode(...bytes.subarray(at, at + 4));
assert.equal(tag(0), "ampf");
assert.equal(view.getUint32(4, true), 4);
assert.equal(tag(8), "aaaa");
assert.equal(tag(12), "meta");
assert.equal(view.getUint32(16, true), 4);
assert.equal(view.getUint32(20, true), 1);
assert.equal(tag(24), "ptch");
const length = view.getUint32(28, true);
assert.equal(32 + length, bytes.length);
assert.equal(bytes[bytes.length - 1], 0);
const json = Buffer.from(bytes.subarray(32, bytes.length - 1)).toString("utf8");
assert.equal(json, JSON.stringify(patcher, null, 4));
assert.ok(!json.includes("\r"));

// the type tags
assert.equal(
  String.fromCharCode(
    ...amxd
      .encode({ version: 4, type: "instrument", meta: 0, chunks: [], patcher })
      .subarray(8, 12),
  ),
  "iiii",
);
assert.equal(
  String.fromCharCode(
    ...amxd.encode({ version: 4, type: "midi", meta: 0, chunks: [], patcher }).subarray(8, 12),
  ),
  "mmmm",
);

// decode: back to the same thing
const decoded = amxd.decode(bytes);
assert.deepEqual(decoded, { version: 4, type: "audio", meta: 1, chunks: [], patcher });

// encode options
const crlf = amxd.encode(
  { version: 4, type: "midi", meta: 0, chunks: [], patcher },
  { newline: "\r\n", indent: "\t" },
);
const crlfText = amxd.decodeRaw(crlf).text;
assert.ok(crlfText.startsWith('{\r\n\t"patcher": {\r\n\t\t"fileversion": 1,\r\n'));
assert.equal(amxd.decode(crlf).type, "midi");

// raw round trip keeps the text as it is, and non-ASCII survives
const text = '{\n\t"patcher" : \t{\n\t\t"note" : "héllo — ünïcode",\n\t\t"x" : 1.0\n\t}\n}\n';
const raw = { version: 4, type: "midi", meta: 0, chunks: [], text };
const rawBytes = amxd.encodeRaw(raw);
assert.deepEqual(amxd.decodeRaw(rawBytes), raw);
assert.equal(amxd.decode(rawBytes).patcher.patcher.note, "héllo — ünïcode");

// unknown chunks are kept in order
const extra = { tag: "zzzz", data: new Uint8Array([1, 2, 3]) };
const withExtra = amxd.decodeRaw(amxd.encodeRaw({ ...raw, chunks: [extra] }));
assert.equal(withExtra.chunks.length, 1);
assert.equal(withExtra.chunks[0].tag, "zzzz");
assert.deepEqual(Array.from(withExtra.chunks[0].data), [1, 2, 3]);
assert.equal(withExtra.text, text);

// a Buffer that is a view into a larger pool decodes the same
const pooled = Buffer.concat([Buffer.from("junk"), Buffer.from(bytes)]).subarray(4);
assert.deepEqual(amxd.decode(pooled), decoded);

// errors
assert.throws(() => amxd.decode(new Uint8Array([1, 2, 3])), /ampf/);
assert.throws(() => amxd.decode(Buffer.from("ampf\x04\0\0\0xxxx")), /device type/);
assert.throws(() => amxd.decode(bytes.subarray(0, 40)), /runs past the end/);
assert.throws(() => amxd.decode(bytes.subarray(0, 24)), /No ptch chunk/);
assert.throws(
  () => amxd.encode({ version: 4, type: "video", meta: 0, chunks: [], patcher }),
  /device type/,
);
assert.throws(
  () => amxd.encodeRaw({ ...raw, chunks: [{ tag: "toolong", data: new Uint8Array() }] }),
  /4 characters/,
);

// files
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "amxd-"));
const file = path.join(dir, "Test.amxd");
amxd.writeAmxd(file, decoded);
assert.deepEqual(amxd.readAmxd(file), decoded);
fs.rmSync(dir, { recursive: true });

// real devices, when there are some to hand
const devices =
  process.env.AMXD_DIR ?? path.join(__dirname, "..", "..", "..", "..", "max-msp", "devices");
if (fs.existsSync(devices)) {
  const names = fs.readdirSync(devices).filter((name) => name.endsWith(".amxd"));
  for (const name of names) {
    const original = fs.readFileSync(path.join(devices, name));
    const raw = amxd.decodeRaw(original);
    assert.equal(raw.version, 4, name);
    assert.deepEqual(raw.chunks, [], name);
    assert.ok(Buffer.from(amxd.encodeRaw(raw)).equals(original), `${name} does not round-trip`);
    const parsed = amxd.decode(original);
    assert.ok(Array.isArray(parsed.patcher.patcher.boxes), name);
    assert.deepEqual(amxd.decode(amxd.encode(parsed)).patcher, parsed.patcher, name);
  }
  console.log(`amxd: ${names.length} real devices round-tripped`);
}

console.log("amxd: all assertions passed");
