"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*! Module dependencies */
var BasicProvider = _interopRequire(require("./providers/basicprovider"));

var ServiceProvider = _interopRequire(require("./providers/serviceprovider"));

var FactoryProvider = _interopRequire(require("./providers/factoryprovider"));

var StaticProvider = _interopRequire(require("./providers/staticprovider"));

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
 * Provider Instances Map.
 * "ResourceID/ProviderInstance" Map object for Resource Providers.
 *
 * @type {Map}
 * @api private
 */
var __providerInstancesMap__ = Symbol();

/**
 * Resource Instances Map.
 * "ResourceID/Instance" Map object for Singletons.
 *
 * @type {Map}
 * @api private
 */
var __resourceInstancesMap__ = Symbol();

/**
 * Provider Constructors Map.
 * "Name/Function" Map object for Providers.
 *
 * @type {Map}
 * @api private
 */
var __providerConstructorsMap__ = Symbol();

/**
 * Decorator Functions Map.
 * "Name/Function" Map object for Decorators.
 *
 * @type {Map}
 * @api private
 */
var __decoratorFunctionsMap__ = Symbol();

/*! ========================================================================= */

/**
 * Cation
 */
var Cation = (function () {
  function Cation() {
    var _ref = arguments[0] === undefined ? {} : arguments[0];
    var id = _ref.id;
    _classCallCheck(this, Cation);

    this[__containerId__] = id;
    this[__providerInstancesMap__] = new Map();
    this[__resourceInstancesMap__] = new Map();
    this[__providerConstructorsMap__] = new Map();
    this[__decoratorFunctionsMap__] = new Map();

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
       *     - type: (string) resource type (service, factory, static or a custom type).
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

        if (typeof options.tags === "undefined") {
          options.tags = [];
        }

        if (!this.hasProvider(options.type)) {
          throw new Error("Unknown type: \"" + options.type + "\"");
        }

        var Provider = this[__providerConstructorsMap__].get(options.type);

        this[__providerInstancesMap__].set(id, new Provider(this, id, resource, options));
      },
      writable: true,
      configurable: true
    },
    get: {

      /**
       * Retrieves a resource from the container.
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

          var provider = _this[__providerInstancesMap__].get(id);
          var isSingleton = provider.options.singleton;

          if (isSingleton && _this.isCached(id)) {
            return resolve(_this[__resourceInstancesMap__].get(id));
          }

          provider.get().then(function (resource) {
            // apply decorators
            var decoratorNames = provider.options.decorators;

            if (!decoratorNames.length) {
              return resource;
            }

            var decoratorFunctions = decoratorNames.map(function (name) {
              if (_this.hasDecorator(name)) {
                return _this[__decoratorFunctionsMap__].get(name);
              }
            });

            if (!decoratorFunctions.length) {
              return resource;
            }

            return decoratorFunctions.reduce(decoratorUtils.reducer, resource);
          }).then(function (resource) {
            // store instance in cache if singleton
            if (isSingleton) {
              _this[__resourceInstancesMap__].set(id, resource);
            }

            return resource;
          }).then(function (resource) {
            return resolve(resource);
          })["catch"](function (error) {
            return reject(error);
          });
        });
      },
      writable: true,
      configurable: true
    },
    has: {

      /**
       * Checks if a resource is registered.
       *
       * @param {String}  id  Resource ID
       * @return {Boolean}
       * @api public
       */
      value: function has(id) {
        if (this[__providerInstancesMap__].has(id)) {
          return true;
        }

        return false;
      },
      writable: true,
      configurable: true
    },
    remove: {

      /**
       * Removes a resource from the container.
       *
       * @param {String}  id  Resource ID.
       * @api public
       */
      value: function remove(id) {
        if (!this.has(id)) {
          return;
        }

        this[__providerInstancesMap__]["delete"](id);
      },
      writable: true,
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
        if (this.hasProvider(name)) {
          return;
        }

        var providerConstructorsMap = this[__providerConstructorsMap__];

        providerConstructorsMap.set(name, providerFunction);
      },
      writable: true,
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
        return this[__providerConstructorsMap__].has(name);
      },
      writable: true,
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
        if (!this.hasProvider(name)) {
          return;
        }

        var providerConstructorsMap = this[__providerConstructorsMap__];

        providerConstructorsMap["delete"](name);
      },
      writable: true,
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
        if (this.hasDecorator(name)) {
          return;
        }

        var decoratorFunctionsMap = this[__decoratorFunctionsMap__];

        decoratorFunctionsMap.set(name, decoratorFunction);
      },
      writable: true,
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
        return this[__decoratorFunctionsMap__].has(name);
      },
      writable: true,
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
        if (!this.hasDecorator(name)) {
          return;
        }

        var decoratorFunctionsMap = this[__decoratorFunctionsMap__];

        decoratorFunctionsMap["delete"](name);
      },
      writable: true,
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
        return this[__resourceInstancesMap__].has(id);
      },
      writable: true,
      configurable: true
    },
    clearCache: {

      /**
       * Removes all singleton instances from cache.
       *
       * @api public
       */
      value: function clearCache() {
        this[__resourceInstancesMap__].clear();
      },
      writable: true,
      configurable: true
    },
    findTaggedResourceIds: {

      /**
       * Returns an array of resource IDs for a given tag.
       *
       * @param {String}  tagName  The tag name.
       * @return {Array}
       * @api public
       */
      value: function findTaggedResourceIds(tagName) {
        var providerInstancesMap = this[__providerInstancesMap__];
        var resourceIds = [];

        for (var _iterator = providerInstancesMap.entries()[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
          var _step$value = _slicedToArray(_step.value, 2);

          var resourceId = _step$value[0];
          var provider = _step$value[1];
          if (provider.options.tags.includes(tagName)) {
            resourceIds.push(resourceId);
          }
        }

        return resourceIds;
      },
      writable: true,
      configurable: true
    }
  });

  return Cation;
})();

// And here... we... GO.
exports["default"] = Cation;
// import Cation from 'cation'
exports.BasicProvider = BasicProvider;
// import { BasicProvider } from 'cation'
// import Cation, { BasicProvider } from 'cation'
Object.defineProperty(exports, "__esModule", {
  value: true
});