---
"@tsln/timers": patch
---

A Task is no longer freed from inside its own callback, which made Max post "method removeproperty called on invalid object" after a timeout ran or an interval cleared itself. Such a Task is now freed by the next call to `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval` or `clearAll`.
