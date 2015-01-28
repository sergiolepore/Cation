/*! Module dependencies */
import ServiceProvider      from './providers/serviceprovider'
import FactoryProvider      from './providers/factoryprovider'
import StaticProvider       from './providers/staticprovider'
// import * as loadingStack    from './helpers/loadingstack'
import * as decoratorUtils  from './helpers/decorator'

/*! Private definitions */

/**
 * Container ID.
 * Each container instance can be identified with this ID.
 *
 * @type {String}
 * @api private
 */
var __containerId__ = Symbol()

/**
 * Provider Repository.
 * An object used to store all registered resources, with their own config and ID.
 *
 * @type {Object}
 * @api private
 */
var __providerRepository__ = Symbol()

/**
 * Instance Cache.
 * An object used to store all singleton instances.
 *
 * @type {Object}
 * @api private
 */
var __instanceCache__ = Symbol()

/**
 * Provider Map.
 * An object used to map the provider names and classes.
 *
 * @type {Object}
 * @api private
 */
var __providerMap__ = Symbol()

/**
 * Decorator Map.
 * An object used to map the decorator names and functions.
 *
 * @type {Object}
 * @api private
 */
var __decoratorMap__ = Symbol()

/*! ========================================================================= */

/**
 * Cation
 */
class Cation
{
  constructor({ id } = {}) {
    this[__containerId__]         = id
    this[__providerRepository__]  = {}
    this[__instanceCache__]       = {}
    this[__providerMap__]         = {}
    this[__decoratorMap__]        = {}

    // loadingStack.init(this)

    this.addProvider('service', ServiceProvider)
    this.addProvider('factory', FactoryProvider)
    this.addProvider('static', StaticProvider)

    this.register('container', this, {
      type: 'static'
    })
  }

  /**
   * Gets the container ID.
   *
   * @return {String}
   * @api public
   */
  getId() {
    return this[__containerId__]
  }

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
  register(id, resource, options={}) {
    if (!id) {
      throw new Error('`id` is required')
    }

    if (!resource) {
      throw new Error('`resource` is required')
    }

    if (this.has(id)) {
      throw new Error(`There's already a resource registered as "${id}"`)
    }

    if (typeof options.type === 'undefined') {
      options.type = 'service'
    }

    if (typeof options.args === 'undefined') {
      options.args = []
    }

    if (typeof options.decorators === 'undefined') {
      options.decorators = []
    }

    if (!this.hasProvider(options.type)) {
      throw new Error(`Unknown type: "${options.type}"`)
    }

    let Provider = this[__providerMap__][options.type]

    this[__providerRepository__][id] = new Provider(this, id, resource, options)
  }

  /**
   * Retrieves a service from the container.
   *
   * @param {String}  id  Resource ID.
   * @return {Promise}
   * @api public
   */
  get(id) {
    return new Promise((resolve, reject) => {
      if (!this.has(id)) {
        return reject(new Error(`"${id}" resource not found`))
      }

      // if (loadingStack.has(this, id)) {
      //   return reject(new Error(`Error loading "${id}". Circular reference detected`))
      // }

      let provider    = this[__providerRepository__][id]
      let isSingleton = provider.options.isSingleton

      if (isSingleton && this.isCached(id)) {
        return resolve(this[__instanceCache__][id])
      }

      // loadingStack.push(this, id)

      provider.get().then(resource => {
        // remove from loading stack. No more circular reference prevention
        // loadingStack.remove(this, id)

        return resource
      }).then(resource => {
        // apply decorators
        let decoratorNames = provider.options.decorators

        if (!decoratorNames.length) {
          return resource
        }

        let decoratorFunctions = decoratorNames.map(name => {
          if (this.hasDecorator(name)) {
            return this[__decoratorMap__][name]
          }
        })

        if (!decoratorFunctions.length) {
          return resource
        }

        return decoratorFunctions.reduce(decoratorUtils.reducer, resource)
      }).then(resource => {
        // store instance in cache if singleton
        if (isSingleton) {
          this[__instanceCache__][id] = resource
        }

        return resource
      }).then(
        resource => resolve(resource)
      ).catch(error => {
        // loadingStack.remove(this, id)

        return reject(error)
      })
    })
  }

  /**
   * Checks if service is registered.
   *
   * @param {String}  id  Resource ID
   * @return {Boolean}
   * @api public
   */
  has(id) {
    if (this[__providerRepository__].hasOwnProperty(id)) {
      return true
    }

    return false
  }

  /**
   * Removes a service from the container.
   *
   * @param {String}  id  Resource ID.
   * @api public
   */
  remove(id) {
    if (!this.has(id)) {
      return
    }

    delete this[__providerRepository__][id]
  }

  /**
   * Registers a resource provider.
   *
   * @param {String}   name             Provider name.
   * @param {Function} providerFunction Provider function.
   * @api public
   */
  addProvider(name, providerFunction) {
    let providerMap = this[__providerMap__]

    if (this.hasProvider(name)) {
      return
    }

    providerMap[name] = providerFunction
  }

  /**
   * Checks if a given provider is registered.
   *
   * @param {String}  name  Provider name.
   * @return {Boolean}
   * @api public
   */
  hasProvider(name) {
    let providerMap = this[__providerMap__]

    return providerMap.hasOwnProperty(name)
  }

  /**
   * Removes a given provider.
   *
   * @param {String}  name  Provider name.
   * @api public
   */
  removeProvider(name) {
    let providerMap = this[__providerMap__]

    if (!this.hasProvider(name)) {
      return
    }

    delete providerMap[name]
  }

  /**
   * Registers a resource decorator.
   *
   * @param {String}   name               Decorator name.
   * @param {Function} decoratorFunction  Decorator function.
   * @api public
   */
  addDecorator(name, decoratorFunction) {
    let decoratorMap = this[__decoratorMap__]

    if (this.hasDecorator(name)) {
      return
    }

    decoratorMap[name] = decoratorFunction
  }

  /**
   * Checks if a given decorator is registered.
   *
   * @param {String}  name  Decorator name.
   * @api public
   */
  hasDecorator(name) {
    let decoratorMap = this[__decoratorMap__]

    return decoratorMap.hasOwnProperty(name)
  }

  /**
   * Removes a given decorator.
   *
   * @param {String}  name  Decorator name.
   * @api public
   */
  removeDecorator(name) {
    let decoratorMap = this[__decoratorMap__]

    if (!this.hasDecorator(name)) {
      return
    }

    delete decoratorMap[name]
  }

  /**
   * Checks if a resource is cached.
   * Only instances from services declared as `singleton` will be stored in cache.
   *
   * @param {String}  id  Resource ID.
   * @return {Boolean}
   * @api public
   */
  isCached(id) {
    let instanceCache = this[__instanceCache__]

    return instanceCache.hasOwnProperty(id)
  }

  /**
   * Removes all singleton instances from cache.
   *
   * @api public
   */
  clearCache() {
    this[__instanceCache__] = {}
  }
}

// And here... we... GO.
export default Cation
