# @tsln/live-object

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
