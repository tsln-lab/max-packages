---
"@tsln/live-object": patch
---

Every `LiveAPI` object a `LiveObject` makes is now kept for as long as the script runs. Before, one that nothing referred to any more (made from a path, as `track` does, a lookup like `thisDevice()` that found nothing, or a `LiveObject` let go of) could be freed by the garbage collector, and in the Max editor that crashed Max: freeing a `LiveAPI` talks to Live over IPC, Max delivers pending messages meanwhile, and one reaching a `[v8]` during the collection makes V8 abort with "Invoke in DisallowJavascriptExecutionScope".
