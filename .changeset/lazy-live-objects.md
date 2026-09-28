---
"@tsln/live-object": minor
---

A `LiveObject` makes fewer `LiveAPI` objects and asks Live for less. Measurements in Live showed that a `LiveAPI` object takes most of a millisecond to make, slows every later call to the Live API a little, and is not given back until the script is reloaded.

- `api` is made the first time it is needed, so making a `LiveObject` asks nothing of Live, and the objects in a list of children cost nothing until they are used. A `LiveObject` made from an id answers `id` with that id, without checking that Live has such an object; `exists` does check.
- The `LiveObject`s made from the same id share one `LiveAPI` object, as do the ones made from `live_set`, `live_app` and `this_device`, so `LiveObject.song()` or `track.devices` called again and again make no more of them. The `LiveObject`s stay separate objects, with their own observers.
- `class_name` asks Live once for an object that exists. The accessors (`track.name`) used to ask on every access.
- `observe()` on an object that hasn't been used yet observes with the object's own `LiveAPI` object, so `observers[name]` can be `api` itself. An object that has been used, and any further member, gets a `LiveAPI` object for the member, as before.

Since `api` can be shared, it should no longer be pointed at another Live object (by its `id`, `path` or `goto`), nor have its `property` set.
