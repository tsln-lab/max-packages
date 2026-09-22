/// <reference types="@tsln/max-types" preserve="true" />
/// <reference types="@tsln/lom-types" preserve="true" />

import liveValue = require("./live-value");
const { normalizeLiveValue, toLiveValue, lomMemberKinds } = liveValue;

type LiveAPIPath = string | (string | number)[];

// Children of LOM objects resolve to LiveObjects (see Lom.ObjectTypes).
declare global {
  namespace Lom {
    interface ObjectTypes<C extends ClassName> {
      object: LiveObject<C>;
    }
  }
}

const wrap = (id: any[]) => new LiveObject(id);

// Resolves property access on a LiveObject: its own members first, then LOM members
// of the object's runtime class (`track.devices`, `track.mute = 1`, `clip.fire()`).
const accessorHandler: ProxyHandler<LiveObjectBase<any>> = {
  get(target, key, receiver) {
    if (typeof key === "string" && !(key in target)) {
      const kind = lomMemberKinds(target.class_name).get(key);
      if (kind === "value") return normalizeLiveValue(key, target.api.get(key), wrap);
      if (kind === "function") return (...args: any[]) => target.api.call(key, ...args);
    }
    return Reflect.get(target, key, receiver);
  },

  set(target, key, value, receiver) {
    if (
      typeof key === "string" &&
      !(key in target) &&
      lomMemberKinds(target.class_name).get(key) === "value"
    ) {
      target.api.set(key, toLiveValue(value, LiveObjectBase));
      return true;
    }
    return Reflect.set(target, key, value, receiver);
  },
};

/**
 * The methods and fields of every LiveObject. Use the `LiveObject` type and
 * constructor instead, which add the dynamic accessors for class C.
 */
class LiveObjectBase<C extends Lom.ClassName = Lom.ClassName> {
  /** The underlying LiveAPI object, for anything this wrapper doesn't cover. */
  api: LiveAPI;

  /** LiveAPI objects created by observe(), keyed by the observed member name. */
  observers: Record<string, LiveAPI> = {};

  /**
   * The current Live Set (`live_set`), or null if the Live API isn't available.
   *
   * Like all Live API access, this can't be used in global code; call it once the
   * device has loaded (e.g. after live.thisdevice bangs). It also returns null while the
   * Live API isn't ready, such as when live.thisdevice bangs as the script reloads after a save.
   *
   * @example
   * const song = LiveObject.song();
   * if (!song) return;
   */
  static song(): LiveObject<"Song"> | null {
    return LiveObject.at("live_set");
  }

  /** The Live application (`live_app`), or null if the Live API isn't available. See song(). */
  static app(): LiveObject<"Application"> | null {
    return LiveObject.at("live_app");
  }

  /**
   * The Max for Live device containing this script (`this_device`), or null if the Live API
   * isn't available. See song().
   */
  static thisDevice(): LiveObject<"MaxDevice"> | null {
    return LiveObject.at("this_device");
  }

  /**
   * Returns the object at a literal path, typed by the class the path resolves to.
   * Paths that aren't valid Live API paths are compile errors; for paths only known
   * at runtime, use `new LiveObject<Class>(path)` instead.
   *
   * @param path a literal path such as `"live_set tracks 0 devices 1"`
   * @returns the object, or null if nothing exists at that path in the current Set
   * @example
   * const device = LiveObject.at("live_set tracks 0 devices 1"); // LiveObject<"Device"> | null
   */
  static at<P extends string>(path: P & Lom.ValidPath<P>): LiveObject<Lom.ClassAtPath<P>> | null {
    const object = new LiveObject<Lom.ClassAtPath<P>>(path);
    return object.exists ? object : null;
  }

  /**
   * Creates a wrapper for the Live object at `path`. The class isn't checked against
   * the path, and the object may not exist; check `exists` if that matters, or use at(),
   * song(), app() or thisDevice(), which return null instead.
   *
   * The returned object also has an accessor for each member of its class, e.g.
   * `track.devices` for `track.get("devices")` and `clip.fire()` for `clip.call("fire")`.
   *
   * @param path a path such as `"live_set tracks 0"`, or an id list such as `["id", 3]`
   * @example
   * const io = new LiveObject<"DeviceIO">(path);
   */
  constructor(path: LiveAPIPath) {
    this.api = new LiveAPI(null, path);

    // biome-ignore lint/correctness/noConstructorReturn: the Proxy is the whole point of this class
    return new Proxy(this, accessorHandler as ProxyHandler<this>);
  }

  /**
   * The id Live assigned to the object: 0 if there is no object at the path, and
   * undefined if the Live API isn't available. Ids are only valid while Live is running;
   * don't store them between sessions.
   */
  get id() {
    return this.api.id;
  }

  /**
   * Whether this refers to an existing Live object: false when the id is 0, or undefined
   * because the Live API isn't available.
   */
  get exists() {
    if (!this.api.id) {
      return false;
    }

    return Number(this.api.id) !== 0;
  }

  /**
   * The actual LOM class of the object, which may be a subclass of C (e.g. "SimplerDevice").
   * Not to be confused with the `type` property of devices.
   */
  get class_name() {
    return this.api.type as Lom.ClassName;
  }

  /**
   * Narrows to a subclass when the object's runtime class matches, giving access to
   * that subclass's members.
   *
   * @param class_name a subclass of C, such as `"SimplerDevice"` for a Device
   * @example
   * if (device.is("SimplerDevice")) device.sample;
   */
  is<S extends Lom.SubclassOf<C>>(class_name: S): this is LiveObject<S> {
    return this.class_name === class_name;
  }

  /**
   * The index at the end of the path, e.g. 2 for `live_set tracks 2`.
   * NaN if the path doesn't end with an index (e.g. `live_set master_track`).
   */
  get index() {
    const parts = this.path.split(" ");
    return parseInt(parts.pop() ?? "", 10);
  }

  /**
   * The path to the object as Live reports it, e.g. `live_set tracks 0 devices 1`.
   * Per the LiveAPI docs this is quoted; `api.unquotedpath` has the unquoted form.
   */
  get path() {
    return this.api.path;
  }

  /** A description of the object from Live, listing its id, type, children, properties and functions. */
  get info() {
    return this.api.info;
  }

  /** Matches the track portion of a path; used by `track`. */
  track_regexp = /(live_set\stracks\s\d+)/;

  /**
   * The track containing this object, found from its path, e.g. `live_set tracks 0`
   * for `live_set tracks 0 devices 1`. Undefined for objects not under `live_set tracks N`
   * (including return tracks and the master track).
   */
  get track(): LiveObject<"Track"> | undefined {
    const track_path = this.path.match(this.track_regexp);

    return track_path ? new LiveObject<"Track">(track_path[0]) : undefined;
  }

  /**
   * The next object in the same list, e.g. `live_set tracks 2` for `live_set tracks 1`.
   * The result may not exist (check `exists`) when this is the last item.
   *
   * @returns the next object, or null if the path doesn't end with an index
   */
  next_object(): LiveObject<C> | null {
    const parts = this.path.split(" ");
    const index = parseInt(parts.pop() ?? "", 10);

    if (Number.isNaN(index)) {
      return null;
    }

    parts.push(String(index + 1));

    return new LiveObject<C>(parts.join(" "));
  }

  /**
   * Gets a child or property of the object. Same as the accessor of that name
   * (`track.get("devices")` is `track.devices`).
   *
   * - List children (e.g. `devices`) return an array of LiveObjects, possibly empty.
   * - Single children (e.g. `mixer_device`) return a LiveObject, or null if there is none.
   * - Dictionary properties (e.g. `routing_type`) return the parsed object.
   * - List properties (e.g. StringVector) return an array; other properties return a single value.
   *
   * @param name a child or property of C that supports get
   * @example
   * const devices = track.get("devices"); // LiveObject<"Device">[]
   * const name = track.get("name");       // string
   */
  get<K extends Lom.MemberWith<C, "get">>(name: K): Lom.MemberValue<C, K> {
    return normalizeLiveValue(name as string, this.api.get(name as string), wrap);
  }

  /**
   * Sets a property (or settable child) of the object. LiveObjects are sent to Live
   * as `id N` references. Same as assigning to the accessor (`track.set("mute", 1)`
   * is `track.mute = 1`).
   *
   * @param name a child or property of C that supports set
   * @param value the new value, of the same type get() returns for `name`
   * @example
   * track.set("mute", 1);
   * io.set("routing_type", io.get("available_routing_types")[0]);
   */
  set<K extends Lom.MemberWith<C, "set">>(name: K, value: NonNullable<Lom.MemberValue<C, K>>) {
    this.api.set(name as string, toLiveValue(value, LiveObjectBase));
  }

  /**
   * Calls a function of the object. Arguments are checked where the LOM reference
   * documents their types. The result is returned as Live sends it, without conversion.
   * Same as calling the method of that name (`clip.call("fire")` is `clip.fire()`).
   *
   * @param name a function of C
   * @param args the function's arguments
   * @example
   * track.call("insert_device", "Simpler", 0);
   */
  call<F extends keyof Lom.Functions<C> & string>(name: F, ...args: Lom.FunctionArgs<C, F>): any {
    return this.api.call(name, ...args);
  }

  /**
   * Returns how many items a list child has, without creating a LiveObject for each.
   *
   * @param name a list child of C, such as `devices` or `clip_slots`
   * @example
   * const deviceCount = track.get_count("devices");
   */
  get_count<K extends Lom.ListChild<C> & string>(name: K) {
    return this.api.getcount(name);
  }

  /**
   * Calls `callback` whenever a child or property changes, with the value converted
   * the same way as get(). Live may also call it once when observation starts. The
   * observer is stored in `observers` under `name`.
   *
   * Does nothing if the object doesn't exist, which also happens when the Live API isn't
   * ready yet (e.g. when live.thisdevice bangs while the script reloads after a save).
   *
   * @param name a child or property of C that supports observe
   * @param callback receives the new value
   * @returns whether observation started
   * @example
   * track.observe("devices", (devices) => post(devices.length, "\n"));
   */
  observe<K extends Lom.MemberWith<C, "observe">>(
    name: K,
    callback: (value: Lom.MemberValue<C, K>) => void,
  ): boolean {
    const property = name as string;

    // refer to the object by id: it was just checked to exist, whereas the path is
    // quoted and may not be valid yet while Live is still loading
    this.observers[property] = new LiveAPI(
      (message) => {
        if (message[0] === property) {
          callback(normalizeLiveValue(property, message.slice(1), wrap));
        }
      },
      ["id", this.api.id],
    );
    this.observers[property].property = property;
    return true;
  }
}

/**
 * A typed wrapper around LiveAPI. The class parameter C (a LOM class name such as
 * "Track") determines which children, properties and functions are available, both
 * through get()/set()/call() and as accessors (`track.devices`, `track.mute = 1`).
 *
 * - `LiveObject.at("live_set tracks 0")` infers the class from a literal path.
 * - `new LiveObject<"DeviceIO">(path)` states it for paths only known at runtime.
 *
 * Accessors read from Live on every access and return new LiveObjects each time, so
 * store the result in a variable when using it more than once.
 */
type LiveObject<C extends Lom.ClassName = Lom.ClassName> = LiveObjectBase<C> &
  // members named like a LiveObjectBase member (e.g. `get`) are only reachable through get()/call()
  Omit<Lom.Accessors<C>, keyof LiveObjectBase>;

type LiveObjectConstructor = Omit<typeof LiveObjectBase, "prototype"> & {
  new <C extends Lom.ClassName = Lom.ClassName>(path: LiveAPIPath): LiveObject<C>;
  readonly prototype: LiveObjectBase;
};

const LiveObject = LiveObjectBase as unknown as LiveObjectConstructor;

export = LiveObject;
