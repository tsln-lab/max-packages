// A [v8] script: put `v8 device.js` in an object box, with this project's js/ folder in
// Max's search path. Rename or copy this file; every file at the top of src/ becomes a script.

import console = require("@tsln/console");
import LiveObject = require("@tsln/live-object");
import timers = require("@tsln/timers");

inlets = 1;
outlets = 1;
// reload in Max when js/device.js changes, which `npm run watch` makes happen on save
autowatch = 1;

function bang() {
  console.log("bang");
  outlet(0, "bang");
}

function msg_int(value: number) {
  outlet(0, value * 2);
}

function list(...values: number[]) {
  console.log("list of", values.length, values);
}

// Any other message calls the function of the same name: `gain 0.5` calls gain(0.5).
function gain(value: number) {
  timers.setTimeout(() => outlet(0, "gain", value), 100);
}

// The Live API is only available in a Max for Live device, and not from global code:
// wait for [live.thisdevice] to bang, and send that here.
function live_ready() {
  const song = LiveObject.song();
  if (!song) return;
  console.log("tempo", song.tempo, "tracks", song.get_count("tracks"));
  song.observe("tempo", (tempo) => outlet(0, "tempo", tempo));
}

function notifydeleted() {
  timers.clearAll();
}

// Lists the handlers Max calls, so their signatures are checked against Max's. Compiles to
// nothing. Not exported: an `export` would make the bundler treat the script as a module and
// add a `module.exports` line, which a top-level [v8] script can't run.
type MaxHandlers = Handlers<{
  bang: typeof bang;
  msg_int: typeof msg_int;
  list: typeof list;
  gain: typeof gain;
  live_ready: typeof live_ready;
  notifydeleted: typeof notifydeleted;
}>;
