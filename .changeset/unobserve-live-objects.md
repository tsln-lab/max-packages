---
"@tsln/live-object": minor
---

Observations can now be stopped: `observe()` returns a `LiveObject.Observer` with an `unobserve()` method, and `unobserve(name)` does the same by member name. `observe()` used to return `true`; it now returns the observer, or `null` when the object doesn't exist, in which case it no longer creates an observer. Observing a member that is already observed replaces the previous callback instead of leaving it running.
