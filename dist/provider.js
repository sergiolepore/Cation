"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _extends = function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      target[key] = source[key];
    }
  }

  return target;
};

/*! Module dependencies */
// import _ from 'lodash'

/*! Module Variables */

/**
 * Container Instance.
 *
 * @var {Cation}
 * @api private
 */
var containerInstance;

/**
 * Resource Object.
 * This is the registered resource. It can be anything.
 *
 * @var {mixed}
 * @api private
 */
var resourceObject;

/**
 * Resource Arguments.
 * If the registered resource is a function, these arguments will be
 * applied to it.
 *
 * @var {Array}
 * @api private
 */
var resourceArguments;

/**
 * Resource Type.
 * It can be `service`, `factory`, `decorator` or `static`.
 *
 * @type {String}
 * @api private
 */
var resourceType;

/**
 * Is Singleton.
 * Singleton behaviour. Only works with function entities.
 *
 * @type {Boolean}
 * @api private
 */
var isSingleton;

/**
 * TODO
 * Entities To Inject.
 * An array containing resource ids, whose references will be injected on the
 * resource context. Only works with function entities.
 *
 * @type {Array}
 * @api private
 */
// var entitiesToInject

/**
 * Decorators To Apply.
 * An array containing decorator ids (a type of resource), that will be applied
 * to the resource when retrieved.
 *
 * @type {Array}
 * @api private
 */
var decoratorsToApply;

/**
 * Resource Instance.
 * If `isSingleton`, this variable will store the instance of the resource.
 *
 * @type {mixed}
 * @api private
 */
var resourceInstance;

/**
 * Functions that initialize the Provider, depending on the resource type.
 *
 * @type {Object}
 * @api private
 */
var resourceTypeInitializers = {

  /**
   * Default initializer. It just assigns the resource data to the Provider
   * variables.
   *
   * @param  {mixed}  resource The resource object
   * @param  {Array}  args     Resource arguments
   * @param  {Object} options  Resource options
   * @api private
   */
  "default": function _default(resource, args, options) {
    resourceObject = resource;
    resourceArguments = args;
    resourceType = options.type;
    isSingleton = options.singleton;
    // TODO entitiesToInject  = options.inject
    decoratorsToApply = options.decorators;
  }
};

/**
 * Functions that resolves the Provider and returns the digested resource,
 * depending on the resource type.
 *
 * Types:
 *   - service: returns `new Resource(args)` (function instance)
 *   - factory: returns `resource(args)` (function() returned data)
 *   - decorator: returns `resource` (function)
 *   - static: returns `resource` (any type)
 *
 * @type {Object}
 * @api private
 */
var resourceTypeResolvers = {

  /**
   * Service type Resolver.
   *
   * @param  {Function} resolve   Callback `function(resolvedResource) { ... }`
   * @api private
   */
  service: function service(resolve, reject) {
    if (isSingleton && typeof resourceInstance !== "undefined") {
      return resolve(resourceInstance);
    }

    applyArguments().then(function (Service) {
      resourceInstance = new Service();

      return resolve(resourceInstance);
    })["catch"](function (reason) {
      return reject(reason);
    });
  },

  /**
   * Factory type Resolver.
   *
   * @param  {Function} resolve   Callback `function(resolvedResource) { ... }`
   * @api private
   */
  factory: function factory(resolve) {},

  /**
   * Decorator type Resolver.
   *
   * @param  {Function} resolve   Callback `function(resolvedResource) { ... }`
   * @api private
   */
  decorator: function decorator(resolve) {
    resolve(resourceObject);
  },

  /**
   * Static type Resolver.
   *
   * @param  {Function} resolve   Callback `function(resolvedResource) { ... }`
   * @api private
   */
  "static": function _static(resolve) {
    resolve(resourceObject);
  }
};

/**
 * Identifies if a given string is a Resource ID or not.
 * It searches for `@Resource` string, which will be resolved as a dependency to
 * `Resource`. If the string has the `@` escaped, it will not be resolved.
 *
 *   - "@ServiceDemo" => "ServiceDemo" dependency parameter
 *   - "\\@ServiceDemo" => "@ServiceDemo" string parameter
 *
 * @param {String} stringParam String to be processed
 * @api private
 */
var resolveStringParam = function (stringParam) {
  var actions = {
    "@": function (value) {
      return containerInstance.get(value);
    },

    "default": function (value) {
      return value;
    }
  };

  var serviceIdRegex = /^([@|\\\\/(?=@)]?)(.+)$/;
  var matches = serviceIdRegex.exec(stringParam);
  var resolverAction = matches[1];
  var resolverValue = matches[2];

  if (typeof actions[resolverAction] === "undefined") {
    return actions["default"](resolverValue);
  }

  return actions[resolverAction](resolverValue);
};

var applyArguments = function () {
  return new Promise(function (resolve, reject) {
    console.log(resourceArguments);
    var resolvedArguments = resourceArguments.map(resolveStringParam);
    resolvedArguments.unshift(resourceObject);

    Promise.all(resolvedArguments).then(function (serviceArgs) {
      var Service = resourceObject.bind.apply(resourceObject, serviceArgs);

      resolve(Service);
    })["catch"](function (reason) {
      reject(reason);
    });
  });
};

var applyDecorators = function () {
  return new Promise(function (resolve, reject) {});
};

// TODO
// var injectDependencies = () => {
//   return new Promise((resolve, reject) => {
//
//   })
// }

/*! Module constants */

/**
* Resource Types.
* An array containing all available resource types.
*
* @type {Array}
* @api private
*/
var ENTITY_TYPES = ["service", "factory", "decorator", "static"];

/*! ========================================================================= */

/**
 * Provider.
 */
var Provider = (function () {
  function Provider(container, resource, args, options) {
    if (!container || container.constructor.name !== "Cation") {
      throw new Error("Invalid container instance");
    }

    containerInstance = container;

    if (typeof options.type === "undefined") {
      options.type = "service";
    }

    if (typeof options.singleton === "undefined") {
      options.singleton = false;
    }

    // TODO
    // if (typeof options.inject === 'undefined') {
    //   options.inject = []
    // }

    if (typeof options.decorators === "undefined") {
      options.singleton = [];
    }

    if (!ENTITY_TYPES.includes(options.type)) {
      throw new Error("Unknown type: \"" + options.type + "\"");
    }

    var initializer = resourceTypeInitializers["default"];

    if (resourceTypeInitializers[options.type]) {
      initializer = resourceTypeInitializers[options.type];
    }

    initializer.apply(resourceTypeInitializers, [resource, args, options]);
  }

  _prototypeProperties(Provider, null, {
    get: {

      /**
       * Resolves the Resource and returns the results (instances for Services,
       * execution results for Factories, and so on).
       *
       * @param {Function} resolve   Callback `function(resolvedResource) { ... }`
       * @param {Function} reject    Callback `function(error) { ... }`
       * @api public
       */
      value: function (resolve, reject) {
        resourceTypeResolvers[resourceType].apply(this, [resolve, reject]);
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Provider;
})();

exports["default"] = Provider;
// import Provider from 'provider'
exports.ENTITY_TYPES = ENTITY_TYPES;
// import { ENTITY_TYPES } from 'provider'
// import Provider, { ENTITY_TYPES } from 'provider'
module.exports = _extends(exports["default"], exports);