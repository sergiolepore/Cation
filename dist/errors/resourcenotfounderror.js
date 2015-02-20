"use strict";

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ResourceNotFoundError = (function (Error) {
  function ResourceNotFoundError(message) {
    _classCallCheck(this, ResourceNotFoundError);

    this.name = "ResourceNotFoundError";
    this.message = message;
    Error.captureStackTrace(this, ResourceNotFoundError);
  }

  _inherits(ResourceNotFoundError, Error);

  return ResourceNotFoundError;
})(Error);

module.exports = ResourceNotFoundError;