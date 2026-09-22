// Ambient declarations for the Max Sketch (OpenGL-backed drawing context) API.
// Covers: Sketch, DrawingPrimitiveType, and the `sketch` global instance.
// See https://docs.cycling74.com/apiref/js/sketch/

// ---- types ----

/**
 * Primitive type to use for drawing shapes.
 * @see https://docs.cycling74.com/apiref/js/drawingprimitivetype/
 */
type DrawingPrimitiveType =
  | "lines"
  | "line_loop"
  | "line_strip"
  | "points"
  | "polygon"
  | "quads"
  | "quad_grid"
  | "quad_strip"
  | "triangles"
  | "tri_grid"
  | "tri_fan"
  | "tri_strip";

// ---- Sketch ----

/**
 * Interface to an OpenGL-backed drawing context. Every custom UI made with jsui or JSPainter
 * has access to a default Sketch object bound to the global variable "sketch". Use this object
 * to render to the OpenGL-backed drawing context available to all UI objects. If you want to
 * render sprites, have multiple layers of images, or create alpha channels, you can construct
 * new instances of the Sketch object.
 * @see https://docs.cycling74.com/apiref/js/sketch/
 */
declare class Sketch {
  /**
   * Create a new Sketch instance.
   * @param width width, leave undefined to use the default
   * @param height height, leave undefined to use the default
   */
  constructor(width?: number, height?: number);

  // ---- properties ----

  /** Enable or disable the depth buffer. */
  depthbuffer: number;

  /** Enable or disable full-scene anti-aliasing. */
  fsaa: number;

  /** The size of the sketch in pixels as [width, height]. */
  size: [number, number];

  // ---- stroke drawing ----

  /**
   * Begin definition of a stroked path.
   * @param stroke_style the stroke style to use
   */
  beginstroke(stroke_style: "basic2d" | "line"): void;

  /**
   * End definition of a path and render it.
   */
  endstroke(): void;

  /**
   * Add an anchor point to the current path. Some stroke styles such as "basic2d" will
   * ignore the z coordinate.
   */
  strokepoint(x: number, y: number, z: number): void;

  /**
   * Set the value for a given stroke param. Depending on the parameter, may apply to each
   * point, or to the path as a whole. See Basic2dStrokeStyleParameterNames and
   * LineStrokeStyleParameterNames.
   */
  strokeparam(parameter_name: Basic2dStrokeStyleParameterNames.alpha, value: number): void;
  strokeparam(parameter_name: LineStrokeStyleParameterNames.order, order?: number): void;
  strokeparam(parameter_name: LineStrokeStyleParameterNames.slices, slice_count?: number): void;
  strokeparam(
    parameter_name: Basic2dStrokeStyleParameterNames.color,
    red: number,
    green: number,
    blue: number,
    alpha: number,
  ): void;
  strokeparam(parameter_name: Basic2dStrokeStyleParameterNames.order, order?: number): void;
  strokeparam(
    parameter_name: Basic2dStrokeStyleParameterNames.outcolor,
    red: number,
    green: number,
    blue: number,
    alpha: number,
  ): void;
  strokeparam(parameter_name: Basic2dStrokeStyleParameterNames.outline, active: 0 | 1): void;
  strokeparam(parameter_name: Basic2dStrokeStyleParameterNames.scale, width: number): void;
  strokeparam(parameter_name: Basic2dStrokeStyleParameterNames.slices, slice_count?: number): void;
  strokeparam(parameter_name: LineStrokeStyleParameterNames.alpha, value: number): void;
  strokeparam(
    parameter_name: LineStrokeStyleParameterNames.color,
    red: number,
    green: number,
    blue: number,
    alpha: number,
  ): void;

  // ---- shape drawing ----

  /**
   * Draw a filled circle with radius specified by the radius argument at the current drawing
   * position. If theta_start and theta_end are specified, then an arc will be drawn instead of
   * a full circle. Affected by shapeorient, shapeslice, and shapeprim values.
   */
  circle(radius: number, theta_start?: number, theta_end?: number): void;

  /**
   * Draw a framed circle with radius specified by the radius argument at the current drawing
   * position. If theta_start and theta_end are specified, then an arc will be drawn instead of
   * a full circle. Affected by shapeorient, shapeslice, and shapeprim values.
   */
  framecircle(radius: number, theta_start?: number, theta_end?: number): void;

  /**
   * Draw a filled ellipse with radii specified by the radius1 and radius2 arguments. If
   * theta_start and theta_end are specified, then an arc will be drawn instead of a full
   * ellipse. Affected by shapeorient, shapeslice, and shapeprim values.
   */
  ellipse(radius1: number, radius2: number, theta_start?: number, theta_end?: number): void;

  /**
   * Draw a framed ellipse with radii specified by the radius1 and radius2 arguments. If
   * theta_start and theta_end are specified, then an arc will be drawn instead of a full
   * ellipse. Affected by shapeorient, shapeslice, and shapeprim values.
   */
  frameellipse(radius1: number, radius2: number, theta_start?: number, theta_end?: number): void;

  /**
   * Draw a cube. Width = 2 * scale_x, height = 2 * scale_y, and depth = 2 * scale_z, centered
   * at the current drawing position. By default, scale_y and scale_z equal scale_x. Affected by
   * shapeorient, shapeslice, and shapeprim values.
   */
  cube(scale_x: number, scale_y?: number, scale_z?: number): void;

  /**
   * Draw a cylinder with top radius specified by radius1, bottom radius specified by radius2,
   * length specified by mag, and center point at the current drawing position. If theta_start
   * and theta_end are specified, a cylindrical wedge is drawn instead. Affected by shapeorient,
   * shapeslice, and shapeprim values.
   */
  cylinder(
    radius1: number,
    radius2: number,
    mag: number,
    theta_start?: number,
    theta_end?: number,
  ): void;

  /**
   * Draw a plane with top width = 2 * scale_x1, left height = 2 * scale_y1, bottom width =
   * 2 * scale_x2, right height = 2 * scale_y2, centered at the current drawing position.
   * Unspecified trailing arguments fall back to previous ones. Affected by shapeorient,
   * shapeslice, and shapeprim values.
   */
  plane(scale_x1: number, scale_y1?: number, scale_x2?: number, scale_y2?: number): void;

  /**
   * Draw a rounded plane with width = 2 * scale_x1, height = 2 * scale_y1, centered at the
   * current drawing position. round_amount is the radius of the rounded corners. If scale_y1
   * is not specified, it assumes the value of scale_x1. Affected by shapeorient, shapeslice,
   * and shapeprim values.
   */
  roundedplane(round_amount: number, scale_x1: number, scale_y1?: number): void;

  /**
   * Draw a sphere with the given radius, centered at the current drawing position. If the
   * theta1/theta2 start/end arguments are specified, a section is drawn instead of a full
   * sphere. Affected by shapeorient, shapeslice, and shapeprim values.
   */
  sphere(
    radius: number,
    theta1_start?: number,
    theta1_end?: number,
    theta2_start?: number,
    theta2_end?: number,
  ): void;

  /**
   * Draw a torus centered at the current drawing position. If theta1/theta2 start/end are
   * specified, a section is drawn instead of a full torus. Affected by shapeorient, shapeslice,
   * and shapeprim values.
   */
  torus(
    major_radius: number,
    minor_radius: number,
    theta1_start?: number,
    theta1_end?: number,
    theta2_start?: number,
    theta2_end?: number,
  ): void;

  /**
   * Draw a framed quadrilateral. After this method has been called, the drawing position is
   * updated to (x4, y4, z4).
   */
  framequad(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    x3: number,
    y3: number,
    z3: number,
    x4: number,
    y4: number,
    z4: number,
  ): void;

  /**
   * Draw a filled quadrilateral. After this method has been called, the drawing position is
   * updated to (x4, y4, z4).
   */
  quad(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    x3: number,
    y3: number,
    z3: number,
    x4: number,
    y4: number,
    z4: number,
  ): void;

  /**
   * Draw a framed triangle. After this method has been called, the drawing position is updated
   * to (x3, y3, z3).
   */
  frametri(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    x3: number,
    y3: number,
    z3: number,
  ): void;

  /**
   * Draw a filled triangle. After this method has been called, the drawing position is updated
   * to (x3, y3, z3).
   */
  tri(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    x3: number,
    y3: number,
    z3: number,
  ): void;

  /**
   * Set rotation in x, y, and z (degrees) for future shape drawing calls.
   */
  shapeorient(rotation_x: number, rotation_y: number, rotation_z: number): void;

  /**
   * Set the OpenGL drawing primitive to use within any of the "shape" drawing methods.
   */
  shapeprim(draw_prim: DrawingPrimitiveType): void;

  /**
   * Set the number of slices to use when rendering shapes. Increasing slice_a and slice_b
   * increases render quality; decreasing improves performance.
   */
  shapeslice(slice_a: number, slice_b: number): void;

  // ---- lines and points ----

  /**
   * Draw a line from the current drawing position to the location specified by adding the
   * delta x, y, and z arguments to the current position. After this method has been called,
   * the drawing position is updated by this relative offset.
   */
  line(dx: number, dy: number, dz: number): void;

  /**
   * Draw a line from (x1, y1, z1) to (x2, y2, z2). After this method has been called, the
   * drawing position is updated to (x2, y2, z2).
   */
  linesegment(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): void;

  /**
   * Draw a line from the current drawing position to (x, y, z). After this method has been
   * called, the drawing position is updated to (x, y, z).
   */
  lineto(x: number, y: number, z: number): void;

  /**
   * Draw a point at (x, y, z). After this method has been called, the drawing position is
   * updated to the specified location.
   */
  point(x: number, y: number, z: number): void;

  /**
   * Move the drawing position to the sum of the current drawing position and the delta x, y,
   * and z arguments.
   */
  move(dx: number, dy: number, dz: number): void;

  /**
   * Move the drawing position to (x, y, z).
   */
  moveto(x: number, y: number, z: number): void;

  // ---- pixels and images ----

  /**
   * Copy pixels from the source object to the location specified by destination_x and
   * destination_y. The source offset and size of the rectangle copied can be specified by
   * source_x, source_y, width and height; if omitted, an offset of zero and the source's full
   * size is assumed. No scaling of pixels is supported. If blending is enabled on the
   * destination sketch, alpha blending is performed and the current alpha color is applied
   * globally. This is much faster than texturing a plane via glbindtexture() and is the
   * recommended way to draw images when scaling and rotation are not required.
   */
  copypixels(
    source_obj: Sketch | Image,
    destination_x: number,
    destination_y: number,
    source_x?: number,
    source_y?: number,
    width?: number,
    height?: number,
  ): void;

  /**
   * Get the pixel value at the specified location. Returns an array ordered RGBA (element 0 is
   * red, 1 green, 2 blue, 3 alpha), with color values as floating point numbers in the range
   * 0-1.
   */
  getpixel(x: number, y: number): [number, number, number, number];

  /**
   * Set the pixel value at the specified location. Color values are floating point numbers in
   * the range 0-1.
   */
  setpixel(x: number, y: number, red: number, green: number, blue: number, alpha: number): void;

  /**
   * Get the depth value associated with the currently rendered pixel at a given absolute
   * screen coordinate.
   */
  depthatpixel(x: number, y: number): number;

  // ---- text ----

  /** Set the current font. */
  font(font_name: string): void;

  /** Set the font size in points. */
  fontsize(size: number): void;

  /**
   * Set the alignment of text to be drawn with respect to the current drawing position.
   * Default alignment is "left" and "bottom".
   */
  textalign(align_x: "left" | "center" | "right", align_y: "top" | "center" | "bottom"): void;

  /**
   * Draw the given text at the current drawing position, taking into account the current
   * font, fontsize, and text alignment. Text is strictly 2D and does not take into account
   * world transformations. Depending on the x alignment, the drawing position is updated to
   * reflect the end of the string ("left"/"right") or is left unchanged ("center").
   */
  text(text: string): void;

  /**
   * Return an array containing the width and height of the given string in absolute screen
   * coordinates, taking into account the current font and fontsize.
   */
  gettextinfo(text: string): [number, number];

  // ---- coordinate conversion ----

  /**
   * Return the x, y, and z world coordinates associated with a given screen pixel, using the
   * same depth from the camera as (0, 0, 0) unless an explicit depth is given (0 = near
   * clipping plane, 1 = far clipping plane).
   */
  screentoworld(x: number, y: number, depth?: number): [number, number, number];

  /**
   * Return the x, y, and depth screen coordinates associated with a given world coordinate.
   * The depth value ranges from 0 (near clipping plane) to 1 (far clipping plane).
   */
  worldtoscreen(x: number, y: number, z: number): [number, number, number];

  // ---- graphics state presets ----

  /**
   * Set the graphics state to default properties useful for 2D graphics. Called every time
   * the object is resized if default2d() has been called more recently than default3d() or
   * ortho3d().
   */
  default2d(): void;

  /**
   * Set the graphics state to default properties useful for 3D graphics. Called every time
   * the object is resized if default3d() has been called more recently than default2d() or
   * ortho3d().
   */
  default3d(): void;

  /**
   * Set the graphics state to default properties useful for 3D graphics using an orthographic
   * projection (object scale is not affected by distance from the camera). Called every time
   * the object is resized if ortho3d() has been called more recently than default2d() or
   * default3d().
   */
  ortho3d(): void;

  // ---- context / lifecycle ----

  /** Set the rendering context for the sketch. */
  setcontext(): void;

  /** Restore the rendering context after a call to Sketch.setcontext(). */
  restorecontext(): void;

  /**
   * Free data from the native C peer (created when making a Sketch object), which is not
   * considered by the JavaScript garbage collector and may consume memory until the garbage
   * collector runs. Once called, the Sketch object is not available for any other use. It is
   * not necessary to call this, but it may be called whenever done with the Sketch object.
   */
  freepeer(): void;

  // ---- low-level OpenGL wrappers ----
  // Thin wrappers around the underlying graphics engine; consult the OpenGL/GLU documentation
  // for the function of the same (or very similar) name.

  /**
   * Begin drawing using low level OpenGL functions. Typically used between calls to glbegin()
   * and glend().
   */
  glbegin(prim_type: DrawingPrimitiveType): void;

  /** End a glbegin() block. */
  glend(): void;

  /**
   * Apply the given texture to subsequent drawing calls. Note: this method also calls
   * glenable("texture").
   */
  glbindtexture(image: Image): void;

  /** Wraps the OpenGL glBlendFunc function. */
  glblendfunc(src_func: string, dst_func: string): void;

  /** Clear the drawing context. */
  glclear(): void;

  /** Set the color to fill the context with using Sketch.glclear(). */
  glclearcolor(red: number, green: number, blue: number, alpha?: number): void;
  glclearcolor(colors: number[]): void;

  /** Set the depth to fill the context with using Sketch.glclear(). */
  glcleardepth(depth: number): void;

  /** Wraps the OpenGL glClipPlane function. */
  glclipplane(plane: number, coeff1: number, coeff2: number, coeff3: number, coeff4: number): void;
  glclipplane(planeValues: number[]): void;

  /** Set the color for subsequent drawing calls. */
  glcolor(red: number, green: number, blue: number, alpha?: number): void;
  glcolor(colors: number[]): void;

  /** Wraps the OpenGL glColorMask function. */
  glcolormask(red: number, green: number, blue: number, alpha?: number): void;
  glcolormask(colors: number[]): void;

  /** Wraps the OpenGL glColorMaterial function. */
  glcolormaterial(face: number, mode: number): void;

  /** Wraps the OpenGL glCullFace function. */
  glcullface(face: number): void;

  /** Wraps the OpenGL glDepthMask function. */
  gldepthmask(onoff: number): void;

  /** Wraps the OpenGL glDepthRange function. */
  gldepthrange(near: number, far: number): void;

  /** Disable a drawing capability. Usually "blend", "line_smooth", or "texture". */
  gldisable(capability: string): void;

  /** Wraps the OpenGL glEdgeFlag function. */
  gledgeflag(onoff: number): void;

  /** Enable a drawing capability. Usually "blend", "line_smooth", or "texture". */
  glenable(capability: string): void;

  /** Wraps the OpenGL glFinish function. */
  glfinish(): void;

  /** Wraps the OpenGL glFlush function. */
  glflush(): void;

  /** Wraps the OpenGL glFog function. */
  glfog(parameter_name: string, ...values: number[]): void;

  /** Wraps the OpenGL glFrustum function. */
  glfrustum(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
  ): void;
  glfrustum(frustrumValues: number[]): void;

  /** Wraps the OpenGL glHint function. */
  glhint(target: string, mode: number): void;

  /** Wraps the OpenGL glLight function. */
  gllight(light: string, parameter_name: string, ...values: number[]): void;

  /** Wraps the OpenGL glLightModel function. */
  gllightmodel(light: string, model: number): void;

  /** Wraps the OpenGL glLineStipple function. */
  gllinestipple(factor: any, bit_pattern: any): void;

  /** Wraps the OpenGL glLineWidth function. */
  gllinewidth(width: number): void;

  /** Load the identity matrix. */
  glloadidentity(): void;

  /** Wraps the OpenGL glLoadMatrix function. */
  glloadmatrix(matrix_array: number[]): void;

  /** Wraps the OpenGL glLogicOp function. */
  gllogicop(op: number): void;

  /** Wraps the OpenGL glMaterial function. */
  glmaterial(): void;

  /** Wraps the OpenGL glMatrixMode function. */
  glmatrixmode(mode: string): void;

  /** Wraps the OpenGL glMultMatrix function. */
  glmultmatrix(matrix_array: number[]): void;

  /** Wraps the OpenGL glNormal function. */
  glnormal(x: number, y: number, z: number): void;

  /** Wraps the OpenGL glOrtho function. */
  glortho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
  ): void;
  glortho(orthoValues: number[]): void;

  /** Wraps the OpenGL glPointSize function. */
  glpointsize(size: number): void;

  /** Wraps the OpenGL glPolygonMode function. */
  glpolygonmode(face: number, mode: number): void;

  /** Wraps the OpenGL glPolygonOffset function. */
  glpolygonoffset(factor: number, units: number): void;

  /** Wraps the OpenGL glPopAttrib function. */
  glpopattrib(): void;

  /** Wraps the OpenGL glPopMatrix function. */
  glpopmatrix(): void;

  /** Wraps the OpenGL glPushAttrib function. */
  glpushattrib(): void;

  /** Wraps the OpenGL glPushMatrix function. */
  glpushmatrix(): void;

  /** Wraps the OpenGL glRect function. */
  glrect(x1: number, y1: number, x2: number, y2: number): void;
  glrect(rectValues: number[]): void;

  /** Wraps the OpenGL glRotate function. */
  glrotate(angle: number, x: number, y: number, z: number): void;
  glrotate(rotateValues: number[]): void;

  /** Wraps the OpenGL glScale function. */
  glscale(x: number, y: number, z: number): void;
  glscale(scaleValues: number[]): void;

  /** Wraps the OpenGL glScissor function. */
  glscissor(x: number, y: number, width: number, height: number): void;
  glscissor(scissorValues: number[]): void;

  /** Wraps the OpenGL glShadeModel function. */
  glshademodel(mode: number): void;

  /** Wraps the OpenGL glTexCoord function. */
  gltexcoord(s: number, t: number): void;

  /** Wraps the OpenGL glTexEnv function. */
  gltexenv(parameter_name: string, val1: number, val2: number, val3: number, val4: number): void;

  /** Wraps the OpenGL glTexGen function. */
  gltexgen(
    coord: number[],
    parameter_name: string,
    val1: number,
    val2: number,
    val3: number,
    val4: number,
  ): void;

  /** Wraps the OpenGL glTexParameter function. */
  gltexparameter(
    parameter_name: string,
    val1: number,
    val2: number,
    val3: number,
    val4: number,
  ): void;

  /** Wraps the OpenGL glTranslate function. */
  gltranslate(x: number, y: number, z: number): void;
  gltranslate(translateValues: number[]): void;

  /** Wraps the GLU gluLookAt function. */
  glulookat(
    eye_x: number,
    eye_y: number,
    eye_z: number,
    center_x: number,
    center_y: number,
    center_z: number,
    up_x: number,
    up_y: number,
    up_z: number,
  ): void;
  glulookat(lookatValues: number[]): void;

  /** Wraps the GLU gluOrtho2D function. */
  gluortho2d(left: number, right: number, bottom: number, top: number): void;
  gluortho2d(orthoValues: number[]): void;

  /** Wraps the GLU gluPerspective function. */
  gluperspective(fovy: number, aspect: number, near: number, far: number): void;
  gluperspective(perspectiveValues: number[]): void;

  /** Wraps the OpenGL glVertex function. */
  glvertex(x: number, y: number, z: number): void;
  glvertex(vertexValues: number[]): void;

  /** Wraps the OpenGL glViewport function. */
  glviewport(x: number, y: number, width: number, height: number): void;
  glviewport(viewportValues: number[]): void;
}

/**
 * The default Sketch object bound to every custom UI made with jsui or JSPainter. Use it to
 * render to the OpenGL-backed drawing context available to all UI objects; often this is the
 * only Sketch instance you will need.
 * @see https://docs.cycling74.com/apiref/js/sketch/
 */
declare var sketch: Sketch;
