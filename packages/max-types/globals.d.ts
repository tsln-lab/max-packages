// Ambient declarations for the Max [v8] / [js] / [jsui] / [v8ui] JavaScript API:
// jsthis (the global script scope), post/cpost/error/messnamed, Global, Task,
// Max, and Wind.
// Transcribed from https://docs.cycling74.com/apiref/js/

// ==== jsthis ====
//
// The members below (properties and callable methods) are the built-in
// members of the "jsthis" object, which forms the global scope of a Max
// js/jsui/v8ui script: assigning `inlets = 2` at the top level sets the
// jsthis.inlets property, calling `outlet(0, x)` calls jsthis.outlet(), etc.
// jsthis itself cannot be instantiated or referenced by name.
//
// In addition to the callable functions declared below, Max invokes message
// handlers and event hooks that YOU implement as top-level functions in your
// script. They are not declared as functions here (that would conflict with
// your definitions); their signatures are described by ScriptHandlers instead.

// ---- script handlers ----

/** Mouse arguments shared by the jsui/v8ui mouse hooks, after x and y. */
type MouseHookArgs = [
  button: number,
  mod1: number,
  shift: number,
  caps: number,
  opt: number,
  mod2: number,
];

/**
 * Signatures of the functions Max calls on a script when it receives messages
 * or UI events. Implement them as top-level functions; see Handlers<T>.
 * @see https://docs.cycling74.com/apiref/js/jsthis/
 */
interface ScriptHandlers {
  /** Called if no specific function matches the received message; see `messagename`. */
  anything: (...args: any[]) => void;
  /** Called when the object receives a bang. */
  bang: () => void;
  /** Called when the object receives a list (a message beginning with a number). */
  list: (...values: any[]) => void;
  /** Called when the patcher containing the object is loaded. */
  loadbang: () => void;
  /** Called when the object is deleted. */
  notifydeleted: () => void;
  /** Called when the patcher is saved; use embedmessage() to store state. */
  save: () => void;
  /** Called when the object receives an int. */
  msg_int: (value: number) => void;
  /** Called when the object receives a float. */
  msg_float: (value: number) => void;
  /** Called when the object receives a string. */
  msg_string: (value: string) => void;
  /** Called when the object receives an array. */
  msg_array: (value: any[]) => void;
  /** Called when the object receives a dictionary. */
  msg_dictionary: (value: object) => void;
  /** Lets pattr and related objects query the object's current value. */
  getvalueof: () => any;
  /** Lets pattr and related objects set the object's current value. */
  setvalueof: (...args: (number | string)[]) => void;
  /** jsui/v8ui: return nonzero if the point hits the object. */
  hittest: (x: number, y: number) => number | boolean;
  /** jsui/v8ui: draws the object with mgraphics. */
  paint: () => void;
  /** jsui/v8ui: mouse button pressed. */
  onclick: (x: number, y: number, ...args: [...MouseHookArgs, pointerevent?: PointerEvent]) => void;
  /** jsui/v8ui: mouse double-clicked. */
  ondblclick: (x: number, y: number, ...args: MouseHookArgs) => void;
  /** jsui/v8ui: mouse dragged (or released, when button is 0). */
  ondrag: (x: number, y: number, ...args: [...MouseHookArgs, pointerevent?: PointerEvent]) => void;
  /** jsui/v8ui: mouse moved over the object. */
  onidle: (x: number, y: number, ...args: [...MouseHookArgs, pointerevent?: PointerEvent]) => void;
  /** jsui/v8ui: mouse left the object. */
  onidleout: (
    x: number,
    y: number,
    ...args: [...MouseHookArgs, pointerevent?: PointerEvent]
  ) => void;
  /** jsui/v8ui: the object was resized. */
  onresize: (width: number, height: number) => void;
  /** jsui/v8ui: mouse wheel scrolled. */
  onwheel: (
    x: number,
    y: number,
    scrollx: number,
    scrolly: number,
    mod1: number,
    shift: number,
    caps: number,
    opt: number,
    mod2: number,
  ) => void;
  /** v8ui: the object gained keyboard focus. */
  onfocus: () => void;
  /** v8ui: the object lost keyboard focus. */
  onblur: () => void;
  /** v8ui: key pressed; return nonzero to consume the event. */
  onkeydown: (
    keycode: number,
    textcharacter: number,
    updown: number,
    mod1: number,
    shift: number,
    caps: number,
    opt: number,
    mod2: number,
  ) => number | void;
  /** v8ui: pointer pressed. */
  onpointerdown: (pointerevent: PointerEvent) => void;
  /** v8ui: pointer released. */
  onpointerup: (pointerevent: PointerEvent) => void;
  /** v8ui: pointer moved. */
  onpointermove: (pointerevent: PointerEvent) => void;
  /** v8ui: pointer entered the object. */
  onpointerenter: (pointerevent: PointerEvent) => void;
  /** v8ui: pointer left the object. */
  onpointerleave: (pointerevent: PointerEvent) => void;
}

/**
 * Lists the top-level functions Max calls on a script, so TypeScript counts them
 * as used and checks built-in handlers against ScriptHandlers. Any other key is
 * treated as a custom message handler. Export it from the script; type-only
 * exports are erased, so nothing is emitted:
 *
 * ```ts
 * function bang() {}
 * function set_device(path: string) {}
 * export type MaxHandlers = Handlers<{ bang: typeof bang; set_device: typeof set_device }>;
 * ```
 */
type Handlers<T extends Partial<ScriptHandlers> & Record<string, (...args: any[]) => any>> = T;

// ---- jsthis properties ----

/**
 * Whether automatic file reloading is on. Default is 0 (off); best set in global code.
 *
 * Documented as `boolean`, but widened to accept the conventional `autowatch = 1`.
 */
declare var autowatch: boolean | number;
/** The current object's box. */
declare const box: Maxobj;
/** Size (in points) of the font shown in the text editing window where the script is edited. */
declare var editfontsize: number;
/** The inlet number that received the message triggering the currently executing function (0 = leftmost). 0 within global code. */
declare const inlet: number;
/** Number of inlets of the current object instance. Must be set in global code to have any effect. */
declare var inlets: number;
/** Arguments typed into the js object when instantiated. jsarguments[0] is the filename; jsarguments[1] is the first typed-in argument. */
declare const jsarguments: string[];
/** The global Max singleton, bound to the object named `max` (e.g. the recipient of `; max preempt 1`). */
declare const max: Max;
/** Name of the message that invoked the currently running method. nil in global code; mainly useful inside an `anything` function. */
declare const messagename: string;
/**
 * Whether multitouch event handling is enabled (v8 engine only). Must be set
 * in global code to enable multitouch support for onpointer* event handlers.
 */
declare var multitouch: boolean;
/** Number of outlets the js object should have. Must be set in global code to have any effect. */
declare var outlets: number;
/**
 * Types for the outlets of the js object (v8 engine only). Each entry
 * corresponds to one outlet; supported types are "int", "float", "bang",
 * "jit_matrix", and "jit_gl_texture". null denotes no special typing.
 */
declare var outlettypes: (string | null)[];
/** The Patcher object that contains the js object. */
declare const patcher: Patcher;

// ---- jsthis methods ----

/**
 * Convert the array-like `arguments` object of a function into a real Array.
 */
declare function arrayfromargs(args: object): string[];
/**
 * Convert the array-like `arguments` object of a function into a real Array,
 * with `message` prepended as the zeroth element.
 * @param message typically `messagename`, in the context of an `anything` method
 */
declare function arrayfromargs(message: string, args: object): string[];
/**
 * Set the patcher assist string for a designated inlet or outlet. Designed to
 * be called from the assistance function passed to setinletassist()/setoutletassist().
 * @param args the assist string; if an array is supplied, the elements are concatenated
 */
declare function assist(...args: any[]): void;
/**
 * Declare an attribute which can be set, queried, and optionally stored in
 * the patcher file. If no getter/setter is specified, default ones are used.
 * These attributes can also be referenced by pattr.
 *
 * The object-argument overloads come from the page's v8 examples rather than its
 * signature. Declare attributes that use default getters/setters with `var`, not `let`.
 * @param embed whether to embed on patcher save
 * @param options a key/value dictionary of additional options (v8 engine only)
 */
declare function declareattribute(
  attributeName: string,
  getterName?: string | null,
  setterName?: string | null,
  embed?: boolean | number,
  options?: AttributeOptions,
): void;
declare function declareattribute(attributeName: string, options: AttributeOptions): void;
declare function declareattribute(options: AttributeOptions & { name: string }): void;

/** Options for declareattribute() (v8 engine only), as listed in the jsthis reference. */
interface AttributeOptions {
  name?: string;
  getter?: string;
  setter?: string;
  embed?: boolean | number;
  type?: "long" | "float" | "symbol" | "atom";
  /** For arrays; also implicit if `default` is an array. */
  size?: number;
  style?: "onoff" | "enum" | "rgba";
  label?: string;
  category?: string;
  min?: number;
  max?: number;
  default?: number | string | (number | string)[];
  invisible?: boolean | number;
  steps?: number;
  enumindex?: string[];
  enumvals?: string[];
  paint?: boolean | number;
}
/**
 * Usable only inside the `save()` function: specifies the name of a function
 * (and its arguments) to be called when the js object containing the script
 * is recreated.
 */
declare function embedmessage(
  functionName: string,
  args: number | number[] | string | string[],
): void;
/**
 * Notify any clients (such as the pattr family of objects) that the object's
 * current value has changed, so they can react (e.g. call getvalueof()).
 */
declare function notifyclients(): void;
/**
 * Send data through an outlet. If the argument is a JS object, it is passed
 * as the Max message `jsobject`. If the argument is an array, it is unrolled
 * one level and passed as a Max message or list.
 * @param n the outlet number, 0-indexed
 */
declare function outlet(n: number, ...args: any[]): void;
/**
 * Convert a JS array to a Max array and send it through an outlet (v8 engine only).
 * @param n the outlet number, 0-indexed
 */
declare function outlet_array(n: number, array: any[]): void;
/**
 * Convert a JS object to a Max dictionary and send it through an outlet (v8 engine only).
 * @param n the outlet number, 0-indexed
 */
declare function outlet_dictionary(n: number, dictionary: object): void;
/**
 * Convert a JS string to a Max string and send it through an outlet (v8 engine only).
 * @param n the outlet number, 0-indexed
 */
declare function outlet_string(n: number, value: string): void;
/**
 * Copy the contents of the sketch drawing context to the screen (jsui/v8ui only).
 * Must be called after drawing with the Sketch object to see the changes. If
 * using MGraphics instead, use MGraphics.redraw().
 */
declare function refresh(): void;
/** Set the mouse cursor for the jsui/v8ui object. */
declare function setcursor(cursor: number): void;
/** Set the grow behavior for the jsui/v8ui object. */
declare function setgrow(grow: number): void;
/**
 * Associate a number, string, or function with a numbered inlet for patcher
 * assistance. Pass -1 to apply to all inlets. The callback should call assist().
 */
declare function setinletassist(n: number, callback: (...args: any[]) => any): void;
/**
 * Associate a number, string, or function with a numbered outlet for patcher
 * assistance. Pass -1 to apply to all outlets. The callback should call assist().
 */
declare function setoutletassist(n: number, callback: (...args: any[]) => any): void;

// ==== post / cpost / error ====

/**
 * Prints a representation of the arguments in the Max window. With no
 * arguments, starts a new line; otherwise prints the input on the current
 * line separated by spaces. Arrays are unrolled to one level as with outlet().
 * @see https://docs.cycling74.com/apiref/js/post/
 */
declare function post(...args: any[]): void;

/**
 * Prints a message to the system console window. See post() for more details
 * about arguments and formatting.
 * @see https://docs.cycling74.com/apiref/js/cpost/
 */
declare function cpost(...args: any[]): void;

/**
 * Prints a message to the Max console with a red tint. See post() for more
 * details about arguments and formatting.
 * @see https://docs.cycling74.com/apiref/js/error/
 */
declare function error(...args: any[]): void;

// ==== messnamed ====

/**
 * Sends a message to a named Max object (an object bound to a global symbol,
 * such as a receive object, rather than a patcher-specific name).
 * @param objectName the name of the object to send the message to
 * @param selector the name of the object method to call
 * @param args the arguments to pass to the object method (individual arguments or a single array)
 * @see https://docs.cycling74.com/apiref/js/messnamed/
 */
declare function messnamed(objectName: string, selector: string, ...args: any[]): void;

// ==== Global ====

/**
 * Global object for sharing data between Max JavaScript instances. Two
 * Global objects created with the same namespace share stored properties.
 * Properties stored in a Global object can also be accessed from outside of
 * JavaScript, e.g. via a message box addressed to the namespace.
 * @see https://docs.cycling74.com/apiref/js/global/
 */
declare class Global {
  /** Constructs a new instance of the Global class. */
  constructor(namespace: string);
  /** Arbitrary properties stored in the Global object's shared namespace. */
  [key: string]: any;
  /**
   * Forward the value of a property to all named receive objects.
   * @param target name of a receive object
   * @param propertyName identifier for a property stored in the Global object
   */
  sendnamed(target: string, propertyName: string): void;
}

// ==== Task ====

/**
 * A function that can be scheduled or repeated. Runs in a low-priority
 * thread, so timing has variable latency; avoid using Task for time-critical
 * operations. A Task object is available within its own executing function
 * as `arguments.callee.task`.
 * @see https://docs.cycling74.com/apiref/js/task/
 */
declare class Task {
  /**
   * Constructs a new instance of the Task class.
   * @param fn the function to execute
   * @param obj the `this` during the execution of the function
   * @param args the arguments to pass to fn
   */
  constructor(fn: (...args: any[]) => any, obj?: object, args?: any[]);
  /** The arguments passed to the task's executing function. */
  arguments: any[];
  /** The function executed in the Task. May be changed within the task function itself. */
  function: (...args: any[]) => any;
  /** The time in milliseconds between repeats of the task function. Default is 500 ms. */
  interval: number;
  /** The number of times the task function has been called. Resets each time the task is started. */
  readonly iterations: number;
  /** The object assigned to be the `this` in the task function. */
  object: object;
  /** Whether the Task is running or not. Always true within a function executing within the task. */
  readonly running: boolean;
  /** Whether the Task object has been invalidated and is awaiting garbage collection. */
  readonly valid: boolean;
  /**
   * If the task is scheduled or repeating, cancel any future executions. Can
   * be used within a task function for a self-cancelling Task.
   */
  cancel(): void;
  /** Run the task once, right now. Equivalent to calling the task function with its arguments. */
  execute(): void;
  /**
   * Invalidate the Task and make it available for garbage collection. The
   * user is responsible for invalidating a Task when it is no longer in use.
   */
  freepeer(): void;
  /**
   * Repeat the task function.
   * @param n number of repetitions; if omitted, repeats until cancelled
   * @param initialdelay delay in milliseconds until the first iteration
   */
  repeat(n?: number, initialdelay?: number): void;
  /**
   * Run the task once, with a delay.
   * @param delay time in milliseconds before the task function is executed
   */
  schedule(delay?: number): void;
}

// ==== Max ====

/**
 * Singleton Max object controlling the Max environment. The singleton
 * instance is always bound to the global identifier `max` (see the `max`
 * jsthis property).
 * @see https://docs.cycling74.com/apiref/js/max/
 */
declare class Max {
  /** The pathname of the Max application. */
  readonly apppath: string;
  /** The architecture of the Max application. */
  readonly arch: "arm64" | "x86" | "x64";
  /** 1 if the command (macOS) or control (Windows) key is currently held down. */
  readonly cmdkeydown: number;
  /** 1 if the control key is currently held down. */
  readonly ctrlkeydown: number;
  /** The Patcher object of the frontmost patcher window, or nil if no patcher window is visible. */
  readonly frontpatcher: Patcher;
  /** 1 if the js object is loaded as a Max device in a vst~ object, 0 otherwise. */
  readonly isplugin: number;
  /** 1 if the currently executing Max application environment does not allow editing, 0 if it does. */
  readonly isruntime: number;
  /** 1 if the user has disabled loadbang for the currently loading patch. */
  readonly loadbangdisabled: number;
  /** 1 if the current code is executing on the main thread, 0 otherwise. */
  readonly mainthread: number;
  /** 1 if the option (macOS) or alt (Windows) key is currently held down. */
  readonly optionkeydown: number;
  /** The name of the platform (e.g. "windows" or "macintosh"). */
  readonly os: string;
  /** The current OS version number. */
  readonly osversion: string;
  /** 1 if the shift key is currently held down. */
  readonly shiftkeydown: number;
  /** Current scheduler time in milliseconds (floating point). */
  readonly time: number;
  /** Max application version number, e.g. "835". */
  readonly version: string;
  /**
   * Get the value of the named attribute.
   * @returns the value of the attribute, as an array if the attribute value is a list
   */
  getattr(name: string): number | string | any[];
  /** The available attributes of the Max global object. */
  getattrnames(): string[];
  /**
   * Get the value of the named dynamic color in the current theme.
   * @returns the RGBA color as an array of four numbers between 0 and 1
   */
  getcolor(name: string): [number, number, number, number];
  /** Get a Dict containing the reference page information for the named Max class. */
  getrefdict(classname: string): Dict;
  /** Send a message to the Max global object. */
  message(name: string, ...args: any[]): any;
  /** Set the value of the named attribute. */
  setattr(name: string, value: any): void;
  /**
   * Set the value of the named dynamic color in the current theme. Only
   * available in the new v8 javascript engine objects.
   */
  setcolor(name: string, ...args: number[]): void;
}

// ==== Wind ====

/**
 * A property of the Patcher representing its window. Wind objects cannot be
 * created directly, and only patcher windows are accessible this way.
 * @see https://docs.cycling74.com/apiref/js/wind/
 */
declare class Wind {
  /** The Patcher object associated with the window. */
  readonly assoc: Patcher;
  /** The Max class of the object associated with the window. */
  readonly assocclass: string;
  /** Whether the window's contents have been modified. Read-only in the runtime version of Max. */
  dirty: boolean;
  /** Whether the window has a close button. */
  hasclose: boolean;
  /** Whether the window has a grow area. */
  hasgrow: boolean;
  /** Whether the window has a horizontal scroll bar. */
  readonly hashorizscroll: boolean;
  /** Whether the window has a title bar. */
  hastitlebar: boolean;
  /** Whether the window has a vertical scroll bar. */
  readonly hasvertscroll: boolean;
  /** Whether the window has a zoom box. */
  haszoom: boolean;
  /** The window's location in global coordinates: [left, top, right, bottom]. */
  location: [number, number, number, number];
  /** The Wind object of the next patcher visible in the application's window list. */
  readonly next: Wind;
  /** The window's size: [width, height]. */
  size: [number, number];
  /** The window's title. */
  title: string;
  /** Whether the window is visible. */
  visible: boolean;
  /** Move the window in front of all other windows. */
  bringtofront(): void;
  /**
   * Scroll the window.
   * @param x the x-coordinate of the new top-left corner
   * @param y the y-coordinate of the new top-left corner
   */
  scrollto(x: number, y: number): void;
  /** Move the window behind all other windows. */
  sendtoback(): void;
  /** Set the global location of the window. */
  setlocation(left: number, top: number, bottom: number, right: number): void;
}
