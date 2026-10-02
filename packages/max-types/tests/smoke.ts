// Type-level smoke test: a script written against the declarations must compile.
// Nothing here runs; the test fails when the file stops type-checking.

inlets = 1;
outlets = 2;
autowatch = 1;

function bang() {
  post("bang\n");
  outlet(0, "bang");
}

function msg_int(value: number) {
  outlet(1, value * 2);
}

function list(...values: any[]) {
  outlet(0, ...values);
}

export type MaxHandlers = Handlers<{
  bang: typeof bang;
  msg_int: typeof msg_int;
  list: typeof list;
}>;

// ---- Patcher ----

const box = patcher.getnamed("foo");
if (box) {
  const rect: number[] = box.rect;
  post(rect.length);
  patcher.remove(box);
}
const made = patcher.newdefault(10, 10, "comment");
made.message("set", "hello");

// ---- Task ----

const task = new Task(() => post("tick\n"), this);
task.interval = 100;
task.repeat(3);
task.cancel();

// ---- Dict ----

const dict = new Dict("settings");
dict.set("gain", 0.5);
const gain: any = dict.get("gain");
const keys: string[] | null = dict.getkeys();

// ---- LiveAPI ----

const api = new LiveAPI(null, "live_set tracks 0");
const values: any[] = api.get("name");
api.set("mute", 1);
const id: number = api.id;

// ---- Global / messnamed ----

const g = new Global("shared");
g.sendnamed("receiver", "bang");
messnamed("receiver", "bang");

// ---- mgraphics ----

mgraphics.init();
mgraphics.set_source_rgba(1, 0, 0, 1);
mgraphics.rectangle(0, 0, 10, 10);
mgraphics.fill();

// ---- File ----

const file = new File("notes.txt", "read");
if (file.isopen) {
  const line: string = file.readline(4096);
  post(line);
  file.close();
}

// ---- Max 9.2: console and timers ----

console.log("value is", 42, { nested: true });
const timeout: number = setTimeout((text: string, n: number) => post(text, n), 50, "late", 1);
clearTimeout(timeout);
const interval = setInterval(() => clearInterval(interval), 10);
clearImmediate(setImmediate(() => {}));
queueMicrotask(() => {});
// @ts-expect-error the arguments are checked against the callback
setTimeout((n: number) => post(n), 0, "not a number");

// ---- Max 9.2: fetch, websockets, modules ----

async function load(): Promise<string> {
  const response = await fetch("https://example.com/data.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ a: 1 }),
    signal: AbortSignal.timeout(1000),
  });
  if (!response.ok) throw new Error(`Status: ${response.status}`);
  return response.text();
}

const wss = new WebSocketServer({ port: 3000, host: "127.0.0.1" });
wss.on("connection", (socket: WebSocketConnection) => {
  socket.on("message", (event: WebSocketMessageEvent) => {
    const text = typeof event.data === "string" ? event.data : event.data.toString("utf8");
    socket.send(`echo: ${text}`);
  });
});

const ws = new WebSocket("ws://127.0.0.1:3000");
ws.onmessage = (event) => post(typeof event.data);
ws.onerror = (event) => post(event.error.code ?? event.error.message);

import http = require("http");
import net = require("net");
import dgram = require("dgram");
import buffer = require("buffer");

const server: http.Server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end(`${req.method} ${req.url}`);
});
server.listen(3007, () => post(server.address().port));

const client: net.Socket = net.createConnection({ port: 3000, host: "127.0.0.1" }, () => {
  client.write("hello");
});

const udp = dgram.createSocket("udp4");
udp.send(IOBuffer.from("hello"), 41234, "127.0.0.1");
const bytes: IOBuffer = new buffer.IOBuffer("68656c6c6f", "hex");

// Buffer is still the buffer~ wrapper
const samples: number[] = new Buffer("loop").peek(1, 0, 16);

// ---- Max 9.2: MaxFFT, MaxArray, Dict.toJSON ----

const fft = new MaxFFT(1024, { type: "real", precision: "float64" });
const spectrum: Float64Array = fft.forward(MaxFFT.alloc(fft.length, "float64"));
fft.dispose();
const array = new MaxArray([1, 2, "three"]);
array.append(dict, 4);
const json: string = JSON.stringify(dict.toJSON());

// Values checked only by their types.
export const _checked = { made, gain, keys, values, id, g, load, bytes, samples, spectrum, json };
