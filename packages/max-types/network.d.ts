// Ambient declarations for the networking API of Max 9.2's [v8]: fetch and what goes with it
// (Request, Response, Headers, AbortController, Blob, FormData, URL, the streams), WebSocket,
// WebSocketServer, EventSource, IOBuffer, and the built-in modules buffer, dgram, net, tls, http
// and https.
// Transcribed from https://docs.cycling74.com/apiref/js/
//
// All of it is in the v8 engine only, from Max 9.2.0. Each is a subset of the browser or Node
// API it is named after, not the whole of it, which is why these are declared here rather
// than taken from lib.dom or @types/node.

// ==== IOBuffer ====

/** Encodings accepted by IOBuffer construction and conversion. */
type IOBufferEncoding = "utf8" | "ascii" | "base64" | "hex";

/**
 * A Uint8Array subclass for binary data, used throughout the networking APIs. Not full Node
 * Buffer parity, and not called Buffer, which in Max is the buffer~ wrapper.
 *
 * The reference documents it as a member of the `buffer` module; it is declared as a global as
 * well because the networking examples that come with Max use it as one.
 * @see https://docs.cycling74.com/apiref/js/buffer-module/
 */
declare class IOBuffer extends Uint8Array {
  /**
   * @param value a byte length, an ArrayBuffer, a typed array or view, a string (decoded with
   *   `encoding`), or an array-like of byte values
   * @param encoding the encoding used when value is a string (default "utf8")
   */
  constructor(
    value?: number | ArrayBuffer | ArrayBufferView | string | ArrayLike<number>,
    encoding?: IOBufferEncoding,
  );

  /** Allocates a zero- or fill-initialized IOBuffer of the given size. */
  static alloc(size: number, fill?: number | string): IOBuffer;
  /** Returns the byte length of a string in the given encoding. */
  static byteLength(value: string, encoding?: IOBufferEncoding): number;
  /** Concatenates several buffers into one. */
  static concat(items: IOBuffer[]): IOBuffer;
  /** Creates an IOBuffer from a value. */
  static from(
    value: ArrayBuffer | ArrayBufferView | string | ArrayLike<number>,
    encoding?: IOBufferEncoding,
  ): IOBuffer;
  static from(
    arrayLike: Iterable<number> | ArrayLike<number>,
    mapfn?: (v: number, k: number) => number,
    thisArg?: any,
  ): IOBuffer;
  static from<T>(
    arrayLike: Iterable<T> | ArrayLike<T>,
    mapfn: (v: T, k: number) => number,
    thisArg?: any,
  ): IOBuffer;
  /** Returns whether a value is an IOBuffer. */
  static isBuffer(value: any): boolean;

  /** Returns whether this buffer has the same bytes as another. */
  equals(other: IOBuffer): boolean;
  /** Returns a new IOBuffer over a byte range. */
  slice(start?: number, end?: number): IOBuffer;
  /**
   * Decodes the buffer, or a range of it, to a string.
   * @param encoding output encoding (default "utf8")
   * @param start start byte offset
   * @param end end byte offset (exclusive)
   */
  toString(encoding?: IOBufferEncoding, start?: number, end?: number): string;
  /** Returns a plain Uint8Array view of the same bytes. */
  toUint8Array(): Uint8Array;
}

/**
 * Binary data handling: `const { IOBuffer } = require("buffer")`.
 * @see https://docs.cycling74.com/apiref/js/buffer-module/
 */
declare module "buffer" {
  const buffer: { IOBuffer: typeof IOBuffer };
  export = buffer;
}

// ==== errors and addresses ====

/**
 * Error objects delivered to networking `error` callbacks and promise rejections across
 * fetch(), the net/tls/dgram modules, the http/https modules, WebSocket and EventSource.
 * @see https://docs.cycling74.com/apiref/js/networkerror/
 */
interface NetworkError extends Error {
  /** Remote address when relevant (e.g. TCP connect or fetch DNS resolution). */
  address?: string;
  /** Node-style error code when known, e.g. "ECONNREFUSED", "ETIMEDOUT". */
  code?: string;
  /** Mirror of `code`, for Node compatibility. */
  errno?: string;
  /** Remote port when relevant. */
  port?: number;
  /** The operation that failed, e.g. "connect", "listen", "read", "write". */
  syscall?: string;
}

/**
 * The local or remote endpoint of a socket, as returned by `address()`.
 * @see https://docs.cycling74.com/apiref/js/addressinfo/
 */
interface AddressInfo {
  /** The IP address, or the socket path or pipe name of the endpoint. */
  address: string;
  /** The address family: "IPv4", "IPv6" or "IPC". */
  family: string;
  /** The port number, or 0 for IPC endpoints. */
  port: number;
}

// ==== fetch ====

/**
 * Fetches a resource over HTTP or HTTPS.
 *
 * A compatibility subset of the WHATWG Fetch standard. Only `http://` and `https://` URLs are
 * supported, and absolute URLs are required. gzip / deflate responses are decoded
 * transparently; when that happens the exposed headers omit `content-encoding` and
 * `content-length`. There is no browser CORS model, cache mode, persistent cookie store,
 * `document.cookie`, public-suffix enforcement or SameSite enforcement.
 * @param input an absolute URL string or a Request object
 * @param init request options
 * @see https://docs.cycling74.com/apiref/js/global-fetch/
 */
declare function fetch(input: string | Request, init?: RequestInit): Promise<Response>;

/** Acceptable initializers for Headers. */
type HeadersInit = Headers | string[][] | Record<string, string>;

/**
 * Acceptable values for an outgoing request or response body. A ReadableStream body requires
 * `duplex: "half"` on the request.
 */
type BodyInit =
  | string
  | IOBuffer
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | FormData
  | URLSearchParams
  | ReadableStream;

/** Credentials mode controlling cookie sending and storage for a request. */
type RequestCredentials = "omit" | "same-origin" | "include";

/** Redirect-following mode for a request. */
type RequestRedirect = "follow" | "manual" | "error";

/**
 * Options accepted by fetch() and the Request constructor.
 * @see https://docs.cycling74.com/apiref/js/requestinit/
 */
interface RequestInit {
  /** A keep-alive agent from `require("http").Agent` / `require("https").Agent`, for pooled connection reuse. */
  agent?: any;
  /** Request body. */
  body?: BodyInit | null;
  /** Cookie credentials mode (default "same-origin"). */
  credentials?: RequestCredentials;
  /** Must be "half" when body is a ReadableStream (streamed upload). */
  duplex?: "half";
  /** Request headers. */
  headers?: HeadersInit;
  /** HTTP method (default "GET"). */
  method?: string;
  /** Redirect-following mode (default "follow", up to 20 redirects). */
  redirect?: RequestRedirect;
  /** An AbortSignal that aborts the request when triggered. */
  signal?: AbortSignal;
}

/**
 * A case-insensitive multimap of HTTP headers.
 * @see https://docs.cycling74.com/apiref/js/headers/
 */
declare class Headers {
  constructor(init?: HeadersInit);

  /** Appends a value to a header, preserving existing values. */
  append(name: string, value: string): void;
  /** Removes a header. */
  delete(name: string): void;
  /** Iterates [name, value] pairs. */
  entries(): IterableIterator<[string, string]>;
  /** Invokes a callback for each header. */
  forEach(callback: (value: string, name: string, parent: Headers) => void): void;
  /** Returns the combined value for a header, or null. */
  get(name: string): string | null;
  /** Returns whether a header is present. */
  has(name: string): boolean;
  /** Iterates header names. */
  keys(): IterableIterator<string>;
  /** Sets a header, replacing any existing value. */
  set(name: string, value: string): void;
  /** Iterates header values. */
  values(): IterableIterator<string>;
}

/**
 * A request to be sent with fetch(). The URL must be an absolute http:// or https:// URL.
 * @see https://docs.cycling74.com/apiref/js/request/
 */
declare class Request {
  /**
   * @param input an absolute URL string or another Request to copy
   * @param init request options
   */
  constructor(input: string | Request, init?: RequestInit);

  /** A byte-oriented ReadableStream of the body, or null. */
  readonly body: ReadableStream | null;
  /** Whether the body has already been consumed. */
  readonly bodyUsed: boolean;
  /** The credentials mode. */
  readonly credentials: RequestCredentials;
  /** The duplex mode for streamed bodies. */
  readonly duplex: string;
  /** The request headers. */
  readonly headers: Headers;
  /** The HTTP method. */
  readonly method: string;
  /** The redirect mode. */
  readonly redirect: RequestRedirect;
  /** The associated abort signal, if any. */
  readonly signal: AbortSignal;
  /** The request URL. */
  readonly url: string;

  /** Reads the body as an ArrayBuffer. */
  arrayBuffer(): Promise<ArrayBuffer>;
  /** Reads the body as a Blob using the current content-type. */
  blob(): Promise<Blob>;
  /** Reads the body as bytes. */
  bytes(): Promise<IOBuffer>;
  /** Clones the request (tee-based; throws once the body is consumed). */
  clone(): Request;
  /** Reads the body as FormData (urlencoded or buffered multipart). */
  formData(): Promise<FormData>;
  /** Reads and parses the body as JSON. */
  json(): Promise<any>;
  /** Reads the body as a UTF-8 string. */
  text(): Promise<string>;
}

/**
 * A response returned by fetch().
 * @see https://docs.cycling74.com/apiref/js/response/
 */
declare class Response {
  constructor(
    body?: BodyInit | null,
    init?: { status?: number; statusText?: string; headers?: HeadersInit },
  );

  /** A byte-oriented ReadableStream for incremental body consumption, or null. */
  readonly body: ReadableStream | null;
  /** Whether the body has already been consumed. */
  readonly bodyUsed: boolean;
  /** The response headers. */
  readonly headers: Headers;
  /** Whether `status` is in the range 200–299. */
  readonly ok: boolean;
  /** The HTTP status code. */
  readonly status: number;
  /** The HTTP status text. */
  readonly statusText: string;
  /** The final response URL after any redirects. */
  readonly url: string;

  /** Reads the body as an ArrayBuffer. */
  arrayBuffer(): Promise<ArrayBuffer>;
  /** Reads the body as a Blob using the current content-type. */
  blob(): Promise<Blob>;
  /** Reads the body as bytes. */
  bytes(): Promise<IOBuffer>;
  /** Clones the response (tee-based; throws once the body is consumed). */
  clone(): Response;
  /** Reads and parses the body as JSON. */
  json(): Promise<any>;
  /** Reads the body as a UTF-8 string. */
  text(): Promise<string>;
}

// ==== AbortController / AbortSignal ====

/**
 * Creates an AbortSignal and the means to abort it.
 * @see https://docs.cycling74.com/apiref/js/abortcontroller/
 */
declare class AbortController {
  constructor();

  /** The signal to pass to abortable operations. */
  readonly signal: AbortSignal;

  /** Aborts associated operations and marks `signal` as aborted. */
  abort(reason?: any): void;
}

/**
 * Signals abortion to abortable operations such as fetch().
 * @see https://docs.cycling74.com/apiref/js/abortsignal/
 */
declare class AbortSignal {
  /** Returns a signal that aborts automatically after `ms` milliseconds. */
  static timeout(ms: number): AbortSignal;

  /** Whether the signal has been aborted. */
  readonly aborted: boolean;
  /** The abort reason, when `aborted` is true. */
  readonly reason: any;

  /** Registers a listener. */
  addEventListener(type: string, listener: (...args: any[]) => void): void;
  /** Removes a previously registered listener. */
  removeEventListener(type: string, listener: (...args: any[]) => void): void;
}

// ==== Blob / FormData ====

/**
 * An immutable blob of binary data with a MIME type.
 * @see https://docs.cycling74.com/apiref/js/blob/
 */
declare class Blob {
  constructor(
    parts?: Array<string | ArrayBuffer | ArrayBufferView | Blob>,
    options?: { type?: string },
  );

  /** Size of the blob in bytes. */
  readonly size: number;
  /** MIME type of the blob, or "". */
  readonly type: string;

  /** Reads the blob contents as an ArrayBuffer. */
  arrayBuffer(): Promise<ArrayBuffer>;
  /** Reads the blob contents as bytes. */
  bytes(): Promise<IOBuffer>;
  /** Returns a new blob containing a byte range of this blob. */
  slice(start?: number, end?: number, contentType?: string): Blob;
  /** Returns a byte-oriented ReadableStream over the blob contents. */
  stream(): ReadableStream;
  /** Reads the blob contents as a UTF-8 string. */
  text(): Promise<string>;
}

/**
 * A `multipart/form-data` field set.
 * @see https://docs.cycling74.com/apiref/js/formdata/
 */
declare class FormData {
  constructor();

  /** Appends a field, optionally with a filename for blob parts. */
  append(name: string, value: string | Blob, filename?: string): void;
  /** Removes a field. */
  delete(name: string): void;
  /** Iterates [name, value] pairs. */
  entries(): IterableIterator<[string, string | Blob]>;
  /** Invokes a callback for each field. */
  forEach(callback: (value: string | Blob, name: string, parent: FormData) => void): void;
  /** Returns the first value for a field, or null. */
  get(name: string): string | Blob | null;
  /** Returns all values for a field. */
  getAll(name: string): Array<string | Blob>;
  /** Returns whether a field is present. */
  has(name: string): boolean;
  /** Iterates field names. */
  keys(): IterableIterator<string>;
  /** Sets a field, replacing existing values. */
  set(name: string, value: string | Blob, filename?: string): void;
  /** Iterates field values. */
  values(): IterableIterator<string | Blob>;
}

// ==== URL / URLSearchParams ====

/**
 * Parses and manipulates URLs. Absolute URLs with the schemes http, https, ws and wss.
 * @see https://docs.cycling74.com/apiref/js/url/
 */
declare class URL {
  constructor(input: string, base?: string | URL);

  /** The fragment, including the leading `#`. */
  hash: string;
  /** The host, including the port when present. */
  host: string;
  /** The host without the port. */
  hostname: string;
  /** The full serialized URL. */
  href: string;
  /** The origin (e.g. "https://example.com"). */
  readonly origin: string;
  /** The path portion of the URL. */
  pathname: string;
  /** The port as a string, or "" when none. */
  port: string;
  /** The protocol, including the trailing colon (e.g. "https:"). */
  protocol: string;
  /** The query string, including the leading `?`, kept in sync with `searchParams`. */
  search: string;
  /** The parsed query parameters, kept in sync with `search`. */
  readonly searchParams: URLSearchParams;

  /** Returns the serialized URL (same as `href`). */
  toString(): string;
}

/**
 * Reads and manipulates URL query strings.
 * @see https://docs.cycling74.com/apiref/js/urlsearchparams/
 */
declare class URLSearchParams {
  constructor(init?: string | URLSearchParams | string[][] | Record<string, string>);

  /** Appends a new name/value pair. */
  append(name: string, value: string): void;
  /** Removes all values for a name. */
  delete(name: string): void;
  /** Iterates [name, value] pairs. */
  entries(): IterableIterator<[string, string]>;
  /** Returns the first value for a name, or null. */
  get(name: string): string | null;
  /** Returns all values for a name. */
  getAll(name: string): string[];
  /** Returns whether any value exists for a name. */
  has(name: string): boolean;
  /** Iterates parameter names. */
  keys(): IterableIterator<string>;
  /** Sets a name to a single value, replacing any existing values. */
  set(name: string, value: string): void;
  /** Serializes the parameters to a query string (without a leading `?`). */
  toString(): string;
  /** Iterates parameter values. */
  values(): IterableIterator<string>;
}

// ==== TextEncoder / TextDecoder ====

/**
 * Encodes JavaScript strings into UTF-8 bytes.
 * @see https://docs.cycling74.com/apiref/js/textencoder/
 */
declare class TextEncoder {
  constructor();

  /** Always "utf-8". */
  readonly encoding: string;

  /**
   * Encodes a string into UTF-8 bytes.
   * @param input the string to encode (default "")
   */
  encode(input?: string): IOBuffer;
}

/**
 * Decodes UTF-8 bytes into a JavaScript string.
 * @see https://docs.cycling74.com/apiref/js/textdecoder/
 */
declare class TextDecoder {
  /**
   * @param label the encoding label; only "utf-8" is supported
   * @param options decoder options
   */
  constructor(label?: string, options?: { fatal?: boolean; ignoreBOM?: boolean });

  /** The decoder's encoding, "utf-8". */
  readonly encoding: string;
  /** Whether decoding errors throw rather than emitting a replacement character. */
  readonly fatal: boolean;
  /** Whether a leading byte-order mark is preserved rather than stripped. */
  readonly ignoreBOM: boolean;

  /** Decodes bytes into a string. */
  decode(input?: ArrayBuffer | ArrayBufferView): string;
}

// ==== streams ====

/**
 * A byte-oriented readable stream.
 * @see https://docs.cycling74.com/apiref/js/readablestream/
 */
declare class ReadableStream {
  /**
   * @param underlyingSource an object with optional `start`, `pull` and `cancel` methods
   * @param strategy an optional queuing strategy
   */
  constructor(underlyingSource?: any, strategy?: any);

  /** Async iteration, for `for await...of`. */
  [Symbol.asyncIterator](): AsyncIterableIterator<IOBuffer>;
  /** Cancels the stream, aborting any underlying transport. */
  cancel(reason?: any): Promise<void>;
  /** Acquires a reader and locks the stream. */
  getReader(): ReadableStreamDefaultReader;
  /** Pipes this stream through a TransformStream. */
  pipeThrough(transform: TransformStream): ReadableStream;
  /** Pipes this stream to a WritableStream. */
  pipeTo(destination: WritableStream): Promise<void>;
  /** Splits the stream into two independent branches. */
  tee(): [ReadableStream, ReadableStream];
  /** Returns an async iterator over the stream's chunks. */
  values(): AsyncIterableIterator<IOBuffer>;
}

/**
 * A reader that pulls chunks from a ReadableStream.
 * @see https://docs.cycling74.com/apiref/js/readablestreamdefaultreader/
 */
interface ReadableStreamDefaultReader {
  /** Resolves when the stream closes, or rejects on error. */
  readonly closed: Promise<void>;

  /** Cancels the stream. */
  cancel(reason?: any): Promise<void>;
  /** Reads the next chunk. */
  read(): Promise<ReadableStreamReadResult>;
  /** Releases the reader's lock on the stream. */
  releaseLock(): void;
}

/** The result of a single ReadableStreamDefaultReader.read() call. */
interface ReadableStreamReadResult {
  /** Whether the stream has been fully read. */
  done: boolean;
  /** The chunk read, or undefined when `done` is true. */
  value?: IOBuffer;
}

/**
 * A byte-oriented writable stream, the companion for piping.
 * @see https://docs.cycling74.com/apiref/js/writablestream/
 */
declare class WritableStream {
  /**
   * @param underlyingSink an object with optional `start`, `write`, `close` and `abort` methods
   * @param strategy an optional queuing strategy
   */
  constructor(underlyingSink?: any, strategy?: any);

  /** Aborts the stream. */
  abort(reason?: any): Promise<void>;
  /** Closes the stream. */
  close(): Promise<void>;
  /** Acquires a writer and locks the stream. */
  getWriter(): WritableStreamDefaultWriter;
}

/**
 * A writer that pushes chunks to a WritableStream.
 * @see https://docs.cycling74.com/apiref/js/writablestreamdefaultwriter/
 */
interface WritableStreamDefaultWriter {
  /** Resolves when the stream closes, or rejects on error. */
  readonly closed: Promise<void>;
  /** Resolves when the stream is ready to accept more data. */
  readonly ready: Promise<void>;

  /** Aborts the stream. */
  abort(reason?: any): Promise<void>;
  /** Closes the stream. */
  close(): Promise<void>;
  /** Releases the writer's lock on the stream. */
  releaseLock(): void;
  /** Writes a chunk of byte data. */
  write(chunk: IOBuffer | ArrayBuffer | ArrayBufferView): Promise<void>;
}

/**
 * A byte-oriented transform stream, pairing a writable input with a readable output.
 * @see https://docs.cycling74.com/apiref/js/transformstream/
 */
declare class TransformStream {
  /**
   * @param transformer an object with optional `start`, `transform` and `flush` methods
   * @param writableStrategy an optional queuing strategy for the writable side
   * @param readableStrategy an optional queuing strategy for the readable side
   */
  constructor(transformer?: any, writableStrategy?: any, readableStrategy?: any);

  /** The readable output side. */
  readonly readable: ReadableStream;
  /** The writable input side. */
  readonly writable: WritableStream;
}

// ==== EventSource ====

/**
 * A Server-Sent Events client. URLs must be absolute http:// or https:// URLs.
 * @see https://docs.cycling74.com/apiref/js/eventsource/
 */
declare class EventSource {
  constructor(url: string, options?: { withCredentials?: boolean });

  /** Connecting state constant. */
  readonly CONNECTING: number;
  /** Open state constant. */
  readonly OPEN: number;
  /** Closed state constant. */
  readonly CLOSED: number;

  /** Called on error, before automatic reconnection attempts. */
  onerror: ((event: { type: string }) => void) | null;
  /** Called when a default, unnamed message arrives. */
  onmessage: ((event: EventSourceMessageEvent) => void) | null;
  /** Called when the connection opens. */
  onopen: ((event: { type: string }) => void) | null;
  /** The current connection state. */
  readonly readyState: number;
  /** The stream URL, as given to the constructor. */
  readonly url: string;
  /** Whether cross-origin credentials are included in requests. */
  readonly withCredentials: boolean;

  /** Registers a listener for named or default event messages. */
  addEventListener(type: string, listener: (event: EventSourceMessageEvent) => void): void;
  /** Closes the connection for good, with no reconnection attempts. */
  close(): void;
  /** Removes a previously registered listener. */
  removeEventListener(type: string, listener: (event: EventSourceMessageEvent) => void): void;
}

/** An event delivered to an EventSource. */
interface EventSourceMessageEvent {
  /** The event payload. */
  data: string;
  /** The last event ID seen, used as `Last-Event-ID` on reconnect. */
  lastEventId: string;
  /** The event origin. */
  origin: string;
  /** The EventSource that dispatched this event. */
  target: EventSource;
  /** The event type. */
  type: string;
}

// ==== WebSocket ====

/**
 * A WebSocket client. URLs must be absolute ws:// or wss:// URLs. There is no binaryType,
 * extensions or custom-header API.
 * @see https://docs.cycling74.com/apiref/js/websocket/
 */
declare class WebSocket {
  constructor(url: string, protocols?: string | string[]);

  /** The number of queued outbound bytes. */
  readonly bufferedAmount: number;
  /** Called when the connection closes. */
  onclose: ((event: WebSocketCloseEvent) => void) | null;
  /** Called when queued outbound bytes drop below the high-water mark. */
  ondrain: ((event: { type: string }) => void) | null;
  /** Called on error. */
  onerror: ((event: WebSocketErrorEvent) => void) | null;
  /** Called when a message arrives. */
  onmessage: ((event: WebSocketMessageEvent) => void) | null;
  /** Called when the connection opens. */
  onopen: ((event: { type: string }) => void) | null;
  /** The negotiated subprotocol, or "" until the handshake selects one. */
  readonly protocol: string;
  /** The connection state (CONNECTING, OPEN, CLOSING, CLOSED). */
  readonly readyState: number;
  /** The connection URL. */
  readonly url: string;

  /** Registers an event listener. */
  addEventListener(type: string, listener: (...args: any[]) => void): void;
  /** Closes the connection. */
  close(code?: number, reason?: string): void;
  /** Removes an event listener. */
  removeEventListener(type: string, listener: (...args: any[]) => void): void;
  /**
   * Sends data as a text or binary frame.
   * @returns false once queued outbound bytes exceed the high-water mark
   */
  send(value: string | IOBuffer | ArrayBuffer | ArrayBufferView): boolean;
}

/** A `message` event delivered to a WebSocket. */
interface WebSocketMessageEvent {
  /** Text frames arrive as strings; binary frames arrive as IOBuffer. */
  data: string | IOBuffer;
  /** The event type. */
  type: string;
}

/** A `close` event delivered to a WebSocket. */
interface WebSocketCloseEvent {
  /** The close code. */
  code: number;
  /** The close reason. */
  reason: string;
  /** The event type. */
  type: string;
}

/** An `error` event delivered to a WebSocket. */
interface WebSocketErrorEvent {
  /** The underlying error. */
  error: NetworkError;
  /** The event type. */
  type: string;
}

/**
 * A WebSocket server. Plain ws:// server sockets only; WSS and certificate configuration are
 * not exposed. Use `{ noServer: true }` together with an http/https server's `upgrade`
 * listener to accept ws:// or wss:// upgrades on an existing server.
 * @see https://docs.cycling74.com/apiref/js/websocketserver/
 */
declare class WebSocketServer {
  /**
   * @param options server options. `noServer: true` creates a server with no acceptor, for use
   *   with handleUpgrade(); `selectProtocol(req, offered)` chooses a subprotocol during upgrade
   *   handling.
   * @param callback an optional connection listener
   */
  constructor(
    options?: {
      port?: number;
      host?: string;
      noServer?: boolean;
      protocols?: string | string[];
      selectProtocol?: (req: any, offeredProtocols: string[]) => string;
    },
    callback?: (ws: WebSocketConnection, req: any) => void,
  );

  /** Stops the server. */
  close(callback?: () => void): void;
  /** Emits an event to registered listeners. */
  emit(type: string, ...args: any[]): boolean;
  /** Completes a WebSocket handshake on an upgrade socket from an HTTP server's `upgrade` event. */
  handleUpgrade(
    req: any,
    socket: any,
    head: any,
    callback: (ws: WebSocketConnection) => void,
  ): void;
  /** Begins listening (when not in noServer mode). */
  listen(optionsOrPort: number | { port?: number; host?: string }, callback?: () => void): void;
  /** Removes an event listener. */
  off(type: string, listener: (...args: any[]) => void): this;
  /** Registers an event listener (`listening`, `connection`, `close`, `error`). */
  on(type: string, listener: (...args: any[]) => void): this;
  /** Registers a one-shot event listener. */
  once(type: string, listener: (...args: any[]) => void): this;
}

/**
 * A server-side WebSocket connection accepted by a WebSocketServer.
 * @see https://docs.cycling74.com/apiref/js/websocketconnection/
 */
interface WebSocketConnection {
  /** The number of queued outbound bytes. */
  readonly bufferedAmount: number;
  /** The negotiated subprotocol, or "". */
  readonly protocol: string;

  /** Closes the connection. */
  close(code?: number, reason?: string): void;
  /** Registers an event listener (`message`, `close`, `error`, `drain`). */
  on(type: string, listener: (...args: any[]) => void): this;
  /** Sends data. See WebSocket.send(). */
  send(value: string | IOBuffer | ArrayBuffer | ArrayBufferView): boolean;
}

// ==== dgram ====

/**
 * UDP datagram sockets. IPv6 parity is limited and UDP socket-option coverage is narrow.
 * @see https://docs.cycling74.com/apiref/js/dgram-module/
 */
declare module "dgram" {
  /** Creates a UDP socket. */
  function createSocket(type: "udp4" | "udp6"): Socket;

  /** Sender information passed with a `message` event. */
  interface RemoteInfo {
    /** The sender's IP address. */
    address: string;
    /** The sender's port number. */
    port: number;
  }

  /**
   * A UDP socket. Events: `message` (an IOBuffer and a RemoteInfo), `listening`, `close`,
   * `error`. The socket-option setters throw structured errors on failure, and open the socket
   * if it is not yet bound.
   */
  class Socket {
    /** The socket protocol type. */
    readonly type: "udp4" | "udp6";

    /** Joins a multicast group. */
    addMembership(multicastAddress: string, interfaceAddress?: string): void;
    /** Returns the bound local endpoint. */
    address(): AddressInfo;
    /** Binds the socket to a local port and address. */
    bind(port: number, address?: string, callback?: () => void): void;
    /** Closes the socket. */
    close(): void;
    /** Leaves a multicast group. */
    dropMembership(multicastAddress: string, interfaceAddress?: string): void;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-time event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
    /** Sends a datagram to the given port and address. */
    send(
      msg: string | ArrayBufferView,
      port: number,
      address?: string,
      callback?: (error?: Error) => void,
    ): void;
    /** Enables or disables broadcast mode. */
    setBroadcast(flag: boolean): void;
    /** Selects the outgoing multicast interface (IPv4 only). */
    setMulticastInterface(iface: string): void;
    /** Enables or disables multicast loopback. */
    setMulticastLoopback(flag: boolean): void;
    /** Sets the multicast time-to-live. */
    setMulticastTTL(ttl: number): void;
    /** Sets the unicast time-to-live. */
    setTTL(ttl: number): void;
  }
}

// ==== net ====

/**
 * TCP client and server sockets: a minimal subset of Node's `net`. Also IPC stream sockets,
 * through a `path` endpoint: Unix domain sockets on macOS and Linux, Win32 named pipes on
 * Windows.
 * @see https://docs.cycling74.com/apiref/js/net-module/
 */
declare module "net" {
  /** Creates a Socket and connects it to a TCP host and port. */
  function connect(port: number, host?: string, callback?: () => void): Socket;
  /** Creates a Socket and connects it using an options object. */
  function connect(options: ConnectOptions, callback?: () => void): Socket;
  /** Alias of connect(). */
  function createConnection(port: number, host?: string, callback?: () => void): Socket;
  function createConnection(options: ConnectOptions, callback?: () => void): Socket;
  /** Creates a Server. */
  function createServer(connectionListener?: (socket: Socket) => void): Server;

  /** Options for Socket.connect() and connect(). */
  interface ConnectOptions {
    /** TCP host name. */
    host?: string;
    /**
     * An IPC endpoint instead of a TCP host and port: a Unix domain socket path on macOS and
     * Linux (e.g. "/tmp/max-v8.sock"), a named-pipe name on Windows (e.g.
     * "\\\\.\\pipe\\max-v8").
     */
    path?: string;
    /** TCP port number. */
    port?: number;
    /** The number of queued bytes at which write() returns false (default 65536). */
    writableHighWaterMark?: number;
  }

  /** Options for Server.listen(). */
  interface ListenOptions {
    /** TCP host name. */
    host?: string;
    /** An IPC endpoint instead of a TCP host and port. */
    path?: string;
    /** TCP port number. */
    port?: number;
    /** Applied as `writableHighWaterMark` to accepted sockets. */
    writableHighWaterMark?: number;
  }

  /** A TCP or IPC server, delivering connections as Socket instances. */
  class Server {
    /** Whether the server is currently listening. */
    readonly listening: boolean;

    /** Returns the bound local endpoint, after listening. */
    address(): AddressInfo;
    /** Stops the server. */
    close(callback?: () => void): this;
    /** Begins listening on a TCP host and port. */
    listen(port: number, host?: string, callback?: () => void): this;
    /** Begins listening using an options object (host and port, or an IPC path). */
    listen(options: ListenOptions, callback?: () => void): this;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-shot event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
  }

  /**
   * A TCP or IPC stream socket. Incoming data arrives as IOBuffer in `data` events; `drain`
   * fires when the outbound queue falls below the high-water mark.
   */
  class Socket {
    /** Whether the socket has been destroyed. */
    readonly destroyed: boolean;
    /** Local host address. */
    readonly localAddress: string;
    /** Local port number. */
    readonly localPort: number;
    /** Remote host address. */
    readonly remoteAddress: string;
    /** Remote port number. */
    readonly remotePort: number;

    /** Returns the local endpoint, once connected. */
    address(): AddressInfo;
    /** Connects to a TCP host and port. */
    connect(port: number, host?: string, callback?: () => void): this;
    /** Connects using an options object (a TCP host and port, or an IPC path). */
    connect(options: ConnectOptions, callback?: () => void): this;
    /** Destroys the socket. */
    destroy(): void;
    /**
     * Sends an optional final chunk and half-closes the writable side. On a Windows named pipe
     * this flushes writes and keeps the handle open: the peer sees the end only on destroy().
     */
    end(
      chunk?: string | IOBuffer | ArrayBufferView,
      encoding?: string,
      callback?: () => void,
    ): void;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-shot event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
    /** Pauses delivery of `data` events. */
    pause(): void;
    /** Resumes delivery of `data` events. */
    resume(): void;
    /**
     * Queues data to send.
     * @returns false once queued bytes exceed the high-water mark
     */
    write(
      chunk: string | IOBuffer | ArrayBufferView,
      encoding?: string,
      callback?: () => void,
    ): boolean;
  }
}

// ==== tls ====

/**
 * TLS/SSL client and server sockets: a minimal subset of Node's `tls`. No client-certificate
 * auth, no SNI routing, no ALPN/HTTP2, and no TLS options beyond `key`, `cert` and `ca`.
 * @see https://docs.cycling74.com/apiref/js/tls-module/
 */
declare module "tls" {
  /** Options for connect(). */
  interface ConnectOptions {
    /** Trusted CA certificate(s), as a PEM string or IOBuffer. */
    ca?: string | IOBuffer;
    /** Client certificate, as a PEM string or IOBuffer. */
    cert?: string | IOBuffer;
    /** Server hostname. */
    host?: string;
    /** Client private key, as a PEM string or IOBuffer. */
    key?: string | IOBuffer;
    /** Server port. */
    port?: number;
    /** Verify the peer certificate (default true). Set false for self-signed or dev certs. */
    rejectUnauthorized?: boolean;
    /** Server name for the connection. */
    servername?: string;
  }

  /** A summary of a peer certificate. */
  interface PeerCertificate {
    issuer: string;
    subject: string;
    valid_from: string;
    valid_to: string;
  }

  /** Options for createServer(). */
  interface ServerOptions {
    /** Server certificate, as a PEM string or IOBuffer. */
    cert: string | IOBuffer;
    /** Server private key, as a PEM string or IOBuffer. */
    key: string | IOBuffer;
  }

  /** Creates a TLSSocket and connects it. */
  function connect(options: ConnectOptions, callback?: () => void): TLSSocket;
  function connect(port: number, host?: string, callback?: () => void): TLSSocket;
  /** Alias of connect(). */
  function createConnection(options: ConnectOptions, callback?: () => void): TLSSocket;
  /** Creates a TLS server. */
  function createServer(
    options: ServerOptions,
    secureConnectionListener?: (socket: TLSSocket) => void,
  ): Server;

  /**
   * A TLS server, delivering accepted sockets as TLSSocket instances. Events: `listening`,
   * `secureConnection`, `close`, `error`.
   */
  class Server {
    /** Returns the server's bound address. */
    address(): AddressInfo;
    /** Stops accepting connections and closes the server. */
    close(callback?: () => void): this;
    /** Begins accepting connections. */
    listen(port: number, host?: string, callback?: () => void): this;
    listen(options: { port?: number; host?: string }, callback?: () => void): this;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-shot event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
  }

  /**
   * A TLS/SSL stream socket, which verifies peer certificates by default. Events: `connect`,
   * `secureConnect`, `data`, `drain`, `close`, `error`.
   */
  class TLSSocket {
    /** The verification error message, when not authorized. */
    readonly authorizationError: string;
    /** Whether the peer certificate was verified. */
    readonly authorized: boolean;
    /** Whether the socket has been destroyed. */
    readonly destroyed: boolean;
    /** Always true for a TLS socket. */
    readonly encrypted: boolean;
    /** The local IP address. */
    readonly localAddress: string;
    /** The local port number. */
    readonly localPort: number;
    /** The remote IP address. */
    readonly remoteAddress: string;
    /** The remote port number. */
    readonly remotePort: number;

    /** Returns the local endpoint, once connected. */
    address(): AddressInfo;
    /** Connects and performs the TLS handshake. */
    connect(
      optionsOrPort: ConnectOptions | number,
      hostOrCallback?: string | (() => void),
      callback?: () => void,
    ): this;
    /** Destroys the socket. */
    destroy(): void;
    /** Sends an optional final chunk and half-closes the socket. */
    end(
      chunk?: string | IOBuffer | ArrayBufferView,
      encoding?: string,
      callback?: () => void,
    ): void;
    /** Returns a summary of the peer certificate, when available. */
    getPeerCertificate(): PeerCertificate | undefined;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-shot event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
    /** Pauses delivery of `data` events. */
    pause(): void;
    /** Resumes delivery of `data` events. */
    resume(): void;
    /**
     * Queues data to send.
     * @returns false under backpressure
     */
    write(
      chunk: string | IOBuffer | ArrayBufferView,
      encoding?: string,
      callback?: () => void,
    ): boolean;
  }
}

// ==== http / https ====

/**
 * An HTTP/1.1 client and server: a minimal subset of Node's `http`.
 * @see https://docs.cycling74.com/apiref/js/http-module/
 */
declare module "http" {
  /** A merged, lowercased view of headers. Repeated `set-cookie` values are arrays. */
  type Headers = Record<string, string | string[]>;

  /** What a server calls for each request. */
  type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

  /** Options for request() and get(). */
  interface RequestOptions {
    /** A keep-alive Agent, for pooled connection reuse. */
    agent?: Agent;
    /** Opt in to transparent gzip/deflate decoding (default false). */
    decompress?: boolean;
    headers?: Record<string, string | string[]>;
    host?: string;
    hostname?: string;
    method?: string;
    path?: string;
    port?: number;
    protocol?: string;
    /** An AbortSignal that aborts the request. */
    signal?: AbortSignal;
    /** Abort the request after this many milliseconds. */
    timeout?: number;
  }

  /** A keep-alive connection pool for client requests. */
  class Agent {
    constructor(options?: { keepAlive?: boolean; keepAliveMsecs?: number });

    /** Closes pooled connections. */
    destroy(): void;
  }

  /** An outgoing client request. Events: `response`, `drain`, `close`, `error`, `timeout`. */
  class ClientRequest {
    /** Aborts the request. */
    abort(): void;
    /** Destroys the request, optionally with an error. */
    destroy(error?: Error): void;
    /** Writes an optional final chunk and finishes the request, which is what sends it. */
    end(
      chunk?: string | IOBuffer | ArrayBufferView,
      encoding?: string,
      callback?: () => void,
    ): void;
    /** Returns a previously set header value. */
    getHeader(name: string): string | string[] | undefined;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-time event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
    /** Removes a previously set header. */
    removeHeader(name: string): void;
    /** Sets a request header; an array emits the header line once per value. */
    setHeader(name: string, value: string | string[]): void;
    /** Sets a timeout for this request. */
    setTimeout(timeout: number, callback?: () => void): this;
    /** Writes a body chunk. */
    write(
      chunk?: string | IOBuffer | ArrayBufferView,
      encoding?: string,
      callback?: () => void,
    ): boolean;
  }

  /**
   * The response given to the callback of request() and get(). Events: `data`, `end`,
   * `close`, `error`.
   */
  class ClientResponse {
    /** Whether the response is complete. */
    readonly complete: boolean;
    /** Merged, lowercased headers. */
    readonly headers: Headers;
    /** The headers in wire order, as a flat list alternating name and value. */
    readonly rawHeaders: string[];
    /** Whether `data` events are flowing. */
    readonly readableFlowing: boolean | null;
    /** HTTP status code. */
    readonly statusCode: number;
    /** HTTP status message. */
    readonly statusMessage: string;
    /** Response URL. */
    readonly url: string;

    /** Buffers the full body as an ArrayBuffer. */
    arrayBuffer(): Promise<ArrayBuffer>;
    /** Buffers the full body as bytes. */
    bytes(): Promise<IOBuffer>;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-time event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
    /** Pauses `data` events. */
    pause(): void;
    /** Resumes `data` events. */
    resume(): void;
    /** Buffers the full body as a UTF-8 string. */
    text(): Promise<string>;
  }

  /**
   * An incoming server request, the first argument of a request listener. Events: `data`,
   * `end`, `close`, `error`.
   */
  class IncomingMessage {
    /** Whether the request is complete. */
    readonly complete: boolean;
    /** Whether the request is destroyed. */
    readonly destroyed: boolean;
    /** Merged, lowercased headers. */
    readonly headers: Headers;
    /** HTTP version string. */
    readonly httpVersion: string;
    readonly localAddress: string;
    readonly localPort: number;
    /** HTTP method. */
    readonly method: string;
    /** The headers in wire order, as a flat list alternating name and value. */
    readonly rawHeaders: string[];
    /** Whether `data` events are flowing. */
    readonly readableFlowing: boolean | null;
    readonly remoteAddress: string;
    readonly remotePort: number;
    /** The socket the request arrived on. */
    readonly socket: any;
    /** Request URL path. */
    readonly url: string;

    /** Buffers the full body as an ArrayBuffer. */
    arrayBuffer(): Promise<ArrayBuffer>;
    /** Buffers the full body as bytes. */
    bytes(): Promise<IOBuffer>;
    /** Buffers the full body and parses it as JSON. */
    json(): Promise<any>;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-time event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
    /** Pauses `data` events. */
    pause(): void;
    /** Resumes `data` events. */
    resume(): void;
    /** Buffers the full body as a UTF-8 string. */
    text(): Promise<string>;
  }

  /**
   * An HTTP/1.1 server. Events: `listening`, `request`, `upgrade` (for WebSocket, see
   * WebSocketServer.handleUpgrade()), `close`, `error`.
   */
  class Server {
    /** Returns the address the server is listening on. */
    address(): AddressInfo;
    /** Closes the server. */
    close(callback?: () => void): this;
    /**
     * Starts listening. The form with a port and a callback but no host is not in the
     * reference; it is what the HTTP server example that comes with Max calls.
     */
    listen(port: number, host?: string, callback?: () => void): this;
    listen(port: number, callback?: () => void): this;
    listen(options: { port?: number; host?: string }, callback?: () => void): this;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-time event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
  }

  /**
   * A server response, the second argument of a request listener. Events: `drain`, `close`,
   * `error`.
   */
  class ServerResponse {
    /** Whether headers have been sent. */
    readonly headersSent: boolean;
    /** HTTP status code. */
    statusCode: number;
    /** HTTP status message. */
    statusMessage: string;
    /** Whether the response has ended. */
    readonly writableEnded: boolean;

    /** Writes an optional final chunk and ends the response. */
    end(
      chunk?: string | IOBuffer | ArrayBufferView,
      encoding?: string,
      callback?: () => void,
    ): void;
    /** Returns a previously set header value. */
    getHeader(name: string): string | string[] | undefined;
    /** Removes an event listener. */
    off(event: string, listener: (...args: any[]) => void): this;
    /** Registers an event listener. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-time event listener. */
    once(event: string, listener: (...args: any[]) => void): this;
    /** Removes a previously set header. */
    removeHeader(name: string): void;
    /** Sets a response header; an array emits the header line once per value. */
    setHeader(name: string, value: string | string[]): void;
    /** Writes a body chunk. */
    write(
      chunk?: string | IOBuffer | ArrayBufferView,
      encoding?: string,
      callback?: () => void,
    ): boolean;
    /** Writes the status line and headers. */
    writeHead(
      statusCode: number,
      statusMessageOrHeaders?: string | Record<string, string | string[]>,
      headers?: Record<string, string | string[]>,
    ): this;
  }

  /** Creates an HTTP server. */
  function createServer(requestListener?: RequestListener): Server;
  /** Starts a client GET request, and calls end() on it. */
  function get(
    optionsOrUrl: string | { href: string } | RequestOptions,
    callback?: (res: ClientResponse) => void,
  ): ClientRequest;
  /** Starts a client request, which is sent once end() is called on it. */
  function request(
    optionsOrUrl: string | { href: string } | RequestOptions,
    callback?: (res: ClientResponse) => void,
  ): ClientRequest;

  /** The shared default Agent. */
  const globalAgent: Agent;
}

/**
 * `http` over TLS, defaulting to https: URLs. A minimal subset of Node's `https`.
 * @see https://docs.cycling74.com/apiref/js/https-module/
 */
declare module "https" {
  import http = require("http");

  /** The shared default agent for HTTPS requests. */
  const globalAgent: http.Agent;

  /** Creates a TLS-backed HTTP/1.1 server. `key` and `cert` are PEM strings or IOBuffers. */
  function createServer(
    options: { key: string | IOBuffer; cert: string | IOBuffer },
    requestListener?: http.RequestListener,
  ): http.Server;
  /** Starts an HTTPS client GET request, and calls end() on it. */
  function get(
    optionsOrUrl: string | { href: string } | http.RequestOptions,
    callback?: (res: http.ClientResponse) => void,
  ): http.ClientRequest;
  /** Starts an HTTPS client request. */
  function request(
    optionsOrUrl: string | { href: string } | http.RequestOptions,
    callback?: (res: http.ClientResponse) => void,
  ): http.ClientRequest;
}
