/*! Module dependencies */
import BasicProvider          from './providers/basicprovider'
import ServiceProvider        from './providers/serviceprovider'
import FactoryProvider        from './providers/factoryprovider'
import StaticProvider         from './providers/staticprovider'
import * as decoratorUtils    from './helpers/decorator'
import * as subcontainerUtils from './helpers/subcontainer'
import ResourceNotFoundError  from './errors/resourcenotfounderror'

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

/**
 * SubContainers Map.
 * "Namespace/Cation Instance" Map object for SubContainers.
 *
 * @type {Map}
 * @api private
 */
var __subContainainersMap__ = Symbol()

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
    this[__subContainainersMap__]     = new Map()

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

    let { subcontainerNamespace, subcontainerResourceId } = subcontainerUtils.extractNamespace(id)

    if (subcontainerNamespace) {
      let subcontainer = this.getSubcontainer(subcontainerNamespace) || this.createSubcontainer(subcontainerNamespace)

      return subcontainer.register(subcontainerResourceId, resource, options)
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
    // "foo:bar" => { "foo", "bar" }
    let { subcontainerNamespace, subcontainerResourceId } = subcontainerUtils.extractNamespace(id)

    // check if "foo" subcontainer for "foo:bar" exists.
    // if so, try to retrieve "bar" from it.
    if (this.hasSubcontainer(subcontainerNamespace)) {
      // immediately return the subcontainer#get promise
      return this
        .getSubcontainer(subcontainerNamespace)
        .get(subcontainerResourceId)
        .catch(error => {
          // when the error is thrown in a subcontainer resource,
          // ensure the full resourceId is returned.
          // Bad: container.get('foo:bar') -> `"bar" resource not found`
          // Expected: container.get('foo:bar') -> `"foo:bar" resource not found`
          if (error.constructor.name === 'ResourceNotFoundError') {
            let fullResourceId = `${subcontainerNamespace}:${subcontainerResourceId}`

            error = new ResourceNotFoundError(`"${fullResourceId}" resource not found`)
          }

          // error bubbling
          return Promise.reject(error)
        })
    }

    // no subcontainer matches, proceed with the current one...
    return new Promise((resolve, reject) => {
      if (!this.has(id)) {
        return reject(new ResourceNotFoundError(`"${id}" resource not found`))
      }

      let provider    = this[__providerInstancesMap__].get(id)
      let isSingleton = provider.options.singleton

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
      })
      .then(resolve)
      .catch(reject)
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
    let { subcontainerNamespace, subcontainerResourceId } = subcontainerUtils.extractNamespace(id)

    if (this.hasSubcontainer(subcontainerNamespace)) {
      return this.getSubcontainer(subcontainerNamespace).has(subcontainerResourceId)
    }

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
    let { subcontainerNamespace, subcontainerResourceId } = subcontainerUtils.extractNamespace(id)

    if (this.hasSubcontainer(subcontainerNamespace)) {
      return this.getSubcontainer(subcontainerNamespace).remove(subcontainerResourceId)
    }

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

    this[__providerConstructorsMap__].set(name, providerFunction)
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

    this[__providerConstructorsMap__].delete(name)
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

    this[__decoratorFunctionsMap__].set(name, decoratorFunction)
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

    this[__decoratorFunctionsMap__].delete(name)
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
    let { subcontainerNamespace, subcontainerResourceId } = subcontainerUtils.extractNamespace(id)

    if (this.hasSubcontainer(subcontainerNamespace)) {
      return this.getSubcontainer(subcontainerNamespace).isCached(subcontainerResourceId)
    }

    return this[__resourceInstancesMap__].has(id)
  }

  /**
   * Removes all singleton instances from cache.
   *
   * @api public
   */
  clearCache() {
    let subcontainersMap = this[__subContainainersMap__]

    this[__resourceInstancesMap__].clear()

    subcontainersMap.forEach(subcontainer => {
      subcontainer.clearCache()
    })
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
    let subcontainersMap     = this[__subContainainersMap__]
    let resourceIds          = []

    providerInstancesMap.forEach((provider, resourceId) => {
      if (provider.options.tags.includes(tagName)) {
        resourceIds.push(resourceId)
      }
    })

    subcontainersMap.forEach(subcontainer => {
      let subcontainerIds = subcontainer
        .findTaggedResourceIds(tagName)
        .map(resourceId => `${subcontainer.getId()}:${resourceId}`)

      resourceIds = resourceIds.concat(subcontainerIds)
    })

    return resourceIds
  }

  /**
   * Create a new container inside the current one.
   *
   * @param {String}  subcontainerId  The subcontainer ID. Required.
   * @return {Cation}  A new Cation instance.
   * @api public
   */
  createSubcontainer(subcontainerId) {
    let subcontainer = new Cation({ id: subcontainerId })

    this.attachSubcontainer(subcontainer)

    return subcontainer
  }

  /**
   * Registers a new container inside the current one.
   *
   * @param {Cation}  container  A Cation instance
   * @api public
   */
  attachSubcontainer(container) {
    let subcontainerId = container.getId()

    if (!subcontainerId) {
      throw new Error('The subcontainer must have an ID.')
    }

    if (this.hasSubcontainer(subcontainerId)) {
      throw new Error(`There's already a subcontainer with ID "${subcontainerId}"`)
    }

    this[__subContainainersMap__].set(subcontainerId, container)
  }

  /**
   * Checks if a given subcontainer is registered inside the current one.
   *
   * @param {String}  subcontainerId  Subcontainer ID.
   * @return {Boolean}
   * @api public
   */
  hasSubcontainer(subcontainerId) {
    return this[__subContainainersMap__].has(subcontainerId)
  }

  /**
   * Returns a subcontainer.
   *
   * @param {String}  subcontainerId  Subcontainer ID.
   * @return {Cation}
   * @api public
   */
  getSubcontainer(subcontainerId) {
    return this[__subContainainersMap__].get(subcontainerId)
  }

  /**
   * Removes a subcontainer.
   *
   * @param {String}  subcontainerId  Subcontainer ID.
   * @api public
   */
  detachSubcontainer(subcontainerId) {
    if (!this.hasSubcontainer(subcontainerId)) {
      return
    }

    this[__subContainainersMap__].delete(subcontainerId)
  }

  /**
   * Removes all subcontainers.
   *
   * @api public
   */
  detachAllSubcontainers() {
    this[__subContainainersMap__].clear()
  }
}

// And here... we... GO.
export default Cation
export { BasicProvider, ResourceNotFoundError }
