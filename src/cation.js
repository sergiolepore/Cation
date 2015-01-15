/*! Module dependencies */
import Provider from './provider'

/*! Module Variables */

/**
 * Container ID.
 * Each container instance can be identified with this ID.
 *
 * @type {String}
 * @api private
 */
var __containerId__ = Symbol()

/**
 * Provider Bag.
 * An object used to store all registered resources, with their own config and ID.
 *
 * @type {Object}
 * @api private
 */
var __repository__ = Symbol()

/**
 * Loading Stack.
 * An array containing the IDs of the resources being currently loaded.
 * Useful to track circular references.
 *
 * @type {Array}
 * @api private
 */
var __loadingStack__ = Symbol()

/**
 * Pushes a resource ID into the loadingStack.
 *
 * @param {String} id Resource ID
 * @api private
 */
var addToLoadingStack = function(container, id) {
  let loadingStack = container[__loadingStack__]

  loadingStack.push(id)
}

/**
 * Removes a resource ID from the loadingStack.
 *
 * @param {String} id Resource ID
 * @api private
 */
var removeFromLoadingStack = function(container, id) {
  let loadingStack = container[__loadingStack__]

  if (!isInLoadingStack(container, id)) {
    return
  }


  loadingStack.splice(loadingStack.indexOf(id), 1)
}

/**
 * Checks if a given resource ID is in the loadingStack.
 *
 * @param {String} id Resource ID
 * @api private
 */
var isInLoadingStack = function(container, id) {
  let loadingStack = container[__loadingStack__]

  return loadingStack.indexOf(id) !== -1
}

/*! ========================================================================= */

/**
 * Cation.
 */
class Cation
{
  constructor({ id } = {}) {
    this[__containerId__]  = id
    this[__repository__]   = {}
    this[__loadingStack__] = []

    this.register('container', this, null, {
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
  register(id, resource, args=[], options={}) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject(new Error('`id` is required'))
      }

      if (!resource) {
        return reject(new Error('`resource` is required'))
      }

      if (this.has(id)) {
        return reject(new Error(`There's already a resource registered as "${id}"`))
      }

      this[__repository__][id] = new Provider(this, resource, args, options)

      return resolve()
    })
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

      if (isInLoadingStack(this, id)) {
        return reject(new Error(`Error loading "${id}". Circular reference detected`))
      }

      let resourceProvider = this[__repository__][id]
      addToLoadingStack(this, id)

      resourceProvider.get().then(resource => {
        removeFromLoadingStack(this, id)

        return resolve(resource)
      }).catch(error => {
        removeFromLoadingStack(this, id)

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
    if (this[__repository__].hasOwnProperty(id)) {
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

    delete this[__repository__][id]
  }

}

// And here... we... GO.
export default Cation
