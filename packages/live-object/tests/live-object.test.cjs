// Runs the built dist/index.js under Node with Max's LiveAPI stubbed on a small Live Set, and
// checks when LiveObject makes LiveAPI objects and asks Live for things, which is what it is
// careful about. Run with `pnpm test` after `pnpm build`.
//
// LiveObjects share LiveAPI objects for as long as the module is loaded, so what a block
// below finds depends on the ones above it. Each works on tracks of its own where it matters.
const assert = require("node:assert/strict");
const path = require("node:path");

const track = (index, name) => ({
  type: "Track",
  path: `live_set tracks ${index}`,
  values: { name: [name], mute: [0] },
});

// id -> object
const SET = {
  1: {
    type: "Song",
    path: "live_set",
    values: { tempo: [120], tracks: ["id", 2, "id", 3, "id", 4, "id", 5, "id", 6, "id", 7] },
  },
  2: track(0, "Bass"),
  3: track(1, "Drums"),
  4: track(2, "Keys"),
  5: track(3, "Lead"),
  6: track(4, "Pad"),
  7: track(5, "Vox"),
};

let made = 0; // LiveAPI objects
let asked_type = 0; // times Live was asked for the class of an object
const observing = new Set();

function find(target) {
  const words = Array.isArray(target) ? target : String(target).split(" ");
  if (words[0] === "id") return SET[words[1]] ? Number(words[1]) : 0;
  const id = Object.keys(SET).find((key) => SET[key].path === words.join(" "));
  return id ? Number(id) : 0;
}

globalThis.LiveAPI = class {
  constructor(callback, target) {
    made++;
    this.callback = callback;
    this.object = SET[find(target)];
    this.found = find(target);
    this.observed = "";
  }
  // 0 once the object it was made for has gone, whatever has its id now
  get id() {
    return SET[this.found] === this.object ? this.found : 0;
  }
  get type() {
    asked_type++;
    return this.id ? this.object.type : "";
  }
  get path() {
    return this.id ? this.object.path : "";
  }
  get unquotedpath() {
    return this.path;
  }
  get(name) {
    return this.object.values[name];
  }
  set(name, value) {
    this.object.values[name] = [value];
    for (const api of observing) api.notify(name, this.object);
  }
  // Live reports the value as observation starts
  set property(name) {
    this.observed = name;
    if (name) {
      observing.add(this);
      this.notify(name, this.object);
    } else {
      observing.delete(this);
    }
  }
  get property() {
    return this.observed;
  }
  notify(name, object) {
    if (this.observed === name && this.object === object && this.callback) {
      this.callback([name, ...object.values[name]]);
    }
  }
};

const LiveObject = require(path.join(__dirname, "..", "dist", "index.js"));

function counting(work) {
  const before = { made, asked_type };
  const result = work();
  return { result, made: made - before.made, asked_type: asked_type - before.asked_type };
}

// an object is made without a LiveAPI object, and one made from an id knows its id
{
  const { result: bass, made } = counting(() => new LiveObject(["id", 2]));
  assert.equal(made, 0);
  assert.equal(counting(() => bass.id).made, 0);
  assert.equal(bass.id, 2);
  assert.equal(new LiveObject("id 3").id, 3);

  // the first use makes the one LiveAPI object it has
  assert.equal(counting(() => bass.get("name")).made, 1);
  assert.equal(counting(() => bass.get("mute")).made, 0);
  assert.equal(bass.get("name"), "Bass");
  assert.equal(bass.api, bass.api);
}

// the objects made from the same id share that LiveAPI object, and are objects of their own
{
  const bass = new LiveObject(["id", 2]);
  const again = new LiveObject("id 2");
  assert.equal(counting(() => [bass.get("name"), again.get("name")]).made, 0);
  assert.equal(bass.api, again.api);
  assert.notEqual(bass, again);
  assert.notEqual(bass.observers, again.observers);
}

// an object made from a path has to ask for its id, and shares nothing: the path can come
// to mean another object
{
  const drums = new LiveObject("live_set tracks 1");
  assert.equal(counting(() => drums.id).made, 1);
  assert.equal(drums.id, 3);
  assert.equal(drums.exists, true);
  assert.equal(counting(() => new LiveObject("live_set tracks 1").id).made, 1);
}
assert.equal(counting(() => LiveObject.song()).made, 1);
assert.equal(counting(() => [LiveObject.song(), LiveObject.song()]).made, 0);
assert.equal(LiveObject.song().tempo, 120);
// there is no live_app in this Set, and nothing is kept of what doesn't exist
assert.equal(LiveObject.app(), null);
assert.equal(counting(() => LiveObject.app()).made, 1);

// the children of a list cost nothing until they are used, and then once
{
  const song = LiveObject.song();
  const { result: tracks, made } = counting(() => song.get("tracks"));
  assert.equal(made, 0);
  assert.deepEqual(
    tracks.map((one) => one.id),
    [2, 3, 4, 5, 6, 7],
  );
  assert.equal(counting(() => tracks[2].get("name")).made, 1);
  assert.equal(counting(() => song.get("tracks")[2].get("name")).made, 0);
  assert.equal(counting(() => song.tracks.map((one) => one.name)).made, 4);
  assert.equal(counting(() => song.tracks.map((one) => one.name)).made, 0);
}

// Live is asked for the class of an object once, however many accessors and objects use it
{
  const lead = new LiveObject(["id", 5]);
  const { asked_type } = counting(() => [lead.name, lead.mute, lead.class_name, lead.name]);
  assert.equal(asked_type, 0); // the block above has asked
  assert.equal(counting(() => new LiveObject(["id", 5]).name).asked_type, 0);
  assert.equal(lead.name, "Lead");
  assert.equal(lead.is("Track"), true);

  lead.mute = 1;
  assert.equal(lead.get("mute"), 1);
  lead.mute = 0;
}

// an object that doesn't exist has no class, and nothing is kept of it
{
  const missing = new LiveObject("live_set tracks 9");
  assert.equal(missing.exists, false);
  assert.equal(missing.class_name, "");
  assert.equal(counting(() => missing.class_name).asked_type, 1);
  assert.equal(
    missing.observe("name", () => {}),
    null,
  );
  assert.equal(LiveObject.at("live_set tracks 9"), null);

  const no_such_id = new LiveObject(["id", 99]);
  assert.equal(no_such_id.exists, false);
  assert.equal(counting(() => new LiveObject(["id", 99]).exists).made, 1);
}

// when a Live object has gone, the LiveAPI object made for it isn't used for the next object
// with its id
{
  const pad = new LiveObject(["id", 6]);
  assert.equal(pad.get("name"), "Pad");
  SET[6] = track(4, "Strings");

  const strings = new LiveObject(["id", 6]);
  assert.equal(counting(() => strings.get("name")).made, 1);
  assert.equal(strings.get("name"), "Strings");
  assert.notEqual(strings.api, pad.api);
  assert.equal(pad.exists, false);
  assert.equal(new LiveObject(["id", 6]).api, strings.api);
}

// an object that hasn't been used observes with a LiveAPI object of its own
{
  const vox = new LiveObject(["id", 7]);
  const names = [];
  const { result: observer, made } = counting(() =>
    vox.observe("name", (name) => names.push(name)),
  );
  assert.equal(made, 1);
  assert.equal(vox.observers.name, vox.api);
  assert.deepEqual(names, ["Vox"]);
  assert.equal(counting(() => vox.get("mute")).made, 0);

  vox.set("name", "Voice");
  assert.deepEqual(names, ["Vox", "Voice"]);

  // a second member takes another
  const mutes = [];
  assert.equal(counting(() => vox.observe("mute", (mute) => mutes.push(mute))).made, 1);
  assert.notEqual(vox.observers.mute, vox.api);
  assert.deepEqual(mutes, [0]);
  assert.deepEqual(names, ["Vox", "Voice"]);

  observer.unobserve();
  vox.set("name", "Vox");
  assert.deepEqual(names, ["Vox", "Voice"]);
  assert.equal(vox.observers.name, undefined);
  assert.equal(vox.api.property, "");

  // which leaves the object's own free for the next
  assert.equal(counting(() => vox.observe("name", (name) => names.push(name))).made, 0);
  assert.equal(vox.observers.name, vox.api);
  assert.deepEqual(names, ["Vox", "Voice", "Vox"]);

  // what an earlier observe() returned doesn't stop a later observation
  observer.unobserve();
  vox.set("name", "Low");
  assert.deepEqual(names, ["Vox", "Voice", "Vox", "Low"]);

  // other objects for the same track observe for themselves
  const other = new LiveObject(["id", 7]);
  const heard = [];
  other.observe("name", (name) => heard.push(name));
  vox.set("name", "Vox");
  assert.deepEqual(names, ["Vox", "Voice", "Vox", "Low", "Vox"]);
  assert.deepEqual(heard, ["Low", "Vox"]);
  other.unobserve("name");

  vox.unobserve("name");
  vox.unobserve("mute");
  vox.set("name", "Vox");
  assert.deepEqual(names, ["Vox", "Voice", "Vox", "Low", "Vox"]);
  assert.deepEqual(heard, ["Low", "Vox"]);
  assert.equal(observing.size, 0);
}

// an object that has been used can't, and takes another LiveAPI object to observe with
{
  const drums = new LiveObject(["id", 3]);
  drums.get("name");
  const names = [];
  assert.equal(counting(() => drums.observe("name", (name) => names.push(name))).made, 1);
  assert.notEqual(drums.observers.name, drums.api);
  assert.deepEqual(names, ["Drums"]);

  // observing a member again replaces the callback
  const again = [];
  drums.observe("name", (name) => again.push(name));
  drums.set("name", "Kit");
  assert.deepEqual(names, ["Drums"]);
  assert.deepEqual(again, ["Drums", "Kit"]);

  drums.unobserve("name");
  assert.equal(observing.size, 0);
}

console.log("live-object: all assertions passed");
