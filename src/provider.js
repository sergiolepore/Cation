/*! Module dependencies */
// import _ from 'lodash'

/*! Module Variables */

/**
 * Container Instance.
 *
 * @var {Cation}
 * @api private
 */
var __containerInstance__ = Symbol()

/**
 * Resource Object.
 * This is the registered resource. It can be anything.
 *
 * @var {mixed}
 * @api private
 */
var __resourceObject__ = Symbol()

/**
 * Resource Arguments.
 * If the registered resource is a function, these arguments will be
 * applied to it.
 *
 * @var {Array}
 * @api private
 */
var __resourceArguments__ = Symbol()

/**
 * Resource Type.
 * It can be `service`, `factory`, `decorator` or `static`.
 *
 * @type {String}
 * @api private
 */
var __resourceType__ = Symbol()

/**
 * Is Singleton.
 * Singleton behaviour. Only works with function entities.
 *
 * @type {Boolean}
 * @api private
 */
var __isSingleton__ = Symbol()

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
var __decoratorsToApply__ = Symbol()

/**
 * Resource Instance.
 * If `isSingleton`, this variable will store the instance of the resource.
 *
 * @type {mixed}
 * @api private
 */
var __resourceInstance__ = Symbol()

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
  default(resource, args, options) {
    this[__resourceObject__]    = resource
    this[__resourceArguments__] = args
    this[__resourceType__]      = options.type
    this[__isSingleton__]       = options.singleton
    // TODO entitiesToInject  = options.inject
    this[__decoratorsToApply__] = options.decorators
  }
}

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
  service() {
    let resourceInstance = this[__resourceInstance__]
    let isSingleton      = this[__isSingleton__]

    if (isSingleton && typeof resourceInstance !== 'undefined') {
      return Promise.resolve(resourceInstance)
    }

    let applyArgsPromise = applyResourceArguments.apply(this)

    return applyArgsPromise.then(Service => {
      this[__resourceInstance__] = new Service()

      return this[__resourceInstance__]
    })
  },

  /**
   * Factory type Resolver.
   *
   * @param  {Function} resolve   Callback `function(resolvedResource) { ... }`
   * @api private
   */
  factory() {

  },

  /**
   * Decorator type Resolver.
   *
   * @param  {Function} resolve   Callback `function(resolvedResource) { ... }`
   * @api private
   */
  decorator() {

  },

  /**
   * Static type Resolver.
   *
   * @param  {Function} resolve   Callback `function(resolvedResource) { ... }`
   * @api private
   */
  static() {
    let resourceObject = this[__resourceObject__]

    return Promise.resolve(resourceObject)
  }
}

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
var resolveStringParam = function(stringParam) {
  let containerInstance = this[__containerInstance__]
  let actions = {
    '@': function(value) {
      return containerInstance.get(value)
    },

    'default': function(value) {
      return value
    }
  }

  let serviceIdRegex = /^([@|\\\\/(?=@)]?)(.+)$/
  let matches        = serviceIdRegex.exec(stringParam)
  let resolverAction = matches[1]
  let resolverValue  = matches[2]

  if (typeof actions[resolverAction] === 'undefined') {
    return actions['default'](resolverValue)
  }

  return actions[resolverAction](resolverValue)
}

var applyResourceArguments = function() {
  return new Promise((resolve, reject) => {
    let resourceObject    = this[__resourceObject__]
    let resourceArguments = this[__resourceArguments__]
    let resolvedArguments = resourceArguments.map(resolveStringParam.bind(this))

    resolvedArguments.unshift(resourceObject)

    Promise.all(resolvedArguments).then(serviceArgs => {
      let Service = resourceObject.bind.apply(resourceObject, serviceArgs)

      return resolve(Service)
    }).catch(
      error => reject(error)
    )
  })
}

// TODO
// var applyDecorators = () => {
//   return new Promise((resolve, reject) => {
//
//   })
// }

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
const ENTITY_TYPES = ['service', 'factory', 'decorator', 'static']

/*! ========================================================================= */

/**
 * Provider.
 */
class Provider
{
  constructor(container, resource, args, options) {
    if (!container || container.constructor.name !== 'Cation') {
      throw new Error('Invalid container instance')
    }

    this[__containerInstance__] = container

    if (typeof options.type === 'undefined') {
      options.type = 'service'
    }

    if (typeof options.singleton === 'undefined') {
      options.singleton = false
    }

    // TODO
    // if (typeof options.inject === 'undefined') {
    //   options.inject = []
    // }

    if (typeof options.decorators === 'undefined') {
      options.singleton = []
    }

    if (!ENTITY_TYPES.includes(options.type)) {
      throw new Error(`Unknown type: "${options.type}"`)
    }

    let initializer = resourceTypeInitializers.default

    if (resourceTypeInitializers[options.type]) {
      initializer = resourceTypeInitializers[options.type]
    }

    initializer.apply(this, [resource, args, options])
  }

  /**
   * Resolves the Resource and returns the results (instances for Services,
   * execution results for Factories, and so on).
   *
   * @param {Function} resolve   Callback `function(resolvedResource) { ... }`
   * @param {Function} reject    Callback `function(error) { ... }`
   * @api public
   */
  get() {
    return new Promise((resolve, reject) => {
      let resourceType = this[__resourceType__]

      resourceTypeResolvers[resourceType].apply(
        this
      ).then(
        resource => {
          return resolve(resource)
      }).catch(
        error => reject(error)
      )
    })
  }
}

export default Provider // import Provider from 'provider'
export { ENTITY_TYPES } // import { ENTITY_TYPES } from 'provider'
                        // import Provider, { ENTITY_TYPES } from 'provider'
