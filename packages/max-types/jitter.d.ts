// Ambient declarations for the Max Jitter JavaScript API.
// Covers: JitterObject, JitterMatrix, JitterListener, JitterEvent, JitterEventTypes,
// Jitter3dUtilsInterface, Jitter3dUtilsTypes, and the `Jitter3DUtils` global instance.
// See https://docs.cycling74.com/apiref/js/

// ---- JitterObject ----

/**
 * A JavaScript representation of a Jitter object in a patcher.
 * @see https://docs.cycling74.com/apiref/js/jitterobject/
 */
declare class JitterObject {
  /**
   * Constructs a new instance of the JitterObject class.
   * @param objectName name of Jitter object
   * @param params parameter and attributes
   */
  constructor(objectName: string, ...params: any[]);

  /**
   * The underlying Jitter object's attributes and messages (e.g. `obj.dim`,
   * `obj.somemessage()`) are exposed dynamically and depend on the wrapped object's class,
   * so they cannot be statically typed here.
   */
  [attributeOrMessage: string]: any;

  /** Delete the JitterObject. */
  freepeer(): void;

  /** Get the registered name of the JitterObject. */
  getregisteredname(): string;
}

// ---- JitterMatrix ----

/**
 * A named matrix which may be used for data storage and retrieval, resampling, and matrix
 * type and planecount conversion operations.
 * @see https://docs.cycling74.com/apiref/js/jittermatrix/
 */
declare class JitterMatrix {
  /**
   * Constructs a new instance of the JitterMatrix class.
   */
  constructor(planeCount?: number, dataType?: string, columns?: number, rows?: number);

  // ---- properties ----

  /**
   * Matrix adaptation flag. When set (1), the JitterMatrix will adapt to the incoming
   * matrix's planecount, type, and dimensions.
   */
  adapt: number;

  /** Matrix data dimensions. */
  dim: [number, number];

  /** Byte stride per dimension. */
  dimstride: [number, number];

  /** Destination dimension end position (default = all dim values minus 1). */
  dstdimend: number[];

  /** Destination dimension start position (default = all 0). */
  dstdimstart: number[];

  /**
   * Matrix interpolation flag (default = 0). When set, the input matrix will be interpolated
   * when copied to the internal matrix.
   */
  interp: number;

  /** Name of the matrix (default = UID). */
  name: string;

  /** Number of planes in the matrix data (default = 4). */
  planecount: number;

  /** Maps input planes to output planes (default = 0 1 2 3 ...). */
  planemap: number[];

  /** Total byte size of matrix. */
  size: number;

  /** Source dimension end position (default = all dim values minus 1). */
  srcdimend: number[];

  /** Source dimension start position (default = all 0). */
  srcdimstart: number[];

  /**
   * The matrix data type (default = "char"): "char" (0-255), "long", "float32", or "float64".
   */
  type: string;

  /**
   * destdim use flag (default = 0). When set, the destination dimension's attributes are used
   * when copying an input matrix to an internal matrix.
   */
  usedstdim: number;

  /**
   * srcdim use flag (default = 0). When set, the source dimension's attributes are used when
   * copying an input matrix to an internal matrix.
   */
  usesrcdim: number;

  // ---- methods ----

  /** Outputs the currently stored matrix. */
  bang(): void;

  /** Sets all matrix values to zero. */
  clear(): void;

  /**
   * Copy a tightly packed TypedArray to a JitterMatrix. Only available in the v8 javascript
   * engine objects. The TypedArray must match the matrix type (Uint8 for char, Int32 for
   * long, Float32 for float32, Float64 for float64) and its size must match the tightly
   * packed size of the matrix (planecount * dim[0] * dim[1] ... * dim[n]).
   */
  copyarraytomatrix(
    array: Uint8Array | Uint8ClampedArray | Int32Array | Float32Array | Float64Array,
  ): void;

  /**
   * Copy a JitterMatrix to a tightly packed TypedArray. Only available in the v8 javascript
   * engine objects. The TypedArray must match the matrix type (Uint8 for char, Int32 for
   * long, Float32 for float32, Float64 for float64) and its size must match the tightly
   * packed size of the matrix (planecount * dim[0] * dim[1] ... * dim[n]).
   */
  copymatrixtoarray(
    array: Uint8Array | Uint8ClampedArray | Int32Array | Float32Array | Float64Array,
  ): void;

  /**
   * Export the current frame as an image file with the name specified.
   * @param filetype one of "png", "bmp", "jpeg", "macpaint", "photoshop", "pict", "qtimage",
   * "sgi", "tga", "tiff" (default = "png")
   * @param useDialog a value of 1 will open a file dialog to enter image file settings
   */
  exportimage(filename: string, filetype?: string, useDialog?: number): void;

  /**
   * Export a matrix as a QuickTime movie.
   * @param filename exported movie filename (default = file dialog will open)
   * @param fps frames per second (default = 30)
   * @param codec one of "raw", "cinepak", "graphics", "animation", "video", "componentvideo",
   * "jpeg", "mjpegb", "sgi", "planarrgb", "macpaint", "gif", "photocd", "qdgx", "avrjpeg",
   * "opendmljpeg", "bmp", "winraw", "vector", "qd", "h261", "h263", "dvntsc", "dvpal",
   * "dvprontsc", "dvpropal", "flc", "targa", "png", "tiff", "componentvideosigned",
   * "componentvideounsigned", "cmyk", "microsoft", "sorenson", "indeo4", "argb64", "rgb48",
   * "alphagrey32", "grey16", "mpegyuv420", "yuv420", "sorensonyuv9" (default = "raw")
   * @param quality one of "lossless", "max", "min", "low", "normal", "high" (default = "max")
   * @param timescale units per second (default = 600)
   */
  exportmovie(
    filename?: string,
    fps?: number,
    codec?: string,
    quality?: string,
    timescale?: number,
  ): void;

  /**
   * Evaluate an expression to fill the matrix. If a plane argument is provided, the expression
   * is applied to a single plane; otherwise it is applied to all planes. See jit.expr for more
   * information on expressions. Call this method multiple times to fill multiple planes with
   * different expressions.
   * @param plane matrix plane to apply to (default = all planes)
   */
  exprfill(plane: number, expression?: string): void;

  /** Fill the specified plane with a single value. */
  fillplane(plane: number, value: number): void;

  /**
   * Set all cells to the value specified by value(s) and output the data.
   * @param values matrix value list whose length is equal to the dimcount
   */
  float(values: number | number[]): void;

  /**
   * Sends the value(s) in the cell specified by position out the right outlet of the object as
   * a list in the form "cell cell - position0 ... cell - positionN val plane0 - value ...
   * planeN - value".
   */
  getcell(position: [number, number]): void;

  /**
   * Import a QuickTime movie into the matrix.
   * @param filename filename of movie to import (default = file dialog)
   * @param timeoffset import time offset (default = 0)
   */
  importmovie(filename?: string, timeoffset?: number): void;

  /**
   * Set all cells to the value specified by value(s) and output the data.
   * @param values matrix value list whose length is equal to the dimcount
   */
  int(values: number | number[]): void;

  /** Copy a texture to the matrix. */
  jit_gl_texture(texture_name: string): void;

  /**
   * Set all cells to the value specified by value(s) and output the data.
   * @param values matrix value list whose length is equal to the dimcount
   */
  list(values: number[]): void;

  /**
   * Perform jit.op operations on the matrix.
   * @param operator the jit.op operator
   * @param args matrix name or constant args for the operator
   */
  op(operator: string, args: any): void;

  /**
   * Read Jitter binary data files (.jxf) into the matrix.
   * @param filename binary data file to read (default = file dialog)
   */
  read(filename?: string): void;

  /**
   * Set all cells to the value(s) specified.
   */
  setall(values: number | number[]): void;

  /**
   * Set the cell specified to a value. Arguments are formatted like the setcell message to a
   * jit.matrix in Max.
   * @param args the position, plane, planeNumber, value/values to set
   */
  setcell(...args: any[]): void;

  /** Set a cell in a 1D matrix. */
  setcell1d(pos: number, ...values: number[]): void;

  /** Set a cell in a 2D matrix. */
  setcell2d(posX: number, posY: number, ...values: number[]): void;

  /** Set a cell in a 3D matrix. */
  setcell3d(posX: number, posY: number, posZ: number, ...values: number[]): void;

  /** Set a cell for a 1D matrix. */
  setplane1d(pos: number, plane: number, value: number): void;

  /** Set a cell for a 2D matrix. */
  setplane2d(posX: number, posY: number, plane: number, value: number): void;

  /** Set a cell for a 3D matrix. */
  setplane3d(posX: number, posY: number, posZ: number, plane: number, value: number): void;

  /** Set all cells to the value specified. */
  val(value: number): void;

  /**
   * Write matrix set as a Jitter binary data file (.jxf).
   * @param filename name of file to write to (default = file dialog)
   */
  write(filename?: string): void;
}

// ---- JitterEventTypes ----

/**
 * Possible event types for a JitterEvent.
 * @see https://docs.cycling74.com/apiref/js/jittereventtypes/
 */
declare namespace JitterEventTypes {
  /** Event type name. */
  type event =
    | "mouse"
    | "mouseidle"
    | "mouseidleout"
    | "mousewheel"
    | "matrix_received"
    | "message_received"
    | "connected_notification"
    | "import"
    | "collisions"
    | "matrixoutput"
    | "swap";
}

// ---- JitterEvent ----

/**
 * The argument passed to a JitterListener callback function.
 * @see https://docs.cycling74.com/apiref/js/jitterevent/
 */
interface JitterEvent {
  /** Arguments depend on event type. */
  readonly args: any;

  /** Name of the event to be handled. */
  readonly eventname: JitterEventTypes.event;

  /** Name of the object to listen to. */
  readonly subjectname: string;
}

// ---- JitterListener ----

/**
 * A listener for changes in a JitterObject.
 * @see https://docs.cycling74.com/apiref/js/jitterlistener/
 */
declare class JitterListener {
  /**
   * Constructs a new instance of the JitterListener class.
   * @param objectName name of the object to listen to
   * @param callback a function called when a change occurs to the listened-to object, which
   * takes a JitterEvent
   */
  constructor(objectName: string, callback: (event: JitterEvent) => any);

  /** The callback function to handle the JitterEvent. */
  function: (event: JitterEvent) => any;

  /** The object being listened to. */
  object: JitterObject;

  /** Name of the object being listened to. */
  subjectname: string;
}

// ---- Jitter3dUtilsTypes ----

/**
 * Types used with Jitter3dUtilsInterface.
 * @see https://docs.cycling74.com/apiref/js/jitter3dutilstypes/
 */
declare namespace Jitter3dUtilsTypes {
  /** A 3D vector. */
  type vec3 = [number, number, number];

  /** A 4D vector. */
  type vec4 = [number, number, number, number];

  /** A 4x4 matrix. */
  type mat16 = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
}

// ---- Jitter3dUtilsInterface ----

/**
 * Utilities for Jitter 3D manipulations. It is not necessary to instantiate this interface
 * directly; it is available globally as a Jitter3DUtils object and methods can be called like
 * Jitter3DUtils.vadd().
 * @see https://docs.cycling74.com/apiref/js/jitter3dutilsinterface/
 */
declare class Jitter3dUtilsInterface {
  /** Add three 4D vectors (quaternions). */
  add_quats(
    q1: Jitter3dUtilsTypes.vec4,
    q2: Jitter3dUtilsTypes.vec4,
    q3: Jitter3dUtilsTypes.vec4,
  ): void;

  /** Convert an angle/axis rotation to a quaternion. */
  axis_to_quat(axis: Jitter3dUtilsTypes.vec3, quat: Jitter3dUtilsTypes.vec4): void;

  /** Build a rotation matrix for a given quaternion. */
  build_rotmatrix(m: Jitter3dUtilsTypes.vec4, q: Jitter3dUtilsTypes.vec4): void;

  /** Set p1 to the point on a sphere closest to a line segment. */
  closest_line_sphere(
    lineA: Jitter3dUtilsTypes.vec3,
    lineB: Jitter3dUtilsTypes.vec3,
    center: Jitter3dUtilsTypes.vec3,
    r: number,
    p1: Jitter3dUtilsTypes.vec3,
  ): void;

  /**
   * Returns whether the ray defined by the line's two points intersects the quad defined by a
   * position, rotation, and scale. Sets p2 to the point of intersection with the quad plane in
   * unit coordinates and sets p1 to the same point in world coordinates.
   */
  intersect_line_quad(
    lineA: Jitter3dUtilsTypes.vec3,
    lineB: Jitter3dUtilsTypes.vec3,
    pos: Jitter3dUtilsTypes.vec3,
    rot: Jitter3dUtilsTypes.vec3,
    scale: Jitter3dUtilsTypes.vec3,
    p1: Jitter3dUtilsTypes.vec3,
    p2: Jitter3dUtilsTypes.vec3,
  ): boolean;

  /**
   * Returns whether the ray defined by the line's two points intersects with the sphere of
   * given center and radius. Sets p1 to the closest point of intersection.
   */
  intersect_line_sphere(
    lineA: Jitter3dUtilsTypes.vec3,
    lineB: Jitter3dUtilsTypes.vec3,
    center: Jitter3dUtilsTypes.vec3,
    r: number,
    p1: Jitter3dUtilsTypes.vec3,
  ): boolean;

  /** Normalize a quaternion. */
  normalize_quat(quat: Jitter3dUtilsTypes.vec4): void;

  /** Convert a quaternion to an angle/axis rotation. */
  quat_to_axis(quat: Jitter3dUtilsTypes.vec4, axis: Jitter3dUtilsTypes.vec3): void;

  /** Transform a point by a 4x4 matrix. */
  transform_point(point: Jitter3dUtilsTypes.vec4, matrix: Jitter3dUtilsTypes.mat16): void;

  /** Add two 3D vectors. */
  vadd(
    src1: Jitter3dUtilsTypes.vec3,
    src2: Jitter3dUtilsTypes.vec3,
    dst: Jitter3dUtilsTypes.vec3,
  ): void;

  /** Copy one vector to another. */
  vcopy(v1: Jitter3dUtilsTypes.vec3, v2: Jitter3dUtilsTypes.vec3): void;

  /** Calculate the cross product of two 3D vectors. */
  vcross(
    v1: Jitter3dUtilsTypes.vec3,
    v2: Jitter3dUtilsTypes.vec3,
    cross: Jitter3dUtilsTypes.vec3,
  ): void;

  /** Divide src1 and src2 (element-wise) and store the result in dst. */
  vdiv(
    src1: Jitter3dUtilsTypes.vec3,
    src2: Jitter3dUtilsTypes.vec3,
    dst: Jitter3dUtilsTypes.vec3,
  ): void;

  /** Calculate the dot product of two 3D vectors. */
  vdot(v1: Jitter3dUtilsTypes.vec3, v2: Jitter3dUtilsTypes.vec3): number;

  /** Compute the squared distance of a 3D vector. */
  vlength(v: Jitter3dUtilsTypes.vec3): number;

  /** A cheaper distance-squared calculation. */
  vlength2(v: Jitter3dUtilsTypes.vec3): number;

  /** Multiply src1 and src2 (element-wise) and store the result in dst. */
  vmul(
    src1: Jitter3dUtilsTypes.vec3,
    src2: Jitter3dUtilsTypes.vec3,
    dst: Jitter3dUtilsTypes.vec3,
  ): void;

  /** Normalize a 3D vector. */
  vnormal(v: Jitter3dUtilsTypes.vec3): void;

  /** Scale a vector. */
  vscale(v: Jitter3dUtilsTypes.vec3, scale: number): void;

  /** Set the values of a vector. */
  vset(v: Jitter3dUtilsTypes.vec3, x: number, y: number, z: number): void;

  /** Subtract src2 from src1 and store the result in dst. */
  vsub(
    src1: Jitter3dUtilsTypes.vec3,
    src2: Jitter3dUtilsTypes.vec3,
    dst: Jitter3dUtilsTypes.vec3,
  ): void;

  /** Set all elements of a vector to zero. */
  vzero(v: Jitter3dUtilsTypes.vec3): void;

  /** Convert rotation in Euler angles (xyz) to angle/axis rotation. */
  xyz_to_axis(v: Jitter3dUtilsTypes.vec3, axis: Jitter3dUtilsTypes.vec3): void;
}

/**
 * Global instance of Jitter3dUtilsInterface, providing utilities for Jitter 3D manipulations
 * (e.g. `Jitter3DUtils.vadd(...)`).
 * @see https://docs.cycling74.com/apiref/js/jitter3dutilsinterface/
 */
declare var Jitter3DUtils: Jitter3dUtilsInterface;
