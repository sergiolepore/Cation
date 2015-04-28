'use strict';

var _interopRequireWildcard = function (obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (typeof obj === 'object' && obj !== null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } };

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
/*! Module dependencies */

var _BasicProvider = require('./providers/basicprovider');

var _BasicProvider2 = _interopRequireDefault(_BasicProvider);

var _ServiceProvider = require('./providers/serviceprovider');

var _ServiceProvider2 = _interopRequireDefault(_ServiceProvider);

var _FactoryProvider = require('./providers/factoryprovider');

var _FactoryProvider2 = _interopRequireDefault(_FactoryProvider);

var _StaticProvider = require('./providers/staticprovider');

var _StaticProvider2 = _interopRequireDefault(_StaticProvider);

var _import = require('./helpers/decorator');

var decoratorUtils = _interopRequireWildcard(_import);

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

    this.addProvider('service', _ServiceProvider2['default']);
    this.addProvider('factory', _FactoryProvider2['default']);
    this.addProvider('static', _StaticProvider2['default']);

    this.register('container', this, {
      type: 'static'
    });
  }

  _createClass(Cation, [{
    key: 'getId',

    /**
     * Gets the container ID.
     *
     * @return {String}
     * @api public
     */
    value: function getId() {
      return this[__containerId__];
    }
  }, {
    key: 'register',

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
        throw new Error('`id` is required');
      }

      if (!resource) {
        throw new Error('`resource` is required');
      }

      if (this.has(id)) {
        throw new Error('There\'s already a resource registered as "' + id + '"');
      }

      if (typeof options.type === 'undefined') {
        options.type = 'service';
      }

      if (typeof options.args === 'undefined') {
        options.args = [];
      }

      if (typeof options.decorators === 'undefined') {
        options.decorators = [];
      }

      if (typeof options.tags === 'undefined') {
        options.tags = [];
      }

      if (!this.hasProvider(options.type)) {
        throw new Error('Unknown type: "' + options.type + '"');
      }

      var Provider = this[__providerConstructorsMap__].get(options.type);

      this[__providerInstancesMap__].set(id, new Provider(this, id, resource, options));
    }
  }, {
    key: 'get',

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
          return reject(new Error('"' + id + '" resource not found'));
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
        })['catch'](function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: 'has',

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
    }
  }, {
    key: 'remove',

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

      this[__providerInstancesMap__]['delete'](id);
    }
  }, {
    key: 'addProvider',

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
    }
  }, {
    key: 'hasProvider',

    /**
     * Checks if a given provider is registered.
     *
     * @param {String}  name  Provider name.
     * @return {Boolean}
     * @api public
     */
    value: function hasProvider(name) {
      return this[__providerConstructorsMap__].has(name);
    }
  }, {
    key: 'removeProvider',

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

      providerConstructorsMap['delete'](name);
    }
  }, {
    key: 'addDecorator',

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
    }
  }, {
    key: 'hasDecorator',

    /**
     * Checks if a given decorator is registered.
     *
     * @param {String}  name  Decorator name.
     * @api public
     */
    value: function hasDecorator(name) {
      return this[__decoratorFunctionsMap__].has(name);
    }
  }, {
    key: 'removeDecorator',

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

      decoratorFunctionsMap['delete'](name);
    }
  }, {
    key: 'isCached',

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
    }
  }, {
    key: 'clearCache',

    /**
     * Removes all singleton instances from cache.
     *
     * @api public
     */
    value: function clearCache() {
      this[__resourceInstancesMap__].clear();
    }
  }, {
    key: 'findTaggedResourceIds',

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

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = providerInstancesMap.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2);

          var resourceId = _step$value[0];
          var provider = _step$value[1];

          if (provider.options.tags.includes(tagName)) {
            resourceIds.push(resourceId);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return resourceIds;
    }
  }]);

  return Cation;
})();

// And here... we... GO.
exports['default'] = Cation;
// import Cation from 'cation'
exports.BasicProvider = _BasicProvider2['default'];
// import { BasicProvider } from 'cation'
// import Cation, { BasicProvider } from 'cation'