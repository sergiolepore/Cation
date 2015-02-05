/*! Module dependencies */
import BasicProvider       from './providers/basicprovider'
import ServiceProvider     from './providers/serviceprovider'
import FactoryProvider     from './providers/factoryprovider'
import StaticProvider      from './providers/staticprovider'
import * as decoratorUtils from './helpers/decorator'

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
 * Provider Instances Map.
 * "ResourceID/ProviderInstance" Map object for Resource Providers.
 *
 * @type {Map}
 * @api private
 */
var __providerInstancesMap__ = Symbol()

/**
 * Resource Instances Map.
 * "ResourceID/Instance" Map object for Singletons.
 *
 * @type {Map}
 * @api private
 */
var __resourceInstancesMap__ = Symbol()

/**
 * Provider Constructors Map.
 * "Name/Function" Map object for Providers.
 *
 * @type {Map}
 * @api private
 */
var __providerConstructorsMap__ = Symbol()

/**
 * Decorator Functions Map.
 * "Name/Function" Map object for Decorators.
 *
 * @type {Map}
 * @api private
 */
var __decoratorFunctionsMap__ = Symbol()

/*! ========================================================================= */

/**
 * Cation
 */
class Cation
{
  constructor({ id } = {}) {
    this[__containerId__]             = id
    this[__providerInstancesMap__]    = new Map()
    this[__resourceInstancesMap__]    = new Map()
    this[__providerConstructorsMap__] = new Map()
    this[__decoratorFunctionsMap__]   = new Map()

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

    if (typeof options.tags === 'undefined') {
      options.tags = []
    }

    if (!this.hasProvider(options.type)) {
      throw new Error(`Unknown type: "${options.type}"`)
    }

    let Provider = this[__providerConstructorsMap__].get(options.type)

    this[__providerInstancesMap__].set(id, new Provider(this, id, resource, options))
  }

  /**
   * Retrieves a resource from the container.
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

      let provider    = this[__providerInstancesMap__].get(id)
      let isSingleton = provider.options.isSingleton

      if (isSingleton && this.isCached(id)) {
        return resolve(this[__resourceInstancesMap__].get(id))
      }

      provider.get().then(resource => {
        // apply decorators
        let decoratorNames = provider.options.decorators

        if (!decoratorNames.length) {
          return resource
        }

        let decoratorFunctions = decoratorNames.map(name => {
          if (this.hasDecorator(name)) {
            return this[__decoratorFunctionsMap__].get(name)
          }
        })

        if (!decoratorFunctions.length) {
          return resource
        }

        return decoratorFunctions.reduce(decoratorUtils.reducer, resource)
      }).then(resource => {
        // store instance in cache if singleton
        if (isSingleton) {
          this[__resourceInstancesMap__].set(id, resource)
        }

        return resource
      }).then(
        resource => resolve(resource)
      ).catch(
        error => reject(error)
      )
    })
  }

  /**
   * Checks if a resource is registered.
   *
   * @param {String}  id  Resource ID
   * @return {Boolean}
   * @api public
   */
  has(id) {
    if (this[__providerInstancesMap__].has(id)) {
      return true
    }

    return false
  }

  /**
   * Removes a resource from the container.
   *
   * @param {String}  id  Resource ID.
   * @api public
   */
  remove(id) {
    if (!this.has(id)) {
      return
    }

    this[__providerInstancesMap__].delete(id)
  }

  /**
   * Registers a resource provider.
   *
   * @param {String}   name             Provider name.
   * @param {Function} providerFunction Provider function.
   * @api public
   */
  addProvider(name, providerFunction) {
    if (this.hasProvider(name)) {
      return
    }

    let providerConstructorsMap = this[__providerConstructorsMap__]

    providerConstructorsMap.set(name, providerFunction)
  }

  /**
   * Checks if a given provider is registered.
   *
   * @param {String}  name  Provider name.
   * @return {Boolean}
   * @api public
   */
  hasProvider(name) {
    return this[__providerConstructorsMap__].has(name)
  }

  /**
   * Removes a given provider.
   *
   * @param {String}  name  Provider name.
   * @api public
   */
  removeProvider(name) {
    if (!this.hasProvider(name)) {
      return
    }

    let providerConstructorsMap = this[__providerConstructorsMap__]

    providerConstructorsMap.delete(name)
  }

  /**
   * Registers a resource decorator.
   *
   * @param {String}   name               Decorator name.
   * @param {Function} decoratorFunction  Decorator function.
   * @api public
   */
  addDecorator(name, decoratorFunction) {
    if (this.hasDecorator(name)) {
      return
    }

    let decoratorFunctionsMap = this[__decoratorFunctionsMap__]

    decoratorFunctionsMap.set(name, decoratorFunction)
  }

  /**
   * Checks if a given decorator is registered.
   *
   * @param {String}  name  Decorator name.
   * @api public
   */
  hasDecorator(name) {
    return this[__decoratorFunctionsMap__].has(name)
  }

  /**
   * Removes a given decorator.
   *
   * @param {String}  name  Decorator name.
   * @api public
   */
  removeDecorator(name) {
    if (!this.hasDecorator(name)) {
      return
    }

    let decoratorFunctionsMap = this[__decoratorFunctionsMap__]

    decoratorFunctionsMap.delete(name)
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
    return this[__resourceInstancesMap__].has(id)
  }

  /**
   * Removes all singleton instances from cache.
   *
   * @api public
   */
  clearCache() {
    this[__resourceInstancesMap__].clear()
  }

  /**
   * Returns an array of resource IDs for a given tag.
   *
   * @param {String}  tagName  The tag name.
   * @return {Array}
   * @api public
   */
  findTaggedResourceIds(tagName) {
    let providerInstancesMap = this[__providerInstancesMap__]
    let resourceIds          = []

    for (let [resourceId, provider] of providerInstancesMap.entries()) {
      if (provider.options.tags.includes(tagName)) {
        resourceIds.push(resourceId)
      }
    }

    return resourceIds
  }
}

// And here... we... GO.
export default Cation    // import Cation from 'cation'
export { BasicProvider } // import { BasicProvider } from 'cation'
                         // import Cation, { BasicProvider } from 'cation'
