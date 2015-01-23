/*! Service helper */

/**
 * Resolves all the possible Resource References configured as a Resource arguments.
 *
 *   ['static-value', 1234, '@ThisIsAResourceReference', '@OtherResourceInsideTheContainer']
 *
 * @param {Cation} container            A `Cation` instance.
 * @param {Array}  resourceArguments=[] An array of Resource arguments
 * @api public
 */
export function resolveDependencies(container, resourceArguments=[]) {
  return new Promise((resolve, reject) => {
    if (!resourceArguments.length) {
      return resolve([])
    }

    // an array of Resouce promises (if the argment was a Resource Reference)
    // and static values.
    let resolvedArguments = resourceArguments.map(
      stringArgument => resolveArgument(container, stringArgument)
    )

    // try to resolve all promises in the array
    Promise.all(resolvedArguments).then(
      serviceArgs => resolve(serviceArgs)
    ).catch(
      error => reject(error)
    )
  })
}

/**
 * Resolves a single string argument.
 * If the argument is a Resource Reference (denoted with a prefixed `@`), this
 * function will retrieve the service from the container.
 * Otherwise, it will return the initial value of the string argument.
 *
 * @param {Cation} container      A `Cation` instance.
 * @param {String} stringArgument String argument.
 * @api private
 */
function resolveArgument(container, stringArgument) {
  let actions = {
    '@': function(value) {
      // when stringArgument starts with `@`, it's a Resource Reference.
      return container.get(value)
    },

    'default': function(value) {
      return value
    }
  }

  let serviceIdRegex = /^([@|\\\\/(?=@)]?)(.+)$/
  let matches        = serviceIdRegex.exec(stringArgument)
  let resolverAction = matches[1]
  let resolverValue  = matches[2]

  if (typeof actions[resolverAction] === 'undefined') {
    return actions['default'](resolverValue)
  }

  return actions[resolverAction](resolverValue)
}
