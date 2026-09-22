// A [node.script] script: put `node.script script.js` in an object box with this folder in
// Max's search path, and send it `script start`. Compiled in place by `npm run watch:node`.
//
// Packages the script requires at runtime go in this folder's package.json and are installed
// here, next to the script, since that is where Node resolves them from.

import maxAPI = require("max-api");

maxAPI.addHandlers({
  bang: () => maxAPI.outletBang(),
  number: (value) => maxAPI.outlet(value * 2),
  list: (...values) => maxAPI.outlet(values.length),
  dict: (dict) => maxAPI.post(Object.keys(dict)),
  // any other message: `gain 0.5` arrives here as ("gain", 0.5)
  [maxAPI.MESSAGE_TYPES.ALL]: (handled, ...args) => {
    if (!handled) maxAPI.post("unhandled:", args, maxAPI.POST_LEVELS.WARN);
  },
});

maxAPI.post(`running in ${process.env.MAX_ENV ?? "unknown"}, node ${process.version}`);
