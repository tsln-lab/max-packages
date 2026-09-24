---
"@tsln/live-object": minor
---

`track` now finds return tracks and the master track as well: an object under `live_set return_tracks N` or `live_set master_track` returns that track, where before only `live_set tracks N` was matched.
