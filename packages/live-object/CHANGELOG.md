# @tsln/live-object

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
