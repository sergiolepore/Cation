"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

/*! Module dependencies */
var Provider = _interopRequire(require("./provider"));

/*! Module Variables */

/**
 * Container ID.
 * Each container instance can be identified with this ID.
 *
 * @type {String}
 * @api private
 */
var containerId;

/**
 * Provider Bag.
 * An object used to store all registered resources, with their own config and ID.
 *
 * @type {Object}
 * @api private
 */
var providerBag;

/**
 * Loading Stack.
 * An array containing the IDs of the resources being currently loaded.
 * Useful to track circular references.
 *
 * @type {Array}
 * @api private
 */
var loadingStack;

/**
 * Pushes a resource ID into the loadingStack.
 *
 * @param {String} id Resource ID
 * @api private
 */
var addToLoadingStack = function (id) {
  loadingStack.push(id);
};

/**
 * Removes a resource ID from the loadingStack.
 *
 * @param {String} id Resource ID
 * @api private
 */
var removeFromLoadingStack = function (id) {
  if (!isInLoadingStack(id)) {
    return;
  }

  loadingStack.splice(loadingStack.indexOf(id), 1);
};

/**
 * Checks if a given resource ID is in the loadingStack.
 *
 * @param {String} id Resource ID
 * @api private
 */
var isInLoadingStack = function (id) {
  return loadingStack.indexOf(id) !== -1;
};

/*! ========================================================================= */

/**
 * Cation.
 */
var Cation = (function () {
  function Cation() {
    var _ref = arguments[0] === undefined ? {} : arguments[0];
    var id = _ref.id;
    containerId = id;
    providerBag = {};
    loadingStack = [];

    this.register("container", this, null, {
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
      value: function () {
        return containerId;
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
       * @param {Array}   args      Arguments to be applied to the resource when retrieved (if resource is a function). Optional.
       * @param {Object}  options   Object with options. Optional.
       *
       *   Options:
       *     - type: (string) resource type (service, factory, decorator, static).
       *     - singleton: (boolean) singleton behaviour.
       *     - inject: (array) ids of already registered resources, to be injected on the resource context.
       *     - decorators: (array) ids of already registered decorators. Will be applied in order to the resource, when retrieved.
       *
       * @api public
       */
      value: function (id, resource) {
        var args = arguments[2] === undefined ? [] : arguments[2];
        var options = arguments[3] === undefined ? {} : arguments[3];
        if (!id) {
          throw new Error("`id` is required");
        }

        if (!resource) {
          throw new Error("`resource` is required");
        }

        if (this.has(id)) {
          throw new Error("There's already a resource registered as \"" + id + "\"");
        }

        providerBag[id] = new Provider(this, resource, args, options);
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
      value: function (id) {
        var _this = this;
        var providerPromise = new Promise(function (resolve, reject) {
          if (!_this.has(id)) {
            return reject(new Error("\"" + id + "\" resource not found"));
          }

          if (isInLoadingStack(id)) {
            return reject(new Error("Error loading \"" + id + "\". Circular reference detected"));
          }

          addToLoadingStack(id);
          providerBag[id].get(resolve, reject);
        });

        providerPromise.then(function (providedResource) {
          removeFromLoadingStack(id);

          return providedResource;
        })["catch"](function (error) {
          removeFromLoadingStack(id);

          return error;
        });

        return providerPromise;
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
      value: function (id) {
        if (providerBag.hasOwnProperty(id)) {
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
      value: function (id) {
        if (!this.has(id)) {
          return;
        }

        delete providerBag[id];
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