// Ambient declarations for the Max [v8] / [js] / [jsui] / [v8ui] JavaScript API.
// Covers: LiveAPI.

// ---- LiveAPI ----

/**
 * A means of communicating with the Live API from JavaScript.
 *
 * Technical note: you cannot use the LiveAPI object in JavaScript global code. Use the
 * live.thisdevice object to determine when your Max Device has completely loaded (the
 * object sends a bang from its left outlet when the Device is fully initialized,
 * including the Live API).
 *
 * The LiveAPI object cannot be created or used in the high-priority thread, so users
 * should be sure to use the defer or deferlow objects to re-queue messages to the js object.
 * @see https://docs.cycling74.com/apiref/js/liveapi/
 */
declare class LiveAPI {
  /**
   * Constructs a new instance of the LiveAPI class.
   * @param callback a function to be called when the LiveAPI object refers to a new
   * object in Live (if the LiveAPI object's path changes, for instance) or when an
   * observed property changes
   * @param path the object in Live pointed to by the LiveAPI object (e.g.
   * "live_set tracks 0 devices 0") or a valid LiveAPI object id
   *
   * Documented as `(callback?: Function, path?: string)`; widened to accept the
   * common `new LiveAPI(null, path)` and id lists such as `["id", 3]` as returned by `get()`.
   */
  constructor(
    callback?: ((args: any[]) => void) | null,
    path?: string | number | (string | number)[],
  );

  /** An array of children of the object at the current path. */
  children: string[];
  /**
   * The id of the Live object referred to by the LiveAPI object. These ids are dynamic
   * and awarded in realtime from the Live application, so should not be stored and used
   * over multiple runs of Max for Live.
   */
  id: number;
  /** A description of the object at the current path, including id, type, children, properties and functions. */
  readonly info: string;
  /**
   * The follow mode of the LiveAPI object. 0 (default) means that LiveAPI follows the
   * object referred to by the path, even if it is moved in the Live user interface. A
   * mode of 1 means that LiveAPI updates the followed object based on its location in
   * the Live user interface.
   */
  mode: number;
  /** The patcher of the LiveAPI object, as passed into the constructor. */
  readonly patcher: Patcher;
  /**
   * The path to the Live object referred to by the LiveAPI object.
   * These paths are dependent on the currently open Set in Live, but are otherwise
   * stable: live_set tracks 0 devices 0 will always refer to the first device of the
   * first track of the open Live Set.
   */
  path: string;
  /**
   * The observed property, child or child-list of the object at the current path, if desired.
   * For instance, if the LiveAPI object refers to "live_set tracks 1", setting the
   * property to "mute" would cause changes to the "mute" property of the 2nd track to be
   * reported to the callback function defined in the LiveAPI Constructor.
   */
  property: string;
  /** The type of the currently observed property or child. */
  readonly proptype: string;
  /** The type of the object at the current path. */
  readonly type: string;
  /**
   * The path to the Live object referred to by the LiveAPI object, without any quoting
   * (the path property contains a quoted path).
   */
  unquotedpath: string;
  /** Whether the LiveAPI object refers to a valid Live object. */
  readonly valid: number;

  /**
   * Calls the given function of the current object, optionally with a list of arguments.
   * @param fn the name of the Live API function to call
   * @param args any arguments to the function
   */
  call(fn: string, ...args: any[]): any;
  /**
   * Returns the value or list of values of the specified property of the current object.
   * @param property the object's property
   *
   * Documented as `number | number[]`, but Live returns an atom list that can hold
   * strings, e.g. `["id", 3, "id", 4]` for object lists or a JSON string for some
   * properties, so the result is typed as `any[]`.
   */
  get(property: string): any[];
  /**
   * The count of children of the object at the current path.
   * @param child the child to count children of
   */
  getcount(child: string): number;
  /**
   * Returns the value or list of values of the specified property of the current object as a String object.
   * @param property the object's property
   */
  getstring(property: string): string | string[];
  /**
   * Navigates to the path and causes the id of the object at that path out be sent to
   * the callback function defined in the Constructor. If there is no object at the path,
   * id 0 is sent.
   */
  goto(path: string): void;
  /**
   * Sets the value or list of values of the specified property of the current object.
   * @param property the object's property to set
   * @param value the new value or values of the property
   */
  set(property: string, value: any): void;
}
