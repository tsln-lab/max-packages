# @tsln/live-object

## 0.4.0

### Minor Changes

- 200548d: A `LiveObject` makes fewer `LiveAPI` objects and asks Live for less. Measurements in Live showed that a `LiveAPI` object takes most of a millisecond to make, slows every later call to the Live API a little, and is not given back until the script is reloaded.
  
  - `api` is made the first time it is needed, so making a `LiveObject` asks nothing of Live, and the objects in a list of children cost nothing until they are used. A `LiveObject` made from an id answers `id` with that id, without checking that Live has such an object; `exists` does check.
  - The `LiveObject`s made from the same id share one `LiveAPI` object, as do the ones made from `live_set`, `live_app` and `this_device`, so `LiveObject.song()` or `track.devices` called again and again make no more of them. The `LiveObject`s stay separate objects, with their own observers.
  - `class_name` asks Live once for an object that exists. The accessors (`track.name`) used to ask on every access.
  - `observe()` on an object that hasn't been used yet observes with the object's own `LiveAPI` object, so `observers[name]` can be `api` itself. An object that has been used, and any further member, gets a `LiveAPI` object for the member, as before.
  
  Since `api` can be shared, it should no longer be pointed at another Live object (by its `id`, `path` or `goto`), nor have its `property` set.

## 0.3.0

### Minor Changes

- 0e22e28: Observations can now be stopped: `observe()` returns a `LiveObject.Observer` with an `unobserve()` method, and `unobserve(name)` does the same by member name. `observe()` used to return `true`; it now returns the observer, or `null` when the object doesn't exist, in which case it no longer creates an observer. Observing a member that is already observed replaces the previous callback instead of leaving it running.

## 0.2.0

### Minor Changes

- dbb8630: `track` now finds return tracks and the master track as well: an object under `live_set return_tracks N` or `live_set master_track` returns that track, where before only `live_set tracks N` was matched.

## 0.1.0

### Minor Changes

- 496c61a: Initial release: `LiveObject`, a typed wrapper around LiveAPI, moved from the max-msp repository.

### Patch Changes

- Updated dependencies [496c61a]
- Updated dependencies [5cfd20c]
- Updated dependencies [fc3a9ae]
  - @tsln/lom-types@0.1.0
  - @tsln/max-types@0.1.0
