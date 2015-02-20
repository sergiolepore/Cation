"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*! Module dependencies */
var BasicProvider = _interopRequire(require("./providers/basicprovider"));

var ServiceProvider = _interopRequire(require("./providers/serviceprovider"));

var FactoryProvider = _interopRequire(require("./providers/factoryprovider"));

var StaticProvider = _interopRequire(require("./providers/staticprovider"));

var decoratorUtils = _interopRequireWildcard(require("./helpers/decorator"));

var subcontainerUtils = _interopRequireWildcard(require("./helpers/subcontainer"));

var ResourceNotFoundError = _interopRequire(require("./errors/resourcenotfounderror"));

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

/**
 * SubContainers Map.
 * "Namespace/Cation Instance" Map object for SubContainers.
 *
 * @type {Map}
 * @api private
 */
var __subContainainersMap__ = Symbol();

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
    this[__subContainainersMap__] = new Map();

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

        var _subcontainerUtils$extractNamespace = subcontainerUtils.extractNamespace(id);

        var subcontainerNamespace = _subcontainerUtils$extractNamespace.subcontainerNamespace;
        var subcontainerResourceId = _subcontainerUtils$extractNamespace.subcontainerResourceId;


        if (subcontainerNamespace) {
          var subcontainer = this.getSubcontainer(subcontainerNamespace) || this.createSubcontainer(subcontainerNamespace);

          return subcontainer.register(subcontainerResourceId, resource, options);
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
        // "foo:bar" => { "foo", "bar" }
        var _subcontainerUtils$extractNamespace = subcontainerUtils.extractNamespace(id);

        var subcontainerNamespace = _subcontainerUtils$extractNamespace.subcontainerNamespace;
        var subcontainerResourceId = _subcontainerUtils$extractNamespace.subcontainerResourceId;


        // check if "foo" subcontainer for "foo:bar" exists.
        // if so, try to retrieve "bar" from it.
        if (this.hasSubcontainer(subcontainerNamespace)) {
          // immediately return the subcontainer#get promise
          return this.getSubcontainer(subcontainerNamespace).get(subcontainerResourceId)["catch"](function (error) {
            // when the error is thrown in a subcontainer resource,
            // ensure the full resourceId is returned.
            // Bad: container.get('foo:bar') -> `"bar" resource not found`
            // Expected: container.get('foo:bar') -> `"foo:bar" resource not found`
            if (error.constructor.name === "ResourceNotFoundError") {
              var fullResourceId = "" + subcontainerNamespace + ":" + subcontainerResourceId;

              error = new ResourceNotFoundError("\"" + fullResourceId + "\" resource not found");
            }

            // error bubbling
            return Promise.reject(error);
          });
        }

        // no subcontainer matches, proceed with the current one...
        return new Promise(function (resolve, reject) {
          if (!_this.has(id)) {
            return reject(new ResourceNotFoundError("\"" + id + "\" resource not found"));
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
          }).then(resolve)["catch"](reject);
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
        var _subcontainerUtils$extractNamespace = subcontainerUtils.extractNamespace(id);

        var subcontainerNamespace = _subcontainerUtils$extractNamespace.subcontainerNamespace;
        var subcontainerResourceId = _subcontainerUtils$extractNamespace.subcontainerResourceId;


        if (this.hasSubcontainer(subcontainerNamespace)) {
          return this.getSubcontainer(subcontainerNamespace).has(subcontainerResourceId);
        }

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
        var _subcontainerUtils$extractNamespace = subcontainerUtils.extractNamespace(id);

        var subcontainerNamespace = _subcontainerUtils$extractNamespace.subcontainerNamespace;
        var subcontainerResourceId = _subcontainerUtils$extractNamespace.subcontainerResourceId;


        if (this.hasSubcontainer(subcontainerNamespace)) {
          return this.getSubcontainer(subcontainerNamespace).remove(subcontainerResourceId);
        }

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

        this[__providerConstructorsMap__].set(name, providerFunction);
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

        this[__providerConstructorsMap__]["delete"](name);
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

        this[__decoratorFunctionsMap__].set(name, decoratorFunction);
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

        this[__decoratorFunctionsMap__]["delete"](name);
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
        var _subcontainerUtils$extractNamespace = subcontainerUtils.extractNamespace(id);

        var subcontainerNamespace = _subcontainerUtils$extractNamespace.subcontainerNamespace;
        var subcontainerResourceId = _subcontainerUtils$extractNamespace.subcontainerResourceId;


        if (this.hasSubcontainer(subcontainerNamespace)) {
          return this.getSubcontainer(subcontainerNamespace).isCached(subcontainerResourceId);
        }

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
        var subcontainersMap = this[__subContainainersMap__];

        this[__resourceInstancesMap__].clear();

        subcontainersMap.forEach(function (subcontainer) {
          subcontainer.clearCache();
        });
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
        var subcontainersMap = this[__subContainainersMap__];
        var resourceIds = [];

        providerInstancesMap.forEach(function (provider, resourceId) {
          if (provider.options.tags.includes(tagName)) {
            resourceIds.push(resourceId);
          }
        });

        subcontainersMap.forEach(function (subcontainer) {
          var subcontainerIds = subcontainer.findTaggedResourceIds(tagName).map(function (resourceId) {
            return "" + subcontainer.getId() + ":" + resourceId;
          });

          resourceIds = resourceIds.concat(subcontainerIds);
        });

        return resourceIds;
      },
      writable: true,
      configurable: true
    },
    createSubcontainer: {

      /**
       * Create a new container inside the current one.
       *
       * @param {String}  subcontainerId  The subcontainer ID. Required.
       * @return {Cation}  A new Cation instance.
       * @api public
       */
      value: function createSubcontainer(subcontainerId) {
        var subcontainer = new Cation({ id: subcontainerId });

        this.attachSubcontainer(subcontainer);

        return subcontainer;
      },
      writable: true,
      configurable: true
    },
    attachSubcontainer: {

      /**
       * Registers a new container inside the current one.
       *
       * @param {Cation}  container  A Cation instance
       * @api public
       */
      value: function attachSubcontainer(container) {
        var subcontainerId = container.getId();

        if (!subcontainerId) {
          throw new Error("The subcontainer must have an ID.");
        }

        if (this.hasSubcontainer(subcontainerId)) {
          throw new Error("There's already a subcontainer with ID \"" + subcontainerId + "\"");
        }

        this[__subContainainersMap__].set(subcontainerId, container);
      },
      writable: true,
      configurable: true
    },
    hasSubcontainer: {

      /**
       * Checks if a given subcontainer is registered inside the current one.
       *
       * @param {String}  subcontainerId  Subcontainer ID.
       * @return {Boolean}
       * @api public
       */
      value: function hasSubcontainer(subcontainerId) {
        return this[__subContainainersMap__].has(subcontainerId);
      },
      writable: true,
      configurable: true
    },
    getSubcontainer: {

      /**
       * Returns a subcontainer.
       *
       * @param {String}  subcontainerId  Subcontainer ID.
       * @return {Cation}
       * @api public
       */
      value: function getSubcontainer(subcontainerId) {
        return this[__subContainainersMap__].get(subcontainerId);
      },
      writable: true,
      configurable: true
    },
    detachSubcontainer: {

      /**
       * Removes a subcontainer.
       *
       * @param {String}  subcontainerId  Subcontainer ID.
       * @api public
       */
      value: function detachSubcontainer(subcontainerId) {
        if (!this.hasSubcontainer(subcontainerId)) {
          return;
        }

        this[__subContainainersMap__]["delete"](subcontainerId);
      },
      writable: true,
      configurable: true
    },
    detachAllSubcontainers: {

      /**
       * Removes all subcontainers.
       *
       * @api public
       */
      value: function detachAllSubcontainers() {
        this[__subContainainersMap__].clear();
      },
      writable: true,
      configurable: true
    }
  });

  return Cation;
})();

// And here... we... GO.
exports["default"] = Cation;
exports.BasicProvider = BasicProvider;
exports.ResourceNotFoundError = ResourceNotFoundError;
Object.defineProperty(exports, "__esModule", {
  value: true
});