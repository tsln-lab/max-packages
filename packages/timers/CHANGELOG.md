# @tsln/timers

## 0.1.1

### Patch Changes

- a0570bf: A Task is no longer freed from inside its own callback, which made Max post "method removeproperty called on invalid object" after a timeout ran or an interval cleared itself. Such a Task is now freed by the next call to `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval` or `clearAll`.

## 0.1.0

### Minor Changes

- 0c60b4a: Initial release: the Max console as a Console API object, and setTimeout/setInterval built on Task, both with an install() for bundled packages that expect the globals. Moved from the max-msp repository.
