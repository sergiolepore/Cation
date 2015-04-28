
if (!global._babelPolyfill) {
  require("babel/polyfill"); // load polyfills and stuff
}

var CationES6Module = require('./dist/cation.js')

// for normal/CommonJS support
module.exports = CationES6Module.default
