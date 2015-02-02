require("6to5/polyfill"); // load polyfills and stuff

var CationModule = require('./dist/cation.js')

module.exports        = CationModule.default;
exports.BasicProvider = CationModule.BasicProvider
