"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _interopRequireWildcard = function (obj) {
  return obj && obj.constructor === Object ? obj : {
    "default": obj
  };
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

/*! Module dependencies */
var ServiceProvider = _interopRequire(require("./providers/serviceprovider"));

var FactoryProvider = _interopRequire(require("./providers/factoryprovider"));

var StaticProvider = _interopRequire(require("./providers/staticprovider"));

var loadingStack = _interopRequireWildcard(require("./helpers/loadingstack"));

var decoratorUtils = _interopRequireWildcard(require("./helpers/decorator"));

/*! Private definitions */

/**
 * Container ID.
 * Each container instance can be identified with this ID.
 *
 * @type {String}
 * @api private
 */
var __containerId__ = Symbol();

/**
 * Provider Repository.
 * An object used to store all registered resources, with their own config and ID.
 *
 * @type {Object}
 * @api private
 */
var __providerRepository__ = Symbol();

/**
 * Instance Cache.
 * An object used to store all singleton instances.
 *
 * @type {Object}
 * @api private
 */
var __instanceCache__ = Symbol();

/**
 * Provider Map.
 * An object used to map the provider names and classes.
 *
 * @type {Object}
 * @api private
 */
var __providerMap__ = Symbol();

/**
 * Decorator Map.
 * An object used to map the decorator names and functions.
 *
 * @type {Object}
 * @api private
 */
var __decoratorMap__ = Symbol();

/*! ========================================================================= */

/**
 * Cation
 */
var Cation = (function () {
  function Cation() {
    var _ref = arguments[0] === undefined ? {} : arguments[0];
    var id = _ref.id;
    this[__containerId__] = id;
    this[__providerRepository__] = {};
    this[__instanceCache__] = {};
    this[__providerMap__] = {};
    this[__decoratorMap__] = {};

    loadingStack.init(this);

    this.addProvider("service", ServiceProvider);
    this.addProvider("factory", FactoryProvider);
    this.addProvider("static", StaticProvider);

    this.register("container", this, {
      type: "static"
    });
  }

  _prototypeProperties(Cation, null, {
    getId: {

      /**
       * Gets the container ID.
       *
       * @return {String}
       * @api public
       */
      value: function getId() {
        return this[__containerId__];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    register: {

      /**
       * Registers a resource on the container.
       *
       * @param {String}  id        Resource ID. Required.
       * @param {mixed}   resource  The resource to be registered. Required.
       * @param {Object}  options   Object with options. Optional.
       *
       *   Options:
       *     - type: (string) resource type (service, factory, stati or a custom type).
       *     - singleton: (boolean) singleton behaviour.
       *     - args: (array) Arguments to be applied to the resource when retrieved (if resource is a function). Optional.
       *     - decorators: (array) ids of already registered decorators. Will be applied in order to the resource, when retrieved.
       *
       * @return {Promise}
       * @api public
       */
      value: function register(id, resource) {
        var options = arguments[2] === undefined ? {} : arguments[2];
        if (!id) {
          throw new Error("`id` is required");
        }

        if (!resource) {
          throw new Error("`resource` is required");
        }

        if (this.has(id)) {
          throw new Error("There's already a resource registered as \"" + id + "\"");
        }

        if (typeof options.type === "undefined") {
          options.type = "service";
        }

        if (typeof options.args === "undefined") {
          options.args = [];
        }

        if (typeof options.decorators === "undefined") {
          options.decorators = [];
        }

        if (!this.hasProvider(options.type)) {
          throw new Error("Unknown type: \"" + options.type + "\"");
        }

        var Provider = this[__providerMap__][options.type];

        this[__providerRepository__][id] = new Provider(this, resource, options);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    get: {

      /**
       * Retrieves a service from the container.
       *
       * @param {String}  id  Resource ID.
       * @return {Promise}
       * @api public
       */
      value: function get(id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
          if (!_this.has(id)) {
            return reject(new Error("\"" + id + "\" resource not found"));
          }

          if (loadingStack.has(_this, id)) {
            return reject(new Error("Error loading \"" + id + "\". Circular reference detected"));
          }

          var provider = _this[__providerRepository__][id];
          var isSingleton = provider.options.isSingleton;

          if (isSingleton && _this.isCached(id)) {
            return resolve(_this[__instanceCache__][id]);
          }

          loadingStack.push(_this, id);

          provider.get().then(function (resource) {
            // remove from loading stack. No more circular reference prevention
            loadingStack.remove(_this, id);

            return resource;
          }).then(function (resource) {
            // apply decorators
            var decoratorNames = provider.options.decorators;

            if (!decoratorNames.length) {
              return resource;
            }

            var decoratorFunctions = decoratorNames.map(function (name) {
              if (_this.hasDecorator(name)) {
                return _this[__decoratorMap__][name];
              }
            });

            if (!decoratorFunctions.length) {
              return resource;
            }

            return decoratorFunctions.reduce(decoratorUtils.reducer, resource);
          }).then(function (resource) {
            // store instance in cache if singleton
            if (isSingleton) {
              _this[__instanceCache__][id] = resource;
            }

            return resource;
          }).then(function (resource) {
            return resolve(resource);
          })["catch"](function (error) {
            loadingStack.remove(_this, id);

            return reject(error);
          });
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    has: {

      /**
       * Checks if service is registered.
       *
       * @param {String}  id  Resource ID
       * @return {Boolean}
       * @api public
       */
      value: function has(id) {
        if (this[__providerRepository__].hasOwnProperty(id)) {
          return true;
        }

        return false;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    remove: {

      /**
       * Removes a service from the container.
       *
       * @param {String}  id  Resource ID.
       * @api public
       */
      value: function remove(id) {
        if (!this.has(id)) {
          return;
        }

        delete this[__providerRepository__][id];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    addProvider: {

      /**
       * Registers a resource provider.
       *
       * @param {String}   name             Provider name.
       * @param {Function} providerFunction Provider function.
       * @api public
       */
      value: function addProvider(name, providerFunction) {
        var providerMap = this[__providerMap__];

        if (this.hasProvider(name)) {
          return;
        }

        providerMap[name] = providerFunction;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    hasProvider: {

      /**
       * Checks if a given provider is registered.
       *
       * @param {String}  name  Provider name.
       * @return {Boolean}
       * @api public
       */
      value: function hasProvider(name) {
        var providerMap = this[__providerMap__];

        return providerMap.hasOwnProperty(name);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeProvider: {

      /**
       * Removes a given provider.
       *
       * @param {String}  name  Provider name.
       * @api public
       */
      value: function removeProvider(name) {
        var providerMap = this[__providerMap__];

        if (!this.hasProvider(name)) {
          return;
        }

        delete providerMap[name];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    addDecorator: {

      /**
       * Registers a resource decorator.
       *
       * @param {String}   name               Decorator name.
       * @param {Function} decoratorFunction  Decorator function.
       * @api public
       */
      value: function addDecorator(name, decoratorFunction) {
        var decoratorMap = this[__decoratorMap__];

        if (this.hasDecorator(name)) {
          return;
        }

        decoratorMap[name] = decoratorFunction;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    hasDecorator: {

      /**
       * Checks if a given decorator is registered.
       *
       * @param {String}  name  Decorator name.
       * @api public
       */
      value: function hasDecorator(name) {
        var decoratorMap = this[__decoratorMap__];

        return decoratorMap.hasOwnProperty(name);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeDecorator: {

      /**
       * Removes a given decorator.
       *
       * @param {String}  name  Decorator name.
       * @api public
       */
      value: function removeDecorator(name) {
        var decoratorMap = this[__decoratorMap__];

        if (!this.hasDecorator(name)) {
          return;
        }

        delete decoratorMap[name];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    isCached: {

      /**
       * Checks if a resource is cached.
       * Only instances from services declared as `singleton` will be stored in cache.
       *
       * @param {String}  id  Resource ID.
       * @return {Boolean}
       * @api public
       */
      value: function isCached(id) {
        var instanceCache = this[__instanceCache__];

        return instanceCache.hasOwnProperty(id);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    clearCache: {

      /**
       * Removes all singleton instances from cache.
       *
       * @api public
       */
      value: function clearCache() {
        this[__instanceCache__] = {};
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Cation;
})();

// And here... we... GO.
module.exports = Cation;