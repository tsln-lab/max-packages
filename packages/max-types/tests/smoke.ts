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

// Values checked only by their types.
export const _checked = { made, gain, keys, values, id, g };
