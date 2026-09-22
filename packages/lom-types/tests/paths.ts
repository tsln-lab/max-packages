// Type-level tests for the LOM types. Nothing here runs; a test fails when the file
// stops type-checking.

type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Expect<T extends true> = T;

// ---- path resolution ----

export type PathTests = [
  Expect<Eq<Lom.ClassAtPath<"live_set">, "Song">>,
  Expect<Eq<Lom.ClassAtPath<"this_device">, "MaxDevice">>,
  Expect<Eq<Lom.ClassAtPath<"this_device audio_outputs 0">, "DeviceIO">>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0">, "Track">>,
  Expect<Eq<Lom.ClassAtPath<"live_set return_tracks 2">, "Track">>,
  Expect<Eq<Lom.ClassAtPath<"live_set master_track">, "Track">>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 view">, "Track.View">>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 devices 1">, "Device">>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 devices 1 parameters 3">, "DeviceParameter">>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 devices 1 sample">, "Sample">>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 devices 1 chains 0 devices 2">, "Device">>,
  Expect<
    Eq<Lom.ClassAtPath<"live_set tracks 0 devices 1 chains 0 mixer_device">, "ChainMixerDevice">
  >,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 devices 1 drum_pads 36 chains 0">, "Chain">>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 mixer_device volume">, "DeviceParameter">>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 mixer_device sends 1">, "DeviceParameter">>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 clip_slots 3 clip">, "Clip">>,
  // invalid paths
  Expect<Eq<Lom.ClassAtPath<"live_set tracks">, never>>,
  Expect<Eq<Lom.ClassAtPath<"live_set trax 0">, never>>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 devices 1 chains">, never>>,
  Expect<Eq<Lom.ClassAtPath<"live_set tracks 0 mixer_device sends">, never>>,
];

// ---- member lookups ----

export type MemberTests = [
  Expect<
    Eq<
      Lom.MemberWith<"DeviceIO", "set">,
      "default_external_routing_channel_is_none" | "routing_channel" | "routing_type"
    >
  >,
  Expect<Eq<Lom.ListChild<"Track">, "take_lanes" | "clip_slots" | "arrangement_clips" | "devices">>,
];

// ---- access helpers, with no wrapper registered ----

export type AccessTests = [
  Expect<Eq<Lom.ObjectType<"Track">, unknown>>,
  Expect<Eq<Lom.MemberValue<"Track", "name">, string>>,
  Expect<Eq<Lom.MemberValue<"Track", "devices">, unknown[]>>,
  Expect<Eq<Lom.FunctionArgs<"Track", "insert_device">, [device_name: string, position?: number]>>,
];
