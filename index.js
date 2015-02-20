
if (!global._babelPolyfill) {
  require("babel/polyfill"); // load polyfills and stuff
}

var _extends = function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      target[key] = source[key];
    }
  }

  return target;
};

var CationES6Module = require('./dist/cation.js')

module.exports = _extends(CationES6Module['default'], CationES6Module)
