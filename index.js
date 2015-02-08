
if (!global._6to5Polyfill) {
  require("6to5/polyfill"); // load polyfills and stuff
}

var CationES6Module = require('./dist/cation.js')

// for normal/CommonJS support
module.exports = CationES6Module.default

// 6to5 support
exports = CationES6Module
