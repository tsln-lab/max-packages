// Ambient declarations for the Max [v8] / [js] / [jsui] / [v8ui] JavaScript API.
// Covers: Patcher, Maxobj, MaxobjConnection, MaxobjListener, MaxobjListenerData,
// ParameterListener, ParameterListenerData, ParameterInfoProvider,
// ParameterInfoProviderData, SnapshotAPI.

// ---- Patcher ----

/**
 * A JavaScript representation of a Max patcher.
 *
 * You can find, create, modify, and iterate through objects within a patcher,
 * send messages to a patcher that you would use with the thispatcher object, and more.
 * @see https://docs.cycling74.com/apiref/js/patcher/
 */
declare class Patcher {
  /** Constructs a new instance of the Patcher class with default window coordinates (100, 100, 400, 400). */
  constructor();
  /**
   * Constructs a new instance of the Patcher class.
   * @param left x-coordinate of the new top-left corner
   * @param top y-coordinate of the new top-left corner
   * @param bottom y-coordinate of the new bottom-right corner
   * @param right x-coordinate of the new bottom-right corner
   */
  constructor(left: number, top: number, bottom: number, right: number);

  /** The accent color in the current style. */
  readonly accentcolor: number[];
  /** The background color in the current style. */
  readonly bgcolor: number[];
  /** The object background color in the current style. */
  readonly bgfillcolor: Dict;
  /** If the patcher is a subpatcher, the box property returns the Maxobj that contains it. */
  readonly box: Maxobj;
  /** Bubble background color in the current style. */
  readonly bubble_bgcolor: number[];
  /** Bubble outline color in the current style. */
  readonly bubble_outlinecolor: number[];
  /** Clear color in the current style. */
  readonly clearcolor: number[];
  /** The object color in the current style. */
  readonly color: number[];
  /** Number of objects in the patcher. */
  readonly count: number;
  /** Dark color in the current style. */
  readonly darkcolor: number[];
  /** Unlocked patcher background color in the current style. */
  readonly editing_bgcolor: number[];
  /** The element color in the current style. */
  readonly elementcolor: number[];
  /** The patcher's file path on disk. */
  readonly filepath: string;
  /**
   * If the patcher contains objects, this is the first one in its list.
   * You can iterate through all objects in a patcher using the Maxobj.nextobject property.
   *
   * Documented as `Maxobj`; widened because an empty patcher has no first object.
   */
  readonly firstobject: Maxobj | undefined;
  /** Light color in the current style. */
  readonly lightcolor: number[];
  /** Locked patcher background color in the current style. */
  readonly locked_bgcolor: number[];
  /**
   * Whether the patcher is locked.
   * This property is read-only in the runtime version of Max.
   */
  locked: boolean;
  /** Returns "patcher". */
  readonly maxclass: string;
  /** The patcher's name which is its window title (without any brackets that appear for subpatchers). */
  name: string;
  /** Get the Max class name of the parent object if this.patcher is a subpatcher, or a nil value if this is a top-level patcher. */
  readonly parentclass: string;
  /** Get the parent patcher if this.patcher is a subpatcher, otherwise a nil value. */
  readonly parentpatcher: Patcher | undefined;
  /** Patch cord color in the current style. */
  readonly patchlinecolor: number[];
  /** The selection color in the current style. */
  readonly selectioncolor: number[];
  /** Stripe color in the current style. */
  readonly stripecolor: number[];
  /** Syntax color for attribute arguments in the current style. */
  readonly syntax_attrargcolor: number[];
  /** Syntax color for object attributes in the current style. */
  readonly syntax_attributecolor: number[];
  /** Syntax color for object arguments in the current style. */
  readonly syntax_objargcolor: number[];
  /** Syntax color for object names in the current style. */
  readonly syntax_objectcolor: number[];
  /** The inverse text color in the current style. */
  readonly textcolor_inverse: number[];
  /** The text color in the current style. */
  readonly textcolor: number[];
  /** Get the Wind associated with the patcher. */
  readonly wind: Wind;

  /**
   * For all objects in a patcher, call a given function with each object's Maxobj as an argument.
   * Does not recurse into subpatchers.
   * @param fn A callback function
   */
  apply(fn: (obj: Maxobj) => void): void;
  /**
   * For all objects in a patcher, recursing into subpatchers, call a given function
   * with each object's Maxobj as an argument.
   * @param fn A callback function
   */
  applydeep(fn: (obj: Maxobj) => void): void;
  /**
   * For all objects in a patcher, recursing into subpatchers, call a given function
   * with each object's Maxobj as an argument if a test function returns true.
   */
  applydeepif(apply_fn: (obj: Maxobj) => void, test_fn: (obj: Maxobj) => boolean): void;
  /**
   * For all objects in a patcher, call a given function with each object's Maxobj as an
   * argument if a test function returns true. Does not recurse into subpatchers.
   * @param applyFn A callback function which takes a Maxobj and runs if testFn returns true
   * @param testFn A function which takes a Maxobj as an argument and returns a boolean
   */
  applyif(applyFn: (obj: Maxobj) => void, testFn: (obj: Maxobj) => boolean): void;
  /**
   * Move an object to the front of the current layer (background or foreground).
   * You can change the layer by setting the Maxobj.background property.
   * @param object the object to move
   */
  bringtofront(object: Maxobj): void;
  /**
   * Connect two Maxobj objects in a patcher.
   * Indices for the outlet and inlet arguments start at 0 for the leftmost inlet or outlet.
   * @param fromObj Source object
   * @param outlet Index of outlet from source object
   * @param toObj Destination object
   * @param inlet Index of inlet of destination object
   */
  connect(fromObj: Maxobj, outlet: number, toObj: Maxobj, inlet: number): void;
  /**
   * Disconnect two connected Maxobj objects in a patcher.
   * Indices for the outlet and inlet arguments start at 0 for the leftmost inlet or outlet.
   */
  disconnect(fromObj: Maxobj, outlet: number, toObj: Maxobj, inlet: number): void;
  /**
   * Get the value of a specified patcher attribute.
   * @param attrname the attribute name
   */
  getattr(attrname: string): string[];
  /**
   * Get the value of a specified patcher attribute's attribute.
   * This method is only available in the new v8 javascript engine objects.
   */
  getattrattr(attrName: string, attrAttrName: string): number | number[] | string;
  /** Get an array of all available attributes for the patcher. */
  getattrnames(): string[];
  /**
   * Collect all objects in a patcher which, when passed to a test function, cause that
   * function to return true.
   * @param testFn A function which takes a Maxobj as an argument and returns a boolean
   */
  getlogical(testFn: (obj: Maxobj) => boolean): Maxobj[] | undefined;
  /**
   * Get the first object found in a patcher with a given name.
   * The name is the local varname specified via the Object > Name... menu or the
   * varname property in the Inspector.
   * @param name The name of the object to retrieve
   */
  getnamed(name: string): Maxobj;
  /**
   * Connect two Maxobj objects in a patcher with a hidden patch cord.
   * Indices for the outlet and inlet arguments start at 0 for the leftmost inlet or outlet.
   */
  hiddenconnect(fromObj: Maxobj, outlet: number, toObj: Maxobj, inlet: number): void;
  /**
   * Send an arbitrary message to the patcher.
   * @param name the message name
   * @param args arguments to the message
   */
  message(name: string, ...args: any[]): any;
  /**
   * Create a new object at a specified location.
   * @param left the x-coordinate of the new object's top-left corner
   * @param top the y-coordinate of the new object's top-left corner
   * @param classname the classname of the Max object to create
   * @param args arguments to pass to the Max object
   */
  newdefault(left: number, top: number, classname: string, ...args: any[]): Maxobj;
  /**
   * Create a new Max object.
   * @param classname the classname of the Maxobj to create
   * @param args any arguments to pass to the Maxobj
   */
  newobject(classname: string, ...args: any[]): Maxobj;
  /**
   * Remove a Maxobj from the patcher.
   * @param object The Maxobj to remove
   */
  remove(object: Maxobj): void;
  /**
   * Send an object to the back of the current layer (background or foreground).
   * You can change the layer by setting the Maxobj.background property.
   * @param object the object to move
   */
  sendtoback(object: Maxobj): void;
  /**
   * Set the value of a specified patcher attribute.
   * @param attrname the attribute name
   * @param value the value of the attribute
   */
  setattr(attrname: string, value: any): void;
  /**
   * Set the value of a specified patcher attribute to its default value (if a default value is defined).
   * This method is only available in the new v8 javascript engine objects.
   */
  setattrdefault(attrName: string): void;
}

// ---- Maxobj ----

/**
 * A JavaScript representation of a Max object in a patcher.
 *
 * You can send any message to a Maxobj that you can send to a Max object. Reserved
 * JavaScript words (e.g. int, float, delete) must be sent via array notation or the
 * message method, e.g. `n["int"](23)` or `n.message("int", 23)`.
 * @see https://docs.cycling74.com/apiref/js/maxobj/
 */
declare class Maxobj {
  /** Whether the object is in the patchers background layer. */
  background: boolean;
  /**
   * The text contained in the object box (if present).
   * This property is only available in the new v8 javascript engine objects.
   */
  readonly boxtext: string;
  /**
   * Whether the object can be selected for text entry.
   * A number box would be one example of an object which would return true.
   */
  readonly canhilite: boolean;
  /**
   * If the object is set to use one of the standard 16 colors, the index of the color.
   * @deprecated This API is deprecated
   */
  colorindex: number;
  /** Whether the object is hidden in a locked patcher. */
  hidden: boolean;
  /** Whether the object ignores clicks. */
  ignoreclick: boolean;
  /**
   * If the Maxobj refers to an object that is a js Max class, this returns the associated jsthis object.
   * This property is only available in the legacy js javascript engine objects.
   */
  readonly js: any;
  /**
   * The Max class.
   * This is different from the JavaScript class ("Maxobj") which is accessed via the standard class property.
   */
  readonly maxclass: string;
  /** The next object in the patcher's list of objects, otherwise nil. */
  readonly nextobject: Maxobj | undefined;
  /** An object containing two arrays, inputs, and outputs, each of which may contain MaxobjConnection objects. */
  readonly patchcords: { inputs: MaxobjConnection[]; outputs: MaxobjConnection[] };
  /** The Patcher object that contains the Maxobj. */
  readonly patcher: Patcher;
  /**
   * The location of an object in a patcher (left, top, right, bottom).
   * When the object's rectangle is changed, it will move on screen if it's visible.
   */
  rect: [number, number, number, number];
  /** Whether the object is selected in an unlocked patcher window. */
  selected: boolean;
  /**
   * Whether the Maxobj refers to a valid Max object.
   * A Maxobj could eventually refer to an object that no longer exists if the underlying
   * Max object is freed. The valid property can be used to test for this condition.
   */
  readonly valid: boolean;
  /** The patcher-specific name of the object as set in the inspector or via the Object > Name... menu option. */
  varname: string;

  /**
   * Get the attribute name corresponding to a style mapping name.
   * @param mapname the style map name
   * @returns the attribute name for the given style map name
   */
  attrname_forstylemap(mapname: string): string;
  /**
   * Get the value of an attribute.
   * @param attrName the attribute name
   */
  getattr(attrName: string): number | number[] | string;
  /**
   * Get the value of an attribute's attribute.
   * This method is only available in the new v8 javascript engine objects.
   */
  getattrattr(attrName: string, attrAttrName: string): number | number[] | string;
  /** Get all available attributes for the object. */
  getattrnames(): string[];
  /**
   * Get the value of the object's box attribute.
   * @param attrName the attribute name
   */
  getboxattr(attrName: string): number | number[] | string;
  /**
   * Get the value of the object's box attribute's attribute.
   * This method is only available in the new v8 javascript engine objects.
   */
  getboxattrattr(attrName: string, attrAttrName: string): number | number[] | string;
  /** Get the names of all available attributes for the object's box. */
  getboxattrnames(): string[];
  /**
   * Get the current value of the object, if supported.
   * @returns the object's current value
   */
  getvalueof(): any;
  /** Open a help file describing an object, if it exists. */
  help(): void;
  /**
   * Send the object a message with any additional arguments.
   * This is useful for sending messages to objects which dynamically dispatch messages
   * with the anything message like js, jsui, lcd, and others.
   * @param message the message to send
   * @param args any arguments for the message
   */
  message(message: string, ...args: any[]): void;
  /**
   * Set the value of an attribute.
   * @param attrName the attribute name
   * @param value the new attribute value
   */
  setattr(attrName: string, value: number | number[] | string): void;
  /**
   * Set the value of an attribute to its default value (if a default value is defined).
   * This method is only available in the new v8 javascript engine objects.
   */
  setattrdefault(attrName: string): void;
  /**
   * Set the value of a box attribute.
   * @param attrName the attribute name
   * @param value the new attribute value
   */
  setboxattr(attrName: string, value: number | number[] | string): void;
  /**
   * Set the value of the object's box attribute to its default value (if a default value is defined).
   * This method is only available in the new v8 javascript engine objects.
   */
  setboxattrdefault(attrName: string): void;
  /**
   * Set the value of the object, if supported.
   * @param args the value(s) to set
   */
  setvalueof(...args: any[]): void;
  /**
   * If the object contains a patcher, returns a Patcher, otherwise nil.
   * @param index an instance number (only used with poly~)
   */
  subpatcher(index?: number): Patcher | undefined;
  /**
   * Get whether the object has an entry in its message list for a given string.
   * If the entry is not a message that can be sent by a user within Max (i.e. it's a
   * C-level "untyped" message), false is returned. This doesn't work for messages which
   * are dynamically dispatched with the anything message, as is the case for instances
   * of js, jsui, lcd, and others.
   * @param message an object message
   */
  understands(message: string): boolean;

  /** A Maxobj accepts any Max message as a dynamically dispatched method call, e.g. `n["int"](23)`. */
  [message: string]: any;
}

// ---- MaxobjConnection ----

/**
 * A JavaScript representation of a patchcord connection.
 * @see https://docs.cycling74.com/apiref/js/maxobjconnection/
 */
declare class MaxobjConnection {
  /** The inlet index on the destination object. */
  readonly dstinlet: number;
  /** The destination Maxobj. */
  readonly dstobject: Maxobj;
  /** The source Maxobj. */
  readonly srcobject: Maxobj;
  /** The outlet index on the source object. */
  readonly srcoutlet: number;
}

// ---- MaxobjListener / MaxobjListenerData ----

/**
 * A listener for changes in a Maxobj object.
 *
 * The MaxobjListener object listens for changes to a Maxobj object's value, or changes
 * to a specified attribute of a Maxobj object. When a change occurs, a user-specified
 * function will be called. The object also provides methods for getting and setting the
 * value of the observed value or attribute.
 * @see https://docs.cycling74.com/apiref/js/maxobjlistener/
 */
declare class MaxobjListener {
  /**
   * Constructs a new instance of the MaxobjListener class.
   *
   * Without an attribute name provided, the listener will observe the value of the object
   * itself. Not every Max object has an observable value -- objects compatible with the
   * pattr family of Max objects can be observed in this fashion. Practically, that means
   * nearly every UI object as well as a handful of normal Max box objects (including js,
   * pattr and dict). Attributes can be observed for any Maxobj which has attributes.
   * @param object the object to attach a listener to
   * @param fn the callback function which takes a MaxobjListenerData as an argument
   */
  constructor(object: Maxobj, fn: (data: MaxobjListenerData) => void);
  /**
   * Create a MaxobjListener that observes a specific attribute.
   * @param object the object to attach a listener to
   * @param attrName the attribute to listen to
   * @param fn the callback function which takes a MaxobjListenerData as an argument
   */
  constructor(object: Maxobj, attrName: string, fn: (data: MaxobjListenerData) => void);

  /** An attribute to observe for changes, if desired. */
  readonly attrname: string;
  /** The Maxobj to observe. */
  readonly maxobject: Maxobj;
  /** Whether to execute the callback function in response to calling MaxobjListener.setvalue() from this MaxobjListener. */
  silent: number;

  /** Get the value of the Maxobj or its specified attribute. */
  getvalue(): number | number[] | string;
  /**
   * Set the value of a the Maxobj or its specified attribute, but don't execute the callback function.
   * @param value the new value
   */
  setvalue_silent(value: number): void;
  /**
   * Set the value of the Maxobj or its specified attribute.
   * @param value the new value
   */
  setvalue(value: any): void;
}

/**
 * The argument provided to a MaxobjListener callback function.
 * @see https://docs.cycling74.com/apiref/js/maxobjlistenerdata/
 */
interface MaxobjListenerData {
  /** If the MaxobjListener is observing an attribute, the attributes name, otherwise undefined. */
  readonly attrname: string | undefined;
  /** The MaxobjListener which called the function. */
  readonly listener: MaxobjListener;
  /** The Maxobj being observed. */
  readonly maxobject: Maxobj;
  /** The current value of the observed object or attribute. */
  readonly value: number | number[] | string;
}

// ---- ParameterListener / ParameterListenerData ----

/**
 * A listener for changes in named parameters.
 *
 * The ParameterListener listens for changes to the value of a named Max parameter. When a
 * change occurs, a user-specified callback function will be called. The object also
 * provides methods for getting and setting the value of the observed parameter.
 * @see https://docs.cycling74.com/apiref/js/parameterlistener/
 */
declare class ParameterListener {
  /**
   * Constructs a new instance of the ParameterListener class.
   * @param paramName the parameter name
   * @param fn the callback function which takes a ParameterListenerData as an argument
   */
  constructor(paramName: string, fn: (data: ParameterListenerData) => void);

  /** The name of the parameter to observe. */
  name: string;
  /** Whether to execute the callback function in response to calling ParameterListener.setvalue() from this ParameterListener. */
  silent: number;

  /** Get the value of a parameter. */
  getvalue(): number | number[] | string;
  /**
   * Set the value of a parameter, but don't execute the callback function.
   * @param value the new parameter value
   */
  setvalue_silent(value: number): void;
  /**
   * Set the value of a parameter.
   * @param value the new parameter value
   */
  setvalue(value: any): void;
}

/**
 * The argument provided to a ParameterListener callback function.
 * @see https://docs.cycling74.com/apiref/js/parameterlistenerdata/
 */
interface ParameterListenerData {
  /** The ParameterListener which called the function. */
  readonly listener: ParameterListener;
  /** The name of the changed parameter. */
  readonly name: string;
  /** The current value of the parameter. */
  readonly value: number | number[] | string;
}

// ---- ParameterInfoProvider / ParameterInfoProviderData ----

/**
 * Provides a list of named parameter objects within a patcher hierarchy as well as
 * information about specific parameter objects. It can also notify when parameter
 * objects are added or removed from a patcher hierarchy.
 * @see https://docs.cycling74.com/apiref/js/parameterinfoprovider/
 */
declare class ParameterInfoProvider {
  /**
   * Constructs a new instance of the ParameterInfoProvider class.
   * @param fn a callback function to execute when receiving parameter change notifications
   * which takes a ParameterInfoProviderData as an argument
   */
  constructor(fn?: (data: ParameterInfoProviderData) => void);

  /**
   * Get parameter info like its type and range.
   * The exact contents of the object will vary depending on the type of the parameter and
   * will need to be enumerated. The object always contains a property maxobj which is the
   * Maxobj for the Max object hosting the parameter.
   * @param paramName the parameter to find info for
   */
  getinfo(paramName: string): any[];
  /** Get a list of parameter objects' names from the patcher hierarchy. */
  getnames(): string[];
}

/**
 * The argument to the ParameterInfoProvider's callback function.
 * @see https://docs.cycling74.com/apiref/js/parameterinfoproviderdata/
 */
interface ParameterInfoProviderData {
  /** The names of any added parameters. */
  readonly added: string[];
  /** The ParameterInfoProvider which called the function. */
  readonly provider: ParameterInfoProvider;
  /** The names of any removed parameters. */
  readonly removed: string[];
}

// ---- SnapshotAPI ----

/**
 * Provides access to patcher snapshots.
 * @see https://docs.cycling74.com/apiref/js/snapshotapi/
 */
declare class SnapshotAPI {
  /**
   * Constructs a new instance of the SnapshotAPI class.
   * @param varname the varname of an object to snapshot, or 'patcher' for a patcher snapshot
   */
  constructor(varname: string);

  /**
   * Create a snapshot at a given index, appending to the snapshot list if the index is
   * already occupied.
   * @param userpath the pathname to the maxsnap file within the user Snapshots directory (default: autogenerated)
   * @param index the snapshot index (default: 0)
   * @param name the snapshot name (default: name of object)
   */
  addsnapshot(userpath?: string, index?: number, name?: string): void;
  /**
   * Delete a snapshot.
   * @param index the snapshot index
   * @param newcurrent optional index to set as the new current snapshot
   */
  deletesnapshot(index?: number, newcurrent?: number): void;
  /**
   * Save a snapshot to a file.
   * @param index the snapshot index
   * @param userpath the pathname to the maxsnap file within in the user Snapshots directory (default: autogenerated)
   */
  exportsnapshot(index: number, userpath?: string): void;
  /**
   * Query the 'embed' state of a snapshot.
   * @param index the snapshot index
   * @returns 1 if the snapshot at the index is embedded, 0 if not
   */
  getembedsnapshot(index: number): number;
  /** Get the total number of snapshots. */
  getnumsnapshots(): number;
  /**
   * Get the name of the snapshot at a given index.
   * @param index the snapshot index
   */
  getsnapshotname(index: number): string;
  /**
   * Load a snapshot from a file into a given slot.
   * @param index the snapshot index
   * @param userpath the pathname to the maxsnap file within in the user Snapshots directory
   */
  importsnapshot(index?: number, userpath?: string): void;
  /**
   * Change a snapshot's index.
   * Does nothing if the srcIndex or destIndex doesn't exist.
   * @param srcIndex the current snapshot index
   * @param destIndex the new snapshot index
   */
  movesnapshot(srcIndex: number, destIndex: number): void;
  /**
   * Restore a snapshot.
   * @param index the snapshot index
   * @param userpath optional path to a maxsnap file to restore from
   */
  restore(index?: number, userpath?: string): void;
  /**
   * Set the embed state of a snapshot.
   * @param index the snapshot index
   * @param embedstate 1 if embedded, 0 if not
   */
  setembedsnapshot(index: number, embedstate: number): void;
  /**
   * Set the name of the snapshot at the given index.
   * @param index the snapshot index
   * @param name the snapshot name
   */
  setsnapshotname(index: number, name: string): void;
  /**
   * Create a snapshot at a given index.
   * Unlike SnapshotAPI.addsnapshot(), snapshot will overwrite existing snapshots.
   * @param userpath the pathname to the maxsnap file within in the user Snapshots directory (default: autogenerated)
   * @param index the snapshot index (default: 0)
   * @param name the snapshot name (default: name of object)
   */
  snapshot(userpath?: string, index?: number, name?: string): void;
}
