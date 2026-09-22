// Ambient declarations for the Max [v8] / [jsui] / [v8ui] mgraphics drawing API.
// Transcribed from https://docs.cycling74.com/apiref/js/

// ---- opaque handles ----

/**
 * Opaque handle for an MGraphics transformation matrix, as returned by
 * `MGraphics.get_matrix()`.
 * @see https://docs.cycling74.com/apiref/js/mgraphicsmatrixhandle/
 */
type MGraphicsMatrixHandle = any;

/**
 * Opaque handle for a stored MGraphics path, as returned by
 * `MGraphics.copy_path()` and consumed by `MGraphics.append_path()`.
 * @see https://docs.cycling74.com/apiref/js/mgraphicspathhandle/
 */
type MGraphicsPathHandle = any;

// ---- stroke style parameter names ----
// The docs list these as enums, but Max has no runtime object by these names:
// scripts pass the plain strings (sketch.strokeparam("color", ...)). So they are
// modelled as type-only namespaces (for the docs' dotted names) plus a union
// alias of all values.

/**
 * Stroke parameters for use with Sketch.beginstroke() in the "basic2d" drawing style.
 * @see https://docs.cycling74.com/apiref/js/basic2dstrokestyleparameternames/
 */
declare namespace Basic2dStrokeStyleParameterNames {
  /** May vary point to point. Value is specified as an alpha value. Useful if alpha is the only color channel which will vary throughout the path. */
  type alpha = "alpha";
  /** May vary point to point. Values are specified as red, green, blue, alpha. */
  type color = "color";
  /** Global for a given path. Value must be interpolation order. Default is 3, or bi-cubic interpolation. */
  type order = "order";
  /** May vary point to point. Outline color. Values are specified as red, green, blue, and alpha values. If no color is specified, then the outline color will be the same as the interior color. */
  type outcolor = "outcolor";
  /** Global for a given path. Value is 0 (off) or 1 (on). Default is 1. */
  type outline = "outline";
  /** May vary point to point. Value is specified as an width value. Width of the stroked path. */
  type scale = "scale";
  /** Global for a given path. Number of slices for a curved section. Default is 20. */
  type slices = "slices";
}
type Basic2dStrokeStyleParameterNames =
  | "alpha"
  | "color"
  | "order"
  | "outcolor"
  | "outline"
  | "scale"
  | "slices";

/**
 * Stroke parameters for use with Sketch.beginstroke() in the "line" drawing style.
 * @see https://docs.cycling74.com/apiref/js/linestrokestyleparameternames/
 */
declare namespace LineStrokeStyleParameterNames {
  /** May vary point to point. Value is specified as an alpha value. Useful if alpha is the only color channel which will vary throughout the path. */
  type alpha = "alpha";
  /** May vary point to point. Values are specified as red, green, blue, alpha. */
  type color = "color";
  /** Global for a given path. Value must be interpolation order. Default is 3, or bi-cubic interpolation. */
  type order = "order";
  /** Global for a given path. Number of slices for a curved section. Default is 20. */
  type slices = "slices";
}
type LineStrokeStyleParameterNames = "alpha" | "color" | "order" | "slices";

// ---- PointerEvent ----

/**
 * Pointer event object passed to onpointer* event handlers. Only available in the
 * new v8 javascript engine objects. These events adhere as closely as possible to
 * the standard PointerEvent structure
 * (https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events), with Max
 * extensions for convenience. Multi-touch and tablet events are currently only
 * supported on Windows.
 *
 * NOTE: This name collides with the DOM's global `PointerEvent` interface. That is
 * fine here because this API surface is used with `lib: ["ES2022"]` only (no DOM
 * lib present), so this declaration is the only `PointerEvent` in scope.
 * @see https://docs.cycling74.com/apiref/js/pointerevent/
 */
interface PointerEvent {
  /**
   * Bitmask of buttons currently pressed: 1 left button (also touch contact, or pen
   * contact), 2 right button, 4 middle button (also pen barrel), 8 x1 button
   * ("back"), 16 x2 button ("forward"), 32 eraser.
   */
  buttons: number;
  /** Caps lock state. */
  capsLock: number;
  /** X coordinate of the pointer in client space. */
  clientX: number;
  /** Y coordinate of the pointer in client space. */
  clientY: number;
  /** Command key on Mac, ctrl key on Win. */
  commandKey: number;
  /** Right click or control click on Mac, with right click on Win. */
  contextModifier: number;
  /** The type of event (e.g., "pointerenter", "pointerleave", "pointermove", "pointerup", "pointerdown"). */
  eventType: string;
  /** A unique identifier for the pointer event. */
  pointerId: number;
  /** The type of pointer device ("mouse", "touch", or "pen"). */
  pointerType: "mouse" | "touch" | "pen";
  /** Normalized pressure of the pointer (0.0 to 1.0). */
  pressure: number;
  /** Planar tilt angle in degrees (-90 to 90). */
  tiltX: number;
  /** Planar tilt angle in degrees (-90 to 90). */
  tiltY: number;
  /** Pen tip inverted--i.e. eraser pointed at tablet (coming in future). */
  tipInverted: number;
  /** Rotation angle of the pointer in degrees (0-359). */
  twist: number;
}

// ---- Pattern ----

/**
 * Pattern object for drawing gradients and patterns. The MGraphics object creates
 * Pattern objects with functions like MGraphics.pattern_create_linear(),
 * MGraphics.pattern_create_radial(), and MGraphics.pattern_create_rgba(). Use this
 * object to add color stops and transformations to customize the pattern, then set
 * it as a source before filling a path.
 * @see https://docs.cycling74.com/apiref/js/pattern/
 */
declare class Pattern {
  /**
   * Sets a color stop for the pattern. Linear and radial gradients will fade
   * continuously between these color values.
   * @param index The index of the color stop
   */
  add_color_stop_rgba(index: number, red: number, green: number, blue: number, alpha: number): void;

  /**
   * Get the extend value of the pattern. "none" draws nothing, "reflect" inverts
   * the pattern and continues drawing as if reflected, "repeat" starts the pattern
   * over and continues, "pad" extends the last color outward.
   * @deprecated This functionality is not implemented and probably never will be.
   */
  get_extend(): "none" | "reflect" | "repeat" | "pad";

  /** Get the current transform matrix for the pattern, as [xx, xy, yx, yy, x0, y0]. */
  get_matrix(): [number, number, number, number, number, number];

  /** Get the type of the pattern. Values are 0-solid, 1-surface, 2-linear, 3-gradient. */
  get_type(): 0 | 1 | 2 | 3;

  /** Reset the transform matrix to identity (no transformation). */
  identity_matrix(): void;

  /**
   * Adds a rotation to the pattern.
   * @param angle The rotation angle in radians (counter-clockwise)
   */
  rotate(angle: number): void;

  /** Scale the pattern horizontally and vertically. */
  scale(scale_x: number, scale_y: number): void;

  /**
   * Set the extend value of the pattern.
   * @deprecated This functionality is not implemented and probably never will be.
   */
  set_extend(extend_value: "none" | "reflect" | "repeat" | "pad"): void;

  /** Set the transform matrix for the pattern directly. */
  set_matrix(xx: number, xy: number, yx: number, yy: number, x0: number, y0: number): void;

  /** Translate the current pattern. */
  translate(t_x: number, t_y: number): void;
}

// ---- Image ----

/**
 * Bitmap image object handle. The Image object can be used to draw images in
 * MGraphics or Sketch. Create an Image either using a file in Max's search path,
 * from an existing MGraphics context, from a Sketch instance, or generated blank at
 * a given size.
 * @see https://docs.cycling74.com/apiref/js/image/
 */
declare class Image {
  /** Create a new bitmap image copied from an MGraphics context. */
  constructor(source: MGraphics);
  /** Create a new bitmap image loaded from a file in Max's search path. */
  constructor(filename: string);
  /** Create a new blank bitmap image with the given pixel dimensions. */
  constructor(width: number, height: number);
  /** Create a new bitmap image copied from a Sketch context. */
  constructor(source: Sketch);

  /** Get or set the size of the image. */
  size: [number, number];

  /**
   * Adjusts all channel values in the image channel specified by the channel
   * argument, by multiplying the channel value by scale and then adding bias. The
   * resulting channel is clipped to the range 0.-1.
   */
  adjustchannel(channel: "red" | "green" | "blue" | "alpha", scale: number, bias: number): void;

  /**
   * Generates an alpha channel based on the chromatic distance from the specified
   * RGB target color.
   */
  alphachroma(
    red: number,
    green: number,
    blue: number,
    tolerance?: number,
    fade?: number,
    minkey?: number,
    maxkey?: number,
  ): void;

  /**
   * Similar to copychannel, except supports a blend amount specified by alpha. If
   * the source is not the same size as the destination, the rectangle of the
   * minimum width and height of each is blended.
   */
  blendchannel(
    source: Image,
    alpha: number,
    source_channel: "red" | "green" | "blue" | "alpha",
    dest_channel: "red" | "green" | "blue" | "alpha",
  ): void;

  /**
   * Similar to copypixels, except supports alpha blending, including a global
   * alpha value multiplied by the source object's alpha channel at each pixel.
   * Instances of Sketch do not contain an alpha channel, which is assumed all on.
   */
  blendpixels(
    source: Image | Sketch,
    alpha: number,
    dest_x: number,
    dest_y: number,
    source_x: number,
    source_y: number,
    width: number,
    height: number,
  ): void;

  /** Clear the image to the specified color. Defaults: red/green/blue 0, alpha 1. */
  clear(red?: number, green?: number, blue?: number, alpha?: number): void;

  /**
   * Sets all values in the specified image channel to the given value (defaults to
   * 1). The resulting channel is clipped to the range 0.-1.
   */
  clearchannel(channel: "red" | "green" | "blue" | "alpha", value?: number): void;

  /**
   * Copies the channel values from the source Image's channel to the destination
   * object's channel. If the source is not the same size as the destination, the
   * rectangle of the minimum width and height of each is copied.
   */
  copychannel(
    source: Image,
    source_channel: "red" | "green" | "blue" | "alpha",
    dest_channel: "red" | "green" | "blue" | "alpha",
  ): void;

  /**
   * Copies pixels from the source object to the location specified by dest_x and
   * dest_y. No scaling of pixels is supported. The source can be an Image or a
   * Sketch.
   */
  copypixels(
    source: Image | Sketch,
    dest_x: number,
    dest_y: number,
    source_x: number,
    source_y: number,
    width: number,
    height: number,
  ): void;

  /** Flips the image horizontally and/or vertically. 0 is no flip, 1 is flip. */
  flip(horizontal: 0 | 1, vertical: 0 | 1): void;

  /**
   * Frees the image data from the native C peer, which is not considered by the
   * JavaScript garbage collector. Once called, the object is not available for any
   * other use. Not necessary to call, since memory is freed eventually.
   */
  freepeer(): void;

  /** Copies the pixels from the jit.matrix object specified by name to the image. */
  fromnamedmatrix(name: string): void;

  /**
   * Returns the pixel value at the specified location, ordered RGBA. Color values
   * are floating point numbers in the range 0.-1.
   */
  getpixel(x: number, y: number): [number, number, number, number];

  /** Premultiply the image's alpha channel into its color channels. */
  premultiply(): void;

  /** Read an image from a file. */
  read(filename: string): void;

  /** Scale the image to the specified dimensions. */
  scale(width: number, height: number): void;

  /** Sets the pixel value at the specified location. Color values are 0.-1. */
  setpixel(x: number, y: number, red: number, green: number, blue: number, alpha: number): void;

  /**
   * Swaps the axes of the image so that width becomes height and vice versa. The
   * effective result is that the image is rotated 90 degrees counter clockwise,
   * and then flipped vertically.
   */
  swapxy(): void;

  /** Copies the pixels from the image to the jit.matrix object specified by name. */
  tonamedmatrix(name: string): void;

  /** Undo premultiplied alpha on the image. */
  unpremultiply(): void;
}

// ---- MGraphicsSVG ----

/**
 * SVG object handle. `MGraphics.svg_render()` can draw an SVG file directly from a
 * filename, but drawing from an MGraphicsSVG instance can be more efficient since
 * the file does not need to be reloaded. Use `mapcolor()` and `mapreset()` to remap
 * colors in the SVG source, useful for rendering the same image multiple times with
 * different states.
 * @see https://docs.cycling74.com/apiref/js/mgraphicssvg/
 */
declare class MGraphicsSVG {
  /**
   * Create an SVG object whose colors can be remapped. Optionally provide a
   * filename or SVG XML string to load immediately, or create an empty instance and
   * use `setsvg()` later. If the argument contains "<svg", "<SVG", or "</", it is
   * treated as an XML string; otherwise as a filename.
   * @param source Filename (in Max's search path) or raw SVG XML string
   */
  constructor(source?: string);

  /**
   * Whether the SVG has been successfully loaded: 1 (true) when loaded via the
   * constructor or `setsvg()`, 0 (false) otherwise.
   */
  readonly loaded: number;

  /** The width and height of the SVG as a two-element array. [0, 0] if not loaded. */
  readonly size: [number, number];

  /**
   * The viewbox of the SVG as [x, y, width, height]. [0, 0, 0, 0] if not loaded.
   */
  readonly viewbox: [number, number, number, number];

  /**
   * Maps a source color in the SVG to a destination color, without modifying the
   * source file. Multiple mappings can be added; all are applied when the SVG is
   * rendered. Use `mapreset()` to clear all mappings.
   */
  mapcolor(
    source_color: [number, number, number, number],
    map_color: [number, number, number, number],
  ): void;

  /**
   * Removes all color mappings added via `mapcolor()`. After calling this, the SVG
   * renders with its original colors.
   */
  mapreset(): void;

  /**
   * Loads an SVG from either a filename (in Max's search path) or a raw XML
   * string. If the argument contains "<svg", "<SVG", or "</", it is treated as an
   * XML string; otherwise as a filename. Updates the `loaded` property.
   * @returns 1 if the SVG was successfully loaded, 0 otherwise
   */
  setsvg(source: string): number;
}

// ---- MGraphics ----

/**
 * Drawing context for rendering shapes and images. The MGraphics object combines a
 * virtual drawing canvas with functions to manage drawing to that canvas, enabling
 * simple shapes, complex paths, text, and images. Most of the time, use the global
 * `mgraphics` object to perform custom drawing of a jsui object or in a jspainter
 * file, calling `MGraphics.init()` in global scope first. Create your own
 * MGraphics instance to draw to an offscreen buffer.
 * @see https://docs.cycling74.com/apiref/js/mgraphics/
 */
declare class MGraphics {
  /**
   * Creates an MGraphics context, including a buffer of offscreen memory to render
   * to, which can be used as a drawing context for creating saved or persistent
   * images. An MGraphics instance can also be copied into an Image object by
   * passing it to the Image constructor.
   * @param width Width of the offscreen drawing area
   * @param height Height of the offscreen drawing area
   */
  constructor(width: number, height: number);

  // -- properties --

  /** Enable or disable automatic fill after stroke. With autofill enabled, any call to stroke() will also fill the current path automatically. */
  autofill: 1 | 0;

  /** Turns on/off painting of the global MGraphics object. In most cases, use init() to enable custom drawing with mgraphics. */
  autopaint: 1 | 0;

  /**
   * Turns on/off painting with the global sketch object. By default, only the
   * sketch layer renders; if the mgraphics layer is enabled, the object calls the
   * user-defined paint() function to draw the mgraphics layer on top. Calling
   * init() sets autosketch to 0 and autopaint to 1.
   */
  autosketch: 1 | 0;

  /**
   * Enable or disable the use of relative coordinates. When disabled, [0, 0] is
   * top-left and [width, height] is bottom-right. When enabled, [0, 0] is the
   * center, y ranges from -1 (top) to 1 (bottom), and x ranges according to the
   * aspect ratio of the drawing area.
   */
  relative_coords: 1 | 0;

  /**
   * The current size of the MGraphics canvas. If using the global mgraphics
   * instance for jsui/jspainter custom drawing, this is the size of the object
   * being redrawn.
   */
  readonly size: [number, number];

  /** Enable or disable the display of a text field when the user clicks on the jsui/jspainter. */
  textfieldvisible: 1 | 0;

  // -- path construction --

  /** Appends a stored path to the current path at the current end point. */
  append_path(path: MGraphicsPathHandle): void;

  /** Add a circular, counter-clockwise arc to the current path. */
  arc_negative(xc: number, yc: number, radius: number, angle1: number, angle2: number): void;

  /** Add a circular, clockwise arc to the current path. */
  arc(xc: number, yc: number, radius: number, angle1: number, angle2: number): void;

  /** Close the current path by adding a line from the current point to the path's starting point. */
  close_path(): void;

  /** Returns a copy of the current path to be stored and reused later. */
  copy_path(): MGraphicsPathHandle;

  /** Add a cubic Bezier spline to the current path. */
  curve_to(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

  /** Add a closed ellipse to the current path, within the rectangle at (x, y) with the given width and height. */
  ellipse(x: number, y: number, width: number, height: number): void;

  /**
   * The current drawing position: the point at which any new additions to the
   * current path would begin, and the end point of the current path. Most
   * functions that add to the path will move this point.
   */
  get_current_point(): [number, number];

  /** Move the current point to a new location, and begin a new subpath. */
  move_to(x: number, y: number): void;

  /** Create a new, empty path. */
  new_path(): void;

  /** Add an elliptical arc to the current path. */
  ovalarc(
    xc: number,
    yc: number,
    radiusx: number,
    radiusy: number,
    angle1: number,
    angle2: number,
  ): void;

  /** Modify the current path by rounding the corners to the given radius, or as close as possible depending on the path's angle. */
  path_roundcorners(radius: number): void;

  /** Add a closed rounded-rectangle to the current path. */
  rectangle_rounded(
    x: number,
    y: number,
    width: number,
    height: number,
    ovalwidth: number,
    ovalheight: number,
  ): void;

  /** Add a closed rectangle to the current path. */
  rectangle(x: number, y: number, width: number, height: number): void;

  /** Add a cubic Bezier spline to the current path, using coordinates relative to the current point. */
  rel_curve_to(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

  /** Add a line segment to the current path, using coordinates relative to the current point. */
  rel_line_to(x: number, y: number): void;

  /** Move the current point to a new location relative to the current point, and begin a new subpath. */
  rel_move_to(x: number, y: number): void;

  /** Add a line segment to the current path. */
  line_to(x: number, y: number): void;

  /** Creates a path from the given text, using the current font face and font size. Once in the path, the text can be transformed like an ordinary path. */
  text_path(text_to_display: string): void;

  // -- fill / stroke / paint --

  /** Erases all drawing on the current surface, returning it to a transparent state. */
  clear_surface(): void;

  /** Get the enclosing rectangle of the current path, as [top, left, bottom, right]. */
  fill_extents(): [number, number, number, number];

  /** Fill the current path, using the current context settings. The path is discarded afterwards. */
  fill(): void;

  /** Fill the current path, overriding the alpha value of the current color. The path is discarded afterwards. */
  fill_with_alpha(alpha: number): void;

  /** Fill the current path, using the current context settings. Does not discard the path afterwards. */
  fill_preserve(): void;

  /** Fill the current path, overriding the alpha value of the current color. Does not discard the path afterwards. */
  fill_preserve_with_alpha(alpha: number): void;

  /** Assuming the current path is fillable, tests whether the given position is contained in it. */
  in_fill(position: [number, number]): 1 | 0;

  /** Paint the current source everywhere within the current clip region. */
  paint(): void;

  /** Paint the current source everywhere within the current clip region, using the given alpha value. */
  paint_with_alpha(alpha: number): void;

  /** Draw the outline of the current path, using the current settings for color, line width, etc. The path is discarded afterwards. */
  stroke(): void;

  /** Draw the outline of the current path, overriding the alpha value of the current color. The path is discarded afterwards. */
  stroke_with_alpha(alpha: number): void;

  /** Draw the outline of the current path, using the current settings for color, line width, etc. Does not discard the path afterwards. */
  stroke_preserve(): void;

  /** Draw the outline of the current path, overriding the alpha value of the current color. Does not discard the path afterwards. */
  stroke_preserve_with_alpha(alpha: number): void;

  // -- line / dash style --

  /** Get the current line cap. */
  get_line_cap(): "butt" | "round" | "square";

  /** Get the current line join. */
  get_line_join(): "miter" | "round" | "bevel";

  /** Get the current line width. */
  get_line_width(): number;

  /** Set the drawing style for the end point of a line. */
  set_line_cap(cap: "butt" | "round" | "square"): void;

  /** Set the appearance of the connection point between lines. */
  set_line_join(join: "miter" | "round" | "bevel"): void;

  /** Set the width of path lines drawn using stroke(). Interpretation depends on relative_coords. */
  set_line_width(width: number): void;

  /**
   * Sets the dash pattern to be used when stroking a path, as alternating dash and
   * gap lengths. Call with no arguments to clear the dash pattern and return to a
   * solid line.
   */
  set_dash(...dashes: number[]): void;

  // -- color / source --

  /**
   * Modifies the color transform by adding a scale. When drawing, MGraphics
   * multiplies the current source color by this scale before drawing. Calling
   * again scales the color further; there is no way to reset the color transform
   * without save()/restore().
   */
  scale_source_rgba(sc_red: number, sc_green: number, sc_blue: number, sc_alpha: number): void;
  /** Modifies the color transform by adding a scale, using an array of [red, green, blue, alpha] values. */
  scale_source_rgba(colors: [number, number, number, number]): void;

  /** Set the color used for drawing, and set the opacity to 1 (fully opaque). Component values are 0-1. */
  set_source_rgb(red: number, green: number, blue: number): void;
  /** Set the color used for drawing using an array of [red, green, blue] values (0-1), and set the opacity to 1. */
  set_source_rgb(colors: number[]): void;

  /** Set the color and alpha used for drawing. Values are between 0 and 1. */
  set_source_rgba(red: number, green: number, blue: number, alpha: number): void;
  /** Set the color and alpha used for drawing, using an array of [red, green, blue, alpha] values (0-1). */
  set_source_rgba(colors: number[]): void;

  /** Sets an image to use as a drawing source, with optional translation. */
  set_source_surface(image: Image, dx?: number, dy?: number): void;

  /** Sets the pattern to be used for the next fill() call. */
  set_source(pattern: Pattern): void;

  /**
   * Modifies the color transform by adding an offset. When drawing, MGraphics adds
   * this offset to the current source color before drawing. Calling again
   * increases or decreases the color offset; there is no way to reset the color
   * transform without save()/restore().
   */
  translate_source_rgba(t_red: number, t_green: number, t_blue: number, t_alpha: number): void;
  /** Modifies the color transform by adding an offset, using an array of [red, green, blue, alpha] values. */
  translate_source_rgba(colors: [number, number, number, number]): void;

  // -- patterns --

  /**
   * Create a pattern using an image for the background. Repeating patterns depend
   * on the extend value set using Pattern.set_extend().
   */
  pattern_create_for_surface(image: Image): Pattern;

  /** Create a linear gradient between two color stop positions. */
  pattern_create_linear(x1: number, y1: number, x2: number, y2: number): Pattern;

  /** Create a radial gradient between two color stop circles. */
  pattern_create_radial(
    x1: number,
    y1: number,
    rad1: number,
    x2: number,
    y2: number,
    rad2: number,
  ): Pattern;

  /** Create a solid color pattern. */
  pattern_create_rgba(red: number, green: number, blue: number, alpha: number): Pattern;

  /**
   * Define a starting point for a path execution group, which can be used for
   * creating an image from a set of path functions without drawing the results to
   * the screen.
   */
  push_group(): void;

  /** Complete a path execution group, returning the result as a Pattern. */
  pop_group(): Pattern;

  /**
   * Complete a path execution group and set the result as the current source.
   * Equivalent to calling pop_group() and passing the result to set_source().
   */
  pop_group_to_source(): void;

  // -- images / SVG --

  /**
   * Place an image into the current surface, at the top-left of the drawing
   * context (changeable using a transform matrix or translate). An optional
   * source_rect describes the section of the image to draw.
   */
  image_surface_draw(image: Image, source_rect?: [number, number, number, number]): void;

  /** A faster version of image_surface_draw() that draws the image directly without applying transforms. */
  image_surface_draw_fast(image: Image): void;

  /**
   * Draw an SVG image in the current graphics context. The source can be a
   * filename, a raw SVG string, or an MGraphicsSVG object. Optional x, y, width,
   * and height determine the destination rect into which the SVG is rendered.
   */
  svg_render(
    source: MGraphicsSVG | string,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    opacity?: number,
  ): void;

  // -- transform matrix --

  /** Reset the transform matrix to identity (no transformation). */
  identity_matrix(): void;

  /** Retrieve the current transformation matrix. */
  get_matrix(): MGraphicsMatrixHandle;

  /** Set the current transform matrix directly. */
  set_matrix(xx: number, xy: number, yx: number, yy: number, x0: number, y0: number): void;
  /** Set the current transform matrix directly, using an array of [xx, xy, yx, yy, x0, y0] values. */
  set_matrix(matrix: [number, number, number, number, number, number]): void;

  /** Modify the current transform matrix by multiplying in another matrix, useful if you already have a transform matrix to include. */
  transform(xx: number, xy: number, yx: number, yy: number, x0: number, y0: number): void;
  /** Modify the current transform matrix by multiplying, using an array of [xx, xy, yx, yy, x0, y0] values. */
  transform(matrix: [number, number, number, number, number, number]): void;

  /** Adds a rotation to the current transform matrix. */
  rotate(angle: number): void;

  /** Add a scale to the current transform matrix, stretching or squishing the drawing horizontally or vertically. Affects line widths. */
  scale(scale_x: number, scale_y: number): void;

  /** Adds a translation to the current transform matrix. */
  translate(t_x: number, t_y: number): void;

  /** Convert a point in user space (where drawing occurs) to device space (after matrix transforms have been applied). */
  user_to_device(position: [number, number]): [number, number];

  /** Convert a point in device space to user space. The inverse of user_to_device(). */
  device_to_user(position: [number, number]): [number, number];

  // -- text --

  /** Sets the current font face by name, with optional bold/italic style. */
  select_font_face(fontname: string, bold?: "bold", italic?: "italic"): void;

  /** Set the current font size. Floating point and integers are both accepted. */
  set_font_size(fontsize: number): void;

  /**
   * Returns the ascent, descent, and height for the current font. Ascent measures
   * the distance from the text baseline to the tallest glyph, descent measures the
   * distance from the baseline to the lowest point below it, and height is ascent
   * plus descent.
   */
  font_extents(): [number, number, number];

  /** Get a list of all fonts installed on your system. */
  getfontlist(): string[];

  /** Draws text at the current location, using the current font face and size. Does not create or modify the current path; matrix transforms will not affect this drawing. */
  show_text(text_to_display: string): void;

  /** Returns the width and height of the given text, as it would appear if rendered in the current font face and size. */
  text_measure(text: string): [number, number];

  // -- state stack --

  /** Push the current MGraphics state, including stroke/fill color, matrix transform, line style, and font style, onto the state stack. */
  save(): void;

  /** Pop the most recent saved MGraphics state off the stack and apply it. */
  restore(): void;

  // -- initialization / redraw --

  /**
   * Initialize the mgraphics system. Call this somewhere in global scope (usually
   * near the top of your JavaScript file) in order to use mgraphics in your custom
   * drawing code. Sets autosketch to 0 and autopaint to 1.
   */
  init(): void;

  /**
   * Request that the current display area be redrawn. Max calls your custom
   * paint() function as part of the next available drawing loop; never call
   * paint() directly.
   */
  redraw(): void;
}

/**
 * The global MGraphics drawing context instance, used for custom drawing in a
 * jsui object or jspainter file. Call `mgraphics.init()` in global scope before
 * using it in your `paint()` function.
 * @see https://docs.cycling74.com/apiref/js/mgraphics/
 */
declare var mgraphics: MGraphics;
