// Ambient declarations for Max's data-access JavaScript API:
// Dict, Buffer, PolyBuffer, File, Folder, FileTypes, MaxString, MaxArray, MaxFFT,
// MaxFFT2D, Rx256, SQLite, SQLResult, XMLHttpRequest, ProgressEvent.
// Transcribed from https://docs.cycling74.com/apiref/js/

// ---- Dict ----

/**
 * Bind to a Max dict object.
 *
 * The Dict object lets you access structured data (a dictionary) associated with a
 * name. If there is a named dict object in Max, it will share its contents with the
 * JavaScript Dict object of the same name.
 * @see https://docs.cycling74.com/apiref/js/dict/
 */
declare class Dict {
  /**
   * Create a named dictionary. If no name is provided, a unique name will be generated.
   * @param name name of the dictionary
   */
  constructor(name?: string);

  /** The name of the dictionary. */
  name: string;
  /** Suppresses many errors or warnings if set to true. */
  quiet: boolean;

  /** Add values to the end of an array associated with the specified key. */
  append(key: string, ...values: any[]): void;
  /** Erase the contents of the dictionary, restoring it to a clean state. */
  clear(): void;
  /** Copy the named dictionary into this dictionary. */
  clone(name: string): void;
  /** Return 1 if the specified key exists in the dictionary, 0 if it doesn't. */
  contains(key: string): number;
  /** Write the dictionary's contents to a file in JSON format. */
  export_json(filename: string): void;
  /** Write the dictionary's contents to a file in YAML format. */
  export_yaml(filename: string): void;
  /**
   * Frees the dictionary data from the native C peer (created when making a Dict
   * object), which is not considered by the JavaScript garbage collector and may
   * consume lots of memory until the collector runs. Not necessary to call, but may
   * be called once done with the object; the Dict is unusable afterward.
   */
  freepeer(): void;
  /** Return the value associated with a key. */
  get(key: string): any;
  /** Return a list of all the keys in the dictionary, or null if it contains no keys. */
  getkeys(): string[] | null;
  /** Return a list of all the dictionary names that are known to Max. */
  getnames(): string[];
  /** Return the length of the array of values associated with a key. */
  getsize(key: string): number;
  /** Return the type of the value or values associated with a key. */
  gettype(key: string): string;
  /** Read a file in JSON format, replacing the contents of the dictionary. */
  import_json(filename: string): void;
  /** Read a file in YAML format, replacing the contents of the dictionary. */
  import_yaml(filename: string): void;
  /**
   * Replace the contents of the dictionary by parsing a serialized dictionary.
   * Understands JSON and Max Dictionary Syntax.
   */
  parse(serialization: string): void;
  /**
   * Add entries to the dictionary by pulling rows from the given coll object. Does
   * not clear existing keys from the dictionary.
   */
  pull_from_coll(coll_name: string): void;
  /**
   * Push the dictionary's content into a named coll object. The keys in the
   * dictionary become the indices in the coll.
   */
  push_to_coll(coll_name: string): void;
  /**
   * Load the contents of a file, replacing the contents of the dictionary and
   * clearing existing keys. Accepts JSON and YAML files.
   */
  readany(filename: string): void;
  /** Remove a key and its associated value from the dictionary. */
  remove(key: string): void;
  /**
   * Set the value for a key to a specified value, creating nested dicts if
   * necessary. Unlike set(), this creates a hierarchical path to the value if one
   * does not already exist.
   * @param key the key or path to a dictionary entry
   * @param value the value or values to store at that path
   */
  replace(key: string, ...value: any[]): void;
  /**
   * Set the value for a key to a specified value. Unlike replace(), will not create
   * nested dictionaries if the nested structure does not already exist.
   * @param key the key or path to a dictionary entry
   * @param value the value or values to store at that path
   */
  set(key: string, ...value: any[]): void;
  /**
   * Set the value for a key using a serialized dictionary. The serialization can be
   * formatted as JSON or as Max Dictionary Syntax.
   */
  setparse(key: string, serialization: string): void;
  /** Return the content of the dictionary as a compressed JSON string. */
  stringify_compressed(): string;
  /** Return the content of the dictionary as an unformatted JSON string. */
  stringify_unformatted(): string;
  /** Return the content of the dictionary as a JSON string. */
  stringify(): string;
  /**
   * The content of the dictionary as plain values, which is what makes JSON.stringify(dict)
   * give the content. From Max 9.2.0 (v8 engine); in the release notes, not the reference.
   */
  toJSON(): any;
  /** Open a save dialog to write the dictionary contents to a file. */
  writeagain(): void;
}

// ---- Buffer ----

/**
 * Bind to a Max buffer~ object.
 *
 * The Buffer object in JavaScript is a companion to the buffer~ object in Max.
 * Through it, you can access samples and metadata for the buffer~ object with the
 * given name.
 *
 * Conflicts with the DOM/Node global of the same name; don't combine with lib.dom or
 * @types/node.
 * @see https://docs.cycling74.com/apiref/js/buffer/
 */
declare class Buffer {
  /** @param name name of the Max buffer~ to bind to */
  constructor(name: string);

  /** Return the number of channels in the buffer~ object. */
  channelcount(): number;
  /**
   * Create a new Max buffer~ object. Only available in the new v8 javascript engine
   * objects.
   * @param name name of the Max buffer~ to create; if omitted, the current name is used
   * @param filename audio file to load; if omitted, the buffer is created empty
   * @param duration duration of the buffer in milliseconds; if omitted, the buffer is created empty
   * @param channelcount number of channels; defaults to 1 if omitted
   */
  create(name?: string, filename?: string, duration?: number, channelcount?: number): void;
  /** Return the number of frames (samples in a single channel) in the buffer~ object. */
  framecount(): number;
  /**
   * Frees the buffer~ data from the native C peer, which is not considered by the
   * JavaScript garbage collector. Not necessary to call, but may be called once done
   * with the object; the Buffer is unusable afterward.
   */
  freepeer(): void;
  /**
   * Get the value of the named attribute. Only available in the new v8 javascript
   * engine objects.
   * @param name the name of the attribute to retrieve
   * @returns the value of the attribute, as an array if the attribute value is a list
   */
  getattr(name: string): number | string | (number | string)[];
  /** Get the name of the buffer~ object. Only available in the new v8 javascript engine objects. */
  getname(): string;
  /** Return the length of the buffer~ object in milliseconds. */
  length(): number;
  /**
   * Fetch an array of samples from the buffer.
   * @param channel channel to fetch samples from (indexed from 1)
   * @param frame frame at which to start fetching samples (indexed from 0)
   * @param count number of samples to fetch
   */
  peek(channel: number, frame: number, count: number): number[];
  /**
   * Write samples into the buffer. It is more efficient to call this function once
   * with an array than to call it multiple times, each time with a single sample.
   * @param channel channel to write samples to (indexed from 1)
   * @param frame frame at which to start writing samples (indexed from 0)
   * @param samples samples to write (or a single sample to write)
   */
  poke(channel: number, frame: number, samples: number | number[]): void;
  /**
   * Send a message to the buffer. Can send any message that buffer~ understands.
   * @param message the name of the message
   * @param args arguments that follow the name of the message
   */
  send(message: string, ...args: any[]): void;
  /**
   * Set the value of the named attribute. Only available in the new v8 javascript
   * engine objects.
   */
  setattr(name: string, value: number | string | (number | string)[]): void;
  /** Set the name of the buffer. Only available in the new v8 javascript engine objects. */
  setname(name: string): void;
}

// ---- PolyBuffer ----

/**
 * Bind to a Max polybuffer~ object.
 *
 * The PolyBuffer object in JavaScript is a companion to the polybuffer~ object in
 * Max. Through it, you can access samples and metadata for the polybuffer~ object
 * with the given name.
 * @see https://docs.cycling74.com/apiref/js/polybuffer/
 */
declare class PolyBuffer {
  /** @param name name of the Max polybuffer~ to bind to */
  constructor(name: string);

  /** Number of buffer~ objects in the polybuffer~. */
  readonly count: number;
  /** Name of the Max polybuffer~. */
  readonly name: string;
  /** Memory size used by the polybuffer~ in bytes. */
  readonly size: number;

  /**
   * Add a sound file to the polybuffer~.
   * @param soundfilePath sound file path to load; if none provided, a dialog will appear
   */
  append(soundfilePath?: string): void;
  /**
   * Add an empty buffer~ with specified length and channel count.
   * @param duration the duration in milliseconds
   * @param channels the number of channels
   */
  appendempty(duration: number, channels: number): void;
  /** Delete every buffer~. */
  clear(): void;
  /**
   * Get info about a polybuffer~.
   * @returns an array containing the index, name, path, duration, channel, and
   * sample rate of the buffer~s in the polybuffer~
   */
  dump(): [number, string, string, number, number, number];
  /** Get the names of the buffer~s in the polybuffer~. */
  getbufferlist(): string[];
  /** Get every buffer~ name followed by the sound file name (without extensions). */
  getshortname(): string[];
  /** Open the polybuffer~ object's window to see information about the buffers. */
  open(): void;
  /**
   * Post the polybuffer~'s contents to the Max window: the number of items in the
   * polybuffer~ and the shortname and filenames of each buffer.
   */
  print(): void;
  /**
   * Load multiple sound files from the specified folder.
   * @param folderPath folder to read; if none provided, a dialog will appear
   */
  readfolder(folderPath?: string): void;
  /**
   * Send messages to buffer~ objects in the polybuffer~.
   * @param index the buffer~ index (1-indexed); an index of 0 sends the message to every buffer~
   * @param message the message to send
   */
  send(index: number, message: any): void;
  /** Close the window editor. */
  wclose(): void;
  /**
   * Write every buffer~ to a file in a folder.
   * @param folderPath folder to write to; if none provided, a dialog will appear
   */
  writefolder(folderPath?: string): void;
}

// ---- FileTypes ----
// Type-only namespace of string-literal aliases (no runtime object).

/**
 * String types used by File and Folder.
 * @see https://docs.cycling74.com/apiref/js/filetypes/
 */
declare namespace FileTypes {
  /** File access mode: "read", "write", or "readwrite". */
  type FileAccess = "read" | "write" | "readwrite";

  /** File byteorder (endianness): "big", "little", or "native". */
  type FileEndianness = "big" | "little" | "native";

  /** Line break convention used when writing lines: "dos", "mac", "unix", or "native". */
  type FileLineEndingStyle = "dos" | "mac" | "unix" | "native";

  /**
   * Four-character file type codes, as listed in max-fileformats.txt inside the init
   * folder in the Cycling '74 folder.
   */
  type FourCharacterCode =
    | "iLaF"
    | "maxb"
    | "TEXT"
    | "mx@c"
    | "GenX"
    | "mRef"
    | "cafe"
    | "jar "
    | "WAVE"
    | "wv64"
    | "AIFF"
    | "NxTS"
    | "ULAW"
    | "FLAC"
    | "DATA"
    | "Midi"
    | "JiT!"
    | "maxc"
    | "PICT"
    | "PICS"
    | "MPEG"
    | "mpg4"
    | "MooV"
    | "WVC1"
    | "WMVA"
    | "WMV3"
    | "WMV2"
    | "M4V "
    | "GIFf"
    | "JPEG"
    | "PNG "
    | "PNGf"
    | "TIFF"
    | "SWFL"
    | "8BPS"
    | "BMP "
    | "exr "
    | "VfW "
    | "AFxP"
    | "AFxB"
    | "AUps"
    | "V3ps"
    | "JSON"
    | "mSnp"
    | "mPrj"
    | "mZip"
    | "mPak"
    | "zip "
    | "DICT"
    | "YAML"
    | "svg "
    | "css "
    | "XSLT"
    | "ampf"
    | "amxd"
    | "pStx"
    | "pSto"
    | "gDSP"
    | "gJIT"
    | "Jmtl"
    | "Jobj"
    | "Jdae"
    | "Jbln"
    | "J3ds"
    | "Jase"
    | "Jply"
    | "Jdxf"
    | "Jlwo"
    | "Jlxo"
    | "Jstl"
    | "Jac "
    | "Jmsd"
    | "Jcob"
    | "Jscb"
    | "Jsmd"
    | "Jvta"
    | "Jmdl"
    | "Jmd2"
    | "Jmd3"
    | "Jpk3"
    | "Jmdc"
    | "Jmd5"
    | "Jbvh"
    | "Jcsm"
    | "Jxmd"
    | "Jb3d"
    | "Jq3d"
    | "Jq3s"
    | "Jogr"
    | "Jirm"
    | "Jirr"
    | "Jnff"
    | "Js8w"
    | "Joff"
    | "Jraw"
    | "Jter"
    | "J3dm"
    | "Jhmp"
    | "Jndo"
    | "FBX "
    | "glTF"
    | "Mp3 "
    | "M4a "
    | "CAF "
    | "OGG "
    | "mQur"
    | "mLsn"
    | "Jlua"
    | "mMap"
    | "mxPL"
    | "mxCT"
    | "mUgh"
    | "mMtr"
    | "mTXT"
    | "RBOP"
    | "aPin"
    | "aPcs"
    | "a3in"
    | "a3cs"
    | "AUpi"
    | "AUin"
    | "APPL"
    | "xQZZ"
    | "TXT ";
}

// ---- File ----

/**
 * The File object provides a means of reading and writing files from JavaScript.
 *
 * Conflicts with the DOM/Node global of the same name; don't combine with lib.dom or
 * @types/node.
 * @see https://docs.cycling74.com/apiref/js/file/
 */
declare class File {
  /**
   * Create a file reference for reading or writing. By default, typelist is empty.
   * If filename includes an extension, it is not necessary to supply a typelist. If
   * filename does not include an extension, File will look for a file with one of
   * the extensions specified by typelist (the four-character code may not match the
   * file extension). Given arguments, the constructor will open the file
   * automatically if it can be opened.
   * @param filename file to open; can be relative, absolute, or anything in the Max search path
   * @param access access mode: "read", "write", or "readwrite"
   * @param typelist any of the four-character codes in max-fileformats.txt
   */
  constructor(
    filename?: string,
    access?: FileTypes.FileAccess,
    typelist?: FileTypes.FourCharacterCode[],
  );

  /** File access permissions: "read", "write", or "readwrite". Defaults to "read". */
  access: FileTypes.FileAccess;
  /** The assumed file byteorder (endianness): "big", "little", or "native". Defaults to "native". */
  byteorder: FileTypes.FileEndianness;
  /** The location of the end of file, in bytes. Setting past the end of the current file appends NULL bytes. */
  eof: number;
  /** The current filename. */
  filename: string;
  /** The four-character code for the file type. */
  filetype: FileTypes.FourCharacterCode;
  /** The absolute path to the parent folder. */
  readonly foldername: string;
  /** True if the File constructor was successful in finding and opening the file. */
  readonly isopen: boolean;
  /** The line break convention to use when writing lines. Defaults to "native". */
  linebreak: FileTypes.FileLineEndingStyle;
  /** The current file position, in bytes. Set this to offset the file read/write position forward or backwards. */
  position: number;
  /** An array of file type codes to filter by when opening a file. Defaults to the empty array. */
  typelist: FileTypes.FourCharacterCode[];

  /** Closes the currently open file. */
  close(text?: string): void;
  /**
   * Opens the file specified by the filename argument. If no argument is specified,
   * opens the last opened file, or the value stored in the filename property. Check
   * isopen to see if the file was opened successfully.
   */
  open(filename?: string): void;
  /**
   * Reads and returns an array containing up to count numbers, read as bytes from
   * the file, starting at the current file position. The file position is updated
   * accordingly.
   */
  readbytes(count: number): number[];
  /**
   * Reads and returns an array containing the single character strings, read as
   * characters from the file, starting at the current file position. The file
   * position is updated accordingly.
   */
  readchars(count: number): string[];
  /**
   * Reads and returns an array containing the numbers read as 32-bit floating point
   * numbers from the file, starting at the current file position. The byteorder
   * property is taken into account. The file position is updated accordingly.
   */
  readfloat32(count: number): number[];
  /**
   * Reads and returns an array containing the numbers read as 64-bit floating point
   * numbers from the file, starting at the current file position. The byteorder
   * property is taken into account. The file position is updated accordingly.
   */
  readfloat64(count: number): number[];
  /**
   * Reads and returns an array containing the numbers read as signed 16-bit
   * integers from the file, starting at the current file position. The byteorder
   * property is taken into account. The file position is updated accordingly.
   */
  readint16(count: number): number[];
  /**
   * Reads and returns an array containing the numbers read as signed 32-bit
   * integers from the file, starting at the current file position. The byteorder
   * property is taken into account. The file position is updated accordingly.
   */
  readint32(count: number): number[];
  /**
   * Reads and returns a string containing up to maximumCount characters or up to
   * the first line break, starting at the current file position. The file position
   * is updated accordingly. Defaults to 512 if not specified.
   */
  readline(maximumCount: number): string;
  /**
   * Reads and returns a string containing up to count characters as read from the
   * file, starting at the current file position. Unlike readline, line breaks are
   * not considered. The file position is updated accordingly.
   */
  readstring(count: number): string;
  /**
   * Writes the numbers contained in the bytes argument as bytes to the file,
   * starting at the current file position. The file position is updated accordingly.
   */
  writebytes(bytes: number[]): void;
  /**
   * Writes the single character strings contained in the chars argument as
   * characters to the file, starting at the current file position. The file
   * position is updated accordingly.
   */
  writechars(chars: string[]): void;
  /**
   * Writes the numbers contained in the floats argument as 32-bit floating point
   * numbers to the file, starting at the current file position. The byteorder
   * property is taken into account. The file position is updated accordingly.
   */
  writefloat32(floats: number[]): void;
  /**
   * Writes the numbers contained in the floats argument as 64-bit floating point
   * numbers to the file, starting at the current file position. The byteorder
   * property is taken into account. The file position is updated accordingly.
   */
  writefloat64(floats: number[]): void;
  /**
   * Writes the numbers contained in the ints argument as signed 16-bit integers to
   * the file, starting at the current file position. The byteorder property is
   * taken into account. The file position is updated accordingly.
   */
  writeint16(ints: number[]): void;
  /**
   * Writes the numbers contained in the ints argument as signed 32-bit integers to
   * the file, starting at the current file position. The byteorder property is
   * taken into account. The file position is updated accordingly.
   */
  writeint32(ints: number[]): void;
  /**
   * Writes the characters contained in the text argument to the file, starting at
   * the current file position, and inserts a line break appropriate to the
   * linebreak property. The file position is updated accordingly.
   */
  writeline(text: string): void;
  /**
   * Writes the characters contained in the text argument to the file, starting at
   * the current file position. Unlike writeline, no line break is inserted. The
   * file position is updated accordingly.
   */
  writestring(text: string): void;
}

// ---- Folder ----

/**
 * Iterate through the files in a folder.
 *
 * Two types of properties are available: some refer to the current file within the
 * folder, and some refer to the Folder object's state. Most of these properties are
 * read-only.
 * @see https://docs.cycling74.com/apiref/js/folder/
 */
declare class Folder {
  /**
   * @param pathname the name of a folder; can be in the search path or a complete
   * pathname using Max path syntax
   */
  constructor(pathname: string);

  /** The total number of files of the specified type(s) contained in the folder. */
  readonly count: number;
  /**
   * Non-zero (true) if there are no more files to examine in the folder, or if the
   * pathname argument to the Folder object didn't find a folder.
   */
  readonly end: boolean;
  /**
   * The extension of the current file's name, including the period. If there are no
   * characters after the period, a null value is returned.
   */
  readonly extension: string | null;
  /** The name of the current file. */
  readonly filename: string;
  /**
   * The four-character code associated with the current file's filetype, as listed
   * in max-fileformats.txt. If there is no mapping for the file's extension, a null
   * value is returned.
   */
  readonly filetype: string | null;
  /** The current index position in the folder's file list. */
  readonly index: number;
  /**
   * An array containing the values year, month, day, hour, minute, and second with
   * the last modified date of the current file. These values can be used to create
   * a JavaScript Date object.
   */
  readonly moddate: any[];
  /** The full pathname of the folder. */
  readonly pathname: string;
  /**
   * The list of file types that will be used to find files in the folder. To
   * search for all files (the default), set this to an empty array.
   */
  typelist: string[];

  /** Closes the folder. To start using it again, call reset(). */
  close(): void;
  /** Moves to the next file. */
  next(): void;
  /**
   * Open a folder selection dialog.
   * @param location optional starting path for the dialog
   * @returns the selected folder path, or null if the dialog was cancelled
   */
  opendialog(location?: string): string | null;
  /**
   * Start iterating at the beginning of the list of files. Re-opens the folder if
   * it was previously closed with close().
   */
  reset(): void;
}

// ---- MaxString ----

/**
 * Bind a Max string object.
 *
 * Create a MaxString object when you want to bind to a Max string object, either
 * because you want to fetch its value or when you want to modify its contents. To
 * manipulate the contents of the string, get the value using stringify() and then
 * use regular JavaScript string functions.
 * @see https://docs.cycling74.com/apiref/js/maxstring/
 */
declare class MaxString {
  /**
   * Create a new MaxString. The name can be set either by passing "@name" followed
   * by the name as attribute arguments, or by setting the .name property afterward.
   * @param initial_value initial value
   * @param attr_pairs usually the string "@name" followed by the name of the string
   */
  constructor(initial_value?: string, ...attr_pairs: string[]);

  /** Get and set the name of the MaxString. Will bind to an existing Max string with the same name. */
  name: string;

  /** Update the value of the MaxString. */
  parse(value: any): void;
  /** Get the current value of the MaxString as a string. */
  stringify(): string;
  /**
   * The value JSON.stringify() uses for the MaxString. From Max 9.2.0 (v8 engine); in the
   * release notes, not the reference.
   */
  toJSON(): any;
}

// ---- MaxArray ----

/** What a MaxArray gives back for an element. */
type MaxArrayElement = string | number | Dict | MaxArray;
/** What a MaxArray takes for an element. */
type MaxArrayValue = string | number | MaxString | Dict | MaxArray;

/**
 * Bind a Max array object.
 * @see https://docs.cycling74.com/apiref/js/maxarray/
 */
declare class MaxArray {
  /** Create a new MaxArray. */
  constructor(args?: (string | number)[]);

  /** The number of elements in the MaxArray. */
  readonly length: number;
  /** Get and set the name of the MaxArray. */
  name: string;
  /** The number of elements in the MaxArray. */
  readonly size: number;

  /** Append one or more elements to the end of the MaxArray. */
  append(...args: MaxArrayValue[]): void;
  /** Get the value at the specified index. */
  at(index: number): MaxArrayElement;
  /** Remove all elements from the MaxArray. */
  clear(): void;
  /** Delete a single element at the specified index. */
  delete(index: number): void;
  /** Free the native C peer. */
  freepeer(): void;
  /** Get the current value of the MaxArray as a JavaScript array. */
  get(): MaxArrayElement[];
  /** Insert a single element at the specified index. */
  insert(index: number, value: MaxArrayValue): void;
  /** Update the value of the MaxArray. */
  parse(value: string): void;
  /** Insert one or more elements at the start of the MaxArray. */
  prepend(...args: MaxArrayValue[]): void;
  /** Replace the element at the given index with a new value. */
  replace(index: number, value: MaxArrayValue): void;
  /** Set the value of the MaxArray. */
  set(...args: (string | number)[]): void;
  /** Get the current value of the MaxArray as a string. */
  stringify(): string;
  /**
   * The value JSON.stringify() uses for the MaxArray. From Max 9.2.0 (v8 engine); in the
   * release notes, not the reference.
   */
  toJSON(): any;
}

// ---- MaxFFT / MaxFFT2D ----

/**
 * Options for constructing a MaxFFT.
 * @see https://docs.cycling74.com/apiref/js/maxfftoptions/
 */
interface MaxFFTOptions {
  /**
   * When true, inverse() scales its output by 1/size, so that inverse(forward(x)) gives x
   * back; when false (the default), transforms are unscaled.
   */
  normalize?: boolean;
  /** "float32" (the default) works on Float32Array, "float64" on Float64Array. */
  precision?: "float32" | "float64";
  /**
   * Spectrum layout, for real transforms only: "packed" (the default) is the native
   * half-spectrum; "unpacked" follows the numpy/CCS convention.
   */
  spectrum?: "packed" | "unpacked";
  /**
   * "real" (the default) makes a half-spectrum from real input; "complex" takes and gives
   * interleaved complex values.
   */
  type?: "real" | "complex";
}

/**
 * SIMD-accelerated forward and inverse Fast Fourier Transforms of real or complex signals, in
 * single or double precision. v8 engine only, from Max 9.2.0.
 * @see https://docs.cycling74.com/apiref/js/maxfft/
 */
declare class MaxFFT {
  /** Create an FFT processor for a fixed transform size. */
  constructor(size: number, options?: MaxFFTOptions);

  /** Allocate a typed array guaranteed to use the zero-copy path. */
  static alloc(length: number, precision?: "float32"): Float32Array;
  static alloc(length: number, precision: "float64"): Float64Array;
  /** Check whether a size is a natively fast transform size. */
  static isFastSize(size: number, type?: "real" | "complex"): boolean;
  /** The minimum valid transform size for a transform type. */
  static minSize(type?: "real" | "complex"): number;
  /** Find the nearest natively fast transform size to an arbitrary size. */
  static nearestFastSize(size: number, type?: "real" | "complex", higher?: boolean): number;

  /** True once dispose() has been called. */
  readonly disposed: boolean;
  /** The number of elements every time-domain array must have. */
  readonly length: number;
  /** Whether inverse() scales its output by 1/size. */
  readonly normalize: boolean;
  /** The numeric precision. */
  readonly precision: "float32" | "float64";
  /** The transform size, as passed to the constructor. */
  readonly size: number;
  /** The spectrum layout used by real transforms. */
  readonly spectrum: "packed" | "unpacked";
  /** The number of elements a spectrum has. */
  readonly spectrumLength: number;
  /** The transform type. */
  readonly type: "real" | "complex";

  /** Free the native FFT state immediately. */
  dispose(): void;
  /** Perform the forward transform. */
  forward(input: number[]): number[];
  forward(input: Float32Array, output?: Float32Array): Float32Array;
  forward(input: Float64Array, output?: Float64Array): Float64Array;
  /** Perform the inverse transform. */
  inverse(input: number[]): number[];
  inverse(input: Float32Array, output?: Float32Array): Float32Array;
  inverse(input: Float64Array, output?: Float64Array): Float64Array;
}

/**
 * Options for constructing a MaxFFT2D.
 * @see https://docs.cycling74.com/apiref/js/maxfft2doptions/
 */
interface MaxFFT2DOptions {
  /**
   * When true, inverse() scales its output by 1 / (rows * cols), so that inverse(forward(x))
   * gives x back.
   */
  normalize?: boolean;
  /** "float32" works on Float32Array, "float64" on Float64Array. */
  precision?: "float32" | "float64";
  /**
   * "real" takes a real-valued grid and gives an unpacked half-spectrum; "complex" takes and
   * gives interleaved complex values.
   */
  type?: "real" | "complex";
}

/**
 * A row/column-decomposed 2-D FFT of real or complex grids, in single or double precision.
 * v8 engine only, from Max 9.2.0.
 * @see https://docs.cycling74.com/apiref/js/maxfft2d/
 */
declare class MaxFFT2D {
  /** Create a 2-D FFT processor for a fixed grid size. */
  constructor(rows: number, cols: number, options?: MaxFFT2DOptions);

  /** Check whether a (rows, cols) pair is a natively fast 2-D transform size. */
  static isFastSize(rows: number, cols: number, type?: "real" | "complex"): boolean;
  /** Find the nearest natively fast 2-D transform size to an arbitrary pair. */
  static nearestFastSize(
    rows: number,
    cols: number,
    type?: "real" | "complex",
    higher?: boolean,
  ): [number, number];

  /** The column count, as passed to the constructor. */
  readonly cols: number;
  /** True once dispose() has been called. */
  readonly disposed: boolean;
  /** The number of elements in a time-domain array (rows * cols, or twice that for complex). */
  readonly length: number;
  /** Whether inverse() scales its output by 1 / (rows * cols). */
  readonly normalize: boolean;
  /** The numeric precision. */
  readonly precision: "float32" | "float64";
  /** The row count, as passed to the constructor. */
  readonly rows: number;
  /** The number of elements in a spectrum array. */
  readonly spectrumLength: number;
  /** The transform type. */
  readonly type: "real" | "complex";

  /** Free the native FFT state immediately. */
  dispose(): void;
  /** Perform the forward transform. */
  forward(input: number[]): number[];
  forward(input: Float32Array, output?: Float32Array): Float32Array;
  forward(input: Float64Array, output?: Float64Array): Float64Array;
  /** Perform the inverse transform. */
  inverse(input: number[]): number[];
  inverse(input: Float32Array, output?: Float32Array): Float32Array;
  inverse(input: Float64Array, output?: Float64Array): Float64Array;
}

// ---- Rx256 ----

/**
 * Xoshiro256+ random number generator: efficient, with excellent statistical properties for
 * both integer and floating-point use.
 * @see https://docs.cycling74.com/apiref/js/rx256/
 */
declare class Rx256 {
  constructor();

  /**
   * The seed for the generator. Set it to a non-zero value for a repeatable sequence; the
   * default, 0, seeds from the system clock.
   */
  seed: number;

  /** Generate a floating-point value between -1 and 1. */
  nextfloat_bipolar(): number;
  /** Generate a floating-point value between 0 and 1. */
  nextfloat_unipolar(): number;
  /** Get the next random integer in a range, from 0 to range - 1. */
  nextint(range: number): number;
}

// ---- SQLite ----

/**
 * Provides access to the SQLite database system.
 *
 * A companion object, SQLResult, is required for most database operations.
 * @see https://docs.cycling74.com/apiref/js/sqlite/
 */
declare class SQLite {
  /** All future calls to the database will be through this instance of the object. */
  constructor();

  /** Close a previously opened SQLite database. */
  close(): void;
  /** Complete a transaction and flush all database writes to the file. */
  endtransaction(): void;
  /**
   * Perform an SQL command on the database. Must be in standard SQL language
   * syntax, limited to the operations SQLite supports.
   * @param command SQL command
   * @param result SQLResult object to populate with transaction results
   * @returns an error code if unsuccessful, or zero if the call results in a completed operation
   */
  exec(command: string, result: SQLResult): number;
  /** Get the row ID of the most recently inserted row (of the last successful INSERT operation). */
  lastinsertid(): number;
  /**
   * Open an SQLite-format file for database operations.
   * @param filename file to access
   * @param on_disk if the file should be memory-based (0) or disk-based (1)
   * @param must_exist if non-zero, requires the file to exist to be opened; otherwise a file is created if one does not exist
   * @returns an error code if unsuccessful, or zero if the call results in an opened database
   */
  open(filename: string, on_disk?: number, must_exist?: number): number;
  /**
   * Start an SQL transaction on the database. Allows batching database updates and
   * rolling back sets of changes if they do not all complete. Call
   * endtransaction() when done with batch updates.
   */
  starttransaction(): void;
}

// ---- SQLResult ----

/**
 * A container for results obtained in an SQLite.exec() call.
 *
 * Not every SQLite.exec() call will produce results, but any database query
 * (SELECT in particular) will generate an SQLResult object even if the result is
 * empty.
 * @see https://docs.cycling74.com/apiref/js/sqlresult/
 */
declare class SQLResult {
  constructor();

  /**
   * Get the fieldname of a column at a given index.
   * @param index column index
   * @returns the name of the column
   */
  fieldname(index: number): string;
  /** Get the number of fields in the dataset returned in the SQLResult object. */
  numfields(): number;
  /** Get the number of records that were returned in the SQLResult object. */
  numrecords(): number;
  /**
   * Get the value of a record at a column index and record number.
   * @param index column index
   * @param record_no record number
   */
  value(index: number, record_no: number): number | string;
}

// ---- XMLHttpRequest / ProgressEvent ----

/**
 * XMLHttpRequest provides HTTP client functionality for making network requests
 * from JavaScript in Max.
 *
 * Implements a subset of the web standard XMLHttpRequest API, allowing you to make
 * HTTP requests to fetch data from servers. Based on the Max maxurl object and
 * supports asynchronous requests only. Rewritten in Max 9.2.0, which added `response`,
 * `responseURL`, `upload`, the response types other than text, and event listeners.
 *
 * The readyState property indicates the current state of the request:
 * 0 (UNSENT) open() has not been called yet;
 * 1 (OPENED) send() has not been called yet;
 * 2 (HEADERS_RECEIVED) send() has been called, and headers and status are available;
 * 3 (LOADING) downloading, responseText holds partial data;
 * 4 (DONE) the operation is complete.
 *
 * Conflicts with the DOM/Node global of the same name; don't combine with lib.dom or
 * @types/node.
 * @see https://docs.cycling74.com/apiref/js/xmlhttprequest/
 */
declare class XMLHttpRequest {
  /** State constant: open() has not been called (0). */
  static readonly UNSENT: 0;
  /** State constant: open() has been called (1). */
  static readonly OPENED: 1;
  /** State constant: headers and status are available (2). */
  static readonly HEADERS_RECEIVED: 2;
  /** State constant: the response body is downloading (3). */
  static readonly LOADING: 3;
  /** State constant: the operation is complete (4). */
  static readonly DONE: 4;

  constructor();

  readonly UNSENT: 0;
  readonly OPENED: 1;
  readonly HEADERS_RECEIVED: 2;
  readonly LOADING: 3;
  readonly DONE: 4;

  /** Called when the request is aborted. Only available in the new v8 javascript engine objects. */
  onabort: ((this: XMLHttpRequest) => void) | null;
  /** Called when the request encounters a network error. Only available in the new v8 javascript engine objects. */
  onerror: ((this: XMLHttpRequest, event: ProgressEvent) => void) | null;
  /** Called when the request successfully completes. Only available in the new v8 javascript engine objects. */
  onload: ((this: XMLHttpRequest) => void) | null;
  /** Called when the request finishes, regardless of success or failure. Only available in the new v8 javascript engine objects. */
  onloadend: ((this: XMLHttpRequest) => void) | null;
  /** Called when the request starts loading data. Only available in the new v8 javascript engine objects. */
  onloadstart: ((this: XMLHttpRequest) => void) | null;
  /** Called periodically as data is received. Only available in the new v8 javascript engine objects. */
  onprogress: ((this: XMLHttpRequest, event: ProgressEvent) => void) | null;
  /** Called whenever the readyState property changes. */
  onreadystatechange: ((this: XMLHttpRequest) => void) | null;
  /** Called when the request times out. Only available in the new v8 javascript engine objects. */
  ontimeout: ((this: XMLHttpRequest) => void) | null;
  /** The current state of the request (0 UNSENT, 1 OPENED, 2 HEADERS_RECEIVED, 3 LOADING, 4 DONE). */
  readonly readyState: number;
  /** The response, parsed as `responseType` says. From Max 9.2.0. */
  readonly response: string | ArrayBuffer | Blob | any;
  /** The response body as a string. */
  readonly responseText: string;
  /** The response type. Before Max 9.2.0 only "text" was supported. */
  responseType: "" | "text" | "arraybuffer" | "blob" | "json";
  /** The final response URL, reflecting any redirects that were followed. From Max 9.2.0. */
  readonly responseURL: string;
  /** The HTTP status code of the response (e.g., 200, 404, 500). A value of 0 indicates the request has not completed or encountered an error. */
  readonly status: number;
  /** The HTTP status text of the response (e.g., "OK", "Not Found"). */
  readonly statusText: string;
  /** The timeout for the request in milliseconds. Set to 0 for no timeout. */
  timeout: number;
  /** Whether to include credentials (cookies, authorization headers) in cross-origin requests. Currently not fully implemented. */
  withCredentials: boolean;
  /** The upload object, with progress events for the request body. From Max 9.2.0. */
  readonly upload: XMLHttpRequestUpload;

  /**
   * Gets a Max-specific response key from the underlying maxurl object. Common keys
   * include: content_type, total_time, size_download, filename_out.
   * @returns the value associated with the key, or an empty string if not found
   */
  _getResponseKey(key: string): string;
  /**
   * Sets a Max-specific request key for the underlying maxurl object. For example,
   * you can set the filename_out key to save the response directly to a file.
   */
  _setRequestKey(key: string, value: string): void;
  /**
   * Aborts the request if it is still in progress. After calling this, readyState
   * is set to UNSENT (0), and the onabort handler is called if one is set.
   */
  abort(): void;
  /** Registers an event listener. From Max 9.2.0. */
  addEventListener(type: string, listener: (...args: any[]) => void): void;
  /** Gets all response headers as a single string, separated by newlines, or an empty string if none are available. */
  getAllResponseHeaders(): string;
  /**
   * Gets the value of a specific response header.
   * @returns the header value, or an empty string if not found
   */
  getResponseHeader(name: string): string;
  /**
   * Initializes a request.
   * @param method the HTTP method (e.g., "GET", "POST", "PUT", "DELETE")
   * @param url the URL to request
   * @param async whether the request should be asynchronous (currently ignored, always async)
   * @param username optional username for HTTP authentication
   * @param password optional password for HTTP authentication
   */
  open(method: string, url: string, async?: boolean, username?: string, password?: string): void;
  /** Overrides the MIME type of the response. Must be called before send(). */
  overrideMimeType(mimeType: string): void;
  /** Removes a previously registered event listener. From Max 9.2.0. */
  removeEventListener(type: string, listener: (...args: any[]) => void): void;
  /**
   * Sends the request.
   * @param body optional request body (for POST, PUT, etc.)
   */
  send(body?: any): void;
  /** Sets a request header. Must be called after open() but before send(). */
  setRequestHeader(name: string, value: string): void;
}

/**
 * The upload object of an XMLHttpRequest, with progress events for the request body.
 * Supported only in the v8 engine. Introduced in Max 9.2.0.
 * @see https://docs.cycling74.com/apiref/js/xmlhttprequestupload/
 */
interface XMLHttpRequestUpload {
  /** Called when the upload is aborted. */
  onabort: ((event: ProgressEvent) => void) | null;
  /** Called when the upload encounters an error. */
  onerror: ((event: ProgressEvent) => void) | null;
  /** Called when the upload completes successfully. */
  onload: ((event: ProgressEvent) => void) | null;
  /** Called when the upload finishes, whether it succeeded or failed. */
  onloadend: ((event: ProgressEvent) => void) | null;
  /** Called when the upload begins. */
  onloadstart: ((event: ProgressEvent) => void) | null;
  /** Called periodically as the upload progresses. */
  onprogress: ((event: ProgressEvent) => void) | null;
  /** Called when the upload times out. */
  ontimeout: ((event: ProgressEvent) => void) | null;
}

/**
 * ProgressEvent provides information about the progress of a network request.
 *
 * ProgressEvent objects are passed to progress-related event handlers such as
 * XMLHttpRequest.onprogress and XMLHttpRequest.onerror. They contain information
 * about the amount of data that has been loaded and the total amount expected.
 *
 * Conflicts with the DOM/Node global of the same name; don't combine with lib.dom or
 * @types/node.
 * @see https://docs.cycling74.com/apiref/js/progressevent/
 */
declare class ProgressEvent {
  /** Whether the total size of the transfer is known. */
  readonly lengthComputable: boolean;
  /** The number of bytes that have been loaded. */
  readonly loaded: number;
  /** The total number of bytes expected to be loaded. */
  readonly total: number;
}
