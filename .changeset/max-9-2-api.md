---
"@tsln/max-types": minor
---

Add the API that Max 9.2 gave `[v8]`: `console`, `setTimeout` and the other timers, `queueMicrotask`, `fetch` with `Request`, `Response`, `Headers`, `AbortController`, `Blob`, `FormData`, `URL` and the streams, `WebSocket`, `WebSocketServer`, `EventSource`, `IOBuffer`, the built-in modules `buffer`, `dgram`, `net`, `tls`, `http` and `https`, and `MaxFFT`, `MaxFFT2D`, `MaxArray` and `Rx256`. `XMLHttpRequest` gains what its rewrite added (`response`, `responseURL`, `upload`, event listeners, the state constants), and `Dict`, `MaxString` and `MaxArray` have `toJSON()`.

A project that declared `console` or the timers as globals of its own will now see them declared twice, and should drop its own.
