"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _get = function get(object, property, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var _inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

var _interopRequireWildcard = function (obj) {
  return obj && obj.constructor === Object ? obj : {
    "default": obj
  };
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

var BasicProvider = _interopRequire(require("./basicprovider"));

var util = _interopRequireWildcard(require("../helpers/service"));

/**
 * Service Provider
 */
var ServiceProvider = (function (BasicProvider) {
  function ServiceProvider(container, id, resource) {
    var options = arguments[3] === undefined ? {} : arguments[3];
    _get(Object.getPrototypeOf(ServiceProvider.prototype), "constructor", this).call(this, container, id, resource, options);
  }

  _inherits(ServiceProvider, BasicProvider);

  _prototypeProperties(ServiceProvider, null, {
    get: {

      /**
       * Provides a new instance of the registered resource.
       *
       * @return {Promise}
       * @api public
       */
      value: function get() {
        var _this = this;
        // resolve arguments
        var serviceDepsPromise = util.resolveDependencies(this.container, this.options.args);

        return serviceDepsPromise.then(function (serviceDeps) {
          serviceDeps.unshift(_this.resource);

          var Resource = _this.resource.bind.apply(_this.resource, serviceDeps);

          // bubble a new Promise
          return new Resource();
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return ServiceProvider;
})(BasicProvider);

module.exports = ServiceProvider;