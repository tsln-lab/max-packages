# @tsln/amxd

Reads and writes Max for Live device files (`.amxd`) from Node: the binary container, and the
patcher JSON inside it, which is the same structure a `.maxpat` holds.

```ts
import { readAmxd, writeAmxd } from "@tsln/amxd";

const device = readAmxd("Spat Web.amxd");
device.type; // "audio" | "instrument" | "midi"
device.patcher.patcher.boxes; // [{ box: { id, maxclass, text, ... } }, ...]

for (const { box } of device.patcher.patcher.boxes) {
  if (box.maxclass === "comment") box.text = box.text?.toUpperCase();
}
writeAmxd("Spat Web.amxd", device);
```

`decode(bytes)` and `encode(device)` do the same on a `Uint8Array`, for when the file comes from
somewhere else. `decodeRaw` and `encodeRaw` leave the JSON as text, so a file read and written
that way is byte for byte the same, which `encode` cannot promise: `JSON.stringify` writes a
float Max saved as `1.0` as `1`, which Max reads back without complaint, and the indentation and
line endings are whatever the `indent` and `newline` options say (4 spaces and `\n` by default,
which is how Max 9.1 writes them on a Mac).

## The format

```
offset  size  content
0       4     "ampf"                        magic
4       4     uint32 LE                     container version, 4
8       4     "aaaa" | "iiii" | "mmmm"      audio effect, instrument, MIDI effect
12      ...   chunks: 4-byte tag, uint32 LE length, payload
```

Two chunks are known and both are always present. `meta` holds one uint32, whose meaning is not
documented: it is 0 or 1 and does not follow the device type, the Max version, the dependencies
or anything else looked at, so the library reads it into `meta` and writes it back. `ptch` holds
the patcher JSON as UTF-8 with a trailing NUL that the length counts. A device's external
dependencies are not appended as further chunks; they are listed in the JSON under
`dependency_cache`, and embedded bpatchers carry their whole subpatcher inline, which is why a
device can be a megabyte of text. Any chunk with another tag is kept in `chunks` and written
back in place.

## Install

```sh
npm install @tsln/amxd
```

It is a plain Node package, usable from `require` or `import`, with no dependencies. Node 20 or
later.
