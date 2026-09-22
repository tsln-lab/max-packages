// Type-level tests for LiveObject. Nothing here runs; a test fails when the file stops
// type-checking.

import LiveObject = require("../src/index");

type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Expect<T extends true> = T;

export function liveObjectTests() {
  const maybeSong = LiveObject.song();
  type _song = Expect<Eq<typeof maybeSong, LiveObject<"Song"> | null>>;
  if (!maybeSong) return;
  const song = maybeSong;

  const tracks = song.get("tracks");
  type _tracks = Expect<Eq<typeof tracks, LiveObject<"Track">[]>>;

  const track = LiveObject.at("live_set tracks 0");
  type _track = Expect<Eq<typeof track, LiveObject<"Track"> | null>>;
  if (!track) return;

  const name = track.get("name");
  type _name = Expect<Eq<typeof name, string>>;

  const mixer = track.get("mixer_device");
  type _mixer = Expect<Eq<typeof mixer, LiveObject<"MixerDevice"> | null>>;

  const volume = mixer?.get("volume")?.get("value");
  type _volume = Expect<Eq<typeof volume, number | undefined>>;

  const outputs = LiveObject.thisDevice()?.get("audio_outputs");
  type _outputs = Expect<Eq<typeof outputs, LiveObject<"DeviceIO">[] | undefined>>;
  if (!outputs) return;

  const routing = outputs[0].get("available_routing_types");
  type _routing = Expect<Eq<typeof routing, Lom.RoutingType[]>>;

  track.set("mute", 1);
  track.call("insert_device", "Simpler", 0);
  track.get_count("devices");
  track.observe("devices", (devices) => {
    type _devices = Expect<Eq<typeof devices, LiveObject<"Device">[]>>;
  });

  for (const device of track.get("devices")) {
    if (device.is("SimplerDevice")) {
      device.get("sample");
    }
  }

  // accessors
  const devices = track.devices;
  type _devicesAccessor = Expect<Eq<typeof devices, LiveObject<"Device">[]>>;
  const trackName = track.name;
  type _nameAccessor = Expect<Eq<typeof trackName, string>>;
  const deviceType = devices[0].type;
  type _deviceType = Expect<Eq<typeof deviceType, number>>;
  const className = devices[0].class_name;
  type _className = Expect<Eq<typeof className, Lom.ClassName>>;
  track.mute = 1;
  track.name = "Bass";
  track.insert_device("Simpler", 0);
  const volumeValue = track.mixer_device?.volume?.value;
  type _volumeAccessor = Expect<Eq<typeof volumeValue, number | undefined>>;
  if (devices[0].is("SimplerDevice")) {
    const sample = devices[0].sample;
    type _sample = Expect<Eq<typeof sample, LiveObject<"Sample"> | null>>;
  }
  // LOM `overdub` is a property on Song and a function on LooperDevice
  song.overdub = 1;
  LiveObject.at("live_set tracks 0 devices 0")?.is("LooperDevice");

  // @ts-expect-error read-only accessor
  track.has_audio_input = 1;
  // @ts-expect-error wrong accessor value type
  track.name = 3;
  // @ts-expect-error wrong method argument type
  track.insert_device(42);
  // @ts-expect-error unknown accessor
  track.nmae;
  // @ts-expect-error Device base class has no sample accessor
  devices[0].sample;

  // @ts-expect-error unknown property
  track.get("nmae");
  // @ts-expect-error read-only property
  track.set("has_audio_input", 1);
  // @ts-expect-error wrong value type
  track.set("name", 3);
  // @ts-expect-error wrong argument type
  track.call("insert_device", 42);
  // @ts-expect-error not a list child
  track.get_count("mixer_device");
  // @ts-expect-error invalid literal path
  LiveObject.at("live_set trax 0");
  // @ts-expect-error paths only known at runtime need new LiveObject<Class>(path)
  LiveObject.at(String("live_set"));
  // @ts-expect-error the Device base class has no sample child; narrow with is() first
  track.get("devices")[0].get("sample");
}
