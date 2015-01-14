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
var containerId

/**
 * Provider Bag.
 * An object used to store all registered resources, with their own config and ID.
 *
 * @type {Object}
 * @api private
 */
var providerBag

/**
 * Loading Stack.
 * An array containing the IDs of the resources being currently loaded.
 * Useful to track circular references.
 *
 * @type {Array}
 * @api private
 */
var loadingStack

/**
 * Pushes a resource ID into the loadingStack.
 *
 * @param {String} id Resource ID
 * @api private
 */
var addToLoadingStack = id => {
  loadingStack.push(id)
}

/**
 * Removes a resource ID from the loadingStack.
 *
 * @param {String} id Resource ID
 * @api private
 */
var removeFromLoadingStack = id => {
  if (!isInLoadingStack(id)) {
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
var isInLoadingStack = id => {
  return loadingStack.indexOf(id) !== -1
}

/*! ========================================================================= */

/**
 * Cation.
 */
class Cation
{
  constructor({ id } = {}) {
    containerId  = id
    providerBag  = {}
    loadingStack = []

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
    return containerId
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
    if (!id) {
      throw new Error('`id` is required')
    }

    if (!resource) {
      throw new Error('`resource` is required')
    }

    if (this.has(id)) {
      throw new Error(`There's already a resource registered as "${id}"`)
    }

    providerBag[id] = new Provider(this, resource, args, options)
  }

  /**
   * Retrieves a service from the container.
   *
   * @param {String}  id  Resource ID.
   * @return {Promise}
   * @api public
   */
  get(id) {
    let providerPromise = new Promise((resolve, reject) => {
      if (!this.has(id)) {
        return reject(new Error(`"${id}" resource not found`))
      }

      if (isInLoadingStack(id)) {
        return reject(new Error(`Error loading "${id}". Circular reference detected`))
      }

      addToLoadingStack(id)
      providerBag[id].get(resolve, reject)
    })

    providerPromise.then(providedResource => {
      removeFromLoadingStack(id)

      return providedResource
    }).catch(error => {
      removeFromLoadingStack(id)

      return error
    })

    return providerPromise
  }

  /**
   * Checks if service is registered.
   *
   * @param {String}  id  Resource ID
   * @return {Boolean}
   * @api public
   */
  has(id) {
    if (providerBag.hasOwnProperty(id)) {
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

    delete providerBag[id]
  }

}

// And here... we... GO.
export default Cation
